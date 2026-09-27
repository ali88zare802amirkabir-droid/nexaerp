"use client";

import type { ReactNode } from "react";
import { AppStoreProvider } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}