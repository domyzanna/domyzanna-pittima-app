'use server';

import { generateMonthlySummary } from '@/ai/flows/monthly-summary-ai-urgency';
import type { MonthlySummaryOutput } from '@/ai/flows/monthly-summary-ai-urgency';
import type { ProcessedDeadline } from '@/lib/types';
import { addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export async function getAiSummary(
  deadlines: ProcessedDeadline[]
): Promise<MonthlySummaryOutput> {
  const now = new Date();
  const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const nextMonthInterval = {
    start: startOfMonth(addMonths(now, 1)),
    end: endOfMonth(addMonths(now, 1)),
  };

  const formatForAI = (d: ProcessedDeadline) => ({
    name: d.name,
    category: d.category,
    dueDate: d.expirationDate.toISOString().split('T')[0],
  });

  const currentMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(d.expirationDate, currentMonthInterval))
    .map(formatForAI);

  const nextMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(d.expirationDate, nextMonthInterval))
    .map(formatForAI);

  const overdueDeadlines = deadlines
    .filter((d) => d.urgency === 'expired')
    .map(formatForAI);

  try {
    const result = await generateMonthlySummary({
      userId: 'user-123', // dummy user ID
      currentMonthDeadlines: JSON.stringify(currentMonthDeadlines),
      nextMonthDeadlines: JSON.stringify(nextMonthDeadlines),
      overdueDeadlines: JSON.stringify(overdueDeadlines),
    });
    return result;
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return {
      summary: 'Failed to generate AI summary. Please check the logs.',
    };
  }
}
