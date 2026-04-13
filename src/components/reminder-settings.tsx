"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "./material-icon";

type Frequency = "daily" | "weekdays" | "weekly" | "custom";

const DAYS = [
  { key: "mon", label: "Mo" },
  { key: "tue", label: "Di" },
  { key: "wed", label: "Mi" },
  { key: "thu", label: "Do" },
  { key: "fri", label: "Fr" },
  { key: "sat", label: "Sa" },
  { key: "sun", label: "So" },
] as const;

const FREQUENCY_PRESETS: Record<Frequency, string[]> = {
  daily: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  weekdays: ["mon", "tue", "wed", "thu", "fri"],
  weekly: ["sun"],
  custom: [],
};

export function ReminderSettings() {
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [days, setDays] = useState<string[]>(["mon","tue","wed","thu","fri","sat","sun"]);
  const [time, setTime] = useState("18:00");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("reminder_enabled, reminder_frequency, reminder_days, reminder_time")
        .eq("id", user.id)
        .single();
      if (data) {
        setEnabled(data.reminder_enabled ?? false);
        setFrequency((data.reminder_frequency ?? "daily") as Frequency);
        setDays(data.reminder_days ?? ["mon","tue","wed","thu","fri","sat","sun"]);
        setTime(data.reminder_time ?? "18:00");
      }
    }
    load();
  }, []);

  function handleFrequencyChange(f: Frequency) {
    setFrequency(f);
    if (f !== "custom") setDays(FREQUENCY_PRESETS[f]);
  }

  function toggleDay(day: string) {
    setFrequency("custom");
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  async function requestPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Dieser Browser unterstützt keine Benachrichtigungen.");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm !== "granted") return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();

      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublic) {
        console.warn("VAPID public key not set — push notifications disabled");
        return;
      }

      const subscription = existingSub ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublic).buffer as ArrayBuffer,
      });

      // Save subscription to DB
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ push_subscription: subscription.toJSON() })
          .eq("id", user.id);
      }

      new Notification("Ora Mundi", {
        body: "Benachrichtigungen sind aktiviert.",
        icon: "/icons/icon-192.png",
      });
    } catch (err) {
      console.error("Push subscription failed:", err);
    }
  }

  function urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function ensurePushSubscription(): Promise<PushSubscriptionJSON | null> {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    if (Notification.permission !== "granted") return null;
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublic) return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic).buffer as ArrayBuffer,
        });
      }
      return sub.toJSON() as PushSubscriptionJSON;
    } catch (err) {
      console.error("ensurePushSubscription failed:", err);
      return null;
    }
  }

  async function save() {
    setSaving(true);
    setSavedMsg(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ensure push subscription exists if reminders are enabled
      const subscription = enabled ? await ensurePushSubscription() : null;

      const updateData: Record<string, unknown> = {
        reminder_enabled: enabled,
        reminder_frequency: frequency,
        reminder_days: days,
        reminder_time: time,
      };
      if (subscription) {
        updateData.push_subscription = subscription;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
      if (error) {
        alert(`Fehler: ${error.message}`);
        return;
      }
      if (enabled && !subscription) {
        alert("Erinnerung gespeichert, aber Browser-Push konnte nicht aktiviert werden. Erlaube Benachrichtigungen in den Browser-Einstellungen.");
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  type PushSubscriptionJSON = {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  return (
    <div className="glass-card rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MaterialIcon name="notifications" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-headline italic text-lg text-on-surface">
              Gebetserinnerung
            </h3>
            <p className="text-xs text-on-surface-variant">
              Lass dich an deine Gebetszeit erinnern
            </p>
          </div>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-surface-container-highest"
          }`}
          aria-label="Erinnerungen aktivieren"
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-surface-container-lowest rounded-full shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <>
          {/* Frequency */}
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
              Häufigkeit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "daily", label: "Täglich" },
                { key: "weekdays", label: "Werktags" },
                { key: "weekly", label: "Sonntags" },
                { key: "custom", label: "Eigene Auswahl" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleFrequencyChange(opt.key as Frequency)}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-colors ${
                    frequency === opt.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
              Tage
            </label>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={`flex-1 h-10 rounded-full text-xs font-semibold transition-colors ${
                    days.includes(d.key)
                      ? "bg-primary/20 text-primary"
                      : "bg-surface-container-high text-on-surface-variant/50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-on-surface-variant mb-2 block">
              Uhrzeit
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-on-surface focus:border-primary/30 focus:ring-0 transition-all"
            />
          </div>

          {/* Notification permission */}
          {notifPermission !== "granted" && (
            <button
              onClick={requestPermission}
              className="w-full mb-3 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container text-sm font-medium flex items-center justify-center gap-2"
            >
              <MaterialIcon name="notifications_active" size={18} />
              Browser-Benachrichtigungen erlauben
            </button>
          )}
          {notifPermission === "granted" && (
            <p className="text-xs text-primary mb-3 flex items-center gap-2">
              <MaterialIcon name="check_circle" filled size={14} />
              Browser-Benachrichtigungen aktiv
            </p>
          )}
        </>
      )}

      {enabled && userId && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={async () => {
              const url = `${window.location.origin}/api/calendar/${userId}`;
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch { /* fallback */ }
            }}
            className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all active:scale-[0.98] ${
              copied
                ? "bg-primary text-on-primary"
                : "bg-gradient-to-br from-tertiary-fixed to-tertiary-fixed-dim text-on-tertiary-container hover:brightness-105"
            }`}
          >
            <MaterialIcon name="calendar_month" size={28} className="mb-2" />
            <div className="text-sm font-semibold leading-tight">
              {copied ? "Kopiert" : "Kalender abonnieren"}
            </div>
            <div className="text-[11px] opacity-70 mt-0.5">
              {copied ? "URL in Zwischenablage" : "Apple, Google, Outlook"}
            </div>
          </button>

          <a
            href={`/api/calendar/${userId}`}
            download="ora-mundi.ics"
            className="relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-br from-secondary-container to-secondary-fixed-dim text-on-secondary-container hover:brightness-105 transition-all active:scale-[0.98] block"
          >
            <MaterialIcon name="download" size={28} className="mb-2" />
            <div className="text-sm font-semibold leading-tight">
              .ics herunterladen
            </div>
            <div className="text-[11px] opacity-70 mt-0.5">
              Einmalig importieren
            </div>
          </a>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-3 rounded-full font-medium tracking-wide uppercase text-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
          savedMsg
            ? "bg-primary text-on-primary"
            : "bg-gradient-to-r from-primary to-primary-container text-on-primary"
        }`}
      >
        {saving ? "..." : savedMsg ? "✓ Gespeichert" : "Einstellungen speichern"}
      </button>

      {enabled && (
        <p className="text-[10px] text-on-surface-variant/60 text-center mt-3">
          Hinweis: Echte Push-Benachrichtigungen folgen. Derzeit zeigen wir eine Erinnerung, wenn du die App öffnest.
        </p>
      )}
    </div>
  );
}
