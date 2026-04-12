"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { PRAYER_LIBRARY } from "@/data/prayer-library";

export default function LibraryPage() {
  const locale = useLocale() as "de" | "en";
  const t = useTranslations("library");

  const litanies = PRAYER_LIBRARY.filter((p) => p.category === "litany");
  const hours = PRAYER_LIBRARY.filter((p) => p.category === "hour");

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <h1 className="font-headline italic text-4xl text-on-surface mb-2">
        {t("title")}
      </h1>
      <p className="text-on-surface-variant text-sm mb-8">
        {t("subtitle")}
      </p>

      {/* Litanies */}
      <section className="mb-8">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
          {t("litanies")}
        </h2>
        <div className="space-y-3">
          {litanies.map((p) => (
            <Link
              key={p.slug}
              href={`/library/${p.slug}`}
              className="flex items-start gap-3 glass-card rounded-3xl p-4 hover:bg-surface-container-high transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MaterialIcon name={p.icon} size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline italic text-lg text-on-surface mb-0.5">
                  {p.title[locale]}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {p.description[locale]}
                </p>
              </div>
              <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
            </Link>
          ))}
        </div>
      </section>

      {/* Hours */}
      <section>
        <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
          {t("hours")}
        </h2>
        <div className="space-y-3">
          {hours.map((p) => (
            <Link
              key={p.slug}
              href={`/library/${p.slug}`}
              className="flex items-start gap-3 glass-card rounded-3xl p-4 hover:bg-surface-container-high transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MaterialIcon name={p.icon} size={24} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-headline italic text-lg text-on-surface mb-0.5">
                  {p.title[locale]}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {p.description[locale]}
                </p>
              </div>
              <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/40" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
