"use client";

import { useEffect, useState } from 'react';
import type { Customer, FinancialRecord } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import CustomerList from '@/components/app/customer-list';
import CustomerProfile from '@/components/app/customer-profile';
import { Package2 } from 'lucide-react';
import { 
  addCustomer, 
  deleteCustomer, 
  getCustomers, 
  getRecords, 
  updateCustomer,
  addRecord,
  updateRecord,
  deleteRecord
} from './actions';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
      if (fetchedCustomers.length > 0) {
        const customerId = selectedCustomerId || fetchedCustomers[0].id;
        setSelectedCustomerId(customerId);
        const fetchedRecords = await getRecords(customerId);
        setRecords(fetchedRecords);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const refreshRecords = async (customerId: string | null) => {
    if (customerId) {
      const newRecords = await getRecords(customerId);
      setRecords(newRecords);
    } else {
      setRecords([]);
    }
  }

  const handleSelectCustomer = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    await refreshRecords(customerId);
  };

  const handleAddCustomer = async (customer: Omit<Customer, 'id'>) => {
    const newCustomer = await addCustomer(customer);
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    setSelectedCustomerId(newCustomer.id);
    setRecords([]);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const result = await updateCustomer(updatedCustomer);
    if(result) {
      setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    await deleteCustomer(customerId);
    const newCustomers = customers.filter((c) => c.id !== customerId);
    setCustomers(newCustomers);
    
    if (selectedCustomerId === customerId) {
      const newSelectedId = newCustomers[0]?.id ?? null;
      setSelectedCustomerId(newSelectedId);
      await refreshRecords(newSelectedId);
    }
  };

  const handleAddRecord = async (record: Omit<FinancialRecord, 'id'>) => {
    await addRecord(record);
    if (selectedCustomerId) {
      await refreshRecords(selectedCustomerId);
    }
  };

  const handleUpdateRecord = async (updatedRecord: FinancialRecord) => {
    await updateRecord(updatedRecord);
     if (selectedCustomerId) {
      await refreshRecords(selectedCustomerId);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    await deleteRecord(recordId);
     if (selectedCustomerId) {
      await refreshRecords(selectedCustomerId);
    }
  };

  const handleSetRecords = (newRecords: FinancialRecord[]) => {
    // This function is now used to update the state with AI-highlighted records
    setRecords(newRecords);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <CustomerList
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomer={handleAddCustomer}
        />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 flex flex-col h-screen">
          {selectedCustomer ? (
            <CustomerProfile
              key={selectedCustomer.id}
              customer={selectedCustomer}
              records={records}
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
