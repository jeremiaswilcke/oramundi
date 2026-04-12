"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/material-icon";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "@/lib/supabase/actions";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "signin"
          ? await signInWithEmail(formData)
          : await signUpWithEmail(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleGoogle() {
    startTransition(async () => {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden selection:bg-primary-container/30">
      {/* Decorative blobs */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-12 relative z-10">
        {/* Logo */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-lowest rounded-full editorial-shadow mb-4">
            <MaterialIcon name="auto_awesome" filled size={32} className="text-primary" />
          </div>
          <h1 className="font-headline italic text-4xl text-on-surface tracking-tight">
            Ora Mundi
          </h1>
          <p className="font-label text-on-surface-variant text-sm tracking-widest uppercase">
            {t("welcome")}
          </p>
        </header>

        {/* Form Container */}
        <section className="bg-surface-container-lowest p-8 rounded-[2rem] editorial-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full -mr-16 -mt-16 blur-3xl" />

          <div className="relative z-10 space-y-8">
            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-error-container border border-error/20">
                <p className="text-on-error-container text-sm text-center">{error}</p>
              </div>
            )}

            {/* Form */}
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                  {t("email")}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@sanctuary.com"
                  className="w-full bg-surface-container-low border border-outline-variant/10 focus:border-primary/20 focus:ring-0 rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                  {t("password")}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant/10 focus:border-primary/20 focus:ring-0 rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 transition-all"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                    {t("displayName")}
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Your name"
                    className="w-full bg-surface-container-low border border-outline-variant/10 focus:border-primary/20 focus:ring-0 rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-medium py-4 rounded-full shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isPending
                  ? "..."
                  : mode === "signin"
                    ? tc("signIn")
                    : tc("createAccount")}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-outline-variant/10" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-outline/40 font-semibold">
                {tc("or")}
              </span>
              <div className="h-[1px] flex-1 bg-outline-variant/10" />
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-3 bg-surface-container-high text-on-surface-variant font-medium py-4 rounded-full hover:bg-surface-variant transition-all group disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100 transition-opacity">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm tracking-wide">
                {t("continueWithGoogle")}
              </span>
            </button>
          </div>
        </section>

        {/* Toggle mode */}
        <footer className="text-center pb-8">
          <p className="text-on-surface-variant/60 text-sm">
            {mode === "signin" ? (
              <button onClick={() => { setMode("register"); setError(null); }} className="text-primary font-semibold ml-1">
                {t("joinTheCircle")}
              </button>
            ) : (
              <button onClick={() => { setMode("signin"); setError(null); }} className="text-primary font-semibold ml-1">
                {t("alreadyHaveAccount")}
              </button>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
