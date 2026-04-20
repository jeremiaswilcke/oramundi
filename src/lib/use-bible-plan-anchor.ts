"use client";

import { useCallback, useEffect, useState } from "react";

import type { BiblePlanAnchor } from "./bible-plan";

interface AnchorState {
  anchor: BiblePlanAnchor | null;
  authenticated: boolean;
  loaded: boolean;
}

const initial: AnchorState = {
  anchor: null,
  authenticated: false,
  loaded: false,
};

export function useBiblePlanAnchor() {
  const [state, setState] = useState<AnchorState>(initial);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/bible/plan-start", { cache: "no-store" });
        if (!res.ok) throw new Error("load failed");
        const data = (await res.json()) as {
          anchor: BiblePlanAnchor | null;
          authenticated: boolean;
        };
        if (!cancelled) {
          setState({
            anchor: data.anchor,
            authenticated: data.authenticated,
            loaded: true,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ anchor: null, authenticated: false, loaded: true });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAnchor = useCallback(async (planDay: number) => {
    const res = await fetch("/api/bible/plan-start", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planDay }),
    });
    if (!res.ok) {
      throw new Error("Speichern fehlgeschlagen");
    }
    const data = (await res.json()) as { anchor: BiblePlanAnchor };
    setState((prev) => ({ ...prev, anchor: data.anchor, authenticated: true }));
    return data.anchor;
  }, []);

  return {
    ...state,
    setAnchor,
  };
}
