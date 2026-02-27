'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Phone, ShieldCheck, KeyRound } from 'lucide-react';
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
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [verifiedNumber, setVerifiedNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadSettings();
      setOtpSent(false);
      setOtpCode('');
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
        setWhatsappVerified(data.whatsappVerified || false);
        setVerifiedNumber(data.whatsappNumber || '');
        setConsentGiven(data.whatsappConsentGiven || false);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const numberChanged = whatsappNumber !== verifiedNumber;

  const handleSendOtp = async () => {
    if (!user || !whatsappNumber) return;

    const cleanNumber = whatsappNumber.replace(/\s/g, '');
    if (!/^\+\d{10,15}$/.test(cleanNumber)) {
      toast({
        title: 'Numero non valido',
        description: 'Inserisci il numero con prefisso internazionale (es: +393291234567)',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/whatsapp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          uid: user.uid,
          phoneNumber: cleanNumber,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setOtpSent(true);
        toast({
          title: 'Codice inviato!',
          description: 'Controlla WhatsApp e inserisci il codice a 4 cifre.',
        });
      } else {
        toast({
          title: 'Invio fallito',
          description: result.message || 'Impossibile inviare il codice.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare il codice. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user || !otpCode) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/whatsapp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          uid: user.uid,
          code: otpCode,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setWhatsappVerified(true);
        setVerifiedNumber(whatsappNumber);
        setOtpSent(false);
        setOtpCode('');

        // Save the verified number
        const cleanNumber = whatsappNumber.replace(/\s/g, '');
        await setDoc(doc(firestore, 'users', user.uid), {
          whatsappNumber: cleanNumber,
          whatsappConsentGiven: true,
        }, { merge: true });

        toast({
          title: '\u2705 Numero verificato!',
          description: 'Ora puoi attivare le notifiche WhatsApp.',
        });
      } else {
        toast({
          title: 'Verifica fallita',
          description: result.message || 'Codice non valido.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile verificare il codice. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        whatsappEnabled,
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
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (e.target.value !== verifiedNumber) {
                    setWhatsappVerified(false);
                    setWhatsappEnabled(false);
                    setOtpSent(false);
                    setOtpCode('');
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Con prefisso internazionale (es: +39 per Italia)
              </p>
            </div>

            {/* Verification status */}
            {whatsappVerified && !numberChanged ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700 font-medium">Numero verificato</p>
              </div>
            ) : whatsappNumber ? (
              <div className="space-y-3">
                {!otpSent ? (
                  <>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-800">
                        Per attivare le notifiche WhatsApp, verifica il tuo numero.
                        Riceverai un codice a 4 cifre su WhatsApp.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isSendingOtp ? 'Invio in corso...' : 'Invia codice di verifica'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-800">
                        Codice inviato! Controlla WhatsApp e inseriscilo qui sotto. Scade tra 10 minuti.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-2xl tracking-widest font-mono"
                      />
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isVerifying || otpCode.length !== 4}
                      >
                        {isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="w-full text-xs"
                    >
                      Non hai ricevuto il codice? Rinvia
                    </Button>
                  </>
                )}
              </div>
            ) : null}

            {/* Toggle - only if verified */}
            {whatsappVerified && !numberChanged && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-toggle" className="text-sm">
                    Notifiche WhatsApp attive
                  </Label>
                  <Switch
                    id="whatsapp-toggle"
                    checked={whatsappEnabled}
                    onCheckedChange={setWhatsappEnabled}
                  />
                </div>

                {whatsappEnabled && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs text-green-700">
                      Riceverai un messaggio WhatsApp il giorno prima della scadenza
                      e uno il giorno stesso. Le email continueranno come sempre.
                    </p>
                  </div>
                )}

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
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
