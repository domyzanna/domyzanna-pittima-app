'use client';
import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import * as LucideIcons from 'lucide-react';
import { iconNames } from '@/lib/icons';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getUrgency, cn } from '@/lib/utils';

type CategorySectionProps = {
  category: Category;
  deadlines: ProcessedDeadline[];
  onEditDeadline: (deadline: ProcessedDeadline) => void;
  onDeleteDeadline: (deadline: ProcessedDeadline) => void;
};

const getIcon = (iconName: string) => {
  if (iconNames.includes(iconName)) {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-primary-foreground" />;
    }
  }
  const FallbackIcon = (LucideIcons as any)['Folder'];
  return <FallbackIcon className="h-6 w-6 text-primary-foreground" />;
};

const urgencyStyles = {
  bassa: { indicator: 'bg-status-low' },
  media: { indicator: 'bg-status-medium' },
  alta: { indicator: 'bg-status-high' },
  scaduto: { indicator: 'bg-status-expired' },
};
const defaultStyle = { indicator: 'bg-muted' };

export function CategorySection({
  category,
  deadlines,
  onEditDeadline,
  onDeleteDeadline,
}: CategorySectionProps) {
  if (deadlines.length === 0) return null;

  // Find the most urgent deadline to color the category indicator
  const mostUrgentDays = Math.min(...deadlines.map((d) => d.daysRemaining));
  const categoryUrgency = getUrgency(mostUrgentDays);
  const style = urgencyStyles[categoryUrgency] || defaultStyle;

  return (
    <AccordionItem value={category.id} className="border-none">
      <AccordionTrigger className="bg-primary text-primary-foreground p-3 rounded-lg hover:no-underline hover:bg-primary/90">
        <div className="flex items-center gap-3 w-full">
          <div
            className={cn('h-4 w-4 rounded-full flex-shrink-0', style.indicator)}
          ></div>
          {getIcon(category.icon)}
          <h2 className="text-xl font-headline font-semibold text-left flex-1 truncate">
            {category.name}
          </h2>
          <span className="text-sm font-normal bg-black/10 rounded-full px-2 py-0.5 ml-auto">
            {deadlines.length}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-4 pt-4">
          {deadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
              onEdit={() => onEditDeadline(deadline)}
              onDelete={() => onDeleteDeadline(deadline)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
