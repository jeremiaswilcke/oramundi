export function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalCalendarDayNumber(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const utcCurrent = Date.UTC(year, month, day);
  const utcYearStart = Date.UTC(year, 0, 1);

  return Math.floor((utcCurrent - utcYearStart) / 86_400_000) + 1;
}

export function getPlanDayForDate(date = new Date()): number {
  const day = getLocalCalendarDayNumber(date);
  return Math.min(Math.max(day, 1), 365);
}
