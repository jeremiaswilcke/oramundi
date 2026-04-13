import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SosSessionView } from "./sos-session-view";

export default async function SosSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("healing.sos");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: session } = await supabase
    .from("sos_sessions")
    .select("id, requester_id, partner_id, prayer_type, status, matched_at")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();

  let partnerHandle: string | null = null;
  const partnerId = session.partner_id && session.partner_id !== user.id
    ? session.partner_id
    : session.requester_id !== user.id
    ? session.requester_id
    : null;

  if (partnerId) {
    const { data: pool } = await supabase
      .from("sos_prayer_pool")
      .select("pseudonym")
      .eq("user_id", partnerId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", partnerId)
      .maybeSingle();

    partnerHandle = pool?.pseudonym?.trim() || profile?.display_name || t("anonymousBrother");
  }

  return (
    <SosSessionView
      sessionId={session.id}
      prayerType={session.prayer_type}
      partnerHandle={partnerHandle}
      selfIsRequester={session.requester_id === user.id}
    />
  );
}
