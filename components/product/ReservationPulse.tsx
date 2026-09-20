"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ExplainedStat,
  MetricExplain,
} from "@/components/product/MetricExplain";
import { RADR_MOTION } from "@/lib/radr/motion";
import { formatAtRiskEuro } from "@/lib/radr/cancellationModel";
import { formatSignedPct } from "@/lib/product/demo/command";
import type { ReservationSummary } from "@/lib/radr/reservationModel";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { TextSep } from "@/components/TextSep";

function ReservationDrawer({
  summary,
  onClose,
}: {
  summary: ReservationSummary;
  onClose: () => void;
}) {
  const titleId = useId();
  return (
    <motion.div
      className="rp-drawer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={RADR_MOTION.tooltip}
    >
      <button
        type="button"
        className="rp-drawer-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <motion.aside
        className="rp-drawer-panel rp-attn-drawer rp-res-drawer"
        role="dialog"
        aria-labelledby={titleId}
        initial={{ x: 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 24, opacity: 0 }}
        transition={RADR_MOTION.panel}
      >
        <header>
          <div>
            <p className="rp-res-drawer-kicker">Reservation pulse</p>
            <h2 id={titleId}>Tonight</h2>
            <p className="rp-attn-drawer-when">{summary.dateLabel}</p>
          </div>
          <button type="button" className="rp-btn rp-btn-ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <dl className="rp-res-stat-grid">
          <div>
            <dt>
              <MetricExplain metric="reservations">Reservations</MetricExplain>
            </dt>
            <dd>{summary.reservationCount}</dd>
          </div>
          <div>
            <dt>
              <MetricExplain metric="bookedCovers">Booked covers</MetricExplain>
            </dt>
            <dd>{summary.bookedCovers}</dd>
          </div>
          <div>
            <dt>Expected additional</dt>
            <dd>{summary.expectedAdditionalCovers}</dd>
          </div>
          <div>
            <dt>Forecast total</dt>
            <dd>{summary.forecastCovers}</dd>
          </div>
          <div>
            <dt>Expected occupancy</dt>
            <dd>{summary.expectedOccupancy}%</dd>
          </div>
        </dl>
        <p className="rp-res-note">
          Booked covers are confirmed guests. Expected additional covers are
          modeled walk-ins and remaining booking demand, not currently reserved.
        </p>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Booking mix</p>
          <dl className="rp-attn-why">
            {summary.bookingMix.map((b) => (
              <div key={b.key}>
                <dt>{b.label}</dt>
                <dd>
                  {b.count}
                  <span className="rp-res-muted">
                    <TextSep />
                    {b.covers} covers
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Service peak</p>
          <p className="rp-res-peak-line">
            <strong>{summary.peakWindowLabel}</strong>
            <TextSep />
            <span>{summary.peakCovers} expected covers</span>
          </p>
          <dl className="rp-attn-why">
            <div>
              <dt>Current staffing capacity</dt>
              <dd>{summary.peakCapacity}</dd>
            </div>
            <div>
              <dt>Capacity gap</dt>
              <dd>{summary.peakGap}</dd>
            </div>
            <div>
              <dt>Service pressure</dt>
              <dd data-pressure={summary.servicePressure}>
                {summary.servicePressure}
              </dd>
            </div>
          </dl>
          {summary.peakGap > 0 ? (
            <p className="rp-res-note">
              Peak demand feeds the LABOR staffing finding in{" "}
              <a href="#needs-attention" onClick={onClose}>
                Needs your attention
              </a>
              . Not a separate alert.
            </p>
          ) : null}
        </section>

        {summary.groupBookingCount > 0 ? (
          <section className="rp-attn-block">
            <p className="rp-attn-block-label">Group bookings</p>
            <p>
              {summary.groupBookingCount} groups
              <TextSep />
              {summary.groupCovers} covers
              <TextSep />
              {formatAtRiskEuro(summary.groupExpectedValue)} expected booking
              value
            </p>
            {summary.largestGroup ? (
              <p className="rp-res-note">
                Largest: {summary.largestGroup.covers} covers
                <TextSep />
                {summary.largestGroup.time}
              </p>
            ) : null}
            {summary.groupArrivals.length ? (
              <dl className="rp-attn-why">
                {summary.groupArrivals.map((g) => (
                  <div key={g.time + g.covers}>
                    <dt>{g.time}</dt>
                    <dd>{g.covers} covers</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ) : null}

        {summary.specialSummary.length ? (
          <section className="rp-attn-block">
            <p className="rp-attn-block-label">Special bookings tonight</p>
            <ul className="rp-res-special">
              {summary.specialSummary.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Cancellations</p>
          <p>
            {summary.cancellationCount} reservations
            <TextSep />
            {summary.cancelledCovers} covers released
          </p>
          <dl className="rp-attn-money">
            <div>
              <dt>
                <MetricExplain metric="bookingValueAffected">
                  Booking value affected
                </MetricExplain>
              </dt>
              <dd>{formatAtRiskEuro(summary.cancelledBookingValue)}</dd>
            </div>
            <div>
              <dt>Expected to be naturally rebooked</dt>
              <dd>{formatAtRiskEuro(summary.expectedRecoveredValue)}</dd>
            </div>
            <div>
              <dt>
                <MetricExplain metric="revenueAtRisk">
                  Revenue currently at risk
                </MetricExplain>
              </dt>
              <dd data-risk="true">
                {formatAtRiskEuro(summary.revenueAtRisk)}
              </dd>
            </div>
          </dl>
          {summary.lateCancellationCount > 0 ? (
            <p className="rp-res-note">
              Late cancellations: {summary.lateCancellationCount}
              <TextSep />
              {summary.lateCancelledCovers} covers
              <TextSep />
              {formatAtRiskEuro(summary.lateExposedValue)} currently exposed
            </p>
          ) : null}
          <p className="rp-res-note">
            Cancelled booking value is not automatically lost. SELL finding
            carries the action.
          </p>
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Booking pace</p>
          <dl className="rp-attn-why">
            <div>
              <dt>Vs comparable Wednesday</dt>
              <dd>{formatSignedPct(summary.bookingPaceVsComparable)}</dd>
            </div>
            <div>
              <dt>Vs forecast</dt>
              <dd>{formatSignedPct(summary.bookingPaceVsForecast)}</dd>
            </div>
            <div>
              <dt>Of expected final demand booked</dt>
              <dd>{summary.pctOfFinalDemandBooked}%</dd>
            </div>
          </dl>
        </section>

        {summary.concentrationPct >= 15 ? (
          <section className="rp-attn-block">
            <p className="rp-attn-block-label">Booking concentration</p>
            <p>
              {summary.concentrationPct}% of tonight&apos;s booked revenue is in{" "}
              {summary.concentrationTopCount} reservations (
              {formatAtRiskEuro(summary.concentrationValue)}).
            </p>
            <p className="rp-res-note">
              Surfaced for awareness, not a separate attention alert unless
              material cancellation risk appears.
            </p>
          </section>
        ) : null}

        <p className="rp-res-demo">
          Simulated reservation intelligence
          <TextSep />
          Demo
        </p>
      </motion.aside>
    </motion.div>
  );
}

type Props = {
  summary?: ReservationSummary;
};

/**
 * Compact reservation intelligence: Overview / Tonight.
 * Progressive disclosure into Reservation Pulse drawer.
 */
export function ReservationPulse({
  summary = BERLIN_RESERVATION_SUMMARY,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="rp-res-pulse">
        <header className="rp-res-pulse-head">
          <p className="rp-glance-label">
            Tonight
            <TextSep />
            Reservations
          </p>
          <button
            type="button"
            className="rp-res-pulse-open"
            onClick={() => setOpen(true)}
          >
            View reservation pulse →
          </button>
        </header>

        <div className="rp-res-pulse-grid">
          <ExplainedStat
            value={summary.reservationCount}
            metric="reservations"
          />
          <ExplainedStat
            value={summary.bookedCovers}
            metric="bookedCovers"
          />
          <ExplainedStat
            value={summary.forecastCovers}
            metric="forecastCovers"
          />
          <ExplainedStat
            value={`${summary.expectedOccupancy}%`}
            metric="peakOccupancy"
          />
          <ExplainedStat
            value={formatSignedPct(summary.bookingPaceVsComparable)}
            metric="bookingPace"
            valueClassName="rp-cc-pos"
          />
        </div>

        <p className="rp-res-pulse-line">
          <span>
            {summary.groupBookingCount}{" "}
            <MetricExplain metric="groupBooking">group bookings</MetricExplain>
            <TextSep />
            {summary.groupCovers} covers
          </span>
          <span>
            <MetricExplain metric="peakService">Peak</MetricExplain>{" "}
            {summary.peakWindowLabel}
            <TextSep />
            {summary.peakCovers} covers
            <TextSep />
            <MetricExplain metric="servicePressure">
              {summary.servicePressure} pressure
            </MetricExplain>
            {summary.peakGap > 0 ? (
              <>
                <TextSep />+{summary.peakGap} vs capacity
              </>
            ) : null}
          </span>
          <span>
            {summary.cancellationCount} cancellations
            <TextSep />
            {formatAtRiskEuro(summary.revenueAtRisk)}{" "}
            <MetricExplain metric="revenueAtRisk">
              revenue currently at risk
            </MetricExplain>
          </span>
        </p>
        <p className="rp-res-pulse-map">
          <Link href="/app/service">View service map →</Link>
        </p>
      </div>

      <AnimatePresence>
        {open ? (
          <ReservationDrawer summary={summary} onClose={() => setOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
