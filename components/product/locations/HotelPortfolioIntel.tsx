"use client";

/**
 * Hotel portfolio intelligence — seasonal, events, Coming Up, DNA strip.
 */

import Link from "next/link";
import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  bookingPaceForProperty,
  comingUpForProperty,
  eventSensitivityMatrix,
  getHotelDemandBundle,
  hotelEstateTransfers,
  hotelScorecardFromEconomics,
  metricValue,
  type HotelScoreMetric,
  type HotelPropertyScorecard,
} from "@/lib/radr/product/hotelDemandIntelligence";
import type { LocationEconomics } from "@/lib/radr/product/portfolioEconomics";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import {
  PortfolioExposureField,
  portfolioShortLabel,
} from "@/components/product/locations/PortfolioExposureField";

function money(n: number) {
  return formatDecisionMoney(n);
}

const METRIC_OPTS: { id: HotelScoreMetric; label: string }[] = [
  { id: "contribution", label: "Contribution" },
  { id: "revpar", label: "RevPAR" },
  { id: "adr", label: "ADR" },
  { id: "occupancy", label: "Occupancy" },
  { id: "net_revpar", label: "Net RevPAR" },
  { id: "direct_share", label: "Direct share" },
  { id: "revenue", label: "Room revenue" },
];

function toCards(locations: LocationEconomics[]): HotelPropertyScorecard[] {
  return locations.map((l) =>
    hotelScorecardFromEconomics({
      locationId: l.locationId,
      label: l.label,
      revenue: l.revenue,
      contribution: l.contribution,
      contributionPlan: l.contributionPlan,
      occupancyPct: l.occupancyPct ?? 0,
      adr: l.adr ?? 0,
      revpar: l.revpar ?? 0,
      directSharePct: l.directSharePct ?? 0,
      otaSharePct:
        "otaPct" in l.channelMix
          ? (l.channelMix as { otaPct: number }).otaPct
          : 32,
      channelFees: l.channelFees ?? 0,
      cancellations: l.cancellations ?? 0,
      readinessMisses: l.readinessMisses ?? 0,
      verified: l.verified,
      exposure: l.exposure,
    }),
  );
}

function HotelMetricMatrix({
  cards,
  metric,
}: {
  cards: HotelPropertyScorecard[];
  metric: HotelScoreMetric;
}) {
  const values = cards.map((c) => metricValue(c, metric));
  const mean =
    values.reduce((s, v) => s + v, 0) / Math.max(1, values.length);
  const baseline =
    metric === "occupancy" || metric === "direct_share" ? 75 : mean;
  const metricLabel =
    METRIC_OPTS.find((m) => m.id === metric)?.label ?? metric;

  const points = cards.map((c) => {
    const v = metricValue(c, metric);
    const state =
      c.exposure > 2000
        ? ("needs" as const)
        : c.readinessMisses > 3
          ? ("warn" as const)
          : ("ok" as const);
    const formatted =
      metric === "occupancy" || metric === "direct_share"
        ? `${v}%`
        : metric === "adr" || metric === "revpar" || metric === "net_revpar"
          ? `€${v}`
          : money(v);
    return {
      id: c.locationId,
      href: `/app/locations/${c.locationId}`,
      label: c.label,
      shortLabel: portfolioShortLabel(c.label),
      xValue: v - baseline,
      exposure: c.exposure,
      sizeValue: c.roomRevenue,
      state,
      detail: `${metricLabel} ${formatted} · vs expectation ${
        c.vsExpectationPct >= 0 ? "+" : ""
      }${c.vsExpectationPct}%`,
    };
  });

  return (
    <PortfolioExposureField
      embedded
      points={points}
      xAxisLabel={`${metricLabel} vs expectation →`}
      yAxisLabel="Active exposure ↑"
      legendHint="Bubble size · room revenue"
    />
  );
}

function SeasonalStrip({ locationId }: { locationId: string }) {
  const bundle = getHotelDemandBundle(locationId);
  if (!bundle) return null;
  const max = Math.max(
    ...bundle.fingerprint.flatMap((m) => [
      m.baseline,
      m.currentYear,
      m.priorYear,
    ]),
  );
  return (
    <section className="rp-htl-finger" aria-label="Seasonal fingerprint">
      <header>
        <p className="rp-cc-kicker">Seasonal fingerprint</p>
        <h3>Occupancy · baseline vs this year</h3>
      </header>
      <div className="rp-htl-finger-chart" role="img" aria-label="Monthly occupancy">
        {bundle.fingerprint.map((m) => (
          <div key={m.month} className="rp-htl-finger-col">
            <div className="rp-htl-finger-bars">
              <span
                className="rp-htl-finger-base"
                style={{ height: `${(m.baseline / max) * 100}%` }}
                title={`Baseline ${m.baseline}`}
              />
              <span
                className="rp-htl-finger-cur"
                style={{ height: `${(m.currentYear / max) * 100}%` }}
                title={`This year ${m.currentYear}`}
                data-ahead={m.currentYear > m.baseline + 1.5 ? "true" : undefined}
                data-behind={m.currentYear < m.baseline - 1.5 ? "true" : undefined}
              />
            </div>
            <em>{m.label}</em>
          </div>
        ))}
      </div>
      <ul className="rp-htl-peaks">
        {bundle.peaks.slice(0, 3).map((p) => (
          <li key={p.label} data-kind={p.kind}>
            <strong>{p.label}</strong>
            <span>{p.detail}</span>
          </li>
        ))}
      </ul>
      {bundle.peakExplanation ? (
        <p className="rp-htl-peak-why">{bundle.peakExplanation}</p>
      ) : null}
    </section>
  );
}

function ComingUpPanel({ locationIds }: { locationIds: string[] }) {
  const items = locationIds.flatMap((id) => comingUpForProperty(id)).slice(0, 4);
  if (items.length === 0) return null;
  return (
    <section className="rp-htl-coming" aria-label="Coming up">
      <header>
        <p className="rp-cc-kicker">Demand context</p>
        <h2>Coming up</h2>
        <p>Material events only — suppressed noise stays out.</p>
      </header>
      <ul>
        {items.map((c) => (
          <li key={`${c.locationId}-${c.eventId}`} data-needs={c.needsDecision ? "true" : undefined}>
            <p className="rp-htl-coming-title">
              <strong>{c.name}</strong>
              <em>{c.daysAway}d</em>
            </p>
            <p className="rp-htl-coming-meta">
              Historical · +{c.historicalPickupPct}% pickup · +€{c.historicalAdrEuro}{" "}
              ADR · direct +{c.historicalDirectPp}pp
            </p>
            <p className="rp-htl-coming-pace" data-tone={c.paceVsCurvePct < 0 ? "neg" : "pos"}>
              Current pace {c.paceVsCurvePct >= 0 ? "+" : ""}
              {c.paceVsCurvePct}% vs comparable event curve
            </p>
            {c.decisionHint ? (
              <p className="rp-htl-coming-dec">{c.decisionHint}</p>
            ) : null}
            {c.needsDecision ? (
              <ul className="rp-htl-futures">
                {c.futures.slice(0, 4).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : null}
            {c.relatedDecisionId ? (
              <Link href={`/app/decisions/${c.relatedDecisionId}`}>
                Open Decision →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function HotelLearnEstate() {
  const transfers = hotelEstateTransfers();
  return (
    <section className="rp-loc-learn" aria-label="Learn from the hotel estate">
      <header>
        <p className="rp-cc-kicker">Estate learning</p>
        <h2>Learn from the estate</h2>
        <p>
          Transferable practices with comparable pickup — not blind best-property
          copying.
        </p>
      </header>
      <ul className="rp-loc-learn-list">
        {transfers.map((t) => (
          <li key={t.id} data-verdict={t.verdict}>
            <p className="rp-loc-learn-pair">
              <strong>
                {locationDisplayName(t.sourceLocationId)}
              </strong>
              <span aria-hidden="true">→</span>
              <strong>
                {locationDisplayName(t.targetLocationId)}
              </strong>
              <em data-verdict={t.verdict}>
                {t.verdict.replace(/_/g, " ")}
              </em>
            </p>
            <p className="rp-loc-learn-pattern">{t.pattern}</p>
            <p className="rp-loc-learn-ctx">{t.context}</p>
            <p className="rp-loc-learn-effect">
              {t.observedEffect}
              {t.expectedMonthlyEuro > 0 ? (
                <>
                  {" "}
                  · Potential{" "}
                  <strong>+{money(t.expectedMonthlyEuro)}</strong>
                </>
              ) : null}
            </p>
            {t.verdict !== "NOT_COMPARABLE" ? (
              <Link href={t.compareHref} className="rp-loc-learn-cta">
                Compare Futures →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HotelPortfolioIntel({
  locations,
}: {
  locations: LocationEconomics[];
}) {
  const [metric, setMetric] = useState<HotelScoreMetric>("contribution");
  const cards = toCards(locations);
  const flagship =
    locations.find((l) => l.locationId === "loc_canal_house")?.locationId ??
    locations[0]?.locationId;

  if (locations.length === 0) return null;

  return (
    <div className="rp-htl-intel">
      <section className="rp-loc-matrix" aria-label="Hotel performance matrix">
        <header className="rp-loc-matrix-head">
          <div>
            <p className="rp-cc-kicker">Portfolio</p>
            <h2>Performance × exposure</h2>
          </div>
          <div className="rp-htl-metric-switch" role="group" aria-label="Matrix metric">
            {METRIC_OPTS.map((m) => (
              <button
                key={m.id}
                type="button"
                data-active={metric === m.id ? "true" : undefined}
                onClick={() => setMetric(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>
        {locations.length >= 5 ? (
          <HotelMetricMatrix cards={cards} metric={metric} />
        ) : (
          <ol className="rp-loc-rank-list">
            {[...cards]
              .sort((a, b) => metricValue(b, metric) - metricValue(a, metric))
              .map((c) => (
                <li key={c.locationId}>
                  <Link href={`/app/locations/${c.locationId}`}>
                    <strong>{c.label}</strong>
                    <span>
                      {metric === "occupancy" || metric === "direct_share"
                        ? `${metricValue(c, metric)}%`
                        : metric === "adr" ||
                            metric === "revpar" ||
                            metric === "net_revpar"
                          ? `€${metricValue(c, metric)}`
                          : money(metricValue(c, metric))}
                    </span>
                    <em>
                      {c.vsExpectationPct >= 0 ? "+" : ""}
                      {c.vsExpectationPct}% vs expectation
                    </em>
                  </Link>
                </li>
              ))}
          </ol>
        )}
        <ul className="rp-loc-matrix-keys">
          <li data-state="needs">Needs you</li>
          <li data-state="ok">Healthy</li>
          <li data-state="warn">Readiness watch</li>
        </ul>
      </section>

      {flagship ? <SeasonalStrip locationId={flagship} /> : null}

      <ComingUpPanel locationIds={locations.map((l) => l.locationId)} />

      <HotelLearnEstate />

      {flagship === "loc_canal_house" ? (
        <section className="rp-htl-sens" aria-label="Event sensitivity">
          <header>
            <p className="rp-cc-kicker">Event sensitivity</p>
            <h3>Same event · different properties</h3>
            <p>
              ADE pickup response — not a group-wide assumption.
            </p>
          </header>
          <ul>
            {eventSensitivityMatrix("evt_ade_2026").map((r) => (
              <li key={r.locationId}>
                <strong>{r.label}</strong>
                <span data-tone={r.pickupPct >= 10 ? "pos" : undefined}>
                  {r.pickupPct >= 0 ? "+" : ""}
                  {r.pickupPct}% pickup
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function HotelPropertyDemandPanel({
  locationId,
}: {
  locationId: string;
}) {
  const bundle = getHotelDemandBundle(locationId);
  const pace = bookingPaceForProperty(locationId);
  if (!bundle) return null;

  const maxPace = Math.max(
    ...pace.points.flatMap((p) => [p.current, p.comparable, p.forecast]),
    1,
  );

  return (
    <div className="rp-htl-prop-demand">
      <SeasonalStrip locationId={locationId} />

      <section className="rp-htl-dna" aria-label="Property demand DNA">
        <p className="rp-cc-kicker">Property DNA</p>
        <h3>Demand profile</h3>
        <dl>
          <div>
            <dt>Strongest</dt>
            <dd>{bundle.dna.strongest}</dd>
          </div>
          <div>
            <dt>Booking window</dt>
            <dd>
              {bundle.dna.bookingWindowDays[0]}–{bundle.dna.bookingWindowDays[1]}{" "}
              days
            </dd>
          </div>
          <div>
            <dt>Event sensitivity</dt>
            <dd>{bundle.dna.eventSensitivity}</dd>
          </div>
          <div>
            <dt>Direct propensity</dt>
            <dd>{bundle.dna.directPropensity}</dd>
          </div>
          <div>
            <dt>Corporate weekday</dt>
            <dd>{bundle.dna.corporateWeekday}</dd>
          </div>
          <div>
            <dt>Cancellation</dt>
            <dd>{bundle.dna.cancellationNote}</dd>
          </div>
        </dl>
      </section>

      <section className="rp-htl-pace" aria-label="Booking pace">
        <p className="rp-cc-kicker">Booking pace</p>
        <h3>{pace.arrivalLabel}</h3>
        <p className="rp-htl-pace-read">{pace.radrRead}</p>
        <div className="rp-htl-pace-chart" role="img">
          {pace.points.map((p) => (
            <div key={p.daysBeforeArrival} className="rp-htl-pace-col">
              <span
                className="rp-htl-pace-cur"
                style={{ height: `${(p.current / maxPace) * 100}%` }}
                title={`D−${p.daysBeforeArrival}: ${p.current} current`}
              />
              <span
                className="rp-htl-pace-cmp"
                style={{ height: `${(p.comparable / maxPace) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <p className="rp-htl-pace-legend">
          Solid · current · ghost · comparable ·{" "}
          {pace.deltaPctVsComparable >= 0 ? "+" : ""}
          {pace.deltaPctVsComparable}% vs comparable
        </p>
      </section>

      {bundle.attributions.length > 0 ? (
        <section className="rp-htl-attr" aria-label="Event attribution">
          <p className="rp-cc-kicker">Event attribution</p>
          {bundle.attributions.map((a) => (
            <article key={a.eventId}>
              <p className="rp-htl-attr-kind" data-kind={a.evidenceKind}>
                {a.evidenceKind} · {a.confidence}
              </p>
              <p>
                Baseline {a.baselineOccPct}% occ
                {a.observedOccPct > 0
                  ? ` → observed ${a.observedOccPct}%`
                  : ""}
                · ADR +€{a.adrUpliftEuro} · pickup +{a.pickupUpliftPct}% ·
                direct +{a.directSharePp}pp
              </p>
              <p>
                Estimated event-associated uplift{" "}
                <strong>{money(a.estimatedUpliftEuro)}</strong> room
                contribution · explains {a.upliftRangePp[0]}–{a.upliftRangePp[1]}
                pp of uplift
              </p>
              <p className="rp-htl-attr-why">{a.explanation}</p>
            </article>
          ))}
        </section>
      ) : null}

      <ComingUpPanel locationIds={[locationId]} />
    </div>
  );
}
