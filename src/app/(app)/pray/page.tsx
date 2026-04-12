"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import { usePrayerPresence, useGeolocation } from "@/lib/realtime";
import { createClient } from "@/lib/supabase/client";
import {
  MYSTERY_SETS,
  PRAYERS,
  getTodaysMysteryType,
  type MysteryType,
} from "@/data/rosary";

type PrayerStep =
  | { type: "creed" }
  | { type: "our-father"; decade: number }
  | { type: "hail-mary"; decade: number; bead: number }
  | { type: "glory-be"; decade: number }
  | { type: "fatima"; decade: number }
  | { type: "hail-holy-queen" };

function buildPrayerSequence(): PrayerStep[] {
  const steps: PrayerStep[] = [{ type: "creed" }];
  for (let decade = 0; decade < 5; decade++) {
    steps.push({ type: "our-father", decade });
    for (let bead = 0; bead < 10; bead++) {
      steps.push({ type: "hail-mary", decade, bead });
    }
    steps.push({ type: "glory-be", decade });
    steps.push({ type: "fatima", decade });
  }
  steps.push({ type: "hail-holy-queen" });
  return steps;
}

const SEQUENCE = buildPrayerSequence();
const TOTAL_BEADS = 50;

export default function PrayPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { startPraying, stopPraying } = usePrayerPresence();
  const position = useGeolocation();
  const t = useTranslations("pray");
  const locale = useLocale() as "de" | "en";

  const mysteryType: MysteryType = getTodaysMysteryType();
  const mysterySet = MYSTERY_SETS.find((m) => m.type === mysteryType)!;
  const step = SEQUENCE[currentStep];

  const currentDecade = "decade" in step ? step.decade : 0;
  const mystery = mysterySet.mysteries[currentDecade];

  const completedHailMarys = SEQUENCE.slice(0, currentStep).filter(
    (s) => s.type === "hail-mary"
  ).length;
  const progress = (completedHailMarys / TOTAL_BEADS) * 100;

  // Start prayer session on mount
  useEffect(() => {
    async function initSession() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("prayer_sessions")
        .insert({
          user_id: user.id,
          mystery_type: mysteryType,
          mode: "guided",
          latitude: position?.lat ?? null,
          longitude: position?.lng ?? null,
        })
        .select("id")
        .single();

      if (data) {
        setSessionId(data.id);
      }

      if (position) {
        startPraying({
          latitude: position.lat,
          longitude: position.lng,
          mysteryType,
          mode: "guided",
          startedAt: new Date().toISOString(),
        });
      }
    }

    initSession();

    return () => {
      stopPraying();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Complete session when finished
  useEffect(() => {
    if (currentStep !== SEQUENCE.length - 1) return;

    async function completeSession() {
      if (!sessionId) return;
      const supabase = createClient();
      await supabase
        .from("prayer_sessions")
        .update({ ended_at: new Date().toISOString(), completed: true })
        .eq("id", sessionId);
      stopPraying();
    }

    completeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, sessionId]);

  const handleNext = useCallback(() => {
    if (currentStep < SEQUENCE.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  function getPrayerTitle(): string {
    const keys: Record<PrayerStep["type"], string> = {
      "creed": "apostlesCreed",
      "our-father": "ourFather",
      "hail-mary": "hailMary",
      "glory-be": "gloryBe",
      "fatima": "fatimaPrayer",
      "hail-holy-queen": "hailHolyQueen",
    };
    return t(keys[step.type]);
  }

  function getPrayerText(): string {
    switch (step.type) {
      case "creed": return PRAYERS.apostlesCreed[locale];
      case "our-father": return PRAYERS.ourFather[locale];
      case "hail-mary": return PRAYERS.hailMary[locale];
      case "glory-be": return PRAYERS.gloryBe[locale];
      case "fatima": return PRAYERS.fatimaPrayer[locale];
      case "hail-holy-queen": return PRAYERS.hailHolyQueen[locale];
    }
  }

  const beads = Array.from({ length: 10 }, (_, i) => {
    const beadStep = SEQUENCE.findIndex(
      (s) =>
        s.type === "hail-mary" &&
        "decade" in s &&
        s.decade === currentDecade &&
        "bead" in s &&
        s.bead === i
    );
    const isActive = beadStep === currentStep;
    const isCompleted = beadStep < currentStep;
    return { index: i, isActive, isCompleted };
  });

  const isFinished = currentStep === SEQUENCE.length - 1 && step.type === "hail-holy-queen";

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] px-4">
      {/* Progress Header */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            {t("decadeOf", { current: currentDecade + 1, total: 5 })}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
            {mysterySet.name[locale]}
          </span>
        </div>
        <h3 className="font-headline italic text-lg text-primary-fixed mb-2">
          {mystery.title[locale]}
        </h3>
        <p className="text-xs text-on-surface-variant mb-2 italic">
          {mystery.subtitle[locale]} &mdash; {mystery.scripture[locale]}
        </p>
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-container rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bead Circle */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="relative w-64 h-64">
          {beads.map((bead) => {
            const angle = (bead.index / 10) * 2 * Math.PI - Math.PI / 2;
            const radius = 110;
            const x = 128 + radius * Math.cos(angle);
            const y = 128 + radius * Math.sin(angle);
            return (
              <button
                key={bead.index}
                onClick={() => {
                  const idx = SEQUENCE.findIndex(
                    (s) =>
                      s.type === "hail-mary" &&
                      "decade" in s &&
                      s.decade === currentDecade &&
                      "bead" in s &&
                      s.bead === bead.index
                  );
                  if (idx >= 0) setCurrentStep(idx);
                }}
                className={`absolute w-6 h-6 rounded-full transition-all duration-300 -translate-x-1/2 -translate-y-1/2 ${
                  bead.isActive
                    ? "bg-primary-container glow-active ring-4 ring-primary/30 scale-125"
                    : bead.isCompleted
                      ? "bg-primary/40"
                      : "bg-surface-container-highest opacity-60"
                }`}
                style={{ left: x, top: y }}
                aria-label={`${t("beadOf", { current: bead.index + 1, total: 10 })}${bead.isActive ? " (current)" : ""}`}
              />
            );
          })}

          {/* Center Medallion */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center sacred-glow-box">
            <MaterialIcon
              name="auto_awesome"
              filled
              size={36}
              className="text-primary"
            />
          </div>
        </div>
      </div>

      {/* Prayer Text */}
      <div className="pb-4">
        <h2 className="font-headline text-4xl text-primary-fixed italic sacred-glow text-center mb-3">
          {getPrayerTitle()}
        </h2>
        {step.type === "hail-mary" && "bead" in step && (
          <p className="text-center text-on-surface-variant text-xs mb-2">
            {t("beadOf", { current: step.bead + 1, total: 10 })}
          </p>
        )}
        <p className="prayer-text text-on-surface/80 text-center text-base leading-[1.8] max-h-32 overflow-y-auto px-2">
          {getPrayerText()}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pb-6">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
          aria-label={t("previous")}
        >
          <MaterialIcon name="chevron_left" size={28} className="text-on-surface" />
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center transition-all active:scale-95"
          aria-label={isPaused ? t("resume") : t("pause")}
        >
          <MaterialIcon
            name={isPaused ? "play_arrow" : "pause"}
            filled
            size={32}
            className="text-primary"
          />
        </button>

        {isFinished ? (
          <a
            href="/"
            className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center transition-all active:scale-95"
            aria-label={t("finish")}
          >
            <MaterialIcon name="check" size={32} className="text-on-primary-container" />
          </a>
        ) : (
          <button
            onClick={handleNext}
            className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center transition-all active:scale-95"
            aria-label={t("next")}
          >
            <MaterialIcon name="chevron_right" size={32} className="text-on-primary-container" />
          </button>
        )}
      </div>
    </div>
  );
}
