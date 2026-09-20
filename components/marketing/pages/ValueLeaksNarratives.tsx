"use client";

/**
 * Where value leaks — one framework.
 * Select a leak class → see what leaks / evidence / decision / action / verification.
 */

import { useState } from "react";
import { LeakClassVisual } from "@/components/marketing/kinetic/LeakClassVisual";
import type { ProblemFamily } from "@/lib/radr/problemFamilies";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

type ProblemId =
  | "SUPPLIER_AP"
  | "RECONCILIATION"
  | "COST_VARIANCE"
  | "PROCUREMENT"
  | "PERISHABLE_REVENUE";

type LeakDetail = {
  what: string;
  evidence: string;
  decision: string;
  action: string;
  verification: string;
  example: string;
};

const PROBLEMS: {
  id: ProblemId;
  label: string;
  family: ProblemFamily;
  detail: LeakDetail;
}[] = [
  {
    id: "SUPPLIER_AP",
    label: "Supplier / AP",
    family: "SUPPLIER_AP",
    detail: {
      what: "Contract vs invoice variance. Credits issued but never applied.",
      evidence: "Contracts · invoices · AP ledger · credit memos",
      decision: "D-4102 · Dispute the variance against contract.",
      action: "Dispute package prepared · credit chase opened",
      verification: "Credit matched to original invoice · Verified recovered",
      example: "€273 verified recovery · oil contract €6.80/L vs invoice €7.45/L",
    },
  },
  {
    id: "RECONCILIATION",
    label: "Reconciliation",
    family: "RECONCILIATION",
    detail: {
      what: "POS / delivery / settlement mismatch. Refunds without matching payouts.",
      evidence: "POS · gateway · delivery settlement · bank feed",
      decision: "Open a reconciliation Decision — not another export.",
      action: "Expected vs actual settlement attributed",
      verification: "Gap closed · settlement verified",
      example: "Delivery payout short · refund double-count caught before close",
    },
  },
  {
    id: "COST_VARIANCE",
    label: "Cost variance",
    family: "COST_VARIANCE",
    detail: {
      what: "Food or house cost moved without a matching demand shift.",
      evidence: "Recipe · POS mix · invoice · waste",
      decision: "Fix yield + menu mix before raising price.",
      action: "Cost drivers attributed · contribution checked",
      verification: "Driver attribution sealed · variance watched",
      example: "Food cost up · supplier inflation was not the main driver",
    },
  },
  {
    id: "PROCUREMENT",
    label: "Procurement",
    family: "PROCUREMENT",
    detail: {
      what: "Same SKU. Different negotiated rates across locations.",
      evidence: "PO history · contracts · location invoices",
      decision: "Consolidate on the normalized rate.",
      action: "Group rate locked · dispersion closed",
      verification: "Price variance watched · contract rate confirmed",
      example: "Three locations. Three prices. One group rate.",
    },
  },
  {
    id: "PERISHABLE_REVENUE",
    label: "Perishable revenue",
    family: "PERISHABLE_REVENUE",
    detail: {
      what: "Tables, rooms, orphan nights — value that expires tonight.",
      evidence: "PMS · channel · direct pace · events · labor",
      decision: "D-2201 · Hold premium inventory direct.",
      action: "Channel hold prepared · approved",
      verification: "Expected vs observed · Verified protected",
      example: "€3,100 expected · €2,960 observed · Verified protected",
    },
  },
];

export function ValueLeaksNarratives() {
  const [problem, setProblem] = useState<ProblemId>("SUPPLIER_AP");
  const active = PROBLEMS.find((p) => p.id === problem)!;

  return (
    <div className="rx-vl-narratives">
      <section className="rx-vl-section" data-nav-theme="light">
        <div className="rx-shell">
          <header className="rx-vl-head">
            <p className="rx-intel-k">Where value leaks</p>
            <h2>One framework. Five leak classes.</h2>
            <p className="rx-vl-punch">
              Select a class. See the Decision — not another taxonomy.
            </p>
          </header>

          <nav className="rx-atlas-problems" aria-label="Leak class">
            {PROBLEMS.map((p) => (
              <button
                key={p.id}
                type="button"
                id={
                  p.id === "SUPPLIER_AP"
                    ? "supplier-ap"
                    : p.id === "RECONCILIATION"
                      ? "reconciliation"
                      : p.id === "COST_VARIANCE"
                        ? "cost-variance"
                        : p.id === "PROCUREMENT"
                          ? "procurement"
                          : "perishable"
                }
                data-on={problem === p.id ? "true" : undefined}
                onClick={() => setProblem(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>

          <div className="rx-vl-detail" key={problem}>
            <LeakClassVisual family={active.family} />
            <dl className="rx-vl-detail-grid">
              <div>
                <dt>What leaks</dt>
                <dd>{active.detail.what}</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>{active.detail.evidence}</dd>
              </div>
              <div>
                <dt>Decision</dt>
                <dd>{active.detail.decision}</dd>
              </div>
              <div>
                <dt>Action</dt>
                <dd>{active.detail.action}</dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>{active.detail.verification}</dd>
              </div>
              <div>
                <dt>One example</dt>
                <dd>{active.detail.example}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
