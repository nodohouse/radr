"use client";

/**
 * Complete recovery — editorial composition.
 * €273 is the protagonist. Not seven equal cards.
 */

import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import "@/app/radr-public.css";

const EUR = euro(ECON_D4102.verified);

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
          Historical · {ECON_D4102.displayId} · Berlin Mitte
        </p>
        <div className="rx-rso-hero-num">
          <strong className="rx-pub-num" data-tone="verified">
            {EUR}
          </strong>
          <em>Verified recovery</em>
          <VerifiedStamp verified label="Verified recovered" />
        </div>

        <div className="rx-rso-grid">
          <div>
            <p className="rx-pub-micro">Why</p>
            <p>
              Contract €6.80/L
              <br />
              Invoice €7.45/L
            </p>
          </div>
          <div>
            <p className="rx-pub-micro">Action</p>
            <p>Supplier dispute prepared</p>
          </div>
          <div>
            <p className="rx-pub-micro">Outcome</p>
            <p>{EUR} credit issued</p>
          </div>
          <div>
            <p className="rx-pub-micro">Proof</p>
            <p>Credit matched to invoice</p>
          </div>
        </div>
      </article>
    </div>
  );
}
