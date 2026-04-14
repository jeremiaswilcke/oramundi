export function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPlanDayForDate(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);

  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  localDate.setHours(0, 0, 0, 0);

  const day = Math.floor((localDate.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(day, 1), 365);
}
