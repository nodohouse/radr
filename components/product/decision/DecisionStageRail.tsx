"use client";

/**
 * Decision Room — subtle content navigation (not a numbered lifecycle checklist).
 */

import type { DecisionLifecycleStatus } from "@/lib/radr/decision/lifecycle";

export const DECISION_ROOM_NAV = [
  { id: "recommendation", label: "Recommendation" },
  { id: "why-now", label: "Why now" },
  { id: "causal", label: "Causal" },
  { id: "futures", label: "Futures" },
  { id: "baseline", label: "Baseline" },
  { id: "actions", label: "Action" },
  { id: "outcome", label: "Outcome" },
  { id: "verify", label: "Verification" },
  { id: "memory", label: "Memory" },
] as const;

export type DecisionRoomNavId = (typeof DECISION_ROOM_NAV)[number]["id"];

function progressIndex(status: DecisionLifecycleStatus): number {
  switch (status) {
    case "DETECTED":
    case "UNDERSTANDING":
      return 1;
    case "PREDICTED":
    case "SIMULATED":
      return 3;
    case "RECOMMENDED":
    case "AWAITING_APPROVAL":
      return 0;
    case "APPROVED":
    case "EXECUTING":
      return 5;
    case "OBSERVING":
      return 6;
    case "VERIFIED":
      return 7;
    case "LEARNED":
    case "CLOSED":
      return 8;
    default:
      return 0;
  }
}

export function DecisionStageRail({
  status,
  sections,
}: {
  status: DecisionLifecycleStatus;
  sections: DecisionRoomNavId[];
}) {
  const activeNav = progressIndex(status);
  const items = DECISION_ROOM_NAV.filter((s) => sections.includes(s.id));
  if (items.length < 2) return null;

  return (
    <nav className="rp-drec-nav" aria-label="Decision room sections">
      <ol className="rp-drec-life-thin">
        {items.map((stage) => {
          const idx = DECISION_ROOM_NAV.findIndex((s) => s.id === stage.id);
          const done = idx < activeNav;
          const active = idx === activeNav;
          const future = idx > activeNav;
          return (
            <li
              key={stage.id}
              data-done={done ? "true" : undefined}
              data-active={active ? "true" : undefined}
              data-future={future ? "true" : undefined}
            >
              <a href={`#${stage.id}`} className="rp-drec-life-link">
                <span className="rp-drec-life-dot" aria-hidden="true" />
                <span className="rp-drec-life-label">{stage.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
