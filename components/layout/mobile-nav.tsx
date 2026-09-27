"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/store";
import { BrandMark, NavLinks, WorkspaceChip } from "@/components/layout/sidebar";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useApp();

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="animate-drawer-in absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-edge bg-bg-soft">
        <div className="flex items-center justify-between pr-3">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          <NavLinks onNavigate={onClose} />
        </div>
        <div className="border-t border-edge p-2.5">
          <WorkspaceChip />
          <a href="/settings" className="mt-2 flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-surface-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {profile.name.slice(0, 2).toUpperCase() || "AR"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-semibold text-ink">{profile.name}</span>
              <span className="block truncate text-[10.5px] text-ink-3">{profile.role}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}