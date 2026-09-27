"use client";

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Boxes,
  CheckCircle2,
  ContactRound,
  FolderKanban,
  ListTodo,
  Plus,
  Receipt,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relInDays, relMins } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ChartGate } from "@/components/charts/gate";
import { FinancialTrendChart } from "@/components/charts/trend";
import { StatusDonut } from "@/components/charts/bars";
import type { ActivityKind } from "@/lib/types";

const ACTIVITY_META: Record<ActivityKind, { icon: LucideIcon; color: string }> = {
  employee: { icon: UserRound, color: "#35d3f2" },
  invoice: { icon: Banknote, color: "#34d399" },
  inventory: { icon: Boxes, color: "#55a1ff" },
  project: { icon: FolderKanban, color: "#fbbf24" },
  task: { icon: ListTodo, color: "#fbbf24" },
  customer: { icon: ContactRound, color: "#fb7185" },
  finance: { icon: Wallet, color: "#34d399" },
};

export default function OverviewPage() {
  const { metrics, money, activities, invoices, tasks, products, projects, settings } = useApp();
  const { financials, inventory, sales } = metrics;

  const trend = financials.trend;
  const prev = trend[trend.length - 2];
  const mom = prev.revenue > 0 ? ((financials.monthlyRevenue - prev.revenue) / prev.revenue) * 100 : 0;
  const momLabel = `${mom >= 0 ? "+" : ""}${mom.toFixed(1)}% vs ${prev.month}`;

  const pendingInvoices = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue");
  const deadlines = tasks
    .filter((t) => t.status !== "Done" && t.dueOffset >= 0 && t.dueOffset <= 7)
    .sort((a, b) => a.dueOffset - b.dueOffset);
  const myTasks = tasks.filter((t) => t.assigneeId === "e-01" && t.status !== "Done").slice(0, 4);
  const attention = products.filter((p) => p.status !== "In Stock").slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Company overview"
        subtitle={`${settings.companyName} · live operations at a glance`}
        actions={
          <>
            <Link
              href="/employees"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-edge-strong px-3.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <Plus className="size-3.5" />
              New hire
            </Link>
            <Link
              href="/finance"
              className="brand-gradient inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Receipt className="size-3.5" />
              New invoice
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          icon={<Banknote className="size-4" />}
          label="Monthly revenue"
          value={money(financials.monthlyRevenue)}
          delta={momLabel}
          tone="accent"
          hint="paid invoices"
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="Expenses"
          value={money(financials.monthlyExpenses)}
          tone="warn"
          hint="this month"
        />
        <StatCard
          icon={<Users className="size-4" />}
          label="Employees"
          value={`${metrics.employeesTotal}`}
          tone="cyan"
          hint={`${metrics.employeesActive} active · ${metrics.employeesLeave} on leave`}
        />
        <StatCard
          icon={<Boxes className="size-4" />}
          label="Inventory items"
          value={`${inventory.totalItems}`}
          tone="ok"
          hint={`${inventory.lowStock} low · ${inventory.outOfStock} out`}
        />
        <StatCard
          icon={<FolderKanban className="size-4" />}
          label="Active projects"
          value={`${metrics.projects.projects.active}`}
          tone="accent"
          hint={`${metrics.projects.projects.onTrack} on track · ${metrics.projects.projects.atRisk} at risk`}
        />
        <StatCard
          icon={<ListTodo className="size-4" />}
          label="Pending tasks"
          value={`${metrics.projects.projects.openTotal}`}
          tone="warn"
          hint={`${metrics.projects.projects.dueThisWeek} due this week`}
        />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Financial overview</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Profit this month · {money(financials.monthlyProfit)} · {sales.ordersCount} orders in sales pipeline
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11.5px] text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-warn" /> Expenses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan" /> Profit
            </span>
          </div>
        </div>
        <div className="mt-3">
          <ChartGate>
            <FinancialTrendChart data={trend} height={250} />
          </ChartGate>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">Company activity</h2>
            <Link href="/reports" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Reports <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col">
            {activities.slice(0, 8).map((a) => {
              const meta = ACTIVITY_META[a.kind];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="flex gap-3 pb-4 last:pb-0">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${meta.color}1a`, color: meta.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{a.title}</p>
                    <p className="truncate text-[11.5px] text-ink-3">{a.desc}</p>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-ink-3">{relMins(a.minsAgo)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-semibold text-ink">Inventory status</h2>
            <Link href="/inventory" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Inventory <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ChartGate>
            <StatusDonut
              data={inventory.statusData}
              centerValue={`${inventory.totalItems}`}
              centerLabel="SKUs tracked"
            />
          </ChartGate>
          <div className="mt-3 flex flex-col gap-2 border-t border-edge pt-3">
            {attention.map((p) => (
              <Link
                key={p.id}
                href="/inventory"
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2/60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-ink">{p.name}</span>
                  <span className="block text-[11px] text-ink-3">{p.sku} · {p.warehouse}</span>
                </span>
                <Badge tone={p.status === "Low Stock" ? "warn" : "danger"}>
                  {p.quantity} left
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        <div className="card flex flex-col gap-4 p-4 sm:p-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[15px] font-semibold text-ink">Pending approvals</h2>
              <Link href="/finance" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
                Finance <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {pendingInvoices.slice(0, 3).map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium text-ink">{i.number}</span>
                    <span className="block truncate text-[11px] text-ink-3">{i.title}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-semibold tabular-nums text-ink">{money(i.amount)}</span>
                </div>
              ))}
              {pendingInvoices.length === 0 && (
                <p className="flex items-center gap-2 px-1 py-2 text-[12px] text-ink-3">
                  <CheckCircle2 className="size-4 text-ok" /> Nothing awaiting approval.
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Upcoming deadlines</h2>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {deadlines.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2">
                  <span className="min-w-0 truncate text-[12.5px] font-medium text-ink">{t.title}</span>
                  <span className="shrink-0 text-[11px] text-ink-3">{relInDays(t.dueOffset)}</span>
                </div>
              ))}
              {deadlines.length === 0 && (
                <p className="flex items-center gap-2 px-1 py-2 text-[12px] text-ink-3">
                  <CheckCircle2 className="size-4 text-ok" /> No deadlines this week.
                </p>
              )}
            </div>
          </div>
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Assigned to you</h2>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {myTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                return (
                  <Link
                    key={t.id}
                    href={project ? `/projects/${project.id}` : "/projects"}
                    className="flex items-center gap-2.5 rounded-xl px-1 py-1 transition-colors hover:bg-surface-2/60"
                  >
                    <Avatar name={project?.name ?? "Task"} color="#55a1ff" size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{t.title}</span>
                      <span className="block truncate text-[11px] text-ink-3">{project?.code}</span>
                    </span>
                    <Badge tone={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warn" : "neutral"}>
                      {t.priority}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}