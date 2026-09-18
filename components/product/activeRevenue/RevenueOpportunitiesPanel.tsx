"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/radr/money";
import type {
  ActiveRevenueBrief,
  CancellationOpportunity,
} from "@/lib/radr/activeRevenue";
import {
  materialRecoveries,
  openRecoveries,
  portfolioLiveLabel,
  portfolioRecoveryRollup,
  recoveryAltitudeForRole,
} from "@/lib/radr/activeRevenue";
import { WhyLine } from "@/components/product/WhyLine";
import { RecoveryDrawer } from "./RecoveryDrawer";
import { LiveRecoveryFeed } from "./LiveRecoveryFeed";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

function recoveryKicker(r: CancellationOpportunity): string {
  if (r.status === "VERIFIED" || r.status === "REBOOKED") return "Recovered";
  if (r.status === "EXPIRED") return "Expired";
  if (r.trigger === "NO_SHOW") return "No-show";
  return "Cancelled";
}

function strategyLabel(r: CancellationOpportunity): string {
  switch (r.recommendedStrategy) {
    case "WAITLIST":
      return r.trigger === "NO_SHOW" ? "Release table now" : "Offer waitlist now";
    case "WALK_IN_HOLD":
      return "Hold for walk-ins";
    case "SOCIAL":
      return "Social recovery";
    default:
      return r.recommendedStrategy.replace(/_/g, " ").toLowerCase();
  }
}

type Props = {
  brief: ActiveRevenueBrief;
  roleView?: string;
  onClose?: () => void;
  /** Optional: open a specific recovery immediately */
  initialOpportunityId?: string;
};

/**
 * Revenue Opportunities - Recover + Grow in one calm surface.
 * Floor altitude: tables. Portfolio altitude: economics only.
 */
export function RevenueOpportunitiesPanel({
  brief,
  roleView,
  onClose,
  initialOpportunityId,
}: Props) {
  const open = openRecoveries(brief);
  const material = materialRecoveries(brief);
  const verified = brief.recoveries.filter((r) => r.status === "VERIFIED");
  const altitude = recoveryAltitudeForRole(roleView);
  const portfolio = altitude === "portfolio";
  const host = roleView === "host" || roleView === "server";
  const rollup = portfolioRecoveryRollup(brief);

  const [drawerId, setDrawerId] = useState<string | null>(
    portfolio ? null : (initialOpportunityId ?? null),
  );
  const drawerOpp =
    !portfolio && brief.recoveries.find((r) => r.id === drawerId)
      ? brief.recoveries.find((r) => r.id === drawerId)!
      : null;

  const portfolioEvents = brief.liveEvents.map((e) => ({
    ...e,
    label: portfolioLiveLabel(e),
    opportunityId: undefined,
  }));

  return (
    <div className="rp-ari-panel" role="dialog" aria-label="Revenue opportunities">
      <div
        className="rp-ari-panel-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="rp-ari-panel-card">
        <header className="rp-ari-panel-head">
          <div>
            <p className="rp-ari-kicker">
              {portfolio ? "Recovery economics" : "Live revenue recovery"}
            </p>
            <h2 className="rp-ari-title">
              {eur(brief.rollup.tonightPotential)}
              <span>potential tonight</span>
            </h2>
            <p className="rp-ari-meta">
              {portfolio
                ? `${rollup.openCount} open · ${eur(rollup.atRisk)} at risk · floor handles tables`
                : `${brief.rollup.recoveryCount} recover${
                    brief.rollup.recoveryCount === 1 ? "y" : "ies"
                  } · ${brief.rollup.guestOpportunityCount} guest opportunit${
                    brief.rollup.guestOpportunityCount === 1 ? "y" : "ies"
                  }`}
            </p>
          </div>
          {onClose ? (
            <button type="button" className="rp-btn-secondary" onClick={onClose}>
              Close
            </button>
          ) : null}
        </header>

        {portfolio ? (
          <LiveRecoveryFeed events={portfolioEvents} />
        ) : (
          <LiveRecoveryFeed
            events={brief.liveEvents}
            onSelect={(id) => setDrawerId(id)}
          />
        )}

        {portfolio ? (
          <section className="rp-ari-month" aria-label="This month">
            <p className="rp-ari-kicker">This month</p>
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
                  {brief.rollup.monthRecoveryRatePct.toFixed(1).replace(".", ",")}
                  %
                </strong>
              </li>
              <li>
                <span>Social recovered</span>
                <strong>{eur(brief.socialRoi.verifiedRecoveredRevenue)}</strong>
              </li>
              <li data-signal="true">
                <span>Combined verified</span>
                <strong>{eur(brief.rollup.monthCombinedVerified)}</strong>
              </li>
            </ul>
          </section>
        ) : null}

        <section className="rp-ari-recover" aria-label="Recover">
          <header className="rp-ari-sec-head">
            <p className="rp-ari-kicker">Recover</p>
            <p className="rp-ari-sec-title">
              {portfolio
                ? `${eur(rollup.atRisk)} recoverable · ${rollup.openCount} open`
                : `${material.length} table${material.length === 1 ? "" : "s"} to recover`}
            </p>
          </header>

          {portfolio ? (
            <ul className="rp-ari-month-grid">
              <li>
                <span>At risk tonight</span>
                <strong>{eur(rollup.atRisk)}</strong>
              </li>
              <li>
                <span>Verified today</span>
                <strong>{eur(rollup.verifiedValue)}</strong>
              </li>
              <li>
                <span>Open / verified</span>
                <strong>
                  {rollup.openCount} / {rollup.verifiedCount}
                </strong>
              </li>
              <li data-signal="true">
                <span>Guest contribution upside</span>
                <strong>{eur(rollup.guestContrib)}</strong>
              </li>
            </ul>
          ) : (
            <ul className="rp-ari-list">
              {open.map((r) => (
                <li key={r.id} data-status={r.status} data-trigger={r.trigger}>
                  <p className="rp-ari-row-kicker">
                    {recoveryKicker(r)} · {r.reservationTime}
                  </p>
                  <p className="rp-ari-row-title">
                    {r.tableLabel} · {r.partySize} guests
                    {r.recommendedStrategy === "WALK_IN_HOLD"
                      ? " · hold for walk-ins"
                      : ""}
                    {r.minutesLate != null && r.minutesLate > 0
                      ? ` · ${r.minutesLate} min late`
                      : ""}
                  </p>
                  <p className="rp-ari-row-money">
                    <strong>
                      {eur(
                        r.remainingRevenueExposure || r.originalExpectedRevenue,
                      )}
                    </strong>
                    <span>expected revenue at risk</span>
                    {r.minutesToService > 0 ? (
                      <em>{r.minutesToService} min to service</em>
                    ) : null}
                  </p>
                  {r.waitlistMatches.length > 0 ? (
                    <p className="rp-ari-row-match">
                      {r.waitlistMatches.length} waitlist match
                      {r.waitlistMatches.length === 1 ? "" : "es"}
                      {r.waitlistMatches[0]
                        ? ` · best ${r.waitlistMatches[0].acceptanceProbabilityPct}%`
                        : ""}
                    </p>
                  ) : null}
                  <WhyLine why={r.strategyWhy[0]} />
                  <p className="rp-ari-row-rec">
                    RADR recommends: {strategyLabel(r)}
                    {r.plan.socialEscalation
                      ? " · social ready if unfilled"
                      : ""}
                    {r.requiresApproval ? " · approval required" : ""}
                  </p>
                  {host ? (
                    <button
                      type="button"
                      className="rp-ari-link"
                      onClick={() => setDrawerId(r.id)}
                    >
                      {r.recommendedStrategy === "WAITLIST" ? "Offer" : "Recover"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rp-ari-link"
                      onClick={() => setDrawerId(r.id)}
                    >
                      Recover
                    </button>
                  )}
                </li>
              ))}
              {verified.map((r) => (
                <li key={r.id} data-status="VERIFIED">
                  <p className="rp-ari-row-kicker">
                    Recovered · {r.reservationTime} · {r.tableLabel}
                  </p>
                  <p className="rp-ari-row-title">
                    Rebooked
                    {r.recoveredInMinutes != null
                      ? ` in ${r.recoveredInMinutes} min`
                      : ""}
                  </p>
                  <p className="rp-ari-row-money">
                    <strong>{eur(r.verifiedRecoveredValue ?? 0)}</strong>
                    <span>verified</span>
                  </p>
                  <Link href={r.actionHref} className="rp-ari-link">
                    Open Verified Value
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!host && !portfolio ? (
          <>
            <section className="rp-ari-grow" aria-label="Grow">
              <header className="rp-ari-sec-head">
                <p className="rp-ari-kicker">Grow</p>
                <p className="rp-ari-sec-title">
                  {brief.guestOpportunities.length} relevant table suggestion
                  {brief.guestOpportunities.length === 1 ? "" : "s"}
                </p>
              </header>
              <WhyLine why="One suggestion per table - relevance before margin" />
              <ul className="rp-ari-list">
                {brief.guestOpportunities.map((g) => (
                  <li key={g.id}>
                    <p className="rp-ari-row-kicker">
                      {g.tableLabel}
                      {g.occasionLabel ? ` · ${g.occasionLabel}` : ""}
                      {g.returningGuest ? " · Returning" : ""}
                    </p>
                    <p className="rp-ari-row-title">{g.suggestion}</p>
                    <p className="rp-ari-row-money">
                      <strong>
                        {eur(g.expectedIncrementalContribution)}
                      </strong>
                      <span>expected contribution</span>
                      <em>{g.timingLabel}</em>
                    </p>
                    <WhyLine why={g.reason.join(" · ")} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="rp-ari-foh" aria-label="FOH brief">
              <p className="rp-ari-kicker">FOH brief</p>
              <ul className="rp-ari-foh-list">
                {brief.fohPrompts.slice(0, 4).map((g) => (
                  <li key={g.id}>
                    <strong>{g.tableLabel}</strong>
                    <span>
                      {g.occasionLabel ??
                        (g.returningGuest ? "Returning" : "Guest")}
                    </span>
                    <em>→ {g.suggestion}</em>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {portfolio ? (
          <p className="rp-ari-footnote">
            Table assignments stay with the floor. This view is contribution,
            exposure, and verified recovery only.
          </p>
        ) : (
          <p className="rp-ari-footnote">
            See it · understand value · choose the path · approve once. Social
            only escalates. Never spam.
          </p>
        )}
      </div>

      {drawerOpp ? (
        <RecoveryDrawer
          opportunity={drawerOpp}
          onClose={() => setDrawerId(null)}
        />
      ) : null}
    </div>
  );
}
