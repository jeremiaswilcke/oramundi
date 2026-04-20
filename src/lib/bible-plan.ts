import type { SupabaseClient } from "@supabase/supabase-js";

import { getLocalIsoDate, getPlanDayForDate } from "./bible-date";
import { isoDateToEpochDay } from "./bible-progress";

export interface BiblePlanAnchor {
  planDay: number;
  startIsoDate: string;
}

export function clampPlanDay(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), 365);
}

export function defaultAnchorToday(date: Date = new Date()): BiblePlanAnchor {
  return {
    planDay: getPlanDayForDate(date),
    startIsoDate: getLocalIsoDate(date),
  };
}

export function getEffectivePlanDay(
  anchor: BiblePlanAnchor | null,
  today: Date = new Date(),
): number {
  if (!anchor) {
    return getPlanDayForDate(today);
  }
  const todayIso = getLocalIsoDate(today);
  const daysSinceStart = Math.max(
    0,
    isoDateToEpochDay(todayIso) - isoDateToEpochDay(anchor.startIsoDate),
  );
  return clampPlanDay(anchor.planDay + daysSinceStart);
}

export async function fetchServerPlanDay(
  supabase: SupabaseClient,
  today: Date = new Date(),
): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return getPlanDayForDate(today);

  const { data } = await supabase
    .from("user_bible_plan_start")
    .select("plan_day, start_iso_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return getPlanDayForDate(today);
  return getEffectivePlanDay(
    { planDay: data.plan_day, startIsoDate: data.start_iso_date },
    today,
  );
}
