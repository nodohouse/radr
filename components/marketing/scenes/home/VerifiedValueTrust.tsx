"use client";

/**
 * Verified Value trust layer — semantic distinction, not green inflation.
 */

import { CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

const EUR = formatDecisionMoney(CANON_SUPPLIER.exposureEuro);

const STEPS = [
  { k: "Identified", v: EUR, tone: "neutral" as const },
  { k: "Actioned", v: "Dispute sent", tone: "neutral" as const },
  { k: "Observed", v: `${EUR} credit issued`, tone: "pending" as const },
  { k: "Verified", v: `${EUR} recovered`, tone: "verified" as const },
] as const;

export function VerifiedValueTrust() {
  return (
    <div className="rx-vvt">
      <p className="rx-rec-k">Verified Value</p>
      <h2 className="rx-vvt-h">
        The economics are traceable.
      </h2>
      <p className="rx-vvt-lead">
        A number becomes verified only once RADR has downstream economic
        evidence — not when a recommendation appears.
      </p>

      <ul className="rx-vvt-rail" aria-label={`${CANON_SUPPLIER.displayId} verification path`}>
        {STEPS.map((s) => (
          <li key={s.k} data-tone={s.tone}>
            <em>{s.k}</em>
            <strong>{s.v}</strong>
          </li>
        ))}
      </ul>

      <p className="rx-vvt-note">
        {CANON_SUPPLIER.displayId} · illustrative demo · not customer results
      </p>
    </div>
  );
}
