import type { ProcessedDeadline, Category } from '@/lib/types';
import { DeadlineCard } from './deadline-card';
import * as LucideIcons from 'lucide-react';

type CategorySectionProps = {
  category: Category;
  deadlines: ProcessedDeadline[];
};

// A little hacky, but allows dynamic icons from a string
const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-primary" />;
    }
  
    // Fallback Icon
    const FallbackIcon = (LucideIcons as any)['AlertCircle'];
    if (FallbackIcon) {
      return <FallbackIcon className="h-6 w-6 text-destructive" />;
    }
  
    return null; 
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
