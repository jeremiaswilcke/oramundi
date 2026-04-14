"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

interface Campaign {
  id: string;
  group_id: string;
  title: string;
  intention: string | null;
  prayer_kind: string;
  prayer_kind_ref: string | null;
  duration_days: number;
  starts_on: string;
  status: "active" | "completed" | "cancelled";
  created_by: string;
}

interface PrayerLog {
  user_id: string;
  day_number: number;
  prayed_on: string;
}

interface Member {
  user_id: string;
  display_name: string;
  role: "admin" | "member";
}

const KIND_LABELS: Record<string, string> = {
  rosary: "Rosenkranz",
  mercy_chaplet: "Barmherzigkeitsrosenkranz",
  library: "Gebet aus der Bibliothek",
  custom: "Freies Gebet",
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function CampaignPage({ params }: { params: Promise<{ id: string; cid: string }> }) {
  const { id, cid } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prayers, setPrayers] = useState<PrayerLog[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data: camp } = await supabase
      .from("group_campaigns")
      .select("*")
      .eq("id", cid)
      .maybeSingle();
    if (!camp) { setLoading(false); return; }
    setCampaign(camp as Campaign);

    const { data: logs } = await supabase
      .from("group_campaign_prayers")
      .select("user_id, day_number, prayed_on")
      .eq("campaign_id", cid);
    setPrayers((logs ?? []) as PrayerLog[]);

    const { data: mems } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("group_id", id);
    const memberIds = (mems ?? []).map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", memberIds);
    const pmap = new Map<string, string>(
      (profiles ?? []).map((p: { id: string; display_name: string }) => [p.id, p.display_name])
    );
    const memberRows: Member[] = (mems ?? []).map((m) => ({
      user_id: m.user_id,
      display_name: pmap.get(m.user_id) ?? "—",
      role: m.role as "admin" | "member",
    }));
    setMembers(memberRows);
    setIsAdmin(memberRows.some((m) => m.user_id === user.id && m.role === "admin"));
    setLoading(false);
  }, [id, cid]);

  useEffect(() => { load(); }, [load]);

  async function logPrayer() {
    setError(null);
    setLogging(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("log_campaign_prayer", { p_campaign_id: cid });
      if (error) {
        setError(error.message);
        return;
      }
      await load();
    } finally {
      setLogging(false);
    }
  }

  async function cancelCampaign() {
    if (!confirm("Gebetsaktion wirklich beenden?")) return;
    const supabase = createClient();
    const { error } = await supabase.rpc("cancel_group_campaign", { p_campaign_id: cid });
    if (error) {
      alert(`Fehler: ${error.message}`);
      return;
    }
    router.push(`/groups/${id}`);
  }

  if (loading) return <div className="min-h-[calc(100vh-7.5rem)] flex items-center justify-center text-on-surface-variant">Lade…</div>;
  if (!campaign) return <div className="min-h-[calc(100vh-7.5rem)] flex items-center justify-center text-on-surface-variant">Gebetsaktion nicht gefunden.</div>;

  const startsOn = new Date(campaign.starts_on + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMidnight = new Date(today);
  const dayNumber = Math.floor((todayMidnight.getTime() - startsOn.getTime()) / 86400000) + 1;
  const isBeforeStart = dayNumber < 1;
  const isOver = dayNumber > campaign.duration_days;
  const currentDay = Math.max(1, Math.min(dayNumber, campaign.duration_days));

  const myPrayedToday = prayers.some((p) => p.user_id === userId && p.day_number === currentDay);
  const totalPrayers = prayers.length;
  const todayCount = prayers.filter((p) => p.day_number === currentDay).length;

  // Grid: days × members, showing who prayed each day
  const prayedSet = new Set(prayers.map((p) => `${p.user_id}:${p.day_number}`));

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href={`/groups/${id}`}
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        Zurück zur Gruppe
      </Link>

      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
          {KIND_LABELS[campaign.prayer_kind] ?? campaign.prayer_kind}
          {campaign.prayer_kind_ref && ` · ${campaign.prayer_kind_ref}`}
        </p>
        <h1 className="font-headline italic text-3xl text-on-surface mb-2">
          {campaign.title}
        </h1>
        {campaign.intention && (
          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
            {campaign.intention}
          </p>
        )}
      </div>

      {campaign.status === "cancelled" && (
        <div className="rounded-3xl bg-surface-container-high p-4 mb-6 text-center text-sm text-on-surface-variant">
          Diese Gebetsaktion wurde beendet.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-primary mb-0.5">
            {isBeforeStart ? "—" : isOver ? campaign.duration_days : currentDay}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Tag / {campaign.duration_days}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-secondary mb-0.5">{todayCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Heute gebetet
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-tertiary mb-0.5">{totalPrayers}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
            Gesamt
          </p>
        </div>
      </div>

      {campaign.status === "active" && !isBeforeStart && !isOver && (
        <button
          onClick={logPrayer}
          disabled={logging || myPrayedToday}
          className={`w-full py-4 rounded-full font-semibold mb-6 transition-all ${
            myPrayedToday
              ? "bg-primary/20 text-primary"
              : "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]"
          } disabled:opacity-60`}
        >
          {myPrayedToday ? "✓ Heute gebetet" : logging ? "Speichere..." : "Heute gebetet"}
        </button>
      )}

      {isBeforeStart && (
        <div className="rounded-3xl glass-card p-5 mb-6 text-center text-sm text-on-surface-variant">
          Startet am {startsOn.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      {error && <p className="text-xs text-error text-center mb-4">{error}</p>}

      {/* Progress grid */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
          Fortschritt
        </h2>
        <div className="space-y-2">
          {members.map((m) => {
            const prayedDays = Array.from(
              { length: campaign.duration_days },
              (_, i) => prayedSet.has(`${m.user_id}:${i + 1}`)
            );
            const prayedCount = prayedDays.filter(Boolean).length;
            return (
              <div key={m.user_id} className="glass-card rounded-2xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-on-primary-container">
                    {getInitials(m.display_name)}
                  </div>
                  <p className="text-sm font-semibold text-on-surface truncate flex-1">
                    {m.display_name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {prayedCount}/{campaign.duration_days}
                  </p>
                </div>
                <div className="flex gap-0.5 flex-wrap">
                  {prayedDays.map((prayed, i) => (
                    <div
                      key={i}
                      className={`h-2.5 flex-1 min-w-[4px] rounded-full ${
                        prayed
                          ? "bg-primary"
                          : i + 1 === currentDay && !isBeforeStart && !isOver
                            ? "bg-primary/20 ring-1 ring-primary/40"
                            : "bg-outline-variant/20"
                      }`}
                      title={`Tag ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && campaign.status === "active" && (
        <button
          onClick={cancelCampaign}
          className="w-full py-3 rounded-full bg-surface-container-high text-on-surface-variant text-sm hover:bg-surface-container-highest"
        >
          Gebetsaktion beenden
        </button>
      )}
    </div>
  );
}
