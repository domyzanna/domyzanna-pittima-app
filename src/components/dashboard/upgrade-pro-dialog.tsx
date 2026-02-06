
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { useUser } from '@/firebase';
import { createStripeCheckoutSession } from '@/app/actions';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';

type UpgradeProDialogProps = {
  limit: number;
  forceOpen?: boolean;
};

export function UpgradeProDialog({
  limit,
  forceOpen = false,
}: UpgradeProDialogProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    if (!forceOpen) {
      document.addEventListener('open-upgrade-dialog', handleOpen);
    }
    return () => {
      if (!forceOpen) {
        document.removeEventListener('open-upgrade-dialog', handleOpen);
      }
    };
  }, [forceOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: "Devi essere loggato per fare l'upgrade.",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await createStripeCheckoutSession(user.uid);
      // Redirect happens on the server, so we might not need to set isSubmitting to false here
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Errore Checkout',
        description:
          error.message || 'Impossibile connettersi a Stripe. Riprova più tardi.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={forceOpen ? undefined : setIsOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          if (forceOpen) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Rocket className="text-primary" />
            Hai superato il limite del piano gratuito!
          </DialogTitle>
          <DialogDescription>
            Hai raggiunto il limite di {limit} scadenze. Fai l'upgrade a Pro per
            aggiungere scadenze illimitate e sbloccare tutte le funzionalità.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
            <li>✅ Scadenze illimitate</li>
            <li>🤖 Riepiloghi mensili con AI</li>
            <li>🚀 Accesso a tutte le funzionalità future</li>
          </ul>
        </div>
        <DialogFooter>
          <form onSubmit={handleSubmit} className="w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Fai l'Upgrade a Pro - 12€/anno
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
