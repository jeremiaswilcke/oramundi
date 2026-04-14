import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ora-mundi.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth", "/legal/impressum", "/legal/privacy"],
        disallow: ["/api/", "/profile", "/pray", "/intentions", "/groups", "/library", "/officium", "/healing", "/onboarding"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
