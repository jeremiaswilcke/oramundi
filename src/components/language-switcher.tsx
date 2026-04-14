"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "./material-icon";

const LANGS = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

type LangCode = (typeof LANGS)[number]["code"];

function setLocaleCookie(code: LangCode) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `locale=${code}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const current = useLocale() as LangCode;
  const [busy, setBusy] = useState(false);

  async function choose(code: LangCode) {
    if (code === current || busy) return;
    setBusy(true);
    setLocaleCookie(code);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ locale: code }).eq("id", user.id);
      }
    } catch {
      /* cookie is enough to switch; profile update is best-effort */
    }

    window.location.reload();
  }

  return (
    <div className="glass-card rounded-3xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MaterialIcon name="language" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="font-headline italic text-lg text-on-surface">
            {current === "de" ? "Sprache" : "Language"}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {current === "de"
              ? "Sprache der Oberfläche"
              : "Interface language"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => choose(l.code)}
            disabled={busy}
            className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              current === l.code
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            } disabled:opacity-60`}
          >
            <span className="text-base">{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
