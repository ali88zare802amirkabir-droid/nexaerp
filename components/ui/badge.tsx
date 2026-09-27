import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "accent" | "cyan" | "ok" | "warn" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent border-accent/25",
  cyan: "bg-cyan/10 text-cyan border-cyan/25",
  ok: "bg-ok-soft text-ok border-ok/25",
  warn: "bg-warn-soft text-warn border-warn/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  neutral: "bg-surface-2 text-ink-2 border-edge-strong",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}