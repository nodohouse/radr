"use client";

import { PUBLIC_PULSE_ROWS } from "@/lib/marketing/publicCanon";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

export function HomeDemoStrip() {
  const reduced = usePrefersReducedMotion();
  const rows = [...PUBLIC_PULSE_ROWS, ...PUBLIC_PULSE_ROWS];

  return (
    <div
      className="rx30-strip"
      data-reduced={reduced ? "true" : undefined}
      aria-label="Demo operating signals"
    >
      <div className="rx30-strip-inner">
        {(reduced ? PUBLIC_PULSE_ROWS.slice(0, 3) : rows).map((r, i) => (
          <span key={`${r.id}-${i}`}>
            <em>Demo</em>
            {r.text}
          </span>
        ))}
      </div>
    </div>
  );
}
