"use client";

import type { ServicePhase } from "@/lib/radr/servicePhase";

const BEATS: {
  id: "PRE_SHIFT" | "LIVE" | "POST_SHIFT";
  label: string;
  phase: ServicePhase;
}[] = [
  { id: "PRE_SHIFT", label: "Pre", phase: "PRE_SHIFT" },
  { id: "LIVE", label: "Live", phase: "LIVE" },
  { id: "POST_SHIFT", label: "Post", phase: "POST_SHIFT" },
];

function beatFor(phase: ServicePhase): "PRE_SHIFT" | "LIVE" | "POST_SHIFT" {
  if (phase === "PRE_SHIFT") return "PRE_SHIFT";
  if (phase === "POST_SHIFT") return "POST_SHIFT";
  return "LIVE";
}

/** Demo-only PRE / LIVE / POST control. Never show in LIVE customer env. */
export function LiveShiftPhaseBar({
  phase,
  onChange,
}: {
  phase: ServicePhase;
  onChange: (phase: ServicePhase) => void;
}) {
  const active = beatFor(phase);

  return (
    <div
      className="rp-live-phase-bar"
      role="tablist"
      aria-label="Demo shift phase"
      data-demo="true"
    >
      <span className="rp-live-phase-bar-k">Demo clock</span>
      {BEATS.map((b) => (
        <button
          key={b.id}
          type="button"
          role="tab"
          aria-selected={b.id === active}
          data-active={b.id === active ? "true" : undefined}
          onClick={() => onChange(b.phase)}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
