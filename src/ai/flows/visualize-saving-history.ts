'use server';
/**
 * @fileOverview Flow to visualize user's saving history.
 *
 * - visualizeSavingHistory - A function that visualizes the saving history.
 * - VisualizeSavingHistoryInput - The input type for the visualizeSavingHistory function.
 * - VisualizeSavingHistoryOutput - The return type for the visualizeSavingHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeSavingHistoryInputSchema = z.object({
  savingsData: z.array(
    z.object({
      date: z.string().describe('The date of the savings entry (YYYY-MM-DD).'),
      amount: z.number().describe('The amount saved in USD.'),
    })
  ).describe('An array of savings data, including date and amount.'),
});
export type VisualizeSavingHistoryInput = z.infer<typeof VisualizeSavingHistoryInputSchema>;

const VisualizeSavingHistoryOutputSchema = z.object({
  visualization: z.string().describe('A description of how to visualize the savings history, for example "a line chart showing the amount saved over time".'),
});
export type VisualizeSavingHistoryOutput = z.infer<typeof VisualizeSavingHistoryOutputSchema>;

export async function visualizeSavingHistory(input: VisualizeSavingHistoryInput): Promise<VisualizeSavingHistoryOutput> {
  return visualizeSavingHistoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizeSavingHistoryPrompt',
  input: {schema: VisualizeSavingHistoryInputSchema},
  output: {schema: VisualizeSavingHistoryOutputSchema},
  prompt: `You are an expert in data visualization. Given the following savings data, describe how to best visualize the data to understand savings trends over time. Be concise, and focus on describing the type of chart and the axes.

Savings Data:
{{#each savingsData}}
- Date: {{date}}, Amount: {{amount}}
{{/each}}

Respond in the format of one sentence. For example: "A line chart showing the amount saved over time."`,
});

const visualizeSavingHistoryFlow = ai.defineFlow(
  {
    name: 'visualizeSavingHistoryFlow',
    inputSchema: VisualizeSavingHistoryInputSchema,
    outputSchema: VisualizeSavingHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
