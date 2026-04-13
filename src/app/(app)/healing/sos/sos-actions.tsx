"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

type PrayerType = "heart" | "rosary_decade";

export function SosActions() {
  const t = useTranslations("healing.sos");
  const router = useRouter();
  const [loading, setLoading] = useState<null | "alone" | "partner">(null);
  const [error, setError] = useState<string | null>(null);

  async function startAlone(prayerType: PrayerType) {
    setError(null);
    setLoading("alone");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const { data, error } = await supabase
      .from("sos_sessions")
      .insert({
        requester_id: user.id,
        prayer_type: prayerType,
        status: "active",
        matched_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      setError(error?.message ?? "unknown error");
      setLoading(null);
      return;
    }

    router.push(`/healing/sos/session/${data.id}?mode=alone`);
  }

  async function startWithPartner(prayerType: PrayerType) {
    setError(null);
    setLoading("partner");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const { data: session, error: createErr } = await supabase
      .from("sos_sessions")
      .insert({
        requester_id: user.id,
        prayer_type: prayerType,
        status: "pending",
      })
      .select("id")
      .single();

    if (createErr || !session) {
      setError(createErr?.message ?? "unknown error");
      setLoading(null);
      return;
    }

    const { data: match, error: matchErr } = await supabase.rpc("match_sos_partner", {
      p_session_id: session.id,
    });

    if (matchErr) {
      setError(matchErr.message);
      setLoading(null);
      return;
    }

    if (!match || match.length === 0) {
      setError(t("noPartnerAvailable"));
      setLoading(null);
      // session remains pending; user can retry or switch to alone
      return;
    }

    router.push(`/healing/sos/session/${session.id}?mode=partner`);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => startWithPartner("heart")}
        disabled={loading !== null}
        className="w-full rounded-3xl p-5 bg-primary text-on-primary flex items-center gap-4 disabled:opacity-60 active:scale-[0.99] transition-transform"
      >
        <div className="w-12 h-12 rounded-full bg-on-primary/15 flex items-center justify-center flex-shrink-0">
          <MaterialIcon name="groups" size={28} />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-headline italic text-xl mb-0.5">
            {t("withPartnerTitle")}
          </h3>
          <p className="text-xs opacity-80">{t("withPartnerSubtitle")}</p>
        </div>
      </button>

      <button
        onClick={() => startAlone("heart")}
        disabled={loading !== null}
        className="w-full rounded-3xl p-5 glass-card flex items-center gap-4 disabled:opacity-60 active:scale-[0.99] transition-transform"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MaterialIcon name="self_improvement" size={28} className="text-primary" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-headline italic text-xl text-on-surface mb-0.5">
            {t("aloneTitle")}
          </h3>
          <p className="text-xs text-on-surface-variant">{t("aloneSubtitle")}</p>
        </div>
      </button>

      {error && <p className="text-xs text-error text-center">{error}</p>}
    </div>
  );
}
