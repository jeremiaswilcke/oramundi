import type { BibleProgressSummary } from "@/lib/bible-types";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  return Boolean(value && ISO_DATE_RE.test(value));
}

export function isoDateToEpochDay(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function epochDayToIsoDate(value: number): string {
  return new Date(value * 86_400_000).toISOString().slice(0, 10);
}

export function buildBibleProgressSummary(
  readOnValues: string[],
  todayIso: string,
  authenticated = true,
): BibleProgressSummary {
  const uniqueDays = [...new Set(readOnValues.filter(isIsoDate).map(isoDateToEpochDay))].sort(
    (left, right) => left - right,
  );

  const daySet = new Set(uniqueDays);
  const todayKey = isoDateToEpochDay(todayIso);
  const todayMarked = daySet.has(todayKey);

  let streak = 0;
  let pointer = todayMarked ? todayKey : todayKey - 1;
  while (daySet.has(pointer)) {
    streak += 1;
    pointer -= 1;
  }

  let bestStreak = 0;
  let currentRun = 0;
  let previousKey: number | null = null;

  for (const dayKey of uniqueDays) {
    if (previousKey !== null && dayKey === previousKey + 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    bestStreak = Math.max(bestStreak, currentRun);
    previousKey = dayKey;
  }

  return {
    authenticated,
    todayMarked,
    streak,
    bestStreak,
    totalReadDays: uniqueDays.length,
    lastReadOn: uniqueDays.length > 0 ? epochDayToIsoDate(uniqueDays[uniqueDays.length - 1]) : null,
  };
}
