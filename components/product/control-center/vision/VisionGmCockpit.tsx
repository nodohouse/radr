"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { BusinessPulse } from "@/lib/radr/product/businessPulse";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import {
  BERLIN_GM_LIVE_STATE,
  BERLIN_GM_NEEDS_YOU,
  D1911_CC_DECISION,
  D1911_WHY_NOW,
  deriveRestaurantGmConclusion,
  formatEuro,
  formatLaborDelta,
  formatSignedPct,
} from "@/lib/radr/product/restaurantGmControlCenterCanon";
import {
  decisionsNeedsYouHref,
  intelligenceHref,
  valueHref,
} from "@/lib/product/radrContext/navigateWithContext";
import { OperatingPulseLandscape } from "../OperatingPulseLandscape";

type Props = {
  pulse: BusinessPulse;
  needsYou: NeedsYouRow[];
  verifiedFormatted: string;
  onSelectDecision: (id: string) => void;
};

const KPI_ICONS: Record<string, ReactNode> = {
  Contribution: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <circle cx="9" cy="14" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 18.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Covers: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 18c.8-2.4 2.6-3.6 4.5-3.6S13 15.6 13.8 18M13 14.6c1.1-.5 2.3-.6 3.5.1 1.3.8 2.1 2.1 2.5 3.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "Avg Check": (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M7 4.5h7.2L19 9.3V19a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 4.8V9h4.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Labor: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M4 16.5 9.2 10l3.4 3.2L20 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 7h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Reservations: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function SummaryArrow() {
  return <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function VisionGmCockpit({
  pulse: _pulse,
  needsYou,
  verifiedFormatted,
  onSelectDecision,
}: Props) {
  const state = BERLIN_GM_LIVE_STATE;
  const conclusion = useMemo(() => deriveRestaurantGmConclusion(state), [state]);
  const decision = D1911_CC_DECISION;
  const [whyOpen, setWhyOpen] = useState(false);

  const kpis = [
    {
      label: "Contribution",
      value: formatEuro(state.contributionEuro),
      delta: formatSignedPct(state.contributionDeltaPct),
      tone: "pos" as const,
    },
    {
      label: "Covers",
      value: String(state.covers),
      delta: formatSignedPct(state.coversDeltaPct),
      tone: "pos" as const,
    },
    {
      label: "Avg Check",
      value: formatEuro(state.avgCheckEuro),
      delta: formatSignedPct(state.avgCheckDeltaPct),
      tone: "pos" as const,
    },
    {
      label: "Labor",
      value: `${state.laborPct}%`,
      delta: formatLaborDelta(state.laborDeltaPp),
      tone: "pos" as const,
    },
    {
      label: "Reservations",
      value: String(state.reservationsBooked),
      delta: `${state.bookedCapacityPct}% booked capacity`,
      sub: `${state.walkIns} walk-ins expected`,
      tone: "muted" as const,
    },
  ];

  void needsYou;
  const needsFiltered = BERLIN_GM_NEEDS_YOU;
  const verifiedValue = verifiedFormatted || "€3,793";

  return (
    <div
      className="rv-cc rv-cc-gm"
      data-persona="gm"
      data-location={state.locationId}
      data-premium="true"
      data-testid="restaurant-gm-cc"
    >
      <div className="rv-cc-atmosphere" aria-hidden />

      <div className="rv-cc-main">
        <header className="rv-cc-head">
          <p className="rv-cc-eyebrow">Control Center</p>
          <h1 className="rv-display">Your Control Center<span className="tx-heading-dot">.</span></h1>
          <p className="px-intro">Here’s what needs your attention today.</p>
          <p className="rv-cc-context">
            {state.servicePeriod} · LIVE {state.clockLabel}
            <span className="rv-cc-weather"> · {state.weather}</span>
          </p>
        </header>

        <div className="tx-summary-grid">
        <Link href={decisionsNeedsYouHref()} className="tx-summary tx-summary-attention">
          <span className="tx-summary-label"><i />Needs your judgment</span>
          <strong>{needsFiltered.length.toString().padStart(2, "0")}</strong>
          <p>Decisions ready for your review</p>
          <small>See decisions <SummaryArrow /></small>
        </Link>
        <Link
          href={intelligenceHref({ lens: "sell" })}
          className="rv-tonight rv-tonight-card"
          data-testid="gm-cc-hero-revenue"
        >
          <div className="rv-tonight-top">
            <span className="rv-label">
              <i className="rv-tonight-ico" aria-hidden />
              Tonight Revenue
            </span>
            <span className="rv-tonight-status" data-status={state.status}>
              ● On track
            </span>
          </div>
          <strong className="rv-num">{formatEuro(state.revenueEuro)}</strong>
          <span className="rv-delta">↑ +{state.revenueDeltaPct.toFixed(1)}% vs plan</span>
          <small className="tx-revenue-link">See performance <SummaryArrow /></small>
        </Link>

        <Link href={valueHref()} className="tx-summary tx-summary-verified" data-testid="gm-cc-verified">
          <span className="tx-summary-label"><i />Verified value · MTD</span>
          <strong>{verifiedValue}</strong>
          <p>Evidence behind every outcome</p>
          <small>Explore value <SummaryArrow /></small>
        </Link>
        </div>

        <div
          className="rv-metric-band rv-metric-band-compact rv-metric-card"
          role="list"
        >
          {kpis.map((m) => (
            <article key={m.label} className="rv-metric" role="listitem">
              <span className="rv-metric-ico" aria-hidden>
                {KPI_ICONS[m.label]}
              </span>
              <span className="rv-label">{m.label}</span>
              <strong className="rv-num">{m.value}</strong>
              <em data-tone={m.tone}>{m.delta}</em>
              {"sub" in m && m.sub ? (
                <span className="rv-metric-sub">{m.sub}</span>
              ) : null}
            </article>
          ))}
        </div>

        <p
          className="rv-editorial"
          data-block="conclusion"
          data-testid="gm-cc-conclusion"
        >
          <span className="rv-editorial-signal">{conclusion.lead}</span>
          <br />
          {conclusion.trail}
        </p>

        <section
          className="rv-panel rv-pulse rv-pulse-flagship"
          aria-label="Operating pulse"
        >
          <div className="rv-panel-head">
            <h2>Operating Pulse</h2>
            <span className="rv-label">
              Covers, revenue and contribution through service
            </span>
          </div>
          <OperatingPulseLandscape
            onMarkerClick={() => onSelectDecision(decision.id)}
            onConstraintClick={() => onSelectDecision(decision.id)}
          />
        </section>
      </div>

      <aside className="rv-rail" aria-label="Intelligence">
        <div className="rv-rail-block" data-block="active-decision">
          <div className="rv-decision-head">
            <p className="rv-label">
              <span className="rv-rail-ico" aria-hidden>
                ✦
              </span>{" "}
              RADR Decision
            </p>
            <span className="rv-decision-chip">{decision.displayId}</span>
          </div>
          <div className="rv-decision-card" data-testid="gm-cc-decision">
            <h3>{decision.action}</h3>
            <p>{decision.supporting}</p>
            <div className="rv-decision-metrics">
              <div>
                <span className="rv-label">Expected value</span>
                <strong>{formatEuro(decision.expectedEuro)}</strong>
              </div>
              <div>
                <span className="rv-label">Confidence</span>
                <strong>{decision.confidencePct}%</strong>
              </div>
              <div data-deadline="true">
                <span className="rv-label">Decide by</span>
                <strong>{decision.deadlineLabel}</strong>
              </div>
            </div>
            <div className="rv-decision-actions">
              <button
                type="button"
                className="rv-btn"
                data-primary="true"
                data-testid="gm-cc-review-decision"
                onClick={() => onSelectDecision(decision.id)}
              >
                Review Decision →
              </button>
              <button
                type="button"
                className="rv-btn rv-btn-secondary"
                data-testid="gm-cc-why-now"
                onClick={() => setWhyOpen((v) => !v)}
                aria-expanded={whyOpen}
              >
                Why now
              </button>
            </div>
            {whyOpen ? (
              <dl className="rv-why-now" data-testid="gm-cc-why-panel">
                <div>
                  <dt>Kitchen load</dt>
                  <dd>{D1911_WHY_NOW.kitchenLoadNowPct}% now</dd>
                </div>
                <div>
                  <dt>Forecast peak</dt>
                  <dd>
                    {D1911_WHY_NOW.forecastPeakPct}% at{" "}
                    {D1911_WHY_NOW.forecastPeakTime}
                  </dd>
                </div>
                <div>
                  <dt>Inbound covers next 22m</dt>
                  <dd>{D1911_WHY_NOW.inboundCoversNext22m}</dd>
                </div>
                <div>
                  <dt>Average ticket</dt>
                  <dd>{D1911_WHY_NOW.averageTicketMin}m</dd>
                </div>
                <div>
                  <dt>Table-turn pressure</dt>
                  <dd>{D1911_WHY_NOW.tableTurnPressure}</dd>
                </div>
                <div>
                  <dt>If unchanged</dt>
                  <dd>{D1911_WHY_NOW.expectedIfUnchanged}</dd>
                </div>
                <div className="rv-why-evidence">
                  <dt>Evidence</dt>
                  <dd>{D1911_WHY_NOW.evidence.join(" · ")}</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </div>

        <div className="rv-rail-block rv-need-card">
          <div className="rv-need-head">
            <p className="rv-label">Needs you</p>
            <Link
              href={decisionsNeedsYouHref()}
              className="rv-link"
              data-testid="gm-cc-needs-you-view-all"
            >
              View all →
            </Link>
          </div>
          <ul className="rv-need-list" data-testid="gm-cc-needs-you">
            {needsFiltered.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  data-sev={row.severity}
                  onClick={() => onSelectDecision(row.decisionId)}
                >
                  <span className="rv-status" data-sev={row.severity}>
                    <i />
                  </span>
                  <span className="rv-need-copy">
                    <strong>{row.title}</strong>
                    <span>{row.meta}</span>
                  </span>
                  <span className="rv-need-chev" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <section className="tx-evidence-card" aria-label="Decision evidence">
          <p className="rv-label">The evidence behind the decision</p>
          <h3>Connected. Considered.</h3>
          <p>Cross-system signals, brought into one operating picture.</p>
          <div className="tx-source-chips">{D1911_WHY_NOW.evidence.map(source => <span key={source}>{source}</span>)}</div>
          <Link href="/app/connections">Review connections <SummaryArrow /></Link>
        </section>
      </aside>
    </div>
  );
}
