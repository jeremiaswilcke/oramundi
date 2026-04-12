// Supabase Edge Function: send-reminders
// Runs on a schedule (via pg_cron) to send push notifications to users
// whose reminder time has been reached and who haven't prayed today.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "https://esm.sh/web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:info@oramundi.online";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date();
  const today = DAY_KEYS[now.getUTCDay()];
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  // Find users whose reminder time is within the last 15 minutes
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, reminder_time, reminder_days, push_subscription")
    .eq("reminder_enabled", true)
    .not("push_subscription", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of profiles ?? []) {
    // Check if today is a reminder day
    const days = (profile.reminder_days as string[]) ?? [];
    if (!days.includes(today)) { skipped++; continue; }

    // Check if reminder time has passed (within last 15 min window)
    const [hh, mm] = (profile.reminder_time as string ?? "18:00").split(":").map(Number);
    const reminderMinutes = hh * 60 + mm;
    const diff = currentMinutes - reminderMinutes;
    if (diff < 0 || diff > 15) { skipped++; continue; }

    // Check if user already prayed today
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("prayer_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("completed", true)
      .gte("started_at", todayStart.toISOString());
    if ((count ?? 0) > 0) { skipped++; continue; }

    // Send push
    try {
      const subscription = profile.push_subscription as webpush.PushSubscription;
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Ora Mundi — Zeit für dein Gebet",
          body: "Dein Rosenkranz wartet auf dich.",
          url: "/",
        })
      );
      sent++;
    } catch (err) {
      failed++;
      // If subscription is invalid (410 Gone), clear it
      if ((err as { statusCode?: number }).statusCode === 410) {
        await supabase.from("profiles").update({ push_subscription: null }).eq("id", profile.id);
      }
    }
  }

  return new Response(JSON.stringify({ sent, skipped, failed, total: profiles?.length ?? 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
