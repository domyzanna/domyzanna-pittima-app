'use server';
import { ai } from '@/ai/genkit';
import webpush from 'web-push';
import { z } from 'zod';

export const sendPushNotificationTool = ai.defineTool(
  {
    name: 'sendPushNotification',
    description: 'Sends a web push notification to a user.',
    inputSchema: z.object({
      subscription: z.any(), // This should be the PushSubscription object
      payload: z.object({
        title: z.string(),
        body: z.string(),
      }),
    }),
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ subscription, payload }) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (
      !publicKey ||
      !privateKey
    ) {
      console.warn("VAPID keys not configured. Skipping push notification.");
      return { success: false, message: "VAPID keys not configured." };
    }
    
    try {
      webpush.setVapidDetails(
          `mailto:you@example.com`,
          publicKey,
          privateKey
      );

      await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );

      return { success: true, message: 'Push notification sent successfully.' };

    } catch (error: any) {
      console.error('Error sending push notification:', error);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
          console.log("Push subscription has expired or is invalid. It should be removed.");
      }

      return { success: false, message: error.message || 'Failed to send push notification.' };
    }
  }
);
