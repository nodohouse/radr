/**
 * Deterministic Value Opportunity Calculator.
 * @see docs/VALUE_CALCULATOR_MODEL.md
 */

import {
  CATEGORY_LABEL,
  DEFAULT_OPERATING,
  DISCLAIMER,
  EVIDENCE_BY_CATEGORY,
  OPPORTUNITY_ASSUMPTIONS,
  PORTFOLIO,
  assumptionByCategory,
  type CategoryId,
  type OverlapGroup,
  type VerticalId,
} from "./assumptions";
import type {
  CategoryResult,
  ConfidenceLevel,
  ValueCalculatorInput,
  ValueCalculatorResult,
} from "./types";

function finite(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function applicableCategories(vertical: VerticalId): CategoryId[] {
  return OPPORTUNITY_ASSUMPTIONS.filter((a) =>
    a.verticals.includes(vertical),
  ).map((a) => a.categoryId);
}

function resolvePain(
  vertical: VerticalId,
  pain: ValueCalculatorInput["painAreas"],
): CategoryId[] {
  const all = applicableCategories(vertical);
  if (pain === "unsure" || !pain.length) return all;
  return pain.filter((id) => all.includes(id));
}

type ResolvedOps = {
  laborPct: number;
  foodCogsPct: number;
  purchasingPct: number;
  deliveryMixPct: number;
  occupancy: number;
  otaMixPct: number;
  roomRevenueShare: number;
  assumed: string[];
  known: string[];
};

function resolveOperating(input: ValueCalculatorInput): ResolvedOps {
  const d = DEFAULT_OPERATING[input.vertical];
  const assumed: string[] = [];
  const known: string[] = [];

  function pick(
    label: string,
    value: number | undefined,
    fallback: number,
  ): number {
    if (value === undefined || !Number.isFinite(value)) {
      assumed.push(label);
      return fallback;
    }
    known.push(label);
    return clamp(value, 0, 1);
  }

  return {
    laborPct: pick("Labor %", input.laborPct, d.laborPctOfRevenue),
    foodCogsPct: pick("Food / COGS %", input.foodCogsPct, d.foodCogsPctOfRevenue),
    purchasingPct: pick(
      "Purchasing %",
      input.purchasingPct,
      d.purchasingPctOfRevenue,
    ),
    deliveryMixPct: pick(
      "Delivery mix %",
      input.deliveryMixPct,
      d.deliveryMixPct,
    ),
    occupancy: pick("Occupancy", input.occupancy, d.occupancy),
    otaMixPct: pick("OTA mix %", input.otaMixPct, d.otaMixPct),
    roomRevenueShare: pick(
      "Room revenue share",
      input.roomRevenueShare,
      d.roomRevenueShare,
    ),
    assumed,
    known,
  };
}

function categoryBase(
  id: CategoryId,
  revenue: number,
  ops: ResolvedOps,
  vertical: VerticalId,
): { base: number; assumedBase: boolean } {
  const laborCost = revenue * ops.laborPct;
  const foodSpend = revenue * ops.foodCogsPct;
  const purchasing = revenue * ops.purchasingPct;
  const roomRev = revenue * ops.roomRevenueShare;
  const perishableBase =
    vertical === "hotel"
      ? roomRev
      : revenue * (1 - ops.deliveryMixPct * 0.35);

  switch (id) {
    case "labor":
      return { base: laborCost, assumedBase: ops.assumed.includes("Labor %") };
    case "supplier_ap":
    case "procurement":
      return {
        base: purchasing,
        assumedBase: ops.assumed.includes("Purchasing %"),
      };
    case "reconciliation":
      return { base: revenue, assumedBase: false };
    case "food_waste":
      return {
        base: foodSpend,
        assumedBase: ops.assumed.includes("Food / COGS %"),
      };
    case "perishable":
      return {
        base: perishableBase,
        assumedBase: ops.assumed.includes("Room revenue share"),
      };
    case "channel_mix":
      return {
        base: roomRev * Math.max(ops.otaMixPct, 0.15),
        assumedBase:
          ops.assumed.includes("Room revenue share") ||
          ops.assumed.includes("OTA mix %"),
      };
    case "readiness":
      return {
        base: roomRev,
        assumedBase: ops.assumed.includes("Room revenue share"),
      };
    case "revenue_pricing":
    case "guest_experience":
      return { base: revenue, assumedBase: false };
  }
}

function evidenceReadiness(input: ValueCalculatorInput): number {
  const systemsScore =
    input.systems === "1_2" ? 0.35 : input.systems === "3_5" ? 0.65 : 0.85;
  const cadenceScore =
    input.reconcileCadence === "realtime"
      ? 1
      : input.reconcileCadence === "daily"
        ? 0.8
        : input.reconcileCadence === "weekly"
          ? 0.55
          : 0.35;
  const manualScore =
    input.manualRecon === "low"
      ? 0.9
      : input.manualRecon === "medium"
        ? 0.55
        : 0.3;
  const stdScore =
    input.decisionStandardization === "high"
      ? 0.9
      : input.decisionStandardization === "medium"
        ? 0.6
        : 0.35;
  return clamp(
    systemsScore * 0.25 +
      cadenceScore * 0.3 +
      manualScore * 0.25 +
      stdScore * 0.2,
    0,
    1,
  );
}

function confidenceFrom(
  input: ValueCalculatorInput,
  ops: ResolvedOps,
): { level: ConfidenceLevel; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0.25;
  if (input.annualRevenue > 0) {
    score += 0.25;
    reasons.push("Revenue supplied");
  } else {
    reasons.push("Revenue missing — model limited");
  }
  if (input.locations > 0) {
    score += 0.1;
    reasons.push(`${input.locations} location(s)`);
  }
  score += Math.min(0.25, ops.known.length * 0.05);
  for (const k of ops.known) reasons.push(`${k} supplied`);
  for (const a of ops.assumed) reasons.push(`${a} assumed`);
  if (input.painAreas !== "unsure" && input.painAreas.length > 0) {
    score += 0.1;
    reasons.push("Pain areas selected");
  } else {
    reasons.push("Pain areas: evaluating all applicable");
  }
  score += evidenceReadiness(input) * 0.15;

  if (input.annualRevenue <= 0) {
    score = Math.min(score, 0.35);
  }

  const level: ConfidenceLevel =
    score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";
  return { level, reasons };
}

type RawCat = {
  id: CategoryId;
  low: number;
  modeled: number;
  high: number;
  assumedBase: boolean;
  assumptionId: string;
  group: OverlapGroup;
  timeToProve: number;
  effort: number;
};

function applyOverlap(raw: RawCat[]): {
  adjusted: RawCat[];
  groups: string[];
} {
  const byGroup = new Map<OverlapGroup, RawCat[]>();
  for (const c of raw) {
    const list = byGroup.get(c.group) ?? [];
    list.push(c);
    byGroup.set(c.group, list);
  }
  const factor = PORTFOLIO.overlapCorrelationFactor;
  const adjusted: RawCat[] = [];
  const groups: string[] = [];

  for (const [group, items] of byGroup) {
    groups.push(group);
    if (items.length === 1) {
      adjusted.push(items[0]!);
      continue;
    }
    const sorted = [...items].sort((a, b) => b.modeled - a.modeled);
    const primary = sorted[0]!;
    adjusted.push(primary);
    for (const secondary of sorted.slice(1)) {
      adjusted.push({
        ...secondary,
        low: secondary.low * factor,
        modeled: secondary.modeled * factor,
        high: secondary.high * factor,
      });
    }
  }
  return { adjusted, groups };
}

function applyPortfolioCap(
  cats: RawCat[],
  revenue: number,
): { cats: RawCat[]; applied: boolean } {
  if (revenue <= 0) return { cats, applied: false };
  const cap = revenue * PORTFOLIO.portfolioCapRate;
  const modeledSum = cats.reduce((s, c) => s + c.modeled, 0);
  if (modeledSum <= cap || modeledSum === 0) return { cats, applied: false };
  const scale = cap / modeledSum;
  return {
    applied: true,
    cats: cats.map((c) => ({
      ...c,
      low: c.low * scale,
      modeled: c.modeled * scale,
      high: c.high * scale,
    })),
  };
}

export function calculateValueOpportunity(
  input: ValueCalculatorInput,
): ValueCalculatorResult {
  const locations = Math.max(0, Math.floor(finite(input.locations)));
  const revenue = finite(input.annualRevenue);
  const ops = resolveOperating(input);
  const pain = resolvePain(input.vertical, input.painAreas);
  const readiness = evidenceReadiness(input);
  const { level, reasons } = confidenceFrom(input, ops);

  const raw: RawCat[] = [];
  for (const id of pain) {
    const a = assumptionByCategory(id);
    if (!a) continue;
    const override = input.rateOverrides?.[a.id];
    const rates = {
      low: override?.low ?? a.rates.low,
      base: override?.base ?? a.rates.base,
      high: override?.high ?? a.rates.high,
    };
    const { base, assumedBase } = categoryBase(
      id,
      revenue,
      ops,
      input.vertical,
    );
    raw.push({
      id,
      low: finite(base * rates.low),
      modeled: finite(base * rates.base),
      high: finite(base * rates.high),
      assumedBase,
      assumptionId: a.id,
      group: a.overlapGroup,
      timeToProve: a.timeToProve,
      effort: a.effort,
    });
  }

  const { adjusted, groups } = applyOverlap(raw);
  const capped = applyPortfolioCap(adjusted, revenue);

  const categories: CategoryResult[] = capped.cats
    .map((c) => {
      const priority =
        c.modeled *
        readiness *
        c.timeToProve *
        (1 / Math.max(0.15, c.effort));
      return {
        id: c.id,
        label: CATEGORY_LABEL[c.id],
        low: Math.round(c.low),
        modeled: Math.round(c.modeled),
        high: Math.round(c.high),
        evidenceReadiness: readiness,
        priority,
        evidenceNeeded: EVIDENCE_BY_CATEGORY[c.id],
        assumptionId: c.assumptionId,
        assumedBase: c.assumedBase,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const total = {
    low: Math.round(categories.reduce((s, c) => s + c.low, 0)),
    modeled: Math.round(categories.reduce((s, c) => s + c.modeled, 0)),
    high: Math.round(categories.reduce((s, c) => s + c.high, 0)),
  };

  const captureRate = clamp(
    input.captureRate ?? PORTFOLIO.defaultCaptureRate,
    PORTFOLIO.captureRateMin,
    PORTFOLIO.captureRateMax,
  );
  const capturedLow = Math.round(total.low * captureRate);
  const capturedModeled = Math.round(total.modeled * captureRate);

  const investment = finite(input.annualInvestment ?? 0);
  let roi: ValueCalculatorResult["roi"] = null;
  if (investment > 0) {
    const netLow = capturedLow - investment;
    const netModeled = capturedModeled - investment;
    roi = {
      investment,
      netLow,
      netModeled,
      roiLow: netLow / investment,
      roiModeled: netModeled / investment,
      paybackMonthsModeled:
        capturedModeled > 0
          ? Math.round((investment / (capturedModeled / 12)) * 10) / 10
          : null,
    };
  }

  const start = categories[0] ?? null;
  const startingWhy: string[] = [];
  if (start) {
    startingWhy.push(
      `Modeled priority favors ${start.label} after evidence readiness and time-to-prove.`,
    );
    if (start.evidenceReadiness >= 0.55) {
      startingWhy.push("Evidence availability is relatively favorable.");
    }
    const a = assumptionByCategory(start.id);
    if (a && a.effort <= 0.4) {
      startingWhy.push("Lower implementation disruption vs other classes.");
    }
    if (a && a.timeToProve >= 0.8) {
      startingWhy.push("Faster path to verification.");
    }
  }

  return {
    total,
    headline: { low: total.low, modeled: total.modeled },
    categories,
    confidence: level,
    confidenceReasons: reasons,
    startingOpportunity: start?.id ?? null,
    startingWhy,
    captureScenario: {
      rate: captureRate,
      capturedLow,
      capturedModeled,
    },
    roi,
    verifiedValue: 0,
    currency: input.currency,
    methodology: {
      disclaimer: DISCLAIMER,
      assumptionIds: categories.map((c) => c.assumptionId),
      overlapGroupsApplied: groups,
      portfolioCapApplied: capped.applied,
    },
  };
}

/** Sample profiles — clearly illustrative. */
export function sampleInput(
  kind: "restaurant_group" | "hotel_group" | "mixed_group",
): ValueCalculatorInput {
  if (kind === "restaurant_group") {
    return {
      vertical: "restaurant",
      locations: 12,
      annualRevenue: 48_000_000,
      currency: "USD",
      laborPct: 0.29,
      foodCogsPct: 0.27,
      purchasingPct: 0.31,
      deliveryMixPct: 0.18,
      painAreas: "unsure",
      systems: "3_5",
      reconcileCadence: "weekly",
      manualRecon: "medium",
      decisionStandardization: "medium",
      captureRate: PORTFOLIO.defaultCaptureRate,
    };
  }
  if (kind === "hotel_group") {
    return {
      vertical: "hotel",
      locations: 8,
      annualRevenue: 95_000_000,
      currency: "USD",
      laborPct: 0.33,
      purchasingPct: 0.17,
      occupancy: 0.74,
      otaMixPct: 0.48,
      roomRevenueShare: 0.68,
      painAreas: "unsure",
      systems: "6_plus",
      reconcileCadence: "daily",
      manualRecon: "medium",
      decisionStandardization: "low",
      captureRate: PORTFOLIO.defaultCaptureRate,
    };
  }
  return {
    vertical: "mixed",
    locations: 20,
    annualRevenue: 120_000_000,
    currency: "USD",
    laborPct: 0.3,
    purchasingPct: 0.24,
    restaurantShare: 0.45,
    hotelShare: 0.55,
    roomRevenueShare: 0.38,
    otaMixPct: 0.35,
    painAreas: "unsure",
    systems: "6_plus",
    reconcileCadence: "weekly",
    manualRecon: "high",
    decisionStandardization: "medium",
    captureRate: PORTFOLIO.defaultCaptureRate,
  };
}

export function formatMoney(
  amount: number,
  currency: ValueCalculatorInput["currency"],
): string {
  const abs = Math.abs(Math.round(amount));
  const grouped = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = amount < 0 ? "−" : "";
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
    SGD: "S$",
    JPY: "¥",
    HKD: "HK$",
    AUD: "A$",
    MXN: "MX$",
    BRL: "R$",
    ZAR: "R",
    OTHER: "",
  };
  return `${sign}${symbols[currency] ?? ""}${grouped}`;
}

export function formatRange(
  low: number,
  modeled: number,
  currency: ValueCalculatorInput["currency"],
): string {
  return `${formatMoney(low, currency)} – ${formatMoney(modeled, currency)}`;
}
