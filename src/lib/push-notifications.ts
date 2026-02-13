import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getFirestore, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  
  const supported = await isSupported();
  if (!supported) {
    console.log('Push notifications not supported in this browser');
    return null;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestPushPermission(userId: string): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('VAPID key not found');
      return null;
    }

    // Get the registration from our manual SW
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('Service Worker not registered');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('✅ FCM Token obtained');
      // Save token to Firestore
      await saveFcmToken(userId, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Save FCM token to Firestore under the user's document
 */
async function saveFcmToken(userId: string, token: string) {
  const app = getApps()[0];
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayUnion(token),
  }, { merge: true });
  
  console.log('✅ FCM token saved to Firestore');
}

/**
 * Remove FCM token (for logout or disable notifications)
 */
export async function removeFcmToken(userId: string, token: string) {
  const app = getApps()[0];
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayRemove(token),
  }, { merge: true });
}

/**
 * Listen for foreground messages
 */
export async function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('📬 Push ricevuta in foreground:', payload);
    callback(payload);
  });
}
