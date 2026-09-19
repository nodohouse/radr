"use client";

import Link from "next/link";
import { MarginResponseCanvas } from "@/components/product/margin/MarginResponseCanvas";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { COKE_MARGIN_SHOCK } from "@/lib/radr/product/marginResponse";

export default function MarginResponsePage() {
  return (
    <div className="rp-margin-page">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Intelligence · Margin Response</p>
        <h1 className="rp-cc-title">Margin Response</h1>
        <p className="rp-cc-since">
          Not menu pricing — the strongest response to a margin shock ·{" "}
          {COKE_MARGIN_SHOCK.sku} ·{" "}
          {displayDecisionId(DECISION_IDS.marginCoke)} · DEMO
        </p>
        <Link
          href={`/app/decisions/${DECISION_IDS.marginCoke}`}
          className="rp-drec-secondary"
        >
          Open Decision Record
        </Link>
      </header>
      <MarginResponseCanvas />
    </div>
  );
}
