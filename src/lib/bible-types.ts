export interface Verse {
  n: number;
  t: string;
}

export interface Chapter {
  c: number;
  v: Verse[];
}

export interface Book {
  bn: number;
  s: string;
  name: string;
  chapters: Chapter[];
}

export interface PlanItem {
  bn: number;
  c: number;
  full: boolean;
}

export interface PlanLabel {
  label: string;
  items: PlanItem[];
}

export interface PlanDay {
  day: number;
  at: PlanLabel;
  nt: PlanLabel;
}

export interface BibleMetaBook {
  bn: number;
  s: string;
  name: string;
  chapters: number[];
}

export interface BibleMeta {
  at: BibleMetaBook[];
  nt: BibleMetaBook[];
}

export interface ChapterResponse {
  bn: number;
  s: string;
  name: string;
  c: number;
  verses: Verse[];
}

export interface DayPortion extends ChapterResponse {
  full: boolean;
}

export interface DayResponse {
  day: number;
  atLabel: string;
  ntLabel: string;
  at: DayPortion[];
  nt: DayPortion[];
}

export interface BibleProgressSummary {
  authenticated: boolean;
  todayMarked: boolean;
  streak: number;
  bestStreak: number;
  totalReadDays: number;
  lastReadOn: string | null;
}
