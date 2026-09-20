"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FORWARD_WEEK,
  TONIGHT,
  type DayFinding,
  type ForwardDay,
} from "@/lib/radr/operatingPulse";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { formatAtRiskEuro } from "@/lib/radr/cancellationModel";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { TextSep } from "@/components/TextSep";
import {
  MetricDefinition,
  MetricExplain,
  ExplainedStat,
} from "@/components/product/MetricExplain";
import { ReservationPulse } from "@/components/product/ReservationPulse";

function formatSignedEuro(n: number): string {
  const abs = formatAtRiskEuro(Math.abs(n));
  return n >= 0 ? `+${abs}` : `−${abs}`;
}

function formatSignedPts(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(1)} pts`;
}

/** Tonight: reservations + economic expectation. */
export function TonightStrip({ hideSignal }: { hideSignal?: boolean }) {
  const t = TONIGHT;
  const r = BERLIN_RESERVATION_SUMMARY;
  return (
    <section className="rp-tonight" aria-label="Tonight">
      <header>
        <p className="rp-glance-label">{t.label}</p>
        <p className="rp-tonight-date">{t.dateLabel}</p>
      </header>
      <ReservationPulse />
      <div className="rp-tonight-grid">
        <ExplainedStat
          value={t.expectedRevenueDisplay}
          metric="forecastRevenue"
        />
        <ExplainedStat
          value={`${t.expectedMargin.toFixed(1)}%`}
          metric="forecastMargin"
        />
        <ExplainedStat value={r.forecastCovers} metric="forecastCovers" />
        <ExplainedStat
          value={`${t.expectedOccupancy}%`}
          metric="peakOccupancy"
        />
      </div>
      <p className="rp-tonight-ops">
        {r.groupBookingCount}{" "}
        <MetricExplain metric="groupBooking">groups</MetricExplain>
        {" · "}
        {r.groupCovers} covers
        {" · "}
        {r.cancellationCount} cancellations · {r.cancelledCovers} covers
        {r.lateCancellationCount > 0 ? (
          <>
            {" · "}
            {r.lateCancellationCount}{" "}
            <MetricExplain metric="lateCancellation">
              late cancellation
            </MetricExplain>
          </>
        ) : null}
        {" · "}
        <MetricExplain metric="peakService">Peak</MetricExplain>{" "}
        {r.peakWindowLabel}
      </p>
      <Link href="/app/service" className="rp-tonight-map">
        View service map →
      </Link>
      {!hideSignal ? (
        <Link href="/app/labor" className="rp-tonight-signal">
          <em>{t.signal.territory}</em>
          <strong>{t.signal.title}</strong>
          <span>{t.signal.body}</span>
          <b>
            {t.signal.exposureDisplay} · {t.signal.recommend}
          </b>
        </Link>
      ) : (
        <p className="rp-tonight-ref">
          Staffing risk for tonight is in{" "}
          <a href="#needs-attention">Needs your attention</a>
          {" · "}explained by reservation peak demand.
        </p>
      )}
    </section>
  );
}

function FindingCard({ finding }: { finding: DayFinding }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rp-fwd-finding" data-territory={finding.territory}>
      <header className="rp-fwd-finding-head">
        <p className="rp-fwd-finding-kicker">
          <em>{finding.territory}</em>
          <TextSep />
          {finding.kind}
        </p>
        <p className="rp-fwd-finding-body">{finding.body}</p>
        {finding.recommendLabel ? (
          <p className="rp-fwd-finding-rec">
            <em>Recommended</em>
            <TextSep>: </TextSep>
            <strong>{finding.recommendLabel}</strong>
          </p>
        ) : null}
        {finding.impact ? (
          <p className="rp-fwd-finding-impact">{finding.impact}</p>
        ) : null}
        <div className="rp-fwd-finding-actions">
          <button
            type="button"
            className="rp-fwd-finding-why"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close reading" : "See reading"}
          </button>
          <Link href={finding.href}>{finding.recommend} →</Link>
        </div>
      </header>
      {open ? (
        <div className="rp-fwd-finding-detail">
          <p>
            <em>What RADR found</em>
            {finding.what}
          </p>
          <div>
            <em>Reading</em>
            <ul>
              {finding.why.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {finding.impact ? (
            <p>
              <em>Impact</em>
              {finding.impact}
            </p>
          ) : null}
          <p>
            <em>Action</em>
            {finding.recommend}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function DayMetric({
  value,
  metric,
  label,
  compare,
  note,
  onInspect,
}: {
  value: string;
  metric: Parameters<typeof MetricExplain>[0]["metric"];
  label: string;
  compare?: string;
  note?: string;
  onInspect?: () => void;
}) {
  return (
    <div className="rp-fwd-metric">
      <button
        type="button"
        className="rp-fwd-metric-value"
        onClick={onInspect}
        disabled={!onInspect}
        data-inspect={onInspect ? "true" : undefined}
      >
        {value}
      </button>
      <MetricExplain metric={metric}>{label}</MetricExplain>
      {compare ? <p className="rp-fwd-metric-cmp">{compare}</p> : null}
      {note ? <p className="rp-fwd-metric-note">{note}</p> : null}
    </div>
  );
}

function DayDetail({ day, onClose }: { day: ForwardDay; onClose: () => void }) {
  const c = day.cancellations;
  const ctx = day.context;
  const [showProvenance, setShowProvenance] = useState(false);
  const expectedRebooked = c
    ? Math.max(0, c.grossBookingValue - c.expectedUnrecovered)
    : 0;

  return (
    <div className="rp-fwd-detail" role="dialog" aria-label={day.fullLabel}>
      <header>
        <div>
          <p className="rp-fwd-detail-kicker">{day.dow}</p>
          <h3>{day.fullLabel}</h3>
        </div>
        <button type="button" className="rp-btn rp-btn-ghost" onClick={onClose}>
          Close
        </button>
      </header>

      {day.summary ? (
        <div className="rp-fwd-summary">
          <p className="rp-fwd-summary-headline">{day.summary.headline}</p>
          <p className="rp-fwd-summary-body">{day.summary.body}</p>
        </div>
      ) : null}

      <div className="rp-fwd-metrics">
        <DayMetric
          value={String(day.covers)}
          metric="expectedCovers"
          label="Expected covers"
          compare={
            ctx?.coversVsTypical
              ? `${ctx.coversVsTypical.delta >= 0 ? "+" : ""}${ctx.coversVsTypical.delta} ${ctx.coversVsTypical.label}`
              : undefined
          }
          note={
            ctx?.coversVsPlanPct != null
              ? `${ctx.coversVsPlanPct >= 0 ? "+" : ""}${ctx.coversVsPlanPct}% vs plan`
              : undefined
          }
        />
        <DayMetric
          value={formatCompactEuro(day.revenue)}
          metric="forecastRevenue"
          label="Forecast revenue"
          compare={
            ctx?.revenueVsTypical
              ? `${formatSignedEuro(ctx.revenueVsTypical.deltaEuro)} ${ctx.revenueVsTypical.label}`
              : undefined
          }
          note={
            ctx?.revenueVsPlanPct != null
              ? `${ctx.revenueVsPlanPct >= 0 ? "+" : ""}${ctx.revenueVsPlanPct}% vs plan · Current bookings + expected demand`
              : "Current bookings + expected demand"
          }
          onInspect={() => setShowProvenance((v) => !v)}
        />
        <DayMetric
          value={`${day.margin.toFixed(1)}%`}
          metric="forecastMargin"
          label="Forecast operating margin"
          compare={
            ctx?.marginVsPlanPts != null
              ? `${formatSignedPts(ctx.marginVsPlanPts)} vs plan`
              : undefined
          }
        />
        {day.confidence ? (
          <DayMetric
            value={day.confidence}
            metric="forecastConfidence"
            label="Forecast confidence"
            note={ctx?.confidenceWhy}
          />
        ) : null}
      </div>

      {showProvenance && day.revenueBreakdown ? (
        <div className="rp-fwd-provenance">
          <MetricDefinition
            metric="forecastRevenue"
            valueDisplay={formatCompactEuro(day.revenue)}
          />
          <dl className="rp-fwd-provenance-grid">
            <div>
              <dt>Currently booked</dt>
              <dd>{formatCompactEuro(day.revenueBreakdown.currentlyBooked)}</dd>
            </div>
            <div>
              <dt>Expected additional bookings</dt>
              <dd>
                {formatCompactEuro(day.revenueBreakdown.expectedAdditional)}
              </dd>
            </div>
            <div>
              <dt>Expected walk-ins</dt>
              <dd>{formatCompactEuro(day.revenueBreakdown.expectedWalkIns)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatCompactEuro(day.revenue)}</dd>
            </div>
          </dl>
          <p className="rp-fwd-provenance-signals">
            Data signals · {day.revenueBreakdown.signals.join(" · ")}
          </p>
        </div>
      ) : null}

      {day.drivers?.length ? (
        <ul className="rp-fwd-drivers" aria-label="What is moving">
          {day.drivers.map((d) => (
            <li key={d.label} data-dir={d.direction}>
              <span>{d.label}</span>
              <em>
                {d.direction === "up"
                  ? "↑"
                  : d.direction === "down"
                    ? "↓"
                    : d.direction === "event"
                      ? "▲"
                      : "-"}
              </em>
            </li>
          ))}
        </ul>
      ) : null}

      {c ? (
        <div className="rp-fwd-cancel" data-lead={c.leadClass}>
          <p className="rp-fwd-cancel-label">Cancellations</p>
          <div className="rp-fwd-cancel-hero">
            <p>
              <strong>{c.reservations}</strong>
              <MetricExplain metric="cancelledReservations">
                Cancelled reservations
              </MetricExplain>
            </p>
            <p className="rp-fwd-cancel-covers">{c.covers} covers affected</p>
          </div>
          <dl className="rp-fwd-cancel-money">
            <div>
              <dt>
                <MetricExplain metric="bookingValueAffected">
                  Booking value affected
                </MetricExplain>
              </dt>
              <dd>{formatAtRiskEuro(c.grossBookingValue)}</dd>
            </div>
            <div>
              <dt>Expected to be rebooked</dt>
              <dd>{formatAtRiskEuro(expectedRebooked)}</dd>
            </div>
            <div>
              <dt>
                <MetricExplain metric="revenueAtRisk">
                  Revenue currently at risk
                </MetricExplain>
              </dt>
              <dd data-risk="true">
                {formatAtRiskEuro(c.expectedUnrecovered)}
              </dd>
            </div>
          </dl>
          <p className="rp-fwd-cancel-note">
            RADR estimates how much cancelled booking value is likely to remain
            unrecovered after expected replacement demand. Not verified value.
          </p>
        </div>
      ) : null}

      {day.findings?.length
        ? day.findings.map((f) => (
            <FindingCard key={f.territory + f.kind} finding={f} />
          ))
        : day.signal && day.signal.kind !== "plan" ? (
            <p className="rp-fwd-signal-copy">
              <em>
                {day.signal.territory ??
                  (day.signal.kind === "staffing" ? "LABOR" : "SELL")}
              </em>
              {day.signal.detail}
            </p>
          ) : null}
    </div>
  );
}

function dayHoverTitle(d: ForwardDay): string {
  const lines = [
    d.fullLabel,
    `${formatCompactEuro(d.revenue)} forecast revenue`,
    `${d.covers} expected covers`,
  ];
  if (d.context?.revenueVsPlanPct != null) {
    lines.push(
      `${d.context.revenueVsPlanPct >= 0 ? "+" : ""}${d.context.revenueVsPlanPct}% vs plan`,
    );
  }
  if (d.signal && d.signal.kind !== "plan") {
    lines.push(d.signal.label);
  }
  return lines.join("\n");
}

/** Next 7 days: intelligence calendar, not seven KPI cards. */
export function ForwardWeek() {
  const [open, setOpen] = useState<string | null>(null);
  const selected = FORWARD_WEEK.find((d) => d.key === open) ?? null;
  const revenues = FORWARD_WEEK.map((d) => d.revenue);
  const max = Math.max(...revenues);
  const min = Math.min(...revenues);
  const span = Math.max(max - min, 1);

  return (
    <section className="rp-fwd" aria-label="Next 7 days">
      <header className="rp-fwd-head">
        <div>
          <p className="rp-glance-label">Next 7 days</p>
          <p className="rp-fwd-sub">
            Revenue forecast + operational outlook
          </p>
        </div>
        <Link href="/app/forecast">Forecast →</Link>
      </header>
      <ol className="rp-fwd-bar">
        {FORWARD_WEEK.map((d) => {
          const kind = d.signal?.kind ?? "none";
          const isPlan = kind === "plan" || kind === "none";
          /* Restrained proportional height within the week range */
          const heightPct = Math.round(34 + ((d.revenue - min) / span) * 66);
          return (
            <li key={d.key}>
              <button
                type="button"
                className="rp-fwd-day"
                data-active={open === d.key ? "true" : "false"}
                data-signal={kind}
                title={dayHoverTitle(d)}
                onClick={() => setOpen(open === d.key ? null : d.key)}
              >
                <em>{d.dow}</em>
                <span className="rp-fwd-col-track" aria-hidden="true">
                  <span
                    className="rp-fwd-col"
                    style={{ height: `${heightPct}%` }}
                  />
                </span>
                <strong>{d.revenueDisplay}</strong>
                {d.signal && !isPlan ? (
                  <i data-kind={d.signal.kind}>{d.signal.label}</i>
                ) : d.signal?.kind === "plan" ? (
                  <i data-kind="plan">On plan</i>
                ) : (
                  <i data-kind="none"> </i>
                )}
                {d.secondary ? (
                  <b className="rp-fwd-secondary">{d.secondary}</b>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
      {selected ? (
        <DayDetail day={selected} onClose={() => setOpen(null)} />
      ) : null}
    </section>
  );
}
