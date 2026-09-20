/**
 * Marketing navigation — Platform architecture + Where value leaks.
 * Problem classes are NOT primary products.
 */

export type DropLink = {
  href: string;
  key: string;
};

export type PlatformColumn = {
  key: "how" | "surfaces" | "trust";
  items: DropLink[];
};

export const PLATFORM_COLUMNS: PlatformColumn[] = [
  {
    key: "how",
    items: [
      { href: "/product", key: "decision" },
      { href: "/product/futures", key: "futures" },
      { href: "/product/actions", key: "actions" },
      { href: "/product/value", key: "verifiedValue" },
      { href: "/product/memory", key: "memory" },
    ],
  },
  {
    key: "surfaces",
    items: [
      { href: "/product/control-center", key: "controlCenter" },
      { href: "/product/decisions", key: "decisions" },
      // Floor demoted from primary Platform nav until frontline depth matches (Option A).
      { href: "/product/value", key: "value" },
      { href: "/product/memory", key: "memorySurface" },
    ],
  },
  {
    key: "trust",
    items: [
      { href: "/product#autopilot", key: "autopilot" },
      { href: "/security", key: "policies" },
      { href: "/product#evidence", key: "evidence" },
      { href: "/product/value", key: "verification" },
    ],
  },
];

export const PLATFORM_DEFAULT_PREVIEW = "decision" as const;

export const PRODUCT_LINKS: DropLink[] = PLATFORM_COLUMNS.flatMap((c) => c.items);

export function platformColumnForItem(
  itemKey: string,
): PlatformColumn["key"] | null {
  for (const col of PLATFORM_COLUMNS) {
    if (col.items.some((item) => item.key === itemKey)) return col.key;
  }
  return null;
}

export function platformHrefForItem(itemKey: string): string {
  for (const col of PLATFORM_COLUMNS) {
    const hit = col.items.find((item) => item.key === itemKey);
    if (hit) return hit.href;
  }
  return "/product";
}

/** Five economic intelligence classes — context, not modules. */
export const VALUE_LEAK_CLASSES: DropLink[] = [
  { href: "/solutions#supplier-ap", key: "supplier" },
  { href: "/solutions#reconciliation", key: "reconciliation" },
  { href: "/solutions#cost-variance", key: "cost" },
  { href: "/solutions#procurement", key: "procurement" },
  { href: "/solutions#perishable", key: "perishable" },
];

/** Path + hash for next-intl Link (hash must not be stripped). */
export const VALUE_LEAK_HREF = {
  supplier: { pathname: "/solutions" as const, hash: "supplier-ap" },
  reconciliation: { pathname: "/solutions" as const, hash: "reconciliation" },
  cost: { pathname: "/solutions" as const, hash: "cost-variance" },
  procurement: { pathname: "/solutions" as const, hash: "procurement" },
  perishable: { pathname: "/solutions" as const, hash: "perishable" },
} as const;

export const VALUE_LEAK_DEEPER: DropLink[] = [
  { href: "/solutions#lenses", key: "lenses" },
];

/** @deprecated — demoted lenses; keep for deep links */
export const SOLUTIONS_BY_PRIORITY: DropLink[] = [
  { href: "/solutions/buy", key: "buy" },
  { href: "/solutions/labor", key: "labor" },
  { href: "/solutions/sell", key: "sell" },
  { href: "/solutions/recover", key: "recover" },
];

export const SOLUTIONS_BY_OPERATION: DropLink[] = [
  { href: "/industries#intelligence-restaurants", key: "independent" },
  { href: "/industries#intelligence-hotels", key: "hotels" },
  { href: "/industries#intelligence-apartments", key: "apartments" },
  { href: "/industries#intelligence-groups", key: "groups" },
];

export const SOLUTIONS_TERRITORIES = [
  { n: "01", href: "/solutions/buy", label: "BUY", key: "buy" },
  { n: "02", href: "/solutions/labor", label: "LABOR", key: "labor" },
  { n: "03", href: "/solutions/sell", label: "SELL", key: "sell" },
  { n: "04", href: "/solutions/recover", label: "RECOVER", key: "recover" },
] as const;

export const COMPANY_LINKS: DropLink[] = [
  { href: "/company", key: "about" },
  { href: "/why", key: "why" },
  { href: "/blog", key: "blog" },
  { href: "/security", key: "security" },
  { href: "/developers", key: "developers" },
  { href: "/contact", key: "contact" },
];

export const COMPANY_PRIMARY = COMPANY_LINKS;
export const COMPANY_SECONDARY: DropLink[] = COMPANY_LINKS;
