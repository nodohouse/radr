"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  demoValueUnderRadr,
  proofForVerifiedEuro,
} from "@/lib/radr/decision/economics";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CANON_PEAK } from "@/lib/radr/decision/demo/canonical";

/**
 * The CFO screenshot — huge verified value, minimal prose.
 */
export function SectionCfoProof() {
  const value = useMemo(() => demoValueUnderRadr(), []);
  const [open, setOpen] = useState(false);
  const proof = proofForVerifiedEuro(CANON_PEAK.id);

  return (
    <section
      className="rx-spine-section rx-scene rx-cfo"
      data-nav-theme="light"
      id="cfo-proof"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">CFO proof · DEMO PORTFOLIO · ILLUSTRATIVE</p>
          <h2 className="rx-spine-title">Can you trust the ROI?</h2>
        </header>

        <div className="rx-cfo-hero-num">
          <strong className="rx-econ-verified">
            {formatDecisionMoney(value.verifiedEuro)}
          </strong>
          <span>VERIFIED VALUE THIS MONTH · ILLUSTRATIVE</span>
        </div>

        <ul className="rx-cfo-kinds">
          {(
            [
              ["Recovered", value.byKind.recovered],
              ["Protected", value.byKind.protected],
              ["Created", value.byKind.created],
              ["Avoided", value.byKind.avoided],
            ] as const
          ).map(([label, amt]) => (
            <li key={label}>
              <strong>{formatDecisionMoney(amt)}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rx-cfo-audit"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Hide" : "Open"} proof · {CANON_PEAK.displayId}
        </button>

        {open && proof ? (
          <div className="rx-cfo-trace">
            <dl>
              <div>
                <dt>Exposure</dt>
                <dd className="rx-econ-risk">
                  {formatDecisionMoney(proof.exposureEuro)}
                </dd>
              </div>
              <div>
                <dt>Expected</dt>
                <dd>{formatDecisionMoney(proof.predictedEuro)}</dd>
              </div>
              <div>
                <dt>Verified</dt>
                <dd className="rx-econ-verified">
                  {formatDecisionMoney(proof.actualEuro)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/app/decisions/${proof.decisionId}`}
              className="rp-brief-open"
            >
              Open Decision Trace
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
