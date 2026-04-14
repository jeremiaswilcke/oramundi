"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { getLocalIsoDate } from "@/lib/bible-date";
import type { BibleProgressSummary } from "@/lib/bible-types";

import { MaterialIcon } from "./material-icon";

interface BibleMarkReadButtonProps {
  planDay: number;
  isToday: boolean;
}

const EMPTY_SUMMARY: BibleProgressSummary = {
  authenticated: false,
  todayMarked: false,
  streak: 0,
  bestStreak: 0,
  totalReadDays: 0,
  lastReadOn: null,
};

export function BibleMarkReadButton({ planDay, isToday }: BibleMarkReadButtonProps) {
  const t = useTranslations("bible");
  const [summary, setSummary] = useState<BibleProgressSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkRead() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bible/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: planDay,
          readOn: getLocalIsoDate(),
        }),
      });

      const payload = (await response.json()) as BibleProgressSummary | { error?: string };
      if (!response.ok) {
        setError("error" in payload ? payload.error ?? t("saveFailed") : t("saveFailed"));
        return;
      }

      setSummary(payload as BibleProgressSummary);
      window.dispatchEvent(new Event("ora:bible-progress"));
    } catch {
      setError(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (!isToday) {
    return (
      <div className="rounded-3xl border border-primary/10 bg-primary/5 px-5 py-4 text-sm text-on-surface-variant">
        {t("onlyTodayCounts")}
      </div>
    );
  }

  if (summary.todayMarked) {
    return (
      <div className="rounded-3xl border border-primary/15 bg-primary/10 px-5 py-4 text-sm text-primary">
        <div className="flex items-center gap-2 font-medium">
          <MaterialIcon name="check_circle" filled size={18} />
          <span>{t("todayAlreadyRead")}</span>
        </div>
        <p className="mt-1 text-on-surface-variant">{t("streakTodayRead", { count: summary.streak })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleMarkRead}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-on-primary transition-transform active:scale-95 disabled:opacity-60"
      >
        <MaterialIcon name={loading ? "hourglass_top" : "check_circle"} filled={loading} size={18} />
        <span>{loading ? t("saving") : t("readTodayMark")}</span>
      </button>
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
