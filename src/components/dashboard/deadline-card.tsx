'use client';
import { useState } from 'react';
import type { ProcessedDeadline } from '@/lib/types';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getNextExpiration } from '@/lib/utils';
import { Archive, Edit, Bell, BellOff } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useFirestore, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EditDeadlineDialog } from './edit-deadline-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
    notificationStatus,
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

  const handleComplete = () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Devi essere autenticato per eseguire questa azione.',
      });
      return;
    }

    const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', id);

    if (recurrence === 'una-tantum') {
      deleteDocumentNonBlocking(deadlineRef);
      toast({
        title: 'Completato!',
        description: `La scadenza "${name}" è stata rimossa.`,
      });
    } else {
      const nextExpiration = getNextExpiration(
        new Date(expirationDate),
        recurrence
      );
      updateDocumentNonBlocking(deadlineRef, {
        expirationDate: nextExpiration.toISOString(),
        notificationStatus: 'pending',
      });
      toast({
        title: 'Rinnovato!',
        description: `La scadenza "${name}" è stata aggiornata alla prossima data.`,
      });
    }
  };

  const handleNotificationToggle = (isChecked: boolean) => {
     if (!user || !firestore) return;
     const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', id);
     const newStatus = isChecked ? 'active' : 'paused';
     
     updateDocumentNonBlocking(deadlineRef, { notificationStatus: newStatus });
     
     toast({
         title: `Notifiche ${isChecked ? 'attivate' : 'in pausa'}`,
         description: `Riceverai promemoria per "${name}".`,
     });
  };

  const areNotificationsActive = notificationStatus === 'active' || notificationStatus === 'pending';

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
          <div className="flex justify-between items-center mt-4 gap-2">
             <div className="flex items-center space-x-2">
                <Switch
                    id={`notifications-${id}`}
                    checked={areNotificationsActive}
                    onCheckedChange={handleNotificationToggle}
                    aria-label="Toggle notifications"
                />
                <Label htmlFor={`notifications-${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                   {areNotificationsActive ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                   <span>Notifiche</span>
                </Label>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleComplete}>
                    <Archive className="mr-2 h-4 w-4" />
                    Completa
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifica
                </Button>
            </div>
          </div>
        </div>
      </Card>
      {isEditDialogOpen && (
        <EditDeadlineDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          deadline={deadline}
        />
      )}
    </>
  );
}
