"use client";

/**
 * Cinematic hero Decision object — marketing theatre only.
 * Not a demo link. Explain → desire → magic. Signup unlocks /app.
 */

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CTAS } from "@/lib/marketing/brand";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
} from "@/lib/marketing/publicCanon";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import "@/app/decision-hero.css";

type World = "restaurant" | "hotel";

type Phase =
  | "idle"
  | "signals"
  | "converge"
  | "decision"
  | "futures"
  | "select"
  | "action"
  | "outcome"
  | "verified"
  | "memory"
  | "hold";

const PHASES: { id: Phase; ms: number }[] = [
  { id: "signals", ms: 1300 },
  { id: "converge", ms: 1100 },
  { id: "decision", ms: 1300 },
  { id: "futures", ms: 1200 },
  { id: "select", ms: 1100 },
  { id: "action", ms: 1100 },
  { id: "outcome", ms: 1100 },
  { id: "verified", ms: 1300 },
  { id: "memory", ms: 1100 },
  { id: "hold", ms: 5000 },
];

const RESTAURANT = {
  needs: "2 need your judgment",
  id: PUBLIC_RESTAURANT.decisionId,
  verb: PUBLIC_RESTAURANT.actionShort,
  where: `${PUBLIC_RESTAURANT.displayName} · ${PUBLIC_RESTAURANT.service}`,
  econ: PUBLIC_RESTAURANT.expectedFormatted,
  econLabel: "expected contribution",
  deadline: "11 min remaining",
  signals: [
    { label: "38 inbound", delay: 0 },
    { label: "Delivery +31%", delay: 1 },
    { label: "Kitchen 92 → 97%", delay: 2 },
  ],
  futures: [
    {
      id: "wait",
      label: "Pace seating 12 min",
      value: PUBLIC_RESTAURANT.expectedFormatted,
      preferred: true,
      span: 1,
    },
    { id: "seat", label: "Seat now", value: "+$410", preferred: false, span: 0.66 },
    {
      id: "throttle",
      label: "Throttle delivery",
      value: "+$470",
      preferred: false,
      span: 0.76,
    },
  ],
  action: "Prepared · throttle + hold · feature Truffle Pasta",
  outcome: "Peak pressure cleared · kitchen recovered",
  verified: `${PUBLIC_RESTAURANT.verifiedFormatted} VERIFIED`,
  memory: "Friday peak · Playbook V3",
};

const HOTEL = {
  needs: "4 need your judgment",
  id: "D-2401",
  verb: PUBLIC_HOTEL.actionShort,
  where: `${PUBLIC_HOTEL.displayName} · ${PUBLIC_HOTEL.service}`,
  econ: PUBLIC_HOTEL.expectedFormatted,
  econLabel: "protected exposure",
  deadline: "75 min remaining",
  signals: [
    { label: "42 arrivals", delay: 0 },
    { label: "31 rooms ready", delay: 1 },
    { label: "7 at risk · Floor 3", delay: 2 },
  ],
  futures: [
    {
      id: "reassign",
      label: "Reassign 2 HK",
      value: PUBLIC_HOTEL.expectedFormatted,
      preferred: true,
      span: 1,
    },
    { id: "keep", label: "Keep priorities", value: "$0 · risk", preferred: false, span: 0.28 },
    {
      id: "flex",
      label: "Call flexible labor",
      value: "+$1,620",
      preferred: false,
      span: 0.88,
    },
  ],
  action: "Prepared for approval · Floor 3 reassignment",
  outcome: "Rooms ready ahead of arrival wave",
  verified: `${PUBLIC_HOTEL.exposureFormatted} PROTECTED`,
  memory: "Readiness wave · Playbook V3",
};

export function DecisionHeroVisual() {
  const reduced = usePrefersReducedMotion();
  const [world, setWorld] = useState<World>("restaurant");
  const [phase, setPhase] = useState<Phase>(reduced ? "hold" : "idle");
  const data = world === "restaurant" ? RESTAURANT : HOTEL;

  useEffect(() => {
    if (reduced) {
      setPhase("hold");
      return;
    }
    setPhase("idle");
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      const step = PHASES[i];
      if (!step) return;
      setPhase(step.id);
      i += 1;
      if (i >= PHASES.length) return;
      timer = setTimeout(run, step.ms);
    };
    timer = setTimeout(run, 450);
    return () => clearTimeout(timer);
  }, [reduced, world]);

  const phaseRank = (p: Phase) => {
    if (p === "idle") return -1;
    if (p === "hold") return 99;
    return PHASES.findIndex((x) => x.id === p);
  };
  const current = phaseRank(phase);
  const show = (minPhase: Phase) => current >= phaseRank(minPhase);

  return (
    <aside
      className="rx-dh"
      data-phase={phase}
      data-world={world}
      data-reduced={reduced ? "true" : undefined}
      aria-label={`${data.verb} · ${data.id}`}
    >
      <div className="rx-dh-field" aria-hidden="true">
        <i className="rx-dh-orb rx-dh-orb-a" />
        <i className="rx-dh-orb rx-dh-orb-b" />
        <i className="rx-dh-hair" />
      </div>

      <header className="rx-dh-head">
        <p className="rx-dh-needs" data-on={show("signals") ? "true" : undefined}>
          {data.needs}
        </p>
      </header>

      <div className="rx-dh-stage">
        <ul className="rx-dh-signals" aria-hidden="true">
          {data.signals.map((s) => (
            <li
              key={s.label}
              data-i={s.delay}
              data-on={show("signals") ? "true" : undefined}
              data-converge={show("converge") ? "true" : undefined}
            >
              {s.label}
            </li>
          ))}
        </ul>

        <div
          className="rx-dh-decision"
          data-on={show("decision") ? "true" : undefined}
        >
          <div className="rx-dh-decision-meta">
            <span className="rx-dh-id">{data.id}</span>
            <span className="rx-dh-deadline">{data.deadline}</span>
          </div>
          <h2 className="rx-dh-verb">{data.verb}</h2>
          <p className="rx-dh-where">{data.where}</p>
          <div className="rx-dh-econ">
            <strong>{data.econ}</strong>
            <span>{data.econLabel}</span>
          </div>
        </div>
      </div>

      <ul
        className="rx-dh-futures"
        data-on={show("futures") ? "true" : undefined}
        data-select={show("select") ? "true" : undefined}
        aria-label="Compare Futures"
      >
        {data.futures.map((f) => (
          <li
            key={f.id}
            data-preferred={f.preferred ? "true" : undefined}
            data-selected={show("select") && f.preferred ? "true" : undefined}
            style={{ ["--span" as string]: String(f.span) }}
          >
            <span className="rx-dh-fut-lab">{f.label}</span>
            <span className="rx-dh-fut-track" aria-hidden="true">
              <svg viewBox="0 0 200 12" preserveAspectRatio="none">
                <path
                  className="rx-dh-fut-path"
                  d="M0 10 C 40 10, 70 2, 110 4 S 170 10, 200 3"
                />
              </svg>
            </span>
            <strong>{f.value}</strong>
          </li>
        ))}
      </ul>

      <div className="rx-dh-resolve">
        <p data-on={show("action") ? "true" : undefined} className="rx-dh-action">
          {data.action}
        </p>
        <p data-on={show("outcome") ? "true" : undefined} className="rx-dh-outcome">
          {data.outcome}
        </p>
        <p
          data-on={show("verified") ? "true" : undefined}
          className="rx-dh-verified"
        >
          {data.verified}
        </p>
        <p data-on={show("memory") ? "true" : undefined} className="rx-dh-memory">
          {data.memory}
        </p>
      </div>

      <div className="rx-dh-foot">
        <Link href={CTAS.compareFuturesHref} className="rx-dh-cta">
          Compare Futures <span aria-hidden="true">→</span>
        </Link>
        <div
          className="rx-dh-worlds"
          role="tablist"
          aria-label="Example operating models"
        >
          <button
            type="button"
            role="tab"
            className="rx-dh-world"
            aria-selected={world === "restaurant"}
            data-active={world === "restaurant"}
            onClick={() => setWorld("restaurant")}
          >
            Restaurants
          </button>
          <button
            type="button"
            role="tab"
            className="rx-dh-world"
            aria-selected={world === "hotel"}
            data-active={world === "hotel"}
            onClick={() => setWorld("hotel")}
          >
            Hotels
          </button>
        </div>
      </div>
    </aside>
  );
}
