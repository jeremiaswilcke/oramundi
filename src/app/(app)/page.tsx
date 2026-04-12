"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { PrayerMap } from "@/components/prayer-map";
import { usePrayerPresence } from "@/lib/realtime";
import { MYSTERY_SETS, getTodaysMysteryType } from "@/data/rosary";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const MAP_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "ybWg0XgugDk1LNoPvkfL";

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
  const td = useTranslations("dashboard");
  const locale = useLocale() as "de" | "en";

  // Randomize fallback count once per page load (1–12)
  const mockCount = useMemo(() => Math.floor(Math.random() * 12) + 1, []);
  const mockSubset = useMemo(() => MOCK_PRAYERS.slice(0, mockCount), [mockCount]);

  const displayPrayers = count > 0 ? livePrayers : mockSubset;
  const displayCount = count > 0 ? count : mockCount;

  // Quick log
  const [quickLogging, setQuickLogging] = useState(false);
  async function handleQuickLog() {
    setQuickLogging(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const now = new Date();
      const startedAt = new Date(now.getTime() - 20 * 60000).toISOString();
      await supabase.from("prayer_sessions").insert({
        user_id: user.id,
        mystery_type: todayType,
        mode: "quick",
        started_at: startedAt,
        ended_at: now.toISOString(),
        completed: true,
      });
      // Refresh global stats
      const { data } = await supabase.from("global_stats").select("total_rosaries").single();
      if (data) setGlobalRosaries(data.total_rosaries);
    } finally {
      setQuickLogging(false);
    }
  }

  // Global stats
  const [globalRosaries, setGlobalRosaries] = useState(0);
  useEffect(() => {
    async function fetchGlobalStats() {
      const supabase = createClient();
      const { data } = await supabase
        .from("global_stats")
        .select("total_rosaries")
        .single();
      if (data) setGlobalRosaries(data.total_rosaries);
    }
    fetchGlobalStats();
  }, []);

  return (
    <div className="relative h-[calc(100vh-7.5rem)] overflow-hidden">
      {/* Map */}
      {MAP_TOKEN ? (
        <PrayerMap prayers={displayPrayers} mapToken={MAP_TOKEN} />
      ) : (
        /* Fallback SVG map when no token */
        <div className="absolute inset-0 bg-surface-container-low">
          <div className="absolute inset-0 opacity-40">
            <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <ellipse cx="25" cy="30" rx="12" ry="15" fill="#c4c8bf" />
              <ellipse cx="30" cy="48" rx="6" ry="10" fill="#c4c8bf" />
              <ellipse cx="50" cy="28" rx="8" ry="12" fill="#c4c8bf" />
              <ellipse cx="52" cy="45" rx="5" ry="8" fill="#c4c8bf" />
              <ellipse cx="72" cy="32" rx="14" ry="12" fill="#c4c8bf" />
              <ellipse cx="82" cy="50" rx="8" ry="7" fill="#c4c8bf" />
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
                className="candle-pulse w-3 h-3 rounded-full bg-secondary"
                style={{ animationDelay: `${Math.random() * 3}s` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col pointer-events-none">
        <div className="flex justify-between items-start w-full">
          {/* Soul Collective Counter */}
          <div className="pointer-events-auto glass-card p-6 rounded-3xl flex flex-col gap-1 max-w-[200px]">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">
              {td("soulCollective")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline text-on-surface italic">
                {displayCount.toLocaleString(locale)}
              </span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] leading-tight text-on-surface-variant/80">
              {td("believersReflecting")}
            </p>
          </div>

          {/* Global Rosaries (if available) */}
          {globalRosaries > 0 && (
            <div className="pointer-events-auto glass-card p-4 rounded-2xl text-right max-w-[180px]">
              <span className="text-2xl font-headline text-on-surface italic">
                {globalRosaries.toLocaleString(locale)}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium mt-1">
                {td("totalRosaries")}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Card */}
        <div className="mt-auto mb-2 flex flex-col items-center">
          <div className="pointer-events-auto w-full max-w-md glass-card p-8 rounded-[2rem] text-center mb-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-on-secondary-container font-semibold mb-4 block">
              {t("today", { mystery: todayMystery.name[locale] })}
            </span>
            <h2 className="text-3xl font-headline text-on-surface mb-2">
              {t("theHolyRosary")}
            </h2>
          </div>

          {/* Buttons */}
          <div className="pointer-events-auto flex gap-3">
            <Link
              href="/pray"
              className="group relative px-10 py-4 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container" />
              <div className="relative flex items-center gap-3 text-on-primary">
                <MaterialIcon name="auto_awesome" filled size={20} />
                <span className="font-medium tracking-wide uppercase text-sm">
                  {t("startRosary")}
                </span>
              </div>
            </Link>
            <button
              onClick={handleQuickLog}
              disabled={quickLogging}
              className="px-6 py-4 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface-variant hover:text-primary transition-all active:scale-95 editorial-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <MaterialIcon name="check_circle" size={20} />
                <span className="font-medium tracking-wide uppercase text-sm">
                  {quickLogging ? tc("loading") : t("quickLog")}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
