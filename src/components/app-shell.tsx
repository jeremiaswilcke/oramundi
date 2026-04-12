"use client";

import { TopAppBar } from "./top-app-bar";
import { BottomNav } from "./bottom-nav";
import { usePrayerPresence } from "@/lib/realtime";

function RosaryBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-[0.04]">
      <svg
        viewBox="0 0 400 600"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[750px] text-on-surface"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {/* Main circle of beads */}
        <circle cx="200" cy="240" r="150" strokeDasharray="8 14" opacity="0.6" />

        {/* 10 beads on left arc */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI + Math.PI / 2;
          const x = 200 + 150 * Math.cos(angle);
          const y = 240 + 150 * Math.sin(angle);
          return <circle key={`l${i}`} cx={x} cy={y} r="6" fill="currentColor" opacity="0.3" />;
        })}

        {/* 10 beads on right arc */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI - Math.PI / 2;
          const x = 200 + 150 * Math.cos(angle);
          const y = 240 + 150 * Math.sin(angle);
          return <circle key={`r${i}`} cx={x} cy={y} r="6" fill="currentColor" opacity="0.3" />;
        })}

        {/* Pendant chain */}
        <line x1="200" y1="390" x2="200" y2="500" strokeDasharray="6 10" opacity="0.5" />

        {/* 3 pendant beads */}
        <circle cx="200" cy="420" r="5" fill="currentColor" opacity="0.25" />
        <circle cx="200" cy="445" r="5" fill="currentColor" opacity="0.25" />
        <circle cx="200" cy="470" r="5" fill="currentColor" opacity="0.25" />

        {/* Cross at bottom */}
        <rect x="193" y="490" width="14" height="50" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="183" y="502" width="34" height="12" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { count } = usePrayerPresence();

  return (
    <>
      <RosaryBackground />
      <TopAppBar prayingCount={count > 0 ? count : undefined} />
      <main className="flex-1 pt-14 pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
