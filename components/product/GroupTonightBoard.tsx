"use client";

import Link from "next/link";
import { MetricExplain } from "@/components/product/MetricExplain";
import { formatAtRiskEuro } from "@/lib/radr/cancellationModel";
import {
  buildGroupTonightPulse,
  type GroupTonightPulse,
} from "@/lib/radr/servicePulse";

type Props = {
  atRiskEuro: number;
  pulse?: GroupTonightPulse;
};

/** Group / all-locations tonight board. */
export function GroupTonightBoard({ atRiskEuro, pulse }: Props) {
  const g = pulse ?? buildGroupTonightPulse(atRiskEuro);

  return (
    <section
      className="rp-tonight-board rp-tonight-board-group"
      aria-label="Group today"
    >
      <header className="rp-tonight-board-head">
        <div>
          <p className="rp-glance-label">Today · Group</p>
          <h2 className="rp-tonight-board-title">{g.locationCount} locations</h2>
        </div>
        <p className="rp-tonight-board-narrative">
          {g.concentrationNarrative}
        </p>
      </header>

      <dl className="rp-tonight-board-primary">
        <div className="rp-tonight-stat">
          <dt>
            <MetricExplain metric="forecastRevenue">
              Expected revenue
            </MetricExplain>
          </dt>
          <dd>{g.expectedRevenueDisplay}</dd>
        </div>
        <div className="rp-tonight-stat">
          <dt>
            <MetricExplain metric="forecastCovers">Expected covers</MetricExplain>
          </dt>
          <dd>{g.expectedCovers.toLocaleString("en-GB")}</dd>
        </div>
        <div className="rp-tonight-stat">
          <dt>
            <MetricExplain metric="peakOccupancy">
              Expected occupancy
            </MetricExplain>
          </dt>
          <dd>{g.expectedOccupancyPct}%</dd>
        </div>
        <div className="rp-tonight-stat" data-accent="true">
          <dt>
            <MetricExplain metric="revenueAtRisk">Value at risk</MetricExplain>
          </dt>
          <dd>{formatAtRiskEuro(g.valueAtRiskEuro)}</dd>
        </div>
      </dl>

      <div className="rp-tonight-board-secondary">
        <div className="rp-tonight-panel">
          <p className="rp-tonight-panel-label">Locations needing attention</p>
          <p className="rp-tonight-panel-lead">
            {g.locationsNeedingAttention}
          </p>
          <ul className="rp-tonight-party-list">
            {g.hotLocations.map((loc) => (
              <li key={loc.id}>
                <strong>{loc.name}</strong>
                <span>
                  {formatAtRiskEuro(loc.atRiskEuro)} · {loc.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rp-tonight-panel">
          <p className="rp-tonight-panel-label">
            <MetricExplain metric="waitlist">Waitlist demand</MetricExplain>
          </p>
          <p className="rp-tonight-panel-lead">
            {g.waitlistGuests} guests across {g.waitlistLocations} locations
          </p>
          <p className="rp-tonight-implication">
            {g.groupBookings} group bookings · {g.lateCancellations} late
            cancellations
          </p>
        </div>
      </div>

      <p className="rp-tonight-board-foot">
        <Link href="/app/locations">Review locations →</Link>
      </p>
    </section>
  );
}
