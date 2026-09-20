"use client";

/**
 * Intelligence — five problem classes (where RADR looks for value).
 * Context for Decisions — not five products or nav items.
 */

import { useState } from "react";
import {
  PROBLEM_FAMILIES,
  PROBLEM_FAMILY_DEFS,
  type ProblemFamily,
} from "@/lib/radr/problemFamilies";
import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";

type Story = {
  id: ProblemFamily;
  headline: string;
  facts: string[];
  euro?: string;
  radr: string[];
  punch: string;
};

const STORIES: Story[] = [
  {
    id: "SUPPLIER_AP",
    headline: "Supplier / AP",
    facts: ["Invoice €7.45/L", "Contract €6.80/L", "420 L"],
    euro: `${euro(ECON_D4102.verified)} recovered`,
    radr: [
      "Detects variance",
      "Checks evidence",
      "Prepares dispute",
      "Tracks credit",
      "Verifies outcome",
    ],
    punch: "Credit issued. Matched. Verified — RADR follows it home.",
  },
  {
    id: "RECONCILIATION",
    headline: "Reconciliation",
    facts: [
      "Expected settlement €9,814",
      "Actual settlement €9,521",
    ],
    euro: "€293 unexplained",
    radr: [
      "Refund treatment",
      "Promotion funding",
      "Fee mismatch",
      "Prepares reconciliation",
      "Verifies closure",
    ],
    punch: "Settlement received. Still €293 short.",
  },
  {
    id: "COST_VARIANCE",
    headline: "Why did food cost move?",
    facts: [
      "Supplier price",
      "Waste",
      "Yield",
      "Menu mix",
      "Sales mix",
    ],
    euro: "Food cost +2.3 pts",
    radr: [
      "Ranks drivers",
      "Separates signal from noise",
      "Recommends the right lever",
      "Before repricing",
    ],
    punch: "Food cost rose. Supplier inflation wasn’t the main reason.",
  },
  {
    id: "PROCUREMENT",
    headline: "Procurement leverage",
    facts: [
      "Same olive oil",
      "Berlin €7.45/L",
      "Amsterdam €6.80/L",
      "Lisbon €6.62/L",
    ],
    euro: "Group leverage",
    radr: [
      "Surfaces dispersion",
      "Freight / pack ruled out",
      "Negotiates group rate",
      "Tracks applied terms",
    ],
    punch: "Three locations. Three prices.",
  },
  {
    id: "PERISHABLE_REVENUE",
    headline: "Perishable revenue",
    facts: ["Room cancelled", "19 hours left"],
    euro: "€184 value at risk",
    radr: [
      "Waitlist",
      "Direct",
      "Channel release",
      "Offer adjustment",
      "Follows recovered contribution",
    ],
    punch: "Room cancelled. 19 hours left to recover it.",
  },
];

export function IntelProblemClasses() {
  const [active, setActive] = useState<ProblemFamily>("SUPPLIER_AP");
  const story = STORIES.find((s) => s.id === active) ?? STORIES[0];
  const def = PROBLEM_FAMILY_DEFS[active];

  return (
    <section className="rx-intel-classes" data-nav-theme="light">
      <div className="rx-shell">
        <p className="rx-intel-k">Problem classes · not modules</p>
        <h2 className="rx-intel-classes-title">
          Where the Decision engine looks
        </h2>
        <p className="rx-intel-classes-lead">
          You interact with Decisions, Value, Evidence, Actions, Outcomes.
          Problem class is context — not a siloed product.
        </p>

        <div className="rx-pf-rail" role="tablist" aria-label="Problem classes">
          {PROBLEM_FAMILIES.map((id) => {
            const s = STORIES.find((x) => x.id === id)!;
            return (
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
                <em>{s.headline}</em>
                <span>
                  {PROBLEM_FAMILY_DEFS[id].maturity === "pilot"
                    ? "Pilot-ready"
                    : PROBLEM_FAMILY_DEFS[id].maturity === "planned"
                      ? "Planned"
                      : "Expansion"}
                </span>
              </button>
            );
          })}
        </div>

        <article className="rx-intel-class-story" data-family={active}>
          <header>
            <h3>{story.headline}</h3>
            <p data-maturity={def.maturity}>
              {def.maturity === "pilot"
                ? "Pilot-ready"
                : def.maturity === "planned"
                  ? "Planned"
                  : "Expansion"}
            </p>
          </header>

          <div className="rx-intel-class-grid">
            <div>
              <p className="rx-intel-class-k">The leak</p>
              <ul>
                {story.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {story.euro ? (
                <p className="rx-intel-class-euro">{story.euro}</p>
              ) : null}
            </div>
            <div>
              <p className="rx-intel-class-k">RADR</p>
              <ol>
                {story.radr.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </div>
          </div>

          <p className="rx-intel-class-punch">{story.punch}</p>
        </article>
      </div>
    </section>
  );
}
