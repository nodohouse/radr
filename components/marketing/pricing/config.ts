/** Central RADR pricing configuration. */

export const pricingConfig = {
  free: {
    id: "free" as const,
    name: "RADR Free",
    price: 0,
    priceLabel: "€0",
    locationLimit: 1,
    userLimit: 1,
    documentLimit: 10,
    historyDays: 30,
    cta: { href: "/signup", label: "Start free" },
    noCardRequired: true,
    purpose: "TRY RADR.",
  },
  control: {
    id: "control" as const,
    name: "RADR Control",
    price: 199,
    priceLabel: "€199",
    unit: "per location / month" as const,
    cta: { href: "/signup", label: "Start Control" },
    purpose: "PUT RADR TO WORK.",
  },
  scale: {
    id: "scale" as const,
    name: "RADR Scale",
    price: null,
    priceLabel: "Custom",
    cta: { href: "/signup", label: "Talk to RADR" },
    purpose: "RADR ACROSS THE GROUP.",
  },
  billingLive: false,
} as const;

export type StatusTag = "live" | "early" | "next" | "not";

export type CompareRow = {
  feature: string;
  free: StatusTag;
  control: StatusTag;
  scale: StatusTag;
};

/** Short comparison — honest availability. */
export const compareRows: CompareRow[] = [
  { feature: "Locations", free: "live", control: "live", scale: "live" },
  { feature: "Evidence upload", free: "live", control: "live", scale: "live" },
  { feature: "Private storage", free: "live", control: "live", scale: "live" },
  { feature: "File ingestion", free: "live", control: "live", scale: "live" },
  { feature: "Basic margin checks", free: "early", control: "early", scale: "early" },
  { feature: "Cases / decisions", free: "not", control: "early", scale: "early" },
  { feature: "Money owed tracking", free: "not", control: "early", scale: "early" },
  { feature: "Procurement control", free: "not", control: "next", scale: "next" },
  { feature: "Payout reconciliation", free: "not", control: "next", scale: "next" },
  { feature: "Controls library", free: "not", control: "next", scale: "next" },
  { feature: "Multi-location control room", free: "not", control: "not", scale: "next" },
];

export const faqItems = [
  {
    q: "Can I try RADR without paying?",
    a: "Yes. Free includes 1 location, 1 user, and 10 documents total. No credit card required.",
  },
  {
    q: "Is Control priced per user or per location?",
    a: `${pricingConfig.control.priceLabel} ${pricingConfig.control.unit}. Team access is included in the Control model — not sold per seat.`,
  },
  {
    q: "Does RADR block payments or contact suppliers?",
    a: "No. RADR flags mismatches for human review. It does not move money or contact suppliers without you.",
  },
  {
    q: "What is available now vs coming next?",
    a: "Available now: document upload, private storage, organization isolation, and early margin checks. Cases, money-owed tracking, procurement control and payout reconciliation expand as Early Access / Coming Next — we do not sell unfinished capability as live.",
  },
  {
    q: "Can I use RADR across multiple locations?",
    a: "Bill Control per location, or Talk to RADR for Scale — multi-location control room and group workflows.",
  },
  {
    q: "Is there annual pricing?",
    a: "Not yet. Monthly for now.",
  },
] as const;

export type DemoId = "suppliers" | "credits" | "services" | "delivery";

export const controlDemos: {
  id: DemoId;
  label: string;
  context: string;
  status: "Example" | "Building";
  rows: { label: string; value: string; signal?: boolean }[];
  outcome: { label: string; value: string; sub: string };
  punch?: string;
}[] = [
  {
    id: "suppliers",
    label: "Suppliers",
    context: "Olive oil · supplier agreement",
    status: "Example",
    rows: [
      { label: "Agreed", value: "€6.80 / L" },
      { label: "Invoiced", value: "€7.45 / L", signal: true },
      { label: "Monthly volume", value: "420 L" },
    ],
    outcome: {
      label: "Potential monthly impact",
      value: "€273",
      sub: "Requires review",
    },
  },
  {
    id: "credits",
    label: "Credits",
    context: "Supplier credit promised",
    status: "Example",
    rows: [
      { label: "Promised", value: "€481.20" },
      { label: "Expected by", value: "14 days" },
      { label: "Matching credit", value: "Not found", signal: true },
      { label: "Outstanding", value: "27 days", signal: true },
    ],
    outcome: {
      label: "Still outstanding",
      value: "€481.20",
      sub: "Requires review",
    },
  },
  {
    id: "services",
    label: "Services",
    context: "Night cleaning · agreement",
    status: "Example",
    rows: [
      { label: "Expected visits", value: "22" },
      { label: "Invoiced", value: "26", signal: true },
      { label: "Rate", value: "€185 / visit" },
    ],
    outcome: {
      label: "Requires review",
      value: "€740",
      sub: "+4 visits",
    },
  },
  {
    id: "delivery",
    label: "Delivery apps",
    context: "Platform payout · Week 32",
    status: "Building",
    rows: [
      { label: "Gross sales", value: "€18,420" },
      { label: "Refunds", value: "−€436" },
      { label: "Discounts", value: "−€1,284" },
      { label: "Fees", value: "−€4,912" },
      { label: "Adjustments", value: "−€218" },
      { label: "Expected payout", value: "€11,570" },
      { label: "Actual payout", value: "€11,238", signal: true },
    ],
    outcome: {
      label: "Unexplained difference",
      value: "€332",
      sub: "Requires review · Example · Building",
    },
    punch: "1,000 orders. One payout.",
  },
];

export function formatEuro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function statusLabel(s: StatusTag): string {
  if (s === "live") return "Available now";
  if (s === "early") return "Early access";
  if (s === "next") return "Coming next";
  return "—";
}
