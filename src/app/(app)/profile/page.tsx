"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/actions";
import { MYSTERY_SETS, getTodaysMysteryType } from "@/data/rosary";
import Link from "next/link";

interface Stats {
  rosaries: number;
  minutes: number;
  intentions: number;
  streak: number;
}

interface HistoryItem {
  id: string;
  mystery_type: string;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
}

function getMysteryIcon(type: string) {
  return MYSTERY_SETS.find((m) => m.type === type)?.icon ?? "radio_button_unchecked";
}

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("...");
  const [stats, setStats] = useState<Stats>({ rosaries: 0, minutes: 0, intentions: 0, streak: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (profile) setDisplayName(profile.display_name);

      // Prayer sessions
      const { data: sessions } = await supabase
        .from("prayer_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (sessions) {
        const completed = sessions.filter((s) => s.completed);
        const totalMinutes = completed.reduce((sum, s) => {
          if (!s.ended_at) return sum;
          const diff = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
          return sum + Math.round(diff / 60000);
        }, 0);

        // Calculate streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let d = 0; d < 365; d++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - d);
          const dayStr = checkDate.toISOString().slice(0, 10);
          const hasSession = completed.some(
            (s) => s.started_at.slice(0, 10) === dayStr
          );
          if (hasSession) {
            streak++;
          } else if (d > 0) {
            break;
          }
        }

        setStats({
          rosaries: completed.length,
          minutes: totalMinutes,
          intentions: 0,
          streak,
        });
        setHistory(sessions.slice(0, 10));
      }

      // Intentions count
      const { count } = await supabase
        .from("intentions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats((prev) => ({ ...prev, intentions: count ?? 0 }));
    }

    loadProfile();
  }, []);

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      `, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  function formatDuration(startedAt: string, endedAt: string | null): string {
    if (!endedAt) return "In progress";
    const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    return `${Math.round(diff / 60000)} min`;
  }

  const todayType = getTodaysMysteryType();
  const todayMystery = MYSTERY_SETS.find((m) => m.type === todayType)!;

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      {/* Welcome */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-headline italic text-4xl text-on-surface mb-1">
            Welcome home,
          </h1>
          <h1 className="font-headline italic text-4xl text-primary">
            {displayName}
          </h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 p-2 rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Sign out"
          >
            <MaterialIcon name="logout" size={20} className="text-on-surface-variant" />
          </button>
        </form>
      </div>

      {/* Streak Badge */}
      {stats.streak > 0 && (
        <div className="glass-card rounded-2xl p-4 border-l-4 border-primary mb-6">
          <div className="flex items-center gap-3">
            <div className="candle-pulse w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <MaterialIcon name="local_fire_department" filled size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{stats.streak}-day Streak</p>
              <p className="text-xs text-on-surface-variant">
                {stats.streak >= 7
                  ? "You've been praying every day this week!"
                  : `Keep going! ${7 - stats.streak} more days to a full week.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-3xl text-primary-fixed mb-1">{stats.rosaries}</p>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            Rosaries
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-3xl text-primary-fixed mb-1">{stats.minutes}</p>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            Minutes
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-3xl text-primary-fixed mb-1">{stats.intentions}</p>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            Intentions
          </p>
        </div>
      </div>

      {/* Daily Mystery */}
      <div className="relative rounded-[32px] overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-lowest" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-container/10 rounded-full blur-3xl" />
        <div className="relative p-6">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-2 block">
            Today&apos;s Mystery
          </span>
          <h3 className="font-headline italic text-xl text-primary-fixed sacred-glow mb-3">
            {todayMystery.name.en}
          </h3>
          <p className="font-headline italic text-sm text-on-surface/60 leading-relaxed mb-4">
            &ldquo;Pray, hope and don&apos;t worry. Worry is useless. God is merciful and will hear your prayer.&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-4">
            &mdash; St. Padre Pio
          </p>
          <Link
            href="/pray"
            className="inline-block px-6 py-3 bg-primary-container text-on-primary-container font-label text-xs font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Pray Now
          </Link>
        </div>
      </div>

      {/* Prayer History */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
          Prayer History
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <MaterialIcon name="self_improvement" size={40} className="text-on-surface-variant/30 mb-2" />
            <p className="text-on-surface-variant text-sm">No prayers yet. Start your first rosary!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 glass-card rounded-2xl p-3"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <MaterialIcon
                    name={getMysteryIcon(item.mystery_type)}
                    size={20}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface capitalize">
                    {item.mystery_type} Mysteries
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {formatDate(item.started_at)} &middot; {formatDuration(item.started_at, item.ended_at)}
                  </p>
                </div>
                {item.completed && (
                  <MaterialIcon name="check_circle" filled size={18} className="text-primary/60" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
