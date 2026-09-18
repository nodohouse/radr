/**
 * Autopilot ladder — progressive trust per decision type.
 * Suggest → Stage → Auto within policy → Verified.
 */

import type { LabSeed } from "./labState";

export type AutopilotLevel = 1 | 2 | 3 | 4;

export type PolicyAction = {
  id: string;
  label: string;
  mode: "auto" | "ask" | "demo";
  note: string;
};

export type AutopilotModel = {
  level: AutopilotLevel;
  levelLabel: string;
  interrupt: "needs_you" | "radr_will" | "watching";
  headline: string;
  because: string;
  memoryNote: string;
  policy: PolicyAction[];
  receipt?: {
    staged: string;
    observed: string;
    verified: string;
  };
};

export function autopilotForSeed(
  seed: LabSeed,
  approved: boolean,
): AutopilotModel {
  if (seed === "recover") {
    return {
      level: 4,
      levelLabel: "4 · Verified",
      interrupt: "watching",
      headline: "RADR sealed one credit — Trace matches AP",
      because:
        "Verified €273 = CM-44102 applied_amount on INV-88421 · sealed Trace",
      memoryNote:
        "Sales demo = this one credit → Trace → stop. Draft next credit request only.",
      policy: [
        {
          id: "draft_cm",
          label: "Draft credit request",
          mode: "ask",
          note: "Ask · prepare for Finance approval",
        },
        {
          id: "short_pay",
          label: "Auto short-pay",
          mode: "ask",
          note: "Never auto · always ask",
        },
        {
          id: "remit",
          label: "Auto-remit",
          mode: "ask",
          note: "Never auto · always ask",
        },
      ],
      receipt: {
        staged: "Credit request drafted (historical)",
        observed: "CM-44102 posted in AP",
        verified: "€273 sealed · Trace book-matchable",
      },
    };
  }

  return {
    level: approved ? 2 : 1,
    levelLabel: approved ? "2 · Stage" : "1 · Suggest",
    interrupt: approved ? "radr_will" : "needs_you",
    headline: approved
      ? "RADR will hold walk-ins + throttle delivery"
      : "Needs you · kitchen pattern at 92%",
    because: approved
      ? "Staged within policy · €620 Expected until verified after service"
      : "Interrupt — first compressed Friday this month at this kitchen %",
    memoryNote: "Seen 12 similar Fridays · auto-stage allowed after Confirm prepare",
    policy: [
      {
        id: "throttle",
        label: "Throttle delivery 25m",
        mode: "auto",
        note: "Policy · reversible channel throttle",
      },
      {
        id: "hold_walkins",
        label: "Hold 2 walk-ins",
        mode: "ask",
        note: "Ask once · then auto on similar Fridays",
      },
      {
        id: "ig_story",
        label: "Draft IG story (template)",
        mode: "demo",
        note: "Demo actuator · not Verified money",
      },
      {
        id: "post_ig",
        label: "Post to Instagram",
        mode: "ask",
        note: "Always ask · brand voice",
      },
    ],
    receipt: approved
      ? {
          staged: "Hold · throttle · feature path prepared",
          observed: "After service close",
          verified: "€620 seals when contribution matches Trace",
        }
      : undefined,
  };
}

export const AUTOPILOT_LADDER: {
  level: AutopilotLevel;
  label: string;
  blurb: string;
}[] = [
  { level: 1, label: "Suggest", blurb: "Recommend · human decides" },
  { level: 2, label: "Stage", blurb: "Confirm prepare · no SoR write" },
  { level: 3, label: "Auto", blurb: "Within policy after Verified peers" },
  { level: 4, label: "Verified", blurb: "€ sealed on Trace" },
];
