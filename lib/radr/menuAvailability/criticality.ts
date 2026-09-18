/**
 * Menu criticality - not every shortage is equal.
 * Explainable CRITICAL / HIGH / MEDIUM / LOW from dish importance.
 */

export type MenuCriticalityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type MenuItemPerformance = {
  menuItemId: string;
  name: string;
  salesRank: number;
  contributionRank: number;
  unitsSoldLast8Weeks: number;
  menuMixSharePct: number;
  /** Share of returning guests who ordered this at least once (0-100). */
  repeatGuestOrderPct: number | null;
  signatureFlag: boolean;
  stapleFlag: boolean;
  substitutionRate: number;
  expectedPortionsTonight: number;
  revenueExposure: number;
  contributionExposure: number;
};

export type MenuCriticality = {
  level: MenuCriticalityLevel;
  reasons: string[];
  topDish: MenuItemPerformance | null;
  dishesAffected: number;
  guestImpact: "High" | "Medium" | "Low";
  guestImpactReason: string;
};

export function computeMenuCriticality(
  dishes: MenuItemPerformance[],
): MenuCriticality {
  const sorted = [...dishes].sort(
    (a, b) => a.salesRank - b.salesRank || b.contributionExposure - a.contributionExposure,
  );
  const top = sorted[0] ?? null;
  const dishesAffected = dishes.length;
  const hasSignature = dishes.some((d) => d.signatureFlag);
  const hasBestseller = dishes.some((d) => d.salesRank <= 3);
  const highMix = dishes.some((d) => d.menuMixSharePct >= 8);
  const lowSub = dishes.some((d) => d.substitutionRate < 0.25);
  const unmet = dishes.reduce(
    (s, d) => s + Math.max(0, d.expectedPortionsTonight),
    0,
  );

  const reasons: string[] = [];
  if (dishesAffected >= 2) {
    reasons.push(`affects ${dishesAffected} dishes`);
  }
  if (top) {
    reasons.push(
      `${top.name} is #${top.salesRank} seller`,
    );
    if (top.menuMixSharePct > 0) {
      reasons.push(`${top.menuMixSharePct}% of dinner food revenue`);
    }
  }
  if (lowSub) reasons.push("low historical substitution");
  if (hasSignature) reasons.push("signature dish at risk");
  const shortfallHint = dishes.reduce((s, d) => s + d.expectedPortionsTonight, 0);
  if (shortfallHint > 0) {
    reasons.push(`${shortfallHint} portions expected tonight across affected dishes`);
  }

  let level: MenuCriticalityLevel = "MEDIUM";
  if (
    (hasSignature && hasBestseller) ||
    (hasBestseller && highMix && lowSub && dishesAffected >= 2)
  ) {
    level = "CRITICAL";
  } else if (hasBestseller || hasSignature || (highMix && dishesAffected >= 2)) {
    level = "HIGH";
  } else if (dishes.every((d) => d.salesRank >= 15)) {
    level = "LOW";
  }

  let guestImpact: MenuCriticality["guestImpact"] = "Medium";
  let guestImpactReason = "Moderate mix impact";
  if (hasSignature || (top && top.repeatGuestOrderPct != null && top.repeatGuestOrderPct >= 15)) {
    guestImpact = "High";
    guestImpactReason = hasSignature
      ? "signature item / frequent repeat purchase"
      : "frequent repeat-guest purchase";
  } else if (level === "LOW") {
    guestImpact = "Low";
    guestImpactReason = "low-volume item";
  }

  return {
    level,
    reasons: reasons.slice(0, 5),
    topDish: top,
    dishesAffected,
    guestImpact,
    guestImpactReason,
  };
}
