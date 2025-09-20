'use server';

/**
 * @fileOverview Summarizes financial records for a given customer using AI.
 *
 * - summarizeFinancialRecords - A function that summarizes financial records.
 * - SummarizeFinancialRecordsInput - The input type for the summarizeFinancialRecords function.
 * - SummarizeFinancialRecordsOutput - The return type for the summarizeFinancialRecords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFinancialRecordsInputSchema = z.object({
  customerId: z.string().describe('The ID of the customer.'),
  financialRecords: z.string().describe('The financial records for the customer in JSON format.'),
});
export type SummarizeFinancialRecordsInput = z.infer<typeof SummarizeFinancialRecordsInputSchema>;

const SummarizeFinancialRecordsOutputSchema = z.object({
  summary: z.string().describe('A summary of the financial records.'),
});
export type SummarizeFinancialRecordsOutput = z.infer<typeof SummarizeFinancialRecordsOutputSchema>;

export async function summarizeFinancialRecords(
  input: SummarizeFinancialRecordsInput
): Promise<SummarizeFinancialRecordsOutput> {
  return summarizeFinancialRecordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFinancialRecordsPrompt',
  input: {schema: SummarizeFinancialRecordsInputSchema},
  output: {schema: SummarizeFinancialRecordsOutputSchema},
  prompt: `You are an AI assistant that summarizes financial records for a given customer.

  Summarize the following financial records for customer ID {{{customerId}}}:

  {{{financialRecords}}}
  `,
});

const summarizeFinancialRecordsFlow = ai.defineFlow(
  {
    name: 'summarizeFinancialRecordsFlow',
    inputSchema: SummarizeFinancialRecordsInputSchema,
    outputSchema: SummarizeFinancialRecordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
