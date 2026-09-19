"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import { sceneForDecision } from "@/data/demo/visualAssets";
import { PEAK_SERVICE_CLOCK } from "@/lib/radr/decision/demos/peakClock";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

type Mode = "decision" | "why";

const WHY_STEPS = [
  { id: "covers", label: "38 covers inbound", detail: "Reservations · 22 min" },
  { id: "walk", label: "2 walk-ins waiting", detail: "Floor" },
  { id: "del", label: "Delivery +31%", detail: "Channel" },
  { id: "kds", label: "KDS ticket 14m", detail: "Rising" },
  { id: "kit", label: "Kitchen 92%", detail: "Cold station constrained" },
] as const;

/**
 * Live operating canvas — cinematic service + one Decision.
 * WHY transforms the canvas; does not navigate away.
 */
export function LiveOperatingCanvas({
  primary,
  onApprove,
}: {
  primary: DecisionRecord;
  onApprove?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("decision");
  const [whyStep, setWhyStep] = useState(0);
  const reduced = useReducedMotionSafe();
  const metric = formatPrimaryMetric(primary);
  const scene = sceneForDecision(primary.id);
  const isPeak = primary.id === DECISION_IDS.peak;

  useEffect(() => {
    if (mode !== "why" || reduced) return;
    setWhyStep(0);
    const timers = WHY_STEPS.map((_, i) =>
      window.setTimeout(() => setWhyStep(i + 1), 280 + i * 320),
    );
    return () => timers.forEach(clearTimeout);
  }, [mode, reduced]);

  return (
    <div
      className="rp-live-canvas"
      data-mode={mode}
      data-peak={isPeak ? "true" : undefined}
    >
      {scene ? (
        <div className="rp-live-scene" data-dim={mode === "why" ? "true" : undefined}>
          <OperatingScene asset={scene} priority aspect="21/9" />
          {isPeak ? (
            <div className="rp-live-overlay" aria-hidden="true">
              <svg viewBox="0 0 100 40" className="rp-live-wave">
                <path
                  className="rp-live-wave-path"
                  d="M0 28 Q12 22 24 26 T48 20 T72 24 T100 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.4"
                />
                <circle className="rp-live-wave-dot" cx="42" cy="22" r="1.2" />
              </svg>
              <div className="rp-live-meters">
                <span>Floor 78%</span>
                <span data-tone="watch">Kitchen 92%</span>
                <span data-tone="risk">Wave 19:10</span>
              </div>
              <div className="rp-live-deadline">
                <em>{PEAK_SERVICE_CLOCK.nowLabel}</em>
                <span>→</span>
                <strong>{PEAK_SERVICE_CLOCK.deadlineLabel}</strong>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rp-live-stage">
        {mode === "decision" ? (
          <article className="rp-live-decision">
            <p className="rp-live-kicker">
              One Decision needs you · {displayDecisionId(primary.id)} · DEMO
            </p>
            <h2 className="rp-live-rec">{primary.recommendationHeadline}</h2>
            {metric ? (
              <p className="rp-live-econ">
                <strong>{metric.money}</strong>
                <span>{metric.caption}</span>
              </p>
            ) : null}
            <p className="rp-live-deadline-copy">
              {primary.decisionDeadline || primary.contextLine}
            </p>
            <div className="rp-live-actions">
              <button
                type="button"
                className="rp-cc-cta"
                onClick={() => setMode("why")}
              >
                Why
              </button>
              <Link
                href={`/app/decisions/${primary.id}#futures`}
                className="rp-drec-secondary"
              >
                Compare Futures
              </Link>
              <Link
                href={`/app/decisions/${primary.id}#context`}
                className="rp-drec-secondary"
              >
                Add context
              </Link>
              {onApprove ? (
                <button type="button" className="rp-drec-secondary" onClick={onApprove}>
                  Approve
                </button>
              ) : (
                <Link
                  href={`/app/decisions/${primary.id}`}
                  className="rp-drec-secondary"
                >
                  Approve
                </Link>
              )}
            </div>
          </article>
        ) : (
          <div className="rp-live-why">
            <button
              type="button"
              className="rp-live-why-back"
              onClick={() => setMode("decision")}
            >
              ← Decision
            </button>
            <p className="rp-live-kicker">Why RADR believes this</p>
            <ul className="rp-live-why-nodes">
              {WHY_STEPS.map((s, i) => (
                <li key={s.id} data-on={whyStep > i ? "true" : undefined}>
                  <strong>{s.label}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ul>
            <div
              className="rp-live-why-converge"
              data-on={whyStep >= WHY_STEPS.length ? "true" : undefined}
            >
              <p>Capacity collision</p>
              <p>9 second turns at risk</p>
              {metric ? (
                <p className="rp-live-why-econ">
                  <strong>{metric.money}</strong> economic effect
                </p>
              ) : null}
            </div>
            <div className="rp-live-actions">
              <Link
                href={`/app/decisions/${primary.id}`}
                className="rp-cc-cta"
              >
                Open full Decision
              </Link>
              <Link href="/app/service" className="rp-drec-secondary">
                Service Map
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
