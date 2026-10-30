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
    key: "surfaces",
    items: [
      { href: "/product?surface=control", key: "controlCenter" },
      { href: "/product?surface=live", key: "live" },
      { href: "/product?surface=decisions", key: "decisions" },
      { href: "/product?surface=operations", key: "operations" },
      { href: "/product?surface=intelligence", key: "intelligence" },
      { href: "/product?surface=value", key: "value" },
      { href: "/product?surface=memory", key: "memorySurface" },
      { href: "/product?surface=health", key: "dataHealth" },
    ],
  },
  {
    key: "how",
    items: [
      { href: "/product", key: "decision" },
      { href: "/product/futures", key: "futures" },
      { href: "/product/value", key: "verifiedValue" },
      { href: "/product/memory", key: "memory" },
    ],
  },
  {
    key: "trust",
    items: [
      { href: "/security", key: "policies" },
      { href: "/security", key: "evidence" },
      { href: "/product/value", key: "verification" },
    ],
  },
];

export const PLATFORM_DEFAULT_PREVIEW = "controlCenter" as const;

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

/** Five economic leak classes — Solutions mega-nav. */
export const VALUE_LEAK_CLASSES: DropLink[] = [
  { href: "/solutions?leak=supplier", key: "supplier" },
  { href: "/solutions?leak=recon", key: "reconciliation" },
  { href: "/solutions?leak=cost", key: "cost" },
  { href: "/solutions?leak=proc", key: "procurement" },
  { href: "/solutions?leak=perish", key: "perishable" },
];

/** Path + query for next-intl Link. */
export const VALUE_LEAK_HREF = {
  supplier: { pathname: "/solutions" as const, query: { leak: "supplier" } },
  reconciliation: { pathname: "/solutions" as const, query: { leak: "recon" } },
  cost: { pathname: "/solutions" as const, query: { leak: "cost" } },
  procurement: { pathname: "/solutions" as const, query: { leak: "proc" } },
  perishable: { pathname: "/solutions" as const, query: { leak: "perish" } },
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

/** Solutions mega-nav hospitality breadth (not eight unsupported vertical pages). */
export const SOLUTIONS_HOSPITALITY: DropLink[] = [
  { href: "/industries#intelligence-restaurants", key: "restaurants" },
  { href: "/industries#intelligence-hotels", key: "hotels" },
  { href: "/solutions", key: "leaks" },
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
  { href: "/security", key: "security" },
  { href: "/developers", key: "developers" },
  { href: "/contact", key: "contact" },
];

export const COMPANY_PRIMARY = COMPANY_LINKS;
export const COMPANY_SECONDARY: DropLink[] = COMPANY_LINKS;
