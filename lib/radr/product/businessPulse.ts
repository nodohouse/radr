/**
 * Business Pulse selector — operating metrics with mandatory comparisons.
 * Values from CONNECTED_PILOT_MTD + Decision ledger (Verified / exposure).
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { RoleView } from "@/lib/product/types";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import {
  CONNECTED_PILOT_MTD,
  locationPulseBaseForVertical,
  type PilotLocationPulse,
} from "@/lib/radr/product/demoOperatingPulse";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { attentionEuro } from "@/lib/radr/product/valueAggregate";
import { dataHealthSummaryForRole } from "@/lib/radr/product/dataHealthCanonical";
import type { ComparisonType } from "@/lib/radr/product/operatingMetrics";
import { normalizeLocationId } from "@/lib/radr/product/demoOrg";
import { outlierFor } from "@/lib/radr/demo/demoOutliers";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";

export type PulseMetric = {
  id: string;
  label: string;
  value: number;
  formatted: string;
  comparisonType: ComparisonType | null;
  comparisonValue: number | null;
  comparisonFormatted: string | null;
  comparisonPeriod: string;
  /** Arithmetic direction of the comparison delta */
  direction: "up" | "down" | "flat" | null;
  /** Positive comparison is good for this metric? */
  higherIsBetter: boolean;
  href?: string;
  tier: "primary" | "support";
};

export type BusinessPulse = {
  period: "mtd";
  scopeLabel: string;
  primary: PulseMetric[];
  support: PulseMetric[];
  locations: PilotLocationPulse[];
};

function pctDelta(actual: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Math.round(((actual - baseline) / baseline) * 1000) / 10;
}

function ppDelta(actual: number, baseline: number): number {
  return Math.round((actual - baseline) * 10) / 10;
}

/** Arithmetic direction only — use higherIsBetter + resolveSemantic for color. */
function arithDir(delta: number): "up" | "down" | "flat" {
  if (Math.abs(delta) < 0.05) return "flat";
  return delta > 0 ? "up" : "down";
}

function formatPp(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}pp`;
}

function formatPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function formatMoneyDelta(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${formatDecisionMoney(Math.abs(n))}`;
}

export function getBusinessPulse(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): BusinessPulse {
  const f = CONNECTED_PILOT_MTD;
  const agg = deriveValueAggregate(role, vertical);

  const revVsForecast = pctDelta(f.revenue.actual, f.revenue.forecast);
  const contribVsPlan = f.contribution.actual - f.contribution.plan;
  const laborVsTarget = ppDelta(f.laborPct.actual, f.laborPct.target);
  const foodVsPlan = ppDelta(f.foodCostPct.actual, f.foodCostPct.plan);
  const coversVsForecast = pctDelta(f.covers.actual, f.covers.forecast);
  const spendVsPrior = f.avgSpend.actual - f.avgSpend.priorComparable;

  const primary: PulseMetric[] = [
    {
      id: "revenue_mtd",
      label: "Revenue",
      value: f.revenue.actual,
      formatted: formatDecisionMoney(f.revenue.actual),
      comparisonType: "vs_forecast",
      comparisonValue: revVsForecast,
      comparisonFormatted: formatPct(revVsForecast),
      comparisonPeriod: "vs forecast",
      direction: arithDir(revVsForecast),
      higherIsBetter: true,
      href: "/app/intelligence?cat=revenue",
      tier: "primary",
    },
    {
      id: "contribution_mtd",
      label: "Contribution",
      value: f.contribution.actual,
      formatted: formatDecisionMoney(f.contribution.actual),
      comparisonType: "vs_plan",
      comparisonValue: contribVsPlan,
      comparisonFormatted: formatMoneyDelta(contribVsPlan),
      comparisonPeriod: "vs plan",
      direction: arithDir(contribVsPlan),
      higherIsBetter: true,
      href: "/app/intelligence?cat=financial",
      tier: "primary",
    },
    {
      id: "verified_value_mtd",
      label: "Verified Value",
      value: agg.verifiedTotal,
      formatted: formatDecisionMoney(agg.verifiedTotal),
      comparisonType: "vs_prior_period",
      comparisonValue: null,
      comparisonFormatted: `${agg.decisionIdsVerified.length} Decisions`,
      comparisonPeriod: "MTD sealed",
      direction: null,
      higherIsBetter: true,
      href: "/app/value",
      tier: "primary",
    },
  ];

  const support: PulseMetric[] = [
    {
      id: "labor_pct_mtd",
      label: "Labor",
      value: f.laborPct.actual,
      formatted: `${f.laborPct.actual.toFixed(1)}%`,
      comparisonType: "vs_target",
      comparisonValue: laborVsTarget,
      comparisonFormatted: formatPp(laborVsTarget),
      comparisonPeriod: "vs target",
      direction: arithDir(laborVsTarget),
      higherIsBetter: false,
      tier: "support",
    },
    {
      id: "food_cost_pct_mtd",
      label: "Food cost",
      value: f.foodCostPct.actual,
      formatted: `${f.foodCostPct.actual.toFixed(1)}%`,
      comparisonType: "vs_plan",
      comparisonValue: foodVsPlan,
      comparisonFormatted: formatPp(foodVsPlan),
      comparisonPeriod: "vs plan",
      direction: arithDir(foodVsPlan),
      higherIsBetter: false,
      tier: "support",
    },
    {
      id: "covers_mtd",
      label: "Covers",
      value: f.covers.actual,
      formatted: f.covers.actual.toLocaleString("en-GB"),
      comparisonType: "vs_forecast",
      comparisonValue: coversVsForecast,
      comparisonFormatted: formatPct(coversVsForecast),
      comparisonPeriod: "vs forecast",
      direction: arithDir(coversVsForecast),
      higherIsBetter: true,
      tier: "support",
    },
    {
      id: "avg_spend_mtd",
      label: "Avg spend",
      value: f.avgSpend.actual,
      formatted: formatDecisionMoney(f.avgSpend.actual),
      comparisonType: "vs_prior_period",
      comparisonValue: spendVsPrior,
      comparisonFormatted: formatMoneyDelta(spendVsPrior),
      comparisonPeriod: "vs prior",
      direction: arithDir(spendVsPrior),
      higherIsBetter: true,
      tier: "support",
    },
  ];

  const records = scopedDecisionsForDemo(listDecisionRecords(), role, vertical);
  const scope = resolveRoleScope(role, vertical);
  const pulseBase = locationPulseBaseForVertical(vertical);
  const allowedLocIds = new Set(scope.allowedLocationIds);
  const locations: PilotLocationPulse[] = pulseBase
    .filter((base) => allowedLocIds.has(base.locationId))
    .map((base) => {
    const locRecords = records.filter(
      (r) =>
        normalizeLocationId(r.locationId) === base.locationId ||
        (base.locationId === "loc_berlin_mitte" && r.locationId === "loc_ber"),
    );
    const needs = locRecords.filter((r) => recordAttention(r) === "needs_you");
    let exposure = needs.reduce((s, r) => s + attentionEuro(r), 0);
    // Material outlier / procurement exposure must surface even without a
    // needs-you Decision scoped to this location (e.g. Frankfurt).
    const outlier = outlierFor(base.locationId);
    if (exposure === 0 && outlier?.polarity === "negative") {
      const driverSum = Math.abs(
        outlier.drivers.reduce((s, d) => s + Math.min(0, d.amount), 0),
      );
      exposure = driverSum || 8400;
      // Frankfurt procurement archetype → annualized 8.4k on pulse
      if (
        base.locationId === "loc_frankfurt_westend" ||
        outlier.archetype === "procurement_shock"
      ) {
        exposure = Math.max(exposure, 1840);
      }
    }
    // Seed awareness: restaurant org procurement_shock locations
    if (
      exposure === 0 &&
      vertical === "restaurant" &&
      NORTHSTAR_RESTAURANTS.locations.some(
        (l) => l.id === base.locationId && l.archetype === "procurement_shock",
      )
    ) {
      exposure = 1840;
    }
    const verified = locRecords
      .filter(
        (r) =>
          recordAttention(r) === "verified" || recordAttention(r) === "learned",
      )
      .reduce((s, r) => s + (r.verifiedValue?.amount ?? 0), 0);
    const health = dataHealthSummaryForRole(role, vertical);
    let dataHealth: "ok" | "warn" | "bad" = base.dataHealth;
    if (base.locationId === "loc_berlin_mitte" && health.unhealthyCount > 0) {
      dataHealth = health.tone === "bad" ? "bad" : "warn";
    }
    return {
      ...base,
      activeExposure: exposure,
      needsYouCount: needs.length,
      verifiedValue: verified,
      dataHealth,
    };
  });

  return {
    period: "mtd",
    scopeLabel:
      scope.scopeType === "LOCATION"
        ? `${scope.shortLabel} · MTD`
        : `${scope.shortLabel} · ${scope.allowedLocationIds.length} locations · MTD`,
    primary,
    support,
    locations,
  };
}
