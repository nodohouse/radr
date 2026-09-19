"use client";

/**
 * Homepage Control Center preview — attention, not another dashboard.
 */

import { Link } from "@/i18n/navigation";
import { CANON_SUPPLIER } from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { VALUE_LEAK_HREF } from "@/components/marketing/nav/navConfig";

/** Settlement gap already used on public rails — Expected €9,814 − Actual €9,521 */
const SETTLEMENT_GAP_EURO = 293;
const SETTLEMENT_REFUNDS_EXPLAINED = 91;

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
        <p className="rx-hcc-need">
          <strong>2 things need you.</strong>
          <span>Everything else is within expectations.</span>
        </p>

        <ul className="rx-hcc-rows">
          <li>
            <div className="rx-hcc-row-meta">
              <em>
                {CANON_SUPPLIER.property} · Supplier / AP
              </em>
              <span className="rx-hcc-id">{CANON_SUPPLIER.displayId}</span>
            </div>
            <p className="rx-hcc-euro">
              <strong>{formatDecisionMoney(CANON_SUPPLIER.exposureEuro)}</strong>
              <span>variance</span>
            </p>
            <p className="rx-hcc-line">Contract and invoice disagree.</p>
            <p className="rx-hcc-detail">Evidence package ready.</p>
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
              <strong>{formatDecisionMoney(SETTLEMENT_GAP_EURO)}</strong>
              <span>unexplained</span>
            </p>
            <p className="rx-hcc-line">Unexplained settlement gap.</p>
            <p className="rx-hcc-detail">
              Refunds explain €{SETTLEMENT_REFUNDS_EXPLAINED}. €
              {SETTLEMENT_GAP_EURO} remains unmatched.
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
