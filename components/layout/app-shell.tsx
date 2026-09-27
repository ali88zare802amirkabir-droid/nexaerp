"use client";

import type { ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { CommandSearch } from "@/components/layout/command-search";
import { Toasts } from "@/components/layout/toasts";

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen } = useApp();

  return (
    <div className="min-h-dvh">
      <Sidebar collapsed={sidebarCollapsed} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CommandSearch />
      <Toasts />

      <div className={sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[240px]"} style={{ transition: "padding 0.2s ease" }}>
        <Topbar />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}