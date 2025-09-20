"use client";

import { useState, useMemo, useTransition } from "react";
import type { FinancialRecord } from "@/lib/types";
import { getHighlightedRecords } from "@/app/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddRecordForm } from "./add-record-form";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, PlusCircle, Sparkles, Trash2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SortConfig = {
  key: keyof FinancialRecord;
  direction: "ascending" | "descending";
} | null;

type RecordsDataTableProps = {
  records: FinancialRecord[];
  customerId: string;
  onAddRecord: (record: Omit<FinancialRecord, "id">) => void;
  onUpdateRecord: (record: FinancialRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSetRecords: (records: FinancialRecord[]) => void;
};

export function RecordsDataTable({
  records: initialRecords,
  customerId,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onSetRecords,
}: RecordsDataTableProps) {
  const [filter, setFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isPending, startTransition] = useTransition();

  const handleHighlight = () => {
    startTransition(async () => {
      const highlighted = await getHighlightedRecords(initialRecords);
      onSetRecords(highlighted);
    });
  };

  const requestSort = (key: keyof FinancialRecord) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRecords = useMemo(() => {
    let sortableItems = [...initialRecords];
    if (filter) {
      sortableItems = sortableItems.filter((item) =>
        item.description.toLowerCase().includes(filter.toLowerCase()) ||
        item.type.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [initialRecords, filter, sortConfig]);

  const getSortIndicator = (key: keyof FinancialRecord) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    return isNegative ? `-${formatted}`: formatted;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <Input
          placeholder="Filter by description or type..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-full md:max-w-sm"
        />
        <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleHighlight} disabled={isPending || initialRecords.length === 0} variant="outline" size="sm" className="w-full md:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                {isPending ? "Analyzing..." : "AI Highlights"}
            </Button>
            <AddRecordForm customerId={customerId} onSave={onAddRecord}>
                <Button size="sm" className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                </Button>
            </AddRecordForm>
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('date')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">Date {getSortIndicator('date')}</div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead onClick={() => requestSort('type')} className="cursor-pointer hover:bg-muted/50 transition-colors hidden md:table-cell">
                    <div className="flex items-center">Type {getSortIndicator('type')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('amount')} className="text-right cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-end">Amount {getSortIndicator('amount')}</div>
                </TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredRecords.length > 0 ? (
                sortedAndFilteredRecords.map((record) => (
                  <TableRow key={record.id} className={cn(record.isKeyRecord && 'bg-primary/10 hover:bg-primary/20')}>
                    <TableCell className="w-[120px]">{record.date}</TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            {record.description}
                            {record.aiInsight && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-primary cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs text-sm">{record.aiInsight}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <div className="md:hidden mt-1">
                            <Badge variant={record.type === 'payment' || record.type === 'credit' ? 'secondary' : 'outline'}>
                                {record.type}
                            </Badge>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={record.type === 'payment' || record.type === 'credit' ? 'secondary' : 'outline'}>
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", record.amount > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-500')}>
                        {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AddRecordForm record={record} customerId={customerId} onSave={onUpdateRecord}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </AddRecordForm>
                          <DeleteConfirmationDialog onConfirm={() => onDeleteRecord(record.id)}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DeleteConfirmationDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
}
