"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "./material-icon";

interface Profile {
  id: string;
  display_name: string;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
  created_at: string;
}

interface FriendItem {
  friendshipId: string;
  friend: Profile;
  prayedToday: boolean;
  weeklyCount: number;
}

interface PendingRequest {
  friendshipId: string;
  from: Profile;
  createdAt: string;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Friends() {
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<Profile[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    // All friendships involving this user
    const { data: rows } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!rows) { setLoading(false); return; }

    // Collect friend profile IDs
    const friendIds = rows.map((r: FriendshipRow) =>
      r.requester_id === user.id ? r.addressee_id : r.requester_id
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", friendIds);

    const profileMap = new Map<string, Profile>(
      (profiles ?? []).map((p: Profile) => [p.id, p])
    );

    // Accepted friends → fetch prayer activity for the week
    const accepted = rows.filter((r: FriendshipRow) => r.status === "accepted");
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const friendList: FriendItem[] = [];
    for (const row of accepted) {
      const friendId = row.requester_id === user.id ? row.addressee_id : row.requester_id;
      const friend = profileMap.get(friendId);
      if (!friend) continue;

      const { data: sessions } = await supabase
        .from("prayer_sessions")
        .select("started_at")
        .eq("user_id", friendId)
        .eq("completed", true)
        .gte("started_at", weekStart.toISOString());

      const prayedToday = (sessions ?? []).some(
        (s: { started_at: string }) => new Date(s.started_at) >= todayStart
      );
      const weeklyCount = sessions?.length ?? 0;

      friendList.push({
        friendshipId: row.id,
        friend,
        prayedToday,
        weeklyCount,
      });
    }
    setFriends(friendList);

    // Incoming pending requests (where I'm the addressee)
    const incoming = rows
      .filter((r: FriendshipRow) => r.status === "pending" && r.addressee_id === user.id)
      .map((r: FriendshipRow) => ({
        friendshipId: r.id,
        from: profileMap.get(r.requester_id)!,
        createdAt: r.created_at,
      }))
      .filter((r) => r.from);
    setPending(incoming);

    // Outgoing pending requests (where I'm the requester)
    const outgoingReqs = rows
      .filter((r: FriendshipRow) => r.status === "pending" && r.requester_id === user.id)
      .map((r: FriendshipRow) => profileMap.get(r.addressee_id))
      .filter((p): p is Profile => !!p);
    setOutgoing(outgoingReqs);

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function searchPeople() {
    if (!searchQuery.trim() || !userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .ilike("display_name", `%${searchQuery.trim()}%`)
      .neq("id", userId)
      .limit(10);
    setSearchResults((data ?? []) as Profile[]);
  }

  async function sendRequest(addresseeId: string) {
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: userId, addressee_id: addresseeId, status: "pending" });
    if (error) {
      alert(`Fehler: ${error.message}`);
      return;
    }
    setSearchResults((r) => r.filter((p) => p.id !== addresseeId));
    load();
  }

  async function respondRequest(friendshipId: string, accept: boolean) {
    const supabase = createClient();
    await supabase
      .from("friendships")
      .update({ status: accept ? "accepted" : "declined", updated_at: new Date().toISOString() })
      .eq("id", friendshipId);
    load();
  }

  async function removeFriend(friendshipId: string) {
    const supabase = createClient();
    await supabase.from("friendships").delete().eq("id", friendshipId);
    load();
  }

  if (loading) return null;

  return (
    <div className="glass-card rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tertiary/15 flex items-center justify-center">
            <MaterialIcon name="diversity_3" size={20} className="text-tertiary" />
          </div>
          <div>
            <h3 className="font-headline italic text-lg text-on-surface">
              Gebetsfreunde
            </h3>
            <p className="text-xs text-on-surface-variant">
              {friends.length === 0 ? "Noch keine Freunde" : `${friends.length} ${friends.length === 1 ? "Freund" : "Freunde"}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
          aria-label="Freund hinzufügen"
        >
          <MaterialIcon name="person_add" size={20} />
        </button>
      </div>

      {/* Pending incoming requests */}
      {pending.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-secondary mb-2">
            {pending.length} {pending.length === 1 ? "neue Anfrage" : "neue Anfragen"}
          </p>
          {pending.map((req) => (
            <div key={req.friendshipId} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary-container/40 border border-secondary/20">
              <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-on-secondary-container text-sm font-semibold">
                {getInitials(req.from.display_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{req.from.display_name}</p>
                <p className="text-[10px] text-on-surface-variant">möchte dein Gebetsfreund werden</p>
              </div>
              <button
                onClick={() => respondRequest(req.friendshipId, true)}
                className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90"
              >
                Annehmen
              </button>
              <button
                onClick={() => respondRequest(req.friendshipId, false)}
                className="text-on-surface-variant/60 hover:text-on-surface"
                aria-label="Ablehnen"
              >
                <MaterialIcon name="close" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      {friends.length > 0 && (
        <div className="space-y-2">
          {friends.map((f) => (
            <div key={f.friendshipId} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="relative w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-on-primary-container text-sm font-semibold flex-shrink-0">
                {getInitials(f.friend.display_name)}
                {f.prayedToday && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface" title="Hat heute gebetet" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{f.friend.display_name}</p>
                <p className="text-[10px] text-on-surface-variant">
                  {f.weeklyCount > 0
                    ? `${f.weeklyCount} ${f.weeklyCount === 1 ? "Rosenkranz" : "Rosenkränze"} diese Woche`
                    : "Diese Woche noch nicht gebetet"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`${f.friend.display_name} aus Freunden entfernen?`)) {
                    removeFriend(f.friendshipId);
                  }
                }}
                className="text-on-surface-variant/40 hover:text-error"
                aria-label="Entfernen"
              >
                <MaterialIcon name="more_horiz" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Outgoing pending */}
      {outgoing.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
            Wartet auf Antwort
          </p>
          <div className="flex flex-wrap gap-2">
            {outgoing.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low text-xs text-on-surface-variant">
                <span>{p.display_name}</span>
                <MaterialIcon name="schedule" size={12} />
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && pending.length === 0 && outgoing.length === 0 && (
        <p className="text-sm text-on-surface-variant/60 text-center py-4">
          Lade Freunde ein, gemeinsam zu beten.
        </p>
      )}

      {/* Search modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowSearch(false)}>
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface-container-lowest rounded-t-[2rem] md:rounded-[2rem] p-6 editorial-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="font-headline italic text-2xl text-on-surface mb-4">
              Freund hinzufügen
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") searchPeople(); }}
                placeholder="Anzeigename suchen…"
                className="flex-1 bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none border border-outline-variant/10 focus:border-primary/30"
                autoFocus
              />
              <button
                onClick={searchPeople}
                className="px-5 py-3 bg-primary text-on-primary rounded-2xl text-sm font-medium hover:opacity-90 active:scale-95"
              >
                Suchen
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-on-primary-container text-sm font-semibold">
                    {getInitials(p.display_name)}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-on-surface truncate">{p.display_name}</span>
                  <button
                    onClick={() => sendRequest(p.id)}
                    className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold hover:opacity-90"
                  >
                    Anfragen
                  </button>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-center text-on-surface-variant text-sm py-4">
                  Keine Treffer
                </p>
              )}
            </div>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
              className="w-full mt-5 py-3 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container-highest"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
