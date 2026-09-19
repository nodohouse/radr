"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import type {
  FinancialOperatingState,
  WaterfallLine,
} from "@/lib/radr/finance";
import { ContributionWaterfall } from "./ContributionWaterfall";
import { MoneyFlowBoard } from "./MoneyFlowBoard";
import { FinanceExplainSheet } from "./FinanceExplainSheet";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  state: FinancialOperatingState;
};

/**
 * CFO Financial Operating Layer - contribution first, never fake profit.
 */
export function FinanceOperatingLayer({ state }: Props) {
  const [line, setLine] = useState<WaterfallLine | null>(null);
  const marginPts = state.marginVariancePts;

  return (
    <div className="rp-fol">
      <header className="rp-fol-hero" data-tour-target="finance-hero">
        <p className="rp-fol-hero-kicker">
          {state.serviceLabel} · {state.locationName} · {state.phaseLabel}
          {state.illustrative ? <em>Illustrative</em> : null}
        </p>
        <p className="rp-fol-hero-confidence" data-confidence={state.overallConfidence}>
          Data {state.overallConfidence}
          <span>COGS and labor estimated · delivery partial</span>
        </p>

        <div className="rp-fol-hero-metrics">
          <div>
            <span>Net sales</span>
            <strong>{eur(state.netSales)}</strong>
          </div>
          <div data-signal="true">
            <span>Live contribution</span>
            <strong>{eur(state.liveContribution)}</strong>
          </div>
          <div>
            <span>Contribution margin</span>
            <strong>
              {state.contributionMarginPct.toFixed(1).replace(".", ",")}%
            </strong>
            <em
              data-tone={marginPts >= 0 ? "good" : "watch"}
            >
              {marginPts >= 0 ? "+" : ""}
              {marginPts.toFixed(1).replace(".", ",")} pts vs plan
            </em>
          </div>
        </div>

        <div className="rp-fol-fnb" aria-label="Food and beverage revenue">
          <div>
            <span>Food</span>
            <strong>{eur(state.fnb.foodRevenue)}</strong>
            <em>
              {state.fnb.foodSharePct}% · {eur(state.fnb.foodContribution)}{" "}
              contrib.
            </em>
          </div>
          <div data-emphasis="true">
            <span>Beverage</span>
            <strong>{eur(state.fnb.beverageRevenue)}</strong>
            <em>
              {state.fnb.beverageSharePct}% ·{" "}
              {eur(state.fnb.beverageContribution)} contrib. ·{" "}
              {state.fnb.beverageContributionMarginPct}% margin
            </em>
          </div>
        </div>

        <WhyLine
          why={
            marginPts < 0
              ? `Revenue can look fine while contribution is ${Math.abs(marginPts).toFixed(1).replace(".", ",")} pts below plan - labor and COGS mix drove most of the gap`
              : `Beverage is ${state.fnb.beverageSharePct}% of net with ${state.fnb.beverageContributionMarginPct}% contribution margin - drinks are carrying more margin than food tonight`
          }
        />
      </header>

      <ContributionWaterfall lines={state.waterfall} onSelect={setLine} />

      <MoneyFlowBoard columns={state.moneyFlow} />

      <section className="rp-fol-attn" aria-label="Needs you">
        <header className="rp-fol-sec-head">
          <p className="rp-fol-sec-kicker">Needs you</p>
          <p className="rp-fol-sec-title">
            {state.attentions.length} finance exception
            {state.attentions.length === 1 ? "" : "s"}
          </p>
        </header>
        <ol className="rp-fol-attn-list">
          {state.attentions.map((a, i) => (
            <li key={a.id} data-tone={a.tone}>
              <span className="rp-fol-attn-idx" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="rp-fol-attn-label">{a.label}</p>
                <p className="rp-fol-attn-money">
                  <strong>{eur(a.amount)}</strong>
                  <span>{a.amountLabel}</span>
                </p>
                <WhyLine why={a.why} />
                <Link href={a.href} className="rp-fol-attn-link">
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rp-fol-verified" aria-label="Verified today">
        <p className="rp-fol-sec-kicker">Verified today</p>
        <p className="rp-fol-verified-amount">
          <strong>{eur(state.verifiedToday)}</strong>
          <span>RADR can prove - not estimates</span>
        </p>
        <Link href="/app/value" className="rp-fol-attn-link">
          Open Verified Value
        </Link>
      </section>

      <p className="rp-fol-footnote">
        RADR prepares the operating picture. Accounting remains the source of
        record. Live contribution is not profit.
      </p>

      <FinanceExplainSheet line={line} onClose={() => setLine(null)} />
    </div>
  );
}
