/** Static blog catalog - SEO surfaces for humans and AI crawlers. */

export type BlogSlug =
  | "credits-flagged-never-cashed"
  | "the-decision-gap"
  | "what-is-hospitality-margin-intelligence"
  | "multi-location-hospitality-control"
  | "hospitality-recovery-and-leakage"
  | "peak-service-understaffed"
  | "supplier-price-variance"
  | "what-verified-value-means"
  | "ask-radr-operating-evidence";

export type BlogPostKey =
  | "creditsFlagged"
  | "whyWeExist"
  | "marginIntelligence"
  | "multiLocation"
  | "recovery"
  | "understaffed"
  | "supplierVariance"
  | "verifiedValue"
  | "askRadr";

export type BlogPostMeta = {
  slug: BlogSlug;
  /** Key under blog.posts.* */
  key: BlogPostKey;
  date: string;
  /** Set when the article was materially rewritten for current architecture */
  updated?: string;
  /** Approximate reading time for UI + schema */
  readingMinutes: number;
  /** Territory / topic for filters and nav */
  territory: "ALL" | "BUY" | "LABOR" | "SELL" | "RECOVER" | "VALUE";
  /** Featured on index */
  featured?: boolean;
  noindex?: boolean;
};

/** Newest first. Featured = credits-flagged-never-cashed. */
export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "credits-flagged-never-cashed",
    key: "creditsFlagged",
    date: "2026-09-18",
    updated: "2026-09-18",
    readingMinutes: 6,
    territory: "RECOVER",
    featured: true,
  },
  {
    slug: "the-decision-gap",
    key: "whyWeExist",
    date: "2026-09-17",
    updated: "2026-09-17",
    readingMinutes: 14,
    territory: "ALL",
  },
  {
    slug: "what-is-hospitality-margin-intelligence",
    key: "marginIntelligence",
    date: "2026-08-28",
    updated: "2026-09-17",
    readingMinutes: 7,
    territory: "ALL",
  },
  {
    slug: "multi-location-hospitality-control",
    key: "multiLocation",
    date: "2026-08-22",
    updated: "2026-09-17",
    readingMinutes: 6,
    territory: "ALL",
  },
  {
    slug: "hospitality-recovery-and-leakage",
    key: "recovery",
    date: "2026-08-18",
    updated: "2026-09-17",
    readingMinutes: 7,
    territory: "RECOVER",
  },
  {
    slug: "peak-service-understaffed",
    key: "understaffed",
    date: "2026-08-12",
    updated: "2026-09-17",
    readingMinutes: 7,
    territory: "LABOR",
  },
  {
    slug: "supplier-price-variance",
    key: "supplierVariance",
    date: "2026-08-05",
    updated: "2026-09-17",
    readingMinutes: 7,
    territory: "BUY",
  },
  {
    slug: "what-verified-value-means",
    key: "verifiedValue",
    date: "2026-07-28",
    updated: "2026-09-17",
    readingMinutes: 6,
    territory: "VALUE",
  },
  {
    slug: "ask-radr-operating-evidence",
    key: "askRadr",
    date: "2026-07-18",
    updated: "2026-09-17",
    readingMinutes: 5,
    territory: "ALL",
  },
];

export function getBlogPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedBlogPost(): BlogPostMeta {
  return BLOG_POSTS[0]!;
}

/** Posts shown in Resources mega (after featured). */
export function getResourcesBlogPosts(limit = 4): BlogPostMeta[] {
  return BLOG_POSTS.slice(0, limit);
}

export function blogPath(slug: BlogSlug): `/blog/${BlogSlug}` {
  return `/blog/${slug}`;
}
