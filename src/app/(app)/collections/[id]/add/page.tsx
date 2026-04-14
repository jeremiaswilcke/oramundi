"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";
import { PRAYER_LIBRARY } from "@/data/prayer-library";

interface Collection {
  id: string;
  name: string;
  user_id: string;
}

type Category = "devotion" | "litany" | "hour" | "novena";

const CATEGORY_ORDER: Category[] = ["devotion", "litany", "hour", "novena"];

export default function AddPrayerToCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale() as "de" | "en";

  const [collection, setCollection] = useState<Collection | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      setUserId(user?.id ?? null);

      const { data: collectionData, error: collectionError } = await supabase
        .from("user_prayer_collections")
        .select("id, name, user_id")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;

      if (collectionError || !collectionData) {
        setCollection(null);
        setLoading(false);
        setError(collectionError?.message ?? "Sammlung nicht gefunden.");
        return;
      }

      setCollection(collectionData as Collection);

      const { data: items, error: itemsError } = await supabase
        .from("user_prayer_collection_items")
        .select("prayer_slug")
        .eq("collection_id", id);

      if (!active) return;

      if (itemsError) {
        setLoading(false);
        setError(itemsError.message);
        return;
      }

      setSelected(new Set((items ?? []).map((item) => item.prayer_slug)));
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  const visiblePrayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return PRAYER_LIBRARY.filter((prayer) => {
      if (!query) return true;
      return (
        prayer.title[locale].toLowerCase().includes(query) ||
        prayer.description[locale].toLowerCase().includes(query)
      );
    });
  }, [locale, search]);

  const sections = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: visiblePrayers.filter((prayer) => prayer.category === category),
    })).filter((section) => section.items.length > 0);
  }, [visiblePrayers]);

  async function togglePrayer(slug: string, isSelected: boolean) {
    setBusySlug(slug);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("set_prayer_collection_item", {
        p_collection_id: id,
        p_prayer_slug: slug,
        p_should_exist: !isSelected,
      });

      if (rpcError) {
        throw rpcError;
      }

      setSelected((current) => {
        const next = new Set(current);
        if (isSelected) {
          next.delete(slug);
        } else {
          next.add(slug);
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gebet konnte nicht gespeichert werden.");
    } finally {
      setBusySlug(null);
    }
  }

  const isOwner = !!collection && !!userId && collection.user_id === userId;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex items-center justify-center text-on-surface-variant">
        Lade…
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
        <Link
          href="/collections"
          className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
        >
          <MaterialIcon name="chevron_left" size={20} />
          Meine Sammlungen
        </Link>
        <p className="text-on-surface-variant">{error ?? "Sammlung nicht gefunden."}</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
        <Link
          href={`/collections/${id}`}
          className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
        >
          <MaterialIcon name="chevron_left" size={20} />
          Zur Sammlung
        </Link>
        <p className="text-on-surface-variant">
          Nur die Besitzerin oder der Besitzer kann Gebete zu dieser Sammlung hinzufügen.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href={`/collections/${id}`}
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        Zur Sammlung
      </Link>

      <div className="mb-6">
        <h1 className="font-headline italic text-3xl text-on-surface mb-1">
          {locale === "de" ? "Gebete hinzufügen" : "Add Prayers"}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {locale === "de"
            ? `Wähle Gebete für „${collection.name}“ direkt in der Liste aus.`
            : `Select prayers for “${collection.name}” directly from the list.`}
        </p>
      </div>

      <div className="glass-card rounded-3xl p-4 mb-5">
        <label className="block text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
          {locale === "de" ? "Suche" : "Search"}
        </label>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={locale === "de" ? "Gebet suchen" : "Search prayer"}
          className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-on-surface text-sm outline-none border border-outline-variant/10 focus:border-primary/30"
        />
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          {locale === "de" ? "Keine Gebete gefunden." : "No prayers found."}
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.category}>
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
                {section.category === "devotion"
                  ? locale === "de"
                    ? "Andachten"
                    : "Devotions"
                  : section.category === "litany"
                    ? locale === "de"
                      ? "Litaneien"
                      : "Litanies"
                    : section.category === "hour"
                      ? locale === "de"
                        ? "Stundengebet"
                        : "Hours"
                      : locale === "de"
                        ? "Novenen"
                        : "Novenas"}
              </h2>

              <div className="space-y-3">
                {section.items.map((prayer) => {
                  const isSelected = selected.has(prayer.slug);
                  const isBusy = busySlug === prayer.slug;

                  return (
                    <button
                      key={prayer.slug}
                      onClick={() => void togglePrayer(prayer.slug, isSelected)}
                      disabled={isBusy}
                      className={`w-full flex items-start gap-3 rounded-3xl p-4 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/10"
                          : "glass-card hover:bg-surface-container-high"
                      } disabled:opacity-60`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MaterialIcon name={prayer.icon} size={22} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-headline italic text-lg text-on-surface mb-0.5">
                          {prayer.title[locale]}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {prayer.description[locale]}
                        </p>
                      </div>
                      <div className="pt-1 text-primary flex-shrink-0">
                        <MaterialIcon
                          name={isSelected ? "check_box" : "check_box_outline_blank"}
                          size={24}
                          filled={isSelected}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
