import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

function getAdminApp() {
  const adminAppName = 'admin-push';
  const existingApp = getApps().find((app) => app.name === adminAppName);
  if (existingApp) return existingApp;
  return initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'studio-1765347057-3bb5c',
  }, adminAppName);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send push notification to a user using web-push
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const webpush = require('web-push');
  
  // Set VAPID details
  webpush.setVapidDetails(
    'mailto:infopittima@zannalabs.com',
    process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
  );

  const app = getAdminApp();
  const db = getFirestore(app);

  const userDoc = await db.doc(`users/${userId}`).get();
  const userData = userDoc.data();
  const subscriptions: string[] = userData?.fcmTokens || [];

  if (subscriptions.length === 0) {
    console.log(`No push subscriptions for user ${userId}`);
    return 0;
  }

  let sent = 0;
  const toRemove: string[] = [];

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'pittima-deadline',
    url: payload.url || 'https://rememberapp.zannalabs.com/dashboard',
  });

  for (const subStr of subscriptions) {
    try {
      const subscription = JSON.parse(subStr);
      await webpush.sendNotification(subscription, notificationPayload);
      sent++;
      console.log(`Push sent to user ${userId}`);
    } catch (error: any) {
      console.error(`Failed to send push:`, error.message);
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription expired or invalid
        toRemove.push(subStr);
      }
    }
  }

  // Clean up invalid subscriptions
  if (toRemove.length > 0) {
    const { FieldValue } = await import('firebase-admin/firestore');
    await db.doc(`users/${userId}`).update({
      fcmTokens: FieldValue.arrayRemove(...toRemove),
    });
    console.log(`Removed ${toRemove.length} invalid subscriptions`);
  }

  return sent;
}
