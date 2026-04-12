"use client";

import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <MaterialIcon name="explore_off" size={64} className="text-on-surface-variant/30 mb-4" />
      <h2 className="font-headline italic text-3xl text-on-surface mb-2">
        {t("pageNotFound")}
      </h2>
      <p className="text-on-surface-variant text-sm text-center mb-6">
        {t("message")}
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-medium rounded-full shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
