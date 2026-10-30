/**
 * Portfolio economics — Locations page SSOT.
 * Group rollups = Σ location metrics for the same scope/period.
 * Deterministic demo fixtures; architecture ready for live evidence.
 */

import {
  type DemoLocationSeed,
  type DemoOrganization,
} from "@/lib/radr/demo/organizations";
import { orgForVertical } from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { COST_MOVER_SKUS } from "@/lib/radr/procurement/costMovers";
import {
  locationPulseBaseForVertical,
  type PilotLocationPulse,
} from "@/lib/radr/product/demoOperatingPulse";
import type { RoleScope } from "@/lib/radr/product/roleScopeService";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { buildCompareHref } from "@/lib/radr/comparisonService";

export type ChannelMix = {
  dineInPct: number;
  deliveryPct: number;
  takeawayPct: number;
  otherPct: number;
};

export type HotelChannelMix = {
  directPct: number;
  otaPct: number;
  corporatePct: number;
  groupPct: number;
  otherPct: number;
};

export type DeliveryEconomics = {
  gross: number;
  platformFees: number;
  discounts: number;
  refunds: number;
  net: number;
  contribution: number;
  sharePct: number;
};

export type RefundIntel = {
  refundEuro: number;
  refundPct: number;
  vsPriorPct: number;
  primaryReason: string;
  primarySharePct: number;
  channel: string;
  daypart: string;
  summary: string;
};

export type MoneyBridge = {
  revenue: number;
  discounts: number;
  refundsComps: number;
  channelFees: number;
  labor: number;
  cogs: number;
  /** Residual so gross − displayed deductions === contribution */
  otherOperating: number;
  contribution: number;
};

export type RevenueDriver = {
  id: string;
  label: string;
  amount: number;
};

export type MaterialEvent = {
  id: string;
  organizationId: string;
  locationId: string;
  occurredAt: string;
  type: string;
  summary: string;
  economicImpact: number;
  evidence: string[];
  relatedDecisionId: string | null;
};

export type TransferVerdict = "TRANSFERABLE" | "CONTEXT_DEPENDENT" | "NOT_COMPARABLE";

export type LocationPeerProfile = {
  locationId: string;
  format: string;
  seats: number;
  priceLevel: "value" | "mid" | "premium";
  deliveryIntensity: "low" | "mid" | "high";
  dayparts: string[];
  market: string;
};

export type OperatingTransfer = {
  id: string;
  sourceLocationId: string;
  targetLocationId: string;
  pattern: string;
  context: string;
  observedEffect: string;
  expectedMonthlyEuro: number;
  confidence: number;
  verdict: TransferVerdict;
  compareHref: string;
};

export type SharedCostPressure = {
  skuId: string;
  name: string;
  changeLabel: string;
  locationsExposed: number;
  locationsTotal: number;
  annualizedEuro: number;
  vendorNote?: string;
  href: string;
};

export type LocationEconomics = {
  locationId: string;
  label: string;
  city: string;
  vertical: DemoVerticalFamily;
  revenue: number;
  revenuePlan: number;
  revenueForecast: number;
  contribution: number;
  contributionPlan: number;
  deliverySharePct: number;
  refundsComps: number;
  laborPct: number;
  foodCostPct: number;
  covers: number;
  avgSpend: number;
  exposure: number;
  needsYou: number;
  verified: number;
  dataHealth: "ok" | "warn" | "bad";
  channelMix: ChannelMix | HotelChannelMix;
  delivery: DeliveryEconomics | null;
  refunds: RefundIntel;
  bridge: MoneyBridge;
  revenueDrivers: RevenueDriver[];
  important: MaterialEvent[];
  /** Hotel-only */
  occupancyPct?: number;
  adr?: number;
  revpar?: number;
  directSharePct?: number;
  channelFees?: number;
  cancellations?: number;
  readinessMisses?: number;
};

export type PortfolioEconomics = {
  organizationId: string;
  vertical: DemoVerticalFamily;
  period: "mtd";
  locationCount: number;
  group: {
    revenue: number;
    contribution: number;
    deliverySharePct: number;
    refundsComps: number;
    verified: number;
    needsJudgment: number;
    exposure: number;
    /** Hotel */
    occupancyPct?: number;
    adr?: number;
    revpar?: number;
  };
  locations: LocationEconomics[];
  transfers: OperatingTransfer[];
  sharedCost: SharedCostPressure[];
  peers: LocationPeerProfile[];
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function restaurantMix(i: number, archetype: string): ChannelMix {
  if (archetype === "delivery_heavy") {
    return { dineInPct: 48, deliveryPct: 38, takeawayPct: 10, otherPct: 4 };
  }
  if (archetype === "terrace_heavy") {
    return { dineInPct: 72, deliveryPct: 14, takeawayPct: 9, otherPct: 5 };
  }
  const d = 18 + (i % 5) * 3;
  return {
    dineInPct: 100 - d - 6 - 3,
    deliveryPct: d,
    takeawayPct: 6,
    otherPct: 3,
  };
}

function hotelMix(i: number, archetype: string): HotelChannelMix {
  if (archetype === "high_ota") {
    return { directPct: 28, otaPct: 52, corporatePct: 12, groupPct: 5, otherPct: 3 };
  }
  return {
    directPct: 42 + (i % 4) * 2,
    otaPct: 32 - (i % 3),
    corporatePct: 14,
    groupPct: 8,
    otherPct: 4,
  };
}

function peerFor(seed: DemoLocationSeed, i: number): LocationPeerProfile {
  return {
    locationId: seed.id,
    format: seed.archetype,
    seats: seed.vertical === "hotel" ? 40 + (i % 5) * 12 : 48 + (i % 6) * 8,
    priceLevel:
      seed.archetype.includes("premium") || seed.archetype === "boutique_city"
        ? "premium"
        : seed.archetype.includes("value") || seed.archetype === "lower_performing"
          ? "value"
          : "mid",
    deliveryIntensity:
      seed.archetype === "delivery_heavy"
        ? "high"
        : seed.archetype === "terrace_heavy"
          ? "low"
          : "mid",
    dayparts: seed.vertical === "hotel" ? ["arrivals", "stay", "departures"] : ["lunch", "dinner"],
    market: seed.city,
  };
}

function buildRestaurantEconomics(
  org: DemoOrganization,
  pulse: PilotLocationPulse,
  seed: DemoLocationSeed,
  i: number,
): LocationEconomics {
  const h = hash(seed.id);
  const mix = restaurantMix(i, seed.archetype);
  const deliveryGross = Math.round(pulse.revenueActual * (mix.deliveryPct / 100));
  const platformFees = Math.round(deliveryGross * (0.22 + (h % 5) * 0.01));
  const deliveryDiscounts = Math.round(deliveryGross * 0.04);
  const deliveryRefunds = Math.round(deliveryGross * (0.025 + (h % 4) * 0.005));
  const deliveryNet = deliveryGross - platformFees - deliveryDiscounts - deliveryRefunds;
  const deliveryContrib = Math.round(deliveryNet * 0.18);

  const refundsComps = Math.round(
    pulse.revenueActual *
      (seed.id === "loc_berlin_kreuzberg"
        ? 0.028
        : seed.id === "loc_berlin_mitte"
          ? 0.018
          : 0.012 + (h % 6) * 0.002),
  );
  const refundVsPrior =
    seed.id === "loc_berlin_kreuzberg"
      ? 38
      : seed.id === "loc_berlin_mitte"
        ? 12
        : 4 + (h % 12);
  const lateShare = seed.id === "loc_berlin_kreuzberg" ? 61 : 28 + (h % 20);

  const discounts = Math.round(pulse.revenueActual * 0.018);
  const channelFees = platformFees + Math.round(pulse.revenueActual * 0.008);
  const labor = Math.round(pulse.revenueActual * (0.28 + (h % 5) * 0.008));
  const cogs = Math.round(pulse.revenueActual * (0.26 + (h % 4) * 0.01));
  // Bridge identity: revenue − |deductions| === contribution
  const bridgeContrib = pulse.contributionActual;
  const otherAbs = Math.max(
    0,
    pulse.revenueActual -
      discounts -
      refundsComps -
      channelFees -
      labor -
      cogs -
      bridgeContrib,
  );

  const important: MaterialEvent[] = [];
  const revDelta = pulse.revenueActual - pulse.revenuePlan;
  if (Math.abs(revDelta) > 800) {
    important.push({
      id: `ev_${seed.id}_rev`,
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-18",
      type: "revenue_delta",
      summary: `Revenue ${revDelta >= 0 ? "+" : "−"}${Math.abs(Math.round((revDelta / pulse.revenuePlan) * 1000) / 10)}% vs plan`,
      economicImpact: revDelta,
      evidence: ["pos.net_sales_mtd"],
      relatedDecisionId: null,
    });
  }
  if (mix.deliveryPct >= 22) {
    important.push({
      id: `ev_${seed.id}_del`,
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-20",
      type: "channel_mix",
      summary: `Delivery share ${mix.deliveryPct}%${seed.id === "loc_berlin_mitte" ? " · +6.1pp vs prior" : ""}`,
      economicImpact: deliveryContrib,
      evidence: ["channel.delivery_share"],
      relatedDecisionId: null,
    });
  }
  if (seed.id === "loc_berlin_mitte") {
    important.push({
      id: "ev_berlin_peak",
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-20",
      type: "verified_value",
      summary: "Peak Decision protected €590",
      economicImpact: 590,
      evidence: ["decision.peak_berlin"],
      relatedDecisionId: "dec_peak_berlin",
    });
    important.push({
      id: "ev_berlin_credit",
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-22",
      type: "verified_value",
      summary: "€273 supplier credit verified",
      economicImpact: 273,
      evidence: ["ap.credit_memo"],
      relatedDecisionId: "dec_supplier_berlin",
    });
  } else if (seed.id === "loc_berlin_kreuzberg") {
    important.push({
      id: "ev_kreuz_refund",
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-19",
      type: "refund_outlier",
      summary: "Refunds +38% · 61% delivery lateness Fri 19:00–21:00",
      economicImpact: -1100,
      evidence: ["pos.refunds", "delivery.lateness"],
      relatedDecisionId: null,
    });
  } else if (seed.id === "loc_frankfurt_westend") {
    important.push({
      id: "ev_ffm_tuna",
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-18",
      type: "inventory_risk",
      summary: "Tuna +19% / 90D · €8.4k annualized exposure",
      economicImpact: -1840,
      evidence: ["ap.vendor_price", "contract.tuna"],
      relatedDecisionId: "dec_tuna_berlin",
    });
  } else if (seed.id === "loc_hamburg_hafen") {
    important.push({
      id: "ev_hh_wine",
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-21",
      type: "attach_rate",
      summary: "Wine attach +9.4pp · contribution +8.1%",
      economicImpact: 2100,
      evidence: ["pos.wine_attach"],
      relatedDecisionId: null,
    });
  } else if (pulse.verifiedValue > 0) {
    important.push({
      id: `ev_${seed.id}_vv`,
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-21",
      type: "verified_value",
      summary: `Verified value booked`,
      economicImpact: pulse.verifiedValue,
      evidence: ["ledger.verified"],
      relatedDecisionId: null,
    });
  }

  const covers = Math.round(pulse.revenueActual / (72 + (h % 20)));
  const avgSpend = Math.round((pulse.revenueActual / covers) * 100) / 100;

  return {
    locationId: seed.id,
    label: seed.displayName,
    city: seed.city,
    vertical: "restaurant",
    revenue: pulse.revenueActual,
    revenuePlan: pulse.revenuePlan,
    revenueForecast: Math.round(pulse.revenuePlan * 1.02),
    contribution: pulse.contributionActual,
    contributionPlan: pulse.contributionPlan,
    deliverySharePct: mix.deliveryPct,
    refundsComps,
    laborPct: Math.round((labor / pulse.revenueActual) * 1000) / 10,
    foodCostPct: Math.round((cogs / pulse.revenueActual) * 1000) / 10,
    covers,
    avgSpend,
    exposure: pulse.activeExposure,
    needsYou: pulse.needsYouCount,
    verified: pulse.verifiedValue,
    dataHealth: pulse.dataHealth,
    channelMix: mix,
    delivery: {
      gross: deliveryGross,
      platformFees,
      discounts: deliveryDiscounts,
      refunds: deliveryRefunds,
      net: deliveryNet,
      contribution: deliveryContrib,
      sharePct: mix.deliveryPct,
    },
    refunds: {
      refundEuro: refundsComps,
      refundPct: Math.round((refundsComps / pulse.revenueActual) * 1000) / 10,
      vsPriorPct: refundVsPrior,
      primaryReason:
        seed.id === "loc_berlin_kreuzberg"
          ? "DELIVERY LATE"
          : h % 2 === 0
            ? "MISSING ITEM"
            : "QUALITY",
      primarySharePct: lateShare,
      channel: mix.deliveryPct >= 22 ? "Delivery" : "Dine-in",
      daypart: "Friday 19:00–21:00",
      summary:
        seed.id === "loc_berlin_kreuzberg"
          ? `Refunds +${refundVsPrior}%. ${lateShare}% associated with delivery lateness. Main window: Friday 19:00–21:00.`
          : `Refund rate ${Math.round((refundsComps / pulse.revenueActual) * 1000) / 10}% · primary ${h % 2 === 0 ? "missing item" : "quality"}.`,
    },
    bridge: {
      revenue: pulse.revenueActual,
      discounts: -discounts,
      refundsComps: -refundsComps,
      channelFees: -channelFees,
      labor: -labor,
      cogs: -cogs,
      otherOperating: -otherAbs,
      contribution: bridgeContrib,
    },
    revenueDrivers: [
      { id: "covers", label: "Covers", amount: Math.round(revDelta * 0.5) },
      { id: "avg_spend", label: "Avg spend", amount: Math.round(revDelta * 0.35) },
      { id: "delivery", label: "Delivery", amount: Math.round(revDelta * 0.25) },
      { id: "refunds", label: "Refunds", amount: -Math.round(refundsComps * 0.4) },
      { id: "discounts", label: "Discounts", amount: -Math.round(discounts * 0.5) },
    ],
    important: important.slice(0, 4),
  };
}

function buildHotelEconomics(
  org: DemoOrganization,
  pulse: PilotLocationPulse,
  seed: DemoLocationSeed,
  i: number,
): LocationEconomics {
  const h = hash(seed.id);
  const mix = hotelMix(i, seed.archetype);
  const channelFees = Math.round(pulse.revenueActual * ((mix.otaPct / 100) * 0.18));
  const refundsComps = Math.round(pulse.revenueActual * 0.015);
  const labor = Math.round(pulse.revenueActual * 0.22);
  const cogs = Math.round(pulse.revenueActual * 0.12);
  const discounts = Math.round(pulse.revenueActual * 0.01);
  const hotelOtherAbs = Math.max(
    0,
    pulse.revenueActual -
      discounts -
      refundsComps -
      channelFees -
      labor -
      cogs -
      pulse.contributionActual,
  );
  const occ = clamp(78 + (h % 14) - 4, 62, 94);
  const adr = Math.round(148 + (h % 40));
  const revpar = Math.round(adr * (occ / 100));

  const important: MaterialEvent[] = [];
  if (seed.id === "loc_canal_house") {
    important.push(
      {
        id: "ev_canal_design",
        organizationId: org.id,
        locationId: seed.id,
        occurredAt: "2026-09-18",
        type: "demand",
        summary: "Design Week pickup +11%",
        economicImpact: 4200,
        evidence: ["pms.pickup"],
        relatedDecisionId: null,
      },
      {
        id: "ev_canal_hk",
        organizationId: org.id,
        locationId: seed.id,
        occurredAt: "2026-09-24",
        type: "readiness",
        summary: "7 rooms missed readiness threshold",
        economicImpact: -2100,
        evidence: ["hk.readiness"],
        relatedDecisionId: "dec_hotel_readiness",
      },
      {
        id: "ev_canal_direct",
        organizationId: org.id,
        locationId: seed.id,
        occurredAt: "2026-09-22",
        type: "distribution",
        summary: "Premium inventory held direct",
        economicImpact: 2960,
        evidence: ["rms.direct_hold"],
        relatedDecisionId: null,
      },
      {
        id: "ev_canal_vv",
        organizationId: org.id,
        locationId: seed.id,
        occurredAt: "2026-09-23",
        type: "verified_value",
        summary: "€2,960 protected value verified",
        economicImpact: 2960,
        evidence: ["ledger.verified"],
        relatedDecisionId: null,
      },
    );
  } else {
    important.push({
      id: `ev_${seed.id}_pace`,
      organizationId: org.id,
      locationId: seed.id,
      occurredAt: "2026-09-20",
      type: "pace",
      summary: `Occupancy ${occ}% · ADR €${adr}`,
      economicImpact: pulse.contributionActual - pulse.contributionPlan,
      evidence: ["pms.occ_adr"],
      relatedDecisionId: null,
    });
  }

  return {
    locationId: seed.id,
    label: seed.displayName,
    city: seed.city,
    vertical: "hotel",
    revenue: pulse.revenueActual,
    revenuePlan: pulse.revenuePlan,
    revenueForecast: Math.round(pulse.revenuePlan * 1.015),
    contribution: pulse.contributionActual,
    contributionPlan: pulse.contributionPlan,
    deliverySharePct: 0,
    refundsComps,
    laborPct: Math.round((labor / pulse.revenueActual) * 1000) / 10,
    foodCostPct: 0,
    covers: 0,
    avgSpend: 0,
    exposure: pulse.activeExposure,
    needsYou: pulse.needsYouCount,
    verified: pulse.verifiedValue,
    dataHealth: pulse.dataHealth,
    channelMix: mix,
    delivery: null,
    refunds: {
      refundEuro: refundsComps,
      refundPct: Math.round((refundsComps / pulse.revenueActual) * 1000) / 10,
      vsPriorPct: 6 + (h % 8),
      primaryReason: "CANCELLATION",
      primarySharePct: 44,
      channel: "OTA",
      daypart: "Arrivals window",
      summary: `Cancellations €${refundsComps.toLocaleString("en-EU")} · ${44}% OTA-led.`,
    },
    bridge: {
      revenue: pulse.revenueActual,
      discounts: -discounts,
      refundsComps: -refundsComps,
      channelFees: -channelFees,
      labor: -labor,
      cogs: -cogs,
      otherOperating: -hotelOtherAbs,
      contribution: pulse.contributionActual,
    },
    revenueDrivers: [
      { id: "occ", label: "Occupancy", amount: Math.round((pulse.revenueActual - pulse.revenuePlan) * 0.55) },
      { id: "adr", label: "ADR", amount: Math.round((pulse.revenueActual - pulse.revenuePlan) * 0.35) },
      { id: "fees", label: "Channel fees", amount: -Math.round(channelFees * 0.15) },
    ],
    important: important.slice(0, 4),
    occupancyPct: occ,
    adr,
    revpar,
    directSharePct: mix.directPct,
    channelFees,
    cancellations: Math.round(4 + (h % 6)),
    readinessMisses: seed.id === "loc_canal_house" ? 7 : h % 3,
  };
}

function buildTransfers(
  org: DemoOrganization,
  vertical: DemoVerticalFamily,
): OperatingTransfer[] {
  if (vertical === "hotel") {
    return [
      {
        id: "xfer_canal_direct",
        sourceLocationId: "loc_canal_house",
        targetLocationId: "loc_ams_harbour",
        pattern: "Direct-hold premium inventory on comparable pickup windows",
        context: "Similar Design Week–style demand · boutique city format",
        observedEffect: "Protected contribution across 8 comparable windows",
        expectedMonthlyEuro: 1840,
        confidence: 0.72,
        verdict: "TRANSFERABLE" as const,
      compareHref: buildCompareHref(
        ["loc_canal_house", "loc_ams_harbour"],
        { transferId: "xfer_canal_direct" },
      ),
    },
    {
      id: "xfer_hk_reprio",
      sourceLocationId: "loc_canal_house",
      targetLocationId: "loc_schiphol_gate",
      pattern: "Housekeeping reprioritization before arrival wave",
      context: "Comparable arrival bunching · readiness misses",
      observedEffect: "Readiness miss rate improved after reassignment",
      expectedMonthlyEuro: 960,
      confidence: 0.64,
      verdict: "CONTEXT_DEPENDENT" as const,
      compareHref: buildCompareHref(
        ["loc_canal_house", "loc_schiphol_gate"],
        { transferId: "xfer_hk_reprio" },
      ),
    },
    ].filter(
      (t) =>
        org.locations.some((l) => l.id === t.sourceLocationId) &&
        org.locations.some((l) => l.id === t.targetLocationId),
    );
  }
  return [
    {
      id: "xfer_wine_hamburg",
      sourceLocationId: "loc_hamburg_hafen",
      targetLocationId: "loc_berlin_mitte",
      pattern: "Wine attach rate playbook",
      context: "Similar dinner mix · similar price point · Berlin has capacity",
      observedEffect: "+9.4pp attach at Hamburg without service penalty",
      expectedMonthlyEuro: 1240,
      confidence: 0.78,
      verdict: "TRANSFERABLE" as const,
      compareHref: buildCompareHref(
        ["loc_hamburg_hafen", "loc_berlin_mitte"],
        { transferId: "xfer_wine_hamburg" },
      ),
    },
    {
      id: "xfer_delivery_throttle",
      sourceLocationId: "loc_hamburg_hafen",
      targetLocationId: "loc_berlin_kreuzberg",
      pattern: "Throttle delivery 19:30–20:30 under kitchen pressure",
      context: "Similar Friday pressure profile detected in Kreuzberg",
      observedEffect: "Refund rate −0.6pp after throttle on comparable Fridays",
      expectedMonthlyEuro: 890,
      confidence: 0.71,
      verdict: "TRANSFERABLE" as const,
      compareHref: buildCompareHref(
        ["loc_hamburg_hafen", "loc_berlin_kreuzberg"],
        { transferId: "xfer_delivery_throttle" },
      ),
    },
    {
      id: "xfer_frankfurt_menu",
      sourceLocationId: "loc_dusseldorf_medienhafen",
      targetLocationId: "loc_frankfurt_westend",
      pattern: "Premium casual lunch mix",
      context: "Different guest mix · Frankfurt under procurement shock",
      observedEffect: "Not enough shared cost structure for blind copy",
      expectedMonthlyEuro: 0,
      confidence: 0.35,
      verdict: "NOT_COMPARABLE" as const,
      compareHref: buildCompareHref(
        ["loc_dusseldorf_medienhafen", "loc_frankfurt_westend"],
        { transferId: "xfer_frankfurt_menu" },
      ),
    },
  ].filter(
    (t) =>
      org.locations.some((l) => l.id === t.sourceLocationId) &&
      org.locations.some((l) => l.id === t.targetLocationId),
  );
}

function sharedCostFor(vertical: DemoVerticalFamily, n: number): SharedCostPressure[] {
  if (vertical === "hotel") return [];
  return COST_MOVER_SKUS.slice(0, 3).map((sku, i) => ({
    skuId: sku.skuId,
    name: sku.name.split("·")[0]!.trim(),
    changeLabel:
      sku.skuId === "sku_tuna_bluefin"
        ? "+19% · 90D"
        : sku.skuId === "sku_olive_oil"
          ? "+27% · YoY"
          : `+${sku.changePct30d}% · 30D`,
    locationsExposed: i === 0 ? Math.min(6, n) : n,
    locationsTotal: n,
    annualizedEuro:
      sku.skuId === "sku_tuna_bluefin"
        ? 8400
        : sku.skuId === "sku_olive_oil"
          ? 3200
          : Math.round(sku.exposureEuro * 4.2),
    vendorNote: i === 2 ? "Vendor A · +14% price drift · 3 disputes" : undefined,
    href: "/app/intelligence?module=cost_movers",
  }));
}

/**
 * Build portfolio economics for the active role scope.
 * Group totals = exact sum of included location metrics.
 */
export function getPortfolioEconomics(
  scope: RoleScope,
  pulses: PilotLocationPulse[],
): PortfolioEconomics {
  const org = orgForVertical(scope.vertical);
  const pulseById = new Map(pulses.map((p) => [p.locationId, p]));
  const allowed = new Set(scope.allowedLocationIds);

  const locations: LocationEconomics[] = [];
  org.locations.forEach((seed, i) => {
    if (!allowed.has(seed.id)) return;
    const pulse = pulseById.get(seed.id);
    if (!pulse) return;
    locations.push(
      scope.vertical === "hotel"
        ? buildHotelEconomics(org, pulse, seed, i)
        : buildRestaurantEconomics(org, pulse, seed, i),
    );
  });

  const group = {
    revenue: locations.reduce((s, l) => s + l.revenue, 0),
    contribution: locations.reduce((s, l) => s + l.contribution, 0),
    deliverySharePct:
      scope.vertical === "restaurant" && locations.length
        ? Math.round(
            (locations.reduce((s, l) => s + l.revenue * (l.deliverySharePct / 100), 0) /
              Math.max(1, locations.reduce((s, l) => s + l.revenue, 0))) *
              1000,
          ) / 10
        : 0,
    refundsComps: locations.reduce((s, l) => s + l.refundsComps, 0),
    verified: locations.reduce((s, l) => s + l.verified, 0),
    needsJudgment: locations.reduce((s, l) => s + l.needsYou, 0),
    exposure: locations.reduce((s, l) => s + l.exposure, 0),
    occupancyPct:
      scope.vertical === "hotel" && locations.length
        ? Math.round(
            locations.reduce((s, l) => s + (l.occupancyPct ?? 0), 0) / locations.length,
          )
        : undefined,
    adr:
      scope.vertical === "hotel" && locations.length
        ? Math.round(
            locations.reduce((s, l) => s + (l.adr ?? 0), 0) / locations.length,
          )
        : undefined,
    revpar:
      scope.vertical === "hotel" && locations.length
        ? Math.round(
            locations.reduce((s, l) => s + (l.revpar ?? 0), 0) / locations.length,
          )
        : undefined,
  };

  return {
    organizationId: org.id,
    vertical: scope.vertical,
    period: "mtd",
    locationCount: locations.length,
    group,
    locations,
    transfers: buildTransfers(org, scope.vertical).filter(
      (t) => allowed.has(t.sourceLocationId) && allowed.has(t.targetLocationId),
    ),
    sharedCost: sharedCostFor(scope.vertical, locations.length),
    peers: org.locations.filter((l) => allowed.has(l.id)).map((l, i) => peerFor(l, i)),
  };
}

/** Assert rollup identity for QA. */
export function assertPortfolioIdentity(p: PortfolioEconomics): string[] {
  const errors: string[] = [];
  const sumRev = p.locations.reduce((s, l) => s + l.revenue, 0);
  const sumContrib = p.locations.reduce((s, l) => s + l.contribution, 0);
  const sumRef = p.locations.reduce((s, l) => s + l.refundsComps, 0);
  const sumVv = p.locations.reduce((s, l) => s + l.verified, 0);
  if (sumRev !== p.group.revenue) errors.push(`revenue ${sumRev} ≠ ${p.group.revenue}`);
  if (sumContrib !== p.group.contribution)
    errors.push(`contribution ${sumContrib} ≠ ${p.group.contribution}`);
  if (sumRef !== p.group.refundsComps)
    errors.push(`refunds ${sumRef} ≠ ${p.group.refundsComps}`);
  if (sumVv !== p.group.verified) errors.push(`verified ${sumVv} ≠ ${p.group.verified}`);
  if (p.locationCount !== p.locations.length)
    errors.push(`count ${p.locationCount} ≠ ${p.locations.length}`);
  return errors;
}

export function locationEconomicsFor(
  locationId: string,
  scope: RoleScope,
  pulses: PilotLocationPulse[],
): LocationEconomics | null {
  const p = getPortfolioEconomics(scope, pulses);
  return p.locations.find((l) => l.locationId === locationId) ?? null;
}

export function orgLocationLabel(locationId: string): string {
  return locationDisplayName(locationId);
}

/** Pulse seeds aligned to scope — used when building portfolio from role. */
export function pulsesForScope(
  scope: RoleScope,
  enrich: (base: ReturnType<typeof locationPulseBaseForVertical>[number]) => PilotLocationPulse,
): PilotLocationPulse[] {
  return locationPulseBaseForVertical(scope.vertical)
    .filter((b) => scope.allowedLocationIds.includes(b.locationId))
    .map(enrich);
}
