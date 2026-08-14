"use client";

import { useEffect, useState } from "react";
import { RADR_MISSION } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";

type Props = {
  text?: string;
  className?: string;
  delay?: number;
  speed?: number;
  holdMs?: number;
};

/**
 * Bulletproof typewriter: full sentence always in DOM.
 * Visual types after mount; never SSR-empty.
 */
export function MissionTypewriter({
  text = RADR_MISSION,
  className = "",
  delay = 700,
  speed = 26,
  holdMs = 3500,
}: Props) {
  const reduced = useReducedMotionSafe();
  const [chars, setChars] = useState(text.length);
  const [phase, setPhase] = useState<"type" | "hold" | "fade">("hold");

  useEffect(() => {
    if (reduced) {
      setChars(text.length);
      setPhase("hold");
      return;
    }

    let cancelled = false;
    let timer = 0;
    let i = text.length;

    const pauseAt = new Set([
      text.indexOf("24/7") + 4,
      text.indexOf("money") + 5,
      text.indexOf("losing,") + 7,
      text.indexOf("missing") + 7,
    ]);

    const schedule = (fn: () => void, ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const startType = () => {
      i = 0;
      setChars(0);
      setPhase("type");
      step();
    };

    const step = () => {
      i += 1;
      setChars(i);
      if (i >= text.length) {
        setPhase("hold");
        schedule(() => {
          setPhase("fade");
          schedule(startType, 900);
        }, holdMs);
        return;
      }
      schedule(step, speed + (pauseAt.has(i) ? 140 : 0));
    };

    schedule(startType, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [delay, holdMs, reduced, speed, text]);

  const visible =
    phase === "fade" ? text : text.slice(0, Math.max(chars, 0));

  return (
    <div className={`rx-type ${className}`.trim()} data-phase={phase}>
      <p className="sr-only">{text}</p>
      <p className="rx-type-status" aria-hidden="true">
        <span className="rx-live-dot" />
        RADR / LIVE
      </p>
      <p className="rx-type-line" aria-hidden="true">
        <span className="rx-type-text">{visible}</span>
        {phase !== "fade" && !reduced ? (
          <span className="rx-type-cursor" data-hold={phase === "hold"}>
            █
          </span>
        ) : null}
      </p>
    </div>
  );
}
