"use client";

/**
 * Living D-4102 recovery object — not a vertical timeline of cards.
 * Euro visibly returns to the source.
 */

import { useState } from "react";

const STAGES = [
  {
    id: "leak",
    label: "Leak",
    body: "Invoice €7.45/L · Contract €6.80/L · 420 L",
    euro: "€273 exposed",
  },
  {
    id: "evidence",
    label: "Evidence",
    body: "Contract clear · qty matched · UOM matched · prior history checked",
    euro: "€273 Expected",
  },
  {
    id: "decision",
    label: "Decision",
    body: "Dispute the variance. Do not reprice the menu yet.",
    euro: "€273 Expected",
  },
  {
    id: "action",
    label: "Action",
    body: "Evidence package prepared for Finance approval.",
    euro: "€273 Expected",
  },
  {
    id: "outcome",
    label: "Outcome",
    body: "Credit memo CM-44102 issued.",
    euro: "€273 Observed",
  },
  {
    id: "verified",
    label: "Verified",
    body: "Matched to original invoice INV-88421.",
    euro: "€273 recovered",
  },
] as const;

type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export function RecoveryStoryObject({ kicker, title, lead }: Props) {
  const [idx, setIdx] = useState(0);
  const stage = STAGES[idx]!;
  const sealed = stage.id === "verified";

  return (
    <div className="rx-rso">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>

      <div className="rx-rso-object" data-stage={stage.id} data-sealed={sealed ? "true" : undefined}>
        <div className="rx-rso-papers" aria-hidden="true">
          <div className="rx-rso-paper" data-kind="invoice">
            <em>INV-88421</em>
            <strong>€7.45/L</strong>
          </div>
          <div className="rx-rso-paper" data-kind="contract">
            <em>CTR-OIL-2026</em>
            <strong>€6.80/L</strong>
          </div>
          {idx >= 4 ? (
            <div className="rx-rso-paper" data-kind="credit">
              <em>CM-44102</em>
              <strong>€273</strong>
            </div>
          ) : null}
        </div>

        <div className="rx-rso-face">
          <p className="rx-rso-id">D-4102 · Supplier / AP</p>
          <p className="rx-rso-stage">{stage.label}</p>
          <p className="rx-rso-euro" data-sealed={sealed ? "true" : undefined}>
            {stage.euro}
          </p>
          <p className="rx-rso-body">{stage.body}</p>
          {sealed ? (
            <p className="rx-rso-lock">Verified · matched to source invoice</p>
          ) : null}
        </div>
      </div>

      <div className="rx-rso-steps" role="tablist" aria-label="Recovery stages">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === idx}
            data-on={i === idx ? "true" : undefined}
            data-done={i < idx ? "true" : undefined}
            onClick={() => setIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
