import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import {
  fetchOfficiumDay,
  OFFICIUM_LANGUAGE_LABEL,
  type OfficiumDay,
  type OfficiumHour,
  type OfficiumLanguageSlug,
} from "@/lib/officium";

const OFFICIUM_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "div", "span", "br", "hr",
    "h1", "h2", "h3", "h4", "h5",
    "table", "tbody", "thead", "tr", "td", "th",
    "b", "i", "u", "em", "strong", "sub", "sup",
    "ul", "ol", "li",
    "font", "center", "small", "big",
    "a",
  ],
  allowedAttributes: {
    "*": ["class", "id", "align", "valign"],
    font: ["color", "size", "face"],
    td: ["colspan", "rowspan", "width", "valign", "align"],
    th: ["colspan", "rowspan", "width"],
    a: ["href", "title"],
  },
  allowedSchemes: ["http", "https"],
  allowedSchemesByTag: { a: ["http", "https", "mailto"] },
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: false,
};

const LANG_SLUG: Record<string, OfficiumLanguageSlug | "parallel"> = {
  la: "latin",
  de: "deutsch",
  en: "english",
  latin: "latin",
  deutsch: "deutsch",
  english: "english",
  parallel: "parallel",
};

const HOURS = [
  "matutinum", "laudes", "prima", "tertia", "sexta",
  "nona", "vesperae", "completorium",
];

export const revalidate = 3600;

function pickHour(day: OfficiumDay, hour: string): OfficiumHour | null {
  return day.hours[hour] ?? null;
}

function cleanHtml(raw: string): string {
  return sanitizeHtml(raw, OFFICIUM_SANITIZE_OPTIONS).trim();
}

function parallelHtml(left: OfficiumHour, right: OfficiumHour, leftLabel: string, rightLabel: string): string {
  return `<div class="officium-parallel"><div class="officium-parallel-col"><p class="officium-parallel-label">${leftLabel}</p>${cleanHtml(left.html)}</div><div class="officium-parallel-col"><p class="officium-parallel-label">${rightLabel}</p>${cleanHtml(right.html)}</div></div>`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ date: string; hour: string }> }
) {
  const { date, hour } = await params;
  const url = new URL(req.url);
  const langParam = url.searchParams.get("lang") ?? "parallel";

  if (!HOURS.includes(hour)) {
    return NextResponse.json({ error: "Unknown hour" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date must be YYYY-MM-DD" }, { status: 400 });
  }

  const langSlug = LANG_SLUG[langParam];
  if (!langSlug) {
    return NextResponse.json({ error: "Unknown lang" }, { status: 400 });
  }

  try {
    if (langSlug === "parallel") {
      const [la, de] = await Promise.all([
        fetchOfficiumDay({ date, languageSlug: "latin" }),
        fetchOfficiumDay({ date, languageSlug: "deutsch" }),
      ]);
      const laHour = pickHour(la, hour);
      const deHour = pickHour(de, hour);
      if (!laHour || !deHour) {
        return NextResponse.json({ error: "Hour not available for this day" }, { status: 404 });
      }
      return NextResponse.json({
        date,
        hour,
        title: laHour.label,
        liturgicalDay: la.hours[hour]?.headline ?? "",
        bodyHtml: parallelHtml(laHour, deHour, OFFICIUM_LANGUAGE_LABEL.latin, OFFICIUM_LANGUAGE_LABEL.deutsch),
        sourceUrl: null,
      }, {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
      });
    }

    const day = await fetchOfficiumDay({ date, languageSlug: langSlug });
    const h = pickHour(day, hour);
    if (!h) {
      return NextResponse.json({ error: "Hour not available for this day" }, { status: 404 });
    }
    return NextResponse.json({
      date,
      hour,
      title: h.label,
      liturgicalDay: h.headline,
      bodyHtml: cleanHtml(h.html),
      sourceUrl: null,
    }, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return NextResponse.json({
      error: "Could not fetch office",
      details: (err as Error).message,
    }, { status: 502 });
  }
}
