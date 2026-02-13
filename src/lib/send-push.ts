import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

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
 * Send push notification to a user by reading their FCM tokens from Firestore
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const app = getAdminApp();
  const db = getFirestore(app);
  const messaging = getMessaging(app);

  const userDoc = await db.doc(`users/${userId}`).get();
  const userData = userDoc.data();
  const fcmTokens: string[] = userData?.fcmTokens || [];

  if (fcmTokens.length === 0) {
    console.log(`No FCM tokens for user ${userId}`);
    return 0;
  }

  let sent = 0;
  const tokensToRemove: string[] = [];

  for (const token of fcmTokens) {
    try {
      await messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        webpush: {
          fcmOptions: {
            link: payload.url || 'https://rememberapp.zannalabs.com/dashboard',
          },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'pittima-deadline',
            renotify: true,
          },
        },
      });
      sent++;
    } catch (error: any) {
      console.error(`Failed to send push to token ${token.substring(0, 10)}...:`, error.message);
      // Remove invalid tokens
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        tokensToRemove.push(token);
      }
    }
  }

  // Clean up invalid tokens
  if (tokensToRemove.length > 0) {
    const { FieldValue } = await import('firebase-admin/firestore');
    await db.doc(`users/${userId}`).update({
      fcmTokens: FieldValue.arrayRemove(...tokensToRemove),
    });
    console.log(`Removed ${tokensToRemove.length} invalid tokens for user ${userId}`);
  }

  return sent;
}
