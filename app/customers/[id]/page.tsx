"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ContactRound,
  Mail,
  MapPin,
  NotebookPen,
  Phone,
  Receipt,
  Send,
  ShoppingCart,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextArea } from "@/components/ui/input";
import { CUSTOMER_STATUS_TONE, ORDER_STATUS_TONE } from "@/components/erp/meta";
import { cn } from "@/lib/utils";

type Tab = "overview" | "orders" | "notes" | "activity";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { customers, employees, orders, invoices, money, notes, addNote, buildTimelineFor } =
    useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState("");

  const customer = customers.find((c) => c.id === params.id);

  const mine = useMemo(
    () => (customer ? orders.filter((o) => o.customerId === customer.id) : []),
    [customer, orders]
  );
  const myInvoices = useMemo(
    () => (customer ? invoices.filter((i) => i.customerId === customer.id) : []),
    [customer, invoices]
  );
  const myNotes = useMemo(
    () => (customer ? notes.filter((n) => n.customerId === customer.id) : []),
    [customer, notes]
  );
  const timeline = useMemo(
    () => (customer ? buildTimelineFor(customer.id) : []),
    [customer, buildTimelineFor]
  );

  if (!customer) {
    return (
      <div className="flex flex-col gap-5">
        <EmptyState
          icon={<ContactRound className="size-5" />}
          title="Customer not found"
          desc="This account may have been removed."
          action={
            <Link
              href="/customers"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-edge-strong px-3 text-[12.5px] font-medium text-ink hover:bg-surface-2"
            >
              <ArrowLeft className="size-3.5" /> Back to customers
            </Link>
          }
        />
      </div>
    );
  }

  const revenue = mine
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: `Orders · ${mine.length}` },
    { key: "notes", label: `Notes · ${myNotes.length}` },
    { key: "activity", label: "Activity" },
  ];

  const sendNote = () => {
    if (!draft.trim()) return;
    addNote(customer.id, draft);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/customers"
        className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Customers
      </Link>

      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <Avatar name={customer.name} color={customer.avatarColor} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              {customer.company}
            </h1>
            <Badge tone={CUSTOMER_STATUS_TONE[customer.status]}>{customer.status}</Badge>
          </div>
          <p className="mt-1 text-[13px] text-ink-3">
            {customer.name} · {customer.region} · customer since {relAgoDays(customer.sinceDaysAgo)}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-4 text-[12.5px] text-ink-2">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="size-3.5 text-ink-3" />
              {mine.length} orders · <strong className="tabular-nums text-ink">{money(revenue)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Receipt className="size-3.5 text-ink-3" />
              {myInvoices.length} invoices
            </span>
            <span className="flex items-center gap-1.5">
              <NotebookPen className="size-3.5 text-ink-3" />
              {myNotes.length} notes
            </span>
          </div>
        </div>
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

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Contact details</h2>
            <dl className="mt-3 flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center gap-2.5">
                <ContactRound className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{customer.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-ink-3" />
                <span className="text-ink-2">{customer.region}</span>
              </div>
            </dl>
          </div>
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Recent orders</h2>
            <div className="mt-3 flex flex-col gap-1.5">
              {mine.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium text-ink">{o.number}</span>
                    <span className="block text-[11px] text-ink-3">
                      {o.itemsCount} items · {relAgoDays(o.daysAgo)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] font-semibold tabular-nums text-ink">{money(o.total)}</span>
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>{o.status}</Badge>
                  </span>
                </div>
              ))}
              {mine.length === 0 && (
                <p className="text-[12.5px] text-ink-3">No orders yet for this account.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="card flex flex-col gap-1.5 p-4 sm:p-5">
          {mine.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2/50 px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink">{o.number}</span>
                <span className="block text-[11.5px] text-ink-3">
                  {o.itemsCount} items · placed {relAgoDays(o.daysAgo)}
                </span>
              </span>
              <span className="flex items-center gap-2.5">
                <span className="text-[13px] font-semibold tabular-nums text-ink">{money(o.total)}</span>
                <Badge tone={ORDER_STATUS_TONE[o.status]}>{o.status}</Badge>
              </span>
            </div>
          ))}
          {mine.length === 0 && (
            <p className="px-1 py-6 text-center text-[12.5px] text-ink-3">No orders yet for this account.</p>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="card flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex gap-2">
            <TextArea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Write a note about ${customer.company}…`}
              className="min-h-16"
              aria-label="New note"
            />
            <Button size="sm" onClick={sendNote} disabled={!draft.trim()} className="shrink-0 self-start">
              <Send className="size-3.5" /> Add
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {myNotes.map((n) => {
              const author = employees.find((e) => e.id === n.authorId);
              return (
                <div key={n.id} className="rounded-xl bg-surface-2/50 px-3.5 py-3">
                  <p className="text-[13px] text-ink">{n.body}</p>
                  <p className="mt-1.5 text-[11px] text-ink-3">
                    {author?.name ?? "Team"} · {relAgoDays(n.daysAgo)}
                  </p>
                </div>
              );
            })}
            {myNotes.length === 0 && (
              <p className="px-1 py-6 text-center text-[12.5px] text-ink-3">No notes yet — add the first one above.</p>
            )}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Timeline</h2>
          <div className="mt-4 flex flex-col">
            {timeline.map((item) => (
              <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-ink">{item.title}</p>
                  <p className="truncate text-[11.5px] text-ink-3">{item.desc}</p>
                </div>
                <span className="shrink-0 text-[10.5px] text-ink-3">{relAgoDays(item.daysAgo)}</span>
              </div>
            ))}
            {timeline.length === 0 && (
              <p className="text-[12.5px] text-ink-3">No activity recorded for this account.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}