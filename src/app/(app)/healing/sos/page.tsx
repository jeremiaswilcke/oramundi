import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/material-icon";
import { SosActions } from "./sos-actions";

export default async function SosPage() {
  const t = await getTranslations("healing.sos");

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8">
      <Link
        href="/healing"
        className="inline-flex items-center gap-1 text-on-surface-variant text-sm mb-6"
      >
        <MaterialIcon name="chevron_left" size={20} />
        {t("back")}
      </Link>

      <p className="mess-eyebrow--serif-caps text-primary mb-3">Ora Mundi</p>
      <h1 className="mess-display mess-display--xl text-on-surface mb-3">
        {t("title")}
      </h1>
      <p className="text-on-surface-variant text-sm mb-8 leading-relaxed italic font-[var(--font-display)]">
        {t("intro")}
      </p>

      <SosActions />
    </div>
  );
}
