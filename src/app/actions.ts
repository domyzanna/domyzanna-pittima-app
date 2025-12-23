'use server';

import { generateMonthlySummary } from '@/ai/flows/monthly-summary-ai-urgency';
import type { MonthlySummaryOutput } from '@/ai/flows/monthly-summary-ai-urgency';
import type { ProcessedDeadline } from '@/lib/types';
import { addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { checkDeadlinesAndNotify } from '@/ai/flows/notification-hammer';

type SerializableProcessedDeadline = Omit<ProcessedDeadline, 'category'> & {
  category: string;
};


export async function getAiSummary(
  deadlines: SerializableProcessedDeadline[]
): Promise<MonthlySummaryOutput> {
  const now = new Date();
  const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
  const nextMonthInterval = {
    start: startOfMonth(addMonths(now, 1)),
    end: endOfMonth(addMonths(now, 1)),
  };

  const formatForAI = (d: SerializableProcessedDeadline) => ({
    name: d.name,
    category: d.category,
    dueDate: new Date(d.expirationDate).toISOString().split('T')[0],
  });

  const currentMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(new Date(d.expirationDate), currentMonthInterval))
    .map(formatForAI);

  const nextMonthDeadlines = deadlines
    .filter((d) => isWithinInterval(new Date(d.expirationDate), nextMonthInterval))
    .map(formatForAI);

  const overdueDeadlines = deadlines
    .filter((d) => d.urgency === 'scaduto')
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
    console.error('La generazione del riepilogo AI è fallita:', error);
    return {
      summary: 'Impossibile generare il riepilogo AI. Controlla i log.',
    };
  }
}

export async function runCheckDeadlinesAndNotify() {
  try {
    console.log("Invocazione manuale di checkDeadlinesAndNotify...");
    const result = await checkDeadlinesAndNotify();
    console.log("Esecuzione completata:", result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Errore durante l'esecuzione manuale del controllo scadenze:", error);
    return { success: false, error: error.message || 'Errore sconosciuto' };
  }
}

export async function getVapidPublicKey(): Promise<string | undefined> {
    return process.env.VAPID_PUBLIC_KEY;
}
