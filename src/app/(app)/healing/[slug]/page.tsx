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
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href="/healing"
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-4"
      >
        <MaterialIcon name="chevron_left" size={20} />
        {t("backToOverview")}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MaterialIcon name={program.icon ?? "healing"} size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="font-headline italic text-3xl text-on-surface">{title}</h1>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>

      {intro && (
        <div className="rounded-3xl glass-card p-5 mb-6 text-sm leading-relaxed text-on-surface whitespace-pre-line">
          {intro}
        </div>
      )}

      <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-4">
        {t("daysTotal", { total: program.duration_days })}
      </p>

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
