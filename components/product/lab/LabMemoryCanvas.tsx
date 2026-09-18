"use client";

/**
 * Memory — playbooks as learning stories.
 * Tried → observed → verified → next time. Not a dark archive.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { useLab, type MemoryScope } from "./LabContext";
import { formatCanonicalVerified } from "@/lib/radr/product/verifiedValueCanon";

const CHAIN: { id: MemoryScope; n: string; label: string }[] = [
  { id: "comparable", n: "12", label: "Comparable nights" },
  { id: "patterns", n: "5", label: "Patterns" },
  { id: "interventions", n: "4", label: "What we tried" },
  { id: "verified", n: "3", label: "Verified" },
  { id: "playbook", n: "v3", label: "Next time" },
];

type Story = {
  title: string;
  kicker: string;
  tried: string;
  observed: string;
  verified: string;
  next: string;
  euro?: string;
  grade?: "Expected" | "Verified";
};

const STORIES: Record<MemoryScope, Story> = {
  comparable: {
    kicker: "12 comparable Friday services",
    title: "Friday peak capacity",
    tried: "Feature-swap-first vs rush-order across matching Fridays",
    observed: "Kitchen minutes recovered when signature mix de-emphasized",
    verified: "3 nights Verified contribution protected vs seat-now baseline",
    next: "Default Wait-12 + feature path before adding labor",
    euro: "€620",
    grade: "Expected",
  },
  patterns: {
    kicker: "5 patterns",
    title: "Kitchen constraint before seats",
    tried: "Occupancy-led seating vs kitchen-led hold",
    observed: "Occupancy alone misleads when kitchen ≥90%",
    verified: "Pattern held across 5 compressed inbound windows",
    next: "Surface kitchen % on Needs-you before floor density",
  },
  interventions: {
    kicker: "4 interventions",
    title: "Hold · throttle · feature · protect",
    tried: "Prepared action set reused — not a new task list each Friday",
    observed: "Operators approved Wait-12 faster when Futures showed €",
    verified: "Adoption up · false alerts down on matching services",
    next: "Keep Approve → Confirm prepare; never fake SoR writes",
  },
  verified: {
    kicker: "3 verified improvements",
    title: "Contribution protected at peak",
    tried: "Wait-12 + delivery throttle on comparable peaks",
    observed: "Second turns held · comps did not spike",
    verified: "€ matched against seat-now baselines on ledger",
    next: "Promote path into Playbook v3 default",
    euro: formatCanonicalVerified("gm"),
    grade: "Verified",
  },
  playbook: {
    kicker: "Playbook v3",
    title: "Friday peak capacity protocol",
    tried: "Feature-swap-first outperformed rush-order",
    observed: "12 comparable services · kitchen cool-down after hold",
    verified: "3 verified improvements · tuna shortfall matched on ledger",
    next: "Tonight: open Brief → FOH hold + Chef cold-station",
    euro: "€620",
    grade: "Expected",
  },
};

export function LabMemoryCanvas() {
  const { nav, setMemoryScope, goDecision, setSeed, setCenterView } = useLab();
  const scope = nav.memoryScope;
  const story = STORIES[scope];

  return (
    <div className="lab-viewport lab-viewport-memory lab-memory-light lab-surface-light">
      <div className="lab-memory lab-memory-v50">
        <header className="lab-surf-head">
          <div>
            <p className="lab-surf-k">Memory</p>
            <h1 className="lab-surf-title">Learning stories</h1>
            <p className="lab-surf-sub">
              What we tried → observed → verified → next time
            </p>
          </div>
        </header>

        <div className="lab-memory-chain" aria-label="Learning chain">
          {CHAIN.map((step, i) => (
            <button
              key={step.id}
              type="button"
              className="lab-memory-step"
              data-on={scope === step.id ? "true" : undefined}
              onClick={() => setMemoryScope(step.id)}
            >
              <strong>{step.n}</strong>
              <span>{step.label}</span>
              {i < CHAIN.length - 1 ? (
                <em className="lab-memory-arrow" aria-hidden="true">
                  →
                </em>
              ) : null}
            </button>
          ))}
        </div>

        <article className="lab-memory-story">
          <p className="lab-memory-kicker">{story.kicker}</p>
          <h2 className="lab-memory-title">{story.title}</h2>
          {story.euro ? (
            <p className="lab-memory-euro" data-grade={story.grade}>
              <strong>{story.euro}</strong>
              <span>{story.grade}</span>
            </p>
          ) : null}

          <ol className="lab-memory-beats">
            <li>
              <em>Tried</em>
              <p>{story.tried}</p>
            </li>
            <li>
              <em>Observed</em>
              <p>{story.observed}</p>
            </li>
            <li>
              <em>Verified</em>
              <p>{story.verified}</p>
            </li>
            <li>
              <em>Next time</em>
              <p>{story.next}</p>
            </li>
          </ol>
        </article>

        <div className="lab-memory-traj">
          <p className="lab-memory-kicker">Open related Decisions</p>
          <button
            type="button"
            className="lab-memory-learn"
            onClick={() => goDecision(DECISION_IDS.menuPeak, "why")}
          >
            <em>{displayDecisionId(DECISION_IDS.menuPeak)}</em>
            <strong>BUY × LABOR × SELL · peak signature</strong>
            <span>because cold-station minutes burn at peak</span>
          </button>
          <button
            type="button"
            className="lab-memory-learn"
            onClick={() => setSeed("service")}
          >
            <em>{displayDecisionId(DECISION_IDS.peak)}</em>
            <strong>Wait-12 path · Friday capacity</strong>
            <span>because kitchen constraint before seats</span>
          </button>
          <button
            type="button"
            className="lab-memory-learn"
            onClick={() => {
              setCenterView("brief");
              setSeed("service");
            }}
          >
            <em>BRIEF</em>
            <strong>Open FOH / Chef packet</strong>
            <span>because protocol beats dashboard dump</span>
          </button>
        </div>
      </div>
    </div>
  );
}
