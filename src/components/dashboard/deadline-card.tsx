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
  low: {
    indicator: 'bg-status-low',
    text: 'text-status-low',
  },
  medium: {
    indicator: 'bg-status-medium',
    text: 'text-status-medium',
  },
  high: {
    indicator: 'bg-status-high',
    text: 'text-status-high',
  },
  expired: {
    indicator: 'bg-status-expired',
    text: 'text-status-expired',
  },
};

export function DeadlineCard({ deadline }: { deadline: ProcessedDeadline }) {
  const { name, details, daysRemaining, urgency } = deadline;
  const style = urgencyStyles[urgency];

  const formattedDays =
    daysRemaining >= 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d ago`;

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
          <div className={cn('text-lg font-bold font-mono', style.text)}>
            {formattedDays}
          </div>
        </div>
        <div className="flex justify-end items-center mt-4 gap-2">
          <Button variant="ghost" size="sm">
            <Archive className="mr-2 h-4 w-4" />
            Complete
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Update
          </Button>
        </div>
      </div>
    </Card>
  );
}
