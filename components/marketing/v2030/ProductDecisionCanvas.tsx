"use client";

/**
 * Persistent Decision window for scroll story.
 * Same shell morphs Observe → Learn — no six screenshots.
 * Decide: interactive futures + sparkline. Verify: Expected→Observed→Verified.
 */

import { useEffect, useState } from "react";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
} from "@/lib/marketing/publicCanon";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

export type CanvasWorld = "restaurant" | "hotel";
export type LoopStage =
  | "observe"
  | "understand"
  | "decide"
  | "act"
  | "verify"
  | "learn";

type Props = {
  world?: CanvasWorld;
  stage?: LoopStage;
  className?: string;
  cinematic?: boolean;
};

const STAGE_ORDER: LoopStage[] = [
  "observe",
  "understand",
  "decide",
  "act",
  "verify",
  "learn",
];

const STAGE_COPY: Record<LoopStage, { title: string; body: string }> = {
  observe: {
    title: "Signals converging",
    body: "Reservations, kitchen load, and delivery demand share one operating picture.",
  },
  understand: {
    title: "Kitchen becomes the constraint",
    body: "Demand ahead of plan. Contribution at risk if seating continues at pace.",
  },
  decide: {
    title: "Compare futures",
    body: "Pace seating protects more contribution than seating now or throttling delivery alone.",
  },
  act: {
    title: "Prepared for approval",
    body: "Hold next seating wave · 12 min. Human approval before material guest impact.",
  },
  verify: {
    title: "Expected → Observed → Verified",
    body: "Peak pressure cleared. Verified value sealed with evidence.",
  },
  learn: {
    title: "Operating Memory",
    body: "Comparable Friday peaks strengthen the playbook after sufficient evidence.",
  },
};

type FutureId = "pace" | "seat" | "throttle" | "reassign" | "keep" | "flex";

type FutureDef = {
  id: FutureId;
  label: string;
  value: string;
  preferred: boolean;
  tip: string;
  pressure: string;
  risk: string;
  /** SVG polyline points for kitchen / service pressure forecast */
  path: string;
  tone: "green" | "coral" | "muted";
};

const REST_FUTURES: FutureDef[] = [
  {
    id: "pace",
    label: PUBLIC_RESTAURANT.actionCompact,
    value: PUBLIC_RESTAURANT.expectedFormatted,
    preferred: true,
    tip: "Kitchen recovers earlier · recommended",
    pressure: "Peak clears · ~20 min",
    risk: "Service pressure controlled",
    path: "0,28 20,22 40,30 60,18 80,12 100,10",
    tone: "green",
  },
  {
    id: "seat",
    label: "SEAT NOW",
    value: "+$410",
    preferred: false,
    tip: "Coral pressure window grows",
    pressure: "Kitchen 97% → overload",
    risk: "Higher guest wait risk",
    path: "0,28 20,24 40,20 60,14 80,8 100,4",
    tone: "coral",
  },
  {
    id: "throttle",
    label: "THROTTLE DELIVERY",
    value: "+$470",
    preferred: false,
    tip: "Pressure falls · lower contribution",
    pressure: "Delivery load cut",
    risk: "Contribution lower than Pace",
    path: "0,28 20,26 40,24 60,22 80,20 100,19",
    tone: "muted",
  },
];

const HOTEL_FUTURES: FutureDef[] = [
  {
    id: "reassign",
    label: "REASSIGN 2 HK",
    value: PUBLIC_HOTEL.expectedFormatted,
    preferred: true,
    tip: "Recommended",
    pressure: "Readiness recovers",
    risk: "Arrivals protected",
    path: "0,28 20,22 40,26 60,16 80,12 100,10",
    tone: "green",
  },
  {
    id: "keep",
    label: "KEEP PRIORITIES",
    value: "$0",
    preferred: false,
    tip: "Cost of doing nothing",
    pressure: "7 arrivals stay at risk",
    risk: "No recovery",
    path: "0,28 20,27 40,26 60,25 80,24 100,23",
    tone: "coral",
  },
  {
    id: "flex",
    label: "CALL FLEX LABOR",
    value: "+$1,620",
    preferred: false,
    tip: "Higher labor cost",
    pressure: "Coverage yes · margin hit",
    risk: "Labor cost up",
    path: "0,28 20,24 40,20 60,18 80,16 100,15",
    tone: "muted",
  },
];

function verbFor(stage: LoopStage, restaurant: boolean, future?: FutureDef): string {
  switch (stage) {
    case "observe":
      return "What changed";
    case "understand":
      return "What matters";
    case "decide":
      if (future) {
        if (future.id === "pace") return PUBLIC_RESTAURANT.actionLabel;
        if (future.id === "seat") return "Seat next wave now";
        if (future.id === "throttle") return "Throttle delivery · protect kitchen";
        if (future.id === "reassign") return PUBLIC_HOTEL.actionLabel;
        if (future.id === "keep") return "Keep current priorities";
        if (future.id === "flex") return "Call flex housekeeping";
      }
      return restaurant
        ? PUBLIC_RESTAURANT.actionLabel
        : PUBLIC_HOTEL.actionLabel;
    case "act":
      return "Prepared for approval";
    case "verify":
      return "Verified after the peak";
    case "learn":
      return "Friday peak playbook";
  }
}

function FuturesSparkline({ future }: { future: FutureDef }) {
  return (
    <div
      className="rx30-spark"
      data-tone={future.tone}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 36" preserveAspectRatio="none">
        <polyline
          key={future.id}
          points={future.path}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Kitchen / service pressure</span>
    </div>
  );
}

type VerifyStep = "expected" | "observed" | "verified";

function VerifySequence({ reduced }: { reduced: boolean }) {
  const [step, setStep] = useState<VerifyStep>(
    reduced ? "verified" : "expected",
  );

  useEffect(() => {
    if (reduced) {
      setStep("verified");
      return;
    }
    setStep("expected");
    const t1 = window.setTimeout(() => setStep("observed"), 700);
    const t2 = window.setTimeout(() => setStep("verified"), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  const rank: Record<VerifyStep, number> = {
    expected: 0,
    observed: 1,
    verified: 2,
  };
  const active = rank[step];

  return (
    <div
      className="rx30-verify-rail rx30-verify-rail--seq"
      data-step={step}
      aria-label="Value states"
    >
      <div
        data-state="expected"
        data-on={active >= 0 ? "true" : undefined}
        data-past={active > 0 ? "true" : undefined}
      >
        <span>Expected</span>
        <strong>{PUBLIC_RESTAURANT.expectedFormatted}</strong>
      </div>
      <div
        data-state="observed"
        data-on={active >= 1 ? "true" : undefined}
        data-past={active > 1 ? "true" : undefined}
      >
        <span>Observed</span>
        <strong>+$605</strong>
      </div>
      <div
        data-state="verified"
        data-on={active >= 2 ? "true" : undefined}
        data-seal={step === "verified" ? "true" : undefined}
      >
        <span>Verified</span>
        <strong>{PUBLIC_RESTAURANT.verifiedFormatted}</strong>
        {step === "verified" ? (
          <em className="rx30-verify-seal" aria-hidden="true">
            ✓
          </em>
        ) : null}
      </div>
    </div>
  );
}

export function ProductDecisionCanvas({
  world = "restaurant",
  stage = "decide",
  className = "",
  cinematic = false,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const r = world === "restaurant";
  const loc = r ? PUBLIC_RESTAURANT : PUBLIC_HOTEL;
  const stageCopy = STAGE_COPY[stage];
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const futures = r ? REST_FUTURES : HOTEL_FUTURES;
  const preferred = futures.find((f) => f.preferred) ?? futures[0]!;
  const [selectedId, setSelectedId] = useState<FutureId>(preferred.id);

  useEffect(() => {
    setSelectedId(preferred.id);
  }, [preferred.id, world, stage]);

  const selected =
    futures.find((f) => f.id === selectedId) ?? preferred;

  return (
    <div
      className={`rx30-product-frame ${cinematic ? "rx30-product-frame--cine" : ""} ${className}`.trim()}
      data-stage={stage}
    >
      <div className="rx30-product-shell">
        {cinematic ? (
          <aside className="rx30-product-rail" aria-hidden="true">
            {STAGE_ORDER.map((s, i) => (
              <span key={s} data-on={i === stageIdx ? "true" : undefined} />
            ))}
            <span />
          </aside>
        ) : null}
        <div className="rx30-product-main">
          <div className="rx30-product-chrome">
            <strong>{loc.displayName}</strong>
            <span>
              {loc.clockLine}
              <i className="rx30-live-dot" aria-hidden="true" />
              LIVE
            </span>
          </div>

          <div className="rx30-product-body" data-stage={stage} key={stage}>
            <p className="rx30-demo-label">Illustrative RADR demo</p>
            <p className="rx30-stage-chip">
              {stage.replace(/^\w/, (c) => c.toUpperCase())}
            </p>
            <p className="rx30-decision-id">
              {r ? PUBLIC_RESTAURANT.decisionId : "D-2401"} · {stageCopy.title}
            </p>
            <h3 className="rx30-decision-verb">
              {verbFor(stage, r, stage === "decide" ? selected : undefined)}
            </h3>
            <p className="rx30-decision-sit">
              {stage === "observe" || stage === "understand"
                ? r
                  ? PUBLIC_RESTAURANT.situation
                  : "Arrivals press readiness. Housekeeping becomes the constraint."
                : stage === "decide"
                  ? selected.tip
                  : stageCopy.body}
            </p>

            {stage === "observe" ? (
              <ul className="rx30-signal-list" aria-label="Signals">
                <li data-enter="1">Reservations · ahead of plan</li>
                <li data-enter="2">Kitchen load · rising</li>
                <li data-enter="3">Delivery demand · concurrent</li>
              </ul>
            ) : null}

            {stage === "understand" ? (
              <>
                <div className="rx30-constraint">
                  <span>Binding constraint</span>
                  <strong>Kitchen capacity</strong>
                </div>
                <div className="rx30-decision-meta">
                  <div>
                    <span>Confidence</span>
                    <strong className="rx30-count-up">
                      {PUBLIC_RESTAURANT.confidencePct}%
                    </strong>
                  </div>
                  <div>
                    <span>Driver</span>
                    <strong>Kitchen load</strong>
                  </div>
                </div>
              </>
            ) : null}

            {stage === "decide" ? (
              <>
                <FuturesSparkline future={selected} />
                <ul className="rx30-futures" aria-label="Compare futures">
                  {futures.map((f) => (
                    <li
                      key={f.id}
                      data-preferred={f.preferred ? "true" : undefined}
                      data-on={selectedId === f.id ? "true" : undefined}
                      data-dim={
                        selectedId !== f.id ? "true" : undefined
                      }
                    >
                      <button
                        type="button"
                        className="rx30-future-btn"
                        aria-pressed={selectedId === f.id}
                        onMouseEnter={() => setSelectedId(f.id)}
                        onFocus={() => setSelectedId(f.id)}
                        onClick={() => setSelectedId(f.id)}
                      >
                        <span>{f.label}</span>
                        <strong>{f.value}</strong>
                        <em className="rx30-future-tip">{f.tip}</em>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="rx30-decision-meta">
                  <div>
                    <span>Expected</span>
                    <strong key={selected.id} className="rx30-meta-swap">
                      {selected.value}
                    </strong>
                  </div>
                  <div>
                    <span>Pressure</span>
                    <strong key={`${selected.id}-p`} className="rx30-meta-swap">
                      {selected.pressure}
                    </strong>
                  </div>
                </div>
                <p className="rx30-future-risk" aria-live="polite">
                  {selected.risk}
                </p>
              </>
            ) : null}

            {stage === "act" ? (
              <div className="rx30-act-panel">
                <p className="rx30-act-badge">Prepared for approval</p>
                <ul className="rx30-act-meta" aria-label="Prepared action">
                  <li>
                    <span>Owner</span>
                    <strong>Floor manager</strong>
                  </li>
                  <li>
                    <span>Deadline</span>
                    <strong>Next seating wave</strong>
                  </li>
                  <li>
                    <span>Policy</span>
                    <strong>Human required</strong>
                  </li>
                </ul>
              </div>
            ) : null}

            {stage === "verify" ? <VerifySequence reduced={!!reduced} /> : null}

            {stage === "learn" ? (
              <div className="rx30-learn-panel rx30-learn-panel--memory">
                <div className="rx30-memory-shrink" aria-hidden="true">
                  <span>{PUBLIC_RESTAURANT.decisionId}</span>
                  <i />
                  <strong>Memory</strong>
                </div>
                <ul className="rx30-memory-priors" aria-label="Comparable decisions">
                  <li>Fri · peak · Soho</li>
                  <li>Fri · peak · West Hollywood</li>
                  <li>Fri · peak · DIFC</li>
                </ul>
                <p className="rx30-act-badge">
                  Friday peak playbook · after sufficient evidence
                </p>
                <ul className="rx30-act-meta" aria-label="Operating Memory">
                  <li>
                    <span>Comparable nights</span>
                    <strong>12</strong>
                  </li>
                  <li>
                    <span>Calibration</span>
                    <strong>Improving</strong>
                  </li>
                  <li>
                    <span>Memory</span>
                    <strong>Not one event</strong>
                  </li>
                </ul>
              </div>
            ) : null}

            {stage === "act" ? (
              <div className="rx30-decision-meta">
                <div>
                  <span>Expected</span>
                  <strong>
                    {r
                      ? PUBLIC_RESTAURANT.expectedFormatted
                      : PUBLIC_HOTEL.expectedFormatted}
                  </strong>
                </div>
                <div>
                  <span>Confidence</span>
                  <strong>
                    {r ? `${PUBLIC_RESTAURANT.confidencePct}%` : "79%"}
                  </strong>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
