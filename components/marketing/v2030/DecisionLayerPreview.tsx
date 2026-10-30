"use client";

/**
 * Hero Decision Layer — readable on first paint, quiet interaction after.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
  PUBLIC_SUPPLIER,
} from "@/lib/marketing/publicCanon";
import { heroEnter } from "@/lib/marketing/motion";

const STAGES = [
  "Evidence",
  "State",
  "Futures",
  "Decision",
  "Verify",
] as const;

const FUTURES = [
  {
    id: "pace",
    label: "Pace seating",
    value: PUBLIC_RESTAURANT.expectedFormatted,
    tip: "Kitchen recovers earlier · recommended",
    preferred: true,
    pressure: "Peak clears · ~20 min",
  },
  {
    id: "seat",
    label: "Seat now",
    value: "+$410",
    tip: "Coral pressure window grows",
    preferred: false,
    pressure: "Kitchen overload risk",
  },
  {
    id: "throttle",
    label: "Throttle delivery",
    value: "+$470",
    tip: "Pressure falls · lower contribution",
    preferred: false,
    pressure: "Delivery load cut",
  },
] as const;

type Props = {
  /** Play entrance motion (homepage hero) */
  animateIn?: boolean;
};

export function DecisionLayerPreview({ animateIn = false }: Props) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(
    reduced || !animateIn ? PUBLIC_RESTAURANT.confidencePct : 0,
  );
  const [swept, setSwept] = useState(false);

  useEffect(() => {
    if (reduced || !animateIn) {
      setConfidence(PUBLIC_RESTAURANT.confidencePct);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setConfidence(Math.round(PUBLIC_RESTAURANT.confidencePct * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const delay = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
      setSwept(true);
    }, 420);
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [animateIn, reduced]);

  const active =
    FUTURES.find((f) => f.id === hover) ??
    FUTURES.find((f) => f.preferred)!;
  const tip = hover ? active.tip : "Hover a future to compare";

  const frame = (
    <div
      className="rx30-dl"
      data-swept={swept && !reduced ? "true" : undefined}
      aria-hidden={animateIn ? undefined : true}
    >
      <header className="rx30-dl-top">
        <div>
          <p className="rx30-dl-k">Decision layer</p>
          <strong>What needs you · now</strong>
          <em>Illustrative RADR demo</em>
        </div>
        <span className="rx30-cc-pill">
          <i className="rx30-live-dot" aria-hidden="true" />
          Needs you · 1
        </span>
      </header>

      <nav className="rx30-dl-stages" aria-hidden="true">
        {STAGES.map((s, i) => (
          <span key={s} data-on={i === 3 ? "true" : undefined}>
            {s}
          </span>
        ))}
      </nav>

      <div className="rx30-dl-grid">
        <article className="rx30-dl-card" data-lift>
          <span>Primary</span>
          <strong>{PUBLIC_RESTAURANT.decisionId}</strong>
          <em>{PUBLIC_RESTAURANT.displayName}</em>
        </article>
        <article className="rx30-dl-card" data-expected>
          <span>Expected</span>
          <strong key={active.id} className="rx30-meta-swap">
            {active.value}
          </strong>
          <em key={`${active.id}-p`} className="rx30-meta-swap">
            {active.pressure}
          </em>
        </article>
        <article className="rx30-dl-card">
          <span>Confidence</span>
          <strong>{confidence}%</strong>
          <em>Sample · Friday peaks</em>
        </article>
        <article className="rx30-dl-card">
          <span>Verified</span>
          <strong>{PUBLIC_SUPPLIER.verifiedFormatted}</strong>
          <em>{PUBLIC_SUPPLIER.displayId} sealed</em>
        </article>
      </div>

      <div className="rx30-dl-body">
        <div className="rx30-dl-decision">
          <p className="rx30-cc-decision-k">Ask</p>
          <h3>{PUBLIC_RESTAURANT.actionLabel}</h3>
          <p>{PUBLIC_RESTAURANT.situation}</p>
          <ul>
            {FUTURES.map((f) => (
              <li
                key={f.id}
                data-on={
                  hover === f.id || (!hover && f.preferred) ? "true" : undefined
                }
                onMouseEnter={() => setHover(f.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(f.id)}
                onBlur={() => setHover(null)}
                tabIndex={0}
              >
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </li>
            ))}
          </ul>
          <p className="rx30-dl-tip" aria-live="polite">
            {tip}
          </p>
        </div>
        <aside className="rx30-dl-side">
          <p className="rx30-cc-decision-k">Also watching</p>
          <div>
            <strong>{PUBLIC_HOTEL.actionLabel}</strong>
            <em>
              {PUBLIC_HOTEL.displayName} · {PUBLIC_HOTEL.expectedFormatted}
            </em>
          </div>
          <div>
            <strong>Supplier variance</strong>
            <em>
              {PUBLIC_SUPPLIER.displayId} · {PUBLIC_SUPPLIER.varianceFormatted}
            </em>
          </div>
          <p className="rx30-dl-footnote">
            Systems record. RADR decides. Humans stay in control.
          </p>
        </aside>
      </div>
    </div>
  );

  if (!animateIn || reduced) return frame;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={heroEnter}
    >
      {frame}
    </motion.div>
  );
}
