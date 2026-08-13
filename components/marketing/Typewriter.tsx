"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion";

export const RADR_MISSION =
  "RADR watches your operation 24/7 and finds the money you're losing, missing or leaving behind.";

type Props = {
  text?: string;
  delay?: number;
  speed?: number;
  className?: string;
  /** Soft looping typewriter (hero) */
  loop?: boolean;
  onFirstComplete?: () => void;
};

type Phase = "wait" | "type" | "hold" | "fade" | "gap";

export function Typewriter({
  text = RADR_MISSION,
  delay = 500,
  speed = 27,
  className = "",
  loop = true,
  onFirstComplete,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const onFirstRef = useRef(onFirstComplete);
  onFirstRef.current = onFirstComplete;
  const firstDone = useRef(false);

  const [shown, setShown] = useState(reduced ? text : "");
  const [phase, setPhase] = useState<Phase>(reduced ? "hold" : "wait");
  const [status, setStatus] = useState("ONLINE");

  useEffect(() => {
    if (reduced) {
      if (!firstDone.current) {
        firstDone.current = true;
        onFirstRef.current?.();
      }
      return;
    }

    let cancelled = false;
    let timer: number | undefined;
    let i = 0;

    const pauseAt = new Set([
      text.indexOf("24/7") + 4,
      text.indexOf("money") + 5,
      text.indexOf("losing,") + 7,
      text.indexOf("missing") + 7,
    ]);

    const clear = () => {
      if (timer) window.clearTimeout(timer);
    };

    const schedule = (fn: () => void, ms: number) => {
      clear();
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const startType = () => {
      i = 0;
      setShown("");
      setPhase("type");
      setStatus("ONLINE");
      step();
    };

    const step = () => {
      i += 1;
      const next = text.slice(0, i);
      setShown(next);

      if (i >= text.length) {
        setPhase("hold");
        setStatus("SCANNING");
        if (!firstDone.current) {
          firstDone.current = true;
          onFirstRef.current?.();
        }
        if (!loop) return;
        schedule(() => {
          setPhase("fade");
          schedule(() => {
            setShown("");
            setPhase("gap");
            schedule(startType, 800);
          }, 420);
        }, 3000);
        return;
      }

      const pause = pauseAt.has(i) ? 140 : 0;
      schedule(step, speed + pause);
    };

    schedule(startType, delay);

    return () => {
      cancelled = true;
      clear();
    };
  }, [delay, loop, reduced, speed, text]);

  return (
    <div
      className={`radr-type ${className}`.trim()}
      data-phase={phase}
    >
      <p className="radr-type-label">
        <span className="radr-type-dot" />
        RADR / {status}
      </p>
      <p className="radr-type-line" aria-live="polite">
        <span className="radr-type-text">{shown}</span>
        {phase !== "fade" && phase !== "gap" ? (
          <span
            className="radr-type-cursor"
            data-blink={phase === "hold" ? "true" : "false"}
            aria-hidden="true"
          >
            █
          </span>
        ) : null}
      </p>
    </div>
  );
}
