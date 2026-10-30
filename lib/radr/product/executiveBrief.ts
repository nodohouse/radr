/**
 * Executive Brief — structured facts only.
 * LLM may later polish prose; it must not invent claims.
 * Every fact links to a source object for drill-down.
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { RoleView } from "@/lib/product/types";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { CONNECTED_PILOT_MTD } from "@/lib/radr/product/demoOperatingPulse";
import { productDemoScenario } from "@/lib/radr/product/demoScenario";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type BriefFact = {
  id: string;
  text: string;
  href?: string;
  sourceIds: string[];
  tone?: "neutral" | "positive" | "watch" | "attention";
};

export type ExecutiveBrief = {
  orgName: string;
  headline: string;
  /** Scope line under org — e.g. "8 connected · MTD" */
  scopeLine: string;
  scenarioLabel: string;
  revenueDeltaLabel: string;
  contributionDeltaLabel: string;
  facts: BriefFact[];
};

export function composeExecutiveBrief(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): ExecutiveBrief {
  const brief = composeControlCenterBrief({ role, period: "mtd", vertical });
  const pulse = getBusinessPulse(role, vertical);
  const rev = pulse.primary.find((m) => m.id === "revenue_mtd");
  const f = CONNECTED_PILOT_MTD;
  const scenario = productDemoScenario(vertical);

  const revDelta =
    rev?.comparisonValue != null
      ? rev.comparisonValue
      : ((f.revenue.actual - f.revenue.forecast) / f.revenue.forecast) * 100;
  const ahead = revDelta >= 0;

  const headline = ahead
    ? "Revenue is ahead. Contribution isn't."
    : `${scenario.orgName} is behind forecast — ${brief.needsYouCount} Decision${brief.needsYouCount === 1 ? "" : "s"} need judgment.`;

  const contribDelta = f.contribution.actual - f.contribution.plan;
  const revenueDeltaLabel =
    rev?.comparisonFormatted ??
    `${revDelta >= 0 ? "+" : ""}${revDelta.toFixed(1)}%`;
  const contributionDeltaLabel = `${contribDelta < 0 ? "−" : "+"}${formatDecisionMoney(Math.abs(contribDelta))}`;

  const bridge = getContributionBridge();
  const negDrivers = bridge.segments.filter((s) => s.kind === "negative");
  const absNeg = negDrivers.reduce((s, d) => s + Math.abs(d.amount), 0);
  const mixShare =
    absNeg > 0
      ? Math.round(
          (negDrivers
            .filter((d) => /cogs|channel/i.test(d.label))
            .reduce((s, d) => s + Math.abs(d.amount), 0) /
            absNeg) *
            100,
        )
      : 0;

  const facts: BriefFact[] = [
    {
      id: "drivers",
      text:
        mixShare > 0
          ? `COGS and channel mix explain ${mixShare}% of the shortfall.`
          : "COGS and channel mix explain most of the shortfall.",
      href: "/app?view=performance",
      sourceIds: ["contribution_bridge"],
      tone: "attention",
    },
    {
      id: "exposure",
      text: `${brief.needsYouCount} Decisions contain ${brief.exposureFormatted} of active exposure.`,
      href: "/app/decisions?band=needs_you",
      sourceIds: brief.economics.decisionIdsActiveExposure,
      tone: brief.economics.activeExposure > 0 ? "attention" : "neutral",
    },
  ];

  const verifiedMoved = brief.sinceLastCheck.find((s) =>
    /verified/i.test(s.text),
  );
  if (verifiedMoved) {
    facts.push({
      id: "verified",
      text: verifiedMoved.text.replace(/^\+?/, "").includes("moved")
        ? verifiedMoved.text
        : `${brief.verifiedFormatted} Verified this month.`,
      href: "/app/value",
      sourceIds: brief.economics.decisionIdsVerified.slice(0, 1),
      tone: "positive",
    });
  } else {
    facts.push({
      id: "verified",
      text: `${brief.verifiedFormatted} Verified this month.`,
      href: "/app/value",
      sourceIds: brief.economics.decisionIdsVerified,
      tone: "positive",
    });
  }

  return {
    orgName: brief.orgName,
    headline,
    scopeLine: `${scenario.connectedLocations} connected · MTD`,
    scenarioLabel: scenario.shortLabel,
    revenueDeltaLabel,
    contributionDeltaLabel,
    facts: facts.slice(0, 2),
  };
}
