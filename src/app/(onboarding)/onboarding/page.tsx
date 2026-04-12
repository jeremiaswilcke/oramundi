"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import Link from "next/link";

const STEP_KEYS = [
  { headline: "step1Title", subline: "step1Sub" },
  { headline: "step2Title", subline: "step2Sub" },
  { headline: "step3Title", subline: "step3Sub" },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const current = STEP_KEYS[step];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[20%] -left-20 w-64 h-64 bg-primary-fixed-dim/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] -right-20 w-80 h-80 bg-secondary-fixed/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center px-6 h-16 bg-surface/80 backdrop-blur-xl editorial-shadow">
        <span className="text-2xl font-headline italic text-on-surface">Ora Mundi</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 pt-16">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-headline leading-tight text-on-surface tracking-tight mb-6">
            {t(current.headline)}
          </h1>
          <p className="text-on-surface-variant text-center text-lg leading-relaxed mb-12 max-w-xs font-light">
            {t(current.subline)}
          </p>

          {/* Progress dots */}
          <div className="flex gap-2 mb-8">
            {STEP_KEYS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-8 bg-primary"
                    : i < step
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-outline-variant/40"
                }`}
              />
            ))}
          </div>

          {/* Action */}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary text-center font-medium tracking-wide text-lg rounded-full shadow-xl shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
            >
              {tc("continue")}
            </button>
          ) : (
            <Link
              href="/auth"
              className="block w-full max-w-xs py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary text-center font-medium tracking-wide text-lg rounded-full shadow-xl shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
            >
              {t("getStarted")}
            </Link>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-4 text-on-surface-variant text-sm"
            >
              {tc("back")}
            </button>
          )}

          <p className="mt-8 text-on-surface-variant text-sm font-label uppercase tracking-[0.2em] opacity-60">
            {step === 0 && "Stille finden \u2022 Gemeinschaft erleben"}
          </p>
        </div>
      </div>
    </div>
  );
}
