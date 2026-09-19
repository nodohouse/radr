"use client";

/**
 * Pricing responsibility track — Recover → Decide → Govern.
 * No demo money ticker — commercial seriousness.
 */

import { useState } from "react";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import "@/app/kinetic.css";

const STAGES = [
  {
    id: "recover",
    label: "Recover",
    name: "Recovery Pilot",
    body: "One recovery scope. Supplier/AP, Reconciliation, or both. Cases, evidence, verification. File-first — secure exports before a large API project.",
    status: "early_access" as const,
  },
  {
    id: "decide",
    label: "Decide",
    name: "RADR Core",
    body: "More systems. Recurring Decisions. Futures. Memory. Verified Value across the operation.",
    status: "demo" as const,
  },
  {
    id: "govern",
    label: "Govern",
    name: "RADR Control",
    body: "Multi-location. Policy. Approval. Autopilot within policy (planned). Portfolio Verified Value.",
    status: "planned" as const,
  },
] as const;

const SCOPE_LABELS = ["1 location", "3 locations", "10 locations", "Group"] as const;

export function PricingResponsibilityTrack() {
  const [stage, setStage] = useState(0);
  const [scope, setScope] = useState(1);
  const active = STAGES[stage]!;

  return (
    <div className="px-resp-track">
      <div className="rx-shell">
        <p className="rx-rec-k">Commercial structure</p>
        <h2 className="rx-rec-h" style={{ maxWidth: "28rem" }}>
          Recover → Decide → Govern
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "40rem" }}>
          Pricing scales with the operating scope RADR takes on — locations,
          systems, and Decision coverage. Built for multi-location hospitality /
          F&amp;B groups with Finance, COO, or Procurement as sponsor.
        </p>

        <div
          className="px-resp-stages"
          role="tablist"
          aria-label="Responsibility"
          style={{ marginTop: "1.75rem" }}
        >
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
              <em>
                {s.label} · {capabilityBadge(s.id === "recover" ? "recoveryPilot" : s.id === "decide" ? "decisions" : "autopilot")}
              </em>
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
            Autopilot within policy: {capabilityBadge("autopilot")} — not
            production autonomous execution.
          </p>
          <p className="rx-rec-p" style={{ marginTop: "0.5rem" }}>
            Now: <strong>{active.name}</strong> · {SCOPE_LABELS[scope]}
          </p>
        </div>
      </div>
    </div>
  );
}
