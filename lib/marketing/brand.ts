/**
 * Canonical public category hierarchy — ONE set of labels.
 *
 * Commercial entry: Margin recovery / reconciliation
 * Customer-facing: The decision layer for hospitality
 * Investor / long-term: System of Decision Record for hospitality
 *
 * Other phrases are descriptors only — never competing categories.
 */

export const CATEGORY = {
  /** Commercial entry — GTM / pilot language */
  commercialEntry: "Margin recovery / reconciliation.",
  /** Primary customer-facing platform language */
  primary: "Hospitality Operating Intelligence.",
  /** Long-term / investor diligence language — use sparingly */
  systemOfDecisionRecord: "System of Decision Record for hospitality.",
  /** Alias for gradual migration */
  systemOfRecord: "System of Decision Record for hospitality.",
  /** Supporting descriptor — not a second category */
  secondary: "Systems record. RADR decides.",
  /** Locked homepage hero slogan */
  slogan: "NOTHING OFF THE RADR.",
  sloganLines: ["NOTHING", "OFF THE RADR."] as const,
  heroSupport: [
    "See what needs attention.",
    "Understand what happens next.",
    "Prove what worked.",
  ] as const,
  heroCategoryLine:
    "RADR connects hospitality operations, turns signals into decisions, and tracks what happened next.",
  decisionGap: "The Decision Gap",
  decisionGapDefinition:
    "The gap between what your systems know and what your operation decides.",
  /** Supporting descriptor — prefer CATEGORY.primary for public hero */
  decisionLayer: "The decision layer for hospitality.",
  /** Descriptor only — never equal category */
  verifiedDecisionIntelligence: "Verified Decision Intelligence",
  /** Descriptor only — never equal category */
  adaptiveDecisionSystem: "Adaptive Decision System",
} as const;

export const CTAS = {
  /** Paid product entry — signup, not a free recovery pilot */
  primaryProduct: "Get started",
  primaryProductHref: "/signup",
  primarySales: "Talk to sales",
  primarySalesHref: "/contact?intent=sales",
  /** Public Verified Recovery story — never /app */
  secondaryProduct: "See a Verified Recovery",
  secondaryProductHref: "/product/value",
  /** Unlock demo after signup */
  seeInAction: "See RADR in action",
  seeInActionHref: "/signup?intent=demo&next=/app/enter",
  talkToRadr: "Talk to RADR",
  talkToRadrHref: "/contact?intent=sales",
  enterprise: "Talk to sales",
  openTrace: "Open Trace",
  compareFutures: "Compare Futures",
  compareFuturesHref: "/product/futures?example=D-1911",
  seeVerified: "See Verified Value",
  openBrief: "Open Control Center",
  viewConnectionStatus: "View connection status",
} as const;

/** Supporting line — use sparingly on Decision / demo surfaces */
export const JUDGMENT_LINE =
  "Your team knows the operation. RADR connects what no one person can see at once.";

export const BOARD_STACK_ANSWER =
  "Your systems run the work. RADR owns the Decision-to-outcome loop between them.";

export const LIFECYCLE_PUBLIC = [
  "CONNECT",
  "UNDERSTAND",
  "FUTURES",
  "DECIDE",
  "VERIFY",
  "REMEMBER",
] as const;

/** Public Decision-to-outcome loop (differentiation) */
export const DECISION_OUTCOME_LOOP = [
  "EVIDENCE",
  "FINDING",
  "DECISION",
  "FUTURES",
  "OPERATOR CONTEXT",
  "ACTION / APPROVAL",
  "OBSERVED",
  "VERIFIED",
  "MEMORY",
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

/** First ICP — commercial journey focus */
export const FIRST_ICP = {
  label: "Multi-location hospitality / F&B group",
  sponsors: "Finance · COO · Procurement",
} as const;

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
  siteTitle: "RADR — The decision layer for hospitality",
  ogDefault:
    "Recover the value your operation is losing — and prove you got it back.",
} as const;

export const PILOT_SUCCESS_MEASURES = [
  "Economically material findings",
  "Evidence accepted by Finance",
  "Cases actioned",
  "Verified outcomes where settlement completes",
  "Time saved",
  "Time to first Decision",
] as const;
