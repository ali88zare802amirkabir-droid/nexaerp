"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search, SearchX } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select, TextInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { CUSTOMER_STATUS_TONE } from "@/components/erp/meta";
import { CustomerForm, type CustomerFormValues } from "@/components/erp/customer-form";
import { relAgoDays } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type SortKey = "name" | "revenue" | "orders" | "recent";

export default function CustomersPage() {
  const { customers, orders, money, addCustomer } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const enriched = useMemo(
    () =>
      customers.map((c) => {
        const mine = orders.filter((o) => o.customerId === c.id);
        const revenue = mine
          .filter((o) => o.status !== "Cancelled")
          .reduce((s, o) => s + o.total, 0);
        return { ...c, orderCount: mine.length, revenue };
      }),
    [customers, orders]
  );

  const regions = useMemo(() => [...new Set(customers.map((c) => c.region))], [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = enriched.filter(
      (c) =>
        (status === "All" || c.status === status) &&
        (region === "All" || c.region === region) &&
        (!q || `${c.name} ${c.company} ${c.email} ${c.region}`.toLowerCase().includes(q))
    );
    return [...rows].sort((a, b) => {
      switch (sort) {
        case "revenue":
          return b.revenue - a.revenue;
        case "orders":
          return b.orderCount - a.orderCount;
        case "recent":
          return a.sinceDaysAgo - b.sinceDaysAgo;
        default:
          return a.company.localeCompare(b.company);
      }
    });
  }, [enriched, query, status, region, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setStatus("All");
    setRegion("All");
    setSort("name");
    setPage(1);
  };

  const create = (values: CustomerFormValues) => {
    addCustomer(values);
    setModalOpen(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} accounts · ${money(enriched.reduce((s, c) => s + c.revenue, 0))} lifetime order revenue`}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> Add customer
          </Button>
        }
      />

      <div className="card flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <TextInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, company, email…"
              className="pl-9"
              aria-label="Search customers"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="lg:w-36"
            >
              {["All", "Active", "New", "VIP", "At Risk"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by region"
              className="lg:w-40"
            >
              <option value="All">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort customers"
              className="col-span-2 sm:col-span-1 lg:w-44"
            >
              <option value="name">Company A–Z</option>
              <option value="revenue">Highest revenue</option>
              <option value="orders">Most orders</option>
              <option value="recent">Newest first</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[940px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Customer since</th>
                <th className="px-4 py-3 font-semibold" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/customers/${c.id}`)}
                  className="cursor-pointer border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/50 odd:bg-surface-2/25"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} color={c.avatarColor} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{c.name}</span>
                        <span className="block truncate text-[11.5px] text-ink-3">{c.company}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-2">{c.email}</p>
                    <p className="text-[11.5px] tabular-nums text-ink-3">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-2">{c.orderCount}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-ink">{money(c.revenue)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={CUSTOMER_STATUS_TONE[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-2">{relAgoDays(c.sinceDaysAgo)}</td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="ml-auto size-4 text-ink-3" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No customers match these filters"
            desc="Try a different search term or region."
            action={
              <Button size="sm" variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="flex items-center justify-between text-[12px] text-ink-3">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="secondary" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <span className={cn("px-2 tabular-nums")}>
                {safePage} / {pages}
              </span>
              <Button size="sm" variant="secondary" disabled={safePage >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add customer" width="max-w-xl">
        <CustomerForm onSubmit={create} />
      </Modal>
    </div>
  );
}