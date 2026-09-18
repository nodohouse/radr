"use client";

/**
 * Where value leaks — five narrative sections.
 * Intelligence classes, not modules.
 */

import { PROBLEM_FAMILY_DEFS, type ProblemFamily } from "@/lib/radr/problemFamilies";

type Section = {
  id: string;
  family: ProblemFamily;
  anchor: string;
  headline: string;
  loss: string[];
  euro?: string;
  sees: string[];
  decision: string;
  verified: string;
  punch: string;
};

const SECTIONS: Section[] = [
  {
    id: "supplier",
    family: "SUPPLIER_AP",
    anchor: "supplier-ap",
    headline: "Supplier / AP",
    loss: ["Invoice €7.45/L", "Contract €6.80/L", "420 L"],
    euro: "€273 exposed",
    sees: [
      "Contract / UOM / quantity",
      "Prior invoices · credit history",
      "Prepares dispute package",
      "Tracks credit",
    ],
    decision: "Dispute the variance. Do not reprice the menu yet.",
    verified: "Credit matched to the original invoice in AP.",
    punch: "Credit issued. Never applied.",
  },
  {
    id: "recon",
    family: "RECONCILIATION",
    anchor: "reconciliation",
    headline: "Reconciliation",
    loss: ["Expected settlement €9,814", "Actual settlement €9,521"],
    euro: "€293 unexplained",
    sees: [
      "Finds the mismatch",
      "Attributes refund / promo / fee cause",
      "Prepares correction",
      "Tracks closure",
    ],
    decision: "Open reconciliation Decision — not “ask your data.”",
    verified: "Settlement / journal correction matched across sources.",
    punch: "Settlement received. Still €293 short.",
  },
  {
    id: "cost",
    family: "COST_VARIANCE",
    anchor: "cost-variance",
    headline: "Food cost moved. Why?",
    loss: [
      "Supplier price",
      "Yield",
      "Waste",
      "Menu mix",
      "Sales mix",
    ],
    euro: "Food cost +2.3 pts",
    sees: [
      "Driver decomposition",
      "Signal vs noise",
      "Right lever before reprice",
    ],
    decision: "Fix yield + menu mix before raising price.",
    verified: "Cost movement explained · corrective outcome observed.",
    punch: "Food cost rose. Supplier inflation wasn’t the main reason.",
  },
  {
    id: "proc",
    family: "PROCUREMENT",
    anchor: "procurement",
    headline: "Three locations. Three prices.",
    loss: [
      "Berlin €7.45/L",
      "Amsterdam €6.80/L",
      "Lisbon €6.62/L",
      "Same olive oil",
    ],
    euro: "Group leverage",
    sees: [
      "Contract terms · pack · volume · freight",
      "Real price dispersion",
      "Negotiation opportunity",
    ],
    decision: "Negotiate group rate — dispersion unexplained by freight.",
    verified: "Negotiated rate / tier applied and matched.",
    punch: "Three locations. Three prices.",
  },
  {
    id: "perish",
    family: "PERISHABLE_REVENUE",
    anchor: "perishable",
    headline: "This value expires.",
    loss: ["Room cancelled", "19 hours left"],
    euro: "€184 value at risk",
    sees: [
      "Waitlist · direct · channel release",
      "Offer adjustment",
      "Time remaining",
    ],
    decision: "Recover contribution before the night dies.",
    verified: "Recovered contribution matched after close.",
    punch: "Room cancelled. 19 hours left to recover it.",
  },
];

export function ValueLeaksNarratives() {
  return (
    <div className="rx-vl-narratives">
      {SECTIONS.map((s) => {
        const maturity = PROBLEM_FAMILY_DEFS[s.family].maturity;
        return (
          <section
            key={s.id}
            id={s.anchor}
            className="rx-vl-section"
            data-nav-theme="light"
          >
            <div className="rx-shell">
              <header className="rx-vl-head">
                <p className="rx-intel-k">
                  {maturity === "pilot"
                    ? "Pilot-ready"
                    : maturity === "planned"
                      ? "Planned"
                      : "Expansion"}
                </p>
                <h2>{s.headline}</h2>
                <p className="rx-vl-punch">{s.punch}</p>
              </header>

              <div className="rx-vl-grid">
                <article>
                  <p className="rx-intel-class-k">The loss</p>
                  <ul>
                    {s.loss.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                  {s.euro ? <p className="rx-intel-class-euro">{s.euro}</p> : null}
                </article>
                <article>
                  <p className="rx-intel-class-k">What RADR sees</p>
                  <ul>
                    {s.sees.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </article>
                <article>
                  <p className="rx-intel-class-k">The Decision</p>
                  <p>{s.decision}</p>
                </article>
                <article>
                  <p className="rx-intel-class-k">What can be verified</p>
                  <p>{s.verified}</p>
                </article>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
