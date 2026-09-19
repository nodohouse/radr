"use client";

/**
 * SilenceField — structured system traces fade; material Decisions remain.
 */

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const SYSTEMS = ["POS", "Reservations", "Invoices", "Payments", "Labor", "Inventory"] as const;

/** One semantic set — visual clones are aria-hidden only */
const SEMANTIC = SYSTEMS.map((sys, i) => ({
  id: `sem-${i}`,
  label: `${sys} · signal`,
  keep: i === 0 || i === 3,
}));

const CLONES = Array.from({ length: 36 }, (_, i) => {
  const sys = SYSTEMS[i % SYSTEMS.length]!;
  const ticks = ["line match", "clock drift", "mix tick", "pulse", "delta", "ready"] as const;
  return {
    id: `clone-${i}`,
    label: `${sys} · ${ticks[i % ticks.length]}`,
    keep: false,
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
      <div className="rx-silence-rows" aria-hidden="true" role="presentation">
        {CLONES.map((r) => (
          <span
            key={r.id}
            data-muted={!r.keep ? "true" : undefined}
            data-keep={r.keep ? "true" : undefined}
          >
            {r.label}
          </span>
        ))}
      </div>
      <ul className="rx-silence-semantic visually-hidden">
        {SEMANTIC.map((r) => (
          <li key={r.id}>{r.label}</li>
        ))}
      </ul>
      <div className="rx-silence-final">
        <p
          className="rx-silence-suppressed"
          data-on={phase === "field" ? "true" : undefined}
        >
          {signalsLabel}
        </p>
        <p
          className="rx-silence-need"
          data-on={phase === "silence" ? "true" : undefined}
        >
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
