'use server';

/**
 * @fileOverview An AI agent for highlighting key financial records based on customer history or unusual activity.
 *
 * - highlightKeyRecords - A function that takes financial records as input and returns records with AI-highlighted insights.
 * - HighlightKeyRecordsInput - The input type for the highlightKeyRecords function.
 * - HighlightKeyRecordsOutput - The return type for the highlightKeyRecords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialRecordSchema = z.object({
  id: z.string().describe('The unique identifier of the financial record.'),
  customerId: z.string().describe('The ID of the customer associated with the record.'),
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  amount: z.number().describe('The transaction amount.'),
  type: z.string().describe('The type of transaction (e.g., invoice, payment, refund).'),
  description: z.string().optional().describe('A brief description of the transaction.'),
});

export type FinancialRecord = z.infer<typeof FinancialRecordSchema>;

const HighlightedFinancialRecordSchema = FinancialRecordSchema.extend({
  aiInsight: z.string().optional().describe('AI-generated insight highlighting unusual activity or potential issues.'),
  isKeyRecord: z.boolean().describe('Whether this record is flagged as a key record of interest.'),
});

export type HighlightedFinancialRecord = z.infer<typeof HighlightedFinancialRecordSchema>;

const HighlightKeyRecordsInputSchema = z.object({
  records: z.array(FinancialRecordSchema).describe('An array of financial records to analyze.'),
});

export type HighlightKeyRecordsInput = z.infer<typeof HighlightKeyRecordsInputSchema>;

const HighlightKeyRecordsOutputSchema = z.object({
  highlightedRecords: z.array(HighlightedFinancialRecordSchema).describe('The financial records with AI-generated insights and key record flags.'),
});

export type HighlightKeyRecordsOutput = z.infer<typeof HighlightKeyRecordsOutputSchema>;

export async function highlightKeyRecords(input: HighlightKeyRecordsInput): Promise<HighlightKeyRecordsOutput> {
  return highlightKeyRecordsFlow(input);
}

const highlightRecordsPrompt = ai.definePrompt({
  name: 'highlightRecordsPrompt',
  input: {schema: HighlightKeyRecordsInputSchema},
  output: {schema: HighlightKeyRecordsOutputSchema},
  prompt: `You are an AI assistant specializing in financial analysis. Analyze the provided financial records and highlight any records of interest based on customer history, unusual activity, or other relevant factors.

For each record, determine if it should be flagged as a key record and provide a concise AI-generated insight explaining why.

Financial Records:
{{#each records}}
  - ID: {{id}}, Customer ID: {{customerId}}, Date: {{date}}, Amount: {{amount}}, Type: {{type}}, Description: {{description}}
{{/each}}

Output the records with added 'aiInsight' and 'isKeyRecord' fields.

Format the output as a JSON array of HighlightedFinancialRecord objects.
`,
});

const highlightKeyRecordsFlow = ai.defineFlow(
  {
    name: 'highlightKeyRecordsFlow',
    inputSchema: HighlightKeyRecordsInputSchema,
    outputSchema: HighlightKeyRecordsOutputSchema,
  },
  async input => {
    const {output} = await highlightRecordsPrompt(input);
    return output!;
  }
);
