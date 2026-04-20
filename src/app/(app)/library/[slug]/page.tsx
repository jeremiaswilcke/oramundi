"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { PRAYER_LIBRARY } from "@/data/prayer-library";
import { AddToCollectionButton } from "@/components/add-to-collection-button";

export default function PrayerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const locale = useLocale() as "de" | "en";
  const t = useTranslations("pray");
  const [currentStep, setCurrentStep] = useState(0);

  const prayer = PRAYER_LIBRARY.find((p) => p.slug === slug);

  if (!prayer) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center px-6">
        <p className="text-on-surface-variant">Not found</p>
        <button onClick={() => router.back()} className="mt-4 text-primary">
          {t("previous")}
        </button>
      </div>
    );
  }

  const step = prayer.steps[currentStep];
  const progress = ((currentStep + 1) / prayer.steps.length) * 100;
  const isFinished = currentStep === prayer.steps.length - 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] px-4 pb-20 relative">
      <div className="absolute top-24 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -right-12 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-4 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-on-surface-variant text-sm hover:text-primary transition-colors min-w-0"
          >
            <MaterialIcon name="chevron_left" size={20} />
            <span className="truncate">{prayer.title[locale]}</span>
          </button>
          <AddToCollectionButton slug={prayer.slug} />
        </div>

        {step.title && (
          <h2 className="prayer-title text-on-surface mb-2">
            {step.title[locale]}
          </h2>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="mess-eyebrow--serif-caps text-on-surface-variant liturgical-number">
            {currentStep + 1} / {prayer.steps.length}
          </span>
        </div>

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
          <p
            className={`prayer-text text-on-surface text-base md:text-lg whitespace-pre-line ${
              step.text[locale].length > 220 ? "prayer-body--leading" : ""
            }`}
          >
            {step.text[locale]}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pt-6 pb-4 relative z-10">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
        >
          <MaterialIcon name="chevron_left" size={28} className="text-on-surface-variant" />
        </button>

        {isFinished ? (
          <button
            onClick={() => router.push("/library")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
          >
            <MaterialIcon name="check" filled size={32} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep((s) => Math.min(prayer.steps.length - 1, s + 1))}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
          >
            <MaterialIcon name="chevron_right" size={32} />
          </button>
        )}
      </div>
    </div>
  );
}
