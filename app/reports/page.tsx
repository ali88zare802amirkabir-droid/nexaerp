"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ChartGate } from "@/components/charts/gate";
import { FinancialTrendChart, SimpleTrendChart } from "@/components/charts/trend";
import { CountBarChart, StatusDonut } from "@/components/charts/bars";
import { PRODUCT_STATUS_TONE } from "@/components/erp/meta";
import { depPerformance } from "@/lib/metrics";

export default function ReportsPage() {
  const { metrics, money, employees, products } = useApp();
  const { financials, inventory, sales } = metrics;

  const totalRevenue = financials.trend.reduce((s, p) => s + p.revenue, 0);
  const totalExpenses = financials.trend.reduce((s, p) => s + p.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const perf = depPerformance(employees);
  const companyAvg = Math.round(
    employees.reduce((s, e) => s + e.performance, 0) / Math.max(1, employees.length)
  );

  const orderBars = sales.orderTrend.map((p) => ({
    label: p.month,
    value: p.revenue,
    color: "#55a1ff",
  }));

  const restocked = [...products].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo).slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Reports"
        subtitle="Every number below is derived from live workspace data"
      />

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-ink">Revenue analytics</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">Trailing 8 months · paid invoices vs expenses</p>
          </div>
          <Link href="/finance" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
            Finance <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-surface-2/50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-3">Revenue</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink sm:text-xl">
              {money(totalRevenue)}
            </p>
          </div>
          <div className="rounded-xl bg-surface-2/50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-3">Expenses</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ink sm:text-xl">
              {money(totalExpenses)}
            </p>
          </div>
          <div className="rounded-xl bg-surface-2/50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-ink-3">Profit</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-ok sm:text-xl">
              {money(totalProfit)}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ChartGate>
            <FinancialTrendChart data={financials.trend} />
          </ChartGate>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-ink">Employee performance</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                Average score by department · company avg {companyAvg}
              </p>
            </div>
            <Link href="/employees" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Employees <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-3">
            <ChartGate>
              <CountBarChart
                data={perf.map((d, i) => ({
                  label: d.department.slice(0, 6),
                  value: d.avg,
                  color: i === 0 ? "#34d399" : "#55a1ff",
                }))}
                format={(v) => `${v} pts`}
              />
            </ChartGate>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-ink">Sales report</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                {money(sales.revenue30)} · 30d · {(sales.conversion * 100).toFixed(1)}% conversion
              </p>
            </div>
            <Link href="/sales" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Sales <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-3">
            <ChartGate>
              <SimpleTrendChart data={sales.orderTrend.map((p) => ({ month: p.month, value: p.revenue }))} color="#fbbf24" />
            </ChartGate>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-ink">Inventory movement</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                {inventory.totalUnits.toLocaleString("en-US")} units · {money(inventory.stockValue)} stock value
              </p>
            </div>
            <Link href="/inventory" className="flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Inventory <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ChartGate>
            <StatusDonut
              data={inventory.statusData}
              centerValue={`${inventory.lowStock + inventory.outOfStock}`}
              centerLabel="need attention"
            />
          </ChartGate>
          <div className="mt-3">
            <ChartGate>
              <CountBarChart data={orderBars} format={(v) => money(v)} defaultColor="#35d3f2" height={180} />
            </ChartGate>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Recently updated stock</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">Latest warehouse movements</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {restocked.map((p) => (
              <Link
                key={p.id}
                href="/inventory"
                className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3.5 py-2.5 transition-colors hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">{p.name}</span>
                  <span className="block text-[11.5px] tabular-nums text-ink-3">
                    {p.sku} · {p.quantity} {p.unit} · updated {relAgoDays(p.updatedDaysAgo)}
                  </span>
                </span>
                <Badge tone={PRODUCT_STATUS_TONE[p.status]}>{p.status}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}