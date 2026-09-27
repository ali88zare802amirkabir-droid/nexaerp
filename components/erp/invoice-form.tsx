"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { customerCompany } from "@/data/customers";
import type { Customer, InvoiceStatus } from "@/lib/types";

export interface InvoiceFormValues {
  customerId: string;
  title: string;
  amount: number;
  status: InvoiceStatus;
}

export function InvoiceForm({
  customers,
  onSubmit,
}: {
  customers: Customer[];
  onSubmit: (values: InvoiceFormValues) => void;
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(5000);
  const [status, setStatus] = useState<InvoiceStatus>("Pending");
  const [error, setError] = useState("");

  const num = (v: string, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const submit = () => {
    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    if (!title.trim()) {
      setError("Invoice title is required.");
      return;
    }
    if (num(String(amount)) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setError("");
    onSubmit({ customerId, title: title.trim(), amount: num(String(amount)), status });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Customer
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {customerCompany(c.id)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
            {(["Pending", "Paid", "Overdue"] as InvoiceStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2 sm:col-span-2">
          Title
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workstation refresh — phase 2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Amount ($)
          <TextInput
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(num(e.target.value))}
          />
        </label>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="mt-1 flex justify-end">
        <Button onClick={submit} size="sm">
          Create invoice
        </Button>
      </div>
    </div>
  );
}