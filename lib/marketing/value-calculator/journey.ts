/**
 * V2 guided journey state + resolver into engine input.
 */

import { PORTFOLIO, type CategoryId, type VerticalId } from "./assumptions";
import { calculateValueOpportunity } from "./calculateValueOpportunity";
import {
  DELIVERY_OPTIONS,
  INVESTMENT_OPTIONS,
  LOCATION_OPTIONS,
  MIXED_BALANCE_OPTIONS,
  OCCUPANCY_OPTIONS,
  optionById,
  OTA_OPTIONS,
  PCT_OPTIONS,
  PURCHASING_OPTIONS,
  REVENUE_OPTIONS_USD,
  SYSTEMS_OPTIONS,
  type NumericRange,
} from "./ranges";
import type {
  CurrencyCode,
  OtherKind,
  ValueCalculatorInput,
  ValueCalculatorResult,
} from "./types";

export type JourneyStep =
  | "intro"
  | "operation"
  | "scale"
  | "economics"
  | "signals"
  | "analyzing"
  | "result";

export type JourneyState = {
  vertical: VerticalId | null;
  otherKind: OtherKind | null;
  locationsId: string | null;
  revenueId: string | null;
  currency: CurrencyCode;
  coversId: string | null;
  roomsId: string | null;
  mixedBalanceId: string | null;
  laborId: string | null;
  foodId: string | null;
  deliveryId: string | null;
  purchasingId: string | null;
  occupancyId: string | null;
  adrId: string | null;
  otaId: string | null;
  painUnsure: boolean;
  painAreas: CategoryId[];
  systemsId: string | null;
  reconcileId: string | null;
  manualId: string | null;
  stdId: string | null;
  captureRate: number;
  investmentId: string | null;
  rateOverrides?: ValueCalculatorInput["rateOverrides"];
};

export function emptyJourney(): JourneyState {
  return {
    vertical: null,
    otherKind: null,
    locationsId: null,
    revenueId: null,
    currency: "USD",
    coversId: null,
    roomsId: null,
    mixedBalanceId: null,
    laborId: null,
    foodId: null,
    deliveryId: null,
    purchasingId: null,
    occupancyId: null,
    adrId: null,
    otaId: null,
    painUnsure: true,
    painAreas: [],
    systemsId: null,
    reconcileId: null,
    manualId: null,
    stdId: null,
    captureRate: PORTFOLIO.defaultCaptureRate,
    investmentId: null,
  };
}

function mid(r: NumericRange | null | undefined): number | undefined {
  return r?.base;
}

export function resolveEngineInput(
  j: JourneyState,
): ValueCalculatorInput | null {
  if (!j.vertical || !j.locationsId || !j.revenueId) return null;

  const loc = optionById(LOCATION_OPTIONS, j.locationsId);
  const rev = optionById(REVENUE_OPTIONS_USD, j.revenueId);
  if (!loc?.range) return null;

  const revenueBase = rev?.range?.base ?? 10_000_000;

  const labor = optionById(PCT_OPTIONS, j.laborId);
  const food = optionById(PCT_OPTIONS, j.foodId);
  const delivery = optionById(DELIVERY_OPTIONS, j.deliveryId);
  const purchasing = optionById(PURCHASING_OPTIONS, j.purchasingId);
  const occupancy = optionById(OCCUPANCY_OPTIONS, j.occupancyId);
  const ota = optionById(OTA_OPTIONS, j.otaId);
  const invest = optionById(INVESTMENT_OPTIONS, j.investmentId);

  const systems =
    SYSTEMS_OPTIONS.find((s) => s.id === j.systemsId)?.map ?? "3_5";

  const mixed = MIXED_BALANCE_OPTIONS.find((m) => m.id === j.mixedBalanceId);

  return {
    vertical: j.vertical,
    otherKind: j.otherKind ?? undefined,
    locations: Math.round(loc.range.base),
    annualRevenue: revenueBase,
    currency: j.currency,
    laborPct: mid(labor?.range ?? null),
    foodCogsPct: mid(food?.range ?? null),
    deliveryMixPct: mid(delivery?.range ?? null),
    purchasingPct: mid(purchasing?.range ?? null),
    occupancy: mid(occupancy?.range ?? null),
    otaMixPct: mid(ota?.range ?? null),
    roomRevenueShare:
      j.vertical === "hotel" || j.vertical === "mixed" ? 0.65 : undefined,
    restaurantShare: mixed?.restaurantShare,
    hotelShare: mixed ? 1 - mixed.restaurantShare : undefined,
    painAreas:
      j.painUnsure || j.painAreas.length === 0 ? "unsure" : j.painAreas,
    systems,
    reconcileCadence:
      (j.reconcileId as ValueCalculatorInput["reconcileCadence"]) ?? "weekly",
    manualRecon:
      (j.manualId as ValueCalculatorInput["manualRecon"]) ?? "medium",
    decisionStandardization:
      (j.stdId as ValueCalculatorInput["decisionStandardization"]) ?? "medium",
    captureRate: j.captureRate,
    annualInvestment: invest?.range?.base,
    rateOverrides: j.rateOverrides,
  };
}

export function calculateValueMap(
  j: JourneyState,
): ValueCalculatorResult | null {
  const input = resolveEngineInput(j);
  if (!input) return null;
  return calculateValueOpportunity(input);
}

export type PreviewConfidence = "low" | "medium" | "high";

export function previewConfidence(j: JourneyState): {
  level: PreviewConfidence;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;
  if (j.vertical) {
    score += 0.15;
    reasons.push("Operation selected");
  }
  if (j.locationsId) {
    score += 0.15;
    reasons.push("Scale known");
  }
  if (j.revenueId && j.revenueId !== "unknown") {
    score += 0.2;
    reasons.push("Revenue range known");
  } else if (j.revenueId === "unknown") {
    reasons.push("Revenue assumed");
  }
  if (j.laborId && j.laborId !== "unknown") {
    score += 0.15;
    reasons.push("Labor known");
  } else if (j.laborId === "unknown") {
    reasons.push("Labor assumed");
  }
  if (
    (j.vertical === "restaurant" || j.vertical === "mixed") &&
    j.foodId &&
    j.foodId !== "unknown"
  ) {
    score += 0.1;
    reasons.push("Food cost known");
  }
  if (j.purchasingId && j.purchasingId !== "unknown") {
    score += 0.1;
    reasons.push("Purchasing known");
  } else if (j.purchasingId === "unknown") {
    reasons.push("Purchasing assumed");
  }
  if (j.systemsId && j.reconcileId && j.manualId) {
    score += 0.15;
    reasons.push("Maturity provided");
  }
  const level: PreviewConfidence =
    score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";
  return { level, reasons };
}

export function verticalLabel(v: VerticalId | null): string {
  switch (v) {
    case "restaurant":
      return "Restaurant group";
    case "hotel":
      return "Hotel portfolio";
    case "mixed":
      return "Mixed hospitality portfolio";
    case "other":
      return "Hospitality operation";
    default:
      return "Operation";
  }
}

export function sampleJourney(
  kind: "restaurant" | "hotel" | "mixed",
): JourneyState {
  const base = emptyJourney();
  if (kind === "restaurant") {
    return {
      ...base,
      vertical: "restaurant",
      locationsId: "6_10",
      revenueId: "25_50",
      currency: "USD",
      laborId: "25_29",
      foodId: "30_34",
      deliveryId: "16_30",
      purchasingId: "20_30",
      painUnsure: false,
      painAreas: ["labor", "supplier_ap", "procurement"],
      systemsId: "5_7",
      reconcileId: "weekly",
      manualId: "high",
      stdId: "medium",
    };
  }
  if (kind === "hotel") {
    return {
      ...base,
      vertical: "hotel",
      locationsId: "4_5",
      revenueId: "50_100",
      currency: "USD",
      laborId: "30_34",
      occupancyId: "70_79",
      adrId: "200_299",
      otaId: "36_50",
      purchasingId: "10_20",
      painUnsure: false,
      painAreas: ["channel_mix", "labor", "readiness"],
      systemsId: "5_7",
      reconcileId: "daily",
      manualId: "medium",
      stdId: "low",
    };
  }
  return {
    ...base,
    vertical: "mixed",
    locationsId: "11_20",
    revenueId: "100_250",
    currency: "USD",
    mixedBalanceId: "balanced",
    laborId: "25_29",
    purchasingId: "20_30",
    otaId: "21_35",
    painUnsure: true,
    painAreas: [],
    systemsId: "8_plus",
    reconcileId: "weekly",
    manualId: "high",
    stdId: "medium",
  };
}
