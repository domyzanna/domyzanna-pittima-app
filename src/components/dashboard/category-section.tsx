import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import * as LucideIcons from 'lucide-react';
import { iconNames } from '@/lib/icons';
import Link from 'next/link';

type CategorySectionProps = {
  category: Category;
  deadlines: ProcessedDeadline[];
  onEditDeadline: (deadline: ProcessedDeadline) => void;
};

const getIcon = (iconName: string) => {
  if (iconNames.includes(iconName)) {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-primary" />;
    }
  }

  // Fallback Icon
  const FallbackIcon = (LucideIcons as any)['Folder'];
  return <FallbackIcon className="h-6 w-6 text-primary" />;
};
  

export function CategorySection({
  category,
  deadlines,
  onEditDeadline,
}: CategorySectionProps) {
  if (deadlines.length === 0) return null;

  return (
    <section>
      <Link href={`/dashboard/category/${category.id}`} className="group">
        <h2 className="text-xl font-headline font-semibold mb-4 flex items-center gap-3 group-hover:text-primary transition-colors">
          {getIcon(category.icon)}
          {category.name}
        </h2>
      </Link>
      <div className="grid gap-4">
        {deadlines.map((deadline) => (
          <DeadlineCard key={deadline.id} deadline={deadline} onEdit={() => onEditDeadline(deadline)} />
        ))}
      </div>
    </section>
  );
}
