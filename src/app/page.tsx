"use client";

import { useEffect, useState } from 'react';
import type { Customer, FinancialRecord } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddCustomerForm } from '@/components/app/add-customer-form';

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
    setCustomers(updatedCustomers.sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedCustomerId(newCustomer.id);
    setRecords([]);
  };

  const handleUpdateCustomer = async (updatedCustomer: Customer) => {
    const result = await updateCustomer(updatedCustomer);
    if(result) {
      setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)).sort((a, b) => a.name.localeCompare(b.name)));
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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
            <Package2 className="h-10 w-10 text-primary" />
            <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
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
              customer={customer}
              records={records}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddRecord={handleAddRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onSetRecords={handleSetRecords}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-4">
                <div className="flex items-center md:hidden mb-4">
                  <SidebarTrigger />
                </div>
                <div className="text-center">
                    <Package2 className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                    Welcome to LedgerEdge
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    It looks like you don&apos;t have any customers yet. Add one to get started and manage their financial records.
                    </p>
                    <AddCustomerForm onSave={handleAddCustomer}>
                       <Button className="mt-6">Add Your First Customer</Button>
                    </AddCustomerForm>
                </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
