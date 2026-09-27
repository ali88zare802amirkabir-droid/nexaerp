"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { PRODUCT_CATEGORIES, WAREHOUSES } from "@/data/reports";
import type { Product } from "@/lib/types";

export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  warehouse: string;
  price: number;
  cost: number;
}

export function ProductForm({
  initial,
  onSubmit,
}: {
  initial?: Product;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 0);
  const [unit, setUnit] = useState(initial?.unit ?? "units");
  const [reorderLevel, setReorderLevel] = useState(initial?.reorderLevel ?? 10);
  const [warehouse, setWarehouse] = useState(initial?.warehouse ?? WAREHOUSES[0]);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [cost, setCost] = useState(initial?.cost ?? 0);
  const [error, setError] = useState("");

  const num = (v: string, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const submit = () => {
    if (!name.trim() || !sku.trim()) {
      setError("Product name and SKU are required.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      quantity: Math.max(0, Math.round(num(String(quantity)))),
      unit: unit.trim() || "units",
      reorderLevel: Math.max(0, Math.round(num(String(reorderLevel)))),
      warehouse,
      price: Math.max(0, num(String(price))),
      cost: Math.max(0, num(String(cost))),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Product name
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="NexMouse MX3 Wireless" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          SKU
          <TextInput value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PNTR-MX3" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Category
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Warehouse
          <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
            {WAREHOUSES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Quantity
          <TextInput
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(num(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Unit
          <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="units" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Reorder level
          <TextInput
            type="number"
            min={0}
            value={reorderLevel}
            onChange={(e) => setReorderLevel(num(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Sell price ($)
          <TextInput
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(num(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Unit cost ($)
          <TextInput
            type="number"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(num(e.target.value))}
          />
        </label>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="mt-1 flex justify-end">
        <Button onClick={submit} size="sm">
          {initial ? "Save changes" : "Add product"}
        </Button>
      </div>
    </div>
  );
}