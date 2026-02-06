'use server';

import { generateMonthlySummary } from '@/ai/flows/monthly-summary-ai-urgency';
import type { MonthlySummaryOutput } from '@/ai/flows/monthly-summary-ai-urgency';
import type { ProcessedDeadline } from '@/lib/types';
import { addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { checkDeadlinesAndNotify } from '@/ai/flows/notification-hammer';
import { redirect } from 'next/navigation';
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

export async function createStripeCheckoutSession(
  email: string | null,
  userId: string | null,
  origin: string,
) {
  if (!email || !userId) {
    throw new Error('User email and ID are required to create a checkout session.');
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
  }

  if (!origin) {
    throw new Error('Could not determine the request origin.');
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    typescript: true,
  });

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!proPriceId) {
    throw new Error('STRIPE_PRO_PRICE_ID is not set in environment variables.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        firebaseUid: userId,
      },
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/dashboard?payment=cancel`,
    });

    if (session.url) {
      redirect(session.url);
    } else {
      throw new Error('Failed to create a Stripe checkout session URL.');
    }
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw new Error('Could not create a payment session. Please try again later.');
  }
}
