import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import { Icons } from '../icons';

type CategorySectionProps = {
  category: Category;
  deadlines: ProcessedDeadline[];
};

const categoryIcons = {
  Vehicles: Icons.vehicle,
  Insurance: Icons.insurance,
  'Personal Documents': Icons.document,
  Subscriptions: Icons.subscription,
};

export function CategorySection({
  category,
  deadlines,
}: CategorySectionProps) {
  if (deadlines.length === 0) return null;

  const Icon = categoryIcons[category];

  return (
    <section>
      <h2 className="text-xl font-headline font-semibold mb-4 flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        {category}
      </h2>
      <div className="grid gap-4">
        {deadlines.map((deadline) => (
          <DeadlineCard key={deadline.id} deadline={deadline} />
        ))}
      </div>
    </section>
  );
}
