import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MaterialIcon } from "@/components/material-icon";

export default async function HealingPage() {
  const t = await getTranslations("healing");
  const locale = (await getLocale()) as "de" | "en";
  const supabase = await createServerSupabaseClient();

  const { data: programs } = await supabase
    .from("healing_programs")
    .select("id, slug, theme, duration_days, title_de, title_en, subtitle_de, subtitle_en, icon")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  const { data: progressRows } = user
    ? await supabase
        .from("user_healing_progress")
        .select("program_id, current_day, status, started_at")
        .eq("user_id", user.id)
        .in("status", ["active", "paused"])
    : { data: null };

  const progressByProgram = new Map(
    (progressRows ?? []).map((p) => [p.program_id, p])
  );

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <h1 className="font-headline italic text-4xl text-on-surface mb-2">
        {t("title")}
      </h1>
      <p className="text-on-surface-variant text-sm mb-6">{t("subtitle")}</p>

      <Link
        href="/healing/sos"
        className="block mb-8 rounded-3xl p-5 bg-gradient-to-br from-error-container to-tertiary-container hover:brightness-105 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
            <MaterialIcon name="favorite" size={28} className="text-error" filled />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline italic text-xl text-on-surface mb-0.5">
              {t("sosTitle")}
            </h3>
            <p className="text-xs text-on-surface-variant">{t("sosSubtitle")}</p>
          </div>
          <MaterialIcon name="chevron_right" size={20} className="text-on-surface-variant/60" />
        </div>
      </Link>

      {(programs?.length ?? 0) === 0 ? (
        <div className="rounded-3xl p-6 glass-card text-center">
          <p className="text-sm text-on-surface-variant">{t("noProgramsYet")}</p>
        </div>
      ) : (
        <section>
          <h2 className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-3">
            {t("programs")}
          </h2>
          <div className="space-y-3">
            {programs!.map((p) => {
              const title = locale === "de" ? p.title_de : p.title_en;
              const subtitle = locale === "de" ? p.subtitle_de : p.subtitle_en;
              const progress = progressByProgram.get(p.id);
              return (
                <Link
                  key={p.id}
                  href={`/healing/${p.slug}`}
                  className="flex items-start gap-3 glass-card rounded-3xl p-4 hover:bg-surface-container-high transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MaterialIcon
                      name={p.icon ?? "healing"}
                      size={24}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline italic text-lg text-on-surface mb-0.5">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-1">
                        {subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-on-surface-variant/70">
                      {progress
                        ? t("dayOf", {
                            current: progress.current_day,
                            total: p.duration_days,
                          })
                        : t("daysTotal", { total: p.duration_days })}
                    </p>
                  </div>
                  <MaterialIcon
                    name="chevron_right"
                    size={20}
                    className="text-on-surface-variant/40"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
