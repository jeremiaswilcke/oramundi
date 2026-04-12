"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "./material-icon";

const NAV_ITEMS = [
  { href: "/", icon: "map", labelKey: "map" },
  { href: "/pray", icon: "self_improvement", labelKey: "pray" },
  { href: "/intentions", icon: "favorite", labelKey: "intentions" },
  { href: "/profile", icon: "person", labelKey: "profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0b1326]/90 backdrop-blur-xl border-t border-outline-variant/20">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 transition-colors ${
                isActive
                  ? "text-primary bg-primary/10 rounded-xl"
                  : "text-on-surface-variant"
              }`}
            >
              <MaterialIcon
                name={item.icon}
                filled={isActive}
                size={24}
                weight={isActive ? 600 : 400}
              />
              <span className="text-[0.625rem] font-semibold tracking-widest uppercase">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
