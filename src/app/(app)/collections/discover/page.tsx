"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

interface PublicCollection {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  owner_name: string;
  item_count: number;
  created_at: string;
}

export default function DiscoverCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("list_public_collections", {
      p_limit: 50,
      p_offset: 0,
    });
    setCollections((data ?? []) as PublicCollection[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function clone(id: string) {
    setCloning(id);
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
      setCloning(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href="/collections"
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        Meine Sammlungen
      </Link>

      <h1 className="font-headline italic text-3xl text-on-surface mb-1">
        Geteilte Sammlungen entdecken
      </h1>
      <p className="text-on-surface-variant text-sm mb-6">
        Von anderen öffentlich geteilt — kopier eine in deine eigenen.
      </p>

      {loading ? (
        <p className="text-center text-on-surface-variant py-12">Lade…</p>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <MaterialIcon name="public_off" size={48} className="text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-sm">
            Noch keine öffentlichen Sammlungen. Sei die erste Person, die eine teilt!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="glass-card rounded-3xl p-4"
            >
              <Link href={`/collections/${c.id}`} className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MaterialIcon name={c.icon ?? "bookmark"} size={24} className="text-primary" filled />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline italic text-lg text-on-surface mb-0.5 truncate">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-1">
                      {c.description}
                    </p>
                  )}
                  <p className="text-[11px] text-on-surface-variant/70">
                    von {c.owner_name} · {c.item_count} {c.item_count === 1 ? "Gebet" : "Gebete"}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => clone(c.id)}
                disabled={cloning === c.id}
                className="w-full py-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 disabled:opacity-60"
              >
                {cloning === c.id ? "Kopiere…" : "In meine Sammlungen kopieren"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
