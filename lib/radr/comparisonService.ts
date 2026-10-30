/**
 * Location comparison domain service.
 * Single source for compare workspace + Butler.
 */

import { getDashboard, type DashPeriod } from "@/lib/product/demo/dashboard";
import { getLocationById, locationChartColor, locationSubtitle } from "@/lib/radr/locationCatalog";
import { toCatalogLocationId } from "@/lib/radr/product/locationIds";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { NORTHSTAR_RESTAURANTS, NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";
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
  GB: "GBP",
  US: "USD",
  JP: "JPY",
  SG: "SGD",
  AE: "AED",
  AU: "AUD",
  HK: "HKD",
  MX: "MXN",
  BR: "BRL",
  ZA: "ZAR",
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

export function parseComparisonLocationIds(
  raw: string | null | undefined,
  from?: string | null,
  to?: string | null,
): string[] {
  const fromLocations = raw
    ? raw
        .split(",")
        .map((s) => decodeURIComponent(s.trim()))
        .filter(Boolean)
    : [];
  // Legacy / estate-learn links used ?from=&to=
  if (fromLocations.length === 0 && from && to) {
    return [
      decodeURIComponent(from.trim()),
      decodeURIComponent(to.trim()),
    ].filter(Boolean);
  }
  return fromLocations.slice(0, 8);
}

export function buildCompareHref(
  locationIds: string[],
  opts?: { transferId?: string; stay?: boolean },
): string {
  const qs = locationIds.map((id) => encodeURIComponent(id)).join(",");
  const transfer = opts?.transferId
    ? `&transfer=${encodeURIComponent(opts.transferId)}`
    : "";
  const stay = opts?.stay === false ? "" : "&stay=1";
  return `/app/compare?locations=${qs}${transfer}${stay}`;
}

function resolveCompareLocation(id: string) {
  const direct = getLocationById(id);
  if (direct) return { loc: direct, displayName: direct.name, city: direct.city };

  const catalogId = toCatalogLocationId(id);
  const catalog = getLocationById(catalogId);
  if (!catalog) return null;

  const orgLoc =
    NORTHSTAR_RESTAURANTS.locations.find((l) => l.id === id) ??
    NORTHSTAR_HOTELS.locations.find((l) => l.id === id);
  const displayName =
    orgLoc?.displayName ?? orgLoc?.name ?? locationDisplayName(id) ?? catalog.name;
  const city = orgLoc?.city ?? catalog.city;
  return {
    loc: { ...catalog, id, name: displayName, city },
    displayName,
    city,
  };
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

  const resolved = unique.map((id) => ({ id, resolved: resolveCompareLocation(id) }));
  const invalidIds = resolved.filter((r) => !r.resolved).map((r) => r.id);
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

  const locations: CompareLocationRow[] = resolved.map(({ id, resolved: hit }, i) => {
    const loc = hit!.loc;
    const catalogId = toCatalogLocationId(id);
    const dash = getDashboard(catalogId, period);
    const currency =
      getVenueProfile(catalogId).currency ??
      getVenueProfile(id).currency ??
      CURRENCY_BY_COUNTRY[loc.country] ??
      "EUR";
    const fx = DEMO_FX_TO_EUR[currency];
    const revenueLocal = dash.today.revenue;
    const revenue = Math.round(revenueLocal * fx);
    const covers = Math.round(revenueLocal / (58 + i * 3));
    const avgSpendLocal = revenueLocal / Math.max(covers, 1);
    return {
      id,
      name: hit!.displayName,
      shortName: shortName(hit!.displayName),
      city: hit!.city,
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
