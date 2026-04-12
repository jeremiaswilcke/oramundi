"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "./material-icon";

const NAV_ITEMS = [
  { href: "/", icon: "map", labelKey: "sanctuary" },
  { href: "/pray", icon: "self_improvement", labelKey: "rituals" },
  { href: "/intentions", icon: "favorite", labelKey: "journal" },
  { href: "/profile", icon: "settings", labelKey: "settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl rounded-t-3xl editorial-shadow">
      <div className="flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive
                  ? "bg-primary-container/20 text-primary rounded-full px-4 py-1"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <MaterialIcon
                name={item.icon}
                filled={isActive}
                size={24}
                weight={isActive ? 600 : 300}
              />
              <span className="text-[11px] tracking-wide uppercase">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
