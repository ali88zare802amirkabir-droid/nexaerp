"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, FolderKanban, Plus, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays, relInDays } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select, TextInput } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { StatCard } from "@/components/ui/stat";
import { PROJECT_STATUS_TONE } from "@/components/erp/meta";
import { ProjectForm, type ProjectFormValues } from "@/components/erp/project-form";
import { employeeName } from "@/data/employees";
import type { ProjectStatus } from "@/lib/types";

export default function ProjectsPage() {
  const { projects, employees, tasks, money, addProject, pushToast } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);

  const active = projects.filter((p) => p.status !== "Completed").length;
  const atRisk = projects.filter((p) => p.status === "At Risk").length;
  const budget = projects.reduce((s, p) => s + p.budget, 0);
  const spent = projects.reduce((s, p) => s + p.spent, 0);
  const openTasks = tasks.filter((t) => t.status !== "Done").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "All" || p.status === status) &&
        (!q || `${p.name} ${p.code} ${employeeName(p.leadId)}`.toLowerCase().includes(q))
    );
  }, [projects, query, status]);

  const create = (values: ProjectFormValues) => {
    addProject(values);
    pushToast("Project created", { desc: `${values.name}` });
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Projects"
        subtitle={`${active} active · ${openTasks} open tasks across the portfolio`}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Active projects"
          value={`${active}`}
          tone="accent"
          hint={`${atRisk} at risk`}
        />
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Total budget"
          value={money(budget)}
          tone="cyan"
          hint={`${Math.round((spent / budget) * 100)}% utilized`}
        />
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Spent to date"
          value={money(spent)}
          tone="warn"
          hint="across all projects"
        />
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Completed"
          value={`${projects.filter((p) => p.status === "Completed").length}`}
          tone="ok"
          hint="delivered"
        />
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search project, code, lead…"
              className="pl-9"
              aria-label="Search projects"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus | "All")}
            aria-label="Filter by status"
            className="sm:w-44"
          >
            {["All", "On Track", "At Risk", "On Hold", "Completed"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[960px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const lead = employees.find((e) => e.id === p.leadId);
                const team = employees.filter((e) => p.teamIds.includes(e.id));
                return (
                  <tr
                    key={p.id}
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="cursor-pointer border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/50 odd:bg-surface-2/25"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-[11.5px] tabular-nums text-ink-3">{p.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lead && <Avatar name={lead.name} color={lead.avatarColor} size="sm" />}
                        <span className="whitespace-nowrap text-ink-2">{lead?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-1.5">
                        {team.slice(0, 5).map((m) => (
                          <Avatar key={m.id} name={m.name} color={m.avatarColor} size="sm" className="ring-2 ring-surface" />
                        ))}
                        {team.length > 5 && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-[10px] font-semibold text-ink-2 ring-2 ring-surface">
                            +{team.length - 5}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-3">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.progress}%`,
                              background: p.status === "At Risk" ? "#fbbf24" : p.status === "Completed" ? "#34d399" : "#55a1ff",
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-semibold tabular-nums text-ink">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PROJECT_STATUS_TONE[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">
                      {p.status === "Completed"
                        ? `delivered ${relAgoDays(Math.abs(p.dueOffset))}`
                        : relInDays(p.dueOffset)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="ml-auto size-4 text-ink-3" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New project" width="max-w-xl">
        <ProjectForm employees={employees} onSubmit={create} />
      </Modal>
    </div>
  );
}