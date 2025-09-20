"use server";

import { highlightKeyRecords } from "@/ai/flows/highlight-key-records";
import { summarizeFinancialRecords } from "@/ai/flows/summarize-financial-records";
import type { Customer, FinancialRecord } from "@/lib/types";
import * as db from '@/lib/db';
import { revalidatePath } from "next/cache";

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
  return db.getCustomers();
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
  const newCustomer = db.addCustomer(customer);
  revalidatePath('/');
  return newCustomer;
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const updatedCustomer = db.updateCustomer(customer);
  revalidatePath('/');
  return updatedCustomer;
}

export async function deleteCustomer(id: string): Promise<{ id: string }> {
  const result = db.deleteCustomer(id);
  revalidatePath('/');
  return result;
}

// Record Actions
export async function getRecords(customerId: string): Promise<FinancialRecord[]> {
  return db.getRecords(customerId);
}

export async function addRecord(record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> {
  const newRecord = db.addRecord(record);
  revalidatePath('/');
  return newRecord;
}

export async function updateRecord(record: FinancialRecord): Promise<FinancialRecord> {
  const updatedRecord = db.updateRecord(record);
  revalidatePath('/');
  return updatedRecord;
}

export async function deleteRecord(id: string): Promise<{ id: string }> {
  const result = db.deleteRecord(id);
  revalidatePath('/');
  return result;
}


// AI Actions
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
