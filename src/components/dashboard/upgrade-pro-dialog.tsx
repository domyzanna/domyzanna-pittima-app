
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

type UpgradeProDialogProps = {
  limit: number;
  forceOpen?: boolean; // New prop to force the dialog open
};

export function UpgradeProDialog({ limit, forceOpen = false }: UpgradeProDialogProps) {
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);


  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    // Listen for custom event only if not forced open
    if (!forceOpen) {
      document.addEventListener('open-upgrade-dialog', handleOpen);
    }
    return () => {
      if (!forceOpen) {
        document.removeEventListener('open-upgrade-dialog', handleOpen);
      }
    };
  }, [forceOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={forceOpen ? undefined : setIsOpen}>
      <DialogContent onInteractOutside={e => { if (forceOpen) e.preventDefault() }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Rocket className="text-primary" />
            {forceOpen ? "Il tuo periodo di prova è terminato!" : "Passa a Pittima Pro!"}
          </DialogTitle>
          <DialogDescription>
             {forceOpen 
                ? `Hai superato il limite di ${limit} scadenze e il tuo periodo di prova di 90 giorni è concluso. Fai l'upgrade per continuare a usare l'app senza limiti.`
                : `Hai raggiunto il limite di ${limit} scadenze per il piano gratuito. Fai l'upgrade per aggiungere scadenze illimitate e sbloccare tutte le funzionalità.`
             }
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
          <Button onClick={() => alert('Pagina di pagamento in arrivo!')} className="w-full">
            Fai l'Upgrade a Pro - 12€/anno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
