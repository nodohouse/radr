"use client";

import { useEffect, useState } from "react";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

export type ReplayBeat = {
  at: string;
  title: string;
  detail: string;
  kind:
    | "detect"
    | "recommend"
    | "context"
    | "futures"
    | "approve"
    | "observe"
    | "verify"
    | "learn";
};

const PEAK_REPLAY: ReplayBeat[] = [
  {
    at: LIVE_SCENARIO.decisionFormedClock,
    title: "Capacity collision detected",
    detail: "Kitchen 92% · 38 covers inbound · 2 walk-ins waiting",
    kind: "detect",
  },
  {
    at: "19:39",
    title: "Recommendation prepared",
    detail: "Wait 12 minutes · €620 expected incremental contribution vs seat-now",
    kind: "recommend",
  },
  {
    at: "19:41",
    title: "Operator context",
    detail: "GM: VIP party at the bar must sit by 19:50",
    kind: "context",
  },
  {
    at: "19:41",
    title: "Futures re-simulated",
    detail: "Seat VIP at 19:50 · hold second walk-in · maintain delivery throttle",
    kind: "futures",
  },
  {
    at: "19:43",
    title: "Plan approved",
    detail: "Prepared actions remain unwritten until systems of record confirm",
    kind: "approve",
  },
  {
    at: LIVE_SCENARIO.peakObservedClock,
    title: "Kitchen pressure peaked",
    detail: "Load held below seat-now counterfactual",
    kind: "observe",
  },
  {
    at: LIVE_SCENARIO.turnsObservedClock,
    title: "Second turns observed",
    detail: "More turns protected than seat-now path modeled",
    kind: "observe",
  },
  {
    at: LIVE_SCENARIO.outcomeCalculatedClock,
    title: "Outcome calculated",
    detail: "€590 observed incremental contribution",
    kind: "observe",
  },
  {
    at: "Next day",
    title: "Value verified",
    detail: "€590 verified incremental · strongly attributed",
    kind: "verify",
  },
  {
    at: "Memory",
    title: "Playbook updated",
    detail: "Peak hold when kitchen ≥90% and inbound ≥30 covers in <25m",
    kind: "learn",
  },
];

const MENU_REPLAY: ReplayBeat[] = [
  {
    at: "Pre-service",
    title: "STAR misread",
    detail: "Tuna Tataki high contribution · classic menu engineering keeps featuring",
    kind: "detect",
  },
  {
    at: "Peak model",
    title: "Capacity intensity revealed",
    detail: "At 19:00–20:30 contribution / kitchen minute falls vs peers",
    kind: "futures",
  },
  {
    at: "Recommend",
    title: "This star hurts at peak",
    detail: "Keep on menu · de-emphasize only 19:00–20:30",
    kind: "recommend",
  },
  {
    at: "Approve",
    title: "Peak feature shifted",
    detail: "Prepared: feature faster alternative during compression",
    kind: "approve",
  },
  {
    at: "Observed",
    title: "Cold-station load eased",
    detail: "Ticket time held · contribution mix improved",
    kind: "observe",
  },
  {
    at: "Verified",
    title: "€610 verified",
    detail: "MODELED attribution · playbook v3",
    kind: "verify",
  },
  {
    at: "Memory",
    title: "Playbook",
    detail: "When kitchen ≥90% and dish €/min weak: de-emphasize peak window only",
    kind: "learn",
  },
];

export function replayForDecision(id: string): ReplayBeat[] {
  if (id === DECISION_IDS.peak) return PEAK_REPLAY;
  if (id === DECISION_IDS.menuPeak) return MENU_REPLAY;
  return [];
}

/**
 * Cinematic Decision Replay — scrub the operating documentary.
 */
export function DecisionReplay({ decisionId }: { decisionId: string }) {
  const beats = replayForDecision(decisionId);
  const reduced = useReducedMotionSafe();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    setActive(0);
    setPlaying(!reduced);
  }, [decisionId, reduced]);

  useEffect(() => {
    if (!playing || reduced || !beats.length) return;
    if (active >= beats.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setActive((i) => i + 1), 1600);
    return () => clearTimeout(t);
  }, [playing, active, beats.length, reduced]);

  if (!beats.length) return null;
  const current = beats[active]!;

  return (
    <section className="rp-replay rp-replay-cinema" id="replay" aria-label="Decision replay">
      <div className="rp-replay-head">
        <div>
          <p className="rp-replay-kicker">Historical demo replay</p>
          <h2>How it unfolded</h2>
          <p className="rp-drec-quiet">
            Documentary of the full eventual lifecycle — not current state
          </p>
        </div>
        <div className="rp-replay-controls">
          <button
            type="button"
            className="rp-drec-disclose"
            onClick={() => {
              setActive(0);
              setPlaying(true);
            }}
          >
            Restart
          </button>
          <button
            type="button"
            className="rp-drec-disclose"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <article className="rp-replay-focus" data-kind={current.kind}>
        <time>{current.at}</time>
        <strong>{current.title}</strong>
        <span>{current.detail}</span>
      </article>

      <ol className="rp-replay-strip" role="tablist">
        {beats.map((b, i) => (
          <li key={`${b.at}-${i}`} data-kind={b.kind} data-on={i === active ? "true" : undefined}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i);
                setPlaying(false);
              }}
            >
              <time>{b.at}</time>
              <strong>{b.title}</strong>
              <span>{b.detail}</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
