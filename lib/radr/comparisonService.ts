/**
 * Location comparison domain service.
 * Single source for compare workspace + Butler.
 */

import { getDashboard, type DashPeriod } from "@/lib/product/demo/dashboard";
import { getLocationById, locationChartColor, locationSubtitle } from "@/lib/radr/locationCatalog";
import { LOCATIONS } from "@/lib/product/demo/catalog";
import { DEMO_FX_TO_EUR } from "@/lib/radr/currency";
import { getVenueProfile, type CurrencyCode } from "@/lib/radr/venueProfiles";

export type CompareMetric =
  | "revenue"
  | "margin"
  | "covers"
  | "avgSpend"
  | "labor"
  | "cancellations"
  | "valueAtRisk";

export type CompareLocationRow = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  subtitle: string;
  color: string;
  currency: CurrencyCode;
  revenue: number;
  margin: number;
  covers: number;
  avgSpend: number;
  labor: number;
  cancellations: number;
  valueAtRisk: number;
  openFindings: number;
  revenueSeries: { label: string; value: number }[];
};

export type LocationComparisonResult =
  | {
      ok: true;
      locationIds: string[];
      locations: CompareLocationRow[];
      reportingCurrency: "EUR";
      sameCity: boolean;
      cityLabel: string | null;
      cityAvgMargin: number | null;
      groupAvgMargin: number;
      summary: string;
      mixedCurrency: boolean;
      invalidIds: string[];
    }
  | {
      ok: false;
      error: "too_few" | "too_many" | "invalid" | "unauthorized";
      message: string;
      invalidIds: string[];
    };

const CURRENCY_BY_COUNTRY: Record<string, CurrencyCode> = {
  NL: "EUR",
  DE: "EUR",
  FR: "EUR",
  UK: "GBP",
  US: "USD",
  JP: "JPY",
  SG: "SGD",
  AE: "AED",
  AU: "AUD",
};

function shortName(name: string) {
  return name
    .replace(/^Amsterdam /, "")
    .replace(/^Berlin /, "")
    .replace(/^Paris /, "")
    .replace(/^London /, "")
    .replace(/^New York /, "")
    .replace(/^San Francisco /, "")
    .replace(/^Tokyo /, "")
    .replace(/^Singapore /, "")
    .replace(/^Dubai /, "")
    .replace(/^Sydney /, "");
}

function buildSeries(base: number, seed: number) {
  const labels = ["W1", "W2", "W3", "W4"];
  return labels.map((label, i) => ({
    label,
    value: Math.round(base * (0.82 + ((seed + i) % 5) * 0.04 + i * 0.035)),
  }));
}

export function parseComparisonLocationIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
    .slice(0, 8);
}

export function buildCompareHref(locationIds: string[]): string {
  const qs = locationIds.map((id) => encodeURIComponent(id)).join(",");
  return `/app/compare?locations=${qs}`;
}

export function getLocationComparison(input: {
  locationIds: string[];
  period?: DashPeriod;
  allowedLocationIds?: string[] | "all";
}): LocationComparisonResult {
  const period = input.period ?? "yesterday";
  const unique = [...new Set(input.locationIds.filter(Boolean))];

  if (unique.length < 2) {
    return {
      ok: false,
      error: "too_few",
      message: "Select at least 2 locations to compare.",
      invalidIds: [],
    };
  }
  if (unique.length > 4) {
    return {
      ok: false,
      error: "too_many",
      message: "Compare up to 4 locations.",
      invalidIds: [],
    };
  }

  const invalidIds = unique.filter((id) => !getLocationById(id));
  if (invalidIds.length) {
    return {
      ok: false,
      error: "invalid",
      message: "One or more selected locations are no longer available.",
      invalidIds,
    };
  }

  if (input.allowedLocationIds && input.allowedLocationIds !== "all") {
    const allowed = new Set(input.allowedLocationIds);
    const denied = unique.filter((id) => !allowed.has(id));
    if (denied.length) {
      return {
        ok: false,
        error: "unauthorized",
        message: "You do not have access to one of these locations.",
        invalidIds: denied,
      };
    }
  }

  const locations: CompareLocationRow[] = unique.map((id, i) => {
    const loc = getLocationById(id)!;
    const dash = getDashboard(id, period);
    const currency =
      getVenueProfile(id).currency ?? CURRENCY_BY_COUNTRY[loc.country] ?? "EUR";
    const fx = DEMO_FX_TO_EUR[currency];
    const revenueLocal = dash.today.revenue;
    const revenue = Math.round(revenueLocal * fx);
    const covers = Math.round(revenueLocal / (58 + i * 3));
    const avgSpendLocal = revenueLocal / Math.max(covers, 1);
    return {
      id,
      name: loc.name,
      shortName: shortName(loc.name),
      city: loc.city,
      country: loc.country,
      subtitle: locationSubtitle(loc),
      color: locationChartColor(i),
      currency,
      revenue,
      margin: dash.marginCurrent,
      covers,
      avgSpend: Math.round(avgSpendLocal * fx * 10) / 10,
      labor: dash.today.laborPct,
      cancellations: 1 + (i % 4) + (loc.city === "New York" && i === 1 ? 2 : 0),
      valueAtRisk: Math.round(dash.valueAtRisk * fx),
      openFindings: loc.openSignals,
      revenueSeries: buildSeries(revenue, i * 3),
    };
  });

  const sameCity = locations.every((l) => l.city === locations[0]!.city);
  const cityLabel = sameCity ? locations[0]!.city : null;
  const cityAvgMargin = sameCity
    ? Math.round(
        (locations.reduce((s, l) => s + l.margin, 0) / locations.length) * 10,
      ) / 10
    : null;
  const groupAvgMargin =
    Math.round(
      (LOCATIONS.reduce((s, l) => {
        const d = getDashboard(l.id, period);
        return s + d.marginCurrent;
      }, 0) /
        LOCATIONS.length) *
        10,
    ) / 10;

  const byMargin = [...locations].sort((a, b) => b.margin - a.margin);
  const byRevenue = [...locations].sort((a, b) => b.revenue - a.revenue);
  const byCancel = [...locations].sort(
    (a, b) => b.cancellations - a.cancellations,
  );

  const summary = `${byMargin[0]!.shortName} is leading operating margin at ${byMargin[0]!.margin.toFixed(1)}%. ${byRevenue[0]!.shortName} is generating the highest revenue. ${byCancel[0]!.shortName} has the highest cancellation exposure.`;

  const mixedCurrency = new Set(locations.map((l) => l.currency)).size > 1;

  return {
    ok: true,
    locationIds: unique,
    locations,
    reportingCurrency: "EUR",
    sameCity,
    cityLabel,
    cityAvgMargin,
    groupAvgMargin,
    summary,
    mixedCurrency,
    invalidIds: [],
  };
}
