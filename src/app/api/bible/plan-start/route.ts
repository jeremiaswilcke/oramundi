import { NextResponse } from "next/server";

import { clampPlanDay } from "@/lib/bible-plan";
import { getLocalIsoDate } from "@/lib/bible-date";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getUser();
  if (!user) {
    return NextResponse.json({ anchor: null, authenticated: false });
  }

  const { data, error } = await supabase
    .from("user_bible_plan_start")
    .select("plan_day, start_iso_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    anchor: data
      ? { planDay: data.plan_day, startIsoDate: data.start_iso_date }
      : null,
  });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { planDay?: number }
    | null;

  const planDayRaw = body?.planDay;
  if (typeof planDayRaw !== "number") {
    return NextResponse.json(
      { error: "Body must include { planDay: number }." },
      { status: 400 },
    );
  }

  const planDay = clampPlanDay(planDayRaw);
  const startIsoDate = getLocalIsoDate();

  const { supabase, user } = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { error } = await supabase.from("user_bible_plan_start").upsert(
    {
      user_id: user.id,
      plan_day: planDay,
      start_iso_date: startIsoDate,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    anchor: { planDay, startIsoDate },
  });
}

export async function DELETE() {
  const { supabase, user } = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { error } = await supabase
    .from("user_bible_plan_start")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ anchor: null });
}
