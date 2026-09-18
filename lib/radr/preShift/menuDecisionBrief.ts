/**
 * Pre-shift menu decision brief - SO WHAT, not stock alert.
 */

import { demoMenuAvailabilityRisk } from "@/lib/radr/menuAvailability";
import {
  computeMenuCriticality,
  type MenuCriticality,
  type MenuItemPerformance,
} from "@/lib/radr/menuAvailability/criticality";
import {
  demoBluefinSourcingDecision,
  type SourcingDecision,
} from "@/lib/radr/menuAvailability/sourcingDecision";
import { DEMO_GUEST_TONIGHT_AGG } from "@/lib/radr/guest";

export type DishImpactLine = {
  menuItemId: string;
  name: string;
  salesRank: number;
  badge: "signature" | "bestseller" | null;
  expectedPortions: number;
  gramsPerPortion: number;
  revenueExposure: number;
  contributionExposure: number;
};

export type MenuDecisionBrief = {
  ingredientName: string;
  portionsAvailable: number;
  portionsExpected: number;
  coveragePct: number;
  unmetPortions: number;
  runOutBy: string;
  revenueAtRisk: number;
  contributionAtRisk: number;
  criticality: MenuCriticality;
  dishes: DishImpactLine[];
  performance: MenuItemPerformance[];
  sourcing: SourcingDecision;
  recommendationLine: string;
  soWhat: string;
  substitutionBreakdown: {
    label: string;
    pct: number;
  }[];
  expectedRevenueRetained: number;
  expectedRevenueLost: number;
  /** Historical affinity - not a guarantee they order tonight. */
  guestAffinity: {
    bluefinGuestsTonight: number;
    affinityExpectedValue: number;
    line: string;
  };
};

/** Demo performance ranks for Bluefin dishes - fixture-owned. */
const PERF: Record<
  string,
  Omit<MenuItemPerformance, "expectedPortionsTonight" | "revenueExposure" | "contributionExposure" | "substitutionRate" | "name" | "menuItemId">
> = {
  mi_tataki: {
    salesRank: 2,
    contributionRank: 1,
    unitsSoldLast8Weeks: 412,
    menuMixSharePct: 12.4,
    repeatGuestOrderPct: 18,
    signatureFlag: true,
    stapleFlag: true,
  },
  mi_crudo: {
    salesRank: 6,
    contributionRank: 5,
    unitsSoldLast8Weeks: 198,
    menuMixSharePct: 5.8,
    repeatGuestOrderPct: 9,
    signatureFlag: false,
    stapleFlag: false,
  },
  mi_don: {
    salesRank: 11,
    contributionRank: 9,
    unitsSoldLast8Weeks: 124,
    menuMixSharePct: 3.1,
    repeatGuestOrderPct: 4,
    signatureFlag: false,
    stapleFlag: false,
  },
};

const GRAMS: Record<string, number> = {
  mi_tataki: 120,
  mi_crudo: 80,
  mi_don: 60,
};

/**
 * Compose menu decision brief from live menu risk + performance fixtures.
 */
export function composeMenuDecisionBrief(): MenuDecisionBrief | null {
  const risk = demoMenuAvailabilityRisk();
  if (!risk) return null;

  // Align to pre-shift narrative economics when demo shortfall is present
  const portionsExpected = 31;
  const portionsAvailable = 9;
  const coveragePct = Math.round((portionsAvailable / portionsExpected) * 100);
  const unmetPortions = portionsExpected - portionsAvailable;
  const revenueAtRisk = 1180;
  const contributionAtRisk = 730;

  const dishPlan: { id: string; name: string; expected: number; rev: number; contrib: number }[] = [
    { id: "mi_tataki", name: "Tuna Tataki", expected: 18, rev: 680, contrib: 420 },
    { id: "mi_crudo", name: "Bluefin Nigiri", expected: 9, rev: 340, contrib: 210 },
    { id: "mi_don", name: "Chef's Omakase", expected: 4, rev: 160, contrib: 100 },
  ];

  const performance: MenuItemPerformance[] = dishPlan.map((d) => {
    const p = PERF[d.id]!;
    const line = risk.affected.find((a) => a.menuItemId === d.id);
    return {
      menuItemId: d.id,
      name: d.name,
      ...p,
      expectedPortionsTonight: d.expected,
      revenueExposure: d.rev,
      contributionExposure: d.contrib,
      substitutionRate: line?.substituteRate ?? 0.22,
    };
  });

  const criticality = computeMenuCriticality(performance);
  const sourcing = demoBluefinSourcingDecision({
    contributionAtRisk,
    grossRevenueAtRisk: revenueAtRisk,
    expectedRevenueLoss: revenueAtRisk,
  });
  const recommended = sourcing.options.find((o) => o.recommended)!;
  const guestAffinity = {
    bluefinGuestsTonight: DEMO_GUEST_TONIGHT_AGG.bluefinAffinityGuests,
    affinityExpectedValue: DEMO_GUEST_TONIGHT_AGG.bluefinAffinityExpectedValue,
    line: `${DEMO_GUEST_TONIGHT_AGG.bluefinAffinityGuests} high-value returning guests tonight historically order Bluefin dishes · affinity context €${DEMO_GUEST_TONIGHT_AGG.bluefinAffinityExpectedValue.toLocaleString("de-DE")},00 (not a guarantee they will order it)`,
  };

  const dishes: DishImpactLine[] = dishPlan.map((d) => {
    const p = PERF[d.id]!;
    return {
      menuItemId: d.id,
      name: d.name,
      salesRank: p.salesRank,
      badge: p.signatureFlag
        ? "signature"
        : p.salesRank <= 3
          ? "bestseller"
          : null,
      expectedPortions: d.expected,
      gramsPerPortion: GRAMS[d.id] ?? 100,
      revenueExposure: d.rev,
      contributionExposure: d.contrib,
    };
  });

  return {
    ingredientName: risk.ingredientName,
    portionsAvailable,
    portionsExpected,
    coveragePct,
    unmetPortions,
    runOutBy: risk.runOutBy ?? "20:15",
    revenueAtRisk,
    contributionAtRisk,
    criticality,
    dishes,
    performance,
    sourcing,
    recommendationLine: `${recommended.title} · net ${recommended.netExpectedValue >= 0 ? "+" : ""}€${Math.abs(recommended.netExpectedValue).toLocaleString("de-DE")},00`,
    soWhat: `Tonight's #2 selling dish will likely sell out by ${risk.runOutBy ?? "20:15"}, putting €${contributionAtRisk.toLocaleString("de-DE")},00 contribution at risk. ${guestAffinity.bluefinGuestsTonight} booked returning guests historically order Bluefin - raises guest-impact priority. Emergency sourcing is expected to protect €${recommended.netExpectedValue.toLocaleString("de-DE")},00 net.`,
    substitutionBreakdown: [
      { label: "Order Salmon Tataki", pct: 42 },
      { label: "Order Crispy Rice", pct: 21 },
      { label: "Order another starter", pct: 19 },
      { label: "Do not substitute", pct: 18 },
    ],
    expectedRevenueRetained: 450,
    expectedRevenueLost: 730,
    guestAffinity,
  };
}
