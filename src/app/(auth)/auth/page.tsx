"use client";

import { useState, useTransition } from "react";
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <MaterialIcon name="public" filled size={48} className="text-primary mb-3" />
          <h1 className="font-headline italic text-5xl text-primary-fixed sacred-glow mb-2">
            Ora Mundi
          </h1>
          <p className="text-on-surface-variant text-sm tracking-widest uppercase font-semibold">
            Welcome to the Sanctuary
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/20">
            <p className="text-error text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-6">
          <div className="relative">
            <MaterialIcon
              name="mail"
              size={20}
              className="absolute left-0 bottom-3 text-on-surface-variant/40"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="w-full bg-transparent border-b border-outline-variant/30 pb-3 pl-8 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="relative">
            <MaterialIcon
              name="key"
              size={20}
              className="absolute left-0 bottom-3 text-on-surface-variant/40"
            />
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Password"
              className="w-full bg-transparent border-b border-outline-variant/30 pb-3 pl-8 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-colors"
            />
          </div>

          {mode === "register" && (
            <div className="relative">
              <MaterialIcon
                name="person"
                size={20}
                className="absolute left-0 bottom-3 text-on-surface-variant/40"
              />
              <input
                type="text"
                name="displayName"
                placeholder="Display name"
                className="w-full bg-transparent border-b border-outline-variant/30 pb-3 pl-8 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="block w-full py-4 bg-primary-container text-on-primary-container text-center font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending
              ? "..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant/40">
            or
          </span>
          <div className="flex-1 h-px bg-outline-variant/20" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={isPending}
          className="glass-panel w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-outline-variant/20 transition-all hover:border-outline-variant/40 active:scale-[0.98] disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-on-surface text-sm font-semibold">
            Continue with Google
          </span>
        </button>

        {/* Toggle mode */}
        <div className="text-center mt-8">
          {mode === "signin" ? (
            <button onClick={() => { setMode("register"); setError(null); }} className="text-primary text-sm font-semibold">
              Join the Circle
            </button>
          ) : (
            <button onClick={() => { setMode("signin"); setError(null); }} className="text-primary text-sm font-semibold">
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
