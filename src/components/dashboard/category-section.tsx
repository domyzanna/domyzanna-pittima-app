import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import * as LucideIcons from 'lucide-react';
import { Icons } from '../icons';

type CategorySectionProps = {
  category: Category;
  deadlines: ProcessedDeadline[];
};

// A little hacky, but allows dynamic icons from a string
const getIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  if (Icon) {
    return <Icon className="h-6 w-6 text-primary" />;
  }
  return <LucideIcons.AlertCircle className="h-6 w-6 text-destructive" />; // Fallback icon
};

export function CategorySection({
  category,
  deadlines,
}: CategorySectionProps) {
  if (deadlines.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-headline font-semibold mb-4 flex items-center gap-3">
        {getIcon(category.icon)}
        {category.name}
      </h2>
      <div className="grid gap-4">
        {deadlines.map((deadline) => (
          <DeadlineCard key={deadline.id} deadline={deadline} />
        ))}
      </div>
    </section>
  );
}
