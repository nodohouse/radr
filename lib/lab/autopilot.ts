import { DECISION } from "./ids";
import type { AutopilotLevel, AutopilotPolicy, SeedId } from "./types";

export const AUTOPILOT_LEVELS: { level: AutopilotLevel; label: string; meaning: string }[] = [
  { level: 1, label: "Suggest", meaning: "RADR recommends. You choose." },
  { level: 2, label: "Stage", meaning: "Prepare work — do not write systems of record." },
  { level: 3, label: "Auto within policy", meaning: "After similar Verified outcomes, run allowed actuators." },
  { level: 4, label: "Verified", meaning: "€ sealed on ledger. Estimated is never this." },
];

export function autopilotForSeed(seed: SeedId): AutopilotPolicy {
  if (seed === "recover") {
    return {
      level: 1,
      levelLabel: "Suggest",
      radrWill: [
        "Draft credit-memo packet from contract vs invoice (demo/policy)",
        "Flag next above-contract PO as hold",
      ],
      needsYou: ["Approve dispute — Recover always asks before AP write"],
      canAuto: ["Hold next above-contract PO once dispute is staged"],
      alwaysAsk: ["Dispute AP / post credit memo", "Reprice menu"],
      memoryLine: "Seen 4 similar invoice variances · auto-stage not allowed until 3 Verified CMs",
      similarCount: 4,
    };
  }

  if (seed === "hotel") {
    return {
      level: 2,
      levelLabel: "Stage",
      radrWill: [
        "Stage channel hold on remaining premium (demo/policy)",
        "Prepare orphan-night release / reprice packet",
      ],
      needsYou: ["Confirm release window — refunds always ask"],
      canAuto: ["Hold remaining direct inventory after similar pickup nights"],
      alwaysAsk: ["Issue refund", "Override OTA stop-sell"],
      memoryLine: "Seen 7 similar cancellation clusters · auto-stage allowed",
      similarCount: 7,
    };
  }

  return {
    level: 2,
    levelLabel: "Stage",
    radrWill: [
      "Stage walk-in hold until 18:54",
      "Throttle delivery 25m (within policy)",
      "Feature high €/min plate (demo/policy)",
    ],
    needsYou: ["Approve Wait-12 — first compressed Friday this month still asks"],
    canAuto: ["Throttle delivery when kitchen ≥90% and inbound ≥30"],
    alwaysAsk: ["Post to Instagram", "Add labor", "Kill delivery for the night"],
    memoryLine: "Seen 12 similar Fridays · auto-stage allowed",
    similarCount: 12,
  };
}

export function autopilotForDecision(decisionId: string): AutopilotPolicy {
  if (decisionId === DECISION.supplier.id) return autopilotForSeed("recover");
  if (decisionId === DECISION.hotelOrphan.id || decisionId === DECISION.hotelOta.id) {
    return autopilotForSeed("hotel");
  }
  return autopilotForSeed("service");
}
