'use server';
/**
 * @fileOverview Flow to analyze and summarize user's saving history.
 *
 * - summarizeSavings - Analyzes savings data and provides a summary and recommendation.
 * - SummarizeSavingsInput - The input type for the summarizeSavings function.
 * - SummarizeSavingsOutput - The return type for the summarizeSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSavingsInputSchema = z.object({
  savingsData: z.array(
    z.object({
      date: z.string().describe('The date of the savings entry (YYYY-MM-DD).'),
      amount: z.number().describe('The amount saved in USD.'),
      category: z.string().describe('The category of the savings entry.'),
    })
  ).describe('An array of savings data, including date, amount, and category.'),
});
export type SummarizeSavingsInput = z.infer<typeof SummarizeSavingsInputSchema>;

const SummarizeSavingsOutputSchema = z.object({
  summary: z.string().describe("A concise, one-to-two sentence summary of the user's key saving habits based on the data. Identify the top category."),
  recommendation: z.string().describe("A single, actionable recommendation to help the user improve their savings habits. The recommendation should be encouraging and simple."),
});
export type SummarizeSavingsOutput = z.infer<typeof SummarizeSavingsOutputSchema>;

export async function summarizeSavings(input: SummarizeSavingsInput): Promise<SummarizeSavingsOutput> {
  return summarizeSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSavingsPrompt',
  input: {schema: SummarizeSavingsInputSchema},
  output: {schema: SummarizeSavingsOutputSchema},
  prompt: `You are a friendly and encouraging financial assistant. Analyze the user's savings data to provide a short summary and one actionable tip.

Your tone should be positive and supportive.

Savings Data:
{{#each savingsData}}
- Date: {{date}}, Amount: {{amount}}, Category: {{category}}
{{/each}}

Based on this data, provide a 'summary' and a 'recommendation'.

Example:
- Summary: "Great job on your consistent savings! It looks like 'Lunch Money' is your biggest savings category, showing you're making smart daily choices."
- Recommendation: "Try setting a small, specific goal for this week, like saving an extra $5. Every little bit helps you build momentum!"`,
});

const summarizeSavingsFlow = ai.defineFlow(
  {
    name: 'summarizeSavingsFlow',
    inputSchema: SummarizeSavingsInputSchema,
    outputSchema: SummarizeSavingsOutputSchema,
  },
  async input => {
    if (input.savingsData.length === 0) {
      return {
        summary: "You haven't added any savings yet.",
        recommendation: "Start by adding your first saving entry to see your financial journey begin!",
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
