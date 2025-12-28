'use server';
/**
 * @fileOverview Flow to visualize user's saving history by category.
 *
 * - visualizeSavingCategories - A function that visualizes the saving history by category.
 * - VisualizeSavingCategoriesInput - The input type for the visualizeSavingCategories function.
 * - VisualizeSavingCategoriesOutput - The return type for the visualizeSavingCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeSavingCategoriesInputSchema = z.object({
  savingsData: z.array(
    z.object({
      category: z.string().describe('The category of the savings entry.'),
      amount: z.number().describe('The amount saved in USD.'),
    })
  ).describe('An array of savings data, including category and amount.'),
});
export type VisualizeSavingCategoriesInput = z.infer<typeof VisualizeSavingCategoriesInputSchema>;

const VisualizeSavingCategoriesOutputSchema = z.object({
  visualization: z.string().describe('A description of how to visualize the savings categories, for example "a 3D pie chart showing the breakdown of savings by category".'),
});
export type VisualizeSavingCategoriesOutput = z.infer<typeof VisualizeSavingCategoriesOutputSchema>;

export async function visualizeSavingCategories(input: VisualizeSavingCategoriesInput): Promise<VisualizeSavingCategoriesOutput> {
  return visualizeSavingCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizeSavingCategoriesPrompt',
  input: {schema: VisualizeSavingCategoriesInputSchema},
  output: {schema: VisualizeSavingCategoriesOutputSchema},
  prompt: `You are an expert in data visualization. Given the following savings data, describe how to best visualize the data to understand the breakdown of savings by category. Always suggest a 3D visualization. Be concise, and focus on describing the type of chart.

Savings Data by Category:
{{#each savingsData}}
- Category: {{category}}, Amount: {{amount}}
{{/each}}

Respond in the format of one sentence. For example: "A 3D pie chart showing the breakdown of savings by category."`,
});

const visualizeSavingCategoriesFlow = ai.defineFlow(
  {
    name: 'visualizeSavingCategoriesFlow',
    inputSchema: VisualizeSavingCategoriesInputSchema,
    outputSchema: VisualizeSavingCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
