"use server";

import { highlightKeyRecords } from "@/ai/flows/highlight-key-records";
import { summarizeFinancialRecords } from "@/ai/flows/summarize-financial-records";
import type { FinancialRecord } from "@/lib/types";

export async function getSummary(customerId: string, records: FinancialRecord[]): Promise<string> {
  try {
    const result = await summarizeFinancialRecords({
      customerId,
      financialRecords: JSON.stringify(records, null, 2),
    });
    return result.summary;
  } catch (error) {
    console.error("Error getting summary:", error);
    return "Could not generate summary at this time.";
  }
}

export async function getHighlightedRecords(records: FinancialRecord[]): Promise<FinancialRecord[]> {
  try {
    // The AI flow expects certain fields, let's ensure we are only sending those.
    const recordsForAI = records.map(({ id, customerId, date, amount, type, description }) => ({
        id, customerId, date, amount, type, description
    }));

    const result = await highlightKeyRecords({ records: recordsForAI });
    
    // Merge AI insights back into original records array
    const highlightedMap = new Map(result.highlightedRecords.map(r => [r.id, { aiInsight: r.aiInsight, isKeyRecord: r.isKeyRecord }]));

    return records.map(record => ({
      ...record,
      ...highlightedMap.get(record.id),
    }));

  } catch (error) {
    console.error("Error highlighting records:", error);
    // Return original records if AI fails
    return records.map(r => ({ ...r, aiInsight: "Error generating insight." }));
  }
}
