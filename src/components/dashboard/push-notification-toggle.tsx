'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestPushPermission, onForegroundMessage } from '@/lib/push-notifications';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationToggleProps {
  userId: string;
}

export function PushNotificationToggle({ userId }: PushNotificationToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push is supported and already enabled
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    if (Notification.permission === 'granted') {
      setIsEnabled(true);
      // Listen for foreground messages
      onForegroundMessage((payload) => {
        toast({
          title: payload.notification?.title || 'Pittima App',
          description: payload.notification?.body || 'Hai scadenze in avvicinamento!',
        });
      });
    }
  }, [toast]);

  const handleToggle = async () => {
    if (isEnabled) {
      // Can't programmatically revoke - tell user how
      toast({
        title: 'Disattiva notifiche',
        description: 'Per disattivare, vai nelle impostazioni del browser e rimuovi il permesso notifiche per questo sito.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await requestPushPermission(userId);
      if (token) {
        setIsEnabled(true);
        toast({
          title: '🔔 Notifiche attivate!',
          description: 'Riceverai avvisi sulle tue scadenze direttamente sul telefono.',
        });
        // Setup foreground listener
        onForegroundMessage((payload) => {
          toast({
            title: payload.notification?.title || 'Pittima App',
            description: payload.notification?.body || 'Hai scadenze in avvicinamento!',
          });
        });
      } else {
        toast({
          title: 'Permesso negato',
          description: 'Hai negato il permesso per le notifiche. Puoi riattivarlo dalle impostazioni del browser.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Push toggle error:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile attivare le notifiche. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <Button
      variant={isEnabled ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={isEnabled ? 'border-green-500 text-green-600' : ''}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isEnabled ? (
        <Bell className="h-4 w-4 mr-2" />
      ) : (
        <BellOff className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Attivazione...' : isEnabled ? 'Notifiche attive' : 'Attiva notifiche'}
    </Button>
  );
}
