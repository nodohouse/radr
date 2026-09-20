/**
 * Emergency sourcing economics - compare options, recommend best net value.
 */

export type SourcingOption = {
  id: string;
  title: string;
  kind: "EMERGENCY_SOURCE" | "ALLOW_SELL_OUT" | "SUBSTITUTE_INGREDIENT";
  supplierName?: string;
  costPremium: number;
  deliveryLabel?: string;
  revenueProtected: number;
  contributionProtected: number;
  netExpectedValue: number;
  guestAcceptancePct?: number;
  detail: string;
  recommended: boolean;
};

export type SourcingDecision = {
  options: SourcingOption[];
  recommendedId: string;
  decideBy: string;
  decideByWhy: string;
  whyNow: string[];
};

export function rankSourcingOptions(
  options: Omit<SourcingOption, "recommended">[],
): SourcingOption[] {
  const bestNet = Math.max(...options.map((o) => o.netExpectedValue));
  return options
    .map((o) => ({
      ...o,
      recommended: o.netExpectedValue === bestNet && bestNet > 0,
    }))
    .sort((a, b) => b.netExpectedValue - a.netExpectedValue);
}

/** Berlin Bluefin demo - coherent with pre-shift narrative. */
export function demoBluefinSourcingDecision(input: {
  contributionAtRisk: number;
  grossRevenueAtRisk: number;
  expectedRevenueLoss: number;
}): SourcingDecision {
  const emergencyContributionProtected = 644;
  const emergencyPremium = 86;
  const substituteContribution = 460;
  const allowSubRecovery = 210;
  const allowNet = -(input.contributionAtRisk - allowSubRecovery);

  const ranked = rankSourcingOptions([
    {
      id: "src_emergency",
      title: "Emergency source 4kg",
      kind: "EMERGENCY_SOURCE",
      supplierName: "Nordic Seafood Express",
      costPremium: emergencyPremium,
      deliveryLabel: "17:40",
      revenueProtected: 1180,
      contributionProtected: emergencyContributionProtected,
      netExpectedValue: emergencyContributionProtected - emergencyPremium,
      detail: "Approved backup supplier · arrives before service peak.",
    },
    {
      id: "src_yellowfin",
      title: "Substitute Yellowfin",
      kind: "SUBSTITUTE_INGREDIENT",
      costPremium: 0,
      revenueProtected: Math.round(input.grossRevenueAtRisk * 0.55),
      contributionProtected: substituteContribution,
      netExpectedValue: substituteContribution,
      guestAcceptancePct: 74,
      detail: "Menu note + FOH brief · lower guest acceptance on signature.",
    },
    {
      id: "src_sellout",
      title: "Allow sell-out",
      kind: "ALLOW_SELL_OUT",
      costPremium: 0,
      revenueProtected: 0,
      contributionProtected: allowSubRecovery,
      netExpectedValue: allowNet,
      detail: `Expected lost contribution €${input.contributionAtRisk} · substitution recovers ~€${allowSubRecovery}.`,
    },
  ]);

  return {
    options: ranked,
    recommendedId: ranked.find((o) => o.recommended)?.id ?? ranked[0]!.id,
    decideBy: "17:15",
    decideByWhy: "Alternate supplier cutoff is 17:20.",
    whyNow: [
      "Supplier delivery arrived 4kg short at 16:42.",
      "Current usable inventory: 9 portions.",
      "Updated demand forecast: 31 portions.",
      "Expected sell-out: 20:15.",
    ],
  };
}
