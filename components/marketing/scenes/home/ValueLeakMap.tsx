"use client";

/**
 * Value Leak Map — one operation, multiple leak points.
 * Not five equal product cards.
 */

import { useState } from "react";
import {
  PROBLEM_FAMILIES,
  PROBLEM_FAMILY_DEFS,
  type ProblemFamily,
} from "@/lib/radr/problemFamilies";

const FLOW: { id: ProblemFamily; node: string }[] = [
  { id: "SUPPLIER_AP", node: "Supplier" },
  { id: "SUPPLIER_AP", node: "AP" },
  { id: "RECONCILIATION", node: "Settlement" },
  { id: "COST_VARIANCE", node: "Cost" },
  { id: "PROCUREMENT", node: "Procurement" },
  { id: "PERISHABLE_REVENUE", node: "Perishable" },
];

const PUNCH: Record<ProblemFamily, string> = {
  SUPPLIER_AP: "Credit issued. Never applied.",
  RECONCILIATION: "Settlement received. Still €293 short.",
  COST_VARIANCE: "Food cost rose. Supplier inflation wasn’t the main reason.",
  PROCUREMENT: "Three locations. Three prices.",
  PERISHABLE_REVENUE: "Room cancelled. 19 hours left to recover it.",
};

type Props = {
  kicker: string;
  title: string;
  lead: string;
  labels: Record<ProblemFamily, string>;
  leaks: Record<ProblemFamily, string>;
  does: Record<ProblemFamily, string>;
  verifies: Record<ProblemFamily, string>;
  whatLeaks: string;
  whatDoes: string;
  whatVerifies: string;
  maturityPilot: string;
  maturityExpansion: string;
  maturityPlanned: string;
};

export function ValueLeakMap({
  kicker,
  title,
  lead,
  labels,
  leaks,
  does,
  verifies,
  whatLeaks,
  whatDoes,
  whatVerifies,
  maturityPilot,
  maturityExpansion,
  maturityPlanned,
}: Props) {
  const [active, setActive] = useState<ProblemFamily>("SUPPLIER_AP");
  const def = PROBLEM_FAMILY_DEFS[active];
  const maturityLabel =
    def.maturity === "pilot"
      ? maturityPilot
      : def.maturity === "planned"
        ? maturityPlanned
        : maturityExpansion;

  return (
    <div className="rx-vlm">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>

      <div className="rx-vlm-flow" role="tablist" aria-label="Value leak map">
        {FLOW.map((step, i) => {
          const on = step.id === active;
          return (
            <button
              key={`${step.node}-${i}`}
              type="button"
              role="tab"
              aria-selected={on}
              className="rx-vlm-node"
              data-on={on ? "true" : undefined}
              data-family={step.id}
              onClick={() => setActive(step.id)}
            >
              <em>{step.node}</em>
              {on ? <span className="rx-vlm-leak" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="rx-vlm-classes" role="group" aria-label="Problem classes">
        {PROBLEM_FAMILIES.map((id) => (
          <button
            key={id}
            type="button"
            className="rx-vlm-class"
            data-on={active === id ? "true" : undefined}
            onClick={() => setActive(id)}
          >
            {labels[id]}
          </button>
        ))}
      </div>

      <article className="rx-vlm-detail" data-family={active}>
        <header>
          <h3>{labels[active]}</h3>
          <p data-maturity={def.maturity}>{maturityLabel}</p>
        </header>
        <p className="rx-vlm-punch">{PUNCH[active]}</p>
        <dl className="rx-pf-grid">
          <div>
            <dt>{whatLeaks}</dt>
            <dd>{leaks[active]}</dd>
          </div>
          <div>
            <dt>{whatDoes}</dt>
            <dd>{does[active]}</dd>
          </div>
          <div>
            <dt>{whatVerifies}</dt>
            <dd>{verifies[active]}</dd>
          </div>
        </dl>
      </article>
    </div>
  );
}
