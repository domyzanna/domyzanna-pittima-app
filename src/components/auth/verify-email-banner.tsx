'use client';
import { useAuth } from '@/firebase';
import { sendEmailVerification, type User } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MailWarning } from 'lucide-react';
import { useState } from 'react';
import { Icons } from '../icons';

export function VerifyEmailBanner({ user }: { user: User }) {
  const auth = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Email inviata!',
        description: 'Controlla la tua casella di posta per il nuovo link di verifica.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: "Impossibile inviare l'email. Riprova più tardi.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Alert className="rounded-lg border-amber-500 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
      <MailWarning className="h-4 w-4 text-amber-700 dark:text-amber-300" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Verifica il tuo indirizzo email
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
          <p>
            Controlla la tua casella di posta per completare la registrazione.
          </p>
          <Button onClick={handleResend} disabled={isSending} size="sm" variant="outline" className="text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 border-amber-300 dark:border-amber-800">
             {isSending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Invia di nuovo
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
