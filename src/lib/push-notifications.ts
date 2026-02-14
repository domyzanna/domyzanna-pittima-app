import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getFirestore, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
  if (messagingInstance) return messagingInstance;
  
  const supported = await isSupported();
  if (!supported) {
    console.log('[PUSH] Firebase Messaging not supported in this browser');
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
    console.log('[PUSH] Step 1: Checking current permission:', Notification.permission);
    
    // If already denied, can't do anything
    if (Notification.permission === 'denied') {
      console.log('[PUSH] Permission was previously denied by user');
      return null;
    }

    // Request permission
    console.log('[PUSH] Step 2: Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('[PUSH] Step 3: Permission result:', permission);
    
    if (permission !== 'granted') {
      console.log('[PUSH] Permission not granted:', permission);
      return null;
    }

    console.log('[PUSH] Step 4: Getting messaging instance...');
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.log('[PUSH] Messaging not available');
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    console.log('[PUSH] Step 5: VAPID key present:', !!vapidKey, 'length:', vapidKey?.length);
    if (!vapidKey) {
      console.error('[PUSH] VAPID key not found in env');
      return null;
    }

    // Get the registration from our manual SW
    console.log('[PUSH] Step 6: Getting SW registration...');
    const registration = await navigator.serviceWorker.getRegistration();
    console.log('[PUSH] Step 7: SW registration:', !!registration, registration?.scope);
    if (!registration) {
      console.error('[PUSH] Service Worker not registered');
      return null;
    }

    console.log('[PUSH] Step 8: Requesting FCM token...');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    console.log('[PUSH] Step 9: FCM Token obtained:', !!token, 'length:', token?.length);

    if (token) {
      // Save token to Firestore
      console.log('[PUSH] Step 10: Saving token to Firestore for user:', userId);
      await saveFcmToken(userId, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('[PUSH] Error in requestPushPermission:', error);
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
  
  console.log('[PUSH] ✅ FCM token saved to Firestore');
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
    console.log('[PUSH] 📬 Foreground message received:', payload);
    callback(payload);
  });
}
