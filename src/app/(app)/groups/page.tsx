"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  is_public: boolean;
  member_count?: number;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get group memberships
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role, groups(id, name, description, invite_code, is_public)")
      .eq("user_id", user.id);

    if (!memberships) { setLoading(false); return; }

    type GroupRow = { id: string; name: string; description: string | null; invite_code: string; is_public: boolean };
    type Membership = { groups: GroupRow | GroupRow[] | null };

    const groupRows: Group[] = (memberships as Membership[])
      .map((m): Group | null => {
        const g = Array.isArray(m.groups) ? m.groups[0] : m.groups;
        return g ? { ...g, member_count: 0 } : null;
      })
      .filter((g): g is Group => g !== null);

    // Fetch member counts
    for (const g of groupRows) {
      const { count } = await supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", g.id);
      g.member_count = count ?? 0;
    }

    setGroups(groupRows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createGroup() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("groups")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          invite_code: generateInviteCode(),
          is_public: isPublic,
          created_by: user.id,
        });

      if (error) {
        alert(`Fehler: ${error.message}`);
        return;
      }
      setShowCreate(false);
      setName(""); setDescription(""); setIsPublic(false);
      load();
    } finally {
      setBusy(false);
    }
  }

  async function joinByCode() {
    if (!joinCode.trim()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find group by invite code
      const { data: group, error: findError } = await supabase
        .from("groups")
        .select("id")
        .eq("invite_code", joinCode.trim().toUpperCase())
        .maybeSingle();

      if (findError || !group) {
        alert("Code ungültig oder Gruppe nicht gefunden.");
        return;
      }

      // Join
      const { error: joinError } = await supabase
        .from("group_members")
        .insert({ group_id: group.id, user_id: user.id, role: "member" });

      if (joinError) {
        if (joinError.code === "23505") {
          alert("Du bist bereits Mitglied dieser Gruppe.");
        } else {
          alert(`Fehler: ${joinError.message}`);
        }
        return;
      }

      setShowJoin(false);
      setJoinCode("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline italic text-4xl text-on-surface">Gebetsgruppen</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Bete gemeinsam mit Familien, Pfarren oder Glaubensgemeinschaften
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-2xl p-5 text-left bg-gradient-to-br from-primary-fixed to-primary-fixed-dim text-on-primary-container hover:brightness-105 transition-all active:scale-[0.98]"
        >
          <MaterialIcon name="add_circle" size={28} className="mb-2" filled />
          <div className="text-sm font-semibold leading-tight">Gruppe erstellen</div>
          <div className="text-[11px] opacity-70 mt-0.5">z.B. Legio Joseph</div>
        </button>
        <button
          onClick={() => setShowJoin(true)}
          className="rounded-2xl p-5 text-left bg-gradient-to-br from-secondary-container to-secondary-fixed text-on-secondary-container hover:brightness-105 transition-all active:scale-[0.98]"
        >
          <MaterialIcon name="group_add" size={28} className="mb-2" filled />
          <div className="text-sm font-semibold leading-tight">Beitreten mit Code</div>
          <div className="text-[11px] opacity-70 mt-0.5">6-stelliger Einladungscode</div>
        </button>
      </div>

      {/* Group list */}
      {loading ? (
        <p className="text-center text-on-surface-variant py-12">Lade…</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <MaterialIcon name="diversity_3" size={48} className="text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-sm">
            Du bist noch in keiner Gruppe.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="block glass-card rounded-3xl p-4 hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <MaterialIcon name="diversity_3" size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline italic text-lg text-on-surface mb-0.5 truncate">
                    {g.name}
                  </h3>
                  {g.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed truncate mb-1">
                      {g.description}
                    </p>
                  )}
                  <p className="text-[11px] text-on-surface-variant/80">
                    {g.member_count} {g.member_count === 1 ? "Mitglied" : "Mitglieder"}
                    {g.is_public && " · Öffentlich"}
                  </p>
                </div>
                <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="Neue Gruppe erstellen">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name der Gruppe"
            maxLength={80}
            className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none border border-outline-variant/10 focus:border-primary/30 mb-3"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung (optional)"
            maxLength={500}
            rows={3}
            className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none border border-outline-variant/10 focus:border-primary/30 mb-3 resize-none"
          />
          <label className="flex items-center gap-3 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-primary"
            />
            <div>
              <p className="text-sm text-on-surface">Öffentliche Gruppe</p>
              <p className="text-[11px] text-on-surface-variant">
                Sichtbar für alle, jeder kann beitreten
              </p>
            </div>
          </label>
          <button
            onClick={createGroup}
            disabled={busy || !name.trim()}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-medium hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {busy ? "Wird erstellt…" : "Gruppe erstellen"}
          </button>
        </Modal>
      )}

      {/* Join modal */}
      {showJoin && (
        <Modal onClose={() => setShowJoin(false)} title="Gruppe beitreten">
          <p className="text-sm text-on-surface-variant mb-4">
            Gib den 6-stelligen Einladungscode ein, den du erhalten hast.
          </p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full bg-surface-container-low rounded-2xl py-4 px-4 text-on-surface text-center text-2xl font-mono tracking-[0.5em] placeholder:text-on-surface-variant/40 outline-none border border-outline-variant/10 focus:border-primary/30 mb-5"
            autoFocus
          />
          <button
            onClick={joinByCode}
            disabled={busy || joinCode.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-medium hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {busy ? "Beitritt…" : "Beitreten"}
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-surface-container-lowest rounded-t-[2rem] md:rounded-[2rem] p-6 editorial-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5 md:hidden" />
        <h3 className="font-headline italic text-2xl text-on-surface mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
