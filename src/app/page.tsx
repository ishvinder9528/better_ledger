"use client";

import { useState } from 'react';
import type { Customer, FinancialRecord } from '@/lib/types';
import { initialCustomers, initialRecords } from '@/lib/data';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import CustomerList from '@/components/app/customer-list';
import CustomerProfile from '@/components/app/customer-profile';
import { Package2 } from 'lucide-react';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [records, setRecords] = useState<FinancialRecord[]>(initialRecords);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id ?? null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerRecords = records.filter((r) => r.customerId === selectedCustomerId);

  const handleAddCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: `C${Date.now()}` };
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomerId(newCustomer.id);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setRecords((prev) => prev.filter((r) => r.customerId !== customerId));
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(customers[0]?.id ?? null);
    }
  };

  const handleAddRecord = (record: Omit<FinancialRecord, 'id'>) => {
    const newRecord = { ...record, id: `R${Date.now()}` };
    setRecords((prev) => [...prev, newRecord]);
  };

  const handleUpdateRecord = (updatedRecord: FinancialRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleSetRecords = (newRecords: FinancialRecord[]) => {
    const otherCustomerRecords = records.filter(r => r.customerId !== selectedCustomerId);
    setRecords([...otherCustomerRecords, ...newRecords]);
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <CustomerList
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={setSelectedCustomerId}
          onAddCustomer={handleAddCustomer}
        />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 flex flex-col h-screen">
          {selectedCustomer ? (
            <CustomerProfile
              key={selectedCustomer.id}
              customer={selectedCustomer}
              records={customerRecords}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddRecord={handleAddRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onSetRecords={handleSetRecords}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-center">
                <Package2 className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                  Welcome to LedgerEdge
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select a customer to view their records or add a new one to get started.
                </p>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
