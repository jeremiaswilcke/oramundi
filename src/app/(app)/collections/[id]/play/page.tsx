"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";
import { PRAYER_LIBRARY, type PrayerEntry } from "@/data/prayer-library";

interface Collection {
  id: string;
  name: string;
}

interface FlatStep {
  prayerIdx: number;
  stepIdx: number;
  prayer: PrayerEntry;
  prayerStepsLength: number;
  stepTitle?: { de: string; en: string };
  stepText: { de: string; en: string };
}

export default function PlayCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale() as "de" | "en";

  const [collection, setCollection] = useState<Collection | null>(null);
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState(0);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: col } = await supabase
      .from("user_prayer_collections")
      .select("id, name")
      .eq("id", id)
      .maybeSingle();
    if (!col) { setLoading(false); return; }
    setCollection(col as Collection);

    const { data: items } = await supabase
      .from("user_prayer_collection_items")
      .select("prayer_slug, sort_order")
      .eq("collection_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const resolved: PrayerEntry[] = [];
    for (const it of items ?? []) {
      const p = PRAYER_LIBRARY.find((x) => x.slug === it.prayer_slug);
      if (p) resolved.push(p);
    }
    setPrayers(resolved);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const flat: FlatStep[] = useMemo(() => {
    const out: FlatStep[] = [];
    prayers.forEach((p, prayerIdx) => {
      p.steps.forEach((s, stepIdx) => {
        out.push({
          prayerIdx,
          stepIdx,
          prayer: p,
          prayerStepsLength: p.steps.length,
          stepTitle: s.title,
          stepText: s.text,
        });
      });
    });
    return out;
  }, [prayers]);

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
  if (flat.length === 0) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center px-6">
        <p className="text-on-surface-variant mb-4">Diese Sammlung enthält noch keine Gebete.</p>
        <Link href={`/collections/${id}`} className="text-primary">Zur Sammlung</Link>
      </div>
    );
  }

  const step = flat[pos];
  const isFinished = pos === flat.length - 1;
  const progress = ((pos + 1) / flat.length) * 100;
  const isPrayerTransition = step.stepIdx === 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] px-4 pb-20 relative">
      <div className="absolute top-24 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -right-12 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-4 relative z-10">
        <Link
          href={`/collections/${id}`}
          className="flex items-center gap-2 text-on-surface-variant text-sm mb-3 hover:text-primary transition-colors"
        >
          <MaterialIcon name="chevron_left" size={20} />
          <span className="truncate">{collection.name}</span>
        </Link>

        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            Gebet {step.prayerIdx + 1}/{prayers.length} · Schritt {step.stepIdx + 1}/{step.prayerStepsLength}
          </span>
        </div>
        <p className="font-headline italic text-lg text-on-surface mb-2 truncate">
          {step.prayer.title[locale]}
        </p>
        {step.stepTitle && (
          <p className="text-sm text-on-surface-variant italic mb-2">
            {step.stepTitle[locale]}
          </p>
        )}

        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Prayer text */}
      <div className="flex-1 relative z-10">
        <div className="w-full bg-surface-container-lowest/60 backdrop-blur-md rounded-3xl p-6 md:p-8">
          {isPrayerTransition && step.prayerIdx > 0 && (
            <p className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-3">
              Nächstes Gebet
            </p>
          )}
          <p className="prayer-text text-on-surface text-base md:text-lg leading-[1.9] whitespace-pre-line">
            {step.stepText[locale]}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pt-6 pb-4 relative z-10">
        <button
          onClick={() => setPos((p) => Math.max(0, p - 1))}
          disabled={pos === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
        >
          <MaterialIcon name="chevron_left" size={28} className="text-on-surface-variant" />
        </button>

        {isFinished ? (
          <Link
            href={`/collections/${id}`}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
            aria-label="Fertig"
          >
            <MaterialIcon name="check" filled size={32} />
          </Link>
        ) : (
          <button
            onClick={() => setPos((p) => Math.min(flat.length - 1, p + 1))}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
          >
            <MaterialIcon name="chevron_right" size={32} />
          </button>
        )}
      </div>
    </div>
  );
}
