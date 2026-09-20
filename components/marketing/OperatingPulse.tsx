"use client";

/**
 * RADR Operating Pulse — the only persistent moving data surface.
 * Green field. Dark type. Slow. Canonical fixtures.
 * Contrast: pulse = the operation is alive · Control Center = silence.
 */

import { useId } from "react";
import { OPERATING_PULSE_ITEMS } from "@/lib/marketing/operatingPulse";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

export function OperatingPulse() {
  const reduced = usePrefersReducedMotion();
  const uid = useId();
  const items = OPERATING_PULSE_ITEMS;

  if (reduced) {
    return (
      <div className="rx-opulse" role="note" data-reduced="true">
        <p className="rx-opulse-static">
          {items.map((item, i) => (
            <span key={item.id}>
              {i > 0 ? (
                <span className="rx-opulse-sep" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {item.text}
            </span>
          ))}
        </p>
      </div>
    );
  }

  const loop = [...items, ...items];

  return (
    <div className="rx-opulse" role="note" aria-label="RADR operating pulse">
      <div className="rx-opulse-track">
        {loop.map((item, i) => {
          const isClone = i >= items.length;
          return (
            <span
              key={`${uid}-${item.id}-${i}`}
              className="rx-opulse-item"
              aria-hidden={isClone ? true : undefined}
            >
              {item.text}
              <span className="rx-opulse-sep" aria-hidden="true">
                ·
              </span>
            </span>
          );
        })}
      </div>
      {/* Semantic single source for AT */}
      <p className="sr-only">
        {items.map((item) => item.text).join(". ")}
      </p>
    </div>
  );
}
