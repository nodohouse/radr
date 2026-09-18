"use client";

import { useState } from "react";
import NextLink from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CANON_PEAK } from "@/lib/radr/decision/demo/canonical";

type LensId = "labor" | "food" | "demand" | "reviews" | "inventory";

type Reveal = {
  think: string;
  found: string;
  evidence: string[];
  exposure: number;
  href: string;
};

const REVEALS: Record<LensId, Reveal> = {
  labor: {
    think: "LABOR",
    found: "KITCHEN MIX × DELIVERY PRESSURE",
    evidence: [
      "Labor remained within plan",
      "Friday contribution fell 8%",
      "Signature mix >18% + delivery >26% + cold station >94%",
      "Ticket time ↑ · second turns ↓ · slow-service mentions ↑",
    ],
    exposure: CANON_PEAK.expectedProtectedEuro,
    href: "/demo",
  },
  food: {
    think: "SUPPLIER PRICE",
    found: "SUPPLIER VARIANCE × YIELD × DISH CONTRIBUTION",
    evidence: [
      "Invoice received qty ≠ inventory movement",
      "Yield drift on signature protein",
      "Reprice is not the first lever",
      "Recover noncompliance before menu price",
    ],
    exposure: 1590,
    href: "/demo",
  },
  demand: {
    think: "DEMAND",
    found: "ARRIVAL DENSITY × STATION CAPACITY",
    evidence: [
      "120 covers evenly ≠ 42 covers in 20 minutes",
      "Cold station projected 96% at compression",
      "Delivery historically +18% in similar rain",
      "Demand quality changes which orders to accept",
    ],
    exposure: CANON_PEAK.expectedProtectedEuro,
    href: "/demo",
  },
  reviews: {
    think: "SERVICE STAFF",
    found: "ARRIVAL COMPRESSION × ORDER MIX × KITCHEN PRESSURE",
    evidence: [
      "Slow-service mentions rose with ticket time",
      "FOH headcount was within plan",
      "Strongest relationship is operating mix — not staffing",
      "Guest voice attached to physical capacity",
    ],
    exposure: 390,
    href: "/demo",
  },
  inventory: {
    think: "STOCKOUT LOSS",
    found: "TRUE SUBSTITUTION × BASKET ECONOMICS",
    evidence: [
      "Guests buy alternatives — not always lost revenue",
      "Low-margin cocktail can lift dessert attachment",
      "Peak stockout cost ≠ item contribution",
      "Protect scarce ingredient; feature viable substitute",
    ],
    exposure: 680,
    href: "/app/intelligence/menu",
  },
};

const LENSES: { id: LensId; label: string }[] = [
  { id: "labor", label: "Labor" },
  { id: "food", label: "Food cost" },
  { id: "demand", label: "Demand" },
  { id: "reviews", label: "Reviews" },
  { id: "inventory", label: "Inventory" },
];

/**
 * Signature interactive reveal — the number is not the intelligence.
 */
export function SectionConnectionReveal() {
  const [lens, setLens] = useState<LensId>("labor");
  const r = REVEALS[lens];

  return (
    <section
      className="rx-reveal-sec"
      data-nav-theme="dark"
      aria-label="Connection reveal"
    >
      <div className="rx-reveal-shell">
        <p className="rx-reveal-kicker">What am I missing?</p>
        <h2 className="rx-reveal-title">
          The number is not the intelligence.
          <br />
          The connection is.
        </h2>

        <div
          className="rx-reveal-lenses"
          role="tablist"
          aria-label="What you're looking at"
        >
          {LENSES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={lens === l.id}
              className="rx-reveal-lens"
              data-on={lens === l.id ? "true" : undefined}
              onClick={() => setLens(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="rx-reveal-stage" key={lens}>
          <div className="rx-reveal-think">
            <span className="rx-reveal-label">You think</span>
            <strong>{r.think}</strong>
          </div>
          <div className="rx-reveal-arrow" aria-hidden="true">
            → RADR FOUND →
          </div>
          <div className="rx-reveal-found">
            <span className="rx-reveal-label">RADR found</span>
            <strong>{r.found}</strong>
          </div>
        </div>

        <ul className="rx-reveal-evidence" key={`ev-${lens}`}>
          {r.evidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="rx-reveal-econ">
          <strong>{formatDecisionMoney(r.exposure)}</strong>
          <span>Potential exposure · illustrative</span>
        </div>

        <NextLink href={r.href} className="rx-reveal-cta">
          Open Decision →
        </NextLink>
      </div>
    </section>
  );
}
