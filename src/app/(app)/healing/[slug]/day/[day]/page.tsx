import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MaterialIcon } from "@/components/material-icon";
import { getPlanDayForDate } from "@/lib/bible-date";
import { CompleteDayButton } from "./complete-day-button";

const ROMAN_NUMERALS = [
  ["M", 1000],
  ["CM", 900],
  ["D", 500],
  ["CD", 400],
  ["C", 100],
  ["XC", 90],
  ["L", 50],
  ["XL", 40],
  ["X", 10],
  ["IX", 9],
  ["V", 5],
  ["IV", 4],
  ["I", 1],
] as const;

function toRoman(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  let remainder = Math.floor(n);
  let out = "";
  for (const [symbol, value] of ROMAN_NUMERALS) {
    while (remainder >= value) {
      out += symbol;
      remainder -= value;
    }
  }
  return out;
}

export default async function HealingDayPage({
  params,
}: {
  params: Promise<{ slug: string; day: string }>;
}) {
  const { slug, day } = await params;
  const dayNumber = parseInt(day, 10);
  if (!Number.isFinite(dayNumber) || dayNumber < 1) notFound();

  const t = await getTranslations("healing");
  const locale = (await getLocale()) as "de" | "en";
  const supabase = await createServerSupabaseClient();

  const { data: program } = await supabase
    .from("healing_programs")
    .select("id, slug, duration_days, title_de, title_en")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!program) notFound();
  if (dayNumber > program.duration_days) notFound();

  const { data: dayData } = await supabase
    .from("healing_program_days")
    .select(
      "scripture_ref, scripture_de, scripture_en, prayer_refs, reflection_de, reflection_en, intention_de, intention_en, prayer_de, prayer_en, action_de, action_en"
    )
    .eq("program_id", program.id)
    .eq("day_number", dayNumber)
    .maybeSingle();

  const title = locale === "de" ? program.title_de : program.title_en;
  const scripture = dayData
    ? locale === "de"
      ? dayData.scripture_de
      : dayData.scripture_en
    : null;
  const reflection = dayData
    ? locale === "de"
      ? dayData.reflection_de
      : dayData.reflection_en
    : null;
  const prayer = dayData
    ? (locale === "de" ? dayData.prayer_de : dayData.prayer_en) ??
      (locale === "de" ? dayData.intention_de : dayData.intention_en)
    : null;
  const action = dayData
    ? locale === "de"
      ? dayData.action_de
      : dayData.action_en
    : null;

  const dayRoman = toRoman(dayNumber);
  const totalRoman = toRoman(program.duration_days);

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-5 pt-6 pb-8 sm:px-8 md:px-10 max-w-2xl mx-auto">
      <Link
        href={`/healing/${slug}`}
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-6"
      >
        <MaterialIcon name="chevron_left" size={20} />
        <span className="all-smallcaps">{title}</span>
      </Link>

      <header className="mb-10 border-b border-outline-variant/50 pb-6">
        <p className="mess-eyebrow--serif-caps text-primary">
          {t("dayOf", { current: dayNumber, total: program.duration_days })}
        </p>
        <div className="mt-3 flex items-baseline gap-4">
          <span
            className="liturgical-number text-primary/70"
            style={{ fontSize: "clamp(2.4rem, 7vw, 3.75rem)" }}
            aria-hidden="true"
          >
            {dayRoman}
            <span className="text-outline/70">
              {" / "}
              {totalRoman}
            </span>
          </span>
        </div>
      </header>

      {!dayData ? (
        <div className="rounded-3xl glass-card p-6 text-center">
          <p className="text-sm text-on-surface-variant">{t("dayNotAvailable")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {scripture && (
            <section>
              <h2 className="mess-eyebrow--serif-caps text-primary">
                {t("scripture")}
                {dayData.scripture_ref && (
                  <span className="ml-2 text-on-surface-variant/70 normal-case tracking-normal">
                    · {dayData.scripture_ref}
                  </span>
                )}
              </h2>
              <blockquote className="mt-4 border-l-2 border-primary/30 pl-5 py-1">
                <p className="font-[var(--font-display)] italic text-on-surface leading-relaxed whitespace-pre-line text-[clamp(1.1rem,2.3vw,1.35rem)]">
                  {scripture}
                </p>
              </blockquote>
            </section>
          )}

          {reflection && (
            <section>
              <h2 className="mess-eyebrow--serif-caps text-primary">
                {t("impulse")}
              </h2>
              <p className="mt-4 drop-cap text-on-surface leading-[1.75] whitespace-pre-line text-[0.98rem] sm:text-base">
                {reflection}
              </p>
            </section>
          )}

          {prayer && (
            <section className="rounded-2xl bg-surface-container-low/70 p-6 border border-outline-variant/30">
              <h2 className="mess-eyebrow--serif-caps text-primary mb-3">
                {t("prayer")}
              </h2>
              <p className="font-[var(--font-display)] text-on-surface italic leading-relaxed whitespace-pre-line text-[clamp(1rem,2vw,1.15rem)]">
                {prayer}
              </p>
            </section>
          )}

          {action && (
            <section>
              <h2 className="mess-eyebrow--serif-caps text-primary">
                {t("action")}
              </h2>
              <p className="mt-4 text-on-surface leading-[1.7] whitespace-pre-line text-[0.98rem] sm:text-base">
                {action}
              </p>
            </section>
          )}

          <section className="mt-10 rounded-3xl bg-primary-container/20 border border-primary/10 p-5">
            <h2 className="mess-eyebrow--serif-caps text-primary mb-3">
              {t("dailyGround")}
            </h2>
            <div className="space-y-2">
              <Link
                href="/pray"
                className="flex items-center justify-between gap-3 rounded-2xl bg-surface/60 px-4 py-3 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MaterialIcon name="auto_awesome" size={20} className="text-primary" />
                  <span className="text-sm text-on-surface">{t("rosaryToday")}</span>
                </div>
                <MaterialIcon name="chevron_right" size={18} className="text-on-surface-variant/50" />
              </Link>
              <Link
                href={`/bibel/lesen?tag=${getPlanDayForDate()}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-surface/60 px-4 py-3 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MaterialIcon name="menu_book" size={20} className="text-primary" />
                  <span className="text-sm text-on-surface">
                    {t("bibleInYear")}
                    <span className="ml-2 text-xs text-on-surface-variant/70">
                      · {t("dayOfYear", { day: getPlanDayForDate() })}
                    </span>
                  </span>
                </div>
                <MaterialIcon name="chevron_right" size={18} className="text-on-surface-variant/50" />
              </Link>
            </div>
          </section>
        </div>
      )}

      <div className="mt-10">
        <CompleteDayButton
          programId={program.id}
          slug={slug}
          dayNumber={dayNumber}
          totalDays={program.duration_days}
        />
      </div>
    </div>
  );
}
