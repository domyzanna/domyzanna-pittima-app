'use client';
import { useState } from 'react';
import type { ProcessedDeadline } from '@/lib/types';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getNextExpiration } from '@/lib/utils';
import { Archive, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useFirestore, useUser } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EditDeadlineDialog } from './edit-deadline-dialog';

const urgencyStyles = {
  bassa: {
    indicator: 'bg-status-low',
    text: 'text-status-low',
  },
  media: {
    indicator: 'bg-status-medium',
    text: 'text-status-medium',
  },
  alta: {
    indicator: 'bg-status-high',
    text: 'text-status-high',
  },
  scaduto: {
    indicator: 'bg-status-expired',
    text: 'text-status-expired',
  },
};

const defaultStyle = {
  indicator: 'bg-muted',
  text: 'text-muted-foreground',
};

export function DeadlineCard({ deadline }: { deadline: ProcessedDeadline }) {
  const {
    id,
    name,
    description,
    daysRemaining,
    urgency,
    expirationDate,
    recurrence,
  } = deadline;
  const style = urgencyStyles[urgency] || defaultStyle;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formattedDays =
    daysRemaining >= 0 ? `${daysRemaining}g` : `${Math.abs(daysRemaining)}g fa`;

  const formattedDate = format(new Date(expirationDate), 'd MMMM yyyy', {
    locale: it,
  });

  const handleComplete = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Devi essere autenticato per eseguire questa azione.',
      });
      return;
    }

    const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', id);

    try {
      if (recurrence === 'una-tantum') {
        // Delete one-time deadline
        await deleteDoc(deadlineRef);
        toast({
          title: 'Completato!',
          description: `La scadenza "${name}" è stata rimossa.`,
        });
      } else {
        // Update recurring deadline to next expiration date
        const nextExpiration = getNextExpiration(
          new Date(expirationDate),
          recurrence
        );
        await updateDoc(deadlineRef, {
          expirationDate: nextExpiration.toISOString(),
        });
        toast({
          title: 'Rinnovato!',
          description: `La scadenza "${name}" è stata aggiornata alla prossima data.`,
        });
      }
    } catch (error) {
      console.error('Errore durante il completamento della scadenza: ', error);
      toast({
        variant: 'destructive',
        title: 'Operazione fallita',
        description: 'Non è stato possibile completare la scadenza.',
      });
    }
  };

  return (
    <>
      <Card className="flex transition-shadow hover:shadow-md">
        <div
          className={cn('w-2 flex-shrink-0 rounded-l-lg', style.indicator)}
        ></div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle asChild>
                <h3 className="text-lg font-semibold">{name}</h3>
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Scade il: {formattedDate}
              </CardDescription>
              {description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {description}
                </p>
              )}
            </div>
            <div
              className={cn(
                'flex items-center gap-2 text-lg font-bold font-mono',
                style.text
              )}
            >
              <span
                className={cn('h-3 w-3 rounded-full', style.indicator)}
              ></span>
              <span>{formattedDays}</span>
            </div>
          </div>
          <div className="flex justify-end items-center mt-4 gap-2">
            <Button variant="ghost" size="sm" onClick={handleComplete}>
              <Archive className="mr-2 h-4 w-4" />
              Completa
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Aggiorna
            </Button>
          </div>
        </div>
      </Card>
      <EditDeadlineDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        deadline={deadline}
      />
    </>
  );
}
