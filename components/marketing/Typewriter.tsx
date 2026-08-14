"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion";

export const RADR_MISSION =
  "RADR watches your operation 24/7 and finds the money you're losing, missing or leaving behind.";

type Props = {
  text?: string;
  delay?: number;
  speed?: number;
  className?: string;
  loop?: boolean;
  holdMs?: number;
};

/**
 * Full sentence always in sr-only (SEO + a11y).
 * Visible line SSR-renders the complete sentence, then animates via mask/retype.
 * Never hydrates as an empty cursor-only line.
 */
export function Typewriter({
  text = RADR_MISSION,
  delay = 600,
  speed = 26,
  className = "",
  loop = true,
  holdMs = 3500,
}: Props) {
  const reduced = usePrefersReducedMotion();
  // SSR + first paint: full sentence visible
  const [chars, setChars] = useState(text.length);
  const [phase, setPhase] = useState<"type" | "hold" | "fade" | "gap">("hold");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    setArmed(true);
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
        if (!loop) return;
        schedule(() => {
          setPhase("fade");
          schedule(() => {
            setPhase("gap");
            schedule(startType, 700);
          }, 480);
        }, holdMs);
        return;
      }
      const pause = pauseAt.has(i) ? 140 : 0;
      schedule(step, speed + pause);
    };

    // Hold the SSR full sentence briefly, then begin the live loop
    schedule(startType, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [delay, holdMs, loop, reduced, speed, text]);

  const visible = phase === "fade" || phase === "gap" ? text : text.slice(0, chars);
  const showCursor =
    armed && !reduced && phase !== "fade" && phase !== "gap";

  return (
    <div className={`rx-type ${className}`.trim()} data-phase={phase}>
      <p className="sr-only">{text}</p>
      <p className="rx-type-status" aria-hidden="true">
        <span className="rx-live-dot" />
        RADR / ONLINE
      </p>
      <p className="rx-type-line" aria-hidden="true">
        <span className="rx-type-text">{visible}</span>
        {showCursor ? (
          <span className="rx-type-cursor" data-hold={phase === "hold"}>
            █
          </span>
        ) : null}
      </p>
    </div>
  );
}
