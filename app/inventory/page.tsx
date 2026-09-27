"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, TextInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { StatCard } from "@/components/ui/stat";
import { PRODUCT_STATUS_TONE } from "@/components/erp/meta";
import { ProductForm, type ProductFormValues } from "@/components/erp/product-form";
import { PRODUCT_CATEGORIES } from "@/data/reports";
import type { Product, ProductStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type SortKey = "name" | "qty-asc" | "value-desc" | "updated";

export default function InventoryPage() {
  const { products, money, addProduct, updateProduct, deleteProduct, restockProduct, pushToast } =
    useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<SortKey>("name");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = useMemo(() => {
    const units = products.reduce((s, p) => s + p.quantity, 0);
    const value = products.reduce((s, p) => s + p.quantity * p.price, 0);
    const low = products.filter((p) => p.status === "Low Stock").length;
    const out = products.filter((p) => p.status === "Out of Stock").length;
    return { units, value, low, out };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (status === "All" || p.status === status) &&
        (!q || `${p.name} ${p.sku} ${p.warehouse}`.toLowerCase().includes(q))
    );
    return [...rows].sort((a, b) => {
      switch (sort) {
        case "qty-asc":
          return a.quantity - b.quantity;
        case "value-desc":
          return b.quantity * b.price - a.quantity * a.price;
        case "updated":
          return a.updatedDaysAgo - b.updatedDaysAgo;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, query, category, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setStatus("All");
    setSort("name");
    setPage(1);
  };

  const create = (values: ProductFormValues) => {
    addProduct(values);
    pushToast("Product added", { desc: `${values.name} · ${values.sku}` });
    setAddOpen(false);
    setPage(1);
  };

  const save = (values: ProductFormValues) => {
    if (!editing) return;
    updateProduct(editing.id, { ...values, updatedDaysAgo: 0 });
    pushToast("Product updated", { desc: values.name });
    setEditing(null);
    setConfirmDelete(false);
  };

  const restock = (p: Product) => {
    const addQty = Math.max(p.reorderLevel * 2 - p.quantity, p.reorderLevel);
    restockProduct(p.id, addQty);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} SKUs · ${stats.units.toLocaleString("en-US")} units in stock`}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add product
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Boxes className="size-4" />}
          label="Products tracked"
          value={`${products.length}`}
          tone="accent"
          hint={`${PRODUCT_CATEGORIES.length} categories`}
        />
        <StatCard
          icon={<PackagePlus className="size-4" />}
          label="Units on hand"
          value={stats.units.toLocaleString("en-US")}
          tone="cyan"
          hint="across 5 warehouses"
        />
        <StatCard
          icon={<Boxes className="size-4" />}
          label="Stock value"
          value={money(stats.value)}
          tone="ok"
          hint="at sell price"
        />
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="Needs attention"
          value={`${stats.low + stats.out}`}
          tone="warn"
          hint={`${stats.low} low · ${stats.out} out`}
        />
      </div>

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
              placeholder="Search product, SKU, warehouse…"
              className="pl-9"
              aria-label="Search inventory"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex">
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="lg:w-40"
            >
              <option value="All">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ProductStatus | "All");
                setPage(1);
              }}
              aria-label="Filter by status"
              className="lg:w-36"
            >
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="col-span-2 sm:col-span-1 lg:w-44"
            >
              <option value="name">Name A–Z</option>
              <option value="qty-asc">Lowest stock</option>
              <option value="value-desc">Highest value</option>
              <option value="updated">Recently updated</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[980px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Warehouse</th>
                <th className="px-4 py-3 font-semibold">Last update</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => {
                const fill = p.reorderLevel > 0 ? Math.min(100, (p.quantity / (p.reorderLevel * 3)) * 100) : 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/40 odd:bg-surface-2/25"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-[11.5px] tabular-nums text-ink-3">
                        {p.sku} · {money(p.price)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">{p.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${fill}%`,
                              background: p.status === "Out of Stock" ? "#fb7185" : p.status === "Low Stock" ? "#fbbf24" : "#34d399",
                            }}
                          />
                        </div>
                        <span className="text-[12.5px] font-semibold tabular-nums text-ink">
                          {p.quantity} {p.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PRODUCT_STATUS_TONE[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">{p.warehouse}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">{relAgoDays(p.updatedDaysAgo)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {p.status !== "In Stock" && (
                          <Button size="sm" variant="soft" onClick={() => restock(p)}>
                            <PackagePlus className="size-3.5" /> Restock
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => { setEditing(p); setConfirmDelete(false); }} aria-label={`Edit ${p.name}`}>
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No products match these filters"
            desc="Try a different search term or category."
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add product" width="max-w-xl">
        <ProductForm onSubmit={create} />
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => {
          setEditing(null);
          setConfirmDelete(false);
        }}
        title={editing ? `Edit · ${editing.name}` : "Edit product"}
        width="max-w-xl"
      >
        {editing && (
          <div className="flex flex-col gap-3">
            <ProductForm key={editing.id} initial={editing} onSubmit={save} />
            <div className="flex items-center justify-between border-t border-edge pt-3">
              <p className="text-[12px] text-ink-3">Danger zone</p>
              {confirmDelete ? (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      deleteProduct(editing.id);
                      pushToast("Product removed", { desc: editing.name, variant: "danger" });
                      setEditing(null);
                      setConfirmDelete(false);
                    }}
                  >
                    Confirm delete
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}