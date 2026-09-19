"use client";

import { useEffect, useState } from "react";
import {
  demoShiftStateAtTick,
  demoStreamBeatCount,
  type ShiftEconomicState,
} from "@/lib/radr/live";

const TICK_MS = 3800;

/**
 * Advances the deterministic demo stream on a calm interval.
 * Does not use wall-clock for business day - only for playback cadence.
 */
export function useDemoLiveShift(active: boolean): {
  state: ShiftEconomicState | null;
  tick: number;
  paused: boolean;
  setPaused: (v: boolean) => void;
  pulse: boolean;
} {
  const [tick, setTick] = useState(8);
  const [paused, setPaused] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [state, setState] = useState<ShiftEconomicState | null>(() =>
    active ? demoShiftStateAtTick(8) : null,
  );

  useEffect(() => {
    if (!active) {
      setState(null);
      return;
    }
    setState(demoShiftStateAtTick(tick));
  }, [active, tick]);

  useEffect(() => {
    if (!active || paused) return;
    const max = demoStreamBeatCount();
    const id = window.setInterval(() => {
      setTick((t) => {
        const next = t >= max ? Math.max(6, max - 4) : t + 1;
        return next;
      });
      setPulse(true);
      window.setTimeout(() => setPulse(false), 420);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [active, paused]);

  return { state, tick, paused, setPaused, pulse };
}
