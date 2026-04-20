"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { clampPlanDay } from "@/lib/bible-plan";
import { getPlanDayForDate } from "@/lib/bible-date";

import { MaterialIcon } from "./material-icon";

interface BibleStartDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (planDay: number) => Promise<void> | void;
  initialPlanDay?: number;
}

export function BibleStartDialog({
  open,
  onClose,
  onConfirm,
  initialPlanDay,
}: BibleStartDialogProps) {
  const t = useTranslations("bible");
  const todayPlanDay = getPlanDayForDate();
  const [selected, setSelected] = useState<number>(
    clampPlanDay(initialPlanDay ?? todayPlanDay),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelected(clampPlanDay(initialPlanDay ?? todayPlanDay));
      setError(null);
    }
  }, [open, initialPlanDay, todayPlanDay]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      await onConfirm(clampPlanDay(selected));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("startDialogErrorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <button
        aria-label={t("closePopup")}
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      <div className="pointer-events-auto relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] bg-surface editorial-shadow">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
                {t("yearTitle")}
              </p>
              <h2 className="mt-1 font-headline text-2xl italic text-on-surface">
                {t("startDialogTitle")}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
              aria-label={t("closePopup")}
            >
              <MaterialIcon name="close" size={20} />
            </button>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            {t("startDialogDescription", { day: todayPlanDay })}
          </p>

          <button
            type="button"
            onClick={() => setSelected(todayPlanDay)}
            className={`mt-5 w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
              selected === todayPlanDay
                ? "border-primary bg-primary/10 text-primary"
                : "border-outline-variant bg-surface-container-low text-on-surface"
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">
              {t("startDialogTodayLabel")}
            </div>
            <div className="mt-1 font-headline text-xl italic">
              {t("dayOfYear", { day: todayPlanDay })}
            </div>
          </button>

          <div className="mt-4">
            <label
              htmlFor="bible-plan-day-input"
              className="block text-[11px] uppercase tracking-[0.2em] text-on-surface-variant"
            >
              {t("startDialogCustomLabel")}
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="bible-plan-day-input"
                type="number"
                min={1}
                max={365}
                inputMode="numeric"
                value={selected}
                onChange={(e) => setSelected(clampPlanDay(Number(e.target.value)))}
                className="w-24 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-lg font-semibold text-on-surface outline-none focus:border-primary"
              />
              <input
                type="range"
                min={1}
                max={365}
                value={selected}
                onChange={(e) => setSelected(clampPlanDay(Number(e.target.value)))}
                className="flex-1 accent-primary"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-error">{error}</p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-outline-variant px-5 py-3 text-sm font-medium text-on-surface-variant"
            >
              {t("startDialogCancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary disabled:opacity-50"
            >
              {saving
                ? t("saving")
                : t("startDialogConfirm", { day: clampPlanDay(selected) })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
