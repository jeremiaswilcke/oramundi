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
  const [selectedMystery, setSelectedMystery] = useState<MysteryType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showMysteryPicker, setShowMysteryPicker] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<{ sessionId: string; mysteryType: MysteryType; step: number } | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { startPraying, stopPraying } = usePrayerPresence();
  const position = useGeolocation();
  const t = useTranslations("pray");
  const tm = useTranslations("mysteries");
  const locale = useLocale() as "de" | "en";

  const todayType = getTodaysMysteryType();
  const mysteryType: MysteryType = selectedMystery ?? todayType;
  const mysterySet = MYSTERY_SETS.find((m) => m.type === mysteryType)!;
  const step = SEQUENCE[currentStep];

  const currentDecade = "decade" in step ? step.decade : 0;
  const mystery = mysterySet.mysteries[currentDecade];

  const completedHailMarys = SEQUENCE.slice(0, currentStep).filter(
    (s) => s.type === "hail-mary"
  ).length;
  const progress = (completedHailMarys / TOTAL_BEADS) * 100;

  useEffect(() => {
    async function checkResumable() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setInitializing(false); return; }

      // Find incomplete session from the last 24 hours
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("prayer_sessions")
        .select("id, mystery_type, current_step")
        .eq("user_id", user.id)
        .eq("completed", false)
        .gte("started_at", dayAgo)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && (data.current_step ?? 0) > 0 && (data.current_step ?? 0) < SEQUENCE.length - 1) {
        setResumePrompt({
          sessionId: data.id,
          mysteryType: data.mystery_type as MysteryType,
          step: data.current_step ?? 0,
        });
      }
      setInitializing(false);
    }
    checkResumable();
    return () => { stopPraying(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startFreshSession() {
    setResumePrompt(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mark any previous unfinished sessions as abandoned (leave them incomplete)
    const { data } = await supabase
      .from("prayer_sessions")
      .insert({
        user_id: user.id,
        mystery_type: mysteryType,
        mode: "guided",
        latitude: position?.lat ?? null,
        longitude: position?.lng ?? null,
        current_step: 0,
      })
      .select("id")
      .single();

    if (data) setSessionId(data.id);
    setCurrentStep(0);

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

  async function resumeSession() {
    if (!resumePrompt) return;
    setSelectedMystery(resumePrompt.mysteryType);
    setSessionId(resumePrompt.sessionId);
    setCurrentStep(resumePrompt.step);
    setResumePrompt(null);

    if (position) {
      startPraying({
        latitude: position.lat,
        longitude: position.lng,
        mysteryType: resumePrompt.mysteryType,
        mode: "guided",
        startedAt: new Date().toISOString(),
      });
    }
  }

  // Auto-create session on mount if no resume
  useEffect(() => {
    if (initializing) return;
    if (resumePrompt) return;
    if (sessionId) return;
    startFreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing, resumePrompt, sessionId]);

  // Persist progress whenever step changes
  useEffect(() => {
    if (!sessionId) return;
    const supabase = createClient();
    supabase
      .from("prayer_sessions")
      .update({ current_step: currentStep, last_active_at: new Date().toISOString() })
      .eq("id", sessionId)
      .then(() => { /* ignore */ });
  }, [currentStep, sessionId]);

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
    if (currentStep < SEQUENCE.length - 1) setCurrentStep((prev) => prev + 1);
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  function getPrayerTitle(): string {
    if (mysteryType === "mercy") {
      if (step.type === "our-father") return locale === "de" ? "Ewiger Vater" : "Eternal Father";
      if (step.type === "hail-mary") return locale === "de" ? "Barmherzigkeit" : "Divine Mercy";
    }
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

  function getHailMaryWithInsertion(): string {
    const ins = mystery.insertion[locale];
    if (locale === "de") {
      return PRAYERS.hailMary.de.replace(
        "deines Leibes, Jesus.",
        `deines Leibes, ${ins}.`
      );
    }
    return PRAYERS.hailMary.en.replace(
      "thy womb, Jesus.",
      `thy womb, ${ins}.`
    );
  }

  function getPrayerText(): string {
    if (mysteryType === "mercy") {
      if (step.type === "our-father") return PRAYERS.eternalFather[locale];
      if (step.type === "hail-mary") return PRAYERS.divineMercy[locale];
    }
    switch (step.type) {
      case "creed": return PRAYERS.apostlesCreed[locale];
      case "our-father": return PRAYERS.ourFather[locale];
      case "hail-mary": return getHailMaryWithInsertion();
      case "glory-be": return PRAYERS.gloryBe[locale];
      case "fatima": return PRAYERS.fatimaPrayer[locale];
      case "hail-holy-queen": return PRAYERS.hailHolyQueen[locale];
    }
  }

  const beads = Array.from({ length: 10 }, (_, i) => {
    const beadStep = SEQUENCE.findIndex(
      (s) => s.type === "hail-mary" && "decade" in s && s.decade === currentDecade && "bead" in s && s.bead === i
    );
    return { index: i, isActive: beadStep === currentStep, isCompleted: beadStep < currentStep };
  });

  const isFinished = currentStep === SEQUENCE.length - 1 && step.type === "hail-holy-queen";

  if (resumePrompt) {
    const resumedMystery = MYSTERY_SETS.find((m) => m.type === resumePrompt.mysteryType)!;
    const resumeProgress = Math.round(
      (SEQUENCE.slice(0, resumePrompt.step).filter((s) => s.type === "hail-mary").length / TOTAL_BEADS) * 100
    );
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7.5rem)] px-6 pb-20">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 text-center editorial-shadow">
          <MaterialIcon name="restart_alt" size={48} className="text-primary mb-4 mx-auto" />
          <h2 className="font-headline italic text-2xl text-on-surface mb-2">
            {locale === "de" ? "Gebet fortsetzen?" : "Resume prayer?"}
          </h2>
          <p className="text-on-surface-variant text-sm mb-1">
            {resumedMystery.name[locale]}
          </p>
          <p className="text-on-surface-variant text-xs mb-6">
            {resumeProgress}% {locale === "de" ? "abgeschlossen" : "completed"}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={resumeSession}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-medium rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {locale === "de" ? "Fortsetzen" : "Resume"}
            </button>
            <button
              onClick={startFreshSession}
              className="w-full py-3 bg-surface-container-high text-on-surface-variant font-medium rounded-full hover:bg-surface-container-highest transition-all"
            >
              {locale === "de" ? "Neu beginnen" : "Start fresh"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] px-4 pb-20 relative">
      {/* Decorative blobs */}
      <div className="absolute top-24 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -right-12 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mystery Selector Header */}
      <div className="pt-4 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowMysteryPicker(!showMysteryPicker)}
            className="flex items-center gap-2 font-label text-[11px] tracking-widest uppercase text-on-secondary-container bg-secondary-container/30 px-4 py-1.5 rounded-full hover:bg-secondary-container/50 transition-colors"
          >
            {tm(mysteryType)}
            <MaterialIcon name="expand_more" size={16} />
          </button>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant">
            {t("decadeOf", { current: currentDecade + 1, total: 5 })}
          </span>
        </div>

        {/* Mystery Picker Dropdown */}
        {showMysteryPicker && (
          <div className="glass-card rounded-2xl p-3 mb-3 space-y-1">
            {MYSTERY_SETS.map((set) => (
              <button
                key={set.type}
                onClick={() => { setSelectedMystery(set.type); setShowMysteryPicker(false); setCurrentStep(0); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  set.type === mysteryType
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <MaterialIcon name={set.icon} size={20} filled={set.type === mysteryType} />
                <div>
                  <span className="text-sm font-semibold">{set.name[locale]}</span>
                  {set.type === todayType && (
                    <span className="ml-2 text-[9px] uppercase tracking-wider text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full">
                      {t("todaysDefault")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <h3 className="font-headline italic text-lg text-on-surface mb-1">
          {mystery.title[locale]}
        </h3>
        <p className="text-xs text-on-surface-variant italic">
          {mystery.subtitle[locale]} &mdash; {mystery.scripture[locale]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Rosary Bead Circle with Cross */}
      <div className="flex-1 flex items-center justify-center py-4 relative z-10">
        <div className="relative w-72 h-72">
          {/* The 10 beads in a circle */}
          {beads.map((bead) => {
            const angle = (bead.index / 10) * 2 * Math.PI - Math.PI / 2;
            const radius = 120;
            const x = 144 + radius * Math.cos(angle);
            const y = 144 + radius * Math.sin(angle);
            return (
              <button
                key={bead.index}
                onClick={() => {
                  const idx = SEQUENCE.findIndex(
                    (s) => s.type === "hail-mary" && "decade" in s && s.decade === currentDecade && "bead" in s && s.bead === bead.index
                  );
                  if (idx >= 0) setCurrentStep(idx);
                }}
                className={`absolute w-7 h-7 rounded-full transition-all duration-300 -translate-x-1/2 -translate-y-1/2 ${
                  bead.isActive
                    ? "bg-primary glow-active ring-4 ring-primary/20 scale-125"
                    : bead.isCompleted
                      ? "bg-primary/40"
                      : "bg-outline-variant/30"
                }`}
                style={{ left: x, top: y }}
                aria-label={`${t("beadOf", { current: bead.index + 1, total: 10 })}${bead.isActive ? " (current)" : ""}`}
              />
            );
          })}

          {/* Center Cross */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center">
            <svg width="48" height="64" viewBox="0 0 48 64" fill="none" className="text-primary/60">
              {/* Vertical beam */}
              <rect x="18" y="0" width="12" height="64" rx="3" fill="currentColor" />
              {/* Horizontal beam */}
              <rect x="0" y="14" width="48" height="12" rx="3" fill="currentColor" />
              {/* Center circle (corpus) */}
              <circle cx="24" cy="20" r="5" fill="currentColor" opacity="0.8" />
            </svg>
          </div>

          {/* Connecting chain lines (subtle) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
            <circle
              cx="144"
              cy="144"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 8"
              className="text-outline-variant/20"
            />
          </svg>
        </div>
      </div>

      {/* Prayer Text Card */}
      <div className="relative z-10 mb-4">
        <div className="w-full bg-surface-container-lowest/60 backdrop-blur-md rounded-3xl p-6 text-center">
          <h2 className="font-headline text-2xl text-on-surface italic mb-2">
            {getPrayerTitle()}
          </h2>
          {step.type === "hail-mary" && "bead" in step && (
            <p className="text-on-surface-variant text-xs mb-2">
              {t("beadOf", { current: step.bead + 1, total: 10 })}
            </p>
          )}
          <p className="prayer-text text-on-surface-variant text-sm leading-[1.8] max-h-28 overflow-y-auto">
            {getPrayerText()}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 pb-4 relative z-10">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
          aria-label={t("previous")}
        >
          <MaterialIcon name="chevron_left" size={28} className="text-on-surface-variant" />
        </button>

        {isFinished ? (
          <a
            href="/"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
            aria-label={t("finish")}
          >
            <MaterialIcon name="check" filled size={32} />
          </a>
        ) : (
          <button
            onClick={handleNext}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
            aria-label={t("next")}
          >
            <MaterialIcon name="chevron_right" size={32} />
          </button>
        )}

        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center opacity-0 pointer-events-none"
          aria-hidden
        >
          <MaterialIcon name="chevron_left" size={28} />
        </button>
      </div>
    </div>
  );
}
