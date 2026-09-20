/**
 * Berlin Mitte dinner - LIVE Channel Economics fixture.
 * Net sales aligned with live strip / finance (~€6.787 mid-service).
 * Providers resolved via catalog - not hardcoded in UI.
 */

import { requireDeliveryProvider } from "./providers";
import type {
  ChannelEconomicsState,
  ChannelLineItem,
  ChannelReconciliationRow,
  ChannelRoleBrief,
  ChannelSource,
  DeliveryChannel,
  DeliveryPressure,
  PauseDeliveryDecision,
  PromotionEconomics,
  SalesChannelEconomics,
} from "./types";

const ORG = "org_northstar";
const LOC = "loc_ber";

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct1 = (n: number) => Math.round(n * 10) / 10;

const src = (
  key: string,
  label: string,
  status: ChannelSource["status"],
  lastSyncLabel: string,
): ChannelSource => ({ key, label, status, lastSyncLabel });

function buildProviderLines(p: {
  grossSales: number;
  platformCommission: number;
  promotionsRestaurant: number;
  refunds: number;
  packaging: number;
  cogs: number;
  contribution: number;
  contributionMarginPct: number;
}): ChannelLineItem[] {
  return [
    {
      id: "gross",
      label: "Gross sales",
      amount: p.grossSales,
      kind: "gross",
      confidence: "complete",
      definitionId: "channelGrossSales",
    },
    {
      id: "commission",
      label: "Platform commission",
      amount: p.platformCommission,
      kind: "less",
      confidence: "partial",
      definitionId: "channelFees",
    },
    {
      id: "promos",
      label: "Promotions",
      amount: p.promotionsRestaurant,
      kind: "less",
      confidence: "complete",
      definitionId: "channelPromotion",
    },
    {
      id: "refunds",
      label: "Refunds",
      amount: p.refunds,
      kind: "less",
      confidence: "complete",
    },
    {
      id: "packaging",
      label: "Packaging",
      amount: p.packaging,
      kind: "less",
      confidence: "estimated",
      definitionId: "channelPackaging",
    },
    {
      id: "cogs",
      label: "COGS",
      amount: p.cogs,
      kind: "less",
      confidence: "estimated",
      definitionId: "cogs",
    },
    {
      id: "contribution",
      label: "Contribution",
      amount: p.contribution,
      kind: "result",
      confidence: "estimated",
      definitionId: "liveContribution",
    },
    {
      id: "margin",
      label: "Margin",
      amount: p.contributionMarginPct,
      kind: "margin",
      confidence: "estimated",
      definitionId: "contributionMargin",
    },
  ];
}

function makeDeliveryChannel(input: {
  providerId: string;
  grossSales: number;
  discounts: number;
  refunds: number;
  platformCommission: number;
  promotionsRestaurant: number;
  promotionsPlatform: number;
  packaging: number;
  paymentFees: number;
  cogs: number;
  incrementalLabor: number;
  orderCount: number;
  expectedCommissionPct: number;
  chargedCommissionPct: number;
  promoFundedSalesPct: number;
  totalNetSales: number;
  totalContribution: number;
  reconciledOrderIds: string[];
}): DeliveryChannel {
  const catalog = requireDeliveryProvider(input.providerId);
  const netRevenue = round2(
    input.grossSales -
      input.discounts -
      input.refunds -
      input.platformCommission -
      input.promotionsRestaurant -
      input.packaging -
      input.paymentFees,
  );
  const contribution = round2(
    netRevenue - input.cogs - input.incrementalLabor,
  );
  const contributionMarginPct = pct1(
    (contribution / Math.max(input.grossSales, 0.01)) * 100,
  );
  const commissionVarianceAmount = round2(
    input.grossSales *
      ((input.chargedCommissionPct - input.expectedCommissionPct) / 100),
  );

  return {
    providerId: catalog.id,
    providerName: catalog.name,
    grossSales: input.grossSales,
    discounts: input.discounts,
    refunds: input.refunds,
    platformCommission: input.platformCommission,
    promotionsRestaurant: input.promotionsRestaurant,
    promotionsPlatform: input.promotionsPlatform,
    packaging: input.packaging,
    paymentFees: input.paymentFees,
    cogs: input.cogs,
    incrementalLabor: input.incrementalLabor,
    netRevenue,
    contribution,
    contributionMarginPct,
    orderCount: input.orderCount,
    averageOrderValue: round2(input.grossSales / Math.max(input.orderCount, 1)),
    refundRatePct: pct1((input.refunds / Math.max(input.grossSales, 0.01)) * 100),
    promoFundedSalesPct: input.promoFundedSalesPct,
    expectedCommissionPct: input.expectedCommissionPct,
    chargedCommissionPct: input.chargedCommissionPct,
    commissionVarianceAmount,
    revenueSharePct: pct1((input.grossSales / input.totalNetSales) * 100),
    contributionSharePct: pct1(
      (contribution / Math.max(input.totalContribution, 0.01)) * 100,
    ),
    confidence: "partial",
    sources: [
      src("delivery", catalog.name, "partial", "5 min delayed"),
      src("pos", "POS", "complete", "Live"),
    ],
    reconciledOrderIds: input.reconciledOrderIds,
    lines: buildProviderLines({
      grossSales: input.grossSales,
      platformCommission: input.platformCommission,
      promotionsRestaurant: input.promotionsRestaurant,
      refunds: input.refunds,
      packaging: input.packaging,
      cogs: input.cogs,
      contribution,
      contributionMarginPct,
    }),
  };
}

/**
 * Mid-dinner channel economics. Optional netSales scales the mix proportionally.
 */
export function demoBerlinLiveChannels(
  netSalesOverride?: number,
): ChannelEconomicsState {
  const baseNet = 6787;
  const netSales =
    netSalesOverride != null ? round2(netSalesOverride) : baseNet;
  const scale = netSales / baseNet;

  const dineInNet = round2(4912 * scale);
  const deliveryNet = round2(1465 * scale);
  const takeawayNet = round2(netSales - dineInNet - deliveryNet);

  const uber = makeDeliveryChannel({
    providerId: "uber-eats",
    grossSales: round2(672 * scale),
    discounts: round2(18 * scale),
    refunds: round2(12 * scale),
    platformCommission: round2(168 * scale),
    promotionsRestaurant: round2(38 * scale),
    promotionsPlatform: round2(22 * scale),
    packaging: round2(26 * scale),
    paymentFees: round2(8 * scale),
    cogs: round2(181 * scale),
    incrementalLabor: round2(24 * scale),
    orderCount: Math.max(1, Math.round(16 * scale)),
    expectedCommissionPct: 25,
    chargedCommissionPct: 25.4,
    promoFundedSalesPct: 22,
    totalNetSales: netSales,
    totalContribution: 1, // patched below
    reconciledOrderIds: ["ord_d02", "pos_ue_104"],
  });

  const deliveroo = makeDeliveryChannel({
    providerId: "deliveroo",
    grossSales: round2(514 * scale),
    discounts: round2(12 * scale),
    refunds: round2(8 * scale),
    platformCommission: round2(144 * scale),
    promotionsRestaurant: round2(28 * scale),
    promotionsPlatform: round2(14 * scale),
    packaging: round2(20 * scale),
    paymentFees: round2(6 * scale),
    cogs: round2(138 * scale),
    incrementalLabor: round2(18 * scale),
    orderCount: Math.max(1, Math.round(12 * scale)),
    expectedCommissionPct: 28,
    chargedCommissionPct: 30.1,
    promoFundedSalesPct: 18,
    totalNetSales: netSales,
    totalContribution: 1,
    reconciledOrderIds: ["ord_d01", "pos_dr_088"],
  });

  const wolt = makeDeliveryChannel({
    providerId: "wolt",
    grossSales: round2(279 * scale),
    discounts: round2(6 * scale),
    refunds: round2(4 * scale),
    platformCommission: round2(70 * scale),
    promotionsRestaurant: round2(12 * scale),
    promotionsPlatform: round2(8 * scale),
    packaging: round2(11 * scale),
    paymentFees: round2(3 * scale),
    cogs: round2(74 * scale),
    incrementalLabor: round2(10 * scale),
    orderCount: Math.max(1, Math.round(7 * scale)),
    expectedCommissionPct: 25,
    chargedCommissionPct: 25,
    promoFundedSalesPct: 14,
    totalNetSales: netSales,
    totalContribution: 1,
    reconciledOrderIds: ["pos_wo_041"],
  });

  // Remainder of deliveryNet after providers (POS-only / other) - keep identity
  const providerGross = round2(
    uber.grossSales + deliveroo.grossSales + wolt.grossSales,
  );
  // Providers use gross; delivery channel netSales is deliveryNet (deduped POS net)
  void providerGross;

  const deliveryContribution = round2(
    uber.contribution + deliveroo.contribution + wolt.contribution,
  );
  const dineInContribution = round2(dineInNet * 0.496);
  const takeawayContribution = round2(takeawayNet * 0.42);
  const totalContribution = round2(
    dineInContribution + deliveryContribution + takeawayContribution,
  );

  // Patch shares now that totalContribution is known
  const patchShares = (p: DeliveryChannel): DeliveryChannel => ({
    ...p,
    revenueSharePct: pct1((p.grossSales / netSales) * 100),
    contributionSharePct: pct1(
      (p.contribution / Math.max(totalContribution, 0.01)) * 100,
    ),
  });
  const providers = [
    patchShares(uber),
    patchShares(deliveroo),
    patchShares(wolt),
  ];

  const dineInMargin = 49.6;
  const deliveryMargin = pct1(
    (deliveryContribution / Math.max(deliveryNet, 0.01)) * 100,
  );
  const takeawayMargin = 42.0;

  const dineIn: SalesChannelEconomics = {
    kind: "dine_in",
    label: "Dine-in",
    grossSales: dineInNet,
    netSales: dineInNet,
    revenueSharePct: pct1((dineInNet / netSales) * 100),
    contribution: dineInContribution,
    contributionSharePct: pct1(
      (dineInContribution / totalContribution) * 100,
    ),
    contributionMarginPct: dineInMargin,
    orderCount: Math.max(1, Math.round(118 * scale)),
    averageOrderValue: round2(dineInNet / Math.max(1, Math.round(118 * scale))),
    refundRatePct: 0.9,
    confidence: "complete",
    why: [
      "Higher contribution share than revenue share - kitchen capacity serves full-price tickets",
    ],
    lines: [
      {
        id: "net",
        label: "Net sales",
        amount: dineInNet,
        kind: "gross",
        confidence: "complete",
        definitionId: "netSales",
      },
      {
        id: "contribution",
        label: "Contribution",
        amount: dineInContribution,
        kind: "result",
        confidence: "estimated",
        definitionId: "liveContribution",
      },
      {
        id: "margin",
        label: "Margin",
        amount: dineInMargin,
        kind: "margin",
        confidence: "estimated",
        definitionId: "contributionMargin",
      },
    ],
  };

  const delivery: SalesChannelEconomics = {
    kind: "delivery",
    label: "Delivery",
    grossSales: deliveryNet,
    netSales: deliveryNet,
    revenueSharePct: pct1((deliveryNet / netSales) * 100),
    contribution: deliveryContribution,
    contributionSharePct: pct1(
      (deliveryContribution / totalContribution) * 100,
    ),
    contributionMarginPct: deliveryMargin,
    orderCount: providers.reduce((s, p) => s + p.orderCount, 0),
    averageOrderValue: round2(
      deliveryNet /
        Math.max(
          1,
          providers.reduce((s, p) => s + p.orderCount, 0),
        ),
    ),
    refundRatePct: 1.8,
    confidence: "partial",
    why: [
      "Orders deduped against POS via provider + POS order IDs - not double-counted",
      "Commission and packaging pull contribution share below revenue share",
    ],
    providers,
    lines: [
      {
        id: "net",
        label: "Net sales",
        amount: deliveryNet,
        kind: "gross",
        confidence: "partial",
        definitionId: "netSales",
      },
      {
        id: "contribution",
        label: "Contribution",
        amount: deliveryContribution,
        kind: "result",
        confidence: "estimated",
        definitionId: "liveContribution",
      },
      {
        id: "margin",
        label: "Margin",
        amount: deliveryMargin,
        kind: "margin",
        confidence: "estimated",
        definitionId: "contributionMargin",
      },
    ],
  };

  const takeaway: SalesChannelEconomics = {
    kind: "takeaway",
    label: "Takeaway",
    grossSales: takeawayNet,
    netSales: takeawayNet,
    revenueSharePct: pct1((takeawayNet / netSales) * 100),
    contribution: takeawayContribution,
    contributionSharePct: pct1(
      (takeawayContribution / totalContribution) * 100,
    ),
    contributionMarginPct: takeawayMargin,
    orderCount: Math.max(1, Math.round(22 * scale)),
    averageOrderValue: round2(
      takeawayNet / Math.max(1, Math.round(22 * scale)),
    ),
    refundRatePct: 0.6,
    confidence: "complete",
    why: ["Direct pickup - no platform commission; packaging still applies"],
    lines: [
      {
        id: "net",
        label: "Net sales",
        amount: takeawayNet,
        kind: "gross",
        confidence: "complete",
        definitionId: "netSales",
      },
      {
        id: "contribution",
        label: "Contribution",
        amount: takeawayContribution,
        kind: "result",
        confidence: "estimated",
        definitionId: "liveContribution",
      },
    ],
  };

  const channels = [dineIn, delivery, takeaway];

  const differencePts = pct1(deliveryMargin - dineInMargin);
  const comparison = {
    dineInMarginPct: dineInMargin,
    deliveryMarginPct: deliveryMargin,
    differencePts,
    why: [
      { id: "commission", label: "Commission", pts: -11.4 },
      { id: "promotions", label: "Promotions", pts: -2.6 },
      { id: "packaging", label: "Packaging", pts: -1.8 },
      { id: "mix", label: "Different menu mix", pts: -2.0 },
    ],
  };

  const pressure: DeliveryPressure = {
    activeOrders: 18,
    kitchenLoad: "high",
    dineInTicketDeltaMin: 6,
    deliveryContributionPerHour: round2(126 * scale),
    dineInContributionAtRisk: round2(310 * scale),
    why: "Delivery tickets are stretching expo - dine-in ticket times up 6 min",
  };

  const pauseDecision: PauseDeliveryDecision = {
    id: "pause_del_peak",
    windowLabel: "19:30-20:15",
    expectedDeliveryContributionLost: round2(94 * scale),
    expectedDineInContributionProtected: round2(310 * scale),
    netExpectedValue: round2(216 * scale),
    recommendation: "pause",
    requiresApproval: true,
    status: "prepared",
    why: "Protecting dine-in capacity during peak returns more contribution than delivery fees cover",
    href: "/app/controls",
  };

  const promotion: PromotionEconomics = {
    id: "promo_ue_20",
    label: "20% off campaign",
    providerId: "uber-eats",
    providerName: requireDeliveryProvider("uber-eats").name,
    grossIncrementalSales: round2(840 * scale),
    restaurantFundedDiscount: round2(168 * scale),
    platformFunded: round2(84 * scale),
    incrementalContribution: round2(214 * scale),
    withoutPromotionEstimate: round2(176 * scale),
    netIncrementalValue: round2(38 * scale),
    why: "Orders rose, but restaurant-funded discount consumed most of the incremental contribution",
  };

  const menuItems = [
    {
      id: "dish_a",
      name: "Truffle pasta",
      revenue: round2(420 * scale),
      contribution: round2(148 * scale),
      marginPct: 35.2,
      tone: "top" as const,
      why: "Travels well · high ticket · low packaging share",
    },
    {
      id: "bev_sparkling",
      name: "House sparkling (delivery)",
      revenue: round2(186 * scale),
      contribution: round2(118 * scale),
      marginPct: 63.4,
      tone: "top" as const,
      why: "High beverage contribution · low packaging drag",
    },
    {
      id: "dish_b",
      name: "Burger stack",
      revenue: round2(318 * scale),
      contribution: round2(96 * scale),
      marginPct: 30.2,
      tone: "top" as const,
      why: "Volume driver with acceptable packaging cost",
    },
    {
      id: "dish_c",
      name: "Soft-shell crab",
      revenue: round2(380 * scale),
      contribution: round2(22 * scale),
      marginPct: 5.8,
      tone: "low" as const,
      why: "High packaging + food cost + promotion drag",
      recommendation: "Remove from delivery menu or reprice - prepared, not auto-applied",
    },
  ];

  const reconciliation: ChannelReconciliationRow[] = [
    {
      providerId: "uber-eats",
      providerName: requireDeliveryProvider("uber-eats").name,
      status: "reconciled",
      href: "/app/checks",
    },
    {
      providerId: "deliveroo",
      providerName: requireDeliveryProvider("deliveroo").name,
      status: "variance",
      amount: deliveroo.commissionVarianceAmount,
      amountLabel: "commission variance",
      href: "/app/recover",
    },
    {
      providerId: "wolt",
      providerName: requireDeliveryProvider("wolt").name,
      status: "mismatch",
      amount: round2(42 * scale),
      amountLabel: "settlement mismatch",
      href: "/app/checks",
    },
  ];

  const recoverableAmount = round2(
    reconciliation
      .filter((r) => r.amount != null)
      .reduce((s, r) => s + (r.amount ?? 0), 0),
  );

  const roleBriefs: ChannelRoleBrief[] = [
    {
      role: "cfo",
      headline: "Channel mix - revenue quality",
      lines: [
        `Dine-in ${dineIn.revenueSharePct}% revenue · ${dineIn.contributionSharePct}% contribution`,
        `Delivery ${delivery.revenueSharePct}% revenue · ${delivery.contributionSharePct}% contribution`,
        `Delivery margin ${deliveryMargin}% · dine-in ${dineInMargin}% (${differencePts} pts)`,
      ],
    },
    {
      role: "coo",
      headline: "Channel pressure",
      lines: [
        "Berlin Mitte - delivery load affecting dine-in service",
        `Delivery ${delivery.revenueSharePct}% of sales · kitchen pressure high`,
        `Ticket times +${pressure.dineInTicketDeltaMin} min · pause prepared for approval`,
      ],
    },
    {
      role: "owner",
      headline: "Channel glance",
      lines: [
        `${dineIn.revenueSharePct}% dine-in · ${delivery.revenueSharePct}% delivery · ${takeaway.revenueSharePct}% takeaway`,
        "Most profitable channel: Dine-in",
        `Delivery margin ${differencePts} pts vs dine-in`,
      ],
    },
    {
      role: "finance",
      headline: "Delivery reconciliation",
      lines: [
        `${requireDeliveryProvider("uber-eats").name} reconciled`,
        `${requireDeliveryProvider("deliveroo").name} commission variance`,
        `Recoverable ${recoverableAmount.toFixed(2)} EUR prepared`,
      ],
    },
    {
      role: "gm",
      headline: "Floor economics",
      lines: [
        `Delivery ${pressure.activeOrders} active · kitchen ${pressure.kitchenLoad}`,
        `Pause ${pauseDecision.windowLabel} prepared · net +€${pauseDecision.netExpectedValue.toFixed(0)} expected`,
        "Approve only if you want RADR to request the availability change",
      ],
    },
  ];

  return {
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    serviceLabel: "Dinner",
    phaseLabel: "Live",
    businessDate: "2026-08-19",
    currency: "EUR",
    asOf: "2026-08-19T20:12:00+02:00",
    illustrative: true,
    overallConfidence: "estimated",
    netSales,
    totalContribution,
    channels,
    comparison,
    pressure,
    pauseDecision,
    promotion,
    menuItems,
    reconciliation,
    recoverableAmount,
    liveMix: channels.map((c) => ({
      kind: c.kind,
      label: c.label,
      amount: c.netSales,
      sharePct: c.revenueSharePct,
    })),
    roleBriefs,
  };
}
