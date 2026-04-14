"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "./material-icon";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ora-mundi-install-dismissed";
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const v = localStorage.getItem(DISMISS_KEY);
  if (!v) return false;
  const at = parseInt(v, 10);
  if (Number.isNaN(at)) return false;
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState<"android" | "ios" | null>(null);
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (wasRecentlyDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVariant("android");
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIosSafari()) {
      const t = setTimeout(() => {
        setVariant("ios");
        setShow(true);
      }, 3000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
    setIosInstructions(false);
  }

  if (!show || !variant) return null;

  return (
    <>
      <div className="fixed left-3 right-3 bottom-20 z-40 max-w-md mx-auto rounded-3xl bg-surface-container-lowest editorial-shadow border border-outline-variant/20 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <MaterialIcon name="install_mobile" size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface leading-tight">
            Ora Mundi installieren
          </p>
          <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
            {variant === "android"
              ? "App auf dem Startbildschirm — schneller Zugriff, Offline-Gebet"
              : "Für beste Erfahrung zum Home-Bildschirm hinzufügen"}
          </p>
        </div>
        {variant === "android" ? (
          <button
            onClick={install}
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold flex-shrink-0"
          >
            Installieren
          </button>
        ) : (
          <button
            onClick={() => setIosInstructions(true)}
            className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold flex-shrink-0"
          >
            Anleitung
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Später"
          className="text-on-surface-variant/60 hover:text-on-surface flex-shrink-0"
        >
          <MaterialIcon name="close" size={18} />
        </button>
      </div>

      {iosInstructions && variant === "ios" && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          onClick={() => setIosInstructions(false)}
        >
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface-container-lowest rounded-t-[2rem] md:rounded-[2rem] p-6 editorial-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5 md:hidden" />
            <h3 className="font-headline italic text-2xl text-on-surface mb-4">
              Zum Home-Bildschirm hinzufügen
            </h3>
            <ol className="space-y-4 mb-6">
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </span>
                <div className="flex-1">
                  <p className="text-sm text-on-surface">
                    Tippe auf das <span className="inline-flex items-center gap-1 font-semibold">
                      <MaterialIcon name="ios_share" size={16} /> Teilen
                    </span>-Symbol unten in Safari
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </span>
                <div className="flex-1">
                  <p className="text-sm text-on-surface">
                    Wähle <span className="font-semibold">„Zum Home-Bildschirm"</span> aus der Liste
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </span>
                <div className="flex-1">
                  <p className="text-sm text-on-surface">
                    Tippe oben rechts auf <span className="font-semibold">„Hinzufügen"</span>
                  </p>
                </div>
              </li>
            </ol>
            <p className="text-[11px] text-on-surface-variant/70 mb-4">
              Hinweis: Push-Benachrichtigungen unter iOS funktionieren nur, wenn die App vom Home-Bildschirm aus gestartet wird.
            </p>
            <button
              onClick={dismiss}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-semibold"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
