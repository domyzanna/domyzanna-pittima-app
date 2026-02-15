import { getApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Request notification permission and subscribe to push
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

    console.log('[PUSH] Step 4: Waiting for SW to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[PUSH] Step 5: SW ready, subscribing to push...');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('[PUSH] Step 6: No existing subscription, creating new one...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_KEY,
      });
    } else {
      console.log('[PUSH] Step 6: Using existing subscription');
    }

    const subJson = subscription.toJSON();
    const token = JSON.stringify(subJson);
    console.log('[PUSH] Step 7: Subscription obtained, endpoint:', subJson.endpoint?.substring(0, 60));

    // Save subscription to Firestore
    console.log('[PUSH] Step 8: Saving to Firestore for user:', userId);
    await savePushSubscription(userId, token);
    
    return token;
  } catch (error) {
    console.error('[PUSH] Error in requestPushPermission:', error);
    return null;
  }
}

/**
 * Save push subscription to Firestore
 */
async function savePushSubscription(userId: string, subscriptionJson: string) {
  if (getApps().length === 0) {
    console.error('[PUSH] No Firebase app');
    return;
  }
  const app = getApp();
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayUnion(subscriptionJson),
  }, { merge: true });
  
  console.log('[PUSH] ✅ Push subscription saved to Firestore');
}

/**
 * Remove push subscription
 */
export async function removeFcmToken(userId: string, token: string) {
  const app = getApp();
  const db = getFirestore(app);
  
  await setDoc(doc(db, 'users', userId), {
    fcmTokens: arrayRemove(token),
  }, { merge: true });
}

/**
 * Listen for foreground messages (using SW message event)
 */
export async function onForegroundMessage(callback: (payload: any) => void) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'PUSH_RECEIVED') {
        console.log('[PUSH] 📬 Foreground message received');
        callback(event.data);
      }
    });
  }
}
