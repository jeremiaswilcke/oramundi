import type { Metadata, Viewport } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const CANONICAL_URL = "https://oramundi.online";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: {
    default: "Ora Mundi — Du betest nie allein",
    template: "%s · Ora Mundi",
  },
  description:
    "Bete den Rosenkranz und sieh auf einer Echtzeit-Weltkarte, wo gerade Menschen beten. Teile Gebetsanliegen und bete füreinander.",
  applicationName: "Ora Mundi",
  keywords: [
    "Rosenkranz",
    "Gebet",
    "Katholisch",
    "Gebetsgemeinschaft",
    "Stundengebet",
    "Novene",
    "Litanei",
    "Herzensgebet",
    "Catholic prayer",
    "Rosary",
  ],
  authors: [{ name: "Ora Mundi" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: {
      de: "/",
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Ora Mundi",
    title: "Ora Mundi — Du betest nie allein",
    description:
      "Bete den Rosenkranz, verbunden mit Menschen weltweit. Gebetsanliegen teilen, Gebetsgemeinschaften, Stundengebet, Herzensgebet.",
    url: CANONICAL_URL,
    locale: "de_DE",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Ora Mundi",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Ora Mundi — Du betest nie allein",
    description:
      "Bete den Rosenkranz, verbunden mit Menschen weltweit.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f0e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSerif.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body">
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
