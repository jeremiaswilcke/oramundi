import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "ybWg0XgugDk1LNoPvkfL",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BDByHmHaWh7a1fzE8Bfd5JZ5REG2kmHhe6KLHGuFrrXBoc1u3xHkilG1DN8GOVphSGq1W-Pt1s9FsKfGz2f0cVA",
  },
};

export default withSerwist(withNextIntl(nextConfig));
