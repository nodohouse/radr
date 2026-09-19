"use client";

/**
 * Hospitality Value Atlas — one cinematic scene.
 * Vertical × problem selectors. Not a spreadsheet. Not five identical chapters.
 */

import { useState } from "react";
import { LeakClassVisual } from "@/components/marketing/kinetic/LeakClassVisual";
import { HospitalityContextSwitch } from "@/components/marketing/kinetic/HospitalityContextSwitch";
import {
  type HospitalityVertical,
} from "@/lib/marketing/hospitalityContext";
import type { ProblemFamily } from "@/lib/radr/problemFamilies";
import "@/app/kinetic.css";

type ProblemId =
  | "SUPPLIER_AP"
  | "RECONCILIATION"
  | "COST_VARIANCE"
  | "PROCUREMENT"
  | "PERISHABLE_REVENUE";

const PROBLEMS: { id: ProblemId; label: string; family: ProblemFamily }[] = [
  { id: "SUPPLIER_AP", label: "Supplier / AP", family: "SUPPLIER_AP" },
  { id: "RECONCILIATION", label: "Reconciliation", family: "RECONCILIATION" },
  { id: "COST_VARIANCE", label: "Cost variance", family: "COST_VARIANCE" },
  { id: "PROCUREMENT", label: "Procurement", family: "PROCUREMENT" },
  {
    id: "PERISHABLE_REVENUE",
    label: "Perishable revenue",
    family: "PERISHABLE_REVENUE",
  },
];

type AtlasCell = {
  punch: string;
  decision: string;
  verify: string;
};

const ATLAS: Record<HospitalityVertical, Record<ProblemId, AtlasCell>> = {
  restaurant: {
    SUPPLIER_AP: {
      punch: "Credit issued. Never applied.",
      decision: "D-4102 · Dispute the variance against contract.",
      verify: "Credit matched to original invoice · Verified recovered.",
    },
    RECONCILIATION: {
      punch: "Delivery / POS settlement mismatch.",
      decision: "Open a reconciliation Decision — not another export.",
      verify: "Expected vs actual settlement · gap attributed.",
    },
    COST_VARIANCE: {
      punch: "Food cost moved. Supplier inflation wasn’t the main driver.",
      decision: "Fix yield + menu mix before raising price.",
      verify: "Cost drivers attributed · menu contribution checked.",
    },
    PROCUREMENT: {
      punch: "Three locations. Three prices.",
      decision: "Consolidate on the normalized rate.",
      verify: "Price dispersion closed · group rate locked.",
    },
    PERISHABLE_REVENUE: {
      punch: "Cancelled table / no-show — value expires tonight.",
      decision: "D-1911 · Wait 12 · protect second-turn contribution.",
      verify: "Expected vs observed covers · Verified protected.",
    },
  },
  hotel: {
    SUPPLIER_AP: {
      punch: "Vendor credit against room / F&B spend never applied.",
      decision: "Dispute + apply credit before period close.",
      verify: "Credit ledger matched · recovered.",
    },
    RECONCILIATION: {
      punch: "PMS / OTA / gateway / refund mismatch.",
      decision: "Reconcile channel settlement to folio truth.",
      verify: "Refund + payout attributed · gap closed.",
    },
    COST_VARIANCE: {
      punch: "House cost moved without a matching demand shift.",
      decision: "Separate labor · amenity · energy drivers.",
      verify: "Cost drivers attributed to operating state.",
    },
    PROCUREMENT: {
      punch: "Same amenity pack. Different negotiated rates.",
      decision: "Normalize · then renegotiate as a group.",
      verify: "Contract rate locked · variance watched.",
    },
    PERISHABLE_REVENUE: {
      punch: "Cancelled room / upgrade / orphan room-night.",
      decision: "D-2201 · Hold 4 premium rooms direct 72h.",
      verify: "€3,100 expected · €2,960 observed · Verified protected.",
    },
  },
  serviced_apartment: {
    SUPPLIER_AP: {
      punch: "Cleaning / maintenance credit never applied to unit P&L.",
      decision: "Apply credit against unit night economics.",
      verify: "Vendor credit matched · recovered.",
    },
    RECONCILIATION: {
      punch: "Channel payout / cleaning / refund reconciliation.",
      decision: "Reconcile payout to unit night + turnover cost.",
      verify: "Settlement gap attributed · closed.",
    },
    COST_VARIANCE: {
      punch: "Turnover cost rose without occupancy explanation.",
      decision: "Separate cleaning · linen · exception drivers.",
      verify: "Unit cost drivers attributed.",
    },
    PROCUREMENT: {
      punch: "Same linens. Different unit-level prices.",
      decision: "Normalize supplier · lock group rate.",
      verify: "Price dispersion closed.",
    },
    PERISHABLE_REVENUE: {
      punch: "Unit-night gap / turnover window.",
      decision: "D-3104 · Keep unit direct-first.",
      verify: "Net contribution observed · incremental verified.",
    },
  },
};

export function ValueLeaksNarratives() {
  const [vertical, setVertical] = useState<HospitalityVertical>("restaurant");
  const [problem, setProblem] = useState<ProblemId>("RECONCILIATION");
  const cell = ATLAS[vertical][problem];
  const family = PROBLEMS.find((p) => p.id === problem)!.family;

  return (
    <div className="rx-vl-narratives rx-atlas">
      <section className="rx-vl-section rx-atlas-sec" data-nav-theme="light">
        <div className="rx-shell">
          <header className="rx-vl-head">
            <p className="rx-intel-k">Hospitality Value Atlas</p>
            <h2>Where value leaks — across the operation</h2>
            <p className="rx-vl-punch">
              One engine. Different environments. Same leak classes.
            </p>
          </header>

          <HospitalityContextSwitch
            value={vertical}
            onChange={setVertical}
            size="compact"
            ariaLabel="Atlas hospitality environment"
          />

          <nav className="rx-atlas-problems" aria-label="Problem class">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                type="button"
                data-on={problem === p.id ? "true" : undefined}
                onClick={() => setProblem(p.id)}
                onMouseEnter={() => setProblem(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>

          <div className="rx-atlas-stage" key={`${vertical}-${problem}`}>
            <LeakClassVisual family={family} />
            <div className="rx-atlas-copy">
              <p className="rx-atlas-punch">{cell.punch}</p>
              <p className="rx-atlas-decision">{cell.decision}</p>
              <p className="rx-atlas-verify">{cell.verify}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
