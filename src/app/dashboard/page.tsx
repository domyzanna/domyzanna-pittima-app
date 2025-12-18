import { mockDeadlines } from '@/lib/data';
import { calculateDaysRemaining, getUrgency } from '@/lib/utils';
import type { ProcessedDeadline, Category } from '@/lib/types';
import { CategorySection } from '@/components/dashboard/category-section';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';

export default function DashboardPage() {
  const deadlines: ProcessedDeadline[] = mockDeadlines
    .map((d) => {
      const daysRemaining = calculateDaysRemaining(d.expirationDate);
      return {
        ...d,
        daysRemaining,
        urgency: getUrgency(daysRemaining),
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const categories = [...new Set(deadlines.map((d) => d.category))] as Category[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            deadlines={deadlines.filter((d) => d.category === category)}
          />
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-8">
          <MonthlySummary deadlines={deadlines} />
        </div>
      </div>
    </div>
  );
}
