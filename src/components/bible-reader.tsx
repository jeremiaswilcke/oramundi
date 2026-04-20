"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  defaultAnchorToday,
  getEffectivePlanDay,
} from "@/lib/bible-plan";
import { useBiblePlanAnchor } from "@/lib/use-bible-plan-anchor";
import type {
  BibleMeta,
  BibleMetaBook,
  ChapterResponse,
  DayPortion,
  DayResponse,
  Verse,
} from "@/lib/bible-types";

import { BibleMarkReadButton } from "./bible-mark-read-button";
import { BibleStartDialog } from "./bible-start-dialog";
import { BibleStreakBadge } from "./bible-streak-badge";
import { MaterialIcon } from "./material-icon";

interface BibleReaderProps {
  initialDay?: number | null;
}

interface BiblePosition {
  bn: number;
  c: number;
}

const POSITION_KEY = "ora_mundi_bible_pos";
const FONT_SIZE_KEY = "ora_mundi_bible_font";
const DEUTEROCANONICAL_BOOKS = new Set([67, 68, 69, 70, 71, 72, 73]);

type FontSize = "sm" | "md" | "lg";

const FONT_CLASSES: Record<FontSize, string> = {
  sm: "text-base leading-[2]",
  md: "text-lg leading-[2.1]",
  lg: "text-xl leading-[2.2]",
};

const DROP_CAP_CLASSES: Record<FontSize, string> = {
  sm: "text-[4.5rem]",
  md: "text-[5rem]",
  lg: "text-[5.5rem]",
};

function clampDay(value: number) {
  return Math.min(Math.max(Math.trunc(value), 1), 365);
}

function buildVerseCopyText(bookName: string, chapterNumber: number, verse: Verse) {
  return `"${verse.t}" (${bookName} ${chapterNumber},${verse.n}, Allioli-Arndt 1914)`;
}

function buildChapterCopyText(portion: { name: string; c: number; verses: Verse[] }) {
  const body = portion.verses.map((verse) => `${verse.n} ${verse.t}`).join(" ");
  return `${portion.name} ${portion.c} - ${body} (Allioli-Arndt 1914)`;
}

export function BibleReader({ initialDay }: BibleReaderProps) {
  const t = useTranslations("bible");
  const router = useRouter();
  const { anchor, authenticated, loaded, setAnchor } = useBiblePlanAnchor();
  const [currentDay, setCurrentDay] = useState(initialDay ?? 1);

  const [mode, setMode] = useState<"read" | "plan">(initialDay ? "plan" : "read");
  const [selectedDay, setSelectedDay] = useState(clampDay(initialDay ?? currentDay));
  const [selectedTestament, setSelectedTestament] = useState<"at" | "nt">("at");
  const [query, setQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<number | null>(1);
  const [position, setPosition] = useState<BiblePosition>({ bn: 1, c: 1 });
  const [meta, setMeta] = useState<BibleMeta | null>(null);
  const [chapterData, setChapterData] = useState<ChapterResponse | null>(null);
  const [dayData, setDayData] = useState<DayResponse | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [copyKey, setCopyKey] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const effective = anchor
      ? getEffectivePlanDay(anchor)
      : getEffectivePlanDay(defaultAnchorToday());
    setCurrentDay(effective);
    if (initialDay == null) {
      setSelectedDay(effective);
    }
  }, [anchor, loaded, initialDay]);

  useEffect(() => {
    if (!loaded) return;
    if (authenticated && !anchor) {
      setDialogOpen(true);
    }
  }, [loaded, authenticated, anchor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(FONT_SIZE_KEY);
    if (saved === "sm" || saved === "md" || saved === "lg") {
      setFontSize(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      const response = await fetch("/data/bible-meta.json", { cache: "force-cache" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as BibleMeta;
      if (!cancelled) {
        setMeta(payload);
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || initialDay) {
      return;
    }

    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<BiblePosition>;
      if (Number.isInteger(parsed.bn) && Number.isInteger(parsed.c)) {
        setPosition({ bn: parsed.bn!, c: parsed.c! });
        setExpandedBook(parsed.bn!);
      }
    } catch {
      // Ignore invalid local state.
    }
  }, [initialDay]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(POSITION_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (mode === "plan") {
      router.replace(`/bibel/lesen?tag=${selectedDay}`, { scroll: false });
    } else {
      router.replace("/bibel/lesen", { scroll: false });
    }
  }, [mode, router, selectedDay]);

  useEffect(() => {
    if (mode !== "read") {
      return;
    }

    let cancelled = false;

    async function loadChapter() {
      try {
        setChapterLoading(true);
        const response = await fetch(`/api/bible/chapter/${position.bn}/${position.c}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as ChapterResponse;
        if (!cancelled) {
          setChapterData(payload);
        }
      } finally {
        if (!cancelled) {
          setChapterLoading(false);
        }
      }
    }

    loadChapter();

    return () => {
      cancelled = true;
    };
  }, [mode, position]);

  useEffect(() => {
    if (mode !== "plan") {
      return;
    }

    let cancelled = false;

    async function loadDay() {
      try {
        setDayLoading(true);
        const response = await fetch(`/api/bible/day/${selectedDay}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as DayResponse;
        if (!cancelled) {
          setDayData(payload);
        }
      } finally {
        if (!cancelled) {
          setDayLoading(false);
        }
      }
    }

    loadDay();

    return () => {
      cancelled = true;
    };
  }, [mode, selectedDay]);

  const allBooks = useMemo(() => (meta ? [...meta.at, ...meta.nt] : []), [meta]);
  const displayedBooks = useMemo(() => {
    if (!meta) {
      return [];
    }

    const source = selectedTestament === "at" ? meta.at : meta.nt;
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return source;
    }

    return source.filter((book) => {
      return book.name.toLowerCase().includes(needle) || book.s.toLowerCase().includes(needle);
    });
  }, [meta, query, selectedTestament]);

  const chapterSequence = useMemo(() => {
    return allBooks.flatMap((book) => book.chapters.map((chapter) => ({ bn: book.bn, c: chapter })));
  }, [allBooks]);

  const currentChapterIndex = chapterSequence.findIndex(
    (entry) => entry.bn === position.bn && entry.c === position.c,
  );
  const previousChapter = currentChapterIndex > 0 ? chapterSequence[currentChapterIndex - 1] : null;
  const nextChapter =
    currentChapterIndex >= 0 && currentChapterIndex + 1 < chapterSequence.length
      ? chapterSequence[currentChapterIndex + 1]
      : null;

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyKey(key);
      window.setTimeout(() => {
        setCopyKey((current) => (current === key ? null : current));
      }, 1600);
    } catch {
      // Clipboard access can fail silently.
    }
  }

  function openChapter(book: BibleMetaBook, chapterNumber: number) {
    setPosition({ bn: book.bn, c: chapterNumber });
    setExpandedBook(book.bn);
    setMode("read");
  }

  function renderVerses(bookName: string, chapterNumber: number, verses: Verse[], prefix: string) {
    const fontClass = FONT_CLASSES[fontSize];
    const dropCapSize = DROP_CAP_CLASSES[fontSize];

    return (
      <div className={`prayer-text text-on-surface ${fontClass}`}>
        {verses.map((verse, idx) => {
          const key = `${prefix}-${verse.n}`;
          const copied = copyKey === key;
          const isOpening = idx === 0 && verse.t.length > 0;

          if (isOpening) {
            const firstChar = verse.t.charAt(0);
            const rest = verse.t.slice(1);
            return (
              <button
                key={verse.n}
                onClick={() => copyText(key, buildVerseCopyText(bookName, chapterNumber, verse))}
                className={`mb-1 inline rounded-xl px-1 py-0.5 text-left transition-colors hover:bg-primary/5 ${
                  copied ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <span
                  className={`float-left mr-2 mt-1 font-headline italic leading-[0.85] text-primary ${dropCapSize}`}
                  aria-hidden="true"
                >
                  {firstChar}
                </span>
                <span className="sr-only">{verse.n} </span>
                {rest}{" "}
              </button>
            );
          }

          return (
            <button
              key={verse.n}
              onClick={() => copyText(key, buildVerseCopyText(bookName, chapterNumber, verse))}
              className={`mb-1 inline rounded-xl px-1 py-0.5 text-left transition-colors hover:bg-primary/5 ${
                copied ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <sup className="mr-1 text-[11px] font-semibold text-primary/80">{verse.n}</sup>
              {verse.t}{" "}
            </button>
          );
        })}
      </div>
    );
  }

  function switchPortionToReadMode(portion: DayPortion) {
    setPosition({ bn: portion.bn, c: portion.c });
    setExpandedBook(portion.bn);
    setSelectedTestament(portion.bn <= 39 || DEUTEROCANONICAL_BOOKS.has(portion.bn) ? "at" : "nt");
    setMode("read");
  }

  async function handleAnchorConfirm(planDay: number) {
    await setAnchor(planDay);
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-4 pb-24 pt-4 md:px-6">
      <div className="grid gap-5 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="glass-card rounded-[2rem] p-4 md:sticky md:top-20 md:max-h-[calc(100vh-7rem)] md:overflow-hidden">
          <div className="flex gap-2 rounded-full bg-surface-container p-1">
            <button
              onClick={() => setMode("read")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === "read" ? "bg-primary text-on-primary" : "text-on-surface-variant"
              }`}
            >
              {t("readMode")}
            </button>
            <button
              onClick={() => setMode("plan")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === "plan" ? "bg-primary text-on-primary" : "text-on-surface-variant"
              }`}
            >
              {t("planMode")}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-headline text-2xl italic text-on-surface">{t("yearTitle")}</h1>
              <p className="text-sm text-on-surface-variant">{t("readerIntro")}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <BibleStreakBadge />
              {authenticated ? (
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  aria-label={t("changePlanStart")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:text-primary"
                >
                  <MaterialIcon name="tune" size={18} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low px-3 py-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">
              {t("fontSizeLabel")}
            </span>
            <div className="flex gap-1">
              {(["sm", "md", "lg"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    fontSize === size
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-on-surface-variant"
                  }`}
                >
                  {t(
                    size === "sm"
                      ? "fontSizeSmall"
                      : size === "md"
                      ? "fontSizeMedium"
                      : "fontSizeLarge",
                  )}
                </button>
              ))}
            </div>
          </div>

          {mode === "read" ? (
            <div className="mt-5">
              <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTestament("at")}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-widest ${
                      selectedTestament === "at" ? "bg-primary text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {t("oldTestament")}
                  </button>
                  <button
                    onClick={() => setSelectedTestament("nt")}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-widest ${
                      selectedTestament === "nt" ? "bg-primary text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {t("newTestament")}
                  </button>
                </div>

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchBooks")}
                  className="mt-3 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none"
                />
              </div>

              <div className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
                {displayedBooks.map((book) => (
                  <div key={book.bn} className="rounded-2xl bg-surface-container-low p-3">
                    <button
                      onClick={() => setExpandedBook((current) => (current === book.bn ? null : book.bn))}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <p className="font-headline text-lg italic text-on-surface">{book.name}</p>
                        <p className="text-xs text-on-surface-variant">{book.s}</p>
                      </div>
                      <MaterialIcon
                        name={expandedBook === book.bn ? "expand_less" : "expand_more"}
                        size={20}
                        className="text-on-surface-variant"
                      />
                    </button>

                    {expandedBook === book.bn ? (
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {book.chapters.map((chapterNumber) => {
                          const active = position.bn === book.bn && position.c === chapterNumber;

                          return (
                            <button
                              key={chapterNumber}
                              onClick={() => openChapter(book, chapterNumber)}
                              className={`rounded-xl px-0 py-2 text-sm transition-colors ${
                                active
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                              }`}
                            >
                              {chapterNumber}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ))}

                {displayedBooks.length === 0 ? (
                  <div className="rounded-2xl bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
                    {t("noBooksFound")}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[2rem] bg-surface-container-low p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDay((current) => clampDay(current - 1))}
                  className="h-11 w-11 rounded-full bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
                  aria-label={t("previousDay")}
                >
                  <MaterialIcon name="chevron_left" size={24} />
                </button>
                <div className="flex-1 rounded-full bg-surface-container-lowest px-4 py-3 text-center text-sm font-medium text-on-surface">
                  {t("dayNumberOnly", { day: selectedDay })}
                </div>
                <button
                  onClick={() => setSelectedDay((current) => clampDay(current + 1))}
                  className="h-11 w-11 rounded-full bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
                  aria-label={t("nextDay")}
                >
                  <MaterialIcon name="chevron_right" size={24} />
                </button>
              </div>

              <button
                onClick={() => setSelectedDay(currentDay)}
                className="mt-3 w-full rounded-full bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
              >
                {t("todayButton", { day: currentDay })}
              </button>

              {dayLoading ? (
                <div className="mt-4 space-y-3">
                  <div className="skeleton-shimmer h-16 rounded-2xl" />
                  <div className="skeleton-shimmer h-16 rounded-2xl" />
                </div>
              ) : dayData ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{t("oldTestament")}</p>
                    <p className="mt-1 font-medium text-on-surface">{dayData.atLabel || t("noneToday")}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-lowest px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{t("newTestament")}</p>
                    <p className="mt-1 font-medium text-on-surface">{dayData.ntLabel || t("noneToday")}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </aside>

        <section className="min-w-0">
          {mode === "read" ? (
            <div className="glass-card rounded-[2rem] p-5 md:p-7">
              {chapterLoading || !chapterData ? (
                <div className="space-y-4">
                  <div className="skeleton-shimmer h-8 w-64 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-40 rounded-full" />
                  <div className="skeleton-shimmer h-56 rounded-[2rem]" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 border-b border-outline-variant/50 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{chapterData.s}</p>
                      <h2 className="mt-2 font-headline text-3xl italic text-on-surface">
                        {chapterData.name} {chapterData.c}
                      </h2>
                    </div>
                    <button
                      onClick={() =>
                        copyText(
                          `chapter-${chapterData.bn}-${chapterData.c}`,
                          buildChapterCopyText({
                            name: chapterData.name,
                            c: chapterData.c,
                            verses: chapterData.verses,
                          }),
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                    >
                      <MaterialIcon
                        name={copyKey === `chapter-${chapterData.bn}-${chapterData.c}` ? "check" : "content_copy"}
                        size={18}
                      />
                      <span>{copyKey === `chapter-${chapterData.bn}-${chapterData.c}` ? t("copied") : t("chapterCopy")}</span>
                    </button>
                  </div>

                  <div className="pt-6">
                    {renderVerses(
                      chapterData.name,
                      chapterData.c,
                      chapterData.verses,
                      `chapter-${chapterData.bn}-${chapterData.c}`,
                    )}
                  </div>
                </>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/50 pt-5">
                <button
                  onClick={() => previousChapter && setPosition(previousChapter)}
                  disabled={!previousChapter}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface-variant transition-colors disabled:opacity-40"
                >
                  <MaterialIcon name="chevron_left" size={18} />
                  <span>{t("previousChapter")}</span>
                </button>

                <button
                  onClick={() => nextChapter && setPosition(nextChapter)}
                  disabled={!nextChapter}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary transition-colors disabled:opacity-40"
                >
                  <span>{t("nextChapter")}</span>
                  <MaterialIcon name="chevron_right" size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {dayLoading || !dayData ? (
                <>
                  <div className="glass-card rounded-[2rem] p-6">
                    <div className="skeleton-shimmer h-8 w-72 rounded-full" />
                    <div className="skeleton-shimmer mt-4 h-56 rounded-[2rem]" />
                  </div>
                  <div className="glass-card rounded-[2rem] p-6">
                    <div className="skeleton-shimmer h-8 w-72 rounded-full" />
                    <div className="skeleton-shimmer mt-4 h-56 rounded-[2rem]" />
                  </div>
                </>
              ) : (
                <>
                  {[
                    { key: "at", label: t("oldTestament"), portions: dayData.at },
                    { key: "nt", label: t("newTestament"), portions: dayData.nt },
                  ].map((section) =>
                    section.portions.length ? (
                      <div key={section.key} className="glass-card rounded-[2rem] p-5 md:p-7">
                        <div className="flex items-center justify-between gap-3 border-b border-outline-variant/50 pb-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">{section.label}</p>
                            <h2 className="mt-2 font-headline text-3xl italic text-on-surface">
                              {section.key === "at" ? dayData.atLabel : dayData.ntLabel}
                            </h2>
                          </div>
                        </div>

                        <div className="mt-5 space-y-6">
                          {section.portions.map((portion: DayPortion) => (
                            <article
                              key={`${section.key}-${portion.bn}-${portion.c}`}
                              className="rounded-[2rem] bg-surface-container-lowest/80 p-5"
                            >
                              <div className="flex flex-col gap-3 border-b border-outline-variant/40 pb-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h3 className="font-headline text-2xl italic text-on-surface">
                                    {portion.name} {portion.c}
                                  </h3>
                                  <p className="mt-1 text-sm text-on-surface-variant">{portion.s}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => switchPortionToReadMode(portion)}
                                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-medium text-on-surface-variant"
                                  >
                                    <MaterialIcon name="menu_book" size={18} />
                                    <span>{t("goToReadMode")}</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      copyText(
                                        `portion-${portion.bn}-${portion.c}`,
                                        buildChapterCopyText({
                                          name: portion.name,
                                          c: portion.c,
                                          verses: portion.verses,
                                        }),
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                                  >
                                    <MaterialIcon
                                      name={copyKey === `portion-${portion.bn}-${portion.c}` ? "check" : "content_copy"}
                                      size={18}
                                    />
                                    <span>{copyKey === `portion-${portion.bn}-${portion.c}` ? t("copied") : t("copy")}</span>
                                  </button>
                                </div>
                              </div>

                              <div className="pt-5">
                                {renderVerses(
                                  portion.name,
                                  portion.c,
                                  portion.verses,
                                  `portion-${portion.bn}-${portion.c}`,
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}

                  <BibleMarkReadButton planDay={selectedDay} isToday={selectedDay === currentDay} />
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <BibleStartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleAnchorConfirm}
        initialPlanDay={anchor?.planDay}
      />
    </div>
  );
}
