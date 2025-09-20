"use client";

import type { Customer } from "@/lib/types";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Package2, PlusCircle, User, Users } from "lucide-react";
import { AddCustomerForm } from "./add-customer-form";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  onAddCustomer: (customer: Omit<Customer, "id">) => void;
};

export default function CustomerList({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
}: CustomerListProps) {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Package2 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">LedgerEdge</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Customers</h2>
            </div>
            <Badge variant="secondary">{customers.length}</Badge>
        </div>
        <ScrollArea className="flex-1">
          <SidebarMenu>
            {customers.map((customer) => (
              <SidebarMenuItem key={customer.id}>
                <SidebarMenuButton
                  onClick={() => onSelectCustomer(customer.id)}
                  isActive={customer.id === selectedCustomerId}
                  className="justify-start"
                >
                  <User />
                  <span>{customer.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <AddCustomerForm onSave={onAddCustomer}>
          <Button variant="ghost" className="w-full justify-start">
            <PlusCircle />
            <span>Add Customer</span>
          </Button>
        </AddCustomerForm>
      </SidebarFooter>
    </>
  );
}
