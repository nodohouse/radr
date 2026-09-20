"use client";

/**
 * ValueTrace — progressive forensic euro path.
 * EXPOSURE → EXPECTED → OBSERVED → ATTRIBUTED → VERIFIED
 */

import { useState } from "react";
import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";

export type TraceStage = {
  id: string;
  label: string;
  euro: string;
  detail: string;
};

const EUR = euro(ECON_D4102.verified);

const DEFAULT_STAGES: TraceStage[] = [
  {
    id: "exposure",
    label: "Exposure",
    euro: EUR,
    detail: "Invoice above contract · 420 L · variance detected.",
  },
  {
    id: "expected",
    label: "Expected",
    euro: EUR,
    detail: "Dispute prepared · credit expected if evidence holds.",
  },
  {
    id: "observed",
    label: "Observed",
    euro: EUR,
    detail: "Credit memo CM-44102 issued against INV-88421.",
  },
  {
    id: "attributed",
    label: "Attributed",
    euro: EUR,
    detail: `Matched to original Decision ${ECON_D4102.displayId} · supplier variance class.`,
  },
  {
    id: "verified",
    label: "Verified",
    euro: EUR,
    detail: "Closed in AP · claim only what you can prove.",
  },
];

export function ValueTrace({
  stages = DEFAULT_STAGES,
  disclosure = "DEMO · ILLUSTRATIVE",
}: {
  stages?: TraceStage[];
  disclosure?: string;
}) {
  const [idx, setIdx] = useState(stages.length - 1);
  const active = stages[idx]!;

  return (
    <div className="rx-value-trace">
      <p className="rx-rec-k">{disclosure}</p>
      <ol className="rx-value-trace-rail" aria-label="Value verification path">
        {stages.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              data-on={i === idx ? "true" : undefined}
              data-done={i < idx ? "true" : undefined}
              onClick={() => setIdx(i)}
            >
              <em>{s.label}</em>
              <strong>{s.euro}</strong>
            </button>
          </li>
        ))}
      </ol>
      <article className="rx-value-trace-panel" key={active.id}>
        <em>{active.label}</em>
        <strong>{active.euro}</strong>
        <p>{active.detail}</p>
      </article>
    </div>
  );
}
