'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { BellRing, BellOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');


  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.error('Service worker registration failed:', err);
            setNotificationError("Impossibile inizializzare le notifiche (Service Worker fallito).");
        });

        navigator.permissions.query({name: 'push', userVisibleOnly:true}).then(permissionResult => {
            setPermissionState(permissionResult.state);
            permissionResult.onchange = () => {
                setPermissionState(permissionResult.state);
            };
        });

    } else {
        setPermissionState('denied');
        setNotificationError("Il tuo browser non supporta le notifiche push.");
    }
  }, []);

  useEffect(() => {
    if (!user || !firestore) return;

    const checkSubscription = async () => {
      setIsSubscriptionLoading(true);
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().pushSubscription) {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscribed(false);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    
    checkSubscription();

  }, [user, firestore]);

  const handleUnsubscribe = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { pushSubscription: null });
      setIsSubscribed(false);
      toast({
        title: 'Notifiche disattivate',
        description: 'Non riceverai più notifiche push.',
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      setNotificationError('Impossibile disattivare le notifiche.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationError("Il tuo browser non supporta le notifiche push.");
      return;
    }

    setIsProcessing(true);
    setNotificationError(null);
    
    const VAPID_PUBLIC_KEY = "BHlzENF_MAU5UWAL1zxT89jZvSPg36r72FtLOhHoRawcr1uEPdVQ6LC7xki3qgGXD4i1lGQhxjS2nHkvw18BWgc";

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, {
          pushSubscription: JSON.parse(JSON.stringify(subscription)),
        });
      }
      
      setIsSubscribed(true);
      toast({
        title: 'Notifiche attivate!',
        description: 'Riceverai le notifiche push per le tue scadenze.',
      });
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      if (error.name === 'NotAllowedError') {
         setNotificationError("Hai bloccato le notifiche. Per riceverle, devi abilitarle nelle impostazioni del tuo browser per questo sito.");
      } else {
        setNotificationError(error.message || 'Impossibile attivare le notifiche. Riprova.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = isProcessing || permissionState === 'denied';

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-headline font-semibold mb-4">
        Impostazioni
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Notifiche Push</CardTitle>
          <CardDescription>
            Attiva le notifiche push per ricevere avvisi in tempo reale
            direttamente sul tuo dispositivo, anche quando non hai l'app aperta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubscriptionLoading ? (
            <div className='flex items-center gap-2'>
                 <Icons.spinner className="h-5 w-5 animate-spin" />
                 <span>Verifica in corso...</span>
            </div>
          ) : (
            <Button onClick={isSubscribed ? handleUnsubscribe : handleSubscribe} disabled={isButtonDisabled}>
              {isProcessing && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {isSubscribed ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disattiva Notifiche Push
                </>
              ) : (
                <>
                  <BellRing className="mr-2 h-4 w-4" />
                  Attiva Notifiche Push
                </>
              )}
            </Button>
          )}
          {permissionState === 'denied' && !isSubscriptionLoading && (
               <Alert variant="destructive" className="mt-4">
                 <AlertTriangle className="h-4 w-4" />
                 <AlertTitle>Permessi Negati</AlertTitle>
                 <AlertDescription>
                    Hai bloccato le notifiche per questo sito. Per poterle attivare, devi modificare i permessi nelle impostazioni del tuo browser.
                 </AlertDescription>
               </Alert>
          )}
           {notificationError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Operazione non riuscita</AlertTitle>
              <AlertDescription>{notificationError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
