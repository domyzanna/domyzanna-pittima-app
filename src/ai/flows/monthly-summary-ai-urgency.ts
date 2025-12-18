'use server';
/**
 * @fileOverview Generates a monthly summary of deadlines, prioritizing overdue items based on their real-world cost using AI.
 *
 * - generateMonthlySummary - A function that generates the monthly summary with AI-prioritized overdue items.
 * - MonthlySummaryInput - The input type for the generateMonthlySummary function.
 * - MonthlySummaryOutput - The return type for the generateMonthlySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlySummaryInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  currentMonthDeadlines: z.string().describe('JSON string of deadlines for the current month.'),
  nextMonthDeadlines: z.string().describe('JSON string of deadlines for the next month.'),
  overdueDeadlines: z.string().describe('JSON string of overdue deadlines.'),
});
export type MonthlySummaryInput = z.infer<typeof MonthlySummaryInputSchema>;

const MonthlySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of deadlines for the current and upcoming months, with overdue items prioritized by AI based on real-world cost.'),
});
export type MonthlySummaryOutput = z.infer<typeof MonthlySummaryOutputSchema>;

export async function generateMonthlySummary(input: MonthlySummaryInput): Promise<MonthlySummaryOutput> {
  return monthlySummaryFlow(input);
}

const monthlySummaryPrompt = ai.definePrompt({
  name: 'monthlySummaryPrompt',
  input: {schema: MonthlySummaryInputSchema},
  output: {schema: MonthlySummaryOutputSchema},
  prompt: `You are an AI assistant that generates monthly summaries of deadlines for users.

Current month deadlines: {{{currentMonthDeadlines}}}
Next month deadlines: {{{nextMonthDeadlines}}}
Overdue deadlines: {{{overdueDeadlines}}}

Prioritize overdue deadlines based on the real-world cost of missing them (e.g., insurance/road tax over streaming subscriptions).

Generate a concise and informative monthly summary, including all deadlines for the current month, first days of next month, and AI-prioritized overdue items.
`,
});

const monthlySummaryFlow = ai.defineFlow(
  {
    name: 'monthlySummaryFlow',
    inputSchema: MonthlySummaryInputSchema,
    outputSchema: MonthlySummaryOutputSchema,
  },
  async input => {
    const {
      currentMonthDeadlines,
      nextMonthDeadlines,
      overdueDeadlines,
    } = input;

    if (!currentMonthDeadlines || !nextMonthDeadlines || !overdueDeadlines) {
      throw new Error('Missing deadlines data.');
    }

    try {
      JSON.parse(currentMonthDeadlines);
      JSON.parse(nextMonthDeadlines);
      JSON.parse(overdueDeadlines);
    } catch (e: any) {
      throw new Error('Invalid JSON format: ' + e.message);
    }

    const {output} = await monthlySummaryPrompt(input);
    return output!;
  }
);
