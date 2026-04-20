// Fetcher fuer das vorberechnete Officium Divinum auf Cloudflare Pages.
// Datenlayout: {baseUrl}/{year}/{versionSlug}/{languageSlug}/{YYYY-MM-DD}.json
// Siehe CLAUDE.md in /Volumes/personal_folder/Ora Mundi.

export type OfficiumLanguageSlug = "latin" | "deutsch" | "english";

export const OFFICIUM_LANGUAGE_LABEL: Record<OfficiumLanguageSlug, string> = {
  latin: "Latein",
  deutsch: "Deutsch",
  english: "English",
};

export const OFFICIUM_DEFAULT_VERSION = "monastic-1617";

const OFFICIUM_BASE_URL =
  process.env.NEXT_PUBLIC_OFFICIUM_BASE_URL?.replace(/\/$/, "") ??
  "https://d86b3312.divinum.pages.dev";

export interface OfficiumHour {
  label: string;
  command: string;
  headline: string;
  html: string;
}

export interface OfficiumDay {
  generatedAt: string;
  date: string;
  year: number;
  version: string;
  versionSlug: string;
  language: string;
  languageSlug: OfficiumLanguageSlug;
  hours: Record<string, OfficiumHour>;
}

export function buildOfficiumUrl(params: {
  date: string;
  languageSlug: OfficiumLanguageSlug;
  versionSlug?: string;
}): string {
  const { date, languageSlug, versionSlug = OFFICIUM_DEFAULT_VERSION } = params;
  const year = date.slice(0, 4);
  return `${OFFICIUM_BASE_URL}/${year}/${versionSlug}/${languageSlug}/${date}.json`;
}

export async function fetchOfficiumDay(params: {
  date: string;
  languageSlug: OfficiumLanguageSlug;
  versionSlug?: string;
}): Promise<OfficiumDay> {
  const url = buildOfficiumUrl(params);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Officium upstream ${res.status} for ${params.date} / ${params.languageSlug}`);
  }
  return (await res.json()) as OfficiumDay;
}
