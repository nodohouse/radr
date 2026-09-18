"use client";

/**
 * Where value leaks — each class = unique visual language.
 * Caption strip only. No repeating four-box template.
 */

import { PROBLEM_FAMILY_DEFS, type ProblemFamily } from "@/lib/radr/problemFamilies";
import { EconomicRail } from "@/components/marketing/kinetic/EconomicRail";
import { LeakClassVisual } from "@/components/marketing/kinetic/LeakClassVisual";
import { LEAK_MARQUEE } from "@/lib/marketing/economicRail";
import "@/app/kinetic.css";

type Section = {
  id: string;
  family: ProblemFamily;
  anchor: string;
  headline: string;
  punch: string;
  loss: string;
  decision: string;
  verified: string;
};

const SECTIONS: Section[] = [
  {
    id: "supplier",
    family: "SUPPLIER_AP",
    anchor: "supplier-ap",
    headline: "Supplier / AP",
    punch: "Credit issued. Never applied.",
    loss: "Contract €6.80 · Invoice €7.45 · 420 L → €273 exposed",
    decision: "Dispute the variance. Do not reprice the menu yet.",
    verified: "Credit matched to the original invoice in AP.",
  },
  {
    id: "recon",
    family: "RECONCILIATION",
    anchor: "reconciliation",
    headline: "Reconciliation",
    punch: "Settlement received. Still €293 short.",
    loss: "Expected €9,814 · Actual €9,521 · streams diverge",
    decision: "Open reconciliation Decision — not “ask your data.”",
    verified: "Settlement / journal correction matched across sources.",
  },
  {
    id: "cost",
    family: "COST_VARIANCE",
    anchor: "cost-variance",
    headline: "Food cost moved. Why?",
    punch: "Food cost rose. Supplier inflation wasn’t the main reason.",
    loss: "+2.3 pts decomposes into supplier · yield · waste · mix",
    decision: "Fix yield + menu mix before raising price.",
    verified: "Cost movement explained · corrective outcome observed.",
  },
  {
    id: "proc",
    family: "PROCUREMENT",
    anchor: "procurement",
    headline: "Three locations. Three prices.",
    punch: "Three locations. Three prices. One Decision.",
    loss: "Berlin €7.45 · Amsterdam €6.80 · Lisbon €6.62",
    decision: "Consolidate on the normalized rate — not the loudest local quote.",
    verified: "Negotiated rate or volume tier applied and matched.",
  },
  {
    id: "perish",
    family: "PERISHABLE_REVENUE",
    anchor: "perishable",
    headline: "This value expires.",
    punch: "Room cancelled. 19 hours left to recover it.",
    loss: "Economic clock: 19h → 12h → 6h → 2h",
    decision: "Recover contribution before the night dies.",
    verified: "Recovered contribution matched after close.",
  },
];

export function ValueLeaksNarratives() {
  return (
    <div className="rx-vl-narratives">
      <EconomicRail
        items={LEAK_MARQUEE}
        durationSec={40}
        variant="compact"
        ariaLabel="Where value leaks examples"
      />

      {SECTIONS.map((s, i) => {
        const maturity = PROBLEM_FAMILY_DEFS[s.family].maturity;
        return (
          <section
            key={s.id}
            id={s.anchor}
            className="rx-vl-section"
            data-family={s.family}
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

              <div className="rx-vl-stage">
                <LeakClassVisual family={s.family} />
                <dl className="rx-vl-caption">
                  <div>
                    <dt>Loss</dt>
                    <dd>{s.loss}</dd>
                  </div>
                  <div>
                    <dt>Decision</dt>
                    <dd>{s.decision}</dd>
                  </div>
                  <div>
                    <dt>Verified</dt>
                    <dd>{s.verified}</dd>
                  </div>
                </dl>
              </div>
            </div>
            {i < SECTIONS.length - 1 ? (
              <div className="rx-vl-sep" aria-hidden="true" />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
