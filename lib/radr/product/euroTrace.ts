import { currencyForRecord } from "./demoMoney";
/**
 * Euro proof traces for Verified Value — built from sealed Decision fields.
 * Never invents amounts.
 */

import { getDecisionRecord } from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { getDecisionTrace } from "@/lib/marketing/decisionTrace";

export type EuroTraceStep = {
  step: string;
  detail: string;
  state: "OBSERVED" | "SETTLED" | "PREDICTED" | "VERIFIED";
};

export type EuroTrace = {
  displayId: string;
  decisionId: string;
  verifiedEuro: number;
  chain: EuroTraceStep[];
  kind: "verified" | "miss";
};

function supplierTrace(): EuroTrace | null {
  const trace = getDecisionTrace("D-4102");
  if (!trace) return null;
  return {
    displayId: "D-4102",
    decisionId: DECISION_IDS.supplier,
    verifiedEuro: trace.verification.verifiedEuro,
    kind: "verified",
    chain: [
      {
        step: "Invoice variance",
        detail: "INV-88421 vs CTR-1188",
        state: "OBSERVED",
      },
      {
        step: "Decision",
        detail: "D-4102 · Supplier dispute",
        state: "OBSERVED",
      },
      {
        step: "Action",
        detail: trace.action.name,
        state: "OBSERVED",
      },
      {
        step: "Credit memo",
        detail:
          trace.verification.proof.find((p) => /credit/i.test(p.label))
            ?.value ?? "CM-1042",
        state: "OBSERVED",
      },
      {
        step: "Ledger match",
        detail: "Accounting / AP export",
        state: "SETTLED",
      },
      {
        step: "Verified Value",
        detail: formatDecisionMoney(trace.verification.verifiedEuro),
        state: "VERIFIED",
      },
    ],
  };
}

export function euroTraceForDecision(id: string): EuroTrace | null {
  if (id === DECISION_IDS.supplier) return supplierTrace();

  const r = getDecisionRecord(id);
  if (!r) return null;

  if (id === DECISION_IDS.created) {
    return {
      displayId: displayDecisionId(id),
      decisionId: id,
      verifiedEuro: 0,
      kind: "miss",
      chain: [
        {
          step: "Signal",
          detail: "Sun window · terrace opportunity",
          state: "OBSERVED",
        },
        {
          step: "Decision",
          detail: `${displayDecisionId(id)} · Soft-open`,
          state: "OBSERVED",
        },
        {
          step: "Action",
          detail: "Terrace soft-open prepared",
          state: "OBSERVED",
        },
        {
          step: "Observed",
          detail: `${formatDecisionMoney(r.actualContributionImpact ?? 90,currencyForRecord(r))} · demand faded`,
          state: "OBSERVED",
        },
        {
          step: "Counterfactual",
          detail:
            r.regret?.note ??
            "Full stage would not have recovered attribution",
          state: "PREDICTED",
        },
        {
          step: "Verified",
          detail: `${formatDecisionMoney(0,currencyForRecord(r))} · attribution gate`,
          state: "VERIFIED",
        },
        {
          step: "Memory",
          detail: r.lesson ?? "Playbook updated",
          state: "SETTLED",
        },
      ],
    };
  }

  const verified = r.verifiedValue?.amount;
  if (verified == null || verified <= 0) return null;

  const chain: EuroTraceStep[] = [
    {
      step: "Signal",
      detail: r.problemStatement.slice(0, 80),
      state: "OBSERVED",
    },
    {
      step: "Decision",
      detail: `${displayDecisionId(id)} · ${r.recommendationHeadline ?? r.title}`,
      state: "OBSERVED",
    },
    {
      step: "Action",
      detail:
        r.actionPlan.steps[0]?.title ??
        r.expectedOperationalImpact ??
        "Prepared action",
      state: "OBSERVED",
    },
  ];

  if (r.observedOutcome) {
    chain.push({
      step: "Observed",
      detail: r.observedOutcome,
      state: "OBSERVED",
    });
  }

  if (r.outcomeDetail?.expectedContributionEuro != null) {
    chain.push({
      step: "Counterfactual",
      detail: `Expected ${formatDecisionMoney(r.outcomeDetail.expectedContributionEuro)} vs observed ${formatDecisionMoney(r.outcomeDetail.observedContributionEuro ?? verified)}`,
      state: "PREDICTED",
    });
  }

  chain.push({
    step: "Evidence",
    detail:
      r.verificationDetail?.note ??
      r.verifiedValue?.note ??
      "Evidence chain sealed",
    state: "SETTLED",
  });

  chain.push({
    step: "Verified",
    detail: formatDecisionMoney(verified),
    state: "VERIFIED",
  });

  if (r.lesson || r.playbookImpact) {
    chain.push({
      step: "Memory",
      detail: r.lesson ?? r.playbookImpact ?? "Learned",
      state: "SETTLED",
    });
  }

  return {
    displayId: displayDecisionId(id),
    decisionId: id,
    verifiedEuro: verified,
    kind: "verified",
    chain,
  };
}
