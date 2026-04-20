import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MaterialIcon } from "@/components/material-icon";
import { StartProgramButton } from "./start-program-button";

export default async function HealingProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("healing");
  const locale = (await getLocale()) as "de" | "en";
  const supabase = await createServerSupabaseClient();

  const { data: program } = await supabase
    .from("healing_programs")
    .select("id, slug, duration_days, title_de, title_en, subtitle_de, subtitle_en, intro_de, intro_en, icon")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!program) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: progress } = user
    ? await supabase
        .from("user_healing_progress")
        .select("current_day, status, is_shared")
        .eq("user_id", user.id)
        .eq("program_id", program.id)
        .maybeSingle()
    : { data: null };

  const title = locale === "de" ? program.title_de : program.title_en;
  const subtitle = locale === "de" ? program.subtitle_de : program.subtitle_en;
  const intro = locale === "de" ? program.intro_de : program.intro_en;

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-5 pt-6 pb-8 sm:px-8 md:px-10 max-w-2xl mx-auto">
      <Link
        href="/healing"
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-6"
      >
        <MaterialIcon name="chevron_left" size={20} />
        <span className="all-smallcaps">{t("backToOverview")}</span>
      </Link>

      <header className="mb-8 border-b border-outline-variant/50 pb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <MaterialIcon name={program.icon ?? "healing"} size={28} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mess-eyebrow--serif-caps text-primary">
              {t("daysTotal", { total: program.duration_days })}
            </p>
            <h1 className="mess-display mess-display--xl text-on-surface mt-3">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-on-surface-variant italic font-[var(--font-display)] text-[clamp(1rem,2vw,1.15rem)] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      {intro && (
        <div className="mb-10 drop-cap text-on-surface leading-[1.8] whitespace-pre-line text-[0.98rem] sm:text-base">
          {intro}
        </div>
      )}

      {progress ? (
        <Link
          href={`/healing/${program.slug}/day/${progress.current_day}`}
          className="block w-full text-center rounded-full bg-primary text-on-primary py-4 font-semibold"
        >
          {t("continueDay", { day: progress.current_day })}
        </Link>
      ) : (
        <StartProgramButton programId={program.id} slug={program.slug} />
      )}
    </div>
  );
}
