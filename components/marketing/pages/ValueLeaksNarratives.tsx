"use client";

/**
 * Where value leaks — visual carries the story. One conclusion line.
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
  conclusion: string;
};

const SECTIONS: Section[] = [
  {
    id: "supplier",
    family: "SUPPLIER_AP",
    anchor: "supplier-ap",
    headline: "Supplier / AP",
    punch: "Credit issued. Never applied.",
    conclusion: "Dispute the variance. Verify the credit against the original invoice.",
  },
  {
    id: "recon",
    family: "RECONCILIATION",
    anchor: "reconciliation",
    headline: "Reconciliation",
    punch: "Settlement received. Still €293 short.",
    conclusion: "Open a reconciliation Decision — not another export.",
  },
  {
    id: "cost",
    family: "COST_VARIANCE",
    anchor: "cost-variance",
    headline: "Food cost moved. Why?",
    punch: "Supplier inflation wasn’t the main driver.",
    conclusion: "Fix yield + menu mix before raising price.",
  },
  {
    id: "proc",
    family: "PROCUREMENT",
    anchor: "procurement",
    headline: "Three locations. Three prices.",
    punch: "Normalize. Then negotiate.",
    conclusion: "Consolidate on the normalized rate — not the loudest local quote.",
  },
  {
    id: "perish",
    family: "PERISHABLE_REVENUE",
    anchor: "perishable",
    headline: "This value expires.",
    punch: "Room cancelled. 19 hours left.",
    conclusion: "Recover contribution before the night dies.",
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

              <div className="rx-vl-stage rx-vl-stage-solo">
                <LeakClassVisual family={s.family} />
                <p className="rx-vl-conclusion">{s.conclusion}</p>
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
