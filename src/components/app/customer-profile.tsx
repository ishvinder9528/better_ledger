"use client";

import type { Customer, FinancialRecord } from "@/lib/types";
import { useState, useTransition, useMemo } from "react";
import { getSummary } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, MoreVertical, Phone, Sparkles, Trash2, User, ArrowDownCircle, ArrowUpCircle, CircleDollarSign, FileText } from "lucide-react";
import { RecordsDataTable } from "./records-data-table";
import { AddCustomerForm } from "./add-customer-form";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

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

const StatCard = ({ title, value, icon, className }: { title: string; value: number; icon: React.ReactNode, className?: string }) => {
    const formattedValue = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", className)}>{formattedValue}</div>
            </CardContent>
        </Card>
    );
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

  const stats = useMemo(() => {
    return records.reduce((acc, record) => {
      acc.balance += record.amount;
      switch (record.type) {
        case 'invoice':
          acc.totalInvoiced += record.amount;
          break;
        case 'payment':
          acc.totalPaid += Math.abs(record.amount);
          break;
        case 'refund':
          acc.totalRefunded += record.amount;
          break;
        case 'credit':
           acc.totalCredited += Math.abs(record.amount);
          break;
      }
      return acc;
    }, {
      totalInvoiced: 0,
      totalPaid: 0,
      totalRefunded: 0,
      totalCredited: 0,
      balance: 0,
    });
  }, [records]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-card border-b p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="p-2.5 bg-muted rounded-full">
                <User className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3"/>{customer.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3 w-3"/>{customer.phone}</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Button onClick={handleGenerateSummary} disabled={isPending || records.length === 0} variant="outline">
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
                    <Separator />
                    <DeleteConfirmationDialog onConfirm={() => onDeleteCustomer(customer.id)}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
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
                        <Sparkles className="text-primary"/>
                        AI-Powered Summary
                    </CardTitle>
                    <CardDescription>An AI-generated overview of this customer's financial activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80">{summary}</p>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard title="Total Invoiced" value={stats.totalInvoiced} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Paid" value={stats.totalPaid} icon={<ArrowDownCircle className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Refunded" value={stats.totalRefunded} icon={<ArrowUpCircle className="h-4 w-4 text-muted-foreground" />} />
            <StatCard title="Total Credited" value={stats.totalCredited} icon={<ArrowDownCircle className="h-4 w-4 text-muted-foreground" />} />
            <StatCard 
                title="Balance" 
                value={stats.balance} 
                icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />} 
                className={cn('sm:col-span-2 lg:col-span-1', stats.balance <= 0 ? 'text-green-600 dark:text-green-500' : 'text-destructive')}
            />
        </div>

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
