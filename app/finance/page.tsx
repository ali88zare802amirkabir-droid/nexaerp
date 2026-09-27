"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock, Plus, Receipt, Wallet } from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat";
import { Modal } from "@/components/ui/modal";
import { ChartGate } from "@/components/charts/gate";
import { FinancialTrendChart } from "@/components/charts/trend";
import { CountBarChart } from "@/components/charts/bars";
import { INVOICE_STATUS_TONE } from "@/components/erp/meta";
import { InvoiceForm, type InvoiceFormValues } from "@/components/erp/invoice-form";
import { ExpenseForm, type ExpenseFormValues } from "@/components/erp/expense-form";
import { customerCompany } from "@/data/customers";
import type { ExpenseCategory, Invoice } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Rent: "#55a1ff",
  Software: "#35d3f2",
  Marketing: "#fb7185",
  Travel: "#fbbf24",
  Trainings: "#a78bfa",
  Operations: "#34d399",
};

type Tab = "invoices" | "expenses" | "reports";

export default function FinancePage() {
  const {
    invoices,
    expenses,
    customers,
    money,
    metrics,
    addInvoice,
    setInvoiceStatus,
    addExpense,
    pushToast,
  } = useApp();
  const [tab, setTab] = useState<Tab>("invoices");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const { financials } = metrics;

  const outstanding = useMemo(
    () => invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0),
    [invoices]
  );
  const overdue = useMemo(
    () => invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0),
    [invoices]
  );
  const paidTotal = useMemo(
    () => invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0),
    [invoices]
  );

  const sortedInvoices = useMemo(() => [...invoices].sort((a, b) => a.daysAgo - b.daysAgo), [invoices]);
  const sortedExpenses = useMemo(() => [...expenses].sort((a, b) => a.daysAgo - b.daysAgo), [expenses]);

  const categoryData = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category))];
    return cats.map((category) => ({
      label: category,
      value: expenses.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0),
      color: CATEGORY_COLORS[category],
    }));
  }, [expenses]);

  const createInvoice = (values: InvoiceFormValues) => {
    addInvoice({ ...values, monthOffset: 0, daysAgo: 0 });
    pushToast("Invoice created", {
      desc: `${customerCompany(values.customerId)} · ${money(values.amount)}`,
    });
    setInvoiceOpen(false);
  };

  const createExpense = (values: ExpenseFormValues) => {
    addExpense({ ...values, monthOffset: 0, daysAgo: 0 });
    pushToast("Expense recorded", { desc: `${values.title} · ${money(values.amount)}` });
    setExpenseOpen(false);
  };

  const cycle = (inv: Invoice) => {
    const next = inv.status === "Paid" ? "Pending" : "Paid";
    setInvoiceStatus(inv.id, next);
    pushToast("Invoice updated", { desc: `${inv.number} → ${next}` });
  };

  const markOverdue = (inv: Invoice) => {
    setInvoiceStatus(inv.id, "Overdue");
    pushToast("Invoice marked overdue", { desc: inv.number, variant: "danger" });
  };

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "invoices", label: `Invoices · ${invoices.length}` },
    { key: "expenses", label: `Expenses · ${expenses.length}` },
    { key: "reports", label: "Financial reports" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Finance"
        subtitle="Invoices, expenses and the company P&L"
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => setExpenseOpen(true)}>
              <Plus className="size-4" /> Add expense
            </Button>
            <Button size="sm" onClick={() => setInvoiceOpen(true)}>
              <Receipt className="size-4" /> New invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="size-4" />}
          label="Revenue · month"
          value={money(financials.monthlyRevenue)}
          tone="ok"
          hint="paid invoices"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Outstanding"
          value={money(outstanding)}
          tone="warn"
          hint="awaiting payment"
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="Overdue"
          value={money(overdue)}
          tone="danger"
          hint="needs follow-up"
        />
        <StatCard
          icon={<Receipt className="size-4" />}
          label="Expenses · month"
          value={money(financials.monthlyExpenses)}
          tone="accent"
          hint={`profit ${money(financials.monthlyProfit)}`}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-edge bg-surface p-1 sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-4 py-1.5 text-[12.5px] font-medium transition-colors sm:flex-none",
              tab === t.key ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invoices" && (
        <div className="card flex flex-col gap-3 p-4 sm:p-5">
          <div className="overflow-x-auto rounded-xl border border-edge">
            <table className="w-full min-w-[920px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Issued</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.slice(0, 20).map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/40 odd:bg-surface-2/25"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium tabular-nums text-ink">{i.number}</p>
                      <p className="max-w-56 truncate text-[11.5px] text-ink-3">{i.title}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{customerCompany(i.customerId)}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-ink">{money(i.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={INVOICE_STATUS_TONE[i.status]}>{i.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">{relAgoDays(i.daysAgo)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {i.status !== "Paid" && (
                          <Button size="sm" variant="soft" onClick={() => cycle(i)}>
                            Mark paid
                          </Button>
                        )}
                        {i.status === "Pending" && (
                          <Button size="sm" variant="danger" onClick={() => markOverdue(i)}>
                            Overdue
                          </Button>
                        )}
                        {i.status === "Paid" && (
                          <Button size="sm" variant="secondary" onClick={() => cycle(i)}>
                            Reopen
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11.5px] text-ink-3">
            Showing the 20 most recent invoices · {paidTotal > 0 ? `${money(paidTotal)} collected all-time` : ""}
          </p>
        </div>
      )}

      {tab === "expenses" && (
        <div className="card flex flex-col gap-3 p-4 sm:p-5">
          <div className="overflow-x-auto rounded-xl border border-edge">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                  <th className="px-4 py-3 font-semibold">Expense</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Recorded</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/40 odd:bg-surface-2/25"
                  >
                    <td className="px-4 py-3 font-medium text-ink">{e.title}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-ink-2">
                        <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS[e.category] }} />
                        {e.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">{relAgoDays(e.daysAgo)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                      {money(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Revenue vs expenses</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">Trailing 8 months · derived from invoices & expenses</p>
            <div className="mt-3">
              <ChartGate>
                <FinancialTrendChart data={financials.trend} />
              </ChartGate>
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Expenses by category</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">All recorded expenses</p>
            <div className="mt-3">
              <ChartGate>
                <CountBarChart data={categoryData} format={(v) => money(v)} defaultColor="#55a1ff" />
              </ChartGate>
            </div>
          </div>
        </div>
      )}

      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="New invoice" width="max-w-lg">
        <InvoiceForm customers={customers} onSubmit={createInvoice} />
      </Modal>
      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add expense" width="max-w-lg">
        <ExpenseForm onSubmit={createExpense} />
      </Modal>
    </div>
  );
}