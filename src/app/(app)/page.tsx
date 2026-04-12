"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { PrayerMap } from "@/components/prayer-map";
import { usePrayerPresence } from "@/lib/realtime";
import { MYSTERY_SETS, getTodaysMysteryType } from "@/data/rosary";
import Link from "next/link";

const MAP_TOKEN = process.env.NEXT_PUBLIC_MAP_TOKEN ?? "";

// Fallback mock dots when no real prayers exist
const MOCK_PRAYERS = [
  { userId: "m1", latitude: 48.1, longitude: 11.6, mysteryType: "glorious", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m2", latitude: 40.4, longitude: -3.7, mysteryType: "joyful", mode: "quick", startedAt: new Date().toISOString() },
  { userId: "m3", latitude: 41.9, longitude: 12.5, mysteryType: "sorrowful", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m4", latitude: 51.5, longitude: -0.1, mysteryType: "luminous", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m5", latitude: 48.9, longitude: 2.3, mysteryType: "glorious", mode: "quick", startedAt: new Date().toISOString() },
  { userId: "m6", latitude: 52.5, longitude: 13.4, mysteryType: "joyful", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m7", latitude: 47.4, longitude: 8.5, mysteryType: "sorrowful", mode: "quick", startedAt: new Date().toISOString() },
  { userId: "m8", latitude: -22.9, longitude: -43.2, mysteryType: "glorious", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m9", latitude: 14.6, longitude: 121.0, mysteryType: "joyful", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m10", latitude: 40.7, longitude: -74.0, mysteryType: "luminous", mode: "quick", startedAt: new Date().toISOString() },
  { userId: "m11", latitude: -33.9, longitude: 18.4, mysteryType: "glorious", mode: "guided", startedAt: new Date().toISOString() },
  { userId: "m12", latitude: 35.7, longitude: 139.7, mysteryType: "sorrowful", mode: "quick", startedAt: new Date().toISOString() },
];

export default function MapPage() {
  const [mode, setMode] = useState<"guided" | "quick">("guided");
  const { prayers: livePrayers, count } = usePrayerPresence();
  const todayType = getTodaysMysteryType();
  const todayMystery = MYSTERY_SETS.find((m) => m.type === todayType)!;
  const t = useTranslations("map");
  const tc = useTranslations("common");
  const locale = useLocale() as "de" | "en";

  const displayPrayers = livePrayers.length > 0 ? livePrayers : MOCK_PRAYERS;
  const displayCount = count > 0 ? count : MOCK_PRAYERS.length;

  return (
    <div className="relative h-[calc(100vh-7.5rem)] overflow-hidden">
      {/* Map */}
      {MAP_TOKEN ? (
        <PrayerMap prayers={displayPrayers} mapToken={MAP_TOKEN} />
      ) : (
        /* Fallback SVG map when no token */
        <div className="absolute inset-0 bg-surface map-mesh">
          <div className="absolute inset-0 opacity-[0.07]">
            <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <ellipse cx="25" cy="30" rx="12" ry="15" fill="currentColor" className="text-on-surface" />
              <ellipse cx="30" cy="48" rx="6" ry="10" fill="currentColor" className="text-on-surface" />
              <ellipse cx="50" cy="28" rx="8" ry="12" fill="currentColor" className="text-on-surface" />
              <ellipse cx="52" cy="45" rx="5" ry="8" fill="currentColor" className="text-on-surface" />
              <ellipse cx="72" cy="32" rx="14" ry="12" fill="currentColor" className="text-on-surface" />
              <ellipse cx="82" cy="50" rx="8" ry="7" fill="currentColor" className="text-on-surface" />
            </svg>
          </div>
          {displayPrayers.map((p) => (
            <div
              key={p.userId}
              className="absolute"
              style={{
                left: `${((p.longitude + 180) / 360) * 100}%`,
                top: `${((90 - p.latitude) / 180) * 100}%`,
              }}
            >
              <div
                className="candle-pulse w-3 h-3 rounded-full bg-primary-container"
                style={{ animationDelay: `${Math.random() * 3}s` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Top Pill Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            {tc("prayingNow", { count: displayCount })}
          </span>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="glass-panel rounded-t-[32px] px-6 pt-6 pb-4 border-t border-outline-variant/20">
          {/* Mode Toggle */}
          <div className="flex rounded-2xl bg-surface-container-highest/50 p-1 mb-5">
            <button
              onClick={() => setMode("guided")}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-xl transition-all ${
                mode === "guided"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant"
              }`}
            >
              {t("guidedPrayer")}
            </button>
            <button
              onClick={() => setMode("quick")}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-xl transition-all ${
                mode === "quick"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant"
              }`}
            >
              {t("quickLog")}
            </button>
          </div>

          <h2 className="font-headline italic text-3xl text-primary-fixed sacred-glow text-center mb-1">
            {t("theHolyRosary")}
          </h2>
          <p className="text-center text-on-surface-variant text-sm mb-5">
            <MaterialIcon name={todayMystery.icon} size={16} className="align-middle mr-1" />
            {t("today", { mystery: todayMystery.name[locale] })}
          </p>

          <Link
            href={mode === "guided" ? "/pray" : "/pray?mode=quick"}
            className="block w-full py-4 bg-primary-container text-on-primary-container text-center font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t("startRosary")}
          </Link>

          <div className="flex items-center justify-center gap-4 mt-4">
            {MYSTERY_SETS.map((set) => (
              <button
                key={set.type}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all ${
                  set.type === todayType
                    ? "bg-primary/15 text-primary"
                    : "text-on-surface-variant/60 hover:text-on-surface-variant"
                }`}
              >
                <MaterialIcon name={set.icon} size={14} />
                {set.type.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
