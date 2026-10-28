/** Central RADR pricing configuration. */

export const pricingConfig = {
  free: {
    id: "free" as const,
    name: "Starter",
    price: 1500,
    priceLabel: "$1,500",
    locationLimit: 1,
    userLimit: 1,
    documentLimit: 10,
    historyDays: 30,
    cta: { href: "/contact", label: "Start a pilot" },
    noCardRequired: false,
    purpose: "TRY RADR.",
  },
  control: {
    id: "control" as const,
    name: "Multi-site",
    price: 3500,
    priceLabel: "$3,500",
    unit: "per month, billed annually" as const,
    cta: { href: "/contact", label: "Book a demo" },
    purpose: "PUT RADR TO WORK.",
  },
  scale: {
    id: "scale" as const,
    name: "Enterprise",
    price: null,
    priceLabel: "Custom",
    cta: { href: "/contact", label: "Talk to sales" },
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
  {
    feature: "Basic margin checks",
    free: "early",
    control: "early",
    scale: "early",
  },
  {
    feature: "Cases / decisions",
    free: "not",
    control: "early",
    scale: "early",
  },
  {
    feature: "Money owed tracking",
    free: "not",
    control: "early",
    scale: "early",
  },
  {
    feature: "Procurement control",
    free: "not",
    control: "next",
    scale: "next",
  },
  {
    feature: "Payout reconciliation",
    free: "not",
    control: "next",
    scale: "next",
  },
  { feature: "Controls library", free: "not", control: "next", scale: "next" },
  {
    feature: "Multi-location control room",
    free: "not",
    control: "not",
    scale: "next",
  },
];

export const faqItems = [
  {
    q: "What’s included in each plan?",
    a: "Starter is scoped for one property, Multi-site for up to ten properties, and Enterprise for a tailored portfolio. Implementation scope, available modules and integrations are confirmed before any agreement.",
  },
  {
    q: "How long does implementation take?",
    a: "The timeline depends on your systems, data access and operating scope. We agree a practical plan during onboarding rather than promising a fixed timeline for every operation.",
  },
  {
    q: "What systems can RADR integrate with?",
    a: "We assess your POS, PMS, finance, procurement and labor systems during scoping. Specific connections and their availability are confirmed for your operation.",
  },
  {
    q: "Can I switch plans as my needs change?",
    a: "Talk with RADR about changes in your portfolio and requirements. Any plan changes are agreed as part of your commercial terms.",
  },
  {
    q: "Is there a minimum contract length?",
    a: "Starter is $1,500 per month and Multi-site is $3,500 per month, billed annually. Enterprise terms are tailored. Final contract details are confirmed before signing; online billing is not active.",
  },
  {
    q: "Do you offer training and onboarding?",
    a: "Onboarding and support are scoped around your team, systems and plan. We agree responsibilities, training and support arrangements before getting started.",
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
