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
import { redirect } from 'next/navigation';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

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
    // Prevent re-initializing the app on every call in dev environments
    const existingApp = getApps().find((app) => app.name === adminAppName);
    if (existingApp) {
      return existingApp;
    }
    
    // Assumes Application Default Credentials (ADC) are available in the App Hosting environment.
    // process.env.GOOGLE_CLOUD_PROJECT is automatically set by App Hosting.
    return initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-1765347057-3bb5c',
    }, adminAppName);
}

export async function createStripeCheckoutSession(
  userId: string | null,
  origin: string
) {
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const adminApp = initializeAdminApp();
  const db = getFirestore(adminApp);

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!proPriceId) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set in environment variables.');
  }

  const checkoutSessionCollection = db
    .collection('customers')
    .doc(userId)
    .collection('checkout_sessions');

  const sessionDocRef = await checkoutSessionCollection.add({
    price: proPriceId,
    success_url: `${origin}/dashboard?payment=success`,
    cancel_url: `${origin}/dashboard?payment=cancel`,
  });

  // Wait for the Stripe extension to create the checkout session URL
  return new Promise<void>((resolve, reject) => {
    const unsubscribe = sessionDocRef.onSnapshot(
      (snap) => {
        const { error, url } = snap.data() || {};
        if (error) {
          unsubscribe();
          reject(new Error(`An error occurred: ${error.message}`));
        }
        if (url) {
          unsubscribe();
          // We have a URL, let's redirect!
          redirect(url);
          // This resolve may not be reached due to redirect, but it's good practice.
          resolve(); 
        }
      },
      (err) => {
        unsubscribe();
        console.error('onSnapshot error:', err);
        reject(new Error('Failed to listen for checkout session.'));
      }
    );

    // Add a timeout to prevent waiting indefinitely
    setTimeout(() => {
        unsubscribe();
        reject(new Error('Could not create a payment session. Please try again later.'));
    }, 15000); // 15 seconds timeout
  });
}
