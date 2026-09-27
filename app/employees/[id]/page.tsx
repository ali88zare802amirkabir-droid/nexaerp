"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ChartGate } from "@/components/charts/gate";
import { SimpleTrendChart } from "@/components/charts/trend";
import { DEPT_COLOR, EMPLOYEE_STATUS_TONE, TASK_STATUS_TONE } from "@/components/erp/meta";
import { EmployeeForm, type EmployeeFormValues } from "@/components/erp/employee-form";
import { tenureLabel } from "@/lib/utils";
import { MONTH_LABELS, MONTH_OFFSETS } from "@/data/reports";
import { employeeActivity, performanceRating } from "@/lib/metrics";
import { cn } from "@/lib/utils";

type Tab = "overview" | "activity" | "performance";

function productivitySeries(id: string, base: number): Array<{ month: string; value: number }> {
  const seed = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  return [...MONTH_OFFSETS].reverse().map((off) => {
    const x = Math.sin(seed * 31 + off * 17) * 10000;
    const rand = x - Math.floor(x);
    const value = Math.max(40, Math.min(100, Math.round(base + (rand - 0.5) * 12)));
    return { month: MONTH_LABELS[off], value };
  });
}

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    employees,
    tasks,
    projects,
    updateTaskStatus,
    updateEmployee,
    deleteEmployee,
    pushToast,
  } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const employee = employees.find((e) => e.id === params.id);

  const series = useMemo(
    () => (employee ? productivitySeries(employee.id, employee.performance) : []),
    [employee]
  );

  if (!employee) {
    return (
      <div className="flex flex-col gap-5">
        <EmptyState
          icon={<UserRound className="size-5" />}
          title="Employee not found"
          desc="This profile may have been removed."
          action={
            <Link
              href="/employees"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-edge-strong px-3 text-[12.5px] font-medium text-ink hover:bg-surface-2"
            >
              <ArrowLeft className="size-3.5" /> Back to employees
            </Link>
          }
        />
      </div>
    );
  }

  const manager = employees.find((e) => e.id === employee.managerId);
  const reports = employees.filter((e) => e.managerId === employee.id);
  const assigned = tasks.filter((t) => t.assigneeId === employee.id);
  const timeline = employeeActivity(employee.id, tasks, projects);
  const rating = performanceRating(employee.performance);

  const save = (values: EmployeeFormValues) => {
    updateEmployee(employee.id, values);
    pushToast("Profile updated", { desc: employee.name });
    setEditOpen(false);
  };

  const remove = () => {
    deleteEmployee(employee.id);
    pushToast("Employee removed", { desc: employee.name, variant: "danger" });
    router.push("/employees");
  };

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "activity", label: "Activity" },
    { key: "performance", label: "Performance" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/employees"
        className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Employees
      </Link>

      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <Avatar name={employee.name} color={employee.avatarColor} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              {employee.name}
            </h1>
            <Badge tone={EMPLOYEE_STATUS_TONE[employee.status]}>{employee.status}</Badge>
            <Badge tone={employee.performance >= 90 ? "ok" : employee.performance >= 78 ? "accent" : "warn"}>
              {rating} · {employee.performance}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-ink-3">
            <span className="font-medium text-ink-2">{employee.role}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: DEPT_COLOR[employee.department] }} />
              {employee.department}
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{tenureLabel(employee.joinedDaysAgo)} tenure</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {confirmDelete ? (
            <>
              <Button size="sm" variant="danger" onClick={remove}>
                Confirm delete
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-edge bg-surface p-1 sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-1.5 text-[12.5px] font-medium transition-colors sm:flex-none",
              tab === t.key ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Contact & role</h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Briefcase className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">
                  {employee.role} · {employee.department}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CalendarDays className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">
                  Joined {relAgoDays(employee.joinedDaysAgo)} · reports to{" "}
                  {manager ? manager.name : "—"}
                </span>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Done this month</p>
                <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
                  {employee.tasksDoneMonth}
                </p>
              </div>
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Open tasks</p>
                <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
                  {employee.tasksOpen}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card p-4 sm:p-5">
              <h2 className="font-display text-[15px] font-semibold text-ink">Assigned tasks</h2>
              <div className="mt-3 flex flex-col gap-1.5">
                {assigned.length === 0 && (
                  <p className="text-[12.5px] text-ink-3">No tasks assigned right now.</p>
                )}
                {assigned.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-xl bg-surface-2/50 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink">
                      {t.title}
                    </span>
                    <Badge tone={TASK_STATUS_TONE[t.status]}>{t.status}</Badge>
                    {t.status !== "Done" && (
                      <Button size="sm" variant="soft" onClick={() => updateTaskStatus(t.id, "Done")}>
                        Mark done
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4 sm:p-5">
              <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
                <Users className="size-4 text-ink-3" /> Direct reports
              </h2>
              <div className="mt-3 flex flex-col gap-1.5">
                {reports.length === 0 && (
                  <p className="text-[12.5px] text-ink-3">Nobody reports to {employee.name.split(" ")[0]} yet.</p>
                )}
                {reports.map((r) => (
                  <Link
                    key={r.id}
                    href={`/employees/${r.id}`}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-2/60"
                  >
                    <Avatar name={r.name} color={r.avatarColor} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{r.name}</span>
                      <span className="block truncate text-[11px] text-ink-3">{r.role}</span>
                    </span>
                    <Badge tone={EMPLOYEE_STATUS_TONE[r.status]}>{r.status}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Recent activity</h2>
          <div className="mt-4 flex flex-col">
            {timeline.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
                  <TrendingUp className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-ink">
                    {item.title} · <span className="font-normal text-ink-2">{item.desc}</span>
                  </p>
                </div>
                <span className="shrink-0 text-[10.5px] text-ink-3">{relAgoDays(item.daysAgo)}</span>
              </div>
            ))}
            {timeline.length === 0 && (
              <p className="text-[12.5px] text-ink-3">No recorded activity for this employee.</p>
            )}
          </div>
        </div>
      )}

      {tab === "performance" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-[15px] font-semibold text-ink">Productivity trend</h2>
                <p className="mt-0.5 text-[12px] text-ink-3">Monthly performance score · trailing 8 months</p>
              </div>
              <Badge tone="ok">
                <CheckCircle2 className="size-3" /> {rating}
              </Badge>
            </div>
            <div className="mt-3">
              <ChartGate>
                <SimpleTrendChart data={series} color="#35d3f2" format={(v) => `${v} pts`} />
              </ChartGate>
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Output summary</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Score</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                  {employee.performance}
                </p>
              </div>
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Completed</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                  {employee.tasksDoneMonth}
                </p>
              </div>
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Open</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                  {assigned.filter((t) => t.status !== "Done").length}
                </p>
              </div>
              <div className="rounded-xl bg-surface-2/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-ink-3">Projects</p>
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
                  {projects.filter((p) => p.teamIds.includes(employee.id)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit employee" width="max-w-xl">
        <EmployeeForm initial={employee} onSubmit={save} />
      </Modal>
    </div>
  );
}