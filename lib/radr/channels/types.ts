/**
 * Channel Economics - types.
 * Revenue quality by sales channel + normalized delivery providers.
 */

export type ChannelConfidence =
  | "complete"
  | "estimated"
  | "partial"
  | "stale";

/** Primary sales channels (not delivery apps). */
export type SalesChannelKind = "dine_in" | "delivery" | "takeaway";

export type ChannelSource = {
  key: string;
  label: string;
  status: ChannelConfidence;
  lastSyncLabel: string;
};

export type ChannelLineItem = {
  id: string;
  label: string;
  /** Signed major currency: costs are negative or shown as less via amount + kind */
  amount: number;
  kind: "gross" | "less" | "result" | "margin";
  confidence: ChannelConfidence;
  definitionId?: string;
};

/**
 * Normalized delivery aggregator channel.
 * providerId aligns with integration registry when known - never hardcode in UI.
 */
export type DeliveryChannel = {
  providerId: string;
  providerName: string;
  /** Gross marketplace sales attributed after POS dedupe */
  grossSales: number;
  discounts: number;
  refunds: number;
  platformCommission: number;
  /** Restaurant-funded promo cost */
  promotionsRestaurant: number;
  /** Platform-funded promo (not a restaurant cost) */
  promotionsPlatform: number;
  packaging: number;
  paymentFees: number;
  cogs: number;
  incrementalLabor: number;
  netRevenue: number;
  contribution: number;
  contributionMarginPct: number;
  orderCount: number;
  averageOrderValue: number;
  refundRatePct: number;
  /** Share of provider sales on restaurant-funded promos */
  promoFundedSalesPct: number;
  /** Contracted commission rate % */
  expectedCommissionPct: number;
  /** Charged effective rate % */
  chargedCommissionPct: number;
  commissionVarianceAmount: number;
  revenueSharePct: number;
  contributionSharePct: number;
  confidence: ChannelConfidence;
  sources: ChannelSource[];
  /** Deduped: POS order IDs already counted in POS net sales */
  reconciledOrderIds: string[];
  lines: ChannelLineItem[];
};

export type SalesChannelEconomics = {
  kind: SalesChannelKind;
  label: string;
  grossSales: number;
  netSales: number;
  revenueSharePct: number;
  contribution: number;
  contributionSharePct: number;
  contributionMarginPct: number;
  orderCount: number;
  averageOrderValue: number;
  refundRatePct: number;
  confidence: ChannelConfidence;
  why: string[];
  /** Present when kind === delivery */
  providers?: DeliveryChannel[];
  lines: ChannelLineItem[];
};

export type MarginBridgeStep = {
  id: string;
  label: string;
  /** Contribution margin pts impact (negative = hurts delivery vs dine-in) */
  pts: number;
};

export type ChannelMarginComparison = {
  dineInMarginPct: number;
  deliveryMarginPct: number;
  /** delivery − dine-in (typically negative) */
  differencePts: number;
  why: MarginBridgeStep[];
};

export type DeliveryPressure = {
  activeOrders: number;
  kitchenLoad: "calm" | "elevated" | "high";
  dineInTicketDeltaMin: number;
  deliveryContributionPerHour: number;
  dineInContributionAtRisk: number;
  why: string;
};

export type PauseDeliveryDecision = {
  id: string;
  windowLabel: string;
  expectedDeliveryContributionLost: number;
  expectedDineInContributionProtected: number;
  netExpectedValue: number;
  recommendation: "pause" | "keep_open" | "watch";
  requiresApproval: true;
  status: "prepared" | "approved" | "rejected";
  why: string;
  href: string;
};

export type PromotionEconomics = {
  id: string;
  label: string;
  providerId: string;
  providerName: string;
  grossIncrementalSales: number;
  restaurantFundedDiscount: number;
  platformFunded: number;
  incrementalContribution: number;
  withoutPromotionEstimate: number;
  netIncrementalValue: number;
  why: string;
};

export type DeliveryMenuItemEconomics = {
  id: string;
  name: string;
  revenue: number;
  contribution: number;
  marginPct: number;
  tone: "top" | "low";
  why: string;
  recommendation?: string;
};

export type ChannelReconciliationRow = {
  providerId: string;
  providerName: string;
  status: "reconciled" | "variance" | "mismatch" | "pending";
  amount?: number;
  amountLabel?: string;
  href: string;
};

export type ChannelRoleBrief = {
  role: "cfo" | "coo" | "owner" | "finance" | "gm";
  headline: string;
  lines: string[];
};

export type ChannelEconomicsState = {
  organizationId: string;
  locationId: string;
  locationName: string;
  serviceLabel: string;
  phaseLabel: string;
  businessDate: string;
  currency: "EUR";
  asOf: string;
  illustrative: boolean;
  overallConfidence: ChannelConfidence;

  netSales: number;
  totalContribution: number;

  channels: SalesChannelEconomics[];
  comparison: ChannelMarginComparison;
  pressure: DeliveryPressure;
  pauseDecision: PauseDeliveryDecision;
  promotion: PromotionEconomics;
  menuItems: DeliveryMenuItemEconomics[];
  reconciliation: ChannelReconciliationRow[];
  recoverableAmount: number;

  /** Compact live mix mirrors channels net sales */
  liveMix: {
    kind: SalesChannelKind;
    label: string;
    amount: number;
    sharePct: number;
  }[];

  roleBriefs: ChannelRoleBrief[];
};
