
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
};

export function UpgradeProDialog({ limit }: UpgradeProDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener('open-upgrade-dialog', handleOpen);
    return () => {
      document.removeEventListener('open-upgrade-dialog', handleOpen);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Rocket className="text-primary" />
            Passa a Pittima Pro!
          </DialogTitle>
          <DialogDescription>
            Hai raggiunto il limite di {limit} scadenze per il piano gratuito.
            Fai l'upgrade per aggiungere scadenze illimitate e sbloccare tutte le funzionalità.
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
