
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle, PlusCircle, Bell, Wand2 } from 'lucide-react';

type HowItWorksDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const steps = [
    {
        icon: <PlusCircle className="h-6 w-6 text-primary" />,
        title: "1. Aggiungi le tue scadenze",
        description: "Clicca su 'Aggiungi Scadenza' e inserisci i dettagli: nome, data, categoria e ogni quanto si ripete."
    },
    {
        icon: <Bell className="h-6 w-6 text-primary" />,
        title: "2. Ricevi le notifiche",
        description: "Pittima ti invierà email e notifiche push quando una scadenza si avvicina, così non dovrai più preoccuparti di ricordare."
    },
    {
        icon: <Wand2 className="h-6 w-6 text-primary" />,
        title: "3. Usa l'AI per prioritizzare",
        description: "Usa il 'Riepilogo Mensile AI' per avere una visione intelligente delle tue scadenze, ordinate per importanza e urgenza."
    }
]

export function HowItWorksDialog({
  open,
  onOpenChange,
}: HowItWorksDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <HelpCircle />
            Come funziona Pittima App
          </DialogTitle>
          <DialogDescription>
            Una guida rapida per iniziare a gestire le tue scadenze.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
            {steps.map(step => (
                <div key={step.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                        {step.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
