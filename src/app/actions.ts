
'use server';

import { generateMonthlySummary } from '@/ai/flows/monthly-summary-ai-urgency';
import type { MonthlySummaryOutput } from '@/ai/flows/monthly-summary-ai-urgency';
import type { ProcessedDeadline } from '@/lib/types';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { checkDeadlinesAndNotify } from '@/ai/flows/notification-hammer';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import Stripe from 'stripe';

type SerializableProcessedDeadline = Omit<ProcessedDeadline, 'category'> & {
  category: string;
};

export async function getAiSummary(
  deadlines: SerializableProcessedDeadline[]
): Promise<MonthlySummaryOutput> {
  const now = new Date();
  const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const nextMonthInterval = {
    start: startOfMonth(addMonths(now, 1)),
    end: endOfMonth(addMonths(now, 1)),
  };

  const formatForAI = (d: SerializableProcessedDeadline) => ({
    name: d.name,
    category: d.category,
    dueDate: new Date(d.expirationDate).toISOString().split('T')[0],
  });

  const currentMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(new Date(d.expirationDate), currentMonthInterval))
    .map(formatForAI);

  const nextMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(new Date(d.expirationDate), nextMonthInterval))
    .map(formatForAI);

  const overdueDeadlines = deadlines
    .filter((d) => d.urgency === 'scaduto')
    .map(formatForAI);

  try {
    const result = await generateMonthlySummary({
      userId: 'user-123', // dummy user ID
      currentMonthDeadlines: JSON.stringify(currentMonthDeadlines),
      nextMonthDeadlines: JSON.stringify(nextMonthDeadlines),
      overdueDeadlines: JSON.stringify(overdueDeadlines),
    });
    return result;
  } catch (error) {
    console.error('La generazione del riepilogo AI è fallita:', error);
    return {
      summary: 'Impossibile generare il riepilogo AI. Controlla i log.',
    };
  }
}

export async function runCheckDeadlinesAndNotify() {
  try {
    console.log("Invocazione manuale di checkDeadlinesAndNotify...");
    const result = await checkDeadlinesAndNotify();
    console.log("Esecuzione completata:", result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Errore durante l'esecuzione manuale del controllo scadenze:", error);
    return { success: false, error: error.message || 'Errore sconosciuto' };
  }
}


// Admin SDK Init
function initializeAdminApp(): App {
    const adminAppName = 'firebase-admin-stripe';
    const existingApp = getApps().find((app) => app.name === adminAppName);
    if (existingApp) {
      return existingApp;
    }
    
    return initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-1765347057-3bb5c',
    }, adminAppName);
}

export async function createStripeCheckoutSession(
  userId: string | null
): Promise<{ url: string }> {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const adminApp = initializeAdminApp();
  const db = getFirestore(adminApp);

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!proPriceId) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set in environment variables.');
  }

  const productionBaseUrl = 'https://rememberapp.zannalabs.com';

  const checkoutSessionCollection = db
    .collection('customers')
    .doc(userId)
    .collection('checkout_sessions');

  const sessionDocRef = await checkoutSessionCollection.add({
    mode: 'subscription',
    billing_address_collection: 'required',
    line_items: [
        {
            price: proPriceId,
            quantity: 1,
        },
    ],
    success_url: `${productionBaseUrl}/dashboard?payment=success`,
    cancel_url: `${productionBaseUrl}/dashboard?payment=cancel`,
    allow_promotion_codes: false,
  });

  // Wait for the Stripe extension to create the checkout session URL
  return new Promise<{ url: string }>((resolve, reject) => {
    
    let unsubscribe = () => {};

    const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Could not create a payment session. Please try again later.'));
    }, 30000); // 30 seconds timeout

    unsubscribe = sessionDocRef.onSnapshot(
      (snap) => {
        const { error, url } = snap.data() || {};
        if (error) {
          clearTimeout(timeoutId);
          unsubscribe();
          reject(new Error(`An error occurred: ${error.message}`));
        }
        if (url) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve({ url });
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        unsubscribe();
        console.error('onSnapshot error:', err);
        reject(new Error('Failed to listen for checkout session.'));
      }
    );
  });
}

export async function createStripePortalSession(
  userId: string
): Promise<{ url: string }> {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  const adminApp = initializeAdminApp();
  const db = getFirestore(adminApp);

  const customerDoc = await db
    .collection('customers')
    .doc(userId)
    .get();

  if (!customerDoc.exists) {
    throw new Error('Cliente non trovato');
  }

  const stripeId = customerDoc.data()?.stripeId;

  if (!stripeId) {
    throw new Error('Stripe ID non trovato per questo utente');
  }

  const productionBaseUrl = 'https://rememberapp.zannalabs.com';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeId,
    return_url: `${productionBaseUrl}/dashboard`,
  });

  if (!portalSession.url) {
    throw new Error('Could not create a portal session.');
  }

  return { url: portalSession.url };
}
