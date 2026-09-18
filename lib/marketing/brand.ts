/**
 * Canonical marketing brand / category / CTA vocabulary.
 * One company. One hierarchy. All marketing surfaces should import from here.
 */

export const CATEGORY = {
  /** Primary public category — Recover D0 */
  primary: "Recover money on the stack you already run.",
  /** Secondary descriptor */
  secondary: "Verified Decision Intelligence.",
  /** Technical / enterprise supporting concept */
  systemOfRecord: "A system of decision record for hospitality.",
  /** Product position */
  decisionLayer: "The decision layer across the hospitality operation.",
  slogan: "Recover money on the stack you already run.",
  /**
   * Named category gap — use on /why (major) and lightly on /product.
   * Not the homepage lead.
   */
  decisionGap: "The Decision Gap",
  decisionGapDefinition:
    "The gap between what your systems know and what your operation decides.",
} as const;

export const CTAS = {
  primaryProduct: "Start a 14-day recover pilot",
  /** Recover pilot — contact with intent */
  primaryProductHref: "/contact?intent=recover-pilot",
  primarySales: "Start a 14-day recover pilot",
  secondaryProduct: "See one credit → Trace",
  secondaryProductHref: "/app/lab/control-center?seed=recover",
  enterprise: "Talk to RADR",
  openTrace: "Open Decision Trace",
  compareFutures: "Compare Futures",
  seeVerified: "See Verified Value",
  openBrief: "Open Control Center",
} as const;

/** Supporting line — use sparingly on Decision / demo surfaces */
export const JUDGMENT_LINE =
  "Your team knows the operation. RADR connects what no one person can see at once.";

export const LIFECYCLE_PUBLIC = [
  "CONNECT",
  "UNDERSTAND",
  "FUTURES",
  "DECIDE",
  "VERIFY",
  "REMEMBER",
] as const;

export const LIFECYCLE_SHORT = ["CONNECT", "DECIDE", "VERIFY", "REMEMBER"] as const;

export const VALUE_KINDS_PUBLIC = [
  "RECOVERED",
  "PROTECTED",
  "CREATED",
  "AVOIDED",
] as const;

export const VALUE_STAGES_PUBLIC = [
  "IDENTIFIED",
  "ACTIONABLE",
  "EXPECTED",
  "OBSERVED",
  "VERIFIED",
] as const;

export const VERTICALS_PRIMARY = [
  { id: "restaurant", label: "Restaurants & F&B" },
  { id: "hotel", label: "Hotels & Resorts" },
  { id: "apartment", label: "Serviced Apartments" },
  { id: "group", label: "Multi-location Groups" },
] as const;

export const ACTION_STATES_PUBLIC = [
  "DRAFTED",
  "READY",
  "AWAITING_APPROVAL",
  "APPROVED",
  "EXECUTING",
  "COMPLETED",
  "FAILED",
] as const;

export const SITE_META = {
  siteTitle: "RADR — Recover money on the stack you already run",
  ogDefault:
    "Your AP tools flag credits. RADR helps you cash them — with Trace finance can match to the books.",
} as const;
