import type { ProcessedDeadline } from '@/lib/types';
import {
  Card,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Archive, Edit } from 'lucide-react';

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
  const { name, details, daysRemaining, urgency } = deadline;
  const style = urgencyStyles[urgency] || defaultStyle;

  const formattedDays =
    daysRemaining >= 0 ? `${daysRemaining}g` : `${Math.abs(daysRemaining)}g fa`;

  return (
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
              {Object.entries(details)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' · ')}
            </CardDescription>
          </div>
          <div className={cn('flex items-center gap-2 text-lg font-bold font-mono', style.text)}>
            <span className={cn('h-3 w-3 rounded-full', style.indicator)}></span>
            <span>{formattedDays}</span>
          </div>
        </div>
        <div className="flex justify-end items-center mt-4 gap-2">
          <Button variant="ghost" size="sm">
            <Archive className="mr-2 h-4 w-4" />
            Completa
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Aggiorna
          </Button>
        </div>
      </div>
    </Card>
  );
}
