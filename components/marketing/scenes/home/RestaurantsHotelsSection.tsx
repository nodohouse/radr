"use client";

/**
 * Restaurants | Hotels — example operating models.
 * Same Decision architecture. Not the boundary of the platform.
 */

import { useState } from "react";
import Link from "next/link";
import "@/app/radr-public.css";

type World = "restaurants" | "hotels";

const COPY: Record<
  World,
  {
    kicker: string;
    clock: string;
    situation: string;
    facts: string[];
    decision: string;
    futures: { label: string; value: string; preferred?: boolean }[];
    proof: string;
    lenses: string;
    cta: string;
  }
> = {
  restaurants: {
    kicker: "Restaurant groups",
    clock: "Soho · New York · Dinner · 19:48",
    situation: "Revenue is ahead. Contribution isn't.",
    facts: [
      "Kitchen heading to 97%",
      "38 covers inbound",
      "Tuna stockout projected 21:18",
      "Tuna #1 seller · Truffle Pasta wins contribution / kitchen minute",
    ],
    decision:
      "PACE NEXT SEATING WAVE · 12 MIN · HOLD Tuna promo · PUSH Truffle + House White",
    futures: [
      { label: "Pace seating 12", value: "+$620", preferred: true },
      { label: "Seat now", value: "+$180 · kitchen risk" },
      { label: "Throttle delivery", value: "+$410" },
    ],
    proof: "Action prepared → peak cleared → contribution protected → Memory V3",
    lenses: "Covers · kitchen · menu · inventory · labor · service",
    cta: "See RADR in action",
  },
  hotels: {
    kicker: "Hotel groups",
    clock: "Mercer House · New York · Check-in wave · 14:20",
    situation: "Check-in is on track. Room readiness isn't.",
    facts: [
      "42 arrivals",
      "31 rooms ready",
      "7 arrivals at risk",
      "Floor 3 housekeeping behind",
    ],
    decision: "REASSIGN 2 HOUSEKEEPERS",
    futures: [
      { label: "Reassign 2 HK", value: "+$1,840 protected", preferred: true },
      { label: "Keep priorities", value: "$0 · 7 at risk" },
      { label: "Call flexible labor", value: "+$1,620 · −$280" },
      { label: "Prioritize VIP + early", value: "+$920" },
    ],
    proof:
      "Rooms ready · guest exposure reduced · labor cost known · Verified Value sealed",
    lenses: "Bookings · rooms · housekeeping · arrivals · distribution · upsell",
    cta: "See RADR in action",
  },
};

export function RestaurantsHotelsSection() {
  const [world, setWorld] = useState<World>("restaurants");
  const c = COPY[world];

  return (
    <section
      className="rx-rh-worlds"
      data-nav-theme="light"
      aria-labelledby="rx-rh-title"
    >
      <div className="rx-shell">
        <p className="rx-kicker">Built across hospitality</p>
        <h2 id="rx-rh-title" className="rx-rec-h">
          One Decision system.
          <br />
          Different operating models.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "36rem" }}>
          Explore two examples of how RADR adapts to different hospitality
          operations.
        </p>

        <div className="rx-rh-switch-block">
          <p className="rx-rh-example-label">Example operating models</p>
          <div
            className="rx-rh-toggle"
            role="tablist"
            aria-label="Example operating models"
          >
            <button
              type="button"
              role="tab"
              aria-selected={world === "restaurants"}
              data-active={world === "restaurants"}
              className="rx-rh-tab"
              onClick={() => setWorld("restaurants")}
            >
              Restaurants
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={world === "hotels"}
              data-active={world === "hotels"}
              className="rx-rh-tab"
              onClick={() => setWorld("hotels")}
            >
              Hotels
            </button>
          </div>
        </div>

        <div className="rx-rh-panel rx-rh-panel-deep" role="tabpanel" key={world}>
          <p className="rx-rh-kicker">{c.kicker}</p>
          <p className="rx-dof-clock">{c.clock}</p>
          <h3 className="rx-rh-situation">{c.situation}</h3>
          <ul className="rx-rh-bullets">
            {c.facts.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="rx-rh-decision">
            <em>Decision</em>
            <strong>{c.decision}</strong>
          </p>
          <ul className="rx-rh-futures" aria-label="Compare Futures">
            {c.futures.map((f) => (
              <li key={f.label} data-preferred={f.preferred ? "true" : undefined}>
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </li>
            ))}
          </ul>
          <p className="rx-rh-proof">{c.proof}</p>
          <p className="rx-rh-lens">{c.lenses}</p>
          <Link href="/signup?intent=demo&next=/app/enter" className="rx-btn rx-btn-primary">
            {c.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
