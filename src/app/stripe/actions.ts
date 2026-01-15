'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

// This is the server action that will create the Stripe checkout session
export async function createStripeCheckoutSession(
  email: string | null,
  userId: string | null
) {
  if (!email || !userId) {
    throw new Error('User email and ID are required to create a checkout session.');
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
  }

  // Get the base URL from the request headers to construct success/cancel URLs
  const origin = headers().get('origin');
  if (!origin) {
    throw new Error('Could not determine the request origin.');
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    typescript: true,
  });

  // IMPORTANT: You need to create this product and price in your Stripe dashboard first!
  // The price ID can be found in your Stripe dashboard.
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
      // We pass the user's email and our internal user ID to Stripe.
      // This allows us to link the Stripe customer to our user.
      customer_email: email,
      metadata: {
        firebaseUid: userId,
      },
      // Define the URLs where Stripe will redirect the user after payment.
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
