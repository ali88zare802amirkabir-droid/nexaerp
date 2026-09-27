"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { DEPARTMENTS } from "@/data/reports";
import type { Department, Employee, EmployeeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: EmployeeStatus[] = ["Active", "On Leave", "Contract", "Probation"];

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

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  department: Department;
  role: string;
  status: EmployeeStatus;
  performance: number;
  avatarColor: string;
}

export function EmployeeForm({
  initial,
  onSubmit,
}: {
  initial?: Employee;
  onSubmit: (values: EmployeeFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [department, setDepartment] = useState<Department>(initial?.department ?? "Engineering");
  const [role, setRole] = useState(initial?.role ?? "");
  const [status, setStatus] = useState<EmployeeStatus>(initial?.status ?? "Probation");
  const [performance, setPerformance] = useState(initial?.performance ?? 75);
  const [avatarColor, setAvatarColor] = useState(initial?.avatarColor ?? PALETTE[0]);
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !email.trim() || !role.trim()) {
      setError("Name, email and role are required.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "—",
      department,
      role: role.trim(),
      status,
      performance: Math.min(100, Math.max(0, Math.round(performance))),
      avatarColor,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Full name
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lane" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Email
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jordan@nexa.io" type="email" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Phone
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 010-0000" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Role
          <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="Backend Engineer" />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Department
          <Select value={department} onChange={(e) => setDepartment(e.target.value as Department)}>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
        Performance score · {performance}
        <input
          type="range"
          min={40}
          max={100}
          value={performance}
          onChange={(e) => setPerformance(Number(e.target.value))}
          className="accent-[#55a1ff]"
        />
      </label>
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
          {initial ? "Save changes" : "Add employee"}
        </Button>
      </div>
    </div>
  );
}