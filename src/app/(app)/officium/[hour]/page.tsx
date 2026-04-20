"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { OFFICIUM_OFFICES, type OfficiumStep } from "@/data/officium-divinum";

type ViewMode = "parallel" | "la" | "de";

const STEP_ICONS: Record<OfficiumStep["type"], string> = {
  rubric: "format_quote",
  verse: "auto_awesome",
  psalm: "menu_book",
  antiphon: "music_note",
  hymn: "queue_music",
  capitulum: "import_contacts",
  versicle: "swap_horiz",
  magnificat: "favorite",
  benedictus: "favorite",
  oratio: "self_improvement",
  conclusion: "check_circle",
};

export default function OfficiumDetailPage({ params }: { params: Promise<{ hour: string }> }) {
  const { hour } = use(params);
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("parallel");
  const [stepIdx, setStepIdx] = useState(0);

  const office = OFFICIUM_OFFICES.find((o) => o.hour === hour);
  if (!office) {
    return (
      <div className="min-h-[calc(100vh-7.5rem)] flex flex-col items-center justify-center px-6">
        <p className="text-on-surface-variant mb-4">Hore nicht gefunden.</p>
        <button onClick={() => router.push("/officium")} className="text-primary">
          Zurück
        </button>
      </div>
    );
  }

  const step = office.steps[stepIdx];
  const progress = ((stepIdx + 1) / office.steps.length) * 100;
  const isLast = stepIdx === office.steps.length - 1;

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] px-4 pb-20 relative">
      <div className="absolute top-24 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -right-12 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-3 relative z-10">
        <button
          onClick={() => router.push("/officium")}
          className="flex items-center gap-2 text-on-surface-variant text-sm mb-3 hover:text-primary transition-colors"
        >
          <MaterialIcon name="chevron_left" size={20} />
          <span className="font-[var(--font-display)] italic">{office.name.de}</span>
          <span className="mess-eyebrow--serif-caps opacity-60">· {office.name.la}</span>
        </button>

        {/* Language toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center bg-surface-container-low rounded-full p-0.5">
            {([
              { v: "la" as const, label: "LA" },
              { v: "parallel" as const, label: "LA + DE" },
              { v: "de" as const, label: "DE" },
            ]).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setView(opt.v)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  view === opt.v
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="mess-eyebrow--serif-caps text-on-surface-variant liturgical-number">
            {stepIdx + 1} / {office.steps.length}
          </span>
        </div>

        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 relative z-10">
        <div className="bg-surface-container-lowest/60 backdrop-blur-md rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MaterialIcon name={STEP_ICONS[step.type]} size={16} className="text-primary" />
            </div>
            {step.title && (
              <h2 className="prayer-title prayer-title--sm text-on-surface">
                {view === "la" ? step.title.la : view === "de" ? step.title.de : step.title.la}
              </h2>
            )}
            {step.reference && (
              <span className="ml-auto mess-eyebrow--serif-caps text-on-surface-variant">
                {step.reference}
              </span>
            )}
          </div>

          {view === "parallel" ? (
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              <div>
                <p className="mess-eyebrow--serif-caps text-on-surface-variant mb-2">Latein</p>
                <p className="prayer-text text-on-surface text-sm md:text-base leading-[1.9] whitespace-pre-line">
                  {step.la}
                </p>
              </div>
              <div className="md:border-l md:border-outline-variant/20 md:pl-8 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                <p className="mess-eyebrow--serif-caps text-on-surface-variant mb-2">Deutsch</p>
                <p className="prayer-text text-on-surface text-sm md:text-base leading-[1.9] whitespace-pre-line">
                  {step.de}
                </p>
              </div>
            </div>
          ) : (
            <p className="prayer-text text-on-surface text-base md:text-lg leading-[1.9] whitespace-pre-line">
              {view === "la" ? step.la : step.de}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 pt-6 pb-4 relative z-10">
        <button
          onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
          disabled={stepIdx === 0}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
        >
          <MaterialIcon name="chevron_left" size={28} className="text-on-surface-variant" />
        </button>

        {isLast ? (
          <button
            onClick={() => router.push("/officium")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
          >
            <MaterialIcon name="check" filled size={32} />
          </button>
        ) : (
          <button
            onClick={() => setStepIdx((s) => Math.min(office.steps.length - 1, s + 1))}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-xl active:scale-90 transition-all"
          >
            <MaterialIcon name="chevron_right" size={32} />
          </button>
        )}
      </div>
    </div>
  );
}
