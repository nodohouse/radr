/**
 * Marketing config: industry operating models for Solutions.
 *
 * Structural only. Copy lives in locales/solutions.json under `intelligence`.
 * Does not change the product normalized data model.
 *
 * Future verticals (not exposed yet): resorts, hotelGroups, qsr, nightlife,
 * foodHalls, catering, entertainment.
 */

export type IndustryId =
  | "restaurants"
  | "hotels"
  | "bars"
  | "groups"
  | "finance"
  | "apartments";

export type TerritoryCode = "BUY" | "LABOR" | "SELL" | "RECOVER" | "PORTFOLIO" | "VALUE";

export type IndustryMode = "finding" | "portfolio" | "finance";

export type DomainStatus = "available" | "developing" | "planned";

export type IndustryFindingDef = {
  id: string;
  territory: TerritoryCode;
  /** Featured in the main demonstration panel */
  primary?: boolean;
};

export type IndustryDef = {
  id: IndustryId;
  mode: IndustryMode;
  currency: "USD" | "EUR";
  dataDomains: readonly { id: string; status: DomainStatus }[];
  operatingSignals: readonly string[];
  /** Work RADR can prepare or remove from operators (copy keys under workRemoved.*). */
  workRemoved: readonly string[];
  findings: readonly IndustryFindingDef[];
};

/** Public industry switcher — primary operating models only. */
export const INDUSTRY_ORDER = [
  "restaurants",
  "hotels",
  "apartments",
  "groups",
] as const satisfies readonly IndustryId[];

export const INDUSTRY_INTELLIGENCE: Record<IndustryId, IndustryDef> = {
  restaurants: {
    id: "restaurants",
    mode: "finding",
    currency: "EUR",
    dataDomains: [
      { id: "pos", status: "available" },
      { id: "reservations", status: "available" },
      { id: "labor", status: "available" },
      { id: "payments", status: "available" },
      { id: "inventory", status: "developing" },
      { id: "suppliers", status: "available" },
      { id: "delivery", status: "planned" },
      { id: "accounting", status: "developing" },
      { id: "weather", status: "planned" },
      { id: "localEvents", status: "planned" },
    ],
    operatingSignals: [
      "covers",
      "bookingPace",
      "averageSpend",
      "tableTurns",
      "labor",
      "foodCost",
      "menuMix",
      "delivery",
    ],
    workRemoved: [
      "dailyBrief",
      "laborDemand",
      "supplierVariance",
      "cancellationPrep",
      "deliveryMargin",
      "forecastExceptions",
    ],
    findings: [
      { id: "buy", territory: "BUY", primary: true },
      { id: "labor", territory: "LABOR" },
      { id: "recover", territory: "RECOVER" },
      { id: "sell", territory: "SELL" },
    ],
  },

  hotels: {
    id: "hotels",
    mode: "finding",
    currency: "EUR",
    dataDomains: [
      { id: "pms", status: "developing" },
      { id: "bookings", status: "developing" },
      { id: "rooms", status: "developing" },
      { id: "revenueManagement", status: "planned" },
      { id: "channelManager", status: "planned" },
      { id: "ota", status: "planned" },
      { id: "payments", status: "available" },
      { id: "housekeeping", status: "planned" },
      { id: "labor", status: "available" },
      { id: "fb", status: "available" },
      { id: "events", status: "planned" },
      { id: "accounting", status: "developing" },
      { id: "guestFeedback", status: "planned" },
      { id: "weather", status: "planned" },
      { id: "localEvents", status: "planned" },
    ],
    operatingSignals: [
      "occupancy",
      "adr",
      "revpar",
      "pickup",
      "channelMix",
      "housekeeping",
      "labor",
      "ancillary",
    ],
    workRemoved: [
      "dailyBrief",
      "rateAnomalies",
      "otaCommission",
      "housekeepingDemand",
      "bookingPace",
      "groupVariance",
      "crossDeptDemand",
    ],
    findings: [
      { id: "sell", territory: "SELL", primary: true },
      { id: "recover", territory: "RECOVER" },
      { id: "buy", territory: "BUY" },
      { id: "labor", territory: "LABOR" },
    ],
  },

  apartments: {
    id: "apartments",
    mode: "finding",
    currency: "EUR",
    dataDomains: [
      { id: "pms", status: "developing" },
      { id: "channelManager", status: "planned" },
      { id: "bookings", status: "developing" },
      { id: "payments", status: "available" },
      { id: "housekeeping", status: "planned" },
      { id: "labor", status: "available" },
      { id: "accounting", status: "developing" },
    ],
    operatingSignals: [
      "occupancy",
      "orphanGaps",
      "channelMix",
      "turnover",
      "adr",
      "directShare",
    ],
    workRemoved: [
      "gapReview",
      "channelRelease",
      "fillAnalysis",
      "turnoverPrep",
    ],
    findings: [
      { id: "sell", territory: "SELL", primary: true },
      { id: "recover", territory: "RECOVER" },
    ],
  },

  bars: {
    id: "bars",
    mode: "finding",
    currency: "EUR",
    dataDomains: [
      { id: "pos", status: "available" },
      { id: "payments", status: "available" },
      { id: "labor", status: "available" },
      { id: "inventory", status: "developing" },
      { id: "suppliers", status: "available" },
      { id: "footfall", status: "planned" },
      { id: "weather", status: "planned" },
      { id: "events", status: "planned" },
      { id: "delivery", status: "planned" },
      { id: "accounting", status: "developing" },
      { id: "loyalty", status: "planned" },
    ],
    operatingSignals: [
      "transactions",
      "averageTicket",
      "hourlySales",
      "productMix",
      "laborHours",
      "waste",
      "weatherSensitivity",
      "daypart",
    ],
    workRemoved: [
      "laborDaypart",
      "supplierPrice",
      "stockRisk",
      "weatherDemand",
      "eventDemand",
      "productMix",
    ],
    findings: [
      { id: "sell", territory: "SELL", primary: true },
      { id: "buy", territory: "BUY" },
      { id: "labor", territory: "LABOR" },
    ],
  },

  groups: {
    id: "groups",
    mode: "portfolio",
    currency: "EUR",
    dataDomains: [
      { id: "pos", status: "available" },
      { id: "reservations", status: "available" },
      { id: "labor", status: "available" },
      { id: "payments", status: "available" },
      { id: "suppliers", status: "available" },
      { id: "accounting", status: "developing" },
      { id: "inventory", status: "developing" },
      { id: "delivery", status: "planned" },
    ],
    operatingSignals: [
      "crossLocation",
      "portfolioExposure",
      "exceptions",
      "forecastVariance",
      "marginCompare",
      "supplierPricing",
      "laborProductivity",
      "verifiedByLocation",
    ],
    workRemoved: [
      "locationReports",
      "manualRanking",
      "varianceInvestigation",
      "crossLocationCompare",
      "weeklySummaries",
      "valueTracking",
    ],
    findings: [{ id: "variance", territory: "PORTFOLIO", primary: true }],
  },

  finance: {
    id: "finance",
    mode: "finance",
    currency: "EUR",
    dataDomains: [
      { id: "accounting", status: "developing" },
      { id: "invoices", status: "available" },
      { id: "contracts", status: "available" },
      { id: "pos", status: "available" },
      { id: "payments", status: "available" },
      { id: "payroll", status: "developing" },
      { id: "labor", status: "available" },
      { id: "reservations", status: "available" },
      { id: "inventory", status: "developing" },
      { id: "channels", status: "planned" },
    ],
    operatingSignals: [
      "leakage",
      "marginMove",
      "invoiceMatch",
      "locationSpend",
      "outstandingCredits",
      "verifiedValue",
      "dayChange",
    ],
    workRemoved: [
      "invoiceMatch",
      "creditChase",
      "marginException",
      "valueTracking",
    ],
    findings: [{ id: "month", territory: "VALUE", primary: true }],
  },
};

export function getIndustry(id: IndustryId): IndustryDef {
  return INDUSTRY_INTELLIGENCE[id];
}

export function primaryFinding(def: IndustryDef): IndustryFindingDef {
  return def.findings.find((f) => f.primary) ?? def.findings[0]!;
}
