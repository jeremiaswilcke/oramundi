"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";

type Hour = "matutinum" | "laudes" | "prima" | "tertia" | "sexta" | "nona" | "vesperae" | "completorium";
type Lang = "la" | "de" | "parallel";

const HOURS: { key: Hour; label: string; icon: string }[] = [
  { key: "matutinum", label: "Matutinum", icon: "nightlight" },
  { key: "laudes", label: "Laudes", icon: "wb_sunny" },
  { key: "prima", label: "Prima", icon: "schedule" },
  { key: "tertia", label: "Tertia", icon: "schedule" },
  { key: "sexta", label: "Sexta", icon: "wb_sunny" },
  { key: "nona", label: "Nona", icon: "schedule" },
  { key: "vesperae", label: "Vesperae", icon: "wb_twilight" },
  { key: "completorium", label: "Completorium", icon: "bedtime" },
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TodaysOfficiumPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [hour, setHour] = useState<Hour>(() => {
    const h = new Date().getHours();
    if (h < 6) return "matutinum";
    if (h < 9) return "laudes";
    if (h < 12) return "tertia";
    if (h < 15) return "sexta";
    if (h < 17) return "nona";
    if (h < 21) return "vesperae";
    return "completorium";
  });
  const [lang, setLang] = useState<Lang>("parallel");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    title: string;
    liturgicalDay: string;
    bodyHtml: string;
    sourceUrl: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/officium/${formatDate(date)}/${hour}?lang=${lang}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Fehler");
        setData(null);
      } else {
        setData(json);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [date, hour, lang]);

  useEffect(() => { load(); }, [load]);

  function changeDay(delta: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + delta);
    setDate(next);
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-4 pt-4 pb-20">
      <button
        onClick={() => router.push("/officium")}
        className="flex items-center gap-2 text-on-surface-variant text-sm mb-3 hover:text-primary transition-colors"
      >
        <MaterialIcon name="chevron_left" size={20} />
        <span>Officium Divinum</span>
      </button>

      {/* Date + hour selectors */}
      <div className="space-y-3 mb-5">
        {/* Date picker */}
        <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl p-2">
          <button
            onClick={() => changeDay(-1)}
            className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center"
            aria-label="Vortag"
          >
            <MaterialIcon name="chevron_left" size={20} />
          </button>
          <div className="flex-1 text-center">
            <p className="prayer-title prayer-title--sm text-on-surface">
              {formatDisplay(date, "de-DE")}
            </p>
            {data?.liturgicalDay && (
              <p className="mess-eyebrow--serif-caps text-secondary mt-0.5">
                {data.liturgicalDay}
              </p>
            )}
          </div>
          <button
            onClick={() => changeDay(1)}
            className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center"
            aria-label="Folgetag"
          >
            <MaterialIcon name="chevron_right" size={20} />
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20"
          >
            Heute
          </button>
        </div>

        {/* Hour selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
          {HOURS.map((h) => (
            <button
              key={h.key}
              onClick={() => setHour(h.key)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                hour === h.key
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <MaterialIcon name={h.icon} size={18} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{h.label}</span>
            </button>
          ))}
        </div>

        {/* Language toggle */}
        <div className="flex items-center justify-end">
          <div className="flex items-center bg-surface-container-low rounded-full p-0.5">
            {([
              { v: "la" as Lang, label: "LA" },
              { v: "parallel" as Lang, label: "LA + DE" },
              { v: "de" as Lang, label: "DE" },
            ]).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setLang(opt.v)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  lang === opt.v
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-surface-container-lowest/60 backdrop-blur-md rounded-3xl p-5 md:p-8 min-h-[400px]">
        {loading && (
          <p className="text-center text-on-surface-variant py-12">Lade Offizium…</p>
        )}
        {error && (
          <div className="text-center py-12">
            <MaterialIcon name="error_outline" size={48} className="text-error/40 mb-3" />
            <p className="text-on-surface-variant">{error}</p>
          </div>
        )}
        {!loading && !error && data && (
          <>
            {data.title && (
              <h2 className="prayer-title text-on-surface text-center mb-6">
                {data.title}
              </h2>
            )}
            <div
              className="officium-content prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
            />
            <p className="text-[10px] text-on-surface-variant/50 text-center mt-8 italic">
              Quelle: divinumofficium.com · Texte gemeinfrei
            </p>
          </>
        )}
      </div>
    </div>
  );
}
