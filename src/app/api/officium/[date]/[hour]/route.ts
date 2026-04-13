import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";

const OFFICIUM_ALLOWED_TAGS = [
  "p", "div", "span", "br", "hr",
  "h1", "h2", "h3", "h4", "h5",
  "table", "tbody", "thead", "tr", "td", "th",
  "b", "i", "u", "em", "strong", "sub", "sup",
  "ul", "ol", "li",
  "font", "center", "small", "big",
  "a",
];

const OFFICIUM_ALLOWED_ATTR = [
  "class", "id", "align", "color", "size", "colspan", "rowspan", "valign",
  "href", "title",
];

// Maps our hour slugs to divinumofficium.com command names
const HOUR_MAP: Record<string, string> = {
  matutinum: "prayMatutinum",
  laudes: "prayLaudes",
  prima: "prayPrima",
  tertia: "prayTertia",
  sexta: "praySexta",
  nona: "prayNona",
  vesperae: "prayVesperae",
  completorium: "prayCompletorium",
};

// Maps our locale to divinumofficium.com lang2 parameter
const LANG_MAP: Record<string, string> = {
  la: "Latin",
  de: "Deutsch",
  en: "English",
  parallel: "Latin-Deutsch",
};

export const revalidate = 21600; // cache 6 hours

export async function GET(
  req: Request,
  { params }: { params: Promise<{ date: string; hour: string }> }
) {
  const { date, hour } = await params;
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") ?? "parallel";

  const command = HOUR_MAP[hour];
  if (!command) {
    return NextResponse.json({ error: "Unknown hour" }, { status: 400 });
  }
  const lang2 = LANG_MAP[lang] ?? "Latin-Deutsch";

  // Convert YYYY-MM-DD to MM-DD-YYYY (their format)
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) {
    return NextResponse.json({ error: "Date must be YYYY-MM-DD" }, { status: 400 });
  }
  const dofDate = `${m}-${d}-${y}`;

  const fetchUrl = `https://divinumofficium.com/cgi-bin/horas/officium.pl?date1=${dofDate}&command=${command}&version=Rubrics+1960&lang2=${encodeURIComponent(lang2)}&plures=`;

  let html: string;
  try {
    const res = await fetch(fetchUrl, {
      headers: { "User-Agent": "Ora-Mundi/1.0 (+https://oramundi.online)" },
      next: { revalidate: 21600 },
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    html = await res.text();
  } catch (err) {
    return NextResponse.json({
      error: "Could not fetch office",
      details: (err as Error).message,
    }, { status: 502 });
  }

  // Extract the prayer body. The actual content lives inside a TABLE block
  // with cells ID'd like "Vespera1", "Vespera2", etc. for Vespers.
  // We extract everything between <H2> ID=...top and </FORM>.

  const bodyMatch = html.match(/<H2[^>]*ID=['"]?\w+top['"]?[^>]*>([\s\S]*?)<\/FORM>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  // Trim nav fragments before handing to the sanitizer
  body = body.split(/<FORM[\s\S]*?>/i)[0];
  body = body.split(/<INPUT TYPE=/i)[0];
  body = body.split(/<P ALIGN=CENTER><A HREF=/i)[0];
  body = body.replace(/<DIV ALIGN=['"]?right['"]?>[\s\S]*?<\/DIV>/gi, "");

  // Allowlist-based sanitization: drops scripts, event handlers, javascript: URLs,
  // iframes, embeds, SVG/MathML payloads, and any tag/attr not explicitly permitted.
  body = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: OFFICIUM_ALLOWED_TAGS,
    ALLOWED_ATTR: OFFICIUM_ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|#)/i,
    FORBID_TAGS: ["script", "style", "form", "iframe", "object", "embed", "svg", "math"],
  });

  // Extract the title (e.g. "Ad Vesperas")
  const titleMatch = html.match(/<H2[^>]*>([^<]+)<\/H2>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract the day's liturgical info (top of page)
  const liturgicalMatch = html.match(/<P ALIGN=CENTER><FONT COLOR="red">([^<]+)<\/FONT>/i);
  const liturgicalDay = liturgicalMatch ? liturgicalMatch[1].trim() : "";

  return NextResponse.json({
    date,
    hour,
    title,
    liturgicalDay,
    bodyHtml: body.trim(),
    sourceUrl: fetchUrl,
  }, {
    headers: { "Cache-Control": "public, max-age=21600, s-maxage=21600" },
  });
}
