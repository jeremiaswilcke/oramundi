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
        className="px-6 py-3 bg-primary-container text-on-primary-container font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98]"
      >
        {t("goHome")}
      </Link>
    </div>
  );
}
