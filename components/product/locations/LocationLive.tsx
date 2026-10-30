"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { LocationIntel } from "@/lib/radr/location/composeLocationIntel";
import { VerticalDayScene } from "@/components/product/locations/VerticalDayScene";
import { verticalDayFor } from "@/lib/radr/product/verticalDay";

function money(n: number) {
  return formatDecisionMoney(n);
}

export function LocationLive({ intel }: { intel: LocationIntel }) {
  const day = verticalDayFor(intel.resolved.id);
  const hotel = intel.resolved.vertical === "hotel";

  if (!intel.open && !hotel) {
    return (
      <section className="rp-loc-live-closed" aria-label="Service closed">
        <p className="rp-cc-kicker">Live</p>
        <h2>Last service complete</h2>
        <dl className="rp-loc-ops-dl">
          <div>
            <dt>Last outcome</dt>
            <dd>
              {money(intel.economics.contribution)} contribution ·{" "}
              {intel.statement.line}
            </dd>
          </div>
          <div>
            <dt>Next service</dt>
            <dd>Dinner forecast on plan · watch Friday delivery band</dd>
          </div>
          <div>
            <dt>Open Decisions</dt>
            <dd>
              {intel.economics.needsYou > 0
                ? `${intel.economics.needsYou} waiting`
                : "None"}
            </dd>
          </div>
        </dl>
        <Link href={`?tab=performance`} className="rp-loc-learn-cta">
          Replay last service patterns →
        </Link>
      </section>
    );
  }

  return (
    <div className="rp-loc-live">
      <header className="rp-loc-live-head">
        <p className="rp-cc-kicker">
          {hotel ? "Live · arrivals → tonight" : "Live · now → +60m"}
        </p>
        <h2>
          {hotel
            ? "What is happening at the property now"
            : "What is happening inside the operation now"}
        </h2>
        <p className="rp-cc-since">
          Not historical performance —{" "}
          {hotel
            ? "check-in / readiness operating state."
            : "minute-scale operating state."}
        </p>
      </header>
      {day ? <VerticalDayScene day={day} /> : null}
      <ul className="rp-loc-live-horizon" aria-label="Live horizon">
        {(hotel
          ? ["NOW", "+30m", "+2h", "TONIGHT", "TOMORROW"]
          : ["NOW", "+15m", "+30m", "+60m", "REST OF SERVICE"]
        ).map((h) => (
          <li key={h} data-now={h === "NOW" ? "true" : undefined}>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
