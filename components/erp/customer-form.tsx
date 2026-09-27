"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import type { Customer, CustomerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: CustomerStatus[] = ["Active", "New", "VIP", "At Risk"];

const REGIONS = ["EMEA", "APAC", "North America", "MENA", "LATAM"];

const PALETTE = [
  "#55a1ff",
  "#35d3f2",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#38bdf8",
  "#f472b6",
  "#4ade80",
  "#f97316",
];

export interface CustomerFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  region: string;
  avatarColor: string;
}

export function CustomerForm({
  initial,
  onSubmit,
}: {
  initial?: Customer;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<CustomerStatus>(initial?.status ?? "New");
  const [region, setRegion] = useState(initial?.region ?? REGIONS[0]);
  const [avatarColor, setAvatarColor] = useState(initial?.avatarColor ?? PALETTE[0]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !company.trim() || !email.trim()) {
      setError("Contact name, company and email are required.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim() || "—",
      status,
      region,
      avatarColor,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Contact name
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Daniel Moore" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Company
          <TextInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Northwind Systems" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Email
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="daniel@northwind.io" type="email" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Phone
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (415) 555-0141" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Region
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-ink-2">Avatar color</span>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAvatarColor(c)}
              aria-label={`Avatar color ${c}`}
              className={cn(
                "size-7 rounded-full transition-transform",
                avatarColor === c && "ring-2 ring-offset-2 ring-offset-surface ring-white/70"
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="mt-1 flex justify-end">
        <Button onClick={submit} size="sm">
          {initial ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </div>
  );
}