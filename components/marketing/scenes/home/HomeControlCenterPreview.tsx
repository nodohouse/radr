"use client";

/**
 * Homepage Control Center preview — attention, not another dashboard.
 */

import { Link } from "@/i18n/navigation";
import {
  euro,
  ECON_D4102,
  SETTLEMENT_GAP_EURO,
  SETTLEMENT_REFUNDS_EXPLAINED_EURO,
} from "@/lib/marketing/publicDecisionEconomics";
import { VALUE_LEAK_HREF } from "@/components/marketing/nav/navConfig";
import { AttentionBrief } from "@/components/marketing/primitives/AttentionBrief";
import "@/app/radr-public.css";

export function HomeControlCenterPreview() {
  return (
    <div className="rx-hcc">
      <header className="rx-hcc-head">
        <p className="rx-rec-k">Control Center</p>
        <h2 className="rx-hcc-h">
          Your operation does not need another dashboard.
          <span>It needs to know what needs intervention.</span>
        </h2>
        <p className="rx-hcc-lead">
          RADR compresses thousands of operating signals into the few Decisions
          that deserve human attention.
        </p>
      </header>

      <div className="rx-hcc-stage" aria-label="Morning brief">
        <p className="rx-hcc-greet">Good morning.</p>
        <AttentionBrief count={2} />

        <ul className="rx-hcc-rows">
          <li>
            <div className="rx-hcc-row-meta">
              <em>Berlin Mitte · Supplier / AP</em>
              <span className="rx-hcc-id">{ECON_D4102.displayId}</span>
            </div>
            <p className="rx-hcc-euro">
              <strong>{euro(ECON_D4102.verified)}</strong>
              <span>verified recovered</span>
            </p>
            <p className="rx-hcc-line">Credit matched to original invoice.</p>
            <p className="rx-hcc-detail">Evidence package closed.</p>
            <a href="#verified-recovery" className="rx-hcc-cta">
              Review Decision <span aria-hidden="true">→</span>
            </a>
          </li>
          <li>
            <div className="rx-hcc-row-meta">
              <em>Berlin · Reconciliation</em>
              <span className="rx-hcc-id">Settlement</span>
            </div>
            <p className="rx-hcc-euro">
              <strong>{euro(SETTLEMENT_GAP_EURO)}</strong>
              <span>unexplained</span>
            </p>
            <p className="rx-hcc-line">Unexplained settlement gap.</p>
            <p className="rx-hcc-detail">
              {`Refunds explain ${euro(SETTLEMENT_REFUNDS_EXPLAINED_EURO)}. ${euro(SETTLEMENT_GAP_EURO)} remains unmatched.`}
            </p>
            <Link href={VALUE_LEAK_HREF.reconciliation} className="rx-hcc-cta">
              Investigate <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>

        <p className="rx-hcc-quiet">Routine signals suppressed.</p>
      </div>
    </div>
  );
}
