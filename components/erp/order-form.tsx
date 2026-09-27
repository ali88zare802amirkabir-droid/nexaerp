"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { customerCompany } from "@/data/customers";
import type { Customer, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

export interface OrderFormValues {
  customerId: string;
  itemsCount: number;
  total: number;
  status: OrderStatus;
}

export function OrderForm({
  customers,
  onSubmit,
}: {
  customers: Customer[];
  onSubmit: (values: OrderFormValues) => void;
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [itemsCount, setItemsCount] = useState(1);
  const [total, setTotal] = useState(1000);
  const [status, setStatus] = useState<OrderStatus>("Processing");
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
    if (num(String(total)) <= 0 || num(String(itemsCount)) <= 0) {
      setError("Items and total must be greater than zero.");
      return;
    }
    setError("");
    onSubmit({
      customerId,
      itemsCount: Math.round(num(String(itemsCount))),
      total: num(String(total)),
      status,
    });
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
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Items
          <TextInput
            type="number"
            min={1}
            value={itemsCount}
            onChange={(e) => setItemsCount(num(e.target.value, 1))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Order total ($)
          <TextInput
            type="number"
            min={0}
            step="0.01"
            value={total}
            onChange={(e) => setTotal(num(e.target.value))}
          />
        </label>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="mt-1 flex justify-end">
        <Button onClick={submit} size="sm">
          Create order
        </Button>
      </div>
    </div>
  );
}