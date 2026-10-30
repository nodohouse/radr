"use client";

import Link from "next/link";
import {
  formatPaceMoney,
  type ApartmentDayPace,
  type DayPace,
  type GroupDayPace,
  type HotelDayPace,
  type MtdPace,
} from "@/lib/radr/product/revenuePacing";
import type { CombinedDemandContext } from "@/lib/radr/product/externalSignals";
import type { CancellationIntel } from "@/lib/radr/product/externalSignals";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { useFocusRail } from "@/components/product/focus/FocusRail";

function PaceDriverList({
  pace,
  focusPrefix,
}: {
  pace: DayPace;
  focusPrefix: string;
}) {
  const focus = useFocusRail();
  return (
    <div className="rp-pace-drivers">
      <p className="rp-pace-subk">Driven by</p>
      <ul>
        {pace.drivers.map((d) => (
          <li key={d.label} data-tone={d.tone}>
            <button
              type="button"
              className="rp-pace-driver-btn"
              onClick={() =>
                focus.openFocus({
                  id: `${focusPrefix}-${d.label}`,
                  what: d.label,
                  why: pace.radrRead,
                  impact: d.value,
                  status: pace.statusLabel,
                })
              }
            >
              <span>{d.label}</span>
              <strong>{d.value}</strong>
            </button>
          </li>
        ))}
      </ul>
      {pace.offsets.length > 0 ? (
        <>
          <p className="rp-pace-subk">Offset by</p>
          <ul>
            {pace.offsets.map((d) => (
              <li key={d.label} data-tone={d.tone}>
                <button
                  type="button"
                  className="rp-pace-driver-btn"
                  onClick={() =>
                    focus.openFocus({
                      id: `${focusPrefix}-off-${d.label}`,
                      what: d.label,
                      why: pace.radrRead,
                      impact: d.value,
                      status: pace.statusLabel,
                    })
                  }
                >
                  <span>{d.label}</span>
                  <strong>{d.value}</strong>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

/** GM Live revenue pace hero — glanceable. */
export function DayPaceHero({ pace }: { pace: DayPace }) {
  return (
    <section className="rp-pace" aria-label="Revenue pace">
      <header className="rp-pace-head">
        <p className="rp-pace-k">
          Live · {pace.clockLabel}
        </p>
        <p className="rp-pace-status" data-status={pace.status}>
          {pace.statusLabel}
          <em>
            {pace.deltaPctVsExpected >= 0 ? "+" : ""}
            {pace.deltaPctVsExpected}%
          </em>
        </p>
      </header>
      <div className="rp-pace-hero-nums">
        <div>
          <strong>{formatPaceMoney(pace.revenueActualNow)}</strong>
          <span>Revenue so far</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastAtNow)}</strong>
          <span>Expected by now</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastClose)}</strong>
          <span>Expected close</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueBudgetDay)}</strong>
          <span>Daily target</span>
        </div>
      </div>
      <PaceDriverList pace={pace} focusPrefix="day" />
      <p className="rp-pace-read">{pace.radrRead}</p>
    </section>
  );
}

/** Canal House — rooms revenue + readiness pace. */
export function HotelDayPaceHero({ pace }: { pace: HotelDayPace }) {
  return (
    <section className="rp-pace" aria-label="Hotel revenue pace" data-vertical="hotel">
      <header className="rp-pace-head">
        <p className="rp-pace-k">
          Live · {pace.clockLabel}
        </p>
        <p className="rp-pace-status" data-status={pace.status}>
          {pace.statusLabel}
          <em>
            {pace.deltaPctVsExpected >= 0 ? "+" : ""}
            {pace.deltaPctVsExpected}%
          </em>
        </p>
      </header>
      <div className="rp-pace-hero-nums" data-cols="4">
        <div>
          <strong>{formatPaceMoney(pace.revenueActualNow)}</strong>
          <span>Rooms revenue</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastAtNow)}</strong>
          <span>Expected by now</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.adr)}</strong>
          <span>ADR</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revpar)}</strong>
          <span>RevPAR</span>
        </div>
      </div>
      <div className="rp-pace-hero-nums" data-cols="3">
        <div>
          <strong>{pace.occupancyPct}%</strong>
          <span>Occupancy</span>
        </div>
        <div>
          <strong>
            {pace.roomsReady}/{pace.arrivals}
          </strong>
          <span>Ready / arrivals</span>
        </div>
        <div>
          <strong>{pace.roomsAtRisk}</strong>
          <span>At readiness risk</span>
        </div>
      </div>
      <PaceDriverList pace={pace} focusPrefix="hotel" />
      <p className="rp-pace-read">{pace.radrRead}</p>
    </section>
  );
}

/** Chiado — apartment revenue + turnover pace. */
export function ApartmentDayPaceHero({ pace }: { pace: ApartmentDayPace }) {
  return (
    <section
      className="rp-pace"
      aria-label="Apartment revenue pace"
      data-vertical="apartment"
    >
      <header className="rp-pace-head">
        <p className="rp-pace-k">
          Live · {pace.clockLabel}
        </p>
        <p className="rp-pace-status" data-status={pace.status}>
          {pace.statusLabel}
          <em>
            {pace.deltaPctVsExpected >= 0 ? "+" : ""}
            {pace.deltaPctVsExpected}%
          </em>
        </p>
      </header>
      <div className="rp-pace-hero-nums" data-cols="4">
        <div>
          <strong>{formatPaceMoney(pace.revenueActualNow)}</strong>
          <span>Revenue so far</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastClose)}</strong>
          <span>Expected close</span>
        </div>
        <div>
          <strong>{pace.occupancyPct}%</strong>
          <span>Occupancy</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revpar)}</strong>
          <span>RevPAR</span>
        </div>
      </div>
      <div className="rp-pace-hero-nums" data-cols="3">
        <div>
          <strong>{pace.turnovers}</strong>
          <span>Turnovers today</span>
        </div>
        <div>
          <strong>{pace.cleaningBehind}</strong>
          <span>Behind cleaning SLA</span>
        </div>
        <div>
          <strong>{pace.gapNights}</strong>
          <span>Gap nights</span>
        </div>
      </div>
      <PaceDriverList pace={pace} focusPrefix="apt" />
      <p className="rp-pace-read">{pace.radrRead}</p>
    </section>
  );
}

export function MtdPacePanel({ pace }: { pace: MtdPace }) {
  return (
    <section className="rp-pace rp-pace-mtd" aria-label="MTD pacing">
      <header className="rp-pace-head">
        <p className="rp-pace-k">Performance · MTD</p>
        <p className="rp-pace-status" data-status={pace.status}>
          Revenue {pace.revenueDeltaPctVsPlan >= 0 ? "+" : ""}
          {pace.revenueDeltaPctVsPlan}% vs plan
        </p>
      </header>
      <div className="rp-pace-hero-nums" data-cols="3">
        <div>
          <strong>{formatPaceMoney(pace.revenueMTD)}</strong>
          <span>Revenue MTD</span>
          <em>
            Plan {formatPaceMoney(pace.revenueBudgetMTD)}
          </em>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastMonthEnd)}</strong>
          <span>Month-end forecast</span>
          <em>
            Plan {formatPaceMoney(pace.revenueMonthlyPlan)} ·{" "}
            {pace.monthEndDeltaPctVsPlan >= 0 ? "+" : ""}
            {pace.monthEndDeltaPctVsPlan}%
          </em>
        </div>
        <div>
          <strong>{pace.contributionFormatted}</strong>
          <span>Contribution MTD</span>
          <em data-neg={pace.contributionVsPlan < 0 ? "true" : undefined}>
            {pace.contributionDeltaFormatted} vs plan
          </em>
        </div>
      </div>
      <p className="rp-pace-read">{pace.radrRead}</p>
    </section>
  );
}

export function GroupDayPacePanel({ pace }: { pace: GroupDayPace }) {
  return (
    <section className="rp-pace" aria-label="Group revenue today">
      <header className="rp-pace-head">
        <p className="rp-pace-k">Group · Today</p>
        <p className="rp-pace-status" data-status={pace.status}>
          {pace.deltaPct >= 0 ? "+" : ""}
          {pace.deltaPct}% vs expected now
        </p>
      </header>
      <div className="rp-pace-hero-nums" data-cols="4">
        <div>
          <strong>{formatPaceMoney(pace.revenueActual)}</strong>
          <span>Actual</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueExpectedNow)}</strong>
          <span>Expected now</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueForecastClose)}</strong>
          <span>Forecast close</span>
        </div>
        <div>
          <strong>{formatPaceMoney(pace.revenueBudget)}</strong>
          <span>Budget</span>
        </div>
      </div>
      <ul className="rp-pace-locs">
        {pace.locations.map((l) => (
          <li key={l.label}>
            <strong>{l.label}</strong>
            <em>
              {l.revenueDeltaPct >= 0 ? "+" : ""}
              {l.revenueDeltaPct}% revenue
              {l.contributionDeltaPp != null
                ? ` · ${l.contributionDeltaPp >= 0 ? "+" : ""}${l.contributionDeltaPp}pp contribution`
                : ""}
            </em>
            <span>{l.note}</span>
          </li>
        ))}
      </ul>
      <p className="rp-pace-read">{pace.radrRead}</p>
    </section>
  );
}

export function CombinedDemandCard({
  ctx,
}: {
  ctx: CombinedDemandContext;
}) {
  return (
    <section className="rp-demand" aria-label="Tonight's demand">
      <p className="rp-pace-k">{ctx.nightLabel}</p>
      <h3 className="rp-demand-title">Tonight&apos;s demand</h3>
      <ul className="rp-demand-rows">
        <li>
          <span>Bookings</span>
          <strong>
            {ctx.bookingsDeltaPct >= 0 ? "+" : ""}
            {ctx.bookingsDeltaPct}%
          </strong>
        </li>
        <li>
          <span>Concert</span>
          <strong>
            {ctx.eventDeltaPct >= 0 ? "+" : ""}
            {ctx.eventDeltaPct}%
          </strong>
        </li>
        <li>
          <span>Rain / terrace</span>
          <strong>
            {ctx.weatherDeltaPct >= 0 ? "+" : ""}
            {ctx.weatherDeltaPct}%
          </strong>
        </li>
        <li>
          <span>Walk-in forecast</span>
          <strong>+{ctx.walkInForecastCovers} covers</strong>
        </li>
      </ul>
      <p className="rp-demand-net">
        Net expectation ·{" "}
        <strong>
          {ctx.netDemandDeltaPct >= 0 ? "+" : ""}
          {ctx.netDemandDeltaPct}%
        </strong>{" "}
        vs normal Friday
      </p>
      <p className="rp-pace-read">{ctx.implication}</p>
      {ctx.relatedDecisionId ? (
        <Link
          href={`/app/decisions/${ctx.relatedDecisionId}`}
          className="rp-demand-dec"
        >
          {displayDecisionId(ctx.relatedDecisionId)} →
        </Link>
      ) : null}
      <details className="rp-demand-prov">
        <summary>Sources</summary>
        <ul>
          {ctx.signals.map((s) => (
            <li key={s.id}>
              <strong>{s.label}</strong>
              <span>
                {s.source} · {s.confidence} · retrieved{" "}
                {s.retrievedAt.slice(11, 16)}
              </span>
              <em>{s.expectedOperationalEffect}</em>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export function CancellationIntelCard({
  data,
}: {
  data: CancellationIntel;
}) {
  return (
    <section className="rp-cancel" aria-label="Cancellation intelligence">
      <p className="rp-pace-k">Cancellations today</p>
      <div className="rp-cancel-hero">
        <strong>{data.count}</strong>
        <span>cancellations</span>
      </div>
      <ul className="rp-demand-rows">
        <li>
          <span>Covers released</span>
          <strong>{data.coversReleased}</strong>
        </li>
        <li>
          <span>Expected revenue lost</span>
          <strong>{formatDecisionMoney(data.expectedRevenueLost)}</strong>
        </li>
        <li>
          <span>Already recovered</span>
          <strong>{formatDecisionMoney(data.alreadyRecovered)}</strong>
        </li>
        <li data-tone="neg">
          <span>Still exposed</span>
          <strong>{formatDecisionMoney(data.stillExposed)}</strong>
        </li>
      </ul>
      <p className="rp-pace-read">{data.radrRead}</p>
      {data.relatedDecisionId ? (
        <Link
          href={`/app/decisions/${data.relatedDecisionId}`}
          className="rp-demand-dec"
        >
          {displayDecisionId(data.relatedDecisionId)} →
        </Link>
      ) : null}
    </section>
  );
}

/** Horizontal next-60-minutes timeline. */
export function Next60Timeline({
  items,
}: {
  items: {
    at: string;
    label: string;
    detail: string;
    kind?: string;
    decisionId?: string;
    decisionLabel?: string;
  }[];
}) {
  return (
    <section className="rp-n60" aria-label="Next 60 minutes">
      <p className="rp-pace-k">Next 60 minutes</p>
      <ol className="rp-n60-track">
        {items.map((b) => (
          <li key={`${b.at}-${b.label}`} data-kind={b.kind}>
            <time>{b.at}</time>
            <i aria-hidden="true" />
            <div>
              <strong>{b.label}</strong>
              <span>{b.detail}</span>
              {b.decisionLabel && b.decisionId ? (
                <Link
                  href={`/app/decisions/${b.decisionId}`}
                  className="rp-n60-dec"
                >
                  △ {b.decisionLabel}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
