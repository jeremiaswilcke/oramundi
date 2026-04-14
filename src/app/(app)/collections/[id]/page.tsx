"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";
import { PRAYER_LIBRARY } from "@/data/prayer-library";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
}

interface Item {
  id: string;
  prayer_slug: string;
  sort_order: number;
}

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const locale = useLocale() as "de" | "en";

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [cloning, setCloning] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const { data: col } = await supabase
      .from("user_prayer_collections")
      .select("id, name, description, is_public, user_id")
      .eq("id", id)
      .maybeSingle();
    if (!col) { setLoading(false); return; }
    setCollection(col as Collection);
    setName(col.name);

    const { data: its } = await supabase
      .from("user_prayer_collection_items")
      .select("id, prayer_slug, sort_order")
      .eq("collection_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setItems((its ?? []) as Item[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("user_prayer_collection_items").delete().eq("id", itemId);
    await load();
  }

  async function move(item: Item, direction: -1 | 1) {
    const idx = items.findIndex((i) => i.id === item.id);
    const other = items[idx + direction];
    if (!other) return;
    const supabase = createClient();
    await supabase
      .from("user_prayer_collection_items")
      .update({ sort_order: other.sort_order })
      .eq("id", item.id);
    await supabase
      .from("user_prayer_collection_items")
      .update({ sort_order: item.sort_order })
      .eq("id", other.id);
    // Fallback for ties: reassign sequential sort_order on swap
    await supabase
      .from("user_prayer_collection_items")
      .update({ sort_order: idx + direction })
      .eq("id", item.id);
    await supabase
      .from("user_prayer_collection_items")
      .update({ sort_order: idx })
      .eq("id", other.id);
    await load();
  }

  async function rename() {
    if (!name.trim()) return;
    const supabase = createClient();
    await supabase
      .from("user_prayer_collections")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", id);
    setEditing(false);
    await load();
  }

  async function deleteCollection() {
    if (!confirm(`Sammlung "${collection?.name}" wirklich löschen?`)) return;
    const supabase = createClient();
    await supabase.from("user_prayer_collections").delete().eq("id", id);
    router.push("/collections");
  }

  async function togglePublic() {
    if (!collection) return;
    const supabase = createClient();
    await supabase
      .from("user_prayer_collections")
      .update({ is_public: !collection.is_public, updated_at: new Date().toISOString() })
      .eq("id", id);
    await load();
  }

  async function cloneCollection() {
    setCloning(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("clone_prayer_collection", {
        p_source_id: id,
      });
      if (error) {
        alert(`Fehler: ${error.message}`);
        return;
      }
      router.push(`/collections/${data}`);
    } finally {
      setCloning(false);
    }
  }

  const isOwner = collection && userId === collection.user_id;

  if (loading) {
    return <div className="min-h-[calc(100vh-7.5rem)] flex items-center justify-center text-on-surface-variant">Lade…</div>;
  }
  if (!collection) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center px-6">
        <p className="text-on-surface-variant mb-4">Sammlung nicht gefunden.</p>
        <Link href="/collections" className="text-primary">Zurück</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        Alle Sammlungen
      </Link>

      <div className="mb-6">
        {editing && isOwner ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") rename(); }}
              maxLength={80}
              autoFocus
              className="flex-1 bg-surface-container-low rounded-xl py-2.5 px-3 text-on-surface text-lg font-headline italic outline-none border border-outline-variant/10 focus:border-primary/30"
            />
            <button
              onClick={rename}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
            >
              OK
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-headline italic text-3xl text-on-surface flex-1 min-w-0 truncate">
              {collection.name}
              {collection.is_public && (
                <MaterialIcon name="public" size={20} className="inline ml-2 text-primary" />
              )}
            </h1>
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                aria-label="Umbenennen"
                className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary"
              >
                <MaterialIcon name="edit" size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <MaterialIcon name="auto_stories" size={48} className="text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-sm mb-4">
            Noch keine Gebete in dieser Sammlung.
          </p>
          <Link
            href={`/collections/${id}/add`}
            className="inline-block px-6 py-3 rounded-full bg-primary text-on-primary font-medium"
          >
            Gebete auswählen
          </Link>
          <p className="text-xs text-on-surface-variant/60 mt-4 max-w-xs mx-auto leading-relaxed">
            In der Gebetsbibliothek über das Lesezeichen-Symbol Gebete zu dieser Sammlung hinzufügen.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {items.map((item, idx) => {
            const prayer = PRAYER_LIBRARY.find((p) => p.slug === item.prayer_slug);
            if (!prayer) {
              return (
                <div key={item.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <MaterialIcon name="error" size={20} className="text-on-surface-variant" />
                  </div>
                  <p className="flex-1 text-sm text-on-surface-variant">Gebet nicht mehr verfügbar ({item.prayer_slug})</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-on-surface-variant/40 hover:text-error"
                    aria-label="Entfernen"
                  >
                    <MaterialIcon name="close" size={18} />
                  </button>
                </div>
              );
            }
            return (
              <div key={item.id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(item, -1)}
                    disabled={idx === 0}
                    className="w-6 h-6 flex items-center justify-center text-on-surface-variant/60 disabled:opacity-20"
                    aria-label="Nach oben"
                  >
                    <MaterialIcon name="expand_less" size={18} />
                  </button>
                  <button
                    onClick={() => move(item, 1)}
                    disabled={idx === items.length - 1}
                    className="w-6 h-6 flex items-center justify-center text-on-surface-variant/60 disabled:opacity-20"
                    aria-label="Nach unten"
                  >
                    <MaterialIcon name="expand_more" size={18} />
                  </button>
                </div>
                <Link
                  href={`/library/${prayer.slug}`}
                  className="flex-1 min-w-0 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MaterialIcon name={prayer.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {prayer.title[locale]}
                    </p>
                    <p className="text-[11px] text-on-surface-variant/80 truncate">
                      {prayer.description[locale]}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-on-surface-variant/40 hover:text-error"
                  aria-label="Entfernen"
                >
                  <MaterialIcon name="close" size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {items.length > 0 && (
          <Link
            href={`/collections/${id}/play`}
            className="block w-full py-3 rounded-full bg-primary text-on-primary text-center font-semibold hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Sammlung beten
          </Link>
        )}
        {isOwner && (
          <>
            <Link
              href={`/collections/${id}/add`}
              className="block w-full py-3 rounded-full bg-surface-container-high text-on-surface-variant text-center text-sm font-medium hover:bg-surface-container-highest"
            >
              Gebet aus Bibliothek hinzufügen
            </Link>
            <button
              onClick={togglePublic}
              className="block w-full py-3 rounded-full bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container-highest"
            >
              {collection.is_public
                ? "Nicht mehr öffentlich teilen"
                : "Öffentlich teilen"}
            </button>
            <button
              onClick={deleteCollection}
              className="block w-full py-3 rounded-full bg-error-container text-on-error-container text-sm font-medium hover:opacity-90"
            >
              Sammlung löschen
            </button>
          </>
        )}
        {!isOwner && (
          <button
            onClick={cloneCollection}
            disabled={cloning}
            className="block w-full py-3 rounded-full bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 disabled:opacity-60"
          >
            {cloning ? "Kopiere…" : "In meine Sammlungen kopieren"}
          </button>
        )}
      </div>
    </div>
  );
}
