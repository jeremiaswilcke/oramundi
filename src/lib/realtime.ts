"use client";

import { useEffect, useState, useRef, useSyncExternalStore, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PrayerPresence {
  userId: string;
  latitude: number;
  longitude: number;
  mysteryType: string;
  mode: string;
  startedAt: string;
}

// Round coordinates to ~10km for privacy
function roundCoord(coord: number): number {
  return Math.round(coord * 10) / 10;
}

// Singleton channel to avoid duplicate subscriptions
let sharedChannel: RealtimeChannel | null = null;
let subscriberCount = 0;
let currentPrayers: PrayerPresence[] = [];
let listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

function getOrCreateChannel() {
  if (sharedChannel) return sharedChannel;

  const supabase = createClient();
  const channel = supabase.channel("prayer-presence", {
    config: { presence: { key: "prayers" } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState<PrayerPresence>();
    currentPrayers = Object.values(state).flat();
    notifyListeners();
  });

  channel.subscribe();
  sharedChannel = channel;
  return channel;
}

function releaseChannel() {
  if (subscriberCount <= 0 && sharedChannel) {
    sharedChannel.unsubscribe();
    sharedChannel = null;
    currentPrayers = [];
  }
}

export function usePrayerPresence() {
  const subscribe = useCallback((onStoreChange: () => void) => {
    subscriberCount++;
    listeners.add(onStoreChange);
    getOrCreateChannel();

    return () => {
      subscriberCount--;
      listeners.delete(onStoreChange);
      releaseChannel();
    };
  }, []);

  const prayers = useSyncExternalStore(
    subscribe,
    () => currentPrayers,
    () => [] as PrayerPresence[]
  );

  async function startPraying(presence: Omit<PrayerPresence, "userId">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !sharedChannel) return;

    await sharedChannel.track({
      userId: user.id,
      latitude: roundCoord(presence.latitude),
      longitude: roundCoord(presence.longitude),
      mysteryType: presence.mysteryType,
      mode: presence.mode,
      startedAt: presence.startedAt,
    });
  }

  async function stopPraying() {
    if (sharedChannel) {
      await sharedChannel.untrack();
    }
  }

  return { prayers, count: prayers.length, startPraying, stopPraying };
}

export function useGeolocation() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: roundCoord(pos.coords.latitude),
          lng: roundCoord(pos.coords.longitude),
        });
      },
      () => {
        // Fallback: center of Europe
        setPosition({ lat: 48.2, lng: 11.8 });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  return position;
}
