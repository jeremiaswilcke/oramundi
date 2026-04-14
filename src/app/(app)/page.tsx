"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { PrayerMap } from "@/components/prayer-map";
import { usePrayerPresence, useGeolocation, type PrayerPresence } from "@/lib/realtime";
import { MYSTERY_SETS, getTodaysMysteryType } from "@/data/rosary";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const MAP_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "ybWg0XgugDk1LNoPvkfL";

export default function MapPage() {
  const [mode, setMode] = useState<"guided" | "quick">("guided");
  const { prayers: livePrayers, count } = usePrayerPresence();
  const position = useGeolocation();
  const todayType = getTodaysMysteryType();
  const todayMystery = MYSTERY_SETS.find((m) => m.type === todayType)!;
  const t = useTranslations("map");
  const tc = useTranslations("common");
  const td = useTranslations("dashboard");
  const tl = useTranslations("library");
  const locale = useLocale() as "de" | "en";

  // Recent prayers from DB (last 30 minutes) so the map isn't empty
  // and you remain visible after finishing
  const [recentPrayers, setRecentPrayers] = useState<PrayerPresence[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function loadRecent() {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_public_active_prayers");
      if (cancelled || !data) return;
      const mapped: PrayerPresence[] = (data as Array<{
        latitude: number;
        longitude: number;
        mystery_type: string | null;
        mode: string | null;
        started_at: string;
      }>).map((s, idx) => ({
        userId: `public-${idx}-${s.started_at}`,
        latitude: s.latitude,
        longitude: s.longitude,
        mysteryType: s.mystery_type ?? "glorious",
        mode: s.mode ?? "quick",
        startedAt: s.started_at,
      }));
      setRecentPrayers(mapped);
    }
    loadRecent();
    const interval = setInterval(loadRecent, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Show recent prayers from DB; live presence is already included
  // (active users have started_at within the last 30 min)
  const displayPrayers = recentPrayers.length > 0 ? recentPrayers : livePrayers;
  const liveCount = count;
  const recentCount = recentPrayers.length;

  // Quick log
  const [quickLogging, setQuickLogging] = useState(false);
  const [quickLogSuccess, setQuickLogSuccess] = useState(false);
  async function handleQuickLog() {
    setQuickLogging(true);
    setQuickLogSuccess(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Bitte melde dich an, um Gebete zu speichern.");
        return;
      }
      const now = new Date();
      const startedAt = new Date(now.getTime() - 20 * 60000).toISOString();
      const { error } = await supabase.from("prayer_sessions").insert({
        user_id: user.id,
        mystery_type: todayType,
        mode: "quick",
        started_at: startedAt,
        ended_at: now.toISOString(),
        completed: true,
        latitude: position?.lat ?? null,
        longitude: position?.lng ?? null,
      });
      if (error) {
        alert(`Fehler beim Speichern: ${error.message}`);
        return;
      }
      setQuickLogSuccess(true);
      setTimeout(() => setQuickLogSuccess(false), 3000);
      // Refresh global stats
      const { data } = await supabase.from("global_stats").select("total_rosaries").single();
      if (data) setGlobalRosaries(data.total_rosaries);
    } finally {
      setQuickLogging(false);
    }
  }

  // Reminder banner
  const [reminderDue, setReminderDue] = useState(false);
  useEffect(() => {
    async function checkReminder() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_private_settings")
        .select("reminder_enabled, reminder_days, reminder_time")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile?.reminder_enabled) return;

      const now = new Date();
      const dayKeys = ["sun","mon","tue","wed","thu","fri","sat"];
      const today = dayKeys[now.getDay()];
      if (!profile.reminder_days?.includes(today)) return;

      // Check if user prayed today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("prayer_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("started_at", todayStart.toISOString());
      if ((count ?? 0) > 0) return;

      // Check if current time is past reminder time
      const [hh, mm] = (profile.reminder_time ?? "18:00").split(":").map(Number);
      const reminderTime = new Date(now);
      reminderTime.setHours(hh, mm, 0, 0);
      if (now >= reminderTime) {
        setReminderDue(true);
        // Fire a browser notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Ora Mundi — Zeit zum Gebet", {
            body: "Es ist Zeit für deinen Rosenkranz.",
            icon: "/icons/icon-192.png",
            tag: "ora-mundi-reminder",
          });
        }
      }
    }
    checkReminder();
  }, []);

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

      {/* Reminder banner */}
      {reminderDue && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="glass-panel rounded-full px-5 py-3 flex items-center gap-3 editorial-shadow">
            <MaterialIcon name="notifications_active" filled size={20} className="text-primary" />
            <span className="text-sm text-on-surface font-medium">Zeit für dein Gebet</span>
            <button
              onClick={() => setReminderDue(false)}
              className="text-on-surface-variant/60 hover:text-on-surface transition-colors"
              aria-label="Schließen"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col pointer-events-none">
        <div className="flex justify-between items-start w-full">
          {/* Soul Collective Counter */}
          <div className="pointer-events-auto glass-card p-5 rounded-3xl flex flex-col gap-2 max-w-[220px]">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">
              {td("soulCollective")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-headline text-on-surface italic">
                {liveCount.toLocaleString(locale)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                {locale === "de" ? "live" : "live"}
              </span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-headline text-on-surface-variant italic">
                {recentCount.toLocaleString(locale)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                {locale === "de" ? "letzte 30 Min" : "last 30 min"}
              </span>
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
          <div className="pointer-events-auto flex gap-3 mb-3">
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
              className={`px-6 py-4 rounded-full backdrop-blur-md transition-all active:scale-95 editorial-shadow disabled:opacity-50 ${
                quickLogSuccess
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest/90 text-on-surface-variant hover:text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <MaterialIcon name={quickLogSuccess ? "check" : "check_circle"} filled={quickLogSuccess} size={20} />
                <span className="font-medium tracking-wide uppercase text-sm">
                  {quickLogging ? tc("loading") : quickLogSuccess ? "Gespeichert" : t("quickLog")}
                </span>
              </div>
            </button>
          </div>
          <Link
            href="/library"
            className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant hover:text-primary text-xs tracking-widest uppercase font-medium transition-all editorial-shadow active:scale-95"
          >
            <MaterialIcon name="auto_stories" size={16} />
            {tl("openLibrary")}
          </Link>
        </div>
      </div>
    </div>
  );
}
