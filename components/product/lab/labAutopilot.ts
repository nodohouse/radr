/**
 * Autopilot permission ladder — orthogonal to Decision lifecycle.
 *
 * Permission: Suggest → Stage → Auto within policy
 * Lifecycle (separate): Executed → Observed → Verified
 *
 * Never call Verified an Autopilot level.
 */

import type { LabSeed } from "./labState";

export type AutopilotLevel = 1 | 2 | 3;

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
  /** Lifecycle receipt — not Autopilot levels. */
  receipt?: {
    executed: string;
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
      level: 2,
      levelLabel: "Stage",
      interrupt: "watching",
      headline: "RADR may prepare the supplier dispute",
      because:
        "RADR found a €273 contract variance. Evidence package is ready.",
      memoryNote:
        "Always ask before sending a dispute, changing a payable, or accepting settlement.",
      policy: [
        {
          id: "detect",
          label: "Detect variance",
          mode: "auto",
          note: "Auto · invoice vs contract",
        },
        {
          id: "evidence",
          label: "Assemble evidence",
          mode: "auto",
          note: "Auto · prepare package",
        },
        {
          id: "draft",
          label: "Draft dispute",
          mode: "auto",
          note: "Auto · stage for approval",
        },
        {
          id: "send",
          label: "Send AP dispute",
          mode: "ask",
          note: "Always ask before sending",
        },
        {
          id: "payable",
          label: "Change payable / post journal",
          mode: "ask",
          note: "Always ask · financial commitment",
        },
        {
          id: "settle",
          label: "Accept settlement",
          mode: "ask",
          note: "Always ask",
        },
      ],
      receipt: {
        executed: "Supplier dispute approved and sent",
        observed: "Credit memo issued by supplier",
        verified: "€273 recovered · matched to original invoice",
      },
    };
  }

  if (seed === "margin-response") {
    return {
      level: approved ? 2 : 1,
      levelLabel: approved ? "Stage" : "Suggest",
      interrupt: approved ? "radr_will" : "needs_you",
      headline: approved
        ? "RADR prepared the two-site price dispute"
        : "Needs you · cross-location price dispersion",
      because:
        "€410 exposed · Mitte €7.45/L vs Prenzlauer Berg €6.80/L — Expected until credit applies",
      memoryNote:
        "Always ask before sending a dispute or changing payables.",
      policy: [
        {
          id: "detect",
          label: "Detect price dispersion",
          mode: "auto",
          note: "Auto · compare sites",
        },
        {
          id: "evidence",
          label: "Assemble evidence",
          mode: "auto",
          note: "Auto · prepare package",
        },
        {
          id: "draft",
          label: "Draft dispute",
          mode: "ask",
          note: "Ask · Finance approval",
        },
        {
          id: "send",
          label: "Send dispute",
          mode: "ask",
          note: "Always ask before sending",
        },
      ],
    };
  }

  return {
    level: approved ? 2 : 1,
    levelLabel: approved ? "Stage" : "Suggest",
    interrupt: approved ? "radr_will" : "needs_you",
    headline: approved
      ? "RADR will hold walk-ins + throttle delivery"
      : "Needs you · kitchen pattern at 92%",
    because: approved
      ? "Staged within policy · €620 Expected until verified after service"
      : "Interrupt — first compressed Friday this month at this kitchen %",
    memoryNote:
      "Seen 12 similar Fridays · auto-stage allowed after Confirm prepare",
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
          executed: "Hold · throttle · feature path prepared",
          observed: "After service close",
          verified: "€620 when contribution matches the Trace",
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
  { level: 2, label: "Stage", blurb: "Prepare · no SoR write yet" },
  { level: 3, label: "Auto", blurb: "Within policy only" },
];
