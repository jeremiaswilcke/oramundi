"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: cols } = await supabase
      .from("user_prayer_collections")
      .select("id, name, description")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!cols) { setLoading(false); return; }

    const out: Collection[] = [];
    for (const c of cols) {
      const { count } = await supabase
        .from("user_prayer_collection_items")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", c.id);
      out.push({ ...c, item_count: count ?? 0 });
    }
    setCollections(out);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createCollection() {
    if (!newName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Nicht angemeldet."); return; }
      const { error: insertErr } = await supabase
        .from("user_prayer_collections")
        .insert({ user_id: user.id, name: newName.trim() });
      if (insertErr) {
        setError(insertErr.message);
        return;
      }
      setNewName("");
      setCreating(false);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline italic text-4xl text-on-surface">
            Meine Sammlungen
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Persönliche Gebetsreihen — z. B. Morgengebet, Abendgebet
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          aria-label="Neue Sammlung"
          className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
        >
          <MaterialIcon name="add" size={20} />
        </button>
      </div>

      <Link
        href="/collections/discover"
        className="block mb-4 rounded-2xl p-4 bg-surface-container-high hover:bg-surface-container-highest transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MaterialIcon name="public" size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface">
              Geteilte Sammlungen entdecken
            </p>
            <p className="text-[11px] text-on-surface-variant">
              Von anderen öffentlich gemacht — kopier eine in deine eigenen
            </p>
          </div>
          <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
        </div>
      </Link>

      {creating && (
        <div className="glass-card rounded-2xl p-4 mb-4">
          {error && (
            <p className="text-xs text-error mb-2">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createCollection(); }}
              placeholder="Name der Sammlung (z. B. Mein Morgengebet)"
              maxLength={80}
              autoFocus
              className="flex-1 bg-surface-container-low rounded-xl py-2.5 px-3 text-on-surface text-sm outline-none border border-outline-variant/10 focus:border-primary/30"
            />
            <button
              onClick={createCollection}
              disabled={busy || !newName.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-60"
            >
              Anlegen
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-on-surface-variant py-12">Lade…</p>
      ) : collections.length === 0 && !creating ? (
        <div className="text-center py-16">
          <MaterialIcon name="folder_open" size={48} className="text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-sm mb-4">
            Noch keine Sammlung.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="px-6 py-3 rounded-full bg-primary text-on-primary font-medium"
          >
            Erste Sammlung anlegen
          </button>
          <p className="text-xs text-on-surface-variant/60 mt-4 max-w-xs mx-auto leading-relaxed">
            Füge aus der Gebetsbibliothek über das Lesezeichen-Symbol Gebete zu deinen Sammlungen hinzu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.id}`}
              className="block glass-card rounded-3xl p-4 hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MaterialIcon name="bookmark" size={24} className="text-primary" filled />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline italic text-lg text-on-surface mb-0.5 truncate">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant/80">
                    {c.item_count} {c.item_count === 1 ? "Gebet" : "Gebete"}
                  </p>
                </div>
                <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
