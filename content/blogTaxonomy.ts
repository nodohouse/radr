/**
 * Blog editorial taxonomy — not product categories.
 * Articles discuss concepts; they must not redefine RADR's primary category.
 */

export const BLOG_CATEGORIES = [
  "DECISIONS",
  "INTELLIGENCE",
  "ECONOMICS",
  "OPERATIONS",
  "VERIFIED VALUE",
  "OPERATING MEMORY",
  "ENGINEERING / DATA",
  "HOSPITALITY",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_EDITORIAL_FRAMING = "Operating judgment, written down." as const;

/** Patterns that redefine RADR as a competing primary category — fail CI. */
export const BLOG_FORBIDDEN_PRIMARY_CATEGORY_CLAIMS = [
  /RADR is Verified Decision Intelligence for hospitality/i,
  /RADR is an? AI Operating System/i,
  /RADR is (an? )?Decision OS/i,
  /RADR is (an? )?Operating Twin/i,
] as const;
