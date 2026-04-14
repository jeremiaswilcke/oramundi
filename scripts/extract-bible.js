/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const SRC = process.argv[2];
const OUT = path.join(__dirname, "..", "public", "data");

const atOrder = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 69, 67, 17, 18, 19, 20, 21, 22,
  68, 70, 23, 24, 25, 71, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 72, 73,
];
const ntOrder = [
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62, 63, 64, 65, 66,
];

if (!SRC) {
  console.error("Usage: node scripts/extract-bible.js <path-to-zefania-xml>");
  process.exit(1);
}

if (path.extname(SRC).toLowerCase() !== ".xml") {
  console.error("Please pass the extracted Zefania XML file. ZIP extraction is not built into this script.");
  process.exit(1);
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function normalizeText(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseAttributes(input) {
  const attributes = {};
  const pattern = /([A-Za-z_:][A-Za-z0-9_.:-]*)="([^"]*)"/g;
  let match;
  while ((match = pattern.exec(input))) {
    attributes[match[1]] = decodeEntities(match[2]);
  }
  return attributes;
}

const xml = fs.readFileSync(SRC, "utf8");
const books = [];
const bookPattern = /<BIBLEBOOK\b([^>]*)>([\s\S]*?)<\/BIBLEBOOK>/g;
let bookMatch;

while ((bookMatch = bookPattern.exec(xml))) {
  const bookAttrs = parseAttributes(bookMatch[1]);
  const chapterPattern = /<CHAPTER\b([^>]*)>([\s\S]*?)<\/CHAPTER>/g;
  const chapters = [];
  let chapterMatch;

  while ((chapterMatch = chapterPattern.exec(bookMatch[2]))) {
    const chapterAttrs = parseAttributes(chapterMatch[1]);
    const versePattern = /<VERS\b([^>]*)>([\s\S]*?)<\/VERS>/g;
    const verses = [];
    let verseMatch;

    while ((verseMatch = versePattern.exec(chapterMatch[2]))) {
      const verseAttrs = parseAttributes(verseMatch[1]);
      const verseNumber = Number.parseInt(verseAttrs.vnumber, 10);
      if (!Number.isFinite(verseNumber)) {
        continue;
      }

      const text = normalizeText(verseMatch[2]);
      if (!text) {
        continue;
      }

      verses.push({ n: verseNumber, t: text });
    }

    chapters.push({
      c: Number.parseInt(chapterAttrs.cnumber, 10),
      v: verses.sort((left, right) => left.n - right.n),
    });
  }

  books.push({
    bn: Number.parseInt(bookAttrs.bnumber, 10),
    s: bookAttrs.bsname,
    name: bookAttrs.bname,
    chapters,
  });
}

const byNumber = new Map(books.map((book) => [book.bn, book]));

function mustBook(number) {
  const book = byNumber.get(number);
  if (!book) {
    throw new Error(`Missing book ${number}`);
  }
  return book;
}

const slim = books.map((book) => [
  book.bn,
  book.s,
  book.name,
  book.chapters.map((chapter) => {
    const sequential = chapter.v.every((verse, index) => verse.n === index + 1);
    if (sequential) {
      return [chapter.c, chapter.v.map((verse) => verse.t)];
    }

    const data = {};
    for (const verse of chapter.v) {
      data[verse.n] = verse.t;
    }
    return [chapter.c, data];
  }),
]);

const meta = {
  at: atOrder.map((number) => {
    const book = mustBook(number);
    return {
      bn: book.bn,
      s: book.s,
      name: book.name,
      chapters: book.chapters.map((chapter) => chapter.c),
    };
  }),
  nt: ntOrder.map((number) => {
    const book = mustBook(number);
    return {
      bn: book.bn,
      s: book.s,
      name: book.name,
      chapters: book.chapters.map((chapter) => chapter.c),
    };
  }),
};

function chapterList(order) {
  const items = [];
  for (const number of order) {
    const book = mustBook(number);
    for (const chapter of book.chapters) {
      items.push({
        bn: book.bn,
        s: book.s,
        c: chapter.c,
      });
    }
  }
  return items;
}

function sliceForDay(chapters, dayIndex, totalDays) {
  const total = chapters.length;
  const start = Math.round((dayIndex * total) / totalDays);
  const end = Math.round(((dayIndex + 1) * total) / totalDays);
  return chapters.slice(start, end);
}

function formatChapterRange(chapters) {
  if (chapters.length === 0) {
    return { label: "", items: [] };
  }

  const labels = [];
  let index = 0;

  while (index < chapters.length) {
    let end = index;
    while (
      end + 1 < chapters.length &&
      chapters[end + 1].bn === chapters[index].bn &&
      chapters[end + 1].c === chapters[end].c + 1
    ) {
      end += 1;
    }

    labels.push(
      end === index
        ? `${chapters[index].s} ${chapters[index].c}`
        : `${chapters[index].s} ${chapters[index].c}-${chapters[end].c}`,
    );
    index = end + 1;
  }

  return {
    label: labels.join("; "),
    items: chapters.map((chapter) => ({ bn: chapter.bn, c: chapter.c, full: true })),
  };
}

const totalDays = 365;
const atChapters = chapterList(atOrder);
const ntChapters = chapterList(ntOrder);
const readingPlan = [];

for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
  readingPlan.push({
    day: dayIndex + 1,
    at: formatChapterRange(sliceForDay(atChapters, dayIndex, totalDays)),
    nt: formatChapterRange(sliceForDay(ntChapters, dayIndex, totalDays)),
  });
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "bible.json.gz"), zlib.gzipSync(JSON.stringify(slim), { level: 9 }));
fs.writeFileSync(path.join(OUT, "bible-meta.json"), JSON.stringify(meta));
fs.writeFileSync(path.join(OUT, "reading-plan.json"), JSON.stringify(readingPlan));

console.log(`Wrote Bible assets to ${OUT}`);
