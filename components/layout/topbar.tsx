"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, PanelLeft, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { NAV } from "@/components/layout/nav";
import { NotificationsPanel } from "@/components/layout/notifications-panel";

export function Topbar() {
  const {
    profile,
    notifications,
    setSearchOpen,
    sidebarCollapsed,
    toggleSidebar,
    setMobileNavOpen,
  } = useApp();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const isDetail = segments.length > 1;
  const section =
    NAV.find((n) =>
      n.exact ? pathname === n.href : pathname.startsWith(n.href) && n.href !== "/"
    ) ?? NAV[0];
  const baseSection = NAV.find((n) => n.href === `/${segments[0] ?? ""}`);
  const title = isDetail ? baseSection?.label ?? section.label : section.label;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-edge px-4 sm:px-6">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-ink-2 hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu className="size-4.5" />
      </button>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden rounded-lg p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink lg:inline-flex"
      >
        <PanelLeft className="size-4.5" />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        <p className="truncate text-[13.5px] font-semibold text-ink">{title}</p>
        {isDetail && <span className="text-ink-3">/</span>}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-9 items-center gap-2 rounded-xl border border-edge bg-surface/60 px-3 text-[12.5px] text-ink-3 transition-colors hover:border-edge-strong hover:text-ink-2"
          aria-label="Search workspace"
        >
          <Search className="size-3.5" />
          <span className="hidden md:inline">Search…</span>
          <kbd className="hidden rounded border border-edge bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3 sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative flex size-9 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Bell className="size-4.5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            )}
          </button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="mx-1 hidden h-6 w-px bg-edge sm:block" aria-hidden />

        <Link
          href="/settings"
          className="flex h-9 items-center gap-2 rounded-xl p-1 pl-1.5 pr-2 transition-colors hover:bg-surface-2"
          aria-label="Open settings"
        >
          <span className="flex size-6.5 items-center justify-center rounded-lg bg-accent-soft text-[11px] font-bold text-accent">
            {profile.name.slice(0, 2).toUpperCase() || "AR"}
          </span>
          <span className="hidden text-[12.5px] font-semibold text-ink sm:inline">
            {profile.name.split(" ")[0] || "Ali"}
          </span>
        </Link>
      </div>
    </header>
  );
}