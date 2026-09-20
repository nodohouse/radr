"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CANON_PEAK, canonScenario } from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

type Step =
  | "evidence"
  | "initial"
  | "context"
  | "resim"
  | "updated"
  | "learned";

const EVIDENCE = [
  { label: "Floor occupancy", value: "78%" },
  { label: "Walk-ins", value: "Waiting" },
  { label: "Inbound · 22 min", value: "38 covers" },
  { label: "KDS ticket time", value: "14 min ↑" },
  { label: "Kitchen capacity", value: "92%" },
  { label: "Delivery vs plan", value: "+31%" },
  { label: "Second-turn tables", value: "9 at risk" },
  { label: "History", value: ">94% · tickets ≥17m" },
] as const;

const CONTEXT_OPTIONS = [
  { id: "vip", label: "VIP needs seat by 18:50" },
  { id: "allergy", label: "Allergy / special service" },
  { id: "staff", label: "Kitchen recovery faster" },
  { id: "delivery", label: "Delivery spike worse" },
  { id: "other", label: "Manager judgment" },
] as const;

/**
 * Scene 03 — Decision under uncertainty.
 * Peak capacity collision (D-1911) + operator context → re-simulate.
 */
export function SectionDecisionLoop() {
  const [step, setStep] = useState<Step>("evidence");
  const d = CANON_PEAK;
  const wait = canonScenario(d, "wait_12")!;
  const seat = canonScenario(d, "seat_now")!;

  const initialEnds = useMemo(
    () => [
      {
        id: "seat",
        tone: "mute" as const,
        title: "Seat walk-ins now",
        story: "Immediate covers · kitchen 97% · second turns slip",
        endpoint: formatDecisionMoney(seat.expectedContributionEuro ?? 0),
        selected: false,
      },
      {
        id: "wait",
        tone: "radr" as const,
        title: "Wait 12 minutes",
        story: "Throttle delivery · feature fast dish · hold 2 tables",
        endpoint: formatDecisionMoney(wait.expectedContributionEuro ?? 0),
        selected: true,
      },
      {
        id: "stop",
        tone: "base" as const,
        title: "Hard stop",
        story: "Refuse walk-ins · kill delivery · over-corrects",
        endpoint: formatDecisionMoney(180),
        selected: false,
      },
    ],
    [seat.expectedContributionEuro ?? 0, wait.expectedContributionEuro],
  );

  const updatedEnds = useMemo(
    () => [
      {
        id: "seat_all",
        tone: "mute" as const,
        title: "Seat all walk-ins now",
        story: "Ignores VIP timing · still overloads kitchen",
        endpoint: formatDecisionMoney(0),
        selected: false,
      },
      {
        id: "vip_hold",
        tone: "radr" as const,
        title: "Hold 1 · seat VIP 18:50",
        story:
          "VIP seated on time · continue delivery throttle · resume 18:57",
        endpoint: formatDecisionMoney(580),
        selected: true,
      },
      {
        id: "wait_full",
        tone: "base" as const,
        title: "Hold both tables 12 min",
        story: "Misses VIP 18:50 commitment",
        endpoint: formatDecisionMoney(wait.expectedContributionEuro ?? 0),
        selected: false,
      },
    ],
    [wait.expectedContributionEuro],
  );

  const ends = step === "updated" || step === "learned" ? updatedEnds : initialEnds;
  const showPaths = step !== "evidence";
  const selectedOn =
    step === "initial" || step === "updated" || step === "learned";

  function advanceFromEvidence() {
    setStep("initial");
  }

  function openContext() {
    setStep("context");
  }

  function applyContext() {
    setStep("resim");
    window.setTimeout(() => setStep("updated"), 900);
  }

  function markLearned() {
    setStep("learned");
  }

  function reset() {
    setStep("evidence");
  }

  const caption =
    step === "evidence"
      ? "Empty tables. Waiting guests. Multiple systems disagree on whether to seat."
      : step === "initial"
        ? `${d.displayId} · Wait 12 minutes. +€620 vs seating now.`
        : step === "context"
          ? "Add operator context — it becomes part of the Decision Record."
          : step === "resim"
            ? "Operator context added · re-simulating feasible futures…"
            : step === "updated"
              ? "VIP seated at 18:50 · hold one table · resume 18:57."
              : "Verified · GM context refined the night. Playbook remembers.";

  return (
    <section className="rx-dec-film" data-nav-theme="dark" id="decision">
      <div className="rx-shell">
        <header className="rx-cinema-head">
          <p className="rx-cinema-kicker">Decision under uncertainty</p>
          <h2 className="rx-cinema-title">
            Empty tables.
            <br />
            Don&apos;t seat them yet.
          </h2>
          <p className="rx-cinema-lead">
            Reservations, KDS, delivery, menu economics, and table turns —
            none alone answers: should I seat this table right now?
          </p>
        </header>

        <div className="rx-dec-film-stage">
          <div className="rx-dec-film-world" aria-hidden="true">
            <Image
              src=""
              alt=""
              fill
              sizes="100vw"
              className="rx-dec-film-img"
              style={{ objectPosition: "58% 36%" }}
              priority={false}
            />
            <div className="rx-dec-film-veil" />
          </div>

          <p className="rx-dec-film-place">
            {d.property} · 18:42 · {d.displayId}
          </p>

          {step === "evidence" ? (
            <div className="rx-dec-film-problem">
              <div className="rx-dec-film-problem-lead">
                <em>Floor 78% · walk-ins waiting</em>
                <strong>{formatDecisionMoney(d.exposureEuro)}</strong>
                <span>CONTRIBUTION VS SEATING NOW</span>
              </div>
              <ul className="rx-dec-evidence">
                {EVIDENCE.map((e) => (
                  <li key={e.label}>
                    <span>{e.label}</span>
                    <strong>{e.value}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {step === "context" ? (
            <div className="rx-dec-context" role="dialog" aria-label="Add context">
              <em>Add context</em>
              <p className="rx-dec-context-quote">
                “VIP party at the bar needs to sit by 18:50.”
              </p>
              <p className="rx-dec-context-who">GM · Berlin Mitte</p>
              <ul className="rx-dec-context-tags">
                {CONTEXT_OPTIONS.map((c) => (
                  <li key={c.id} data-on={c.id === "vip" ? "true" : undefined}>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {step === "resim" ? (
            <div className="rx-dec-resim" aria-live="polite">
              <em>Operator context added</em>
              <strong>Re-simulating</strong>
              <span>Feasible futures only · constraints hold</span>
            </div>
          ) : null}

          {showPaths && step !== "context" && step !== "resim" ? (
            <div className="rx-dec-film-paths" aria-label="Operating futures">
              <svg
                className="rx-dec-film-svg"
                viewBox="0 0 320 200"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  className="rx-dec-path"
                  data-tone="mute"
                  data-on="true"
                  d="M20 100 C 90 100, 140 40, 300 28"
                />
                <path
                  className="rx-dec-path"
                  data-tone="radr"
                  data-on="true"
                  data-selected={selectedOn ? "true" : "false"}
                  d="M20 100 C 90 100, 150 100, 300 100"
                />
                <path
                  className="rx-dec-path"
                  data-tone="base"
                  data-on="true"
                  d="M20 100 C 90 100, 140 165, 300 178"
                />
              </svg>

              <div className="rx-dec-film-ends" data-on="true">
                {ends.map((t) => (
                  <div
                    key={t.id}
                    className="rx-dec-traj-end"
                    data-tone={t.tone}
                    data-selected={t.selected && selectedOn ? "true" : undefined}
                  >
                    <div className="rx-dec-traj-copy">
                      <strong className="rx-dec-traj-title">{t.title}</strong>
                      <span className="rx-dec-traj-cues">{t.story}</span>
                    </div>
                    <div className="rx-dec-traj-money">
                      <em>Expected contribution</em>
                      <span className="rx-dec-traj-econ">{t.endpoint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === "learned" ? (
            <div className="rx-dec-film-outcome" data-on="true">
              <em>After service</em>
              <strong className="rx-econ-verified">
                {formatDecisionMoney(d.actualProtectedEuro)} protected
              </strong>
              <span>
                vs seat-now · {d.forecastVarianceEuro} vs expected · playbook
                updated
              </span>
            </div>
          ) : null}
        </div>

        <p className="rx-dec-film-caption">{caption}</p>

        <div className="rx-dec-film-actions">
          {step === "evidence" ? (
            <button type="button" className="rx-btn rx-btn-primary" onClick={advanceFromEvidence}>
              See futures
            </button>
          ) : null}
          {step === "initial" ? (
            <>
              <button type="button" className="rx-btn rx-btn-primary" onClick={openContext}>
                Add context
              </button>
              <button type="button" className="rx-btn rx-btn-ghost" onClick={markLearned}>
                Skip to verified
              </button>
            </>
          ) : null}
          {step === "context" ? (
            <button type="button" className="rx-btn rx-btn-primary" onClick={applyContext}>
              Apply · re-simulate
            </button>
          ) : null}
          {step === "updated" ? (
            <button type="button" className="rx-btn rx-btn-primary" onClick={markLearned}>
              After service
            </button>
          ) : null}
          {step === "learned" || step === "resim" ? (
            <button type="button" className="rx-btn rx-btn-ghost" onClick={reset}>
              Replay
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
