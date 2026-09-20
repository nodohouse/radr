"use client";

/**
 * Pricing responsibility — Start → Expand → Enterprise.
 * One brand. One product. RADR.
 */

import { useState } from "react";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import "@/app/kinetic.css";

const STAGES = [
  {
    id: "start",
    label: "Start",
    name: "Recovery Pilot",
    body: "Prove recoverable value. Supplier/AP, Reconciliation, or both. Evidence, cases, verification — file-first.",
    status: "early_access" as const,
  },
  {
    id: "expand",
    label: "Expand",
    name: "RADR",
    body: "More locations. More Decision classes. More connected evidence. Verified Value. Operating Memory.",
    status: "demo" as const,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    name: "RADR at group scale",
    body: "Policies. Approvals. Governance. Custom integrations. Security and enterprise controls.",
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
        <p className="rx-rec-k">One company · one product · RADR</p>
        <h2 className="rx-rec-h" style={{ maxWidth: "28rem" }}>
          Start → Expand → Enterprise
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "40rem" }}>
          How do I start? What does the pilot measure? How does pricing scale
          with locations and Decision coverage?
        </p>

        <div
          className="px-resp-stages"
          role="tablist"
          aria-label="Commercial path"
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
                {s.label} ·{" "}
                {capabilityBadge(
                  s.id === "start"
                    ? "recoveryPilot"
                    : s.id === "expand"
                      ? "decisions"
                      : "autopilot",
                )}
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
