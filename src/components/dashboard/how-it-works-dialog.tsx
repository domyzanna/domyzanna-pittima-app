
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle, PlusCircle, Bell, Wand2, FolderPlus } from 'lucide-react';

type HowItWorksDialogProps = {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const steps = [
    {
        icon: <PlusCircle className="h-6 w-6 text-primary" />,
        title: "1. Aggiungi le tue scadenze",
        description: "Clicca su 'Aggiungi Scadenza' e inserisci i dettagli: nome, data, categoria e quanti giorni prima vuoi iniziare a ricevere gli avvisi."
    },
    {
        icon: <FolderPlus className="h-6 w-6 text-primary" />,
        title: "2. Crea le tue categorie",
        description: "Non trovi la categoria che ti serve? Nessun problema! Puoi creare tutte le categorie personalizzate che desideri per organizzare al meglio le tue scadenze."
    },
    {
        icon: <Bell className="h-6 w-6 text-primary" />,
        title: "3. Ricevi notifiche incessanti",
        description: "A partire dal giorno che hai impostato, Pittima ti invierà notifiche email e push ogni giorno, assicurandosi che tu non possa dimenticare la scadenza."
    },
    {
        icon: <Wand2 className="h-6 w-6 text-primary" />,
        title: "4. Usa l'AI per prioritizzare",
        description: "Sfrutta il 'Riepilogo Mensile AI' per avere una visione intelligente delle tue scadenze, ordinate per importanza e urgenza reali."
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
