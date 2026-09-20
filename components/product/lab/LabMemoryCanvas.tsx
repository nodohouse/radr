"use client";

/**
 * Memory — recovery patterns that earn Autopilot trust.
 * Not a dark archive.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { useLab, type MemoryScope } from "./LabContext";
import { formatCanonicalVerified } from "@/lib/radr/product/verifiedValueCanon";

const CHAIN: { id: MemoryScope; n: string; label: string }[] = [
  { id: "comparable", n: "12", label: "What we saw" },
  { id: "patterns", n: "5", label: "What repeats" },
  { id: "interventions", n: "4", label: "What we tried" },
  { id: "verified", n: "3", label: "What verified" },
  { id: "playbook", n: "v3", label: "What changes next" },
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
    kicker: "What we saw",
    title: "Repeat supplier leakage",
    tried: "Bluefin oil variance across 12 invoice windows",
    observed: "Same contract · same UOM · credit often issued then unapplied",
    verified: "€273 matched when RADR tracked CM → AP apply",
    next: "Auto-stage dispute package · always ask before send",
    euro: "€273",
    grade: "Verified",
  },
  patterns: {
    kicker: "What repeats",
    title: "Reconciliation + procurement patterns",
    tried: "Settlement shorts vs delivery platforms · cross-site oil prices",
    observed: "Refund treatment + promo funding explain most €293 gaps",
    verified: "Pattern held across 5 close windows · 3 sites",
    next: "Surface settlement mismatch as Decision — not a spreadsheet",
  },
  interventions: {
    kicker: "What we tried",
    title: "Recovery actions that work",
    tried: "Dispute · hold PO · waitlist recovery · yield fix before reprice",
    observed: "Finance approved faster when evidence pack was complete",
    verified: "Adoption up · false AP alerts down",
    next: "Promote Stage permission where outcomes verified 3×",
  },
  verified: {
    kicker: "What verified",
    title: "Verified Value banked",
    tried: "Supplier credit path + peak Wait-12 on comparable services",
    observed: "Credits matched · contribution protected vs seat-now",
    verified: "Ledger-matched Verified in current scope",
    next: "Eligible for Autopilot Stage — not Auto send",
    euro: formatCanonicalVerified("cfo"),
    grade: "Verified",
  },
  playbook: {
    kicker: "What changes next time",
    title: "Autopilot trust progression",
    tried: "Suggest → Stage → Auto within policy from Memory",
    observed: "Downgrade when evidence stale · pattern differs · risk rises",
    verified: "3 verified improvements · D-4102 credit path matched on books",
    next: "CFO: open exceptions first · GM: perishable risk + Brief",
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
            <h1 className="lab-surf-title">What earns Autopilot</h1>
            <p className="lab-surf-sub">
              Repeat leaks · successful recoveries · trust progression
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
                <span className="lab-memory-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <article className="lab-memory-story" data-grade={story.grade}>
          <p className="lab-memory-kicker">{story.kicker}</p>
          <h2 className="lab-memory-title">{story.title}</h2>
          {story.euro ? (
            <p className="lab-memory-euro" data-grade={story.grade}>
              <strong>{story.euro}</strong>
              <span>{story.grade}</span>
            </p>
          ) : null}
          <ul className="lab-memory-beats">
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
              <em>Next</em>
              <p>{story.next}</p>
            </li>
          </ul>
          <div className="lab-memory-actions">
            <button
              type="button"
              onClick={() => {
                setSeed("recover");
                goDecision(DECISION_IDS.supplier);
              }}
            >
              Open {displayDecisionId(DECISION_IDS.supplier)}
            </button>
            <button type="button" onClick={() => setCenterView("brief")}>
              Open Brief
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
