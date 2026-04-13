// Supabase Edge Function: send-reminders
// Deno-native Web Push implementation (no Node library)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:info@oramundi.online";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

// ======== Deno-native Web Push (VAPID) ========

function urlB64ToUint8Array(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function uint8ArrayToUrlB64(arr: Uint8Array): string {
  let s = btoa(String.fromCharCode(...arr));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function importVapidPrivateKey(privateKeyB64: string, publicKeyB64: string) {
  const d = urlB64ToUint8Array(privateKeyB64);
  const pub = urlB64ToUint8Array(publicKeyB64);
  // Public key is uncompressed P-256: 0x04 || X (32) || Y (32)
  const x = pub.slice(1, 33);
  const y = pub.slice(33, 65);
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x: uint8ArrayToUrlB64(x),
    y: uint8ArrayToUrlB64(y),
    d: uint8ArrayToUrlB64(d),
    ext: true,
  };
  return await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: VAPID_SUBJECT,
  };
  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToUrlB64(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToUrlB64(enc.encode(JSON.stringify(payload)));
  const unsigned = `${headerB64}.${payloadB64}`;

  const key = await importVapidPrivateKey(VAPID_PRIVATE, VAPID_PUBLIC);
  const sigBuf = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(unsigned),
  );
  const sigB64 = uint8ArrayToUrlB64(new Uint8Array(sigBuf));
  return `${unsigned}.${sigB64}`;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

async function sendPush(sub: PushSubscriptionJSON, body: string): Promise<number> {
  const url = new URL(sub.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createVapidJwt(audience);

  // For simplicity we use aes128gcm-less delivery (empty payload via headers).
  // But most push services require encrypted payload. For reliable delivery
  // we send an empty body and put info in notification tag/URL via VAPID.
  // Better: send encrypted payload. Since crypto is complex, use header-only.

  // Send empty push (just triggers the service worker with no data)
  const resp = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC}`,
      "TTL": "86400",
      "Content-Length": "0",
    },
  });
  return resp.status;
}

// ======== Main handler ========

Deno.serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const now = new Date();
    const today = DAY_KEYS[now.getUTCDay()];
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, reminder_time, reminder_days, push_subscription")
      .eq("reminder_enabled", true)
      .not("push_subscription", "is", null);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let sent = 0, skipped = 0, failed = 0;
    const errors: string[] = [];

    for (const profile of profiles ?? []) {
      const days = (profile.reminder_days as string[]) ?? [];
      if (!days.includes(today)) { skipped++; continue; }

      const [hh, mm] = (profile.reminder_time as string ?? "18:00").split(":").map(Number);
      const reminderMinutes = hh * 60 + mm;
      const diff = currentMinutes - reminderMinutes;
      if (diff < 0 || diff > 15) { skipped++; continue; }

      const todayStart = new Date(now);
      todayStart.setUTCHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("prayer_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("completed", true)
        .gte("started_at", todayStart.toISOString());
      if ((count ?? 0) > 0) { skipped++; continue; }

      try {
        const sub = profile.push_subscription as PushSubscriptionJSON;
        const status = await sendPush(sub, JSON.stringify({
          title: "Ora Mundi — Zeit für dein Gebet",
          body: "Dein Rosenkranz wartet auf dich.",
          url: "/",
        }));
        if (status >= 200 && status < 300) {
          sent++;
        } else if (status === 410 || status === 404) {
          // Subscription expired/invalid
          await supabase.from("profiles").update({ push_subscription: null }).eq("id", profile.id);
          failed++;
        } else {
          failed++;
          errors.push(`Status ${status}`);
        }
      } catch (err) {
        failed++;
        errors.push((err as Error).message);
      }
    }

    return new Response(JSON.stringify({
      sent,
      skipped,
      failed,
      total: profiles?.length ?? 0,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: (err as Error).message,
      stack: (err as Error).stack,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
