"use client";

/**
 * Complete recovery — editorial composition.
 * Verified amount is the protagonist. View Trace opens structured Decision Trace.
 */

import { ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";
import { PUBLIC_SUPPLIER } from "@/lib/marketing/publicCanon";
import { TRACE_D4102 } from "@/lib/marketing/decisionTrace";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import { DecisionTraceToggle } from "@/components/marketing/decision/DecisionTrace";
import "@/app/radr-public.css";

type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export function RecoveryStoryObject({ kicker, title, lead }: Props) {
  return (
    <div className="rx-rso rx-rso--editorial">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      {lead ? <p className="rx-rec-p">{lead}</p> : null}

      <article
        className="rx-rso-proof"
        aria-label={`${ECON_D4102.displayId} verified recovery`}
      >
        <p className="rx-pub-micro">
          Historical · {PUBLIC_SUPPLIER.displayId} · {PUBLIC_SUPPLIER.location}
        </p>
        <div className="rx-rso-hero-num">
          <strong className="rx-pub-num" data-tone="verified">
            {PUBLIC_SUPPLIER.verifiedFormatted}
          </strong>
          <em>Verified recovery</em>
          <VerifiedStamp verified label="Verified recovered" />
        </div>

        <div className="rx-rso-grid">
          <div>
            <p className="rx-pub-micro">Why</p>
            <p>
              Contract {PUBLIC_SUPPLIER.contractFormatted}
              <br />
              Invoice {PUBLIC_SUPPLIER.invoiceFormatted}
            </p>
          </div>
          <div>
            <p className="rx-pub-micro">Action</p>
            <p>Supplier dispute prepared</p>
          </div>
          <div>
            <p className="rx-pub-micro">Outcome</p>
            <p>{PUBLIC_SUPPLIER.verifiedFormatted} credit issued</p>
          </div>
          <div>
            <p className="rx-pub-micro">Proof</p>
            <p>Credit matched to invoice</p>
          </div>
        </div>

        <DecisionTraceToggle trace={TRACE_D4102} label="View Trace" />
      </article>
    </div>
  );
}
