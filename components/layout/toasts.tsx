"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const VARIANTS = {
  success: { icon: CheckCircle2, cls: "text-ok" },
  info: { icon: Info, cls: "text-accent" },
  danger: { icon: XCircle, cls: "text-danger" },
} as const;

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const v = VARIANTS[t.variant];
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            role="status"
            className="glass animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-pop"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", v.cls)} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-[12px] text-ink-3">{t.desc}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}