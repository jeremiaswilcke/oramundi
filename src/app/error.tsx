"use client";

import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <MaterialIcon name="error_outline" size={64} className="text-error/40 mb-4" />
      <h2 className="font-headline italic text-2xl text-on-surface mb-2">
        {t("somethingWentWrong")}
      </h2>
      <p className="text-on-surface-variant text-sm text-center mb-6 max-w-xs">
        {error.message || t("defaultMessage")}
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-medium rounded-full shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
