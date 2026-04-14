"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { getPlanDayForDate } from "@/lib/bible-date";
import { OFFICIUM_OFFICES } from "@/data/officium-divinum";

export default function OfficiumIndex() {
  const locale = useLocale() as "de" | "en";
  const currentBibleDay = getPlanDayForDate();
  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <h1 className="font-headline italic text-4xl text-on-surface">Officium Divinum</h1>
      <p className="text-on-surface-variant text-sm mt-1 mb-2">
        Traditionelles Stundengebet nach dem Römischen Brevier 1962
      </p>
      <p className="text-[11px] text-on-surface-variant/70 italic mb-6">
        Latein und Deutsch parallel · Latein gemeinfrei · Deutsche Übersetzung nach Allioli
      </p>

      {/* Today's office (live from divinumofficium.com) */}
      <Link
        href="/officium/today"
        className="block mb-6 rounded-3xl p-5 bg-gradient-to-br from-primary to-primary-container text-on-primary hover:brightness-105 transition-all active:scale-[0.99] editorial-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-on-primary/15 flex items-center justify-center flex-shrink-0">
            <MaterialIcon name="today" size={28} filled />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline italic text-xl mb-0.5">Heutiges Offizium</h3>
            <p className="text-xs opacity-80">
              Alle Horen für jeden Tag · Tagesheilige · Festkalender
            </p>
          </div>
          <MaterialIcon name="chevron_right" size={20} className="opacity-70" />
        </div>
      </Link>

      <Link
        href={`/bibel/lesen?tag=${currentBibleDay}`}
        className="block mb-8 rounded-3xl p-5 bg-gradient-to-br from-secondary-fixed to-secondary-fixed-dim text-on-secondary-container hover:brightness-105 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <MaterialIcon name="menu_book" size={28} className="text-secondary" filled />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline italic text-xl text-on-surface mb-0.5">Bibel in einem Jahr</h3>
            <p className="text-xs text-on-surface-variant">
              Tageslesung der Schrift · heute Tag {currentBibleDay}
            </p>
          </div>
          <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/60" />
        </div>
      </Link>

      <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
        Statische Vorlagen
      </h2>
      <div className="space-y-3">
        {OFFICIUM_OFFICES.map((office) => (
          <Link
            key={office.hour}
            href={`/officium/${office.hour}`}
            className="block glass-card rounded-3xl p-5 hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MaterialIcon name={office.icon} size={24} className="text-primary" filled />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline italic text-xl text-on-surface mb-0.5">
                  {office.name.de}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold mb-1">
                  {office.name.la}
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {office.description[locale === "de" ? "de" : "de"]}
                </p>
              </div>
              <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-3xl bg-secondary-container/30 border border-secondary/20">
        <h3 className="font-headline italic text-lg text-on-surface mb-2">In Vorbereitung</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Laudes Matutinae · Prima · Tertia · Sexta · Nona · Matutinum
        </p>
        <p className="text-[11px] text-on-surface-variant/70 mt-2 italic">
          Diese Horen werden schrittweise hinzugefügt. Die Komplet ist in der Gebetsbibliothek verfügbar.
        </p>
      </div>
    </div>
  );
}
