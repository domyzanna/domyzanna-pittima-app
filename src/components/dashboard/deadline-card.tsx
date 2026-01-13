'use client';
import type { ProcessedDeadline } from '@/lib/types';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, getNextExpiration } from '@/lib/utils';
import { Archive, Edit, Bell, BellOff, Trash2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { useFirestore, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const urgencyStyles = {
  bassa: { indicator: 'bg-status-low', text: 'text-status-low' },
  media: { indicator: 'bg-status-medium', text: 'text-status-medium' },
  alta: { indicator: 'bg-status-high', text: 'text-status-high' },
  scaduto: { indicator: 'bg-status-expired', text: 'text-status-expired' },
};

const defaultStyle = { indicator: 'bg-muted', text: 'text-muted-foreground' };

type DeadlineCardProps = {
    deadline: ProcessedDeadline;
    onEdit: () => void;
    onDelete: () => void;
}

export function DeadlineCard({ deadline, onEdit, onDelete }: DeadlineCardProps) {
  const { id, name, description, daysRemaining, urgency, expirationDate, recurrence, notificationStatus, notificationDays } = deadline;
  const style = urgencyStyles[urgency] || defaultStyle;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const formattedDays = daysRemaining >= 0 ? `${daysRemaining}g` : `${Math.abs(daysRemaining)}g fa`;
  const formattedDate = format(new Date(expirationDate), 'd MMMM yyyy', { locale: it });

  const handleComplete = () => {
    if (!user || !firestore) return;
    const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', id);

    if (recurrence === 'una-tantum') {
      updateDocumentNonBlocking(deadlineRef, { isCompleted: true });
      toast({ title: 'Completato!', description: `La scadenza "${name}" è stata archiviata.` });
    } else {
      const nextExpiration = getNextExpiration(new Date(expirationDate), recurrence);
      const newNotificationStartDate = subDays(nextExpiration, notificationDays);
      
      updateDocumentNonBlocking(deadlineRef, {
        expirationDate: nextExpiration.toISOString(),
        notificationStartDate: newNotificationStartDate.toISOString(),
        notificationStatus: 'pending',
      });
      toast({ title: 'Rinnovato!', description: `La scadenza "${name}" è stata aggiornata.` });
    }
  };

  const handleNotificationToggle = (isChecked: boolean) => {
     if (!user || !firestore) return;
     const deadlineRef = doc(firestore, 'users', user.uid, 'deadlines', id);
     const newStatus = isChecked ? 'active' : 'paused';
     updateDocumentNonBlocking(deadlineRef, { notificationStatus: newStatus });
     toast({
        title: `Notifiche ${isChecked ? 'attivate' : 'in pausa'}`,
        description: `${isChecked ? 'Riceverai' : 'Non riceverai più'} promemoria per "${name}".`
      });
  };

  const areNotificationsActive = notificationStatus === 'active' || notificationStatus === 'pending';

  return (
      <Card className="flex transition-shadow hover:shadow-md">
        <div className={cn('w-2 flex-shrink-0 rounded-l-lg', style.indicator)}></div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle asChild><h3 className="text-lg font-semibold">{name}</h3></CardTitle>
              <CardDescription className="text-sm mt-1">Scade il: {formattedDate}</CardDescription>
              {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
            </div>
            <div className={cn('flex items-center gap-2 text-lg font-bold font-mono', style.text)}>
              <span className={cn('h-3 w-3 rounded-full', style.indicator)}></span>
              <span>{formattedDays}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 gap-2">
             <div className="flex items-center space-x-2">
                <Switch id={`notifications-${id}`} checked={areNotificationsActive} onCheckedChange={handleNotificationToggle} aria-label="Toggle notifications" />
                <Label htmlFor={`notifications-${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                   {areNotificationsActive ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                   <span>Notifiche</span>
                </Label>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Elimina</span>
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifica
                </Button>
                 <Button variant="default" size="sm" onClick={handleComplete}>
                    <Archive className="mr-2 h-4 w-4" />
                    Completa
                </Button>
            </div>
          </div>
        </div>
      </Card>
  );
}
