"use client";

import { useTranslations } from "next-intl";
import { MaterialIcon } from "./material-icon";

interface TopAppBarProps {
  prayingCount?: number;
}

export function TopAppBar({ prayingCount = 0 }: TopAppBarProps) {
  const t = useTranslations("common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b1326]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MaterialIcon name="public" filled size={24} className="text-primary" />
          <span className="font-headline italic text-xl text-primary sacred-glow">
            Ora Mundi
          </span>
        </div>

        {/* Live Counter */}
        {prayingCount > 0 && (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span className="font-label text-xs font-semibold tracking-widest uppercase">
              {t("prayingNow", { count: prayingCount })}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
