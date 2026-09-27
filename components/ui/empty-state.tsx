import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  desc,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-edge-strong px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
        {icon}
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {desc && <p className="max-w-xs text-[12.5px] text-ink-3">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}