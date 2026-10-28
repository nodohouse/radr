"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import { Glyph } from "./MockupVisuals";
import "./decision-gap.css";

const sources = [
  { name: "POS", detail: "Sales & payments", icon: "restaurant" },
  { name: "PMS", detail: "Bookings & stays", icon: "hotel" },
  { name: "Finance", detail: "Invoices & credits", icon: "data" },
  { name: "Procurement", detail: "Contracts & prices", icon: "document" },
  { name: "Labor", detail: "Schedules & hours", icon: "labor" },
];
const outputs = [
  { name: "Insights", detail: "See what matters", icon: "chart" },
  { name: "Futures", detail: "Compare possible outcomes", icon: "spark" },
  {
    name: "Recommendations",
    detail: "Choose a clear next step",
    icon: "check",
  },
  { name: "Actions", detail: "Act with your team in control", icon: "check" },
  { name: "Verification", detail: "Check the actual result", icon: "check" },
];
const subscribeReduced = (listener: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const reducedSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};
const foregroundSnapshot = () => document.visibilityState !== "hidden";

/** A real moving signal on each curve; the dim full path always stays readable. */
function FlowPaths({ mobile = false }: { mobile?: boolean }) {
  return (
    <svg
      className={`dg-streams ${mobile ? "dg-streams-mobile" : "dg-streams-desktop"}`}
      viewBox={mobile ? "0 0 420 770" : "0 0 900 520"}
      fill="none"
      aria-hidden="true"
    >
      {sources.map((source, i) => {
        const y = mobile ? 70 + i * 42 : 65 + i * 92;
        const input = mobile
          ? `M174 ${y} C310 ${y} 310 290 210 300`
          : `M155 ${y} C270 ${y} 275 260 365 260`;
        const end = mobile ? 485 + i * 57 : 65 + i * 92;
        const output = mobile
          ? `M210 410 C210 450 34 435 34 ${end}`
          : `M545 260 C610 260 605 ${end} 690 ${end}`;
        return (
          <g key={source.name}>
            {/* Companion threads echo the approved reference without hiding the direction. */}
            {!mobile && (
              <path
                d={`M155 ${y - 24} C270 ${y - 24} 290 260 365 260`}
                stroke={i % 2 ? "#78ada4" : "#3b99b1"}
                strokeWidth="1"
                opacity=".23"
              />
            )}
            <path className="dg-track dg-track-in" d={input} pathLength="100" />
            <path
              className="dg-packet dg-packet-in"
              d={input}
              pathLength="100"
              style={{ animationDelay: `${i * -0.42}s` }}
            />
            <path
              className="dg-track dg-track-out"
              d={output}
              pathLength="100"
            />
            <path
              className="dg-packet dg-packet-out"
              d={output}
              pathLength="100"
              style={{ animationDelay: `${i * -0.48 - 1.2}s` }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function DecisionGap() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: 0.15 });
  const reduced = useSyncExternalStore(
    subscribeReduced,
    reducedSnapshot,
    () => true,
  );
  const foreground = useSyncExternalStore(
    subscribeVisibility,
    foregroundSnapshot,
    () => true,
  );
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);
  const running = !reduced && inView && foreground && !paused;
  return (
    <section
      ref={section}
      className="dg-section"
      id="decision-gap"
      aria-labelledby="gap-title"
      data-running={running}
      data-motion={reduced ? "reduced" : "full"}
    >
      <div className="dg-wrap">
        <div className="dg-copy">
          <p className="dg-eyebrow">THE DECISION GAP</p>
          <h2 id="gap-title">
            You have data.
            <br />
            But not the full picture<span>.</span>
          </h2>
          <p className="dg-description">
            Your systems each show part of the truth. RADR connects the dots,
            adds context and shows you what to do next.
          </p>
          <p className="dg-explanation">
            From sales, bookings and invoices to a connected operating state —
            then clear decisions, action and evidence of what changed.
          </p>
          <div className="dg-controls">
            {reduced ? (
              <span>Complete flow · reduced motion</span>
            ) : (
              <>
                <button
                  aria-label={
                    paused
                      ? "Play data flow animation"
                      : "Pause data flow animation"
                  }
                  onClick={() => setPaused((p) => !p)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {paused ? (
                      <path d="m5 3 8 5-8 5Z" />
                    ) : (
                      <path d="M4 3h3v10H4zm5 0h3v10H9z" />
                    )}
                  </svg>
                  {paused ? "Play flow" : "Pause flow"}
                </button>
                <button
                  aria-label="Replay data flow animation"
                  onClick={() => {
                    setRun((n) => n + 1);
                    setPaused(false);
                  }}
                >
                  Replay{" "}
                  <svg
                    aria-hidden="true"
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M13 7a5 5 0 1 0 0 4M13 2v5H8" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        <div
          className="dg-visual"
          role="group"
          key={run}
          aria-label="Data flows from POS, PMS, Finance, Procurement and Labor into RADR’s operating state, then out to insights, futures, recommendations, actions and verification."
        >
          <div className="dg-glow" aria-hidden="true" />
          <div className="dg-lane-headings">
            <span>01 · YOUR SYSTEMS</span>
            <span>02 · CONNECTED CONTEXT</span>
            <span>03 · BETTER DECISIONS</span>
          </div>
          <FlowPaths />
          <FlowPaths mobile />
          <div className="dg-inputs">
            {sources.map((source) => (
              <div className="dg-source" key={source.name}>
                <Glyph name={source.icon} size={19} />
                <span>
                  <strong>{source.name}</strong>
                  <small>{source.detail}</small>
                </span>
              </div>
            ))}
            <span className="dg-more">…and more</span>
          </div>
          <div className="dg-core">
            <div className="dg-core-halo" aria-hidden="true" />
            <Image
              src="/brand/radr-wordmark-clean-white.svg"
              width={148}
              height={34}
              alt="RADR"
            />
            <strong>Operating state</strong>
            <span>Evidence + context</span>
            <div className="dg-core-processing" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="dg-outputs">
            {outputs.map((output, i) => (
              <div className="dg-result" key={output.name}>
                <span className="dg-result-icon">
                  <Glyph name={output.icon} size={18} />
                </span>
                <span>
                  <strong>{output.name}</strong>
                  <small>{output.detail}</small>
                </span>
                <i
                  className="dg-arrival"
                  style={{ animationDelay: `${i * -0.48 - 1.2}s` }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="dg-caption">
        <span>Connect the evidence</span>
        <i aria-hidden="true">→</i>
        <span>Understand what matters</span>
        <i aria-hidden="true">→</i>
        <span>Act and verify the outcome</span>
      </div>
    </section>
  );
}
