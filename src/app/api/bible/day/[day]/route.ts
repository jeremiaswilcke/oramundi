import { NextResponse } from "next/server";

import { getPlanForDay, getPortionsForItems } from "@/lib/bible-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ day: string }> },
) {
  const { day } = await params;
  const dayNumber = Number.parseInt(day, 10);

  if (!Number.isFinite(dayNumber)) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  const plan = getPlanForDay(dayNumber);
  const at = getPortionsForItems(plan.at.items).map((portion) => ({
    bn: portion.book.bn,
    s: portion.book.s,
    name: portion.book.name,
    c: portion.chapter.c,
    full: portion.full,
    verses: portion.verses,
  }));
  const nt = getPortionsForItems(plan.nt.items).map((portion) => ({
    bn: portion.book.bn,
    s: portion.book.s,
    name: portion.book.name,
    c: portion.chapter.c,
    full: portion.full,
    verses: portion.verses,
  }));

  return NextResponse.json({
    day: plan.day,
    atLabel: plan.at.label,
    ntLabel: plan.nt.label,
    at,
    nt,
  });
}
