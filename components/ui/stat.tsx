import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon,
  label,
  value,
  delta,
  tone = "accent",
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: string;
  tone?: "accent" | "cyan" | "ok" | "warn" | "danger";
  hint?: string;
}) {
  const tones = {
    accent: "text-accent",
    cyan: "text-cyan",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  };
  return (
    <div className="card animate-rise p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11.5px] font-medium uppercase tracking-wide text-ink-3">
            {label}
          </p>
          <p className="mt-2 font-display text-[22px] font-semibold tabular-nums text-ink sm:text-2xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2",
            tones[tone]
          )}
        >
          {icon}
        </div>
      </div>
      {(delta || hint) && (
        <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-3">
          {delta && <span className={cn("font-medium", tones[tone])}>{delta}</span>}
          {hint}
        </p>
      )}
    </div>
  );
}