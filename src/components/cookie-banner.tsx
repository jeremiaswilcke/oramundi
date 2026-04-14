"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "ora-mundi-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[100]">
      <div className="glass-panel rounded-3xl p-4 md:p-5 editorial-shadow relative">
        <button
          onClick={accept}
          aria-label="Cookie-Hinweis schließen"
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          ×
        </button>
        <p className="text-sm text-on-surface mb-2 font-semibold pr-6">
          Diese Seite verwendet Cookies
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
          Nur technisch notwendige Cookies für Authentifizierung und Spracheinstellung. Kein Tracking. Details in der{" "}
          <Link href="/legal/privacy" className="text-primary underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="w-full px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-medium tracking-wide uppercase rounded-full hover:opacity-90 active:scale-95 transition-all"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
