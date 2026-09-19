/**
 * Universal Decision Object — Phase 1 decision cockpit contract.
 *
 * WHAT / SO WHAT / NOW WHAT / WHY / WHAT IF
 * Always includes cost of doing nothing, options, deadline, confidence.
 * States stay explicit: OBSERVED · ESTIMATED · PREDICTED · RECOMMENDED · VERIFIED
 */

import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import { moneyKindOfFinding } from "@/lib/radr/valueSemantics";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import { getRoleProfile } from "@/lib/radr/role/profiles";
import { whyNowForFinding } from "@/lib/radr/role/prioritize";
import {
  BERLIN_TERRACE_WEATHER,
  calculateTerraceWeatherOpportunity,
} from "@/lib/radr/weather/calc";

export type DecisionHorizon = "NOW" | "NEXT" | "LATER";

export type DecisionEpistemicState =
  | "OBSERVED"
  | "ESTIMATED"
  | "PREDICTED"
  | "RECOMMENDED"
  | "VERIFIED";

export type DecisionConfidenceBand = "HIGH" | "MEDIUM" | "LOW";

export type DecisionOption = {
  id: string;
  label: string;
  detail: string;
  /** Expected net contribution vs do-nothing (major units). */
  expectedNetEuro?: number;
  costEuro?: number;
  recommended?: boolean;
};

export type DecisionNoAction = {
  label: string;
  expectedCostEuro: number;
  detail: string;
};

export type DecisionEvidenceRow = {
  label: string;
  value: string;
};

export type DecisionObject = {
  id: string;
  findingId: string;
  /** WHAT — short situation */
  situation: string;
  /** SO WHAT — business consequence */
  whyMatters: string;
  /** NOW WHAT — recommended next step */
  recommendation: string;
  impact: string;
  impactAmount: number;
  impactLabel: string;
  impactPositive: boolean;
  ownerRole: RoleView;
  ownerLabel: string;
  timing: string;
  context: string;
  why: string;
  whyNow: string;
  horizon: DecisionHorizon;
  proofHref: string;
  territory: Finding["territory"];
  outcome?: string;

  /** Decision cockpit fields */
  epistemicState: DecisionEpistemicState;
  confidenceBand: DecisionConfidenceBand;
  confidenceScore: number;
  confidenceLabel: string;
  confidenceExplanation: string;
  decisionDeadline: string;
  decisionDeadlineAt?: string;
  noAction: DecisionNoAction;
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
  reversibility: "easy" | "moderate" | "hard";
  evidence: DecisionEvidenceRow[];
};

export function horizonForFinding(f: Finding): DecisionHorizon {
  if (f.urgency === "ACT_NOW") return "NOW";
  if (f.urgency === "TODAY") return "NEXT";
  return "LATER";
}

function oneLine(text: string, max = 110): string {
  const cleaned = text.replace(/\s+/g, " ").trim().replace(/\.$/, "");
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trim()}…`;
}

function whyMattersForFinding(f: Finding): string {
  const fromDriver = f.drivers?.[0]?.value;
  const fromSummary = f.summary;
  const fromExplanation = f.explanation;
  const raw =
    fromDriver ||
    fromSummary ||
    fromExplanation ||
    f.confidenceExplanation ||
    "Material enough to require a decision.";
  return oneLine(raw);
}

function confidenceLabel(band: DecisionConfidenceBand): string {
  if (band === "HIGH") return "High";
  if (band === "MEDIUM") return "Medium";
  return "Low";
}

function epistemicForFinding(f: Finding): DecisionEpistemicState {
  if (f.status === "VERIFIED" || f.status === "RESOLVED") return "VERIFIED";
  if (f.urgency === "WATCH") return "PREDICTED";
  if (f.recommendation?.title) return "RECOMMENDED";
  return "ESTIMATED";
}

function deadlineForFinding(f: Finding): {
  label: string;
  at?: string;
} {
  if (f.timeframe?.end) {
    return {
      label: f.timeframe.label
        ? `Decide before ${f.timeframe.label}`
        : "Decide before window closes",
      at: f.timeframe.end,
    };
  }
  if (f.urgency === "ACT_NOW") {
    return { label: "Decide now — value is decaying" };
  }
  if (f.urgency === "TODAY") {
    return { label: "Decide today" };
  }
  return { label: f.timeframe?.label ?? "No hard deadline" };
}

function noActionForFinding(
  f: Finding,
  amount: number,
  positive: boolean,
): DecisionNoAction {
  const doNothingDriver = f.drivers.find((d) =>
    /do nothing|if you do nothing|no action/i.test(d.label),
  );
  if (doNothingDriver) {
    return {
      label: "Do nothing",
      expectedCostEuro: amount,
      detail: doNothingDriver.value,
    };
  }
  if (positive) {
    return {
      label: "Do nothing",
      expectedCostEuro: amount,
      detail: `${formatFindingEuro(amount)} opportunity left on the table if the plan stays unchanged.`,
    };
  }
  return {
    label: "Do nothing",
    expectedCostEuro: amount,
    detail: `${formatFindingEuro(amount)} expected exposure if no action is taken.`,
  };
}

function weatherOptions(f: Finding): {
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
  noAction: DecisionNoAction;
} {
  const opp = calculateTerraceWeatherOpportunity(BERLIN_TERRACE_WEATHER);
  const recCost = f.recommendation.expectedCost ?? opp.laborCostToCapture;
  const recNet = f.recommendation.expectedNetBenefit ?? opp.netOpportunity;
  const options: DecisionOption[] = [
    {
      id: "prepare_terrace_foh",
      label: f.recommendation.title,
      detail: f.recommendation.description,
      costEuro: recCost,
      expectedNetEuro: recNet,
      recommended: true,
    },
    {
      id: "partial_terrace",
      label: "Open terrace · keep FOH plan",
      detail: "Capture some outdoor demand without extra labor — lower net.",
      costEuro: 0,
      expectedNetEuro: Math.round(opp.grossOpportunity * 0.45),
    },
    {
      id: "do_nothing",
      label: "Keep current plan",
      detail: opp.doNothingCalc,
      expectedNetEuro: 0,
      costEuro: 0,
    },
  ];
  return {
    options,
    recommendedOptionId: "prepare_terrace_foh",
    expectedNetEuro: recNet,
    noAction: {
      label: "Do nothing",
      expectedCostEuro: opp.doNothingValue,
      detail: opp.doNothingCalc,
    },
  };
}

function cancellationOptions(f: Finding): {
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
} {
  const benefit =
    f.recommendation.expectedBenefit ??
    f.recommendation.expectedContributionProtected ??
    f.financialImpact.primaryValue;
  const options: DecisionOption[] = [
    {
      id: "recover_waitlist",
      label: f.recommendation.title,
      detail: f.recommendation.description,
      expectedNetEuro: benefit,
      recommended: true,
    },
    {
      id: "hold_walkin",
      label: "Hold for walk-in only",
      detail: "No outbound recovery — lower capture probability.",
      expectedNetEuro: Math.round(benefit * 0.35),
    },
    {
      id: "do_nothing",
      label: "Leave table empty",
      detail: `${formatFindingEuro(f.financialImpact.primaryValue)} stays exposed.`,
      expectedNetEuro: 0,
    },
  ];
  return {
    options,
    recommendedOptionId: "recover_waitlist",
    expectedNetEuro: benefit,
  };
}

function staffingOptions(f: Finding): {
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
} {
  const cost = f.recommendation.expectedCost ?? 72;
  const net =
    f.recommendation.expectedNetBenefit ??
    (f.recommendation.expectedBenefit != null
      ? f.recommendation.expectedBenefit - cost
      : undefined);
  const options: DecisionOption[] = [
    {
      id: "add_capacity",
      label: f.recommendation.title,
      detail: f.recommendation.description,
      costEuro: cost,
      expectedNetEuro: net,
      recommended: true,
    },
    {
      id: "reallocate",
      label: "Reallocate existing FOH",
      detail: "Move coverage between sections — no incremental labor cost.",
      costEuro: 0,
      expectedNetEuro: net != null ? Math.round(net * 0.55) : undefined,
    },
    {
      id: "do_nothing",
      label: "Keep current staffing",
      detail: `${formatFindingEuro(f.financialImpact.primaryValue)} service / contribution risk remains.`,
      expectedNetEuro: 0,
    },
  ];
  return {
    options,
    recommendedOptionId: "add_capacity",
    expectedNetEuro: net,
  };
}

function defaultOptions(f: Finding): {
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
} {
  const cost = f.recommendation.expectedCost;
  const net =
    f.recommendation.expectedNetBenefit ??
    f.recommendation.expectedContributionProtected ??
    f.recommendation.expectedBenefit;
  const options: DecisionOption[] = [
    {
      id: "recommended",
      label: f.recommendation.title,
      detail: f.recommendation.description,
      costEuro: cost,
      expectedNetEuro: net,
      recommended: true,
    },
    {
      id: "do_nothing",
      label: "Do nothing",
      detail: `Leave ${formatFindingEuro(f.financialImpact.primaryValue)} unresolved.`,
      expectedNetEuro: 0,
    },
  ];
  return {
    options,
    recommendedOptionId: "recommended",
    expectedNetEuro: net,
  };
}

function optionsForFinding(f: Finding): {
  options: DecisionOption[];
  recommendedOptionId: string;
  expectedNetEuro?: number;
  noActionOverride?: DecisionNoAction;
} {
  if (f.category === "weather_sensitive_demand") {
    const w = weatherOptions(f);
    return {
      options: w.options,
      recommendedOptionId: w.recommendedOptionId,
      expectedNetEuro: w.expectedNetEuro,
      noActionOverride: w.noAction,
    };
  }
  if (f.category === "cancellation_exposure") {
    return cancellationOptions(f);
  }
  if (
    f.category.includes("staff") ||
    f.subtype.toLowerCase().includes("staff") ||
    f.id.includes("staffing")
  ) {
    return staffingOptions(f);
  }
  return defaultOptions(f);
}

function reversibilityForFinding(f: Finding): DecisionObject["reversibility"] {
  if (f.territory === "BUY") return "moderate";
  if (f.urgency === "ACT_NOW") return "easy";
  return "easy";
}

/**
 * Adapt a Finding into a Decision cockpit object.
 */
export function findingToDecision(
  f: Finding,
  role: RoleView,
): DecisionObject {
  const profile = getRoleProfile(role);
  const kind = moneyKindOfFinding(f);
  const amount = f.financialImpact.primaryValue;
  const positive = kind === "recoverable" || kind === "opportunity";
  const label =
    kind === "recoverable"
      ? "recoverable"
      : kind === "opportunity"
        ? "opportunity"
        : "at risk";

  const why =
    f.confidenceExplanation ||
    f.drivers?.[0]?.value ||
    f.evidence?.[0]?.value ||
    "Evidence available on review.";

  const timing = f.timeframe?.label ?? "Today";
  const loc = f.locationName;
  const context = loc ? `${loc} · ${timing}` : timing;
  const band = f.confidenceBand as DecisionConfidenceBand;
  const deadline = deadlineForFinding(f);
  const built = optionsForFinding(f);
  const noAction =
    built.noActionOverride ?? noActionForFinding(f, amount, positive);

  const evidence: DecisionEvidenceRow[] = (
    f.evidence.length
      ? f.evidence.slice(0, 5).map((e) => ({ label: e.label, value: e.value }))
      : f.drivers.slice(0, 5).map((d) => ({ label: d.label, value: d.value }))
  );

  return {
    id: `dec_${f.id}`,
    findingId: f.id,
    situation:
      f.presentation?.headline?.replace(/\.$/, "") ??
      f.title.replace(/\.$/, ""),
    impact: `${formatFindingEuro(amount)} ${label}`,
    impactAmount: amount,
    impactLabel: label,
    impactPositive: positive,
    recommendation:
      f.presentation?.recommendShort ?? f.recommendation.title,
    ownerRole: role,
    ownerLabel: profile.label,
    timing,
    context,
    why,
    whyMatters: whyMattersForFinding(f),
    whyNow: whyNowForFinding(f, role),
    horizon: horizonForFinding(f),
    proofHref: f.presentation?.primaryAction.href ?? `/app/findings/${f.id}`,
    territory: f.territory,
    outcome:
      f.status === "VERIFIED" || f.status === "RESOLVED"
        ? "Verified"
        : undefined,
    epistemicState: epistemicForFinding(f),
    confidenceBand: band,
    confidenceScore: f.confidenceScore,
    confidenceLabel: confidenceLabel(band),
    confidenceExplanation: f.confidenceExplanation,
    decisionDeadline: deadline.label,
    decisionDeadlineAt: deadline.at,
    noAction,
    options: built.options,
    recommendedOptionId: built.recommendedOptionId,
    expectedNetEuro: built.expectedNetEuro,
    reversibility: reversibilityForFinding(f),
    evidence,
  };
}
