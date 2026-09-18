/**
 * Canonical marketing brand / category / CTA vocabulary.
 * Monday SKU = Margin & Recovery Intelligence (Round 2).
 */

export const CATEGORY = {
  /** Primary public category — Margin & Recovery D0 */
  primary: "Find the margin you’re losing — and prove you got it back.",
  /** Secondary descriptor */
  secondary: "Margin & Recovery Intelligence.",
  /** Technical / enterprise supporting concept */
  systemOfRecord: "A system of decision record for hospitality.",
  /** Product position */
  decisionLayer: "The decision layer across the hospitality operation.",
  slogan: "Find the margin you’re losing — and prove you got it back.",
  /**
   * Named category gap — use on /why (major) and lightly on /product.
   * Not the homepage lead.
   */
  decisionGap: "The Decision Gap",
  decisionGapDefinition:
    "The gap between what your systems know and what your operation decides.",
} as const;

export const CTAS = {
  primaryProduct: "Start a 14-day margin recovery pilot",
  primaryProductHref: "/contact?intent=margin-recovery-pilot",
  primarySales: "Start a 14-day margin recovery pilot",
  secondaryProduct: "See one variance → Trace",
  secondaryProductHref: "/app/lab/control-center?seed=recover",
  enterprise: "Talk to RADR",
  openTrace: "Open Trace",
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
  siteTitle: "RADR — Margin & Recovery Intelligence",
  ogDefault:
    "Find the margin you’re losing — and prove you got it back. Auditable recovery on the stack you already run.",
} as const;
