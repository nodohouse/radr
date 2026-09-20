"use client";

/**
 * Hero product moment — sealed D-4102 verified recovery.
 * Completed proof state only. No pending / Needs You ambiguity.
 */

import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";
import { EvidenceProvenance } from "@/components/marketing/primitives/EvidenceProvenance";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import "@/app/radr-public.css";

const EUR = euro(ECON_D4102.verified);

export function HeroRecoveryScene() {
  return (
    <aside
      className="rx-fin"
      data-sealed="true"
      aria-label={`Verified recovery ${ECON_D4102.displayId}`}
    >
      <header>
        <p className="rx-fin-eye">
          Historical · {ECON_D4102.displayId} · sealed
        </p>
        <p className="rx-fin-place">Berlin Mitte · Supplier / AP</p>
        <div style={{ marginTop: "0.65rem" }}>
          <VerifiedStamp verified label="Verified recovered" />
        </div>
      </header>

      <div className="rx-fin-hero">
        <strong>{EUR}</strong>
        <em>Verified recovery</em>
      </div>

      <EvidenceProvenance
        steps={[
          { label: "Contract", value: "€6.80/L" },
          { label: "Invoice", value: "€7.45/L" },
          { label: "Decision", value: "Dispute" },
          { label: "Credit", value: EUR },
          { label: "Proof", value: "Matched" },
          { label: "Verified", value: EUR, verified: true },
        ]}
      />

      <a href="#verified-recovery" className="rx-fin-cta">
        See a verified recovery <span aria-hidden="true">→</span>
      </a>
      <p className="rx-fin-note">Illustrative demo · not customer results</p>
    </aside>
  );
}
