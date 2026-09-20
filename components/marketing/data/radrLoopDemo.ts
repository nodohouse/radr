/**
 * Marketing fixture for THE RADR LOOP instrument.
 * Canonical recover story only: $192 potential → $184 observed / verified.
 * No invented times or money.
 */

import { HOMEPAGE_DEMO } from "@/components/marketing/data/homepageDemo";
import {
  RADR_LOOP_STAGES,
  type RadrLoopStage,
} from "@/lib/radr/loop";

export type LoopStageMoney = {
  value: string;
  label: string;
  emphasis?: "potential" | "observed" | "verified";
};

export type LoopStageLearn = {
  expected: string;
  observed: string;
  variance: string;
  note: string;
};

export type LoopStageDemo = {
  id: RadrLoopStage;
  /** Short headline for the left detail panel */
  title: string;
  /** One or two lines of explanation */
  body: string;
  /** Optional secondary evidence lines */
  lines?: readonly string[];
  /** Financial moment (Quantify / Verify) */
  money?: LoopStageMoney;
  /** Learn comparison block */
  learn?: LoopStageLearn;
};

const recover = HOMEPAGE_DEMO.findings.recover;
const verified = HOMEPAGE_DEMO.verified;
const variance = recover.potential - recover.amount;

export const RADR_LOOP_DEMO = {
  label: "The RADR Loop",
  scenarioTitle: verified.label.toUpperCase(),
  scenarioTerritory: "RECOVER",
  inputs: ["Reservations", "POS", "Waitlist", "Labor"] as const,
  outputs: ["Waitlist action", "Reservation", "POS outcome"] as const,
  stages: [
    {
      id: "observe" as const,
      title: "Late cancellation detected.",
      body: "Reservation feed updated. Table 14 released close to service.",
      lines: ["Reservations · POS"] as const,
    },
    {
      id: "detect" as const,
      title: "Recoverable inventory identified.",
      body: "High-value inventory became available close to service.",
      lines: ["Table 14 · Recover"] as const,
    },
    {
      id: "understand" as const,
      title: "Waitlist demand can refill the table.",
      body: "Active waitlist demand can refill the table before the service window closes.",
      lines: ["Waitlist · Reservation"] as const,
    },
    {
      id: "quantify" as const,
      title: "Economic consequence calculated.",
      body: "Potential recovery from the released covers - canonical estimate.",
      money: {
        value: `$${recover.potential}`,
        label: "Potential recovery",
        emphasis: "potential" as const,
      },
    },
    {
      id: "prepare" as const,
      title: "Recovery work prepared.",
      body: "Best waitlist match identified. Recovery message prepared.",
      lines: ["Prepared action · Draft ready"] as const,
    },
    {
      id: "act" as const,
      title: "Governed recovery action.",
      body: "Recovery action approved in the supported demo path - not unrestricted autonomy.",
      lines: ["Waitlist action → Reservation"] as const,
    },
    {
      id: "verify" as const,
      title: "Outcome observed.",
      body: "Replacement guest completed service. POS closed the check.",
      money: {
        value: `$${recover.amount}`,
        label: "Observed in POS · Verified Value",
        emphasis: "verified" as const,
      },
      lines: [`Verified Value $${verified.amount}`] as const,
    },
    {
      id: "learn" as const,
      title: "Outcome retained for the next cycle.",
      body: "Expected versus actual compared. No automatic model update claimed.",
      learn: {
        expected: `$${recover.potential}`,
        observed: `$${recover.amount}`,
        variance: `$${variance}`,
        note: "Outcome retained for future recovery estimates.",
      },
    },
  ] satisfies LoopStageDemo[],
  fullStateLine: "Observe. Understand. Act. Verify. Learn.",
} as const;

export function radrLoopStageOrder(): RadrLoopStage[] {
  return [...RADR_LOOP_STAGES];
}

/** Circular node positions in a 0-100 viewBox. Index 0 = Observe at top. */
export function radrLoopNodePosition(index: number): { x: number; y: number; angle: number } {
  const n = RADR_LOOP_STAGES.length;
  const angle = -Math.PI / 2 + (index / n) * Math.PI * 2;
  const r = 42;
  return {
    x: 50 + r * Math.cos(angle),
    y: 50 + r * Math.sin(angle),
    angle: (angle * 180) / Math.PI,
  };
}

/** Arc path for one of eight equal ring segments (outer radius). */
export function radrLoopSegmentPath(
  index: number,
  radius = 36,
  cx = 50,
  cy = 50,
): string {
  const n = RADR_LOOP_STAGES.length;
  const start = -Math.PI / 2 + (index / n) * Math.PI * 2 - Math.PI / n;
  const end = start + (Math.PI * 2) / n;
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
}
