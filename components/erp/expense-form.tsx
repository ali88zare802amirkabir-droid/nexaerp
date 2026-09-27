"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import type { ExpenseCategory } from "@/lib/types";

const CATEGORIES: ExpenseCategory[] = [
  "Operations",
  "Rent",
  "Software",
  "Marketing",
  "Trainings",
  "Travel",
];

export interface ExpenseFormValues {
  title: string;
  category: ExpenseCategory;
  amount: number;
}

export function ExpenseForm({
  onSubmit,
}: {
  onSubmit: (values: ExpenseFormValues) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Operations");
  const [amount, setAmount] = useState(1000);
  const [error, setError] = useState("");

  const num = (v: string, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const submit = () => {
    if (!title.trim()) {
      setError("Expense title is required.");
      return;
    }
    if (num(String(amount)) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    setError("");
    onSubmit({ title: title.trim(), category, amount: num(String(amount)) });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
        Title
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Team offsite — Berlin"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Category
          <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
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
          Add expense
        </Button>
      </div>
    </div>
  );
}