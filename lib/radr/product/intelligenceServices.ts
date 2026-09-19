/**
 * Demo product intelligence services — Menu, demand, guest voice, discovery.
 */

import { berlinMenuItems, menuItemById, type DemoMenuItem } from "@/data/demo/menuIntelligence";
import {
  DEMO_SOCIAL_SIGNALS,
  DEMO_GUEST_CLUSTERS,
  DEMO_EXTERNAL,
} from "@/data/demo/demandSignals";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { RoleView } from "@/lib/product/types";
import { scopedDecisions, recordAttention } from "./roleScope";

export const MenuIntelligenceService = {
  forBerlin(): DemoMenuItem[] {
    return berlinMenuItems();
  },
  get(itemId: string) {
    return menuItemById(itemId);
  },
  peakMode(items: DemoMenuItem[]) {
    return [...items].sort(
      (a, b) => b.capacityMetric.contributionPerUnit - a.capacityMetric.contributionPerUnit,
    );
  },
};

export const DemandSignalService = {
  socialForLocation(locationId: string) {
    return DEMO_SOCIAL_SIGNALS.filter((s) => s.locationId === locationId);
  },
  externalForLocation(locationId: string) {
    return DEMO_EXTERNAL.filter((e) => e.locationId === locationId);
  },
};

export const GuestVoiceService = {
  clustersForLocation(locationId: string) {
    return DEMO_GUEST_CLUSTERS.filter((c) => c.locationId === locationId);
  },
};

export const DecisionDiscoveryService = {
  /** Quiet “relationship found” moments — learned / non-urgent. */
  relationships(role: RoleView) {
    const scoped = scopedDecisions(listDecisionRecords(), role);
    return scoped
      .filter(
        (r) =>
          r.id === DECISION_IDS.guestVoice ||
          r.id === DECISION_IDS.menuPeak ||
          r.id === DECISION_IDS.socialDemand,
      )
      .filter((r) => {
        const a = recordAttention(r);
        return a === "learned" || a === "verified";
      })
      .map((r) => ({
        decisionId: r.id,
        title: r.title,
        line:
          r.id === DECISION_IDS.guestVoice
            ? "Friday guest complaints increased. Labor was not the driver."
            : r.id === DECISION_IDS.menuPeak
              ? "Signature STAR destroys peak contribution per kitchen minute."
              : "Social demand is reshaping tonight’s mix before service.",
      }));
  },
};

export function activeEconomicsInScope(role: RoleView) {
  const scoped = scopedDecisions(listDecisionRecords(), role);
  const active = scoped.filter((r) => {
    const a = recordAttention(r);
    return a === "needs_you" || a === "handling";
  });
  const exposure = active.reduce((s, r) => s + (r.exposedContribution ?? 0), 0);
  const pendingVerify = scoped
    .filter((r) => recordAttention(r) === "handling")
    .reduce(
      (s, r) => s + (r.expectedContributionImpact ?? 0),
      0,
    );
  return {
    exposure,
    pendingVerification: pendingVerify,
    decisionCount: active.length,
    decisionIds: active.map((r) => r.id),
  };
}

export function valueCoverage(role: RoleView) {
  const scoped = scopedDecisions(listDecisionRecords(), role);
  const verified = scoped.filter(
    (r) => recordAttention(r) === "verified" || recordAttention(r) === "learned",
  );
  const byKind = {
    protected: 0,
    recovered: 0,
    created: 0,
    avoided: 0,
  };
  for (const r of verified) {
    const k = r.verifiedValue?.kind;
    if (k && k in byKind) {
      byKind[k as keyof typeof byKind] += r.verifiedValue!.amount;
    }
  }
  const evaluated = scoped.length;
  const needsJudgment = scoped.filter(
    (r) => recordAttention(r) === "needs_you",
  ).length;
  const handling = scoped.filter(
    (r) => recordAttention(r) === "handling",
  ).length;
  const verifiedCount = verified.filter((r) => r.verifiedValue).length;
  return {
    evaluated,
    needsJudgment,
    handling,
    verifiedCount,
    byKind,
    playbooks: verified.filter((r) => r.playbookImpact).length,
  };
}
