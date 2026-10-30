/**
 * Public website product-truth SSOT (copy only — visual freeze).
 * Aligns marketing demos with DemoEstateRegistry / product heroes.
 *
 * Do not invent parallel city sets or Decision economics on public pages.
 */

export const PUBLIC_POSITIONING = {
  category: "The operating intelligence system for hospitality",
  shortPromise:
    "RADR doesn’t tell hospitality operators what happened. It helps run what happens next.",
  systemsLine:
    "Systems of record store facts. RADR helps turn them into decisions.",
  onePlatform: "One platform. Configured to your operation.",
  intelligenceNotProperty:
    "RADR standardizes the intelligence, not the property.",
  livePrinciple: "RADR models the operation, not the building.",
  recoveryWedge:
    "Recovery is where customers can start. It is not where RADR ends.",
  groupReporting: "GROUP REPORTING · USD",
} as const;

/** Public system loop (compressed). */
export const PUBLIC_LOOP = [
  { id: "observe", label: "Observe" },
  { id: "understand", label: "Understand" },
  { id: "decide", label: "Decide" },
  { id: "act", label: "Act" },
  { id: "verify", label: "Verify" },
  { id: "learn", label: "Learn" },
] as const;

/** Autonomy ladder — public wording (0–5). */
export const PUBLIC_AUTONOMY = [
  { level: 0, label: "Observe" },
  { level: 1, label: "Explain" },
  { level: 2, label: "Prepare" },
  { level: 3, label: "Recommend / request approval" },
  { level: 4, label: "Execute within policy" },
  { level: 5, label: "Execute + verify within policy" },
] as const;

export const PUBLIC_PROGRESSION = [
  "Recover",
  "Prevent",
  "Optimize",
  "Governed execution",
] as const;

/** Canonical Restaurant public story. */
export const PUBLIC_RESTAURANT = {
  id: "loc_berlin_mitte",
  name: "Soho",
  displayName: "Soho · New York",
  city: "New York",
  district: "Soho",
  service: "Dinner",
  clock: "19:48",
  /** Service + clock only — never restate displayName */
  clockLine: "Dinner · 19:48",
  /** Full single-line context when needed alone */
  contextLine: "Soho · New York · Dinner · 19:48",
  currency: "USD" as const,
  currencySymbol: "$",
  decisionId: "D-1911",
  decisionKey: "dec_peak_berlin",
  actionShort: "WAIT 12 MINUTES",
  actionLabel: "Pace next seating wave · 12 min",
  actionCompact: "PACE SEATING · 12 MIN",
  expectedIncremental: 620,
  expectedFormatted: "+$620",
  verifiedProtected: 590,
  verifiedFormatted: "$590",
  confidencePct: 82,
  situation:
    "Demand ahead of plan. Kitchen becomes the constraint.",
} as const;

/** Canonical Hotel public story. */
export const PUBLIC_HOTEL = {
  id: "loc_canal_house",
  name: "Mercer House",
  displayName: "Mercer House · New York",
  city: "New York",
  service: "Check-in wave",
  clock: "14:20",
  clockLine: "Check-in wave · 14:20",
  contextLine: "Mercer House · New York · Check-in wave · 14:20",
  currency: "USD" as const,
  currencySymbol: "$",
  actionShort: "REASSIGN HOUSEKEEPING",
  actionLabel: "Reassign housekeeping · 2 rooms",
  expectedFormatted: "+$1,840",
  exposureFormatted: "$1,840",
} as const;

/** Canonical Supplier / AP public proof (D-4102) — same numbers, NYC local USD. */
export const PUBLIC_SUPPLIER = {
  displayId: "D-4102",
  location: PUBLIC_RESTAURANT.displayName,
  contractRate: 6.8,
  invoiceRate: 7.45,
  volumeL: 420,
  verified: 273,
  contractFormatted: "$6.80/L",
  invoiceFormatted: "$7.45/L",
  exposureFormatted: "$273",
  verifiedFormatted: "$273",
  varianceFormatted: "$0.65/L",
} as const;

export const PUBLIC_RESTAURANT_ESTATE = [
  "New York · Soho",
  "Los Angeles · West Hollywood",
  "Mexico City · Roma Norte",
  "São Paulo · Jardins",
  "London · Soho",
  "Dubai · DIFC",
  "Singapore · Tanjong Pagar",
  "Tokyo · Shibuya",
  "Hong Kong · Central",
  "Sydney · Surry Hills",
] as const;

export const PUBLIC_HOTEL_ESTATE = [
  "Mercer House · New York",
  "Sunset House · Los Angeles",
  "Polanco House · Mexico City",
  "Shoreditch House · London",
  "Downtown House · Dubai",
  "Marina House · Singapore",
  "Shinjuku House · Tokyo",
  "Harbour House · Hong Kong",
  "Surry House · Sydney",
  "Waterfront House · Cape Town",
] as const;

/**
 * Operating pulse / ticker — ILLUSTRATIVE RADR SIGNALS only.
 * No sealed recovery totals that read as live customer outcomes.
 */
export const PUBLIC_PULSE_ROWS = [
  {
    id: "soho",
    text: "SOHO · NEW YORK · KITCHEN PRESSURE RISING",
  },
  {
    id: "mercer",
    text: "MERCER HOUSE · NEW YORK · 7 ARRIVALS AT RISK",
  },
  {
    id: "tokyo",
    text: "TOKYO · FORECAST UPDATED",
  },
  {
    id: "dubai",
    text: "DUBAI · PMS FEED HEALTHY",
  },
  {
    id: "singapore",
    text: "SINGAPORE · PICKUP ABOVE EXPECTATION",
  },
  {
    id: "london",
    text: "LONDON · SERVICE PACE WATCHING",
  },
] as const;

/** Global demo markets — architecture contexts, not customers. */
export const PUBLIC_DEMO_MARKETS = [
  {
    city: "New York",
    region: "USA",
    currency: "USD",
    daypart: "Dinner",
    clock: "19:48",
    grammar: "Restaurant service",
  },
  {
    city: "Los Angeles",
    region: "USA",
    currency: "USD",
    daypart: "Lunch",
    clock: "12:22",
    grammar: "Multi-venue F&B",
  },
  {
    city: "London",
    region: "UK",
    currency: "GBP",
    daypart: "Evening",
    clock: "20:05",
    grammar: "Hotel arrival wave",
  },
  {
    city: "Dubai",
    region: "UAE",
    currency: "AED",
    daypart: "Late night",
    clock: "23:40",
    grammar: "Late service",
  },
  {
    city: "Singapore",
    region: "SG",
    currency: "SGD",
    daypart: "Lunch",
    clock: "13:10",
    grammar: "Mixed portfolio",
  },
  {
    city: "Tokyo",
    region: "JP",
    currency: "JPY",
    daypart: "Breakfast",
    clock: "08:48",
    grammar: "Breakfast service",
  },
  {
    city: "Hong Kong",
    region: "HK",
    currency: "HKD",
    daypart: "Dinner",
    clock: "19:15",
    grammar: "Urban hotel",
  },
  {
    city: "Sydney",
    region: "AU",
    currency: "AUD",
    daypart: "Lunch",
    clock: "12:55",
    grammar: "Waterfront F&B",
  },
] as const;

export function publicMoney(
  amount: number,
  opts?: { sign?: boolean; compact?: boolean },
): string {
  const abs = Math.abs(amount);
  const sign =
    opts?.sign === false ? "" : amount > 0 ? "+" : amount < 0 ? "−" : "";
  if (opts?.compact && abs >= 1000) {
    const k = abs / 1000;
    const body =
      abs >= 10_000
        ? `${Math.round(k)}k`
        : `${k.toFixed(1).replace(/\.0$/, "")}k`;
    return `${sign}$${body}`;
  }
  const grouped = Math.round(abs)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}`;
}
