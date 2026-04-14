"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "./material-icon";

interface Collection {
  id: string;
  name: string;
  containsSlug: boolean;
}

export function AddToCollectionButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadCollections() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCollections([]); return; }

    const { data: cols } = await supabase
      .from("user_prayer_collections")
      .select("id, name")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    if (!cols) { setCollections([]); return; }

    const { data: items } = await supabase
      .from("user_prayer_collection_items")
      .select("collection_id")
      .eq("prayer_slug", slug);

    const containedIn = new Set((items ?? []).map((i) => i.collection_id));
    setCollections(cols.map((c) => ({
      id: c.id,
      name: c.name,
      containsSlug: containedIn.has(c.id),
    })));
  }

  useEffect(() => {
    if (open && collections === null) loadCollections();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(c: Collection) {
    setBusy(true);
    try {
      const supabase = createClient();
      if (c.containsSlug) {
        const { error } = await supabase
          .from("user_prayer_collection_items")
          .delete()
          .eq("collection_id", c.id)
          .eq("prayer_slug", slug);
        if (error) { alert(`Fehler: ${error.message}`); return; }
      } else {
        const { error } = await supabase
          .from("user_prayer_collection_items")
          .insert({ collection_id: c.id, prayer_slug: slug });
        if (error) { alert(`Fehler: ${error.message}`); return; }
      }
      await loadCollections();
    } finally {
      setBusy(false);
    }
  }

  async function createCollection() {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: col, error } = await supabase
        .from("user_prayer_collections")
        .insert({ user_id: user.id, name: newName.trim() })
        .select("id")
        .single();
      if (error || !col) {
        alert(`Fehler: ${error?.message ?? "Anlegen fehlgeschlagen"}`);
        return;
      }
      const { error: itemErr } = await supabase
        .from("user_prayer_collection_items")
        .insert({ collection_id: col.id, prayer_slug: slug });
      if (itemErr) {
        alert(`Fehler: ${itemErr.message}`);
        return;
      }
      setNewName("");
      setCreating(false);
      await loadCollections();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Zu Sammlung hinzufügen"
        className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
      >
        <MaterialIcon name="bookmark_add" size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          onClick={() => { setOpen(false); setCreating(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-background rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-2xl border border-outline-variant/30 mx-3 md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="font-headline italic text-2xl text-on-surface mb-4">
              Zu Sammlung hinzufügen
            </h3>

            {collections === null ? (
              <p className="text-center text-on-surface-variant py-6">Lade…</p>
            ) : collections.length === 0 && !creating ? (
              <>
                <p className="text-sm text-on-surface-variant mb-4">
                  Noch keine Sammlungen. Leg dir z. B. „Mein Morgengebet" an.
                </p>
                <button
                  onClick={() => setCreating(true)}
                  className="w-full py-3 rounded-full bg-primary text-on-primary font-medium"
                >
                  Neue Sammlung anlegen
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggle(c)}
                      disabled={busy}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                        c.containsSlug
                          ? "bg-primary/10"
                          : "bg-surface-container-low hover:bg-surface-container-high"
                      } disabled:opacity-60`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        c.containsSlug ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        <MaterialIcon name={c.containsSlug ? "check" : "folder"} size={16} />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-on-surface truncate">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>

                {creating ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") createCollection(); }}
                      placeholder="Name der Sammlung"
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
                ) : (
                  <button
                    onClick={() => setCreating(true)}
                    className="w-full py-2.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold hover:bg-surface-container-highest"
                  >
                    + Neue Sammlung
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => { setOpen(false); setCreating(false); }}
              className="w-full mt-4 py-2 text-sm text-on-surface-variant hover:text-primary"
            >
              Schließen
            </button>

            {collections && collections.length > 0 && (
              <button
                onClick={() => { setOpen(false); router.push("/collections"); }}
                className="w-full mt-2 py-2 text-xs text-on-surface-variant/60 hover:text-primary"
              >
                Alle Sammlungen verwalten →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
