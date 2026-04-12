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
      {/* Background effects per step */}
      {step === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Breathing rings */}
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border border-primary/10"
              style={{
                width: `${ring * 140}px`,
                height: `${ring * 140}px`,
                animation: `bead-breathe ${3 + ring}s ease-in-out infinite`,
                animationDelay: `${ring * 0.5}s`,
              }}
            />
          ))}
          <div className="candle-pulse w-4 h-4 rounded-full bg-primary-container" />
        </div>
      )}

      {step === 1 && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 map-mesh" />
          {/* Floating pulse dots */}
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="absolute candle-pulse w-2 h-2 rounded-full bg-primary-container"
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="absolute inset-0">
          {/* Asymmetric grid with glass cards */}
          <div className="absolute top-20 left-6 w-32 h-44 glass-card rounded-2xl" />
          <div className="absolute top-36 right-8 w-40 h-28 glass-card rounded-2xl" />
          <div className="absolute bottom-48 left-12 w-36 h-32 glass-card rounded-2xl" />
          <div className="absolute top-16 right-4 w-6 h-6 candle-pulse rounded-full bg-primary-container/40" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-end relative z-10 px-8 pb-16">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <MaterialIcon name="public" filled size={28} className="text-primary" />
          <span className="font-headline italic text-2xl text-primary sacred-glow">
            Ora Mundi
          </span>
        </div>

        <h1 className="font-headline italic text-4xl text-primary-fixed sacred-glow text-center mb-4 leading-tight">
          {t(current.headline)}
        </h1>
        <p className="text-on-surface-variant text-center text-base leading-relaxed mb-12 max-w-xs">
          {t(current.subline)}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {STEP_KEYS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-primary-container"
                  : i < step
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-surface-container-highest"
              }`}
            />
          ))}
        </div>

        {/* Action */}
        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full max-w-xs py-4 bg-primary-container text-on-primary-container text-center font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {tc("continue")}
          </button>
        ) : (
          <Link
            href="/auth"
            className="block w-full max-w-xs py-4 bg-primary-container text-on-primary-container text-center font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t("getStarted")}
          </Link>
        )}

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-3 text-on-surface-variant text-sm"
          >
            {tc("back")}
          </button>
        )}
      </div>
    </div>
  );
}
