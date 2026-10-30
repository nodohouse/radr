/**
 * Client demo phase override - morph Control Center without inventing time travel.
 * Default follows the operating clock; DEMO can preview PRE / LIVE / POST.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServicePhase } from "@/lib/radr/servicePhase";
import { demoServicePhaseAt } from "@/lib/radr/servicePhase";
import { DEMO_AS_OF_ISO, LIVE_SCENARIO } from "@/lib/radr/demoClock";

const KEY = "radr.demo.servicePhase";
const EVT = "radr-demo-phase";

/** Dinner-day clocks (18 Sep) — Live lens. Morning OS still uses DEMO_AS_OF. */
const PHASE_CLOCK: Record<ServicePhase, string> = {
  PRE_SHIFT: "2026-09-18T15:38:00+02:00", // 1h22m to open 17:00
  LIVE: LIVE_SCENARIO.timestampIso,
  CLOSING: "2026-09-18T22:15:00+02:00",
  POST_SHIFT: "2026-09-18T23:15:00+02:00",
};

function readStored(): ServicePhase | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (
      raw === "PRE_SHIFT" ||
      raw === "LIVE" ||
      raw === "CLOSING" ||
      raw === "POST_SHIFT"
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStored(phase: ServicePhase) {
  try {
    sessionStorage.setItem(KEY, phase);
  } catch {
    /* ignore */
  }
}

export function useDemoServicePhase(enabled: boolean) {
  const clockPhase = demoServicePhaseAt().phase;
  const [override, setOverride] = useState<ServicePhase | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setOverride(null);
      setReady(true);
      return;
    }
    const stored = readStored();
    if (stored) setOverride(stored);
    else {
      setOverride("LIVE");
      writeStored("LIVE");
    }
    setReady(true);

    function onPhase(e: Event) {
      const detail = (e as CustomEvent<ServicePhase>).detail;
      if (
        detail === "PRE_SHIFT" ||
        detail === "LIVE" ||
        detail === "CLOSING" ||
        detail === "POST_SHIFT"
      ) {
        setOverride(detail);
      }
    }
    window.addEventListener(EVT, onPhase);
    return () => window.removeEventListener(EVT, onPhase);
  }, [enabled]);

  const phase: ServicePhase = enabled
    ? (override ?? clockPhase)
    : clockPhase;

  const asOfIso = enabled ? PHASE_CLOCK[phase] : DEMO_AS_OF_ISO;
  const ctx = demoServicePhaseAt(asOfIso);

  const setPhase = useCallback(
    (next: ServicePhase) => {
      if (!enabled) return;
      setOverride(next);
      writeStored(next);
      window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
    },
    [enabled],
  );

  return {
    ready,
    phase,
    asOfIso,
    ctx,
    setPhase,
    isOverridden: enabled && override != null,
  };
}
