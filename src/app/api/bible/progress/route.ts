import { NextResponse } from "next/server";

import { buildBibleProgressSummary, isIsoDate } from "@/lib/bible-progress";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function emptySummary(authenticated = false) {
  return {
    authenticated,
    todayMarked: false,
    streak: 0,
    bestStreak: 0,
    totalReadDays: 0,
    lastReadOn: null,
  };
}

async function loadSummary(todayIso: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptySummary(false);
  }

  const { data, error } = await supabase
    .from("user_bible_day_reads")
    .select("read_on")
    .eq("user_id", user.id)
    .order("read_on", { ascending: true });

  if (error) {
    throw error;
  }

  return buildBibleProgressSummary(
    (data ?? []).map((row) => row.read_on).filter((value): value is string => typeof value === "string"),
    todayIso,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const todayIso = url.searchParams.get("today");

  if (!isIsoDate(todayIso)) {
    return NextResponse.json({ error: "Query parameter 'today' must be YYYY-MM-DD." }, { status: 400 });
  }

  try {
    return NextResponse.json(await loadSummary(todayIso));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load progress.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { day?: number; readOn?: string } | null;

  const day = body?.day;
  const readOn = body?.readOn;

  const invalidDay = typeof day !== "number" || !Number.isInteger(day) || day < 1 || day > 365;

  if (invalidDay || !isIsoDate(readOn)) {
    return NextResponse.json({ error: "Body must include { day, readOn }." }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { error } = await supabase.from("user_bible_day_reads").upsert(
      {
        user_id: user.id,
        read_on: readOn,
        plan_day: day,
      },
      {
        onConflict: "user_id,read_on",
      },
    );

    if (error) {
      throw error;
    }

    return NextResponse.json(await loadSummary(readOn));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save progress.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
