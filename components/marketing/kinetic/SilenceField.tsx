"use client";

/**
 * SilenceField — Control Center signature.
 * Thousands of structured signal traces compress to material Decisions.
 * Not decorative particles.
 */

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const ROWS = Array.from({ length: 48 }, (_, i) => {
  const kinds = [
    "POS tip delta",
    "Labor clock drift",
    "Channel mix tick",
    "Occupancy pulse",
    "Invoice line match",
    "Menu mix shift",
    "Housekeeping ready",
    "Pickup ahead",
  ] as const;
  return {
    id: i,
    label: kinds[i % kinds.length]!,
    muted: i % 7 !== 0 && i % 11 !== 0,
  };
});

export function SilenceField({
  signalsLabel = "10,482 signals observed · most suppressed",
  needsYou = 2,
}: {
  signalsLabel?: string;
  needsYou?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"field" | "silence">(
    reduced ? "silence" : "field",
  );

  useEffect(() => {
    if (reduced) {
      setPhase("silence");
      return;
    }
    setPhase("field");
    const t = window.setTimeout(() => setPhase("silence"), 1600);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <div className="rx-silence" data-phase={phase}>
      <div className="rx-silence-rows" aria-hidden="true">
        {ROWS.map((r) => (
          <span
            key={r.id}
            data-muted={r.muted ? "true" : undefined}
            data-keep={!r.muted && (r.id === 0 || r.id === 22) ? "true" : undefined}
          >
            {r.label}
          </span>
        ))}
      </div>
      <div className="rx-silence-final">
        <p className="rx-silence-suppressed" data-on={phase === "field" ? "true" : undefined}>
          {signalsLabel}
        </p>
        <p className="rx-silence-need" data-on={phase === "silence" ? "true" : undefined}>
          <strong>{needsYou}</strong>
          <span>
            {needsYou === 1 ? "thing needs you" : "things need you"} · everything
            else within expectations
          </span>
        </p>
      </div>
    </div>
  );
}
