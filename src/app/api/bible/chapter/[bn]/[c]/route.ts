import { NextResponse } from "next/server";

import { getChapter } from "@/lib/bible-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bn: string; c: string }> },
) {
  const { bn, c } = await params;
  const bookNumber = Number.parseInt(bn, 10);
  const chapterNumber = Number.parseInt(c, 10);

  if (!Number.isFinite(bookNumber) || !Number.isFinite(chapterNumber)) {
    return NextResponse.json({ error: "Invalid chapter reference." }, { status: 400 });
  }

  const result = getChapter(bookNumber, chapterNumber);
  if (!result) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  return NextResponse.json({
    bn: result.book.bn,
    s: result.book.s,
    name: result.book.name,
    c: result.chapter.c,
    verses: result.chapter.v,
  });
}
