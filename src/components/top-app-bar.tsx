"use client";

import { useTranslations } from "next-intl";
import { OraMundiLogo } from "./ora-mundi-logo";

interface TopAppBarProps {
  prayingCount?: number;
}

export function TopAppBar({ prayingCount = 0 }: TopAppBarProps) {
  const t = useTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl editorial-shadow">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <OraMundiLogo size={28} />
          <h1 className="font-headline italic text-2xl text-on-surface">
            Ora Mundi
          </h1>
        </div>

        {/* Live Counter */}
        {prayingCount > 0 && (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="font-label text-xs font-medium tracking-widest uppercase">
              {t("prayingNow", { count: prayingCount })}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
