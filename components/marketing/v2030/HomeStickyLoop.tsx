"use client";

/**
 * Scroll story: one product window turns into the next stage.
 * Desktop: ~510vh sticky canvas · progress via useScrollStage.
 * Mobile / reduced-motion: stacked panel + Next stage (no pin).
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PUBLIC_LOOP, PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";
import { stageSwap } from "@/lib/marketing/motion";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import { useScrollStage } from "@/components/marketing/motion/useScrollStage";
import {
  ProductDecisionCanvas,
  type LoopStage,
} from "@/components/marketing/v2030/ProductDecisionCanvas";

const STAGES: {
  id: LoopStage;
  title: string;
  body: string;
  soWhat: string;
}[] = [
  {
    id: "observe",
    title: "Observe",
    body: "Connected systems and operational evidence. one operating picture.",
    soWhat:
      "Reservations, kitchen load, and delivery demand stop living in separate tools.",
  },
  {
    id: "understand",
    title: "Understand",
    body: "What matters, why it matters, and how sure RADR is.",
    soWhat:
      "Kitchen becomes the binding constraint. Not a vague “busy night.”",
  },
  {
    id: "decide",
    title: "Decide",
    body: "Compare futures. Expected outcomes. Confidence before commitment.",
    soWhat:
      "Pace seating protects more contribution than seating now or throttling delivery alone.",
  },
  {
    id: "act",
    title: "Act",
    body: "Prepare, approve, execute within policy. humans stay in control.",
    soWhat:
      "The Decision is prepared for approval. Override is a learning signal.",
  },
  {
    id: "verify",
    title: "Verify",
    body: "Expected ≠ Observed ≠ Verified. Claim only what evidence seals.",
    soWhat:
      "Peak clears. Verified value seals with evidence. Illustrative demo.",
  },
  {
    id: "learn",
    title: "Learn",
    body: "Calibration and playbooks after enough comparable evidence.",
    soWhat:
      "Comparable Friday peaks strengthen the playbook. memory, not a dashboard screenshot.",
  },
];

const VH_PER = 85;

function useIsNarrow(breakpoint = 1024) {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);
  return narrow;
}

function StageCopy({
  stage,
  index,
}: {
  stage: (typeof STAGES)[number];
  index: number;
}) {
  return (
    <div className="rx30-loop-copy">
      <em>
        {String(index + 1).padStart(2, "0")} ·{" "}
        {PUBLIC_LOOP.find((l) => l.id === stage.id)?.label ?? stage.title}
      </em>
      <strong>{stage.title}</strong>
      <span>{stage.body}</span>
      <p className="rx30-loop-sowhat">{stage.soWhat}</p>
    </div>
  );
}

function Intro({ id }: { id: string }) {
  return (
    <header className="rx30-loop-intro">
      <p className="rx30-kicker">How RADR works</p>
      <h2 id={id} className="rx30-h2">
        From signal to outcome.
      </h2>
      <p className="rx30-lead">
        See how RADR turns evidence into a Decision, action, verification and
        learning.
      </p>
    </header>
  );
}

export function HomeStickyLoop() {
  const reduced = usePrefersReducedMotion();
  const narrow = useIsNarrow(1024);
  const usePin = !reduced && !narrow;
  const [stackIdx, setStackIdx] = useState(0);
  const { rootRef, index, setIndex } = useScrollStage(STAGES.length, usePin);

  const active = usePin ? index : stackIdx;
  const stage = STAGES[active] ?? STAGES[0]!;

  function jumpTo(i: number) {
    setIndex(i);
    const el = rootRef.current;
    if (!el) return;
    const total = Math.max(1, el.offsetHeight - window.innerHeight);
    const y =
      el.getBoundingClientRect().top +
      window.scrollY +
      (i / STAGES.length) * total +
      8;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  /* Stacked: mobile or reduced motion */
  if (!usePin) {
    return (
      <section
        className="rx30-loop rx30-loop--stack"
        aria-labelledby="rx30-loop-title"
      >
        <div className="rx30-shell">
          <Intro id="rx30-loop-title" />
          <div className="rx30-loop-mobile-panel">
            <p className="rx30-loop-preview-kicker">
              <span className="rx30-loop-preview-dot" aria-hidden="true" />
              Now showing · {stage.title}
            </p>
            <ProductDecisionCanvas stage={stage.id} cinematic />
            <StageCopy stage={stage} index={stackIdx} />
            <div className="rx30-loop-mobile-ctrls">
              <button
                type="button"
                className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
                disabled={stackIdx === 0}
                onClick={() => setStackIdx((i) => Math.max(0, i - 1))}
              >
                Previous
              </button>
              <span>
                {stackIdx + 1} / {STAGES.length}
              </span>
              <button
                type="button"
                className="rx30-btn rx30-btn-primary"
                disabled={stackIdx === STAGES.length - 1}
                onClick={() =>
                  setStackIdx((i) => Math.min(STAGES.length - 1, i + 1))
                }
              >
                Next stage
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className="rx30-loop rx30-loop--story"
      aria-labelledby="rx30-loop-title"
      style={{ minHeight: `${STAGES.length * VH_PER}vh` }}
    >
      <div className="rx30-loop-pin">
        <div className="rx30-shell">
          <Intro id="rx30-loop-title" />

          <div className="rx30-loop-track">
            <div className="rx30-loop-left">
              <nav className="rx30-loop-nav" aria-label="RADR loop">
                {STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    data-on={i === active ? "true" : undefined}
                    data-past={i < active ? "true" : undefined}
                    aria-pressed={i === active}
                    onClick={() => jumpTo(i)}
                  >
                    {String(i + 1).padStart(2, "0")} · {s.title}
                  </button>
                ))}
              </nav>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={stageSwap}
                >
                  <StageCopy stage={stage} index={active} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="rx30-loop-preview" aria-live="polite">
              <p className="rx30-loop-preview-kicker">
                <span className="rx30-loop-preview-dot" aria-hidden="true" />
                Now showing · {stage.title}
              </p>
              <div className="rx30-loop-morph">
                <ProductDecisionCanvas stage={stage.id} cinematic />
              </div>
              <p className="rx30-loop-preview-hint">
                Same Decision · {PUBLIC_RESTAURANT.decisionId} ·{" "}
                {PUBLIC_RESTAURANT.contextLine}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
