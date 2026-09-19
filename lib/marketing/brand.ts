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
  primary: "The decision layer for hospitality.",
  /** Long-term / investor diligence language — use sparingly */
  systemOfDecisionRecord: "System of Decision Record for hospitality.",
  /** Alias for gradual migration */
  systemOfRecord: "System of Decision Record for hospitality.",
  /** Supporting descriptor — not a second category */
  secondary: "Systems record. RADR decides.",
  slogan: "Nothing off the RADR.",
  decisionGap: "The Decision Gap",
  decisionGapDefinition:
    "The gap between what your systems know and what your operation decides.",
  /** Alias of primary — prefer CATEGORY.primary */
  decisionLayer: "The decision layer for hospitality.",
  /** Descriptor only — never equal category */
  verifiedDecisionIntelligence: "Verified Decision Intelligence",
  /** Descriptor only — never equal category */
  adaptiveDecisionSystem: "Adaptive Decision System",
} as const;

export const CTAS = {
  primaryProduct: "Start a recovery pilot",
  primaryProductHref: "/contact?intent=recovery-pilot",
  primarySales: "Start a recovery pilot",
  secondaryProduct: "See a Verified Recovery",
  secondaryProductHref: "/app/lab/control-center?seed=recover",
  enterprise: "Talk to RADR",
  openTrace: "Open Trace",
  compareFutures: "Compare Futures",
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
