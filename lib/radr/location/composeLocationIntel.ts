/**
 * composeLocationIntel — one operating profile per location.
 * Complexity underneath · clarity above.
 */

import { outlierFor, type DemoOutlierScenario } from "@/lib/radr/demo/demoOutliers";
import type { DemoLocationSeed } from "@/lib/radr/demo/organizations";
import {
  buildLocationDna,
  daypartMatrix,
  generateDailyHistory,
  slicePeriod,
  weekdayPatterns,
  type DayHistoryPoint,
  type DaypartRow,
  type HistoryPeriod,
  type LocationDna,
  type MonthHistoryPoint,
  type WeekdayPattern,
  aggregateMonths,
} from "@/lib/radr/location/historyEngine";
import { resolveLocation, type ResolvedLocation } from "@/lib/radr/location/resolve";
import { lessonsForLocation, type LocationLesson } from "@/lib/radr/product/locationMemory";
import {
  getPortfolioEconomics,
  type LocationEconomics,
} from "@/lib/radr/product/portfolioEconomics";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { resolveRoleScope } from "@/lib/radr/product/roleScopeService";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type LocationStatement = {
  line: string;
  sub: string;
};

export type LeakItem = {
  id: string;
  label: string;
  amount: number;
  tone: "neg" | "watch";
};

export type PeerPercentile = {
  metric: string;
  percentile: number;
  why: string;
};

export type MenuItemIntel = {
  name: string;
  unitsDeltaPct: number;
  contribDeltaPct: number;
  action: "PUSH" | "HOLD" | "REWORK";
  note: string;
};

export type ProcurementIntel = {
  sku: string;
  change90dPct: number;
  vendorPrice: number;
  contractPrice: number;
  annualizedExposure: number;
  fillRatePct: number;
  note: string;
} | null;

export type DecisionHistorySummary = {
  formed90d: number;
  actedOn: number;
  verified: number;
  noAction: number;
  overrides: number;
  verifiedEuro: number;
};

export type LocationIntel = {
  resolved: ResolvedLocation;
  statement: LocationStatement;
  outlier: DemoOutlierScenario | null;
  economics: LocationEconomics;
  period: HistoryPeriod;
  daily: DayHistoryPoint[];
  periodDaily: DayHistoryPoint[];
  months: MonthHistoryPoint[];
  dna: LocationDna;
  dayparts: DaypartRow[];
  weekdays: WeekdayPattern[];
  leaks: LeakItem[];
  peers: PeerPercentile[];
  menu: MenuItemIntel[];
  procurement: ProcurementIntel;
  decisionHistory: DecisionHistorySummary;
  lessons: LocationLesson[];
  important: string[];
  transfers: {
    fromLabel: string;
    pattern: string;
    expectedMonthlyEuro: number;
    verdict: string;
    href: string;
  }[];
  open: boolean; // service open for Live
};

function statementFor(
  seed: DemoLocationSeed,
  out: DemoOutlierScenario | null,
  econ: LocationEconomics,
): LocationStatement {
  if (out) {
    if (seed.id === "loc_berlin_mitte") {
      return {
        line: "Revenue is ahead. Contribution isn't.",
        sub: out.soWhat,
      };
    }
    if (seed.id === "loc_berlin_kreuzberg") {
      return {
        line: "Sales are normal. Refunds are not.",
        sub: out.soWhat,
      };
    }
    if (seed.id === "loc_hamburg_hafen") {
      return {
        line: "Best contribution month this year.",
        sub: "Wine attachment explains ~42% of the upside.",
      };
    }
    if (seed.id === "loc_frankfurt_westend") {
      return {
        line: "Demand is healthy. Input costs are eroding margin.",
        sub: out.soWhat,
      };
    }
    if (out.polarity === "positive") {
      return {
        line: out.headline,
        sub: out.soWhat,
      };
    }
    if (out.polarity === "healthy") {
      return {
        line: "Within expectations.",
        sub: out.soWhat,
      };
    }
    return { line: out.headline, sub: out.soWhat };
  }
  const cd = econ.contribution - econ.contributionPlan;
  if (Math.abs(cd) < 400) {
    return {
      line: "Within expectations.",
      sub: "RADR is watching · no material intervention required.",
    };
  }
  if (cd < 0) {
    return {
      line: "Contribution is behind plan.",
      sub: econ.important[0]?.summary ?? "Drivers forming.",
    };
  }
  return {
    line: "Contribution ahead of plan.",
    sub: "Positive operating pattern · candidate to learn from.",
  };
}

function buildLeaks(econ: LocationEconomics, out: DemoOutlierScenario | null): LeakItem[] {
  const items: LeakItem[] = [];
  if (econ.delivery && econ.delivery.platformFees > 500) {
    items.push({
      id: "fees",
      label: "Delivery / channel fees",
      amount: econ.delivery.platformFees,
      tone: "neg",
    });
  }
  if (econ.refundsComps > 400) {
    items.push({
      id: "refunds",
      label: "Refunds / comps",
      amount: econ.refundsComps,
      tone: "neg",
    });
  }
  if (out?.archetype === "procurement_shock") {
    items.push({
      id: "supplier",
      label: "Supplier variance",
      amount: 830,
      tone: "watch",
    });
  }
  return items.slice(0, 3);
}

function buildPeers(seed: DemoLocationSeed, out: DemoOutlierScenario | null): PeerPercentile[] {
  const h = seed.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const base = (n: number) => 20 + ((h * n) % 60);
  return [
    {
      metric: "Revenue vs expectation",
      percentile: out ? Math.round(50 + out.revenueVsPlanPct * 4) : base(3),
      why: "Vs similar format · price · delivery intensity cohort",
    },
    {
      metric: "Contribution margin",
      percentile: out
        ? Math.max(8, Math.min(92, Math.round(50 + out.contributionVsPlanPct * 5)))
        : base(5),
      why: out?.archetype === "delivery_refund"
        ? "Refund pressure pulls margin percentile down"
        : "Peer-adjusted contribution",
    },
    {
      metric: "Labor productivity",
      percentile: seed.archetype === "labor_heavy" ? 34 : base(7),
      why: "Sales per labor hour vs cohort",
    },
    {
      metric: "Delivery economics",
      percentile:
        out?.archetype === "high_volume_delivery_peak" ||
        out?.archetype === "delivery_refund"
          ? 24
          : out?.archetype === "premium_attach"
            ? 78
            : base(11),
      why: "Net contribution after fees + refunds",
    },
  ];
}

function buildMenu(seed: DemoLocationSeed): MenuItemIntel[] {
  if (seed.vertical === "hotel") {
    return [
      {
        name: "Canal View suite",
        unitsDeltaPct: 6,
        contribDeltaPct: 11,
        action: "PUSH",
        note: "Direct propensity high on event weeks",
      },
      {
        name: "Standard twin",
        unitsDeltaPct: 2,
        contribDeltaPct: -3,
        action: "HOLD",
        note: "OTA mix diluting net",
      },
    ];
  }
  if (seed.id === "loc_frankfurt_westend") {
    return [
      {
        name: "Tuna Tataki",
        unitsDeltaPct: 11,
        contribDeltaPct: 4,
        action: "REWORK",
        note: "Capacity cost deteriorating · vendor +19%",
      },
      {
        name: "Truffle Pasta",
        unitsDeltaPct: 6,
        contribDeltaPct: 13,
        action: "PUSH",
        note: "Best peak economics",
      },
    ];
  }
  if (seed.id === "loc_hamburg_hafen") {
    return [
      {
        name: "House White · glass",
        unitsDeltaPct: 18,
        contribDeltaPct: 22,
        action: "PUSH",
        note: "Attach +9.4pp · no service penalty",
      },
      {
        name: "Catch of day",
        unitsDeltaPct: 4,
        contribDeltaPct: 7,
        action: "HOLD",
        note: "Stable contributor",
      },
    ];
  }
  return [
    {
      name: "Truffle Pasta",
      unitsDeltaPct: 6,
      contribDeltaPct: 13,
      action: "PUSH",
      note: "Best peak economics",
    },
    {
      name: "Tuna Tataki",
      unitsDeltaPct: 11,
      contribDeltaPct: 4,
      action: "HOLD",
      note: "Volume up · watch cover cost",
    },
    {
      name: "Lunch set",
      unitsDeltaPct: -2,
      contribDeltaPct: -1,
      action: "REWORK",
      note: "Discount mix softens spend",
    },
  ];
}

function buildProcurement(seed: DemoLocationSeed): ProcurementIntel {
  if (seed.archetype === "procurement_shock" || seed.id === "loc_frankfurt_westend") {
    return {
      sku: "Bluefin tuna",
      change90dPct: 19,
      vendorPrice: 14.8,
      contractPrice: 13.9,
      annualizedExposure: 8400,
      fillRatePct: 91,
      note: "Invoice above contract · 6-week contribution exposure",
    };
  }
  if (seed.id === "loc_berlin_mitte") {
    return {
      sku: "Bluefin tuna",
      change90dPct: 9.6,
      vendorPrice: 14.2,
      contractPrice: 13.9,
      annualizedExposure: 3200,
      fillRatePct: 94,
      note: "Watch · stockout risk formed on 4 of last 8 Fridays",
    };
  }
  return null;
}

function fallbackEconomics(
  seed: DemoLocationSeed,
  vertical: DemoVerticalFamily,
): LocationEconomics {
  const scope = resolveRoleScope("coo", vertical);
  // Force-include this location even if persona would exclude it
  const pulse = getBusinessPulse("coo", vertical);
  const all = getPortfolioEconomics(
    { ...scope, allowedLocationIds: [seed.id] },
    pulse.locations,
  );
  const hit = all.locations.find((l) => l.locationId === seed.id);
  if (hit) return hit;
  // Absolute fallback — should not hit if pulse base covers org
  const out = outlierFor(seed.id);
  const revPlan = 40000;
  const rev = Math.round(revPlan * (1 + (out?.revenueVsPlanPct ?? 0) / 100));
  const cPlan = Math.round(revPlan * 0.28);
  const c = Math.round(cPlan * (1 + (out?.contributionVsPlanPct ?? 0) / 100));
  return {
    locationId: seed.id,
    label: seed.displayName,
    city: seed.city,
    vertical: vertical === "hotel" ? "hotel" : "restaurant",
    revenue: rev,
    revenuePlan: revPlan,
    revenueForecast: Math.round(revPlan * 1.02),
    contribution: c,
    contributionPlan: cPlan,
    deliverySharePct: 22,
    refundsComps: Math.round(rev * 0.015),
    laborPct: 28,
    foodCostPct: 27,
    covers: Math.round(rev / 75),
    avgSpend: 75,
    exposure: 0,
    needsYou: 0,
    verified: 0,
    dataHealth: "ok",
    channelMix: {
      dineInPct: 68,
      deliveryPct: 22,
      takeawayPct: 7,
      otherPct: 3,
    },
    delivery: {
      gross: Math.round(rev * 0.22),
      platformFees: Math.round(rev * 0.05),
      discounts: Math.round(rev * 0.01),
      refunds: Math.round(rev * 0.008),
      net: Math.round(rev * 0.15),
      contribution: Math.round(rev * 0.03),
      sharePct: 22,
    },
    refunds: {
      refundEuro: Math.round(rev * 0.015),
      refundPct: 1.5,
      vsPriorPct: 4,
      primaryReason: "QUALITY",
      primarySharePct: 40,
      channel: "Dine-in",
      daypart: "Dinner",
      summary: "Within band",
    },
    bridge: {
      revenue: rev,
      discounts: -Math.round(rev * 0.018),
      refundsComps: -Math.round(rev * 0.015),
      channelFees: -Math.round(rev * 0.05),
      labor: -Math.round(rev * 0.28),
      cogs: -Math.round(rev * 0.27),
      otherOperating: -(
        rev -
        Math.round(rev * 0.018) -
        Math.round(rev * 0.015) -
        Math.round(rev * 0.05) -
        Math.round(rev * 0.28) -
        Math.round(rev * 0.27) -
        c
      ),
      contribution: c,
    },
    revenueDrivers: out?.drivers.map((d, i) => ({
      id: `d${i}`,
      label: d.label,
      amount: d.amount,
    })) ?? [],
    important: [],
  };
}

export function composeLocationIntel(
  rawId: string,
  opts?: {
    role?: RoleView;
    period?: HistoryPeriod;
  },
): LocationIntel | null {
  const resolved = resolveLocation(rawId);
  if (!resolved) return null;

  const period = opts?.period ?? "mtd";
  const role = opts?.role ?? "coo";
  const out = outlierFor(resolved.id) ?? null;

  let economics: LocationEconomics;
  try {
    const scope = resolveRoleScope(role, resolved.vertical);
    const pulse = getBusinessPulse(role, resolved.vertical);
    // Detail page always loads THIS location even if role scope is elsewhere
    const pulseLoc = pulse.locations.find((l) => l.locationId === resolved.id);
    const widened = {
      ...scope,
      allowedLocationIds: [resolved.id],
    };
    const portfolio = getPortfolioEconomics(
      widened,
      pulseLoc ? [pulseLoc] : pulse.locations,
    );
    economics =
      portfolio.locations.find((l) => l.locationId === resolved.id) ??
      fallbackEconomics(resolved.seed, resolved.vertical);
  } catch {
    economics = fallbackEconomics(resolved.seed, resolved.vertical);
  }

  const daily = generateDailyHistory(resolved.seed, 730);
  const periodDaily = slicePeriod(daily, period);
  const months = aggregateMonths(daily);
  const dna = buildLocationDna(resolved.seed, daily);
  const fullPortfolio = getPortfolioEconomics(
    resolveRoleScope("coo", resolved.vertical),
    getBusinessPulse("coo", resolved.vertical).locations,
  );

  const transfers = fullPortfolio.transfers
    .filter(
      (t) =>
        t.sourceLocationId !== t.targetLocationId &&
        t.targetLocationId === resolved.id,
    )
    .map((t) => ({
      fromLabel:
        fullPortfolio.locations.find((l) => l.locationId === t.sourceLocationId)
          ?.label ?? locationDisplayName(t.sourceLocationId),
      pattern: t.pattern,
      expectedMonthlyEuro: t.expectedMonthlyEuro,
      verdict: t.verdict,
      href: t.compareHref,
    }));

  return {
    resolved,
    statement: statementFor(resolved.seed, out, economics),
    outlier: out,
    economics,
    period,
    daily,
    periodDaily,
    months,
    dna,
    dayparts: daypartMatrix(resolved.seed),
    weekdays: weekdayPatterns(resolved.seed),
    leaks: buildLeaks(economics, out),
    peers: buildPeers(resolved.seed, out),
    menu: buildMenu(resolved.seed),
    procurement: buildProcurement(resolved.seed),
    decisionHistory: {
      formed90d: 8 + (resolved.id.length % 9),
      actedOn: 6 + (resolved.id.length % 5),
      verified: 4 + (resolved.id.length % 4),
      noAction: 2,
      overrides: 1,
      verifiedEuro: economics.verified || 890 + (resolved.id.length % 20) * 100,
    },
    lessons: lessonsForLocation(resolved.id),
    important: (out?.materialEvents ?? economics.important.map((e) => e.summary)).slice(0, 4),
    transfers,
    open: resolved.vertical === "restaurant", // demo Friday service open
  };
}
