"use client";

/**
 * Dev-only visual QA board — REFERENCE vs IMPLEMENTATION.
 * Gate: do not mark a screen complete without side-by-side review.
 */

import { useMemo, useState } from "react";
import { isSyntheticData, getRadrEnvironment } from "@/lib/radr/env";

const PAIRS = [
  {
    id: "shell",
    label: "AppShell (all routes)",
    phase: "A",
    reference: "/docs-static/references/07-settings.png",
    note: "Canonical rail from Settings mockup",
    current: "/visual-static/current/settings.png",
  },
  {
    id: "gm",
    label: "GM Control Center",
    phase: "B",
    reference: "/docs-static/references/02-gm-control-center.jpg",
    current: "/visual-static/current/cc-gm-restaurant.png",
  },
  {
    id: "cfo",
    label: "CFO Control Center",
    phase: "C",
    reference: "/docs-static/references/01-cfo-control-center.jpg",
    current: "/visual-static/current/cc-cfo-restaurant.png",
  },
  {
    id: "ops",
    label: "Operations",
    phase: "D",
    reference: "/docs-static/references/10-operations.png",
    current: "/visual-static/current/operations.png",
  },
  {
    id: "boh",
    label: "Back of House",
    phase: "E",
    reference: "/docs-static/references/11-back-of-house.png",
    current: "/visual-static/current/house.png",
  },
  {
    id: "venue",
    label: "Live Venue",
    phase: "F",
    reference: "/docs-static/references/05-live-venue.jpg",
    current: "/visual-static/current/live-venue-restaurant.png",
  },
  {
    id: "estate",
    label: "Live Estate",
    phase: "G",
    reference: "/docs-static/references/04-live-estate.jpg",
    current: "/visual-static/current/live-estate-restaurant.png",
  },
  {
    id: "guests",
    label: "Guest Intelligence",
    phase: "H",
    reference: "/docs-static/references/09-guest-intelligence.png",
    current: "/visual-static/current/guests.png",
  },
  {
    id: "pace",
    label: "Hotel Pace",
    phase: "I",
    reference: "/docs-static/references/03-hotel-revenue-pace.jpg",
    current: "/visual-static/current/cc-revenue-hotel.png",
  },
  {
    id: "hotel-ops",
    label: "Hotel Operations",
    phase: "J",
    reference: "/docs-static/references/06-hotel-ops-housekeeping.jpg",
    current: "/visual-static/current/live-hotel-ops.png",
  },
  {
    id: "reports",
    label: "Reports",
    phase: "K",
    reference: "/docs-static/references/08-reports.png",
    current: "/visual-static/current/reports.png",
  },
  {
    id: "settings",
    label: "Settings",
    phase: "L",
    reference: "/docs-static/references/07-settings.png",
    current: "/visual-static/current/settings.png",
  },
] as const;

export default function DesignReviewPage() {
  const allowed = useMemo(
    () =>
      process.env.NODE_ENV !== "production" || isSyntheticData(getRadrEnvironment()),
    [],
  );
  const [active, setActive] = useState<(typeof PAIRS)[number]["id"]>("shell");
  const pair = PAIRS.find((p) => p.id === active) ?? PAIRS[0]!;

  if (!allowed) {
    return (
      <div className="rv-page">
        <h1 className="rv-display">Design review</h1>
        <p>Available in development / synthetic environments only.</p>
      </div>
    );
  }

  return (
    <div className="rv-page" data-page="design-review">
      <header className="rv-page-head">
        <p className="rv-label">Visual QA · Phase gate</p>
        <h1 className="rv-display">Design review</h1>
        <p>
          Side-by-side REFERENCE vs CURRENT implementation. Do not advance phases
          until silhouette, density, rail, and typography match.
        </p>
      </header>

      <div className="rv-design-tabs" role="tablist" aria-label="Screens">
        {PAIRS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active === p.id}
            data-active={active === p.id ? "true" : undefined}
            onClick={() => setActive(p.id)}
          >
            <em>{p.phase}</em> {p.label}
          </button>
        ))}
      </div>

      <div className="rv-design-pair">
        <figure>
          <figcaption>REFERENCE · Phase {pair.phase}</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pair.reference} alt={`${pair.label} reference`} />
        </figure>
        <figure>
          <figcaption>IMPLEMENTATION · current</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pair.current} alt={`${pair.label} current`} />
        </figure>
      </div>

      <p className="rv-label" style={{ marginTop: "0.75rem" }}>
        Checklist: silhouette · density · right rail · primary viz · typography ·
        same product?
      </p>
    </div>
  );
}
