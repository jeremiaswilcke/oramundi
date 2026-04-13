"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  is_public: boolean;
  created_by: string;
}

interface MemberRow {
  id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  display_name: string;
  prayedToday: boolean;
  weeklyCount: number;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [groupRosaries, setGroupRosaries] = useState({ today: 0, week: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isAdmin = members.some((m) => m.user_id === userId && m.role === "admin");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data: g } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();
    if (!g) { setLoading(false); return; }
    setGroup(g as GroupDetail);

    // Members + their profiles
    const { data: m } = await supabase
      .from("group_members")
      .select("id, user_id, role, joined_at")
      .eq("group_id", id)
      .order("joined_at", { ascending: true });

    if (!m) { setLoading(false); return; }

    const userIds = m.map((row) => row.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    const profileMap = new Map<string, string>(
      (profiles ?? []).map((p: { id: string; display_name: string }) => [p.id, p.display_name])
    );

    // Get prayer activity per member
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const memberRows: MemberRow[] = [];
    let groupToday = 0;
    let groupWeek = 0;

    for (const row of m) {
      const { data: weekSessions } = await supabase
        .from("prayer_sessions")
        .select("started_at")
        .eq("user_id", row.user_id)
        .eq("completed", true)
        .gte("started_at", weekStart.toISOString());

      const todayCount = (weekSessions ?? []).filter(
        (s: { started_at: string }) => new Date(s.started_at) >= todayStart
      ).length;
      const weekCount = weekSessions?.length ?? 0;

      groupToday += todayCount;
      groupWeek += weekCount;

      memberRows.push({
        id: row.id,
        user_id: row.user_id,
        role: row.role,
        joined_at: row.joined_at,
        display_name: profileMap.get(row.user_id) ?? "—",
        prayedToday: todayCount > 0,
        weeklyCount: weekCount,
      });
    }
    setMembers(memberRows);

    // Total all-time count for the group
    let groupTotal = 0;
    for (const uid of userIds) {
      const { count } = await supabase
        .from("prayer_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("completed", true);
      groupTotal += count ?? 0;
    }

    setGroupRosaries({ today: groupToday, week: groupWeek, total: groupTotal });
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function copyInvite() {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function leaveGroup() {
    if (!confirm(`Möchtest du "${group?.name}" wirklich verlassen?`)) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", user.id);
    router.push("/groups");
  }

  async function deleteGroup() {
    if (!confirm(`"${group?.name}" wirklich endgültig löschen? Alle Mitgliedschaften gehen verloren.`)) return;
    const supabase = createClient();
    await supabase.from("groups").delete().eq("id", id);
    router.push("/groups");
  }

  async function removeMember(memberRow: MemberRow) {
    if (!confirm(`${memberRow.display_name} aus der Gruppe entfernen?`)) return;
    const supabase = createClient();
    await supabase.from("group_members").delete().eq("id", memberRow.id);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex items-center justify-center">
        <p className="text-on-surface-variant">Lade…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center px-6">
        <p className="text-on-surface-variant mb-4">Gruppe nicht gefunden.</p>
        <button onClick={() => router.push("/groups")} className="text-primary">
          Zurück zu Gruppen
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <button
        onClick={() => router.push("/groups")}
        className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 hover:text-primary transition-colors"
      >
        <MaterialIcon name="chevron_left" size={20} />
        <span>Alle Gruppen</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline italic text-3xl text-on-surface">{group.name}</h1>
        {group.description && (
          <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">{group.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-primary mb-0.5">{groupRosaries.today}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Heute</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-secondary mb-0.5">{groupRosaries.week}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Diese Woche</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="font-headline italic text-2xl text-tertiary mb-0.5">{groupRosaries.total}</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Gesamt</p>
        </div>
      </div>

      {/* Invite code */}
      <button
        onClick={copyInvite}
        className={`w-full mb-6 rounded-2xl p-5 text-left transition-all active:scale-[0.99] ${
          copied
            ? "bg-primary text-on-primary"
            : "bg-gradient-to-br from-secondary-container to-secondary-fixed text-on-secondary-container hover:brightness-105"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70 mb-1">
              Einladungscode
            </div>
            <div className="font-mono text-3xl tracking-[0.4em] font-semibold">
              {group.invite_code}
            </div>
          </div>
          <MaterialIcon name={copied ? "check" : "content_copy"} size={24} />
        </div>
        <p className="text-[11px] opacity-70 mt-3">
          {copied ? "Kopiert" : "Tippen zum Kopieren · Teile diesen Code mit anderen"}
        </p>
      </button>

      {/* Members */}
      <div className="mb-6">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
          {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}
        </h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
              <div className="relative w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-on-primary-container text-sm font-semibold flex-shrink-0">
                {getInitials(m.display_name)}
                {m.prayedToday && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-on-surface truncate">{m.display_name}</p>
                  {m.role === "admin" && (
                    <span className="text-[9px] uppercase tracking-wider text-secondary bg-secondary-container/40 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  {m.weeklyCount > 0
                    ? `${m.weeklyCount} ${m.weeklyCount === 1 ? "Rosenkranz" : "Rosenkränze"} diese Woche`
                    : "Diese Woche noch nicht gebetet"}
                </p>
              </div>
              {isAdmin && m.user_id !== userId && (
                <button
                  onClick={() => removeMember(m)}
                  className="text-on-surface-variant/40 hover:text-error"
                  aria-label="Entfernen"
                >
                  <MaterialIcon name="person_remove" size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!isAdmin && (
          <button
            onClick={leaveGroup}
            className="w-full py-3 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container-highest"
          >
            Gruppe verlassen
          </button>
        )}
        {isAdmin && (
          <button
            onClick={deleteGroup}
            className="w-full py-3 rounded-full bg-error-container text-on-error-container text-sm font-medium hover:opacity-90"
          >
            Gruppe löschen
          </button>
        )}
      </div>
    </div>
  );
}
