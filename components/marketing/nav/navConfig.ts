/**
 * Marketing navigation — Platform = Decision lifecycle surfaces.
 */

export type DropLink = {
  href: string;
  key: string;
};

export type PlatformColumn = {
  key: "decide" | "prove" | "act" | "learn";
  items: DropLink[];
};

export const PLATFORM_COLUMNS: PlatformColumn[] = [
  {
    key: "decide",
    items: [
      { href: "/product", key: "overview" },
      { href: "/product/decisions", key: "decisions" },
      { href: "/product/control-center", key: "controlCenter" },
      { href: "/product/futures", key: "futures" },
    ],
  },
  {
    key: "prove",
    items: [{ href: "/product/value", key: "verifiedValue" }],
  },
  {
    key: "act",
    items: [{ href: "/product/actions", key: "actions" }],
  },
  {
    key: "learn",
    items: [
      { href: "/product/memory", key: "memory" },
      { href: "/developers", key: "developers" },
    ],
  },
];

export const PLATFORM_DEFAULT_PREVIEW = "decisions" as const;

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
