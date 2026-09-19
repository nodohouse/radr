"use client";

/**
 * Pricing responsibility track — Recover → Decide → Govern as one expanding system.
 */

import { useState } from "react";
import { EconomicRail } from "@/components/marketing/kinetic/EconomicRail";
import { PRICING_PROOF_RAIL } from "@/lib/marketing/economicRail";
import "@/app/kinetic.css";

const STAGES = [
  {
    id: "recover",
    label: "Recover",
    name: "Recovery Pilot",
    body: "One recovery scope. Supplier/AP, Reconciliation, or both. Cases, evidence, verification.",
  },
  {
    id: "decide",
    label: "Decide",
    name: "RADR Core",
    body: "More systems. Recurring Decisions. Futures. Memory. Verified Value across the operation.",
  },
  {
    id: "govern",
    label: "Govern",
    name: "RADR Control",
    body: "Multi-location. Policy. Approval. Autopilot within policy. Portfolio Verified Value.",
  },
] as const;

const SCOPE_LABELS = ["1 location", "3 locations", "10 locations", "Group"] as const;

export function PricingResponsibilityTrack() {
  const [stage, setStage] = useState(0);
  const [scope, setScope] = useState(1);
  const active = STAGES[stage]!;

  return (
    <div className="px-resp-track">
      <EconomicRail
        items={PRICING_PROOF_RAIL}
        durationSec={36}
        variant="proof"
        ariaLabel="Illustrative Verified outcomes"
      />

      <div className="rx-shell" style={{ marginTop: "1.75rem" }}>
        <div className="px-resp-stages" role="tablist" aria-label="Responsibility">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              className="px-resp-stage"
              aria-selected={stage === i}
              data-on={stage === i ? "true" : undefined}
              onClick={() => setStage(i)}
            >
              <em>{s.label}</em>
              <strong>{s.name}</strong>
              <p>{s.body}</p>
            </button>
          ))}
        </div>

        <div className="px-scope-slider">
          <label htmlFor="px-scope">
            <span>Operating surface</span>
            <span>{SCOPE_LABELS[scope]}</span>
          </label>
          <input
            id="px-scope"
            type="range"
            min={0}
            max={3}
            step={1}
            value={scope}
            onChange={(e) => setScope(Number(e.target.value))}
            aria-valuetext={SCOPE_LABELS[scope]}
          />
          <div className="px-scope-diagram" aria-hidden="true">
            {Array.from({
              length: scope === 0 ? 1 : scope === 1 ? 3 : scope === 2 ? 8 : 14,
            }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <p className="rx-pilot-note" style={{ marginTop: "0.75rem" }}>
            Pricing follows the operating scope RADR takes on — locations,
            systems, and Decision coverage.
          </p>
          <p className="rx-rec-p" style={{ marginTop: "0.5rem" }}>
            Now: <strong>{active.name}</strong> · {SCOPE_LABELS[scope]}
          </p>
        </div>
      </div>
    </div>
  );
}
