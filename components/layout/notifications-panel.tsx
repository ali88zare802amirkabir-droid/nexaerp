"use client";

import { useEffect, useRef } from "react";
import {
  Banknote,
  BellRing,
  Box,
  CheckCheck,
  ContactRound,
  FolderKanban,
  ListTodo,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relMins } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/types";

const KIND_META: Record<
  NotificationKind,
  { icon: LucideIcon; color: string; bg: string }
> = {
  employee: { icon: UserRound, color: "#35d3f2", bg: "bg-[#35d3f2]/10 text-[#35d3f2]" },
  invoice: { icon: Banknote, color: "#34d399", bg: "bg-[#34d399]/10 text-[#34d399]" },
  inventory: { icon: Box, color: "#55a1ff", bg: "bg-[#55a1ff]/10 text-[#55a1ff]" },
  project: { icon: FolderKanban, color: "#fbbf24", bg: "bg-[#fbbf24]/10 text-[#fbbf24]" },
  task: { icon: ListTodo, color: "#fbbf24", bg: "bg-[#fbbf24]/10 text-[#fbbf24]" },
  finance: { icon: Banknote, color: "#34d399", bg: "bg-[#34d399]/10 text-[#34d399]" },
  customer: { icon: ContactRound, color: "#fb7185", bg: "bg-[#fb7185]/10 text-[#fb7185]" },
};

export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  if (!open) return null;
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="glass animate-scale-in absolute right-0 top-full z-40 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border-edge shadow-pop"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between border-b border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-accent" />
          <p className="text-[13px] font-semibold text-ink">Notifications</p>
          {unread > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <CheckCheck className="size-3.5" />
          Mark all read
        </button>
      </div>

      <div className="max-h-[min(420px,60vh)] overflow-y-auto p-1.5">
        {notifications.length === 0 && (
          <p className="px-4 py-10 text-center text-[12.5px] text-ink-3">
            You’re all caught up.
          </p>
        )}
        {notifications.map((n) => {
          const meta = KIND_META[n.kind];
          const Icon = meta.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-surface-2/60",
                !n.read && "bg-surface-2/50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  meta.bg
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-ink">{n.title}</span>
                <span className="mt-0.5 block truncate text-[11.5px] text-ink-3">
                  {n.desc}
                </span>
                <span className="mt-1 block text-[10.5px] text-ink-3/70">
                  {relMins(n.minsAgo)} ago
                </span>
              </span>
              {!n.read && (
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}