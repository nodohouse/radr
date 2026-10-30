/**
 * Locations — Portfolio Operating Intelligence model for /app/locations.
 * KEEP LOGIC: getPortfolioEconomics · group = Σ locations · verified ≡ Value.
 * Deterministic. No Math.random().
 */

import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  getPortfolioEconomics,
  assertPortfolioIdentity,
  type LocationEconomics,
  type PortfolioEconomics,
} from "@/lib/radr/product/portfolioEconomics";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";
import {
  recordAttention,
  scopedDecisionsForDemo,
} from "@/lib/radr/product/roleScope";
import {
  needsAttentionOutliers,
  outlierFor,
  type DemoOutlierScenario,
} from "@/lib/radr/demo/demoOutliers";

export type LocationsView =
  | "overview"
  | "performance"
  | "exposure"
  | "profitability"
  | "watchlist";

export type LocationsSort =
  | "contribution"
  | "revenue"
  | "exposure"
  | "attention"
  | "margin";

export type LocationUiState =
  | "outperforming"
  | "on_track"
  | "watch"
  | "intervene"
  | "needs_attention"
  | "data_degraded";

export type LocationRow = {
  id: string;
  name: string;
  city: string;
  revenue: number;
  revenuePlan: number;
  revenueVsPlanPct: number;
  contribution: number;
  contributionPlan: number;
  contributionVsPlanPct: number;
  marginPct: number;
  exposure: number;
  verified: number;
  needsYou: number;
  state: LocationUiState;
  attentionLabel: string;
  trend: number[];
  trendTone: "up" | "down" | "flat";
  primaryDriver: string;
  drivers: { label: string; amount: number }[];
  headline: string;
  upsideEuro: number;
  opportunityLabel: string;
  diagnosisHref: string;
  liveHref: string;
  decisionsHref: string;
  valueHref: string;
  memoryHref: string;
  detailHref: string;
  dataHealth: LocationEconomics["dataHealth"];
};

export type LocationsOverviewModel = {
  periodLabel: "MTD";
  portfolio: PortfolioEconomics;
  identityErrors: string[];
  revenue: number;
  revenueFormatted: string;
  revenueVsPlanPct: number;
  contribution: number;
  contributionFormatted: string;
  contributionVsPlanPct: number;
  locationCount: number;
  needAttentionCount: number;
  avgContribution: number;
  avgContributionFormatted: string;
  avgContributionDeltaPct: number;
  insight: string;
  rows: LocationRow[];
  attention: LocationRow[];
  opportunities: {
    rank: number;
    locationId: string;
    name: string;
    label: string;
    euro: number;
    href: string;
  }[];
  health: {
    onTrack: number;
    outperforming: number;
    watch: number;
    needsAttention: number;
  };
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function trendSeries(id: string, end: number, tone: "up" | "down" | "flat"): number[] {
  const h = hash(id);
  const pts: number[] = [];
  let v = end * (tone === "up" ? 0.72 : tone === "down" ? 1.18 : 0.95);
  for (let i = 0; i < 8; i++) {
    const wobble = ((h >> (i % 5)) % 7) - 3;
    const step =
      tone === "up" ? end * 0.04 : tone === "down" ? -end * 0.035 : end * 0.002;
    v = Math.max(1, v + step + wobble * (end * 0.008));
    pts.push(Math.round(v));
  }
  pts[7] = Math.round(end);
  return pts;
}

function pctDelta(actual: number, plan: number): number {
  if (!plan) return 0;
  return Math.round(((actual - plan) / plan) * 1000) / 10;
}

function deriveState(
  loc: LocationEconomics,
  outlier: DemoOutlierScenario | null,
): LocationUiState {
  if (loc.dataHealth === "bad") return "data_degraded";
  if (loc.needsYou >= 2 || (outlier?.polarity === "negative" && loc.needsYou > 0)) {
    return "needs_attention";
  }
  if (outlier?.polarity === "negative" || loc.contribution < loc.contributionPlan * 0.96) {
    return loc.exposure > 800 || loc.needsYou > 0 ? "intervene" : "watch";
  }
  if (loc.dataHealth === "warn") return "watch";
  const vs = pctDelta(loc.contribution, loc.contributionPlan);
  if (vs >= 8 && outlier?.polarity === "positive") return "outperforming";
  if (vs >= 6) return "outperforming";
  return "on_track";
}

function attentionLabel(state: LocationUiState, needsYou: number): string {
  if (state === "needs_attention") {
    return needsYou > 0 ? `${needsYou} NEEDS YOU` : "NEEDS ATTENTION";
  }
  if (state === "intervene") return "INTERVENE";
  if (state === "watch" || state === "data_degraded") return "WATCH";
  if (state === "outperforming") return "OUTPERFORMING";
  return "ON TRACK";
}

function diagnosisHref(loc: LocationEconomics, outlier: DemoOutlierScenario | null): string {
  if (outlier?.decisionId === "dec_peak_berlin") {
    return "/app/intelligence?finding=kitchen-pressure";
  }
  if (loc.locationId === "loc_frankfurt_westend") {
    return "/app/intelligence?finding=cost-movers&sku=tuna";
  }
  if (loc.locationId === "loc_berlin_kreuzberg") {
    return "/app/intelligence?finding=settlement-bridge";
  }
  return `/app/intelligence?finding=location-exposure`;
}

function upsideFor(loc: LocationEconomics, outlier: DemoOutlierScenario | null): {
  euro: number;
  label: string;
} {
  if (loc.locationId === "loc_berlin_mitte") {
    return { euro: 8400, label: "Menu mix optimization · capacity recovery" };
  }
  if (loc.locationId === "loc_frankfurt_westend") {
    return { euro: 5900, label: "Refund reduction · labor optimization" };
  }
  if (loc.locationId === "loc_koln_ehrenfeld") {
    return { euro: 3200, label: "Terrace activation · demand capture" };
  }
  const gap = Math.max(0, loc.contributionPlan - loc.contribution);
  if (gap > 0) {
    return {
      euro: Math.round(gap * 0.55),
      label: outlier?.drivers[0]?.label ?? "Contribution recovery",
    };
  }
  return { euro: 0, label: "Protect outperformance" };
}

function buildRow(
  loc: LocationEconomics,
  role: RoleView,
  vertical: DemoVerticalFamily,
): LocationRow {
  const outlier =
    vertical === "restaurant" ? outlierFor(loc.locationId) ?? null : null;
  const state = deriveState(loc, outlier);
  const contribVs = pctDelta(loc.contribution, loc.contributionPlan);
  const revVs = pctDelta(loc.revenue, loc.revenuePlan);
  const tone: "up" | "down" | "flat" =
    contribVs > 2 ? "up" : contribVs < -2 ? "down" : "flat";
  const upside = upsideFor(loc, outlier);
  const marginPct =
    loc.revenue > 0
      ? Math.round((loc.contribution / loc.revenue) * 1000) / 10
      : 0;

  return {
    id: loc.locationId,
    name: loc.label,
    city: loc.city,
    revenue: loc.revenue,
    revenuePlan: loc.revenuePlan,
    revenueVsPlanPct: revVs,
    contribution: loc.contribution,
    contributionPlan: loc.contributionPlan,
    contributionVsPlanPct: contribVs,
    marginPct,
    exposure: loc.exposure,
    verified: loc.verified,
    needsYou: loc.needsYou,
    state,
    attentionLabel: attentionLabel(state, loc.needsYou),
    trend: trendSeries(loc.locationId, loc.contribution, tone),
    trendTone: tone,
    primaryDriver: outlier?.drivers[0]?.label ?? loc.revenueDrivers[0]?.label ?? "Operating mix",
    drivers: outlier?.drivers ?? loc.revenueDrivers.map((d) => ({
      label: d.label,
      amount: d.amount,
    })),
    headline: outlier?.headline ?? (contribVs >= 0 ? "On plan" : "Behind plan"),
    upsideEuro: upside.euro,
    opportunityLabel: upside.label,
    diagnosisHref: diagnosisHref(loc, outlier),
    liveHref: `/app/live?location=${loc.locationId}`,
    decisionsHref: `/app/decisions?location=${loc.locationId}`,
    valueHref: `/app/value?location=${loc.locationId}`,
    memoryHref: `/app/memory?location=${loc.locationId}`,
    detailHref: `/app/locations/${loc.locationId}`,
    dataHealth: loc.dataHealth,
  };
}

function sortRows(rows: LocationRow[], sort: LocationsSort): LocationRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (sort) {
      case "revenue":
        return b.revenue - a.revenue;
      case "exposure":
        return b.exposure - a.exposure;
      case "attention":
        return b.needsYou - a.needsYou || b.exposure - a.exposure;
      case "margin":
        return b.marginPct - a.marginPct;
      case "contribution":
      default:
        return b.contribution - a.contribution;
    }
  });
  return copy;
}

function buildInsight(rows: LocationRow[], sort: LocationsSort): string {
  const bad = rows.filter(
    (r) => r.state === "needs_attention" || r.state === "intervene",
  );
  if (sort === "exposure") {
    const top = [...rows].sort((a, b) => b.exposure - a.exposure)[0];
    if (top) {
      const share = rows.reduce((s, r) => s + r.exposure, 0);
      const pct = share > 0 ? Math.round((top.exposure / share) * 100) : 0;
      return `${top.name} carries ${pct}% of current exposure.`;
    }
  }
  if (sort === "revenue") {
    const top = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
    if (top) {
      const share = rows.reduce((s, r) => s + r.revenue, 0);
      const pct = share > 0 ? Math.round((top.revenue / share) * 100) : 0;
      return `${top.name} drives ${pct}% of group revenue${
        top.contributionVsPlanPct < 0
          ? ` but underperforms contribution plan by ${Math.abs(top.contributionVsPlanPct)}%.`
          : "."
      }`;
    }
  }
  if (bad.length >= 2) {
    return `${bad.length} locations are dragging portfolio contribution. ${bad[0]!.name} and ${bad[1]!.name} are behind plan despite high exposure. Address capacity, menu mix and refund drivers.`;
  }
  if (bad.length === 1) {
    return `${bad[0]!.name} requires attention — ${bad[0]!.headline.toLowerCase()}. Primary driver: ${bad[0]!.primaryDriver}.`;
  }
  if(rows.length===1&&rows[0]!.contributionVsPlanPct<0)return `${rows[0]!.name} contribution is ${Math.abs(rows[0]!.contributionVsPlanPct)}% behind plan. Review ${rows[0]!.primaryDriver.toLowerCase()}.`;
  return "Portfolio contribution is healthy. Protect outperforming sites and promote transferable playbooks.";
}

export function buildLocationsOverview(
  role: RoleView = "cfo",
  vertical: DemoVerticalFamily = "restaurant",
  sort: LocationsSort = "contribution",
): LocationsOverviewModel {
  const scope = resolveRoleScope(role, vertical);
  const pulse = getBusinessPulse(role, vertical);
  const scoped = scopedDecisionsForDemo(listDecisionRecords(), role, vertical);
  const enriched = pulse.locations
    .filter((loc) => scope.allowedLocationIds.includes(loc.locationId))
    .map((loc) => {
      const here = scoped.filter((r) => r.locationId === loc.locationId);
      const needs = here.filter((r) => recordAttention(r) === "needs_you").length;
      return { ...loc, needsYouCount: Math.max(needs, loc.needsYouCount) };
    });

  const portfolio = getPortfolioEconomics(scope, enriched);
  const identityErrors = assertPortfolioIdentity(portfolio);

  const rows = sortRows(
    portfolio.locations.map((l) => buildRow(l, role, vertical)),
    sort,
  );

  const planRev = portfolio.locations.reduce((s, l) => s + l.revenuePlan, 0);
  const planContrib = portfolio.locations.reduce(
    (s, l) => s + l.contributionPlan,
    0,
  );
  const revenueVsPlanPct = pctDelta(portfolio.group.revenue, planRev);
  const contributionVsPlanPct = pctDelta(portfolio.group.contribution, planContrib);

  const attentionIds = new Set(
    vertical === "restaurant"
      ? needsAttentionOutliers().map((o) => o.locationId)
      : [],
  );
  const attention = rows.filter(
    (r) =>
      attentionIds.has(r.id) ||
      r.state === "needs_attention" ||
      r.state === "intervene",
  ).slice(0, 2);

  // Ensure Berlin + Frankfurt when restaurant demo has them
  if (vertical === "restaurant" && attention.length < 2) {
    for (const id of ["loc_berlin_mitte", "loc_frankfurt_westend"]) {
      const row = rows.find((r) => r.id === id);
      if (row && !attention.some((a) => a.id === id)) attention.push(row);
    }
  }

  const opportunities = [...rows]
    .filter((r) => r.upsideEuro > 0)
    .sort((a, b) => b.upsideEuro - a.upsideEuro)
    .slice(0, 3)
    .map((r, i) => ({
      rank: i + 1,
      locationId: r.id,
      name: r.name,
      label: r.opportunityLabel,
      euro: r.upsideEuro,
      href: r.diagnosisHref,
    }));

  const health = {
    onTrack: rows.filter((r) => r.state === "on_track").length,
    outperforming: rows.filter((r) => r.state === "outperforming").length,
    watch: rows.filter(
      (r) => r.state === "watch" || r.state === "data_degraded" || r.state === "intervene",
    ).length,
    needsAttention: rows.filter((r) => r.state === "needs_attention").length,
  };

  // Fold intervene into watch for donut if needs_attention already counted separately
  // Mockup: 5 on track, 1 outperforming, 1 watch, 1 needs attention
  const watchOnly = rows.filter((r) => r.state === "watch" || r.state === "data_degraded").length;
  const intervene = rows.filter((r) => r.state === "intervene").length;

  return {
    periodLabel: "MTD",
    portfolio,
    identityErrors,
    revenue: portfolio.group.revenue,
    revenueFormatted: formatDecisionMoney(portfolio.group.revenue),
    revenueVsPlanPct,
    contribution: portfolio.group.contribution,
    contributionFormatted: formatDecisionMoney(portfolio.group.contribution),
    contributionVsPlanPct,
    locationCount: portfolio.locationCount,
    needAttentionCount: Math.max(attention.length, health.needsAttention),
    avgContribution: Math.round(
      portfolio.group.contribution / Math.max(1, portfolio.locationCount),
    ),
    avgContributionFormatted: formatDecisionMoney(
      Math.round(
        portfolio.group.contribution / Math.max(1, portfolio.locationCount),
      ),
    ),
    avgContributionDeltaPct: 11,
    insight: buildInsight(rows, sort),
    rows,
    attention: attention.slice(0, 2),
    opportunities,
    health: {
      onTrack: health.onTrack,
      outperforming: health.outperforming,
      watch: watchOnly + intervene,
      needsAttention: health.needsAttention,
    },
  };
}

export function parseLocationsView(raw: string | null): LocationsView {
  if (
    raw === "performance" ||
    raw === "exposure" ||
    raw === "profitability" ||
    raw === "watchlist"
  ) {
    return raw;
  }
  return "overview";
}

export function parseLocationsSort(raw: string | null): LocationsSort {
  if (
    raw === "revenue" ||
    raw === "exposure" ||
    raw === "attention" ||
    raw === "margin" ||
    raw === "contribution"
  ) {
    return raw;
  }
  return "contribution";
}

export function parseLocationId(
  raw: string | null,
  rows: LocationRow[],
): string | null {
  if (!raw) return null;
  const slug = raw.toLowerCase();
  const hit = rows.find(
    (r) =>
      r.id === raw ||
      r.id.endsWith(slug) ||
      r.name.toLowerCase().replace(/\s+/g, "-") === slug ||
      r.id === `loc_${slug.replace(/-/g, "_")}`,
  );
  return hit?.id ?? null;
}

export function filterLocationRows(
  rows: LocationRow[],
  q: string,
  healthFilter: LocationUiState | "all" | null,
): LocationRow[] {
  const query = q.trim().toLowerCase();
  return rows.filter((r) => {
    const qOk =
      !query ||
      r.name.toLowerCase().includes(query) ||
      r.city.toLowerCase().includes(query) ||
      r.primaryDriver.toLowerCase().includes(query);
    if (!qOk) return false;
    if (!healthFilter || healthFilter === "all") return true;
    if (healthFilter === "watch") {
      return (
        r.state === "watch" ||
        r.state === "intervene" ||
        r.state === "data_degraded"
      );
    }
    return r.state === healthFilter;
  });
}
