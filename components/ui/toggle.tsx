"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onToggle,
  label,
  id,
}: {
  checked: boolean;
  onToggle: (v: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      onClick={() => onToggle(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent",
        checked ? "border-accent/40 bg-accent" : "border-edge-strong bg-surface-3"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200",
          checked ? "left-[calc(100%-1.25rem)]" : "left-0.5"
        )}
      />
    </button>
  );
}