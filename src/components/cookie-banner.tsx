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
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-[100] pointer-events-auto">
      <div className="glass-panel rounded-3xl p-5 editorial-shadow">
        <p className="text-sm text-on-surface mb-3 font-semibold">
          Diese Seite verwendet Cookies
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          Wir verwenden ausschließlich technisch notwendige Cookies für Authentifizierung
          und Spracheinstellung. Keine Tracking- oder Werbe-Cookies. Details in unserer{" "}
          <Link href="/legal/privacy" className="text-primary underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/legal/privacy"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Mehr erfahren
          </Link>
          <button
            onClick={accept}
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary text-xs font-medium tracking-wide uppercase rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
