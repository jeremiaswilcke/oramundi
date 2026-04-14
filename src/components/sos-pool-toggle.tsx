"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "./material-icon";

export function SosPoolToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [pseudonym, setPseudonym] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setEnabled(false); return; }
      const { data } = await supabase
        .from("sos_prayer_pool")
        .select("pseudonym, available_until")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const stillAvailable = !data.available_until || new Date(data.available_until) > new Date();
        setEnabled(stillAvailable);
        setPseudonym(data.pseudonym ?? "");
      } else {
        setEnabled(false);
      }
    }
    load();
  }, []);

  async function toggle() {
    setSaving(true);
    setSavedMsg(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (enabled) {
        await supabase.from("sos_prayer_pool").delete().eq("user_id", user.id);
        setEnabled(false);
      } else {
        await supabase
          .from("sos_prayer_pool")
          .upsert({
            user_id: user.id,
            pseudonym: pseudonym.trim() || null,
            available_until: null,
          }, { onConflict: "user_id" });
        setEnabled(true);
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function savePseudonym() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("sos_prayer_pool")
        .upsert({
          user_id: user.id,
          pseudonym: pseudonym.trim() || null,
        }, { onConflict: "user_id" });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (enabled === null) return null;

  return (
    <div className="glass-card rounded-3xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
            <MaterialIcon name="favorite" size={20} className="text-error" filled />
          </div>
          <div>
            <h3 className="font-headline italic text-lg text-on-surface">
              Gebetspartner-Pool
            </h3>
            <p className="text-xs text-on-surface-variant">
              Für andere im Moment der Versuchung da sein
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          aria-label="Im Pool verfügbar"
          className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
            enabled ? "bg-primary" : "bg-surface-container-highest"
          } disabled:opacity-60`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-surface-container-lowest rounded-full shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <p className="text-[11px] text-on-surface-variant/80 leading-relaxed mb-3">
        Wenn aktiv, kannst du von jemandem aus dem Herzensgebet-SOS zufällig ausgewählt werden.
        Der andere sieht nur deinen Pseudonym (oder Anzeigenamen), kein Profil, keine Nachrichten —
        Begegnung nur im Gebet selbst.
      </p>

      {enabled && (
        <div className="pt-3 border-t border-outline-variant/10">
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Pseudonym (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder={"z. B. \"Bruder im Gebet\""}
              maxLength={40}
              className="flex-1 bg-surface-container-low rounded-xl py-2.5 px-3 text-on-surface text-sm outline-none border border-outline-variant/10 focus:border-primary/30"
            />
            <button
              onClick={savePseudonym}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-60"
            >
              {savedMsg ? "✓" : "Speichern"}
            </button>
          </div>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">
            Wenn leer, wird dein Anzeigename verwendet.
          </p>
        </div>
      )}
    </div>
  );
}
