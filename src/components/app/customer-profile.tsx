"use client";

import type { Customer, FinancialRecord } from "@/lib/types";
import { useState, useTransition } from "react";
import { getSummary } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Sparkles, Trash2, User } from "lucide-react";
import { RecordsDataTable } from "./records-data-table";
import { AddCustomerForm } from "./add-customer-form";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerProfileProps = {
  customer: Customer;
  records: FinancialRecord[];
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddRecord: (record: Omit<FinancialRecord, "id">) => void;
  onUpdateRecord: (record: FinancialRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSetRecords: (records: FinancialRecord[]) => void;
};

export default function CustomerProfile({
  customer,
  records,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onSetRecords,
}: CustomerProfileProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const result = await getSummary(customer.id, records);
      setSummary(result);
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-card border-b p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
                <User className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3"/>{customer.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3"/>{customer.phone}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleGenerateSummary} disabled={isPending} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                {isPending ? "Generating..." : "Generate Summary"}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <AddCustomerForm customer={customer} onSave={onUpdateCustomer}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit Customer</DropdownMenuItem>
                    </AddCustomerForm>
                    <DeleteConfirmationDialog onConfirm={() => onDeleteCustomer(customer.id)}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                        </DropdownMenuItem>
                    </DeleteConfirmationDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {isPending && !summary && <Skeleton className="h-[125px] w-full rounded-lg" />}
        {summary && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-accent"/>
                        AI-Powered Summary
                    </CardTitle>
                    <CardDescription>An AI-generated overview of this customer's financial activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80">{summary}</p>
                </CardContent>
            </Card>
        )}

        <RecordsDataTable
            records={records}
            onAddRecord={onAddRecord}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecord={onDeleteRecord}
            onSetRecords={onSetRecords}
            customerId={customer.id}
        />
      </div>
    </div>
  );
}
