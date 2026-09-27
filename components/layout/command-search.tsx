"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import type { LucideIcon } from "lucide-react";

interface ResultRow {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  color: string;
  keyword: string;
}

export function CommandSearch() {
  const {
    searchOpen,
    setSearchOpen,
    employees,
    products,
    customers,
    invoices,
    projects,
    money,
    notifications,
    setMobileNavOpen,
  } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<ResultRow[]>(() => {
    const q = query.trim().toLowerCase();
    const rows: ResultRow[] = [];
    const push = (r: ResultRow) => {
      if (!q || r.keyword.includes(q)) rows.push(r);
    };
    for (const e of employees) {
      push({
        id: e.id,
        group: "Employees",
        title: e.name,
        subtitle: `${e.role} · ${e.department}`,
        href: `/employees/${e.id}`,
        icon: Search,
        color: e.avatarColor,
        keyword: `${e.name} ${e.role} ${e.department} ${e.email}`.toLowerCase(),
      });
    }
    for (const p of products) {
      push({
        id: p.id,
        group: "Inventory",
        title: p.name,
        subtitle: `${p.sku} · ${p.quantity} ${p.unit} · ${p.status}`,
        href: "/inventory",
        icon: Search,
        color: "#35d3f2",
        keyword: `${p.name} ${p.sku} ${p.category} ${p.warehouse} ${p.status}`.toLowerCase(),
      });
    }
    for (const c of customers) {
      push({
        id: c.id,
        group: "Customers",
        title: c.name,
        subtitle: `${c.company} · ${c.status}`,
        href: `/customers/${c.id}`,
        icon: Search,
        color: c.avatarColor,
        keyword: `${c.name} ${c.company} ${c.status} ${c.email}`.toLowerCase(),
      });
    }
    for (const i of invoices) {
      push({
        id: i.id,
        group: "Invoices",
        title: i.number,
        subtitle: `${i.title} · ${money(i.amount)} · ${i.status}`,
        href: "/finance",
        icon: Search,
        color: "#34d399",
        keyword: `${i.number} ${i.title} ${i.status} ${money(i.amount)}`.toLowerCase(),
      });
    }
    for (const p of projects) {
      push({
        id: p.id,
        group: "Projects",
        title: p.name,
        subtitle: `${p.code} · ${p.status} · ${p.progress}%`,
        href: `/projects/${p.id}`,
        icon: Search,
        color: "#55a1ff",
        keyword: `${p.name} ${p.code} ${p.status}`.toLowerCase(),
      });
    }
    return rows;
  }, [query, employees, products, customers, invoices, projects, money]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => {
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      } else if (e.key === "/" && !typing && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, searchOpen]);

  if (!searchOpen) return null;

  const go = (row: ResultRow) => {
    setSearchOpen(false);
    setMobileNavOpen(false);
    router.push(row.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] sm:p-6">
      <div className="animate-fade-in fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="card animate-rise relative w-full max-w-xl overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <Search className="size-4 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search employees, products, customers, invoices, projects…"
            className="h-13 flex-1 bg-transparent py-3.5 text-[13.5px] text-ink placeholder:text-ink-3 focus:outline-none"
            aria-label="Search"
          />
          <kbd className="hidden rounded-md border border-edge bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3 sm:block">
            ESC
          </kbd>
        </div>

        {results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-ink">No results for “{query}”</p>
            <p className="mt-1 text-[12px] text-ink-3">Try a name, SKU, invoice or project code.</p>
          </div>
        ) : (
          <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
            {groups.map((group) => (
              <div key={group} className="mb-1">
                <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
                  {group}
                </p>
                {results
                  .filter((r) => r.group === group)
                  .map((r) => {
                    const idx = results.indexOf(r);
                    const activeRow = idx === active;
                    return (
                      <button
                        key={`${r.group}-${r.id}`}
                        data-index={idx}
                        type="button"
                        onClick={() => go(r)}
                        onMouseEnter={() => setActive(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                          activeRow ? "bg-surface-2" : "hover:bg-surface-2/60"
                        )}
                      >
                        <Avatar name={r.title} color={r.color} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {r.title}
                          </span>
                          <span className="block truncate text-[11.5px] text-ink-3">
                            {r.subtitle}
                          </span>
                        </span>
                        {activeRow && <ArrowRight className="size-3.5 text-accent" />}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-edge bg-surface-2/40 px-4 py-2.5 text-[10.5px] text-ink-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-edge bg-surface-2 px-1">↑</kbd>
            <kbd className="rounded border border-edge bg-surface-2 px-1">↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-edge bg-surface-2 px-1">↵</kbd> open
          </span>
          <span className="ml-auto hidden sm:block">
            {notifications.find((n) => !n.read) ? "Unread items are highlighted in the bell." : ""}
          </span>
        </div>
      </div>
    </div>
  );
}