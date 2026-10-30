/**
 * Northstar Hospitality Group — canonical multi-location demo fixture.
 * ONE organization. Global regions. Locations. Decisions reference locationId.
 * Group totals are derived — never hard-coded separately.
 *
 * Group reporting currency: EUR (explicit). No invented FX.
 */

import {
  CANON_CREATED,
  CANON_LABOR,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_PLAYBOOK,
  CANON_SUPPLIER,
  CANON_TABLE,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type RegionId = "europe" | "americas" | "middle_east" | "apac";

export type LocationId =
  | "ams-centrum"
  | "berlin-mitte"
  | "london-shoreditch"
  | "barcelona-eixample"
  | "nyc-soho"
  | "miami-brickell"
  | "mexico-roma"
  | "dubai-difc"
  | "doha-westbay"
  | "singapore-marina"
  | "tokyo-shibuya"
  | "sydney-surry";

export type DemoLocation = {
  id: LocationId;
  name: string;
  regionId: RegionId;
  regionLabel: string;
  city: string;
  status: "needs_attention" | "within_expectations";
};

export type LiveState =
  | "needs_you"
  | "investigate"
  | "review"
  | "radr_handling";

export type PreviewType = "reconciliation" | "variance" | "futures";

export type DecisionPreview = {
  type: PreviewType;
  whyFlagged: string;
  recommendation: string;
  recommendationWhy: string;
  deepLinkLabel: string;
  deepLinkHref: string;
  secondaryLinkLabel?: string;
  secondaryLinkHref?: string;
  evidenceSources?: number;
  freshness?: string;
  statusLabel?: string;
  /** Reconciliation */
  sources?: { label: string; amount: number }[];
  ruledOut?: string[];
  unexplainedLabel?: string;
  /** Variance */
  contractRate?: string;
  invoiceRate?: string;
  quantity?: string;
  baseline?: string;
  checks?: string[];
  /** Futures */
  futures?: {
    id: string;
    label: string;
    expected: number;
    recommended?: boolean;
  }[];
  expiresHint?: string;
};

export type GroupLiveDecision = {
  displayId: string;
  locationId: LocationId;
  classLabel: string;
  temporalMode: "live";
  state: LiveState;
  owner: string;
  economics: {
    identified: number;
    exposed: number;
    expected: number;
    recoverable: number;
    observed: number;
    attributed: number;
    verified: number;
    currency: "EUR";
    basis: string;
  };
  line: string;
  detail: string;
  cta: string;
  ctaHref: string;
  /** In-mock Decision Focus Mode — economics always from `economics` */
  preview?: DecisionPreview;
};

export type LedgerRow = {
  displayId: string;
  locationId: LocationId;
  classLabel: string;
  kind: "protected" | "recovered" | "avoided" | "created";
  expected: number;
  observed: number;
  verified: number;
  status: "verified" | "closed" | "open";
};

export const NORTHSTAR_ORG = {
  id: "org_northstar",
  name: "Northstar Hospitality Group",
  vertical: "Restaurants & F&B",
  reportingCurrency: "EUR",
  reportingCurrencyLabel: "Group reporting · EUR",
} as const;

export const NORTHSTAR_REGIONS: {
  id: RegionId;
  label: string;
  short: string;
  locationIds: LocationId[];
}[] = [
  {
    id: "europe",
    label: "Europe",
    short: "Europe",
    locationIds: [
      "ams-centrum",
      "london-shoreditch",
      "barcelona-eixample",
    ],
  },
  {
    id: "americas",
    label: "Americas",
    short: "Americas",
    locationIds: ["nyc-soho", "berlin-mitte", "miami-brickell", "mexico-roma"],
  },
  {
    id: "middle_east",
    label: "Middle East",
    short: "Middle East",
    locationIds: ["dubai-difc", "doha-westbay"],
  },
  {
    id: "apac",
    label: "APAC",
    short: "APAC",
    locationIds: ["singapore-marina", "tokyo-shibuya", "sydney-surry"],
  },
];

export const NORTHSTAR_LOCATIONS: DemoLocation[] = [
  {
    id: "ams-centrum",
    name: "Amsterdam Centrum",
    regionId: "europe",
    regionLabel: "Europe",
    city: "Amsterdam",
    status: "needs_attention",
  },
  {
    id: "berlin-mitte",
    name: "Soho · New York",
    regionId: "americas",
    regionLabel: "Americas",
    city: "New York",
    status: "needs_attention",
  },
  {
    id: "london-shoreditch",
    name: "London Shoreditch",
    regionId: "europe",
    regionLabel: "Europe",
    city: "London",
    status: "needs_attention",
  },
  {
    id: "barcelona-eixample",
    name: "Barcelona Eixample",
    regionId: "europe",
    regionLabel: "Europe",
    city: "Barcelona",
    status: "within_expectations",
  },
  {
    id: "nyc-soho",
    name: "New York SoHo",
    regionId: "americas",
    regionLabel: "Americas",
    city: "New York",
    status: "within_expectations",
  },
  {
    id: "miami-brickell",
    name: "Miami Brickell",
    regionId: "americas",
    regionLabel: "Americas",
    city: "Miami",
    status: "within_expectations",
  },
  {
    id: "mexico-roma",
    name: "Mexico City Roma Norte",
    regionId: "americas",
    regionLabel: "Americas",
    city: "Mexico City",
    status: "within_expectations",
  },
  {
    id: "dubai-difc",
    name: "Dubai DIFC",
    regionId: "middle_east",
    regionLabel: "Middle East",
    city: "Dubai",
    status: "within_expectations",
  },
  {
    id: "doha-westbay",
    name: "Doha West Bay",
    regionId: "middle_east",
    regionLabel: "Middle East",
    city: "Doha",
    status: "within_expectations",
  },
  {
    id: "singapore-marina",
    name: "Singapore Marina Bay",
    regionId: "apac",
    regionLabel: "APAC",
    city: "Singapore",
    status: "within_expectations",
  },
  {
    id: "tokyo-shibuya",
    name: "Tokyo Shibuya",
    regionId: "apac",
    regionLabel: "APAC",
    city: "Tokyo",
    status: "within_expectations",
  },
  {
    id: "sydney-surry",
    name: "Sydney Surry Hills",
    regionId: "apac",
    regionLabel: "APAC",
    city: "Sydney",
    status: "within_expectations",
  },
];

export const LOCATION_BY_ID = Object.fromEntries(
  NORTHSTAR_LOCATIONS.map((l) => [l.id, l]),
) as Record<LocationId, DemoLocation>;

export const REGION_FOOTPRINT = NORTHSTAR_REGIONS.map((r) => ({
  id: r.id,
  short: r.short,
  count: r.locationIds.length,
})).filter((r) => r.count > 0);

export const REGION_FOOTPRINT_LINE = REGION_FOOTPRINT.map(
  (r) => `${r.short.toUpperCase()} ${r.count}`,
).join(" · ");

/** LIVE open Decisions — Needs You only · EUR reporting locations */
export const LIVE_D7021: GroupLiveDecision = {
  displayId: "D-7021",
  locationId: "berlin-mitte",
  classLabel: "Reconciliation",
  temporalMode: "live",
  state: "investigate",
  owner: "Finance",
  economics: {
    identified: 395,
    exposed: 395,
    expected: 0,
    recoverable: 395,
    observed: 0,
    attributed: 91,
    verified: 0,
    currency: "EUR",
    basis: "Expected settlement vs received funds",
  },
  line: "Expected settlement and received funds disagree.",
  detail: "$91 explained. $395 remains unmatched.",
  cta: "Investigate",
  ctaHref: "/solutions#reconciliation",
  preview: {
    type: "reconciliation",
    whyFlagged:
      "POS expects $41,884. Payments and accounting agree on $41,489. $395 remains unexplained.",
    sources: [
      { label: "POS expected", amount: 41884 },
      { label: "Payment processor", amount: 41489 },
      { label: "Accounting", amount: 41489 },
    ],
    unexplainedLabel: "Unexplained difference",
    ruledOut: [
      "Refunds matched",
      "Processor fees accounted for",
      "Timing differences checked",
    ],
    recommendation: "Investigate settlement gap",
    recommendationWhy:
      "Payment processor and accounting agree. POS expectation remains $395 higher.",
    deepLinkLabel: "View Trace",
    deepLinkHref: "/solutions#reconciliation",
    evidenceSources: 3,
    freshness: "High",
    statusLabel: "Needs review",
  },
};

/** Amsterdam variance: ($7.30 − $6.80) × 372 = $186 */
export const LIVE_D7022: GroupLiveDecision = {
  displayId: "D-7022",
  locationId: "ams-centrum",
  classLabel: "Supplier / AP",
  temporalMode: "live",
  state: "review",
  owner: "CFO",
  economics: {
    identified: 186,
    exposed: 186,
    expected: 186,
    recoverable: 186,
    observed: 0,
    attributed: 0,
    verified: 0,
    currency: "EUR",
    basis: "Invoice vs agreed contract rate",
  },
  line: "Invoice and contracted rate disagree.",
  detail: "Evidence package ready.",
  cta: "Review",
  ctaHref: "/solutions#supplier-ap",
  preview: {
    type: "variance",
    whyFlagged: "Invoice price exceeds the active contracted rate.",
    contractRate: "$6.80 / unit",
    invoiceRate: "$7.30 / unit",
    quantity: "372",
    baseline: "Invoice pays as submitted. Expected loss versus contract: $186.",
    checks: [
      "Evidence ready",
      "Contract matched",
      "Invoice matched",
      "Variance above materiality threshold",
    ],
    recommendation: "Review supplier variance",
    recommendationWhy:
      "The invoice unit rate exceeds the active contract rate. The difference creates $186 of exposure.",
    deepLinkLabel: "View evidence",
    deepLinkHref: "/solutions#supplier-ap",
    secondaryLinkLabel: "View full Decision",
    secondaryLinkHref: "/product/decisions/D-4102/trace#trace-evidence",
    evidenceSources: 2,
    freshness: "High",
    statusLabel: "Needs review",
  },
};

export const LIVE_D7023: GroupLiveDecision = {
  displayId: "D-7023",
  locationId: "london-shoreditch",
  classLabel: "Perishable revenue",
  temporalMode: "live",
  state: "needs_you",
  owner: "GM",
  economics: {
    identified: 740,
    exposed: 740,
    expected: 620,
    recoverable: 740,
    observed: 0,
    attributed: 0,
    verified: 0,
    currency: "EUR",
    basis: "Inventory expires tonight · contribution at risk",
  },
  line: "Inventory expires tonight.",
  detail: "$740 expected contribution at risk.",
  cta: "Compare Futures",
  ctaHref: "/product/futures#compare-futures",
  preview: {
    type: "futures",
    whyFlagged: "Inventory expires tonight.",
    expiresHint: "Expected contribution at risk",
    futures: [
      { id: "hold", label: "Hold current price", expected: 540 },
      {
        id: "discount",
        label: "Targeted discount",
        expected: 680,
        recommended: true,
      },
      { id: "channel", label: "Release to channel", expected: 610 },
    ],
    recommendation: "Targeted discount",
    recommendationWhy:
      "RADR compared three paths before close. Targeted discount currently preserves the most expected contribution.",
    deepLinkLabel: "Open Futures",
    deepLinkHref: "/product/futures#compare-futures",
    evidenceSources: 4,
    freshness: "Live",
    statusLabel: "Needs you",
  },
};

export const HANDLING_D7101: GroupLiveDecision = {
  displayId: "D-7101",
  locationId: "berlin-mitte",
  classLabel: "Supplier / AP",
  temporalMode: "live",
  state: "radr_handling",
  owner: "RADR",
  economics: {
    identified: 120,
    exposed: 120,
    expected: 120,
    recoverable: 120,
    observed: 0,
    attributed: 0,
    verified: 0,
    currency: "EUR",
    basis: "Credit chase in progress",
  },
  line: "Supplier dispute package prepared.",
  detail: "Awaiting vendor response.",
  cta: "View",
  ctaHref: "/product/control-center",
};

export const HANDLING_D7102: GroupLiveDecision = {
  displayId: "D-7102",
  locationId: "berlin-mitte",
  classLabel: "Reconciliation",
  temporalMode: "live",
  state: "radr_handling",
  owner: "RADR",
  economics: {
    identified: 64,
    exposed: 64,
    expected: 64,
    recoverable: 64,
    observed: 0,
    attributed: 0,
    verified: 0,
    currency: "EUR",
    basis: "Refund match in progress",
  },
  line: "Refund match staged for approval.",
  detail: "Within policy · waiting on bank feed.",
  cta: "View",
  ctaHref: "/product/control-center",
};

export const GROUP_NEEDS_YOU = [LIVE_D7021, LIVE_D7022, LIVE_D7023] as const;

export const GROUP_HANDLING = [HANDLING_D7101, HANDLING_D7102] as const;

export const GROUP_LEDGER: LedgerRow[] = [
  {
    displayId: "D-4102",
    locationId: "berlin-mitte",
    classLabel: "Supplier / AP",
    kind: "recovered",
    expected: CANON_SUPPLIER.expectedProtectedEuro,
    observed: CANON_SUPPLIER.actualProtectedEuro,
    verified: verifiedEuro(CANON_SUPPLIER),
    status: "verified",
  },
  {
    displayId: "D-1911",
    locationId: "berlin-mitte",
    classLabel: "Perishable revenue",
    kind: "protected",
    expected: CANON_PEAK.expectedProtectedEuro,
    observed: CANON_PEAK.actualProtectedEuro,
    verified: verifiedEuro(CANON_PEAK),
    status: "verified",
  },
  {
    displayId: "D-2201",
    locationId: "ams-centrum",
    classLabel: "Perishable revenue",
    kind: "protected",
    expected: CANON_OTA.expectedProtectedEuro,
    observed: CANON_OTA.actualProtectedEuro,
    verified: verifiedEuro(CANON_OTA),
    status: "verified",
  },
  {
    displayId: "D-3104",
    locationId: "london-shoreditch",
    classLabel: "Perishable revenue",
    kind: "recovered",
    expected: CANON_ORPHAN.expectedProtectedEuro,
    observed:
      CANON_ORPHAN.observedContributionEuro ?? CANON_ORPHAN.actualProtectedEuro,
    verified: verifiedEuro(CANON_ORPHAN),
    status: "verified",
  },
  {
    displayId: "D-1920",
    locationId: "miami-brickell",
    classLabel: "Labor",
    kind: "protected",
    expected: CANON_LABOR.expectedProtectedEuro,
    observed: CANON_LABOR.actualProtectedEuro,
    verified: verifiedEuro(CANON_LABOR),
    status: "verified",
  },
  {
    displayId: "D-4410",
    locationId: "barcelona-eixample",
    classLabel: "Perishable revenue",
    kind: "created",
    expected: CANON_CREATED.expectedProtectedEuro,
    observed: CANON_CREATED.actualProtectedEuro,
    verified: verifiedEuro(CANON_CREATED),
    status: "verified",
  },
  {
    displayId: "D-6671",
    locationId: "tokyo-shibuya",
    classLabel: "Perishable revenue",
    kind: "recovered",
    expected: CANON_TABLE.expectedProtectedEuro,
    observed: CANON_TABLE.actualProtectedEuro,
    verified: verifiedEuro(CANON_TABLE),
    status: "verified",
  },
  {
    displayId: "D-5208",
    locationId: "nyc-soho",
    classLabel: "Labor",
    kind: "avoided",
    expected: CANON_PLAYBOOK.expectedProtectedEuro,
    observed: CANON_PLAYBOOK.actualProtectedEuro,
    verified: verifiedEuro(CANON_PLAYBOOK),
    status: "closed",
  },
];

export const GROUP_LEDGER_THIS_MONTH = GROUP_LEDGER.filter(
  (r) => r.status === "verified",
);

export function locationLabel(id: LocationId): string {
  const name = LOCATION_BY_ID[id]?.name;
  if (name) return name;
  if (String(id).startsWith("loc_")) {
    return String(id)
      .slice(4)
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return String(id);
}

export function needsYouForLocation(locationId: LocationId | "all") {
  if (locationId === "all") return [...GROUP_NEEDS_YOU];
  return GROUP_NEEDS_YOU.filter((d) => d.locationId === locationId);
}

export function handlingForLocation(locationId: LocationId | "all") {
  if (locationId === "all") return [...GROUP_HANDLING];
  return GROUP_HANDLING.filter((d) => d.locationId === locationId);
}

export function ledgerForLocation(locationId: LocationId | "all") {
  if (locationId === "all") return GROUP_LEDGER;
  return GROUP_LEDGER.filter((r) => r.locationId === locationId);
}

export function deriveGroupMetrics() {
  const locationCount = NORTHSTAR_LOCATIONS.length;
  const needsAttention = NORTHSTAR_LOCATIONS.filter(
    (l) => l.status === "needs_attention",
  ).length;
  const withinExpectations = locationCount - needsAttention;
  const valueAtRisk = GROUP_NEEDS_YOU.reduce(
    (sum, d) => sum + d.economics.exposed,
    0,
  );
  const verifiedThisMonth = GROUP_LEDGER_THIS_MONTH.reduce(
    (sum, r) => sum + r.verified,
    0,
  );
  const byClass = {
    supplierAp: GROUP_LEDGER_THIS_MONTH.filter(
      (r) => r.classLabel === "Supplier / AP",
    ).reduce((s, r) => s + r.verified, 0),
    labor: GROUP_LEDGER_THIS_MONTH.filter((r) => r.classLabel === "Labor").reduce(
      (s, r) => s + r.verified,
      0,
    ),
    perishable: GROUP_LEDGER_THIS_MONTH.filter(
      (r) => r.classLabel === "Perishable revenue",
    ).reduce((s, r) => s + r.verified, 0),
  };

  return {
    locationCount,
    needsAttention,
    withinExpectations,
    locationsReporting: locationCount,
    valueAtRisk,
    verifiedThisMonth,
    byClass,
    reportingCurrency: NORTHSTAR_ORG.reportingCurrency,
    disclosure: "DEMO · Group estate · illustrative · not customer results" as const,
  };
}

export const GROUP_METRICS = deriveGroupMetrics();

export function euro(amount: number): string {
  return formatDecisionMoney(amount);
}

export const ROUTINE_SIGNALS_SUPPRESSED = 147;
