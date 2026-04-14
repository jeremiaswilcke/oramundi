"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { getLocalIsoDate } from "@/lib/bible-date";
import type { BibleProgressSummary } from "@/lib/bible-types";

import { MaterialIcon } from "./material-icon";

interface BibleStreakBadgeProps {
  variant?: "light" | "dark";
  className?: string;
}

const EMPTY_SUMMARY: BibleProgressSummary = {
  authenticated: false,
  todayMarked: false,
  streak: 0,
  bestStreak: 0,
  totalReadDays: 0,
  lastReadOn: null,
};

export function BibleStreakBadge({ variant = "dark", className = "" }: BibleStreakBadgeProps) {
  const t = useTranslations("bible");
  const [summary, setSummary] = useState<BibleProgressSummary>(EMPTY_SUMMARY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/bible/progress?today=${getLocalIsoDate()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const nextSummary = (await response.json()) as BibleProgressSummary;
        if (!cancelled) {
          setSummary(nextSummary);
        }
      } catch {
        // Non-critical UI.
      }
    }

    load();

    const reload = () => void load();
    window.addEventListener("focus", reload);
    window.addEventListener("ora:bible-progress", reload);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", reload);
      window.removeEventListener("ora:bible-progress", reload);
    };
  }, []);

  if (summary.streak <= 0) {
    return null;
  }

  const isLight = variant === "light";
  const classes = isLight
    ? "bg-white/14 text-white border border-white/20"
    : "bg-primary/10 text-primary border border-primary/15";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide ${classes} ${className}`.trim()}
    >
      <MaterialIcon
        name={summary.todayMarked ? "check_circle" : "local_fire_department"}
        filled={summary.todayMarked}
        size={16}
      />
      <span>
        {summary.todayMarked
          ? t("streakTodayRead", { count: summary.streak })
          : t("streakDays", { count: summary.streak })}
      </span>
    </div>
  );
}
