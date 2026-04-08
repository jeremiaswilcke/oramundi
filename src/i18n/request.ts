import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED_LOCALES = ["en", "de"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function parseLocale(value: string | null | undefined): Locale {
  if (!value) return "en";
  const lang = value.split(",")[0]?.split("-")[0]?.toLowerCase();
  if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  return "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // Priority: cookie > Accept-Language > default
  const cookieLocale = cookieStore.get("locale")?.value;
  const acceptLanguage = headerStore.get("accept-language");

  const locale = cookieLocale
    ? parseLocale(cookieLocale)
    : parseLocale(acceptLanguage);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
