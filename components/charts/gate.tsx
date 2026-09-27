"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Defer chart rendering until client-side mount to keep SSR/hydration deterministic. */
export function ChartGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) {
    return (
      <div className="h-56">
        <div className="skeleton h-full w-full" />
      </div>
    );
  }
  return <>{children}</>;
}