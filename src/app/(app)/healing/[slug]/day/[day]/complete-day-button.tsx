"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function CompleteDayButton({
  programId,
  slug,
  dayNumber,
  totalDays,
}: {
  programId: string;
  slug: string;
  dayNumber: number;
  totalDays: number;
}) {
  const t = useTranslations("healing");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const isLast = dayNumber >= totalDays;
    const { error } = await supabase
      .from("user_healing_progress")
      .update({
        current_day: isLast ? dayNumber : dayNumber + 1,
        last_completed_day: dayNumber,
        last_completed_at: new Date().toISOString(),
        status: isLast ? "completed" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("program_id", programId);

    if (error) {
      setError(error.message);
      return;
    }

    startTransition(() => {
      if (isLast) router.push(`/healing/${slug}`);
      else router.push(`/healing/${slug}/day/${dayNumber + 1}`);
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleComplete}
        disabled={pending}
        className="w-full rounded-full bg-primary text-on-primary py-4 font-semibold disabled:opacity-60"
      >
        {pending ? t("saving") : dayNumber >= totalDays ? t("completeProgram") : t("completeDay")}
      </button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
    </div>
  );
}
