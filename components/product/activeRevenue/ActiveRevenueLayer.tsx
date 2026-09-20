"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import type { ActiveRevenueBrief } from "@/lib/radr/activeRevenue";
import { WhyLine } from "@/components/product/WhyLine";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

type Props = {
  brief: ActiveRevenueBrief;
  roleView?: string;
};

/**
 * Page-depth Active Revenue layer for Sell / Recover destinations.
 */
export function ActiveRevenueLayer({ brief, roleView }: Props) {
  const finance =
    roleView === "cfo" ||
    roleView === "owner" ||
    roleView === "finance" ||
    roleView === "coo";

  return (
    <div className="rp-ari" data-tour-target="active-revenue">
      <header className="rp-ari-hero">
        <p className="rp-ari-kicker">Active revenue</p>
        <p className="rp-ari-hero-title">
          {eur(brief.rollup.tonightPotential)}
          <span>potential tonight · recover + grow</span>
        </p>
        <WhyLine why="Perishable inventory with relevance - not a sales quota" />
      </header>

      {finance ? (
        <section className="rp-ari-month" aria-label="Monthly performance">
          <p className="rp-ari-kicker">Active revenue · this month</p>
          <ul className="rp-ari-month-grid">
            <li>
              <span>Cancellation at risk</span>
              <strong>{eur(brief.rollup.monthCancellationAtRisk)}</strong>
            </li>
            <li>
              <span>Recovered</span>
              <strong>{eur(brief.rollup.monthCancellationRecovered)}</strong>
            </li>
            <li>
              <span>Recovery rate</span>
              <strong>
                {brief.rollup.monthRecoveryRatePct.toFixed(1).replace(".", ",")}%
              </strong>
            </li>
            <li data-signal="true">
              <span>Combined verified</span>
              <strong>{eur(brief.rollup.monthCombinedVerified)}</strong>
            </li>
          </ul>
        </section>
      ) : null}

      <section aria-label="Channel performance">
        <p className="rp-ari-kicker">Recovery channels</p>
        <ul className="rp-ari-perf">
          {brief.channelPerformance.map((c) => (
            <li key={c.channel}>
              <span>{c.label}</span>
              <strong>{c.fillRatePct}% fill</strong>
              <em>{eur(c.verifiedRevenue)} verified</em>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Social recovery ROI">
        <p className="rp-ari-kicker">Social recovery · this month</p>
        <ul className="rp-ari-month-grid">
          <li>
            <span>Posts</span>
            <strong>{brief.socialRoi.posts}</strong>
          </li>
          <li>
            <span>Tables filled</span>
            <strong>{brief.socialRoi.tablesFilled}</strong>
          </li>
          <li>
            <span>Fill rate</span>
            <strong>
              {brief.socialRoi.recoveryRatePct.toFixed(1).replace(".", ",")}%
            </strong>
          </li>
          <li data-signal="true">
            <span>Verified revenue</span>
            <strong>{eur(brief.socialRoi.verifiedRecoveredRevenue)}</strong>
          </li>
          <li>
            <span>Top template</span>
            <strong>{brief.socialRoi.topTemplate}</strong>
          </li>
        </ul>
        <WhyLine why="Optimize on rebooking and contribution - likes don’t pay the night" />
      </section>

      <section aria-label="Guest opportunity performance">
        <p className="rp-ari-kicker">Guest opportunities</p>
        <ul className="rp-ari-perf">
          {brief.opportunityPerformance.map((o) => (
            <li key={o.opportunityType}>
              <span>{o.label}</span>
              <strong>
                {o.accepted}/{o.offered} accepted
              </strong>
              <em>{eur(o.verifiedIncrementalContribution)} verified</em>
            </li>
          ))}
        </ul>
        <WhyLine why="Acceptance without relevance is just noise - contribution decides" />
      </section>

      <p className="rp-ari-links">
        <Link href="/app/recover">Recover</Link>
        <Link href="/app/value">Verified Value</Link>
        <Link href="/app">Control Center</Link>
      </p>
    </div>
  );
}
