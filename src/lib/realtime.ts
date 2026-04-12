"use client";

import { useEffect, useState, useRef } from "react";
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

export function usePrayerPresence() {
  const [prayers, setPrayers] = useState<PrayerPresence[]>([]);
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel("prayer-presence", {
      config: { presence: { key: "prayers" } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PrayerPresence>();
      const allPrayers = Object.values(state).flat();
      setPrayers(allPrayers);
      setCount(allPrayers.length);
    });

    channelRef.current = channel;

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function startPraying(presence: Omit<PrayerPresence, "userId">) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !channelRef.current) return;

    await channelRef.current.track({
      userId: user.id,
      latitude: roundCoord(presence.latitude),
      longitude: roundCoord(presence.longitude),
      mysteryType: presence.mysteryType,
      mode: presence.mode,
      startedAt: presence.startedAt,
    });
  }

  async function stopPraying() {
    if (channelRef.current) {
      await channelRef.current.untrack();
    }
  }

  return { prayers, count, startPraying, stopPraying };
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
