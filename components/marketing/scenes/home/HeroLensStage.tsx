"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { HeroVerticalId } from "@/components/marketing/data/homepageVerticalDemos";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

type Signal = {
  id: string;
  label: string;
  value: string;
  x: number;
  y: number;
};

type Future = {
  id: string;
  label: string;
  expected: number;
  selected?: boolean;
  obvious?: boolean;
};

type Factor = { id: string; label: string };

type Story = {
  displayId: string;
  place: { location: string; time: string; phase: string };
  image: { src: string; position: string };
  signals: Signal[];
  demandLabel: string;
  demandValue: string;
  availableLabel: string;
  availableValue: string;
  calcLeft: string;
  calcRight: string;
  problem: string;
  obviousLabel: string;
  obviousMove: string;
  factors: Factor[];
  futures: Future[];
  rejectLabel: string;
  recommendLines: [string, string?];
  fallback?: string;
  expected: number;
  expectedLabel: string;
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
    displayId: CANON_PEAK.displayId,
    place: {
      location: "Berlin Mitte",
      time: "18:42",
      phase: "Dinner service",
    },
    image: {
      src: "/demo/facilities/berlin-dining.jpg",
      position: "42% 38%",
    },
    signals: [
      { id: "occ", label: "FLOOR", value: "78% occupied", x: 18, y: 22 },
      { id: "walk", label: "WALK-INS", value: "Waiting", x: 62, y: 48 },
      { id: "kit", label: "KITCHEN", value: "92% capacity", x: 28, y: 72 },
    ],
    demandLabel: "INBOUND 22M",
    demandValue: "38 covers",
    availableLabel: "EMPTY TABLES",
    availableValue: "Look free",
    calcLeft: "78%",
    calcRight: "38↑",
    problem: "EMPTY TABLES ≠ CAPACITY",
    obviousLabel: "THE OBVIOUS MOVE",
    obviousMove: "SEAT THEM",
    factors: [
      { id: "inb", label: "38 COVERS INBOUND" },
      { id: "kit", label: "KITCHEN 92%" },
      { id: "del", label: "DELIVERY +31%" },
      { id: "turn", label: "2ND TURN AT RISK" },
      { id: "tix", label: "TICKET 14 MIN ↑" },
    ],
    futures: [
      { id: "seat", label: "Seat walk-ins now", expected: 0, obvious: true },
      { id: "wait", label: "Wait 12 minutes", expected: 620, selected: true },
      { id: "stop", label: "Hard stop", expected: 180 },
    ],
    rejectLabel: "DON'T. NOT YET.",
    recommendLines: ["Wait 12 minutes.", "Then resume seating."],
    fallback: "Throttle delivery · feature fast dish · hold 2 tables.",
    expected: CANON_PEAK.expectedProtectedEuro,
    expectedLabel: "EXPECTED VS SEAT-NOW",
    deadline: CANON_PEAK.deadline,
    why: {
      sources: `${CANON_PEAK.sources.length} live sources`,
      sample: "When kitchen >94% for >15 min · tickets cross 17 min",
      observed: [
        "Floor 78% · LIVE",
        "Walk-ins waiting · LIVE",
        "38 covers inbound · 22 min · LIVE",
        "KDS ticket time 14 min ↑ · LIVE",
        "Kitchen 92% · LIVE",
        "Delivery +31% vs plan · LIVE",
      ],
      estimated: [
        "Seat-now → kitchen 97%",
        "Second-turn tables at risk · 9",
        "Delivery marginal contribution · lower this window",
      ],
      predicted: [
        "Wait-12 expected · +€620 vs seat-now",
        "Resume seating · 18:54 if load below threshold",
        "Feature high €/min dish during hold",
      ],
      assumes: ["Inbound arrivals hold", "No VIP exception yet"],
      couldChange: ["VIP party", "Kitchen recovery", "Delivery spike"],
    },
  },
  hotel: {
    displayId: CANON_OTA.displayId,
    place: {
      location: "Amsterdam Canal",
      time: "14:10",
      phase: "Pickup window",
    },
    image: {
      src: "/demo/facilities/canal-deluxe-king.jpg",
      position: "58% 35%",
    },
    signals: [
      { id: "occ", label: "OCCUPANCY", value: "89%", x: 18, y: 22 },
      { id: "dir", label: "DIRECT PICKUP", value: "ahead of comps", x: 58, y: 44 },
      { id: "ota", label: "OTA SHARE", value: "+11 pts", x: 28, y: 70 },
    ],
    demandLabel: "PREMIUM LEFT",
    demandValue: "4 rooms",
    availableLabel: "HOUSEKEEPING",
    availableValue: "94% ready",
    calcLeft: "6",
    calcRight: "OTA",
    problem: "€4,200 CONTRIBUTION AT RISK",
    obviousLabel: "THE OBVIOUS MOVE",
    obviousMove: "KEEP SELLING EVERY CHANNEL",
    factors: [
      { id: "ota", label: "OTA COST ↑" },
      { id: "dir", label: "DIRECT PICKUP ↑" },
      { id: "prem", label: "4 PREMIUM LEFT" },
      { id: "hist", label: "73% DIRECT FILL" },
    ],
    futures: [
      { id: "ota", label: "Release OTA", expected: 1800, obvious: true },
      {
        id: "hold",
        label: "Hold premium direct",
        expected: 3100,
        selected: true,
      },
      { id: "rate", label: "Raise rate + mix", expected: 2400 },
    ],
    rejectLabel: "DON'T RELEASE YET.",
    recommendLines: ["Hold 4 premium rooms", "direct for 72h."],
    fallback: "73% historical direct-fill — not a certainty.",
    expected: CANON_OTA.expectedProtectedEuro,
    expectedLabel: "EXPECTED PROTECTED",
    deadline: CANON_OTA.deadline,
    why: {
      sources: "6 live sources",
      sample: "18 comparable dates",
      observed: [
        "89% occupancy · LIVE",
        "OTA share +11 pts · LIVE",
        "4 premium rooms remaining · LIVE",
        "Housekeeping readiness 94% · LIVE",
        "City event tomorrow · LIVE",
      ],
      estimated: [
        "Direct pickup ahead of comparable dates",
        "Channel cost elevated on remaining premium",
      ],
      predicted: [
        "Direct-fill probability · 73% historical",
        "Release OTA expected · €1,800",
        "Hold-direct expected · €3,100",
      ],
      assumes: ["Pickup remains ahead", "Rooms stay ready"],
      couldChange: ["Comp pricing", "Event demand shift", "HK delay"],
    },
  },
  apartments: {
    displayId: CANON_ORPHAN.displayId,
    place: {
      location: "Lisbon Chiado",
      time: "T−72h",
      phase: "Orphan night",
    },
    image: {
      src: "/demo/facilities/lisbon-onebed.jpg",
      position: "50% 42%",
    },
    signals: [
      { id: "gap", label: "ONE-NIGHT GAP", value: "Tuesday", x: 20, y: 24 },
      { id: "arr", label: "ARRIVAL", value: "72h away", x: 60, y: 46 },
      { id: "floor", label: "PROFITABLE FLOOR", value: "€148", x: 28, y: 72 },
    ],
    demandLabel: "DIRECT IN 48H",
    demandValue: "often fills",
    availableLabel: "COMPARABLE",
    availableValue: "17 gaps",
    calcLeft: "64%",
    calcRight: "open",
    problem: "BOOKING AVAILABLE. FILL?",
    obviousLabel: "THE OBVIOUS MOVE",
    obviousMove: "TAKE IT",
    factors: [
      { id: "dir", label: "LONGER STAY 41%" },
      { id: "ota", label: "OTA COST ↑" },
      { id: "clean", label: "CLEANING ABSORBED" },
      { id: "next", label: "NEXT STAY WED" },
    ],
    futures: [
      {
        id: "disc",
        label: "Take booking now",
        expected:
          CANON_ORPHAN.scenarios.find((s) => s.id === "discount_128")
            ?.expectedContributionEuro ?? 78,
        obvious: true,
      },
      {
        id: "wait",
        label: "Wait · direct / LOS",
        expected: CANON_ORPHAN.expectedProtectedEuro,
        selected: true,
      },
      { id: "none", label: "Leave closed", expected: 0 },
    ],
    rejectLabel: "DON'T FILL YET.",
    recommendLines: ["Wait.", "Protect the better unit-night."],
    fallback: "Reject low-quality fill when next-stay economics win.",
    expected: CANON_ORPHAN.expectedProtectedEuro,
    expectedLabel: "EXPECTED NET CONTRIBUTION",
    deadline: CANON_ORPHAN.deadline,
    why: {
      sources: "5 live sources",
      sample: "17 comparable gaps",
      observed: [
        "One-night orphan · Tuesday · LIVE",
        "Arrival 72h away · LIVE",
        "Cleaning already absorbed · LIVE",
        "Next stay Wednesday · LIVE",
      ],
      estimated: [
        "Direct demand often arrives inside 48h",
        "OTA fill higher earlier · higher cost",
      ],
      predicted: [
        `Wait path · €${CANON_ORPHAN.expectedProtectedEuro} expected net contribution`,
        `Recommended rate · €${CANON_ORPHAN.recommendedRateEuro}`,
        "Early discount · €78 expected net contribution",
      ],
      assumes: ["No early walkaway on next stay"],
      couldChange: ["Sudden OTA demand", "Maintenance issue"],
    },
  },
};

/**
 * Silent RADR film (~20s loop).
 * 0–4 scene · 4–8 signals · 8–11 converge · 11–15 futures · 15–18 recommend · 18–20 endline
 */
type Beat = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

const BEAT_AT: { at: number; b: Beat }[] = [
  { at: 4000, b: 1 },
  { at: 5200, b: 2 },
  { at: 6600, b: 3 },
  { at: 8000, b: 4 },
  { at: 9200, b: 5 },
  { at: 10400, b: 6 },
  { at: 11200, b: 7 },
  { at: 12200, b: 8 },
  { at: 13400, b: 9 },
  { at: 14800, b: 10 },
  { at: 16200, b: 11 },
  { at: 17600, b: 12 },
  { at: 18800, b: 13 },
];

const LOOP_MS = 20500;

/**
 * Signature RADR hero lens — obvious move dies; RADR selects the tradeoff.
 */
export function HeroLensStage({
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
    setWhy(false);
    setSimulate(false);
    if (reduced) {
      setBeat(12);
      return;
    }
    setBeat(0);
    const timers: number[] = [];
    let cancelled = false;

    const schedule = () => {
      setBeat(0);
      BEAT_AT.forEach(({ at, b }) => {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setBeat(b);
          }, at),
        );
      });
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) schedule();
        }, LOOP_MS),
      );
    };

    schedule();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [vertical, playToken, reduced]);

  function handleReplay() {
    setBeat(0);
    setWhy(false);
    setSimulate(false);
    onReplay?.();
  }

  const signalCount =
    beat >= 3 ? 3 : beat >= 2 ? 2 : beat >= 1 ? 1 : 0;
  const showPlace = beat >= 0 && beat < 13;
  const showSignals = signalCount > 0 && beat >= 1 && beat <= 4;
  const showRadar = beat === 4;
  const showDemand = beat === 5 || beat === 6;
  const showCalc = beat === 6;
  const showProblem = beat === 7;
  const showObvious = beat === 8 || beat === 9;
  const obviousKilled = beat === 9;
  const showFactors = beat === 9 || beat === 10;
  const showFork = beat === 10 || beat === 11;
  const forkSelected = beat === 11;
  const showDecision = beat === 12;
  const showEndline = beat === 13;
  const dimWorld =
    showRadar ||
    (beat >= 5 && beat <= 12) ||
    showEndline;
  const focus =
    showEndline
      ? "decision"
      : showDecision
        ? "decision"
        : showFork
          ? "fork"
          : showFactors
            ? "factors"
            : showObvious
              ? "obvious"
              : showProblem
                ? "problem"
                : showDemand
                  ? "discover"
                  : showRadar
                    ? "radar"
                    : showSignals
                      ? "signals"
                      : "scene";

  const [sigA, sigB, sigC] = story.signals;
  const hubX = +(
    (Math.min(sigA!.x, sigB!.x, sigC!.x) + Math.max(sigA!.x, sigB!.x, sigC!.x)) /
    2
  ).toFixed(2);
  const hubY = +(
    (Math.min(sigA!.y, sigB!.y, sigC!.y) + Math.max(sigA!.y, sigB!.y, sigC!.y)) /
    2
  ).toFixed(2);
  const radarReach = Math.max(
    Math.hypot(sigA!.x - hubX, sigA!.y - hubY),
    Math.hypot(sigB!.x - hubX, sigB!.y - hubY),
    Math.hypot(sigC!.x - hubX, sigC!.y - hubY),
  );
  const radarDiameter = `${Math.max(radarReach * 2.55, 62).toFixed(1)}%`;

  return (
    <div
      className="rx-lens"
      data-beat={beat}
      data-vertical={vertical}
      data-dim={dimWorld ? "true" : "false"}
      data-decided={showDecision ? "true" : "false"}
      data-focus={focus}
    >
      <div className="rx-lens-media" aria-hidden="true">
        <Image
          src={story.image.src}
          alt=""
          fill
          priority
          sizes="(max-width: 980px) 100vw, 58vw"
          className="rx-lens-img"
          style={{ objectPosition: story.image.position }}
        />
        <div className="rx-lens-dark" />
        <div className="rx-lens-left-blend" />
        <div className="rx-lens-scan" data-on={showRadar ? "true" : "false"} />
        <div className="rx-lens-vignette" aria-hidden="true" />
      </div>

      <div className="rx-lens-place" data-on={showPlace ? "true" : undefined}>
        <strong>{story.place.location}</strong>
        <span>
          {story.place.time} · {story.place.phase}
        </span>
      </div>

      <div
        className="rx-lens-endline"
        data-on={showEndline ? "true" : undefined}
        aria-hidden={!showEndline}
      >
        <strong>Nothing off the RADR.</strong>
      </div>

      {onReplay ? (
        <button
          type="button"
          className="rx-lens-replay"
          onClick={handleReplay}
          aria-label="Replay"
          title="Replay"
        >
          ↻
        </button>
      ) : null}

      {showSignals ? (
        <div
          className="rx-lens-signals"
          data-on="true"
          data-radar={showRadar ? "true" : "false"}
        >
          {story.signals.map((s, i) => (
            <div
              key={s.id}
              className="rx-lens-sig"
              data-on={i < signalCount ? "true" : "false"}
              data-caught={showRadar ? "true" : "false"}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <i className="rx-lens-sig-dot" />
              <div className="rx-lens-sig-copy">
                <em>{s.label}</em>
                <strong>{s.value}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showRadar ? (
        <div
          className="rx-lens-radar"
          data-on="true"
          style={{ ["--radar-d" as string]: radarDiameter }}
          aria-hidden="true"
        >
          <i
            className="rx-lens-radar-core"
            style={{ left: `${hubX}%`, top: `${hubY}%` }}
          />
          {([1, 2, 3, 4] as const).map((i) => (
            <i
              key={i}
              className="rx-lens-radar-ring"
              data-i={i}
              style={{ left: `${hubX}%`, top: `${hubY}%` }}
            />
          ))}
          <i
            className="rx-lens-radar-sweep"
            style={{ left: `${hubX}%`, top: `${hubY}%` }}
          />
        </div>
      ) : null}

      {showDemand ? (
        <div className="rx-lens-center" data-on="true">
          <div className="rx-lens-demand" data-calc={showCalc ? "true" : "false"}>
            <div>
              <em>{story.demandLabel}</em>
              <strong>{story.demandValue}</strong>
            </div>
            <div>
              <em>{story.availableLabel}</em>
              <strong>{story.availableValue}</strong>
            </div>
            {showCalc ? (
              <p className="rx-lens-math" aria-hidden="true">
                <span>{story.calcLeft}</span>
                <span>−</span>
                <span>{story.calcRight}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {showProblem ? (
        <div className="rx-lens-punch" data-on="true" data-tone="problem">
          <strong>{story.problem}</strong>
        </div>
      ) : null}

      {showObvious ? (
        <div
          className="rx-lens-obvious"
          data-on="true"
          data-killed={obviousKilled ? "true" : "false"}
        >
          <em>{story.obviousLabel}</em>
          <strong>{story.obviousMove}</strong>
        </div>
      ) : null}

      {showFactors ? (
        <ul className="rx-lens-factors" data-on="true">
          {story.factors.map((f, i) => (
            <li key={f.id} style={{ animationDelay: `${i * 160}ms` }}>
              {f.label}
            </li>
          ))}
        </ul>
      ) : null}

      {showFork ? (
        <div
          className="rx-lens-futs"
          data-on="true"
          data-selected={forkSelected ? "true" : "false"}
          data-kill-obvious="true"
        >
          {story.futures.map((f) => (
            <div
              key={f.id}
              className="rx-lens-fut"
              data-pick={f.selected ? "true" : undefined}
              data-dead={f.obvious ? "true" : undefined}
            >
              <em>{f.label}</em>
              <strong>{formatDecisionMoney(f.expected)}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {showDecision ? (
        <article className="rx-lens-decision" data-on="true">
          <header className="rx-lens-decision-head">
            <div>
              <strong>{story.displayId}</strong>
              <em>RECOMMENDATION</em>
            </div>
            <div>
              <strong>{story.deadline}</strong>
              <em>DECIDE BY</em>
            </div>
          </header>

          <p className="rx-lens-decision-reject">{story.rejectLabel}</p>

          <h3 className="rx-lens-decision-title">
            {story.recommendLines[0]}
            {story.recommendLines[1] ? (
              <>
                <br />
                {story.recommendLines[1]}
              </>
            ) : null}
          </h3>

          <div className="rx-lens-decision-value">
            <strong className="rx-econ-verified">
              {formatDecisionMoney(story.expected)}
            </strong>
            <em>{story.expectedLabel}</em>
          </div>

          {story.fallback ? (
            <p className="rx-lens-decision-note">{story.fallback}</p>
          ) : null}

          <div className="rx-lens-decision-band" aria-hidden="true">
            <span />
          </div>

          <button type="button" className="rx-btn rx-btn-primary rx-lens-approve">
            Approve plan
          </button>

          <div className="rx-lens-decision-tools">
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
          </div>

          {simulate ? (
            <ul className="rx-lens-sim">
              {story.futures.map((f) => (
                <li key={f.id} data-pick={f.selected ? "true" : undefined}>
                  <span>{f.label}</span>
                  <strong>{formatDecisionMoney(f.expected)}</strong>
                </li>
              ))}
            </ul>
          ) : null}

          {why ? (
            <div className="rx-lens-why">
              <p>
                Predictions are estimates based on available data. Actual outcomes
                can differ.
              </p>
              <p>
                {story.why.sources} · {story.why.sample}
              </p>
              <div className="rx-lens-why-grid">
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
              <p className="rx-lens-demo">Illustrative product data</p>
            </div>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
