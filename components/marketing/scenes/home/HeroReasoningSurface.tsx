"use client";

import { useEffect, useState } from "react";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { HeroVerticalId } from "@/components/marketing/data/homepageVerticalDemos";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

type Signal = { id: string; label: string; value: string; slot: "a" | "b" | "c" };

type Future = { id: string; label: string; expected: number; selected?: boolean };

type Story = {
  place: string;
  signals: Signal[];
  expectedDemand: string;
  history: string;
  problem: string;
  sellout: string;
  exposure: number;
  exposureLabel: string;
  futures: Future[];
  recommend: string;
  fallback?: string;
  expected: number;
  expectedLabel: string;
  confidence: string;
  deadline: string;
  why: {
    sources: string;
    sample: string;
    observed: string[];
    estimated: string[];
    predicted: string[];
    assumes: string[];
    couldChange: string[];
  };
};

const STORIES: Record<HeroVerticalId, Story> = {
  restaurant: {
    place: CANON_PEAK.property,
    signals: [
      { id: "occ", label: "FLOOR", value: "78% occupied", slot: "a" },
      { id: "walk", label: "WALK-INS", value: "Waiting", slot: "b" },
      { id: "kit", label: "KITCHEN", value: "92% · ticket 14m ↑", slot: "c" },
    ],
    expectedDemand: "38 covers inbound · 22 min",
    history: "Load >94% >15m → tickets ≥17m",
    problem: "EMPTY TABLES ≠ AVAILABLE CAPACITY",
    sellout: "Second turns at risk if you seat now",
    exposure: CANON_PEAK.exposureEuro,
    exposureLabel: "VS SEAT-NOW",
    futures: [
      { id: "seat", label: "Seat now", expected: 0 },
      { id: "wait", label: "Wait 12 min", expected: 620, selected: true },
      { id: "stop", label: "Hard stop", expected: 180 },
    ],
    recommend: "Wait 12 minutes. Don't seat yet.",
    fallback: "Throttle delivery · feature fast dish · resume 18:54.",
    expected: CANON_PEAK.expectedProtectedEuro,
    expectedLabel: "EXPECTED VS SEAT-NOW",
    confidence: "78%",
    deadline: CANON_PEAK.deadline,
    why: {
      sources: `${CANON_PEAK.sources.length} live sources`,
      sample: "Peak collision history at this location",
      observed: [
        "78% floor · LIVE",
        "38 covers inbound · LIVE",
        "Kitchen 92% · ticket 14m ↑ · LIVE",
        "Delivery +31% · LIVE",
      ],
      estimated: ["Seat-now → kitchen 97%", "9 second-turn tables at risk"],
      predicted: ["Wait-12 · +€620 vs seat-now", "Resume · 18:54"],
      assumes: ["Inbound holds", "No VIP exception yet"],
      couldChange: ["VIP party", "Kitchen recovery", "Delivery spike"],
    },
  },
  hotel: {
    place: CANON_OTA.property,
    signals: [
      { id: "occ", label: "OCCUPANCY", value: "89%", slot: "a" },
      { id: "dir", label: "DIRECT", value: "48% · target 59%", slot: "b" },
      { id: "ota", label: "OTA", value: "+11 pts", slot: "c" },
    ],
    expectedDemand: "Direct target 59%",
    history: "18 comparable dates",
    problem: "HIGH OCCUPANCY. WEAK MIX.",
    sellout: "Contribution quality under pressure",
    exposure: CANON_OTA.exposureEuro,
    exposureLabel: "CONTRIBUTION AT RISK",
    futures: [
      { id: "hold", label: "Hold direct", expected: 3100, selected: true },
      { id: "ota", label: "Release OTA", expected: 1800 },
      { id: "rate", label: "Adjust rate", expected: 2400 },
    ],
    recommend: "Hold 4 premium rooms direct.",
    fallback: "73% historical direct-fill on comparable dates — not a certainty.",
    expected: CANON_OTA.expectedProtectedEuro,
    expectedLabel: "EXPECTED PROTECTED",
    confidence: "74%",
    deadline: CANON_OTA.deadline,
    why: {
      sources: "3 live sources",
      sample: "18 comparable dates",
      observed: ["89% occupancy · LIVE", "48% direct · LIVE", "OTA +11 pts · 3m"],
      estimated: ["Direct target · 59%"],
      predicted: ["Direct-fill probability · 73%"],
      assumes: ["Pickup remains ahead"],
      couldChange: ["Comp pricing", "Event demand shift"],
    },
  },
  apartments: {
    place: CANON_ORPHAN.property,
    signals: [
      { id: "gap", label: "GAP", value: "1-night orphan", slot: "a" },
      { id: "time", label: "UNTIL CHECK-IN", value: "72 hours", slot: "b" },
      { id: "rate", label: "FLOOR", value: "€148 profitable", slot: "c" },
    ],
    expectedDemand: "64% historical fill",
    history: "17 comparable gaps",
    problem: "FILLING THE NIGHT CAN BE WRONG.",
    sellout: "Net contribution after turnover · not occupancy",
    exposure: CANON_ORPHAN.exposureEuro,
    exposureLabel: "NET OPPORTUNITY",
    futures: [
      {
        id: "open",
        label: `Wait · €${CANON_ORPHAN.recommendedRateEuro} direct`,
        expected: CANON_ORPHAN.expectedProtectedEuro,
        selected: true,
      },
      {
        id: "disc",
        label: "Take booking now",
        expected:
          CANON_ORPHAN.scenarios.find((s) => s.id === "discount_128")
            ?.expectedContributionEuro ?? 78,
      },
      { id: "none", label: "Leave closed", expected: 0 },
    ],
    recommend: "Wait. Protect direct / LOS path.",
    expected: CANON_ORPHAN.expectedProtectedEuro,
    expectedLabel: "EXPECTED NET CONTRIBUTION",
    confidence: "64%",
    deadline: CANON_ORPHAN.deadline,
    why: {
      sources: "5 live sources",
      sample: "17 comparable gaps",
      observed: [
        "One-night gap · LIVE",
        "Cleaning absorbed · LIVE",
        "Next stay Wednesday · LIVE",
      ],
      estimated: [
        "Profitable floor · €148",
        "Take-now OTA drag · ~18%",
        "Longer direct stay · 41%",
      ],
      predicted: ["Wait path expected net · €112"],
      assumes: ["Maintenance clear"],
      couldChange: ["Housekeeping delay", "Comp ADR drop"],
    },
  },
};

/** 0 signals → 1 connect → 2 problem → 3 exposure → 4 decision → 5 done */
type Beat = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Progressive hero — one frame at a time.
 * Confidence / sources / sample live behind Why.
 */
export function HeroReasoningSurface({
  vertical,
  playToken = 0,
  onReplay,
}: {
  vertical: HeroVerticalId;
  playToken?: number;
  onReplay?: () => void;
}) {
  const story = STORIES[vertical];
  const [beat, setBeat] = useState<Beat>(0);
  const [why, setWhy] = useState(false);
  const [simulate, setSimulate] = useState(false);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    setBeat(reduced ? 5 : 0);
    setWhy(false);
    setSimulate(false);
    if (reduced) return;
    const steps: { at: number; b: Beat }[] = [
      { at: 900, b: 1 },
      { at: 1800, b: 2 },
      { at: 2600, b: 3 },
      { at: 3400, b: 4 },
      { at: 4000, b: 5 },
    ];
    const timers = steps.map(({ at, b }) =>
      window.setTimeout(() => setBeat(b), at),
    );
    return () => timers.forEach(clearTimeout);
  }, [vertical, playToken, reduced]);

  return (
    <div className="rx-hx rx-hx-polish" data-beat={beat} data-vertical={vertical}>
      <div
        className="rx-hx-layer"
        data-layer="signals"
        data-on={beat === 0 ? "true" : beat === 1 ? "dim" : "false"}
      >
        {story.signals.map((s) => (
          <div key={s.id} className="rx-hx-ann" data-slot={s.slot}>
            <em>{s.label}</em>
            <strong>{s.value}</strong>
          </div>
        ))}
        <svg
          className="rx-hx-traj"
          viewBox="0 0 400 280"
          preserveAspectRatio="none"
          aria-hidden="true"
          data-on={beat >= 1 && beat < 4 ? "true" : "false"}
        >
          <path d="M60 50 C 140 70, 120 140, 200 150 C 280 160, 260 220, 320 240" />
        </svg>
      </div>

      <div
        className="rx-hx-layer rx-hx-connect"
        data-on={beat === 1 ? "true" : "false"}
      >
        <p>
          <em>Expected demand</em>
          <strong>{story.expectedDemand}</strong>
        </p>
        <p>
          <em>Historical</em>
          <strong>{story.history}</strong>
        </p>
      </div>

      <div
        className="rx-hx-layer rx-hx-resolve"
        data-on={beat === 2 ? "true" : "false"}
      >
        <p className="rx-hx-problem">{story.problem}</p>
        <p className="rx-hx-problem-sub">{story.sellout}</p>
      </div>

      <div
        className="rx-hx-layer rx-hx-resolve"
        data-on={beat === 3 ? "true" : "false"}
      >
        <div className="rx-hx-econ">
          <strong className="rx-econ-risk">
            {formatDecisionMoney(story.exposure)}
          </strong>
          <em>{story.exposureLabel}</em>
        </div>
      </div>

      <div className="rx-hx-decide" data-on={beat >= 4 ? "true" : "false"}>
        <p className="rx-hx-rec-kicker">RADR RECOMMENDS</p>
        <p className="rx-hx-rec">{story.recommend}</p>
        <div className="rx-hx-expected">
          <strong className="rx-econ-verified">
            {formatDecisionMoney(story.expected)}
          </strong>
          <em>{story.expectedLabel}</em>
        </div>

        <button
          type="button"
          className="rx-btn rx-btn-primary rx-hx-approve"
          data-on={beat >= 5 ? "true" : "false"}
        >
          Approve plan
        </button>

        <div className="rx-hx-tools">
          <button
            type="button"
            onClick={() => {
              setWhy((w) => !w);
              setSimulate(false);
            }}
            aria-expanded={why}
          >
            Why
          </button>
          <button
            type="button"
            onClick={() => {
              setSimulate((s) => !s);
              setWhy(false);
            }}
            aria-expanded={simulate}
          >
            Simulate
          </button>
          {onReplay ? (
            <button type="button" onClick={onReplay}>
              Replay
            </button>
          ) : null}
        </div>

        {simulate ? (
          <ul className="rx-hx-futures-panel">
            {story.futures.map((f) => (
              <li key={f.id} data-pick={f.selected ? "true" : undefined}>
                <span>{f.label}</span>
                <strong>{formatDecisionMoney(f.expected)}</strong>
                <em>expected protected</em>
              </li>
            ))}
          </ul>
        ) : null}

        {why ? (
          <div className="rx-hx-why">
            <p className="rx-hx-why-note">
              Predictions are estimates based on available data. Actual outcomes
              can differ.
            </p>
            <div className="rx-hx-trust-simple">
              <div>
                <strong>{story.confidence}</strong>
                <em>CONFIDENCE</em>
              </div>
              <div>
                <strong>{story.deadline}</strong>
                <em>DECIDE BY</em>
              </div>
            </div>
            <p className="rx-hx-why-meta">
              {story.why.sources} · {story.why.sample}
            </p>
            {story.fallback ? (
              <p className="rx-hx-fallback">{story.fallback}</p>
            ) : null}
            <div className="rx-hx-why-grid">
              {(
                [
                  ["Observed", story.why.observed],
                  ["Estimated", story.why.estimated],
                  ["Predicted", story.why.predicted],
                  ["Assumes", story.why.assumes],
                  ["What could change", story.why.couldChange],
                ] as const
              ).map(([title, items]) => (
                <section key={title}>
                  <h4>{title}</h4>
                  <ul>
                    {items.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="rx-hx-demo">Illustrative product data</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
