"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoSignal } from "../data/demo";
import {
  useDocumentVisible,
  useReducedMotionSafe,
} from "./useReducedMotionSafe";

type Options = {
  signals: readonly DemoSignal[];
  /** When true, start from €0 and climb. When false, show final until armed. */
  startFromZero?: boolean;
  intervalMs?: number;
  startDelayMs?: number;
  armed?: boolean;
  loop?: boolean;
};

/**
 * Deterministic live-signal sequencer from ONE dataset.
 * totals come from each signal.runningTotal
 */
export function useRadrSignal({
  signals,
  startFromZero = true,
  intervalMs = 2800,
  startDelayMs = 700,
  armed = true,
  loop = true,
}: Options) {
  const reduced = useReducedMotionSafe();
  const visible = useDocumentVisible();
  const final = signals[signals.length - 1]?.runningTotal ?? 0;
  const [index, setIndex] = useState(reduced ? signals.length - 1 : -1);
  const [total, setTotal] = useState(reduced ? final : startFromZero ? 0 : final);
  const step = useRef(0);

  useEffect(() => {
    if (!armed) return;

    if (reduced) {
      setIndex(signals.length - 1);
      setTotal(final);
      return;
    }

    if (!visible) return;

    let cancelled = false;
    let intervalId = 0;

    const fire = () => {
      if (cancelled) return;
      const i = step.current % signals.length;

      if (i === 0 && step.current > 0) {
        if (!loop) return;
        setIndex(-1);
        setTotal(0);
        step.current = 0;
        window.setTimeout(() => {
          if (cancelled) return;
          const first = signals[0]!;
          setIndex(0);
          setTotal(first.runningTotal);
          step.current = 1;
        }, 450);
        return;
      }

      const signal = signals[i]!;
      setIndex(i);
      setTotal(signal.runningTotal);
      step.current = i + 1;
    };

    // Start at €0 visibly, then first signal
    setIndex(-1);
    setTotal(0);
    step.current = 0;

    const startId = window.setTimeout(() => {
      fire();
      intervalId = window.setInterval(fire, intervalMs);
    }, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [armed, reduced, visible, intervalMs, startDelayMs, signals, final, loop]);

  const resolved =
    index < 0 ? [] : signals.slice(0, Math.min(index + 1, signals.length));

  return {
    index,
    displayTotal: total,
    resolved,
    reduced,
    progressLabel:
      index < 0
        ? `0 / ${signals.length} signals`
        : `${index + 1} / ${signals.length} signals`,
  };
}
