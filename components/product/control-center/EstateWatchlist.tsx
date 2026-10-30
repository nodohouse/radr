"use client";

/**
 * Estate Watchlist — location attention rows on Control Center.
 * Same PilotLocationPulse economics · no new seeded data.
 */

import Link from "next/link";
import type { PilotLocationPulse } from "@/lib/radr/product/demoOperatingPulse";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

function issueFor(loc: PilotLocationPulse): string {
  if (loc.needsYouCount > 0) {
    const contribWeak = loc.contributionActual < loc.contributionPlan;
    if (contribWeak) return "Contribution below plan";
    return "Needs judgment";
  }
  if (loc.activeExposure > 800) return "Channel / mix pressure";
  if (loc.contributionActual < loc.contributionPlan) return "Menu mix shift";
  return "On track";
}

export function EstateWatchlist({
  locations,
  onReview,
}: {
  locations: PilotLocationPulse[];
  onReview?: (id: string) => void;
}) {
  const rows = [...locations]
    .filter((l) => l.needsYouCount > 0 || l.activeExposure > 400)
    .sort((a, b) => b.activeExposure - a.activeExposure)
    .slice(0, 3);

  if (rows.length === 0) {
    return (
      <p className="rp-ns-watch-empty">No estate exceptions above threshold.</p>
    );
  }

  return (
    <ul className="rp-ns-watch" aria-label="Estate watchlist">
      {rows.map((loc) => {
        const name = loc.label.split("·")[0]?.trim() ?? loc.label;
        const state =
          loc.needsYouCount > 0
            ? "Needs decision"
            : loc.activeExposure > 500
              ? "Watching"
              : "On track";
        return (
          <li key={loc.locationId}>
            <div className="rp-ns-watch-main">
              <strong>{name}</strong>
              <span className="rp-ns-watch-issue">{issueFor(loc)}</span>
            </div>
            <span className="rp-ns-watch-exp">
              {formatDecisionMoney(loc.activeExposure)}
            </span>
            <span
              className="rp-ns-watch-state"
              data-tone={loc.needsYouCount > 0 ? "need" : "watch"}
            >
              {state}
            </span>
            {onReview ? (
              <button
                type="button"
                className="rp-ns-watch-act"
                onClick={() => onReview(loc.locationId)}
              >
                Review →
              </button>
            ) : (
              <Link
                href={`/app/locations/${loc.locationId}`}
                className="rp-ns-watch-act"
              >
                Review →
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
