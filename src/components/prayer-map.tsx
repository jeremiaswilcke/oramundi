"use client";

import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import type { PrayerPresence } from "@/lib/realtime";

interface PrayerMapProps {
  prayers: PrayerPresence[];
  mapToken: string;
}

const DARK_STYLE: maptilersdk.StyleSpecification = {
  version: 8,
  name: "Ora Mundi Dark",
  sources: {
    countries: {
      type: "vector",
      url: "https://api.maptiler.com/tiles/countries/tiles.json",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0b1326" },
    },
    {
      id: "country-fills",
      type: "fill",
      source: "countries",
      "source-layer": "administrative",
      paint: {
        "fill-color": "#171f33",
        "fill-opacity": 0.6,
      },
    },
    {
      id: "country-borders",
      type: "line",
      source: "countries",
      "source-layer": "administrative",
      paint: {
        "line-color": "#222a3d",
        "line-width": 0.5,
        "line-opacity": 0.5,
      },
    },
  ],
};

export function PrayerMap({ prayers, mapToken }: PrayerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<Map<string, maptilersdk.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    maptilersdk.config.apiKey = mapToken;

    const map = new maptilersdk.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [10, 30],
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 8,
      attributionControl: false,
      geolocateControl: false,
      maptilerLogo: false,
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      setIsLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapToken]);

  // Update markers when prayers change
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const currentIds = new Set(prayers.map((p) => p.userId));

    // Remove markers for users no longer praying
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    prayers.forEach((prayer) => {
      if (markersRef.current.has(prayer.userId)) return;

      const el = document.createElement("div");
      el.className = "candle-pulse";
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#f59e0b";
      el.style.animationDelay = `${Math.random() * 3}s`;

      const marker = new maptilersdk.Marker({ element: el })
        .setLngLat([prayer.longitude, prayer.latitude])
        .addTo(mapRef.current!);

      markersRef.current.set(prayer.userId, marker);
    });
  }, [prayers, isLoaded]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {!isLoaded && (
        <div className="absolute inset-0 bg-surface flex items-center justify-center">
          <div className="candle-pulse w-4 h-4 rounded-full bg-primary-container" />
        </div>
      )}
    </div>
  );
}
