"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function StartProgramButton({
  programId,
  slug,
}: {
  programId: string;
  slug: string;
}) {
  const t = useTranslations("healing");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const { error } = await supabase.from("user_healing_progress").insert({
      user_id: user.id,
      program_id: programId,
      current_day: 1,
      status: "active",
    });

    if (error) {
      setError(error.message);
      return;
    }

    startTransition(() => {
      router.push(`/healing/${slug}/day/1`);
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleStart}
        disabled={pending}
        className="w-full rounded-full bg-primary text-on-primary py-4 font-semibold disabled:opacity-60"
      >
        {pending ? t("starting") : t("startProgram")}
      </button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
    </div>
  );
}
