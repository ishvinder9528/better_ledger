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
import { Package2, PlusCircle, User } from "lucide-react";
import { AddCustomerForm } from "./add-customer-form";

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
          <Package2 className="h-6 w-6 text-accent" />
          <h1 className="text-lg font-semibold tracking-tight">LedgerEdge</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
