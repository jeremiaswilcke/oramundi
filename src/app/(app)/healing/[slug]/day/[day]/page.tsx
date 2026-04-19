import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MaterialIcon } from "@/components/material-icon";
import { getPlanDayForDate } from "@/lib/bible-date";
import { CompleteDayButton } from "./complete-day-button";

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

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href={`/healing/${slug}`}
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        {title}
      </Link>

      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
        {t("dayOf", { current: dayNumber, total: program.duration_days })}
      </p>

      {!dayData ? (
        <div className="rounded-3xl glass-card p-6 mt-6 text-center">
          <p className="text-sm text-on-surface-variant">{t("dayNotAvailable")}</p>
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {scripture && (
            <section className="rounded-3xl glass-card p-5">
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                {t("scripture")}
                {dayData.scripture_ref && (
                  <span className="ml-2 text-on-surface-variant/60 normal-case tracking-normal">
                    · {dayData.scripture_ref}
                  </span>
                )}
              </h2>
              <p className="font-headline italic text-lg text-on-surface leading-relaxed whitespace-pre-line">
                {scripture}
              </p>
            </section>
          )}

          {reflection && (
            <section className="rounded-3xl glass-card p-5">
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                {t("impulse")}
              </h2>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {reflection}
              </p>
            </section>
          )}

          {prayer && (
            <section className="rounded-3xl glass-card p-5">
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                {t("prayer")}
              </h2>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {prayer}
              </p>
            </section>
          )}

          {action && (
            <section className="rounded-3xl glass-card p-5">
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2">
                {t("action")}
              </h2>
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {action}
              </p>
            </section>
          )}

          <section className="rounded-3xl bg-primary-container/20 border border-primary/10 p-5">
            <h2 className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-3">
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

      <div className="mt-8">
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
