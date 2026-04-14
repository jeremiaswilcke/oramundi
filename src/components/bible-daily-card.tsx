"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getPlanDayForDate } from "@/lib/bible-date";
import type { DayResponse } from "@/lib/bible-types";

import { BibleStreakBadge } from "./bible-streak-badge";
import { MaterialIcon } from "./material-icon";

function previewText(verses: DayResponse["at"][number]["verses"]) {
  return verses
    .slice(0, 2)
    .map((verse) => `${verse.n} ${verse.t}`)
    .join(" ");
}

export function BibleDailyCard() {
  const t = useTranslations("bible");
  const locale = useLocale();
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [dayData, setDayData] = useState<DayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCurrentDay(getPlanDayForDate());
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (currentDay === null) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(`/api/bible/day/${currentDay}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as DayResponse;
        if (!cancelled) {
          setDayData(payload);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentDay]);

  const todayLabel = new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <>
      <section className="pointer-events-auto">
        <button
          onClick={() => setOpen(true)}
          className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 text-left editorial-shadow transition-transform hover:scale-[1.01] active:scale-95"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MaterialIcon name="menu_book" size={22} filled />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">{t("yearTitle")}</p>
            <p className="font-headline text-lg italic text-on-surface">
              {currentDay === null ? t("browseBible") : t("dayOfYearShort", { day: currentDay })}
            </p>
          </div>
          <MaterialIcon name="open_in_new" size={18} className="text-on-surface-variant/60" />
        </button>
      </section>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <button
            aria-label={t("closePopup")}
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/95 to-secondary text-white editorial-shadow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_28%)]" />
            <div className="absolute -right-10 -top-10 opacity-10">
              <MaterialIcon name="menu_book" size={240} filled />
            </div>

            <div className="relative z-10 max-h-[80vh] overflow-y-auto px-6 py-6 md:px-8 md:py-7">
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                  <MaterialIcon name="menu_book" size={16} />
                  <span>{t("yearTitle")}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
                  aria-label={t("closePopup")}
                >
                  <MaterialIcon name="close" size={20} />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <h2 className="font-headline text-3xl italic text-white md:text-4xl">
                    {currentDay === null ? t("yearTitle") : t("dayOfYear", { day: currentDay })}
                  </h2>
                  <p className="mt-2 text-sm text-white/80">{todayLabel}</p>
                  <BibleStreakBadge variant="light" className="mt-4" />

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={currentDay === null ? "/bibel/lesen" : `/bibel/lesen?tag=${currentDay}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-primary transition-transform active:scale-95"
                    >
                      <MaterialIcon name="auto_stories" size={18} />
                      <span>{t("todayReading")}</span>
                    </Link>
                    <Link
                      href="/bibel/lesen"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-transform active:scale-95"
                    >
                      <MaterialIcon name="travel_explore" size={18} />
                      <span>{t("browseBible")}</span>
                    </Link>
                  </div>
                </div>

                <div className="grid flex-1 gap-3 md:grid-cols-2 lg:max-w-2xl">
                  {loading || currentDay === null ? (
                    <>
                      <div className="rounded-3xl bg-white/10 p-5">
                        <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                        <div className="skeleton-shimmer mt-4 h-16 rounded-2xl" />
                      </div>
                      <div className="rounded-3xl bg-white/10 p-5">
                        <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                        <div className="skeleton-shimmer mt-4 h-16 rounded-2xl" />
                      </div>
                    </>
                  ) : (
                    <>
                      {dayData?.at.length ? (
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{t("oldTestament")}</p>
                          <h3 className="mt-2 font-headline text-xl italic">{dayData.atLabel}</h3>
                          <p className="mt-3 text-sm leading-7 text-white/85">{previewText(dayData.at[0].verses)}</p>
                        </div>
                      ) : null}
                      {dayData?.nt.length ? (
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">{t("newTestament")}</p>
                          <h3 className="mt-2 font-headline text-xl italic">{dayData.ntLabel}</h3>
                          <p className="mt-3 text-sm leading-7 text-white/85">{previewText(dayData.nt[0].verses)}</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
