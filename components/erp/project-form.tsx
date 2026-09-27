"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { Employee, Project, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUSES: ProjectStatus[] = ["On Track", "At Risk", "On Hold", "Completed"];

export interface ProjectFormValues {
  name: string;
  leadId: string;
  teamIds: string[];
  progress: number;
  status: ProjectStatus;
  dueOffset: number;
  budget: number;
}

export function ProjectForm({
  employees,
  initial,
  onSubmit,
}: {
  employees: Employee[];
  initial?: Project;
  onSubmit: (values: ProjectFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [leadId, setLeadId] = useState(initial?.leadId ?? employees[0]?.id ?? "");
  const [teamIds, setTeamIds] = useState<string[]>(initial?.teamIds ?? []);
  const [progress, setProgress] = useState(initial?.progress ?? 10);
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? "On Track");
  const [dueOffset, setDueOffset] = useState(initial?.dueOffset ?? 30);
  const [budget, setBudget] = useState(initial?.budget ?? 50000);
  const [error, setError] = useState("");

  const toggleMember = (id: string) => {
    setTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!leadId) {
      setError("Select a project lead.");
      return;
    }
    if (teamIds.length === 0) {
      setError("Add at least one team member.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      leadId,
      teamIds,
      progress: Math.min(100, Math.max(0, Math.round(progress))),
      status,
      dueOffset: Math.round(dueOffset),
      budget: Math.max(0, Math.round(budget)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2 sm:col-span-2">
          Project name
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Warehouse Automation Rollout"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Project lead
          <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.role}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
          Progress · {progress}%
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="accent-[#55a1ff]"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
            Due in (days)
            <TextInput
              type="number"
              value={dueOffset}
              onChange={(e) => setDueOffset(Number(e.target.value) || 0)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
            Budget ($)
            <TextInput
              type="number"
              min={0}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-ink-2">
          Team · {teamIds.length} selected
        </span>
        <div className="grid max-h-44 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-edge p-1.5 sm:grid-cols-2">
          {employees.map((e) => {
            const on = teamIds.includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleMember(e.id)}
                aria-pressed={on}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  on ? "bg-accent-soft" : "hover:bg-surface-2/60"
                )}
              >
                <Avatar name={e.name} color={e.avatarColor} size="xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-ink">{e.name}</span>
                  <span className="block truncate text-[10.5px] text-ink-3">{e.department}</span>
                </span>
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    on ? "border-accent bg-accent text-white" : "border-edge-strong text-transparent"
                  )}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <div className="mt-1 flex justify-end">
        <Button onClick={submit} size="sm">
          {initial ? "Save changes" : "Create project"}
        </Button>
      </div>
    </div>
  );
}