"use client";

import Link from "next/link";
import { MetricExplain } from "@/components/product/MetricExplain";
import { formatAtRiskEuro } from "@/lib/radr/cancellationModel";
import {
  buildLocationTonightPulse,
  type LocationTonightPulse,
} from "@/lib/radr/servicePulse";
import type { TermId } from "@/lib/radr/terminology";
import { TextSep } from "@/components/TextSep";

type Props = { pulse?: LocationTonightPulse };

/** Tonight service board: reservations, waitlist, groups, cancel economics. */
export function TonightServiceBoard({
  pulse = buildLocationTonightPulse(),
}: Props) {
  const econ = pulse.cancellationEconomics;
  const maxCurve = Math.max(...pulse.serviceCurve.map((s) => s.covers), 1);

  return (
    <section className="rp-tonight-board" aria-label="Tonight service pulse">
      <header className="rp-tonight-board-head">
        <div>
          <p className="rp-glance-label">
            Today
            <TextSep />
            Tonight
          </p>
          <h2 className="rp-tonight-board-title">Service pulse</h2>
          <p className="rp-tonight-board-date">{pulse.dateLabel}</p>
        </div>
        <p className="rp-tonight-board-narrative">{pulse.narrative}</p>
      </header>

      <dl className="rp-tonight-board-primary">
        <Stat label="Reservations" metric="reservations" value={pulse.reservations} />
        <Stat label="Booked covers" metric="bookedCovers" value={pulse.bookedCovers} />
        <Stat
          label="Waitlist"
          metric="waitlist"
          value={pulse.waitlistGuests}
          sub={`${pulse.waitlistParties} parties`}
          accent
        />
        <Stat label="Expected covers" metric="forecastCovers" value={pulse.expectedCovers} />
        <Stat
          label="Expected occupancy"
          metric="peakOccupancy"
          value={`${pulse.expectedOccupancyPct}%`}
        />
        <Stat
          label="Expected revenue"
          metric="forecastRevenue"
          value={pulse.expectedRevenueDisplay}
        />
      </dl>

      <div className="rp-tonight-board-secondary">
        <div className="rp-tonight-panel">
          <p className="rp-tonight-panel-label">
            <MetricExplain metric="waitlist">Waitlist</MetricExplain>
          </p>
          <p className="rp-tonight-panel-lead">
            {pulse.waitlistGuests} guests
            <TextSep />
            {pulse.waitlistParties} parties
          </p>
          <ul className="rp-tonight-party-list">
            {pulse.waitlistDetail.map((p) => (
              <li key={p.id}>
                <strong>
                  {p.covers} guests
                  <TextSep />
                  {p.requestedTime}
                </strong>
                <span>
                  waiting {p.waitedMinutes}m
                  {p.seatingPreference ? (
                    <>
                      <TextSep />
                      {p.seatingPreference}
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {pulse.waitlistOpportunity ? (
            <p className="rp-tonight-opportunity">
              Highest opportunity: {pulse.waitlistOpportunity.covers} guests
              <TextSep />
              {pulse.waitlistOpportunity.requestedTime}
              <em>
                Potential{" "}
                {formatAtRiskEuro(
                  Math.round(
                    pulse.waitlistOpportunity.expectedValue *
                      pulse.waitlistOpportunity.convertProbability,
                  ),
                )}
              </em>
            </p>
          ) : null}
        </div>

        <div className="rp-tonight-panel">
          <p className="rp-tonight-panel-label">
            <MetricExplain metric="groupBooking">Group bookings</MetricExplain>
          </p>
          <p className="rp-tonight-panel-lead">
            {pulse.groupBookings} tonight
            <TextSep />
            {formatAtRiskEuro(pulse.groupPotentialEuro)} potential
          </p>
          <ul className="rp-tonight-party-list">
            {pulse.groupArrivals.map((g) => (
              <li key={`${g.time}-${g.covers}`}>
                <strong>
                  {g.covers} guests
                  <TextSep />
                  {g.time}
                </strong>
                <span>{formatAtRiskEuro(g.expectedValue)}</span>
              </li>
            ))}
          </ul>
          <p className="rp-tonight-implication">{pulse.groupImplication}</p>
        </div>

        <div
          className="rp-tonight-panel"
          data-recoverable={econ.mode === "verified_outcome" ? "verified" : econ.recoverableNow ? "true" : "false"}
        >
          {econ.mode === "verified_outcome" ? (
            <>
              <p className="rp-tonight-panel-label">Recently verified</p>
              <p className="rp-tonight-panel-lead">
                {econ.tableLabel}
                <TextSep />
                {formatAtRiskEuro(econ.verifiedValue)} recovered
              </p>
              <dl className="rp-tonight-econ">
                <div>
                  <dt>Potential recovery</dt>
                  <dd>{formatAtRiskEuro(econ.potentialRecovery)}</dd>
                </div>
                <div>
                  <dt>Observed POS</dt>
                  <dd>{formatAtRiskEuro(econ.observedPos)}</dd>
                </div>
                <div data-emphasize="true">
                  <dt>
                    <MetricExplain metric="verifiedValue">
                      Verified value
                    </MetricExplain>
                  </dt>
                  <dd>{formatAtRiskEuro(econ.verifiedValue)}</dd>
                </div>
              </dl>
              <Link
                href={`/app/findings/${econ.findingId}`}
                className="rp-tonight-act"
              >
                {econ.actionLabel}
              </Link>
            </>
          ) : (
            <>
              <p className="rp-tonight-panel-label">
                <MetricExplain metric="lateCancellation">
                  Late cancellation
                </MetricExplain>
              </p>
              <p className="rp-tonight-panel-lead">
                {pulse.cancellations} cancellations
                <TextSep />
                booking value {formatAtRiskEuro(econ.bookingValue)}
              </p>
              <dl className="rp-tonight-econ">
                <div>
                  <dt>
                    <MetricExplain metric="bookingValue">
                      Booking value
                    </MetricExplain>
                  </dt>
                  <dd>{formatAtRiskEuro(econ.bookingValue)}</dd>
                </div>
                <div>
                  <dt>
                    <MetricExplain metric="recoverableValue">
                      Waitlist match
                    </MetricExplain>
                  </dt>
                  <dd>
                    {formatAtRiskEuro(econ.waitlistMatchValue)}
                    {econ.waitlistMatchLabel ? (
                      <em>{econ.waitlistMatchLabel}</em>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt>Natural rebook expected</dt>
                  <dd>{formatAtRiskEuro(econ.naturalRebookExpected)}</dd>
                </div>
                <div data-risk="true">
                  <dt>
                    <MetricExplain metric="revenueAtRisk">
                      Currently at risk
                    </MetricExplain>
                  </dt>
                  <dd>{formatAtRiskEuro(econ.currentlyAtRisk)}</dd>
                </div>
              </dl>
              {econ.recoverableNow ? (
                <Link href="/app/sell" className="rp-tonight-act">
                  {econ.actionLabel}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="rp-tonight-timeline" aria-label="Demand through service">
        <p className="rp-tonight-panel-label">
          Demand
          <TextSep />
          when are we under pressure?
        </p>
        <ol className="rp-tonight-curve">
          {pulse.serviceCurve.map((slot) => {
            const hot =
              slot.time >= "19:00" && slot.time <= "21:00" && slot.covers >= 20;
            return (
              <li key={slot.time} data-hot={hot ? "true" : "false"}>
                <span
                  className="rp-tonight-bar"
                  style={{ height: `${(slot.covers / maxCurve) * 100}%` }}
                />
                <em>{slot.time}</em>
                <TextSep srOnly />
                <b>{slot.covers}</b>
              </li>
            );
          })}
        </ol>
        <p className="rp-tonight-peak-note">
          Peak service {pulse.peakService}
          {pulse.largestParty ? (
            <>
              <TextSep />
              largest party {pulse.largestParty.covers} at{" "}
              {pulse.largestParty.time}
            </>
          ) : null}
          <TextSep />
          no-show risk {pulse.noShowRiskBookings} bookings (
          {formatAtRiskEuro(pulse.noShowRiskEuro)})
        </p>
      </div>

      <p className="rp-tonight-board-foot">
        <Link href="/app/service">Open service map →</Link>
      </p>
    </section>
  );
}

function Stat({
  label,
  metric,
  value,
  sub,
  accent,
}: {
  label: string;
  metric: TermId;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rp-tonight-stat" data-accent={accent ? "true" : undefined}>
      <dt>
        <MetricExplain metric={metric}>{label}</MetricExplain>
      </dt>
      <dd>
        {value}
        {sub ? (
          <>
            <TextSep srOnly>: </TextSep>
            <em>{sub}</em>
          </>
        ) : null}
      </dd>
    </div>
  );
}
