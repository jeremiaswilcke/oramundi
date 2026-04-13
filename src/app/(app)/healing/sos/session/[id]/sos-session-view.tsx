"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/material-icon";

const JESUS_PRAYER_REPETITIONS = 33;

export function SosSessionView({
  sessionId,
  prayerType,
  partnerHandle,
  selfIsRequester,
}: {
  sessionId: string;
  prayerType: string;
  partnerHandle: string | null;
  selfIsRequester: boolean;
}) {
  const t = useTranslations("healing.sos");
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [partnerCount, setPartnerCount] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!partnerHandle) return;
    const supabase = createClient();
    supabaseRef.current = supabase;
    const channel = supabase.channel(`sos:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on("broadcast", { event: "progress" }, ({ payload }) => {
      if (typeof payload?.count === "number") setPartnerCount(payload.count);
    });

    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, partnerHandle]);

  function advance() {
    const next = Math.min(count + 1, JESUS_PRAYER_REPETITIONS);
    setCount(next);
    if (partnerHandle && supabaseRef.current) {
      const channel = supabaseRef.current.channel(`sos:${sessionId}`);
      channel.send({ type: "broadcast", event: "progress", payload: { count: next } });
    }
  }

  async function endSession() {
    setEnding(true);
    const supabase = createClient();
    await supabase
      .from("sos_sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", sessionId);
    router.push("/healing");
  }

  const done = count >= JESUS_PRAYER_REPETITIONS;

  return (
    <div className="min-h-[calc(100vh-7.5rem)] px-6 pt-6 pb-8 flex flex-col">
      {partnerHandle ? (
        <div className="rounded-3xl glass-card p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <MaterialIcon name="person" size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              {t("prayingWith")}
            </p>
            <p className="font-headline italic text-lg text-on-surface truncate">
              {partnerHandle}
            </p>
          </div>
          {partnerCount !== null && (
            <span className="text-xs text-on-surface-variant">
              {partnerCount}/{JESUS_PRAYER_REPETITIONS}
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant mb-6">{t("prayingAlone")}</p>
      )}

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">
          {t("jesusPrayer")}
        </p>
        <p className="font-headline italic text-2xl text-on-surface leading-relaxed max-w-sm mb-8">
          {t("jesusPrayerText")}
        </p>

        <button
          onClick={advance}
          disabled={done}
          className="w-40 h-40 rounded-full bg-primary text-on-primary text-4xl font-headline italic active:scale-95 transition-transform disabled:opacity-60"
        >
          {count}/{JESUS_PRAYER_REPETITIONS}
        </button>

        <p className="text-xs text-on-surface-variant mt-6">
          {done ? t("complete") : t("tapToPray")}
        </p>
      </div>

      <button
        onClick={endSession}
        disabled={ending}
        className="mt-8 w-full rounded-full border border-outline-variant py-4 text-sm text-on-surface-variant disabled:opacity-60"
      >
        {done ? t("endWithThanks") : t("endEarly")}
      </button>
    </div>
  );
}
