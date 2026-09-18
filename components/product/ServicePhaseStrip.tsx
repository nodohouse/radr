"use client";

import type { ServicePhase } from "@/lib/radr/servicePhase";

/** Three operating beats - Closing maps into Live for the control. */
const BEATS: {
  id: "PRE_SHIFT" | "LIVE" | "POST_SHIFT";
  label: string;
  phase: ServicePhase;
}[] = [
  { id: "PRE_SHIFT", label: "Pre", phase: "PRE_SHIFT" },
  { id: "LIVE", label: "Live", phase: "LIVE" },
  { id: "POST_SHIFT", label: "After", phase: "POST_SHIFT" },
];

function beatForPhase(phase: ServicePhase): "PRE_SHIFT" | "LIVE" | "POST_SHIFT" {
  if (phase === "PRE_SHIFT") return "PRE_SHIFT";
  if (phase === "POST_SHIFT") return "POST_SHIFT";
  return "LIVE"; // LIVE + CLOSING
}

type Props = {
  phase: ServicePhase;
  onChange: (phase: ServicePhase) => void;
};

/**
 * Shift beat - Pre / Live / After. Always in the rail.
 */
export function ServicePhaseStrip({ phase, onChange }: Props) {
  const active = beatForPhase(phase);

  return (
    <div
      className="rp-phase-strip"
      data-phase={phase}
      data-beat={active}
      role="tablist"
      aria-label="Shift"
    >
      <p className="rp-rail-filter-kicker">Shift</p>
      <div className="rp-phase-strip-tracks">
        {BEATS.map((b) => {
          const on = b.id === active;
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={
                b.id === "PRE_SHIFT"
                  ? "Pre-shift"
                  : b.id === "LIVE"
                    ? "Live shift"
                    : "After shift"
              }
              data-active={on ? "true" : undefined}
              data-phase={b.phase}
              className="rp-phase-strip-btn"
              onClick={() => onChange(b.phase)}
            >
              <span className="rp-phase-strip-dot" aria-hidden="true" />
              <span className="rp-phase-strip-label">{b.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
