import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import type { BibleMeta, Book, Chapter, PlanDay, PlanItem, Verse } from "@/lib/bible-types";

type SlimChapter = [number, string[] | Record<string, string>];
type SlimBook = [number, string, string, SlimChapter[]];

const AT_ORDER = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 69, 67, 17, 18, 19, 20, 21, 22,
  68, 70, 23, 24, 25, 71, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 72, 73,
] as const;
const NT_ORDER = [
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
  62, 63, 64, 65, 66,
] as const;

interface LoadedBible {
  books: Book[];
  byNumber: Map<number, Book>;
  plan: PlanDay[];
  meta: BibleMeta;
}

let cache: LoadedBible | null = null;

function slimChapterToVerses(data: SlimChapter[1]): Verse[] {
  if (Array.isArray(data)) {
    return data.map((text, index) => ({ n: index + 1, t: text }));
  }

  return Object.entries(data)
    .map(([key, text]) => ({ n: Number.parseInt(key, 10), t: text }))
    .filter((verse) => Number.isFinite(verse.n))
    .sort((left, right) => left.n - right.n);
}

function buildMeta(books: Book[]): BibleMeta {
  const byNumber = new Map(books.map((book) => [book.bn, book]));

  return {
    at: AT_ORDER.map((number) => {
      const book = byNumber.get(number);
      if (!book) {
        throw new Error(`Missing AT book ${number} in Bible dataset.`);
      }

      return {
        bn: book.bn,
        s: book.s,
        name: book.name,
        chapters: book.chapters.map((chapter) => chapter.c),
      };
    }),
    nt: NT_ORDER.map((number) => {
      const book = byNumber.get(number);
      if (!book) {
        throw new Error(`Missing NT book ${number} in Bible dataset.`);
      }

      return {
        bn: book.bn,
        s: book.s,
        name: book.name,
        chapters: book.chapters.map((chapter) => chapter.c),
      };
    }),
  };
}

function loadBible(): LoadedBible {
  if (cache) {
    return cache;
  }

  const dataDir = path.join(process.cwd(), "public", "data");
  const bibleFile = path.join(dataDir, "bible.json.gz");
  const planFile = path.join(dataDir, "reading-plan.json");

  const slim = JSON.parse(zlib.gunzipSync(fs.readFileSync(bibleFile)).toString("utf8")) as SlimBook[];
  const books = slim.map(([bn, s, name, chapters]) => ({
    bn,
    s,
    name,
    chapters: chapters.map(([c, data]) => ({
      c,
      v: slimChapterToVerses(data),
    })),
  }));

  cache = {
    books,
    byNumber: new Map(books.map((book) => [book.bn, book])),
    plan: JSON.parse(fs.readFileSync(planFile, "utf8")) as PlanDay[],
    meta: buildMeta(books),
  };

  return cache;
}

export function getBibleMeta(): BibleMeta {
  return loadBible().meta;
}

export function getChapter(bn: number, c: number): { book: Book; chapter: Chapter } | undefined {
  const book = loadBible().byNumber.get(bn);
  if (!book) {
    return undefined;
  }

  const chapter = book.chapters.find((candidate) => candidate.c === c);
  if (!chapter) {
    return undefined;
  }

  return { book, chapter };
}

export function getPlan(): PlanDay[] {
  return loadBible().plan;
}

export function getPlanForDay(day: number): PlanDay {
  const plan = loadBible().plan;
  const safeDay = Math.min(Math.max(Math.trunc(day || 1), 1), 365);
  return plan[safeDay - 1] ?? plan[0];
}

export function dayOfYear(date = new Date()): number {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);

  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  localDate.setHours(0, 0, 0, 0);

  const day = Math.floor((localDate.getTime() - yearStart.getTime()) / 86_400_000) + 1;
  return Math.min(Math.max(day, 1), 365);
}

export function getPortionsForItems(items: PlanItem[]) {
  return items
    .map((item) => {
      const result = getChapter(item.bn, item.c);
      if (!result) {
        return null;
      }

      return {
        book: result.book,
        chapter: result.chapter,
        verses: result.chapter.v,
        full: item.full,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
