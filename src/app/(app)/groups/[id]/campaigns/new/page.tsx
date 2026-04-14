"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

type PrayerKind = "rosary" | "mercy_chaplet" | "library" | "custom";

const DURATION_PRESETS = [
  { days: 9, label: "Novene (9 Tage)" },
  { days: 30, label: "30 Tage" },
  { days: 40, label: "40 Tage" },
  { days: 54, label: "54 Tage (große Novene)" },
  { days: 0, label: "Eigene Dauer" },
];

const KIND_LABELS: Record<PrayerKind, string> = {
  rosary: "Rosenkranz",
  mercy_chaplet: "Barmherzigkeitsrosenkranz",
  library: "Gebet aus der Bibliothek",
  custom: "Freies Gebet",
};

export default function NewCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [intention, setIntention] = useState("");
  const [prayerKind, setPrayerKind] = useState<PrayerKind>("rosary");
  const [prayerKindRef, setPrayerKindRef] = useState("");
  const [durationPreset, setDurationPreset] = useState(9);
  const [customDays, setCustomDays] = useState(9);
  const [startsOn, setStartsOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setError(null);
    if (!title.trim()) { setError("Titel fehlt."); return; }
    const duration = durationPreset === 0 ? customDays : durationPreset;
    if (duration < 1 || duration > 365) { setError("Dauer muss zwischen 1 und 365 Tagen liegen."); return; }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_group_campaign", {
        p_group_id: id,
        p_title: title.trim(),
        p_intention: intention.trim(),
        p_prayer_kind: prayerKind,
        p_prayer_kind_ref: prayerKindRef.trim(),
        p_duration_days: duration,
        p_starts_on: startsOn,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(`/groups/${id}/campaigns/${data}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href={`/groups/${id}`}
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-6"
      >
        <MaterialIcon name="chevron_left" size={20} />
        Zurück zur Gruppe
      </Link>

      <h1 className="font-headline italic text-3xl text-on-surface mb-6">
        Neue Gebetsaktion
      </h1>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Titel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Novene zum hl. Josef"
            maxLength={120}
            className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface outline-none border border-outline-variant/10 focus:border-primary/30"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Anliegen
          </label>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Wofür betet ihr gemeinsam?"
            maxLength={1000}
            rows={4}
            className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface outline-none border border-outline-variant/10 focus:border-primary/30 resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Gebetsart
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(KIND_LABELS) as PrayerKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setPrayerKind(k)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  prayerKind === k
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>
          {(prayerKind === "library" || prayerKind === "custom") && (
            <input
              type="text"
              value={prayerKindRef}
              onChange={(e) => setPrayerKindRef(e.target.value)}
              placeholder={prayerKind === "library" ? "Name aus der Bibliothek" : "Freier Hinweis (z. B. täglich 1 Vater unser)"}
              maxLength={200}
              className="w-full mt-2 bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface outline-none border border-outline-variant/10 focus:border-primary/30"
            />
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Dauer
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d.days}
                onClick={() => setDurationPreset(d.days)}
                className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  durationPreset === d.days
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {durationPreset === 0 && (
            <input
              type="number"
              min={1}
              max={365}
              value={customDays}
              onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
              className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface outline-none border border-outline-variant/10 focus:border-primary/30"
            />
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
            Startdatum
          </label>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="w-full bg-surface-container-low rounded-2xl py-3 px-4 text-on-surface outline-none border border-outline-variant/10 focus:border-primary/30"
          />
        </div>

        {error && <p className="text-xs text-error text-center">{error}</p>}

        <button
          onClick={create}
          disabled={busy || !title.trim()}
          className="w-full py-4 rounded-full bg-primary text-on-primary font-semibold disabled:opacity-60"
        >
          {busy ? "Starte..." : "Gebetsaktion starten"}
        </button>
      </div>
    </div>
  );
}
