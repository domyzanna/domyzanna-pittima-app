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
    
    if (Notification.permission === 'denied') {
      console.log('[PUSH] Permission was previously denied by user');
      return null;
    }

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

    // Wait for SW to be ready (important!)
    console.log('[PUSH] Step 6: Waiting for SW to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[PUSH] Step 7: SW ready:', !!registration, 'scope:', registration.scope);
    console.log('[PUSH] Step 7b: pushManager available:', !!registration.pushManager);

    console.log('[PUSH] Step 8: Requesting FCM token...');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    console.log('[PUSH] Step 9: FCM Token obtained:', !!token, 'length:', token?.length);

    if (token) {
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

async function saveFcmToken(userId: string, token: string) {
  const app = getApps()[0];
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayUnion(token),
  }, { merge: true });
  
  console.log('[PUSH] ✅ FCM token saved to Firestore');
}

export async function removeFcmToken(userId: string, token: string) {
  const app = getApps()[0];
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayRemove(token),
  }, { merge: true });
}

export async function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('[PUSH] 📬 Foreground message received:', payload);
    callback(payload);
  });
}
