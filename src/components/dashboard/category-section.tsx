'use client';
import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import * as LucideIcons from 'lucide-react';
import { iconNames } from '@/lib/icons';
import Link from 'next/link';

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
  

export function CategorySection({
  category,
  deadlines,
  onEditDeadline,
  onDeleteDeadline,
}: CategorySectionProps) {
  if (deadlines.length === 0) return null;

  return (
    <section>
      <div className="bg-primary text-primary-foreground p-3 rounded-lg mb-4">
        <Link href={`/dashboard/category/${category.id}`} className="group">
          <h2 className="text-xl font-headline font-semibold flex items-center gap-3">
            {getIcon(category.icon)}
            {category.name}
          </h2>
        </Link>
      </div>
      <div className="grid gap-4">
        {deadlines.map((deadline) => (
          <DeadlineCard 
            key={deadline.id} 
            deadline={deadline} 
            onEdit={() => onEditDeadline(deadline)}
            onDelete={() => onDeleteDeadline(deadline)}
          />
        ))}
      </div>
    </section>
  );
}
