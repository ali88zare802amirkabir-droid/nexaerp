"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Receipt, ShoppingCart, Target, TrendingUp } from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ChartGate } from "@/components/charts/gate";
import { SimpleTrendChart } from "@/components/charts/trend";
import { ORDER_STATUS_TONE } from "@/components/erp/meta";
import { OrderForm, type OrderFormValues } from "@/components/erp/order-form";
import { customerCompany, customerName } from "@/data/customers";
import type { OrderStatus } from "@/lib/types";

export default function SalesPage() {
  const {
    orders,
    customers,
    money,
    metrics,
    addOrder,
    updateOrderStatus,
    pushToast,
  } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const { sales } = metrics;

  const trend = useMemo(
    () => sales.orderTrend.map((p) => ({ month: p.month, value: p.revenue })),
    [sales]
  );
  const recent = useMemo(
    () => [...orders].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 10),
    [orders]
  );
  const maxTop = Math.max(...sales.topCustomers.map((c) => c.revenue), 1);

  const create = (values: OrderFormValues) => {
    addOrder({ ...values, monthOffset: 0, daysAgo: 0 });
    pushToast("Order created", { desc: `${customerCompany(values.customerId)} · ${money(values.total)}` });
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Sales"
        subtitle="Orders, conversion and top accounts from one pipeline"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> New order
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Receipt className="size-4" />}
          label="Revenue · 30 days"
          value={money(sales.revenue30)}
          tone="accent"
          hint={`${sales.ordersCount} orders placed`}
        />
        <StatCard
          icon={<ShoppingCart className="size-4" />}
          label="Orders · month"
          value={`${sales.ordersCount}`}
          tone="cyan"
          hint="last 30 days"
        />
        <StatCard
          icon={<TrendingUp className="size-4" />}
          label="Avg order value"
          value={money(sales.aov)}
          tone="ok"
          hint="per non-cancelled order"
        />
        <StatCard
          icon={<Target className="size-4" />}
          label="Conversion rate"
          value={`${(sales.conversion * 100).toFixed(1)}%`}
          tone="accent"
          hint="non-cancelled share"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Order revenue trend</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">Non-cancelled orders · trailing 8 months</p>
          <div className="mt-3">
            <ChartGate>
              <SimpleTrendChart data={trend} color="#55a1ff" />
            </ChartGate>
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Top customers</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">By lifetime order revenue</p>
          <div className="mt-4 flex flex-col gap-3">
            {sales.topCustomers.map((c, i) => (
              <Link key={c.id} href={`/customers/${c.id}`} className="group">
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="min-w-0">
                    <span className="font-medium text-ink group-hover:underline">
                      #{i + 1} {c.company}
                    </span>
                    <span className="block truncate text-[11px] text-ink-3">{c.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink">{money(c.revenue)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, (c.revenue / maxTop) * 100)}%`,
                      background: i === 0 ? "#34d399" : i < 3 ? "#55a1ff" : "#38bdf8",
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold text-ink">Recent orders</h2>
        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
                <th className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/40 odd:bg-surface-2/25"
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-ink">{o.number}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink-2">{customerCompany(o.customerId)}</p>
                    <p className="text-[11.5px] text-ink-3">{customerName(o.customerId)}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-2">{o.itemsCount}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-ink">{money(o.total)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-2">{relAgoDays(o.daysAgo)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Badge tone={ORDER_STATUS_TONE[o.status]}>{o.status}</Badge>
                      <Select
                        value={o.status}
                        onChange={(e) => {
                          const next = e.target.value as OrderStatus;
                          updateOrderStatus(o.id, next);
                          pushToast("Order updated", { desc: `${o.number} → ${next}` });
                        }}
                        aria-label={`Update status of ${o.number}`}
                        className="w-32 !py-1.5 text-[12px]"
                      >
                        {(["Processing", "Shipped", "Delivered", "Cancelled"] as OrderStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create order" width="max-w-lg">
        <OrderForm customers={customers} onSubmit={create} />
      </Modal>
    </div>
  );
}