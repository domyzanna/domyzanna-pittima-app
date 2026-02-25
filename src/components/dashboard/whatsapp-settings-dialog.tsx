'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface WhatsAppSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProUser: boolean;
}

export function WhatsAppSettingsDialog({
  open,
  onOpenChange,
  isProUser,
}: WhatsAppSettingsDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load existing settings when dialog opens
  useEffect(() => {
    if (open && user) {
      loadSettings();
    }
  }, [open, user]);

  const loadSettings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setWhatsappNumber(data.whatsappNumber || '');
        setWhatsappEnabled(data.whatsappEnabled || false);
        setConsentGiven(data.whatsappConsentGiven || false);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate number format
    if (whatsappEnabled && whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\s/g, '');
      if (!/^\+\d{10,15}$/.test(cleanNumber)) {
        toast({
          title: 'Numero non valido',
          description: 'Inserisci il numero con prefisso internazionale (es: +393291234567)',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        whatsappNumber: whatsappNumber.replace(/\s/g, '') || null,
        whatsappEnabled,
        whatsappConsentGiven: consentGiven,
      }, { merge: true });

      toast({
        title: 'Impostazioni salvate!',
        description: whatsappEnabled
          ? 'Riceverai notifiche WhatsApp per le tue scadenze.'
          : 'Notifiche WhatsApp disattivate.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le impostazioni. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!whatsappNumber) {
      toast({
        title: 'Numero mancante',
        description: 'Inserisci il tuo numero di telefono prima di fare il test.',
        variant: 'destructive',
      });
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\s/g, '');
    setIsTesting(true);
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: cleanNumber }),
      });
      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Messaggio inviato!',
          description: 'Controlla WhatsApp sul tuo telefono.',
        });
      } else {
        toast({
          title: 'Invio fallito',
          description: result.message || 'Errore durante l\'invio del messaggio di test.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare il messaggio di test.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleEnabled = (checked: boolean) => {
    if (checked && !consentGiven) {
      // First time enabling - need consent
      return;
    }
    setWhatsappEnabled(checked);
  };

  const handleConsent = () => {
    setConsentGiven(true);
    setWhatsappEnabled(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={() => onOpenChange(false)} onEscapeKeyDown={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Notifiche WhatsApp
          </DialogTitle>
          <DialogDescription>
            {isProUser
              ? 'Ricevi un promemoria WhatsApp il giorno prima e il giorno stesso della scadenza.'
              : 'Le notifiche WhatsApp sono disponibili con il piano Pro.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !isProUser ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50 p-4 text-center">
              <p className="text-sm text-orange-700">
                Passa al piano Pro per ricevere notifiche WhatsApp sulle tue scadenze.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Phone number input */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numero di telefono
              </Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="+393291234567"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Con prefisso internazionale (es: +39 per Italia)
              </p>
            </div>

            {/* Consent + Toggle */}
            {!consentGiven && whatsappNumber ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                <p className="text-sm text-blue-800">
                  Attivando le notifiche WhatsApp, il tuo numero di telefono
                  verr\u00e0 condiviso con Twilio per l&apos;invio dei messaggi.
                  Puoi disattivare questa funzione in qualsiasi momento.
                </p>
                <Button size="sm" onClick={handleConsent}>
                  Accetto, attiva WhatsApp
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-toggle" className="text-sm">
                  Notifiche WhatsApp attive
                </Label>
                <Switch
                  id="whatsapp-toggle"
                  checked={whatsappEnabled}
                  onCheckedChange={handleToggleEnabled}
                  disabled={!whatsappNumber}
                />
              </div>
            )}

            {/* Info about notification schedule */}
            {whatsappEnabled && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs text-green-700">
                  Riceverai un messaggio WhatsApp il giorno prima della scadenza
                  e uno il giorno stesso. Le email continueranno come sempre.
                </p>
              </div>
            )}

            {/* Test button */}
            {whatsappNumber && consentGiven && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isTesting ? 'Invio in corso...' : 'Invia messaggio di test'}
              </Button>
            )}

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSaving ? 'Salvataggio...' : 'Salva impostazioni'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
