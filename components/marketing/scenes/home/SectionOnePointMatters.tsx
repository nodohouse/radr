"use client";

import {
  FSR_PRETAX_2024,
  FSR_EXPENSE_RISE_2019_2026,
  FSR_NOT_PROFITABLE_2025,
  illustrativeOnePoint,
} from "@/lib/radr/decision/economics";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

/**
 * Giant thin-margin typography — pain with sourced context, then control.
 */
export function SectionOnePointMatters() {
  const illus = illustrativeOnePoint();

  return (
    <section
      className="rx-spine-section rx-scene rx-one"
      data-nav-theme="light"
      id="one-point"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Industry economics</p>
          <h2 className="rx-spine-title rx-one-giant">
            {FSR_PRETAX_2024.value}
          </h2>
          <p className="rx-one-giant-sub">
            Median pre-tax income · full-service restaurants.
          </p>
          <p className="rx-pain-punch">
            At that level, a small operating error is not small.
          </p>
        </header>

        <div className="rx-one-illus">
          <div className="rx-one-nums">
            <div>
              <strong>{formatDecisionMoney(illus.annualRevenueEuro)}</strong>
              <span>Revenue</span>
            </div>
            <div>
              <strong>{illus.marginPct}%</strong>
              <span>Margin</span>
            </div>
            <div>
              <strong>{formatDecisionMoney(illus.profitEuro)}</strong>
              <span>Profit</span>
            </div>
            <div data-tone="gain">
              <strong>+{formatDecisionMoney(illus.onePointEuro)}</strong>
              <span>1 point</span>
            </div>
          </div>
        </div>

        <p className="rx-one-pressure">
          Expenses {FSR_EXPENSE_RISE_2019_2026.value} since 2019.
          {" "}
          {FSR_NOT_PROFITABLE_2025.value} of operators not profitable in 2025.
          {" "}
          <strong>The margin for bad decisions is shrinking.</strong>
        </p>
        <p className="rx-one-source" title={FSR_PRETAX_2024.footnote}>
          [1] {FSR_PRETAX_2024.footnote}
        </p>
        <p className="rx-one-source" title={FSR_EXPENSE_RISE_2019_2026.footnote}>
          [2] {FSR_EXPENSE_RISE_2019_2026.footnote}
        </p>
      </div>
    </section>
  );
}
