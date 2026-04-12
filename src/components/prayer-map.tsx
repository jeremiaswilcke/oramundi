"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { PrayerPresence } from "@/lib/realtime";

// World-110m TopoJSON from public CDN (no API key, always available)
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface PrayerMapProps {
  prayers: PrayerPresence[];
  mapToken?: string;
}

export function PrayerMap({ prayers }: PrayerMapProps) {
  return (
    <div className="absolute inset-0 bg-surface-container-low overflow-hidden">
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 180 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e9e8e4"
                stroke="#c4c8bf"
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#e9e8e4" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {prayers.map((p, i) => {
          const delay = (i * 0.25) % 2.5;
          return (
            <Marker key={p.userId} coordinates={[p.longitude, p.latitude]}>
              <g>
                <circle r={6} fill="#785749" opacity={0.25}>
                  <animate
                    attributeName="r"
                    values="4;10;4"
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0;0.5"
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                </circle>
                <circle r={3} fill="#785749" />
                <circle r={1.5} fill="#fdd0bf" />
              </g>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
}
