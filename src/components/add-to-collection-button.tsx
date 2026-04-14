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
  const [error, setError] = useState<string | null>(null);

  function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  async function loadCollections() {
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setCollections([]);
        setError("Bitte melde dich an, um Gebete zu Sammlungen hinzuzufügen.");
        return;
      }

      const { data: cols, error: collectionsError } = await supabase
        .from("user_prayer_collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (collectionsError) throw collectionsError;

      if (!cols || cols.length === 0) {
        setCollections([]);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from("user_prayer_collection_items")
        .select("collection_id")
        .eq("prayer_slug", slug);

      if (itemsError) throw itemsError;

      const containedIn = new Set((items ?? []).map((item) => item.collection_id));
      setCollections(
        cols.map((collection) => ({
          id: collection.id,
          name: collection.name,
          containsSlug: containedIn.has(collection.id),
        }))
      );
    } catch (err) {
      setCollections([]);
      setError(getErrorMessage(err, "Sammlungen konnten nicht geladen werden."));
    }
  }

  useEffect(() => {
    if (!open) return;

    setCollections(null);
    void loadCollections();
  }, [open, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(collection: Collection) {
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: mutationError } = await supabase.rpc(
        "set_prayer_collection_item",
        {
          p_collection_id: collection.id,
          p_prayer_slug: slug,
          p_should_exist: !collection.containsSlug,
        }
      );

      if (mutationError && mutationError.code !== "23505") {
        throw mutationError;
      }

      await loadCollections();
    } catch (err) {
      setError(
        getErrorMessage(err, "Das Gebet konnte nicht zur Sammlung hinzugefügt werden.")
      );
    } finally {
      setBusy(false);
    }
  }

  async function createCollection() {
    if (!newName.trim()) return;

    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setError("Bitte melde dich an, um Sammlungen anzulegen.");
        return;
      }

      const { data: collection, error: collectionError } = await supabase
        .from("user_prayer_collections")
        .insert({ user_id: user.id, name: newName.trim() })
        .select("id")
        .single();

      if (collectionError || !collection) {
        setError(collectionError?.message ?? "Anlegen fehlgeschlagen");
        return;
      }

      const { error: itemError } = await supabase.rpc("set_prayer_collection_item", {
        p_collection_id: collection.id,
        p_prayer_slug: slug,
        p_should_exist: true,
      });

      if (itemError) {
        setError(itemError.message);
        return;
      }

      setNewName("");
      setCreating(false);
      await loadCollections();
    } catch (err) {
      setError(getErrorMessage(err, "Die Sammlung konnte nicht angelegt werden."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setCollections(null);
          setCreating(false);
          setNewName("");
          setOpen(true);
        }}
        aria-label="Zu Sammlung hinzufügen"
        className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
      >
        <MaterialIcon name="bookmark_add" size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          onClick={() => {
            setOpen(false);
            setCreating(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-background rounded-t-[2rem] md:rounded-[2rem] p-6 shadow-2xl border border-outline-variant/30 mx-3 md:mx-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="font-headline italic text-2xl text-on-surface mb-4">
              Zu Sammlung hinzufügen
            </h3>

            {error && (
              <p className="mb-4 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
                {error}
              </p>
            )}

            {collections === null ? (
              <p className="text-center text-on-surface-variant py-6">Lade…</p>
            ) : collections.length === 0 && !creating ? (
              <>
                <p className="text-sm text-on-surface-variant mb-4">
                  Noch keine Sammlungen. Leg dir z. B. „Mein Morgengebet“ an.
                </p>
                <button
                  onClick={() => setCreating(true)}
                  disabled={busy}
                  className="w-full py-3 rounded-full bg-primary text-on-primary font-medium disabled:opacity-60"
                >
                  Neue Sammlung anlegen
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => toggle(collection)}
                      disabled={busy}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${
                        collection.containsSlug
                          ? "bg-primary/10"
                          : "bg-surface-container-low hover:bg-surface-container-high"
                      } disabled:opacity-60`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          collection.containsSlug
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        <MaterialIcon
                          name={collection.containsSlug ? "check" : "folder"}
                          size={16}
                        />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-on-surface truncate">
                        {collection.name}
                      </span>
                    </button>
                  ))}
                </div>

                {creating ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void createCollection();
                      }}
                      placeholder="Name der Sammlung"
                      maxLength={80}
                      autoFocus
                      className="flex-1 bg-surface-container-low rounded-xl py-2.5 px-3 text-on-surface text-sm outline-none border border-outline-variant/10 focus:border-primary/30"
                    />
                    <button
                      onClick={() => void createCollection()}
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
              onClick={() => {
                setOpen(false);
                setCreating(false);
              }}
              className="w-full mt-4 py-2 text-sm text-on-surface-variant hover:text-primary"
            >
              Schließen
            </button>

            {collections && collections.length > 0 && (
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/collections");
                }}
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
