"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";
import "./product-showcase.css";

const SECTIONS = ["Control Center", "Decisions", "Futures", "Value"] as const;
const ICONS = [
  "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  "m5 12 4 4L19 6M4 21h16",
  "M5 3v5c0 4 14 0 14 5v8M5 8v13m-3-3 3 3 3-3m8 0 3 3 3-3",
  "m4 13 5 5L20 6",
];

/** A synthetic product tour, never a live feed or an executable approval flow. */
export function ProductBriefPreview() {
  const [section, setSection] = useState(0);
  const [motionReady, setMotionReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const auto =
    motionReady &&
    playing &&
    !engaged &&
    visible &&
    documentVisible &&
    reduced === false;

  useEffect(() => {
    setMotionReady(true);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    const onVisibility = () => setDocumentVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(
      () => setSection((s) => (s + 1) % SECTIONS.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [auto]);
  function select(next: number) {
    setSection(next);
    setPlaying(false);
  }

  return (
    <div
      ref={root}
      className="rsc-tablet"
      data-running={auto ? "true" : undefined}
      aria-label="RADR interactive product showcase, illustrative demo"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);
      }}
    >
      <span className="rsc-camera" aria-hidden="true" />
      <div className="rsc-screen">
        <div className="rsc-chrome">
          <FrozenRadrLogo variant="mark" width={26} />
          <strong>RADR</strong>
          <span className="rsc-demo">Illustrative demo · {venue.clock}</span>
        </div>
        <div className="rsc-tourbar">
          <div
            className="rsc-tabs"
            role="tablist"
            aria-label="Product showcase sections"
          >
            {SECTIONS.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={section === i}
                aria-controls={`${id}-panel`}
                tabIndex={section === i ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => {
                  if (
                    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 3
                        : (i + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                  select(next);
                  document.getElementById(`${id}-tab-${next}`)?.focus();
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS[i]} />
                </svg>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rsc-play"
            aria-label={
              motionReady && reduced
                ? "Automatic tour disabled for reduced motion"
                : playing
                  ? "Pause product tour"
                  : "Play product tour"
            }
            aria-pressed={motionReady && reduced ? false : playing}
            disabled={motionReady && reduced === true}
            onClick={() => setPlaying((p) => !p)}
          >
            {motionReady && reduced ? "▷" : playing ? "Ⅱ" : "▷"}
          </button>
        </div>
        <div
          className="rsc-stage"
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${section}`}
          tabIndex={0}
        >
          <div key={section} className="rsc-scene">
            <div className="rsc-heading">
              <div>
                <p>{venue.displayName} · Dinner service</p>
                <h3>
                  {
                    [
                      "Your operation, in focus.",
                      "One decision. The whole story.",
                      "See the trade-off first.",
                      "Expected is not verified.",
                    ][section]
                  }
                </h3>
              </div>
              <span className="rsc-avatar">A</span>
            </div>
            {section === 0 ? (
              <>
                <div className="rsc-metrics">
                  <div>
                    <span>Needs you</span>
                    <strong>01</strong>
                    <small>Decision to review</small>
                  </div>
                  <div>
                    <span>Confidence</span>
                    <strong>{venue.confidencePct}%</strong>
                    <small>Illustrative estimate</small>
                  </div>
                  <div>
                    <span>Expected protected</span>
                    <strong>{venue.expectedFormatted}</strong>
                    <small>Tonight · modeled</small>
                  </div>
                </div>
                <div className="rsc-chart">
                  <div>
                    <span>Service pressure</span>
                    <span className="rsc-chart-key">
                      <i /> Demand <b /> Capacity
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 480 100"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Animated illustrative demand rising above planned kitchen capacity"
                  >
                    <path
                      className="rsc-grid"
                      d="M0 25H480M0 50H480M0 75H480"
                    />
                    <path className="rsc-capacity" d="M0 58H480" />
                    <path
                      className="rsc-area"
                      d="M0 86 40 77 80 81 120 61 160 66 200 48 240 56 280 29 320 40 360 16 400 27 440 8 480 16V100H0Z"
                    />
                    <path
                      pathLength="1"
                      className="rsc-line"
                      d="M0 86 40 77 80 81 120 61 160 66 200 48 240 56 280 29 320 40 360 16 400 27 440 8 480 16"
                    />
                    <circle className="rsc-chart-tip" cx="480" cy="16" r="4" />
                  </svg>
                  <div>
                    <small>19:00</small>
                    <small>19:30</small>
                    <small>20:00 · modeled</small>
                  </div>
                </div>
                <div className="rsc-decision">
                  <span className="rsc-signal">
                    NEEDS YOU · {venue.decisionId}
                  </span>
                  <h4>Pace the next seating wave.</h4>
                  <p>Demand is ahead of plan. Give the kitchen 12 minutes.</p>
                  <button
                    type="button"
                    className="rsc-action"
                    onClick={() => select(1)}
                  >
                    Review the decision <span>→</span>
                  </button>
                </div>
              </>
            ) : section === 1 ? (
              <>
                <div className="rsc-decision">
                  <span className="rsc-signal">
                    EVIDENCE · {venue.decisionId}
                  </span>
                  <h4>Twelve minutes to protect tonight.</h4>
                  <p>
                    Seating demand and kitchen capacity point to the same
                    constraint. Review the evidence before choosing a response.
                  </p>
                </div>
                <div className="rsc-evidence">
                  <div>
                    <span>01</span>
                    <div>
                      <strong>Reservations</strong>
                      <p>The next seating wave is approaching.</p>
                    </div>
                  </div>
                  <div>
                    <span>02</span>
                    <div>
                      <strong>Kitchen capacity</strong>
                      <p>The kitchen is the service constraint.</p>
                    </div>
                  </div>
                  <div>
                    <span>03</span>
                    <div>
                      <strong>
                        Decision confidence · {venue.confidencePct}%
                      </strong>
                      <p>Synthetic evidence, not a live prediction.</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rsc-action"
                  onClick={() => select(2)}
                >
                  Compare the two futures <span>→</span>
                </button>
              </>
            ) : section === 2 ? (
              <>
                <p className="rsc-intro">
                  Same restaurant. Same dinner rush. Two possible next moves.
                </p>
                <div className="rsc-futures">
                  <div>
                    <span>Alternative</span>
                    <h4>Keep seating</h4>
                    <p>Accept the next wave. Kitchen pressure remains.</p>
                    <strong>Baseline</strong>
                    <small>No incremental protected value assumed.</small>
                    <i style={{ width: "44%" }} />
                  </div>
                  <div data-recommended="true">
                    <span>Recommended · demo</span>
                    <h4>Pace 12 minutes</h4>
                    <p>Give the kitchen room to absorb the next wave.</p>
                    <strong>{venue.expectedFormatted}</strong>
                    <small>
                      Expected protected tonight · {venue.confidencePct}%
                      confidence
                    </small>
                    <i style={{ width: "86%" }} />
                  </div>
                </div>
                <p className="rsc-note">
                  A modeled comparison, not a promise of results. No action is
                  executed.
                </p>
                <button
                  type="button"
                  className="rsc-action"
                  onClick={() => select(3)}
                >
                  See the illustrative outcome <span>→</span>
                </button>
              </>
            ) : (
              <>
                <p className="rsc-intro">
                  A separate completed-service example for {venue.decisionId}.
                  Expected and verified value stay distinct.
                </p>
                <div className="rsc-value">
                  <span>Illustrative completed-service outcome</span>
                  <strong>{venue.verifiedFormatted}</strong>
                  <h4>Protected tonight.</h4>
                  <p>
                    Demo outcome only. This is not evidence of customer results.
                  </p>
                </div>
                <div className="rsc-proof">
                  <span>Decision recorded</span>
                  <span>Outcome compared</span>
                  <span>Demo evidence trail</span>
                </div>
                <Link href="/demo" className="rsc-action">
                  Explore the interactive demo <span>↗</span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="rsc-foot">
          <span>
            <i /> Synthetic data · no system writes
          </span>
          <span>{String(section + 1).padStart(2, "0")} / 04</span>
        </div>
      </div>
    </div>
  );
}
