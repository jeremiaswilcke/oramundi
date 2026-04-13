import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DAY_TO_ICAL: Record<string, string> = {
  mon: "MO",
  tue: "TU",
  wed: "WE",
  thu: "TH",
  fri: "FR",
  sat: "SA",
  sun: "SU",
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function formatUtcStamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // URL itself is the secret (userId is a UUID)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, reminder_enabled, reminder_days, reminder_time")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return new NextResponse("Not found", { status: 404 });
  }

  const time = (profile.reminder_time as string) ?? "18:00";
  const [hh, mm] = time.split(":").map(Number);
  const days = ((profile.reminder_days as string[]) ?? []).map((d) => DAY_TO_ICAL[d]).filter(Boolean);

  // First occurrence: today (or next matching day) at the given time
  const now = new Date();
  const start = new Date(now);
  start.setHours(hh, mm, 0, 0);

  const stamp = formatUtcStamp(now);
  const dtStart = formatLocalDate(start);
  const dtEnd = formatLocalDate(new Date(start.getTime() + 30 * 60000));

  const tzid = "Europe/Vienna";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ora Mundi//Prayer Reminder//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Ora Mundi — Gebetszeit",
    "X-WR-CALDESC:Tägliche Erinnerung zum Rosenkranzgebet",
    `X-WR-TIMEZONE:${tzid}`,
    "BEGIN:VTIMEZONE",
    `TZID:${tzid}`,
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  if (profile.reminder_enabled && days.length > 0) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:ora-mundi-reminder-${userId}@oramundi.online`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${tzid}:${dtStart}`,
      `DTEND;TZID=${tzid}:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${days.join(",")}`,
      "SUMMARY:🕊️ Zeit für deinen Rosenkranz",
      "DESCRIPTION:Bete jetzt deinen Rosenkranz mit Ora Mundi.\\nhttps://oramundi.online",
      "URL:https://oramundi.online",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Zeit für deinen Rosenkranz",
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  const ics = lines.join("\r\n") + "\r\n";

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="ora-mundi.ics"`,
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}
