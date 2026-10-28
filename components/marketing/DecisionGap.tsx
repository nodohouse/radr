"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView } from "motion/react";
import { Glyph } from "./MockupVisuals";
import "./decision-gap.css";

const sources = [
  { name: "POS", detail: "Sales & payments", icon: "restaurant" },
  { name: "PMS", detail: "Bookings & stays", icon: "hotel" },
  { name: "Finance", detail: "Invoices & credits", icon: "document" },
  { name: "Procurement", detail: "Contracts & prices", icon: "box" },
  { name: "Labor", detail: "Schedules & hours", icon: "labor" },
];
const phases = [
  "Your systems provide the evidence",
  "RADR connects the operating context",
  "A relevant insight comes into focus",
  "Your team reviews the next action",
  "The outcome is checked, not assumed",
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
const ease = [0.22, 1, 0.36, 1] as const;

function Connector({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <div className="dg-connector" aria-hidden="true">
      <svg viewBox="0 0 72 40" fill="none">
        <path d="M3 20H65m-6-6 6 6-6 6" stroke="#598a85" strokeWidth="1.3" />
        <motion.path
          d="M3 20H65"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={
            reduced
              ? { pathLength: 1, opacity: 0.7 }
              : { pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }
          }
          transition={{ duration: reduced ? 0 : 0.65, ease }}
        />
      </svg>
    </div>
  );
}

export function DecisionGap() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: 0.2 });
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
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (reduced || !inView || !foreground || paused) return;
    const timer = window.setInterval(
      () => setPhase((p) => (p + 1) % phases.length),
      1600,
    );
    return () => window.clearInterval(timer);
  }, [reduced, inView, foreground, paused, replay]);
  const staticView = reduced;
  return (
    <section
      ref={section}
      className="dg-section"
      id="decision-gap"
      aria-labelledby="gap-title"
      data-phase={phase}
      data-motion={reduced ? "reduced" : "full"}
    >
      <div className="dg-wrap">
        <div className="dg-intro">
          <div>
            <p className="dg-eyebrow">THE DECISION GAP</p>
            <h2 id="gap-title">
              You have data.
              <br />
              Make the next step clear<span>.</span>
            </h2>
          </div>
          <div>
            <p>
              Your tools each tell part of the story. RADR connects their
              evidence, puts the differences in context, and helps your team
              decide what to do — then check the outcome.
            </p>
            <div className="dg-controls">
              {reduced ? (
                <span className="dg-static-label">
                  Static view · reduced motion
                </span>
              ) : (
                <>
                  <button
                    onClick={() => setPaused((p) => !p)}
                    aria-label={
                      paused
                        ? "Play data flow animation"
                        : "Pause data flow animation"
                    }
                  >
                    {paused ? "Play animation" : "Pause animation"}
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      {paused ? (
                        <path d="m5 3 8 5-8 5Z" />
                      ) : (
                        <path d="M4 3h3v10H4zm5 0h3v10H9z" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setPhase(0);
                      setReplay((n) => n + 1);
                      setPaused(false);
                    }}
                    aria-label="Replay data flow animation"
                  >
                    Replay{" "}
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
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
        </div>
        <div
          className="dg-flow"
          aria-label="From operating data, through RADR, to a reviewed decision and a verified outcome"
        >
          <div
            className="dg-column dg-sources"
            data-active={staticView || phase === 0}
          >
            <div className="dg-step">
              <span>01</span>
              <div>
                <h3>Your systems</h3>
                <p>Where the data comes from</p>
              </div>
            </div>
            <div className="dg-source-list">
              {sources.map((source, i) => (
                <motion.div
                  className="dg-source"
                  key={source.name}
                  initial={false}
                  animate={{ opacity: 1 }}
                >
                  <span className="dg-source-icon">
                    <Glyph name={source.icon} size={19} />
                  </span>
                  <strong>{source.name}</strong>
                  <span>{source.detail}</span>
                  <motion.i
                    aria-hidden="true"
                    initial={false}
                    animate={{
                      opacity: staticView || phase === 0 ? 1 : 0.35,
                      scale: staticView || phase === 0 ? 1 : 0.8,
                    }}
                    transition={{
                      duration: reduced ? 0 : 0.35,
                      delay: !reduced && phase === 0 ? i * 0.12 : 0,
                      ease,
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <p className="dg-source-note">
              Connect the systems relevant to your operation.
            </p>
          </div>
          <Connector active={phase === 1 || phase === 2} reduced={reduced} />
          <div
            className="dg-column dg-context"
            data-active={staticView || phase === 1}
          >
            <div className="dg-step">
              <span>02</span>
              <div>
                <h3>RADR connects the dots</h3>
                <p>What the data means together</p>
              </div>
            </div>
            <div className="dg-context-panel">
              <div className="dg-logo">
                <Image
                  src="/brand/radr-wordmark-clean-white.svg"
                  width={132}
                  height={30}
                  alt="RADR"
                />
              </div>
              <h4>One operating picture.</h4>
              <p>
                Match the facts.
                <br />
                Compare what happened with
                <br />
                what should have happened.
              </p>
              <div className="dg-evidence-pair">
                <div>
                  <span>Contract</span>
                  <strong>$6.80/L</strong>
                </div>
                <span aria-hidden="true">≠</span>
                <div>
                  <span>Invoice</span>
                  <strong>$7.45/L</strong>
                </div>
              </div>
              <span className="dg-context-caption">
                <Glyph name="check" size={13} /> Evidence with context
              </span>
            </div>
          </div>
          <Connector
            active={phase === 2 || phase === 3 || phase === 4}
            reduced={reduced}
          />
          <div className="dg-column dg-results">
            <div className="dg-step">
              <span>03</span>
              <div>
                <h3>A clearer next step</h3>
                <p>What your team gets from it</p>
              </div>
            </div>
            <div className="dg-result-list">
              <article
                className="dg-result"
                data-active={staticView || phase === 2}
              >
                <span className="dg-result-icon">
                  <Glyph name="chart" size={18} />
                </span>
                <div>
                  <span className="dg-result-label">INSIGHT</span>
                  <h4>Spot what needs attention.</h4>
                  <p>A supplier price variance is flagged for review.</p>
                </div>
              </article>
              <article
                className="dg-result"
                data-active={staticView || phase === 3}
              >
                <span className="dg-result-icon">
                  <Glyph name="document" size={18} />
                </span>
                <div>
                  <span className="dg-result-label">RECOMMENDED ACTION</span>
                  <h4>Know what to do next.</h4>
                  <p>Review the evidence. Prepare a dispute package.</p>
                  <small>Your team approves the action.</small>
                </div>
              </article>
              <article
                className="dg-result"
                data-active={staticView || phase === 4}
              >
                <span className="dg-result-icon">
                  <Glyph name="check" size={18} />
                </span>
                <div>
                  <span className="dg-result-label">OUTCOME</span>
                  <h4>Verify what actually changed.</h4>
                  <div className="dg-outcome-values">
                    <span>
                      Expected <b>$2,430</b>
                    </span>
                    <span>
                      Observed <b>Pending</b>
                    </span>
                    <span>
                      Verified <b>$0</b>
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <div className="dg-footer">
          <div className="dg-story-status" aria-hidden="true">
            <span className="dg-progress-dots">
              {phases.map((label, i) => (
                <i key={label} data-active={!reduced && i === phase} />
              ))}
            </span>
            <span>
              {reduced
                ? "Evidence → context → decision → verified outcome"
                : phases[phase]}
            </span>
          </div>
          <Link href="/how">
            Explore the platform{" "}
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 12h15m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </Link>
        </div>
        <p className="dg-disclaimer">
          Illustrative supplier example. Expected opportunity is not recovered
          value. Connections and capability availability depend on your setup.
        </p>
      </div>
    </section>
  );
}
