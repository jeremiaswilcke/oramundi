"use client";

import { TopAppBar } from "./top-app-bar";
import { BottomNav } from "./bottom-nav";
import { usePrayerPresence } from "@/lib/realtime";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { count } = usePrayerPresence();

  return (
    <>
      <TopAppBar prayingCount={count > 0 ? count : 12} />
      <main className="flex-1 pt-14 pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
