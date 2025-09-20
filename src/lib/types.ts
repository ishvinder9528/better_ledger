export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface FinancialRecord {
  id: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'invoice' | 'payment' | 'refund' | 'credit';
  description: string;
  aiInsight?: string;
  isKeyRecord?: boolean;
}
