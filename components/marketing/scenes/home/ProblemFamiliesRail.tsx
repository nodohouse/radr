"use client";

/**
 * Five problem families — interactive economic leak map.
 * Not five equal SaaS cards. Select one → detail updates.
 */

import { useState } from "react";
import {
  PROBLEM_FAMILIES,
  PROBLEM_FAMILY_DEFS,
  type ProblemFamily,
} from "@/lib/radr/problemFamilies";

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
};

export function ProblemFamiliesRail({
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
}: Props) {
  const [active, setActive] = useState<ProblemFamily>("SUPPLIER_AP");
  const def = PROBLEM_FAMILY_DEFS[active];

  return (
    <div className="rx-pf">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p">{lead}</p>

      <div className="rx-pf-rail" role="tablist" aria-label={title}>
        {PROBLEM_FAMILIES.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            data-on={active === id ? "true" : undefined}
            data-maturity={PROBLEM_FAMILY_DEFS[id].maturity}
            className="rx-pf-tab"
            onClick={() => setActive(id)}
          >
            <em>{labels[id]}</em>
            <span>
              {PROBLEM_FAMILY_DEFS[id].maturity === "pilot"
                ? maturityPilot
                : maturityExpansion}
            </span>
          </button>
        ))}
      </div>

      <article className="rx-pf-detail" data-family={active}>
        <header className="rx-pf-detail-head">
          <h3>{labels[active]}</h3>
          <p data-stage={def.stage}>{def.stage}</p>
        </header>
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
