/**
 * Glance UX - zero-reading operating mode.
 * Same underlying data · role-compressed surface · max 3 primary signals.
 */

import type { RoleView } from "@/lib/product/types";
import type { ServicePhase } from "@/lib/radr/servicePhase";

export type GlanceTone = "ready" | "watch" | "critical" | "neutral" | "money";

export type GlanceActionKind =
  | "plan"
  | "hosp"
  | "menu"
  | "live"
  | "decision"
  | "revenue"
  | "none";

/** Visual / ranking category for priority queue. */
export type GlanceKind = "safety" | "recovery" | "commercial" | "ops" | "context";

export type GlanceSignal = {
  id: string;
  label: string;
  /** Large state line - restaurant language. */
  state: string;
  /** Optional single number emphasis. */
  number?: string;
  /** Economic or operational impact line. */
  impact?: string;
  /** Deadline / arrival / window. */
  deadline?: string;
  /**
   * Short causal reason - always show on Level 1.
   * Prefer this over `context` for new copy.
   */
  why?: string;
  /** @deprecated Prefer `why` - kept as fallback for older compose paths. */
  context?: string;
  actionLabel?: string;
  action: GlanceActionKind;
  tone: GlanceTone;
  kind?: GlanceKind;
  /** Ranking weight - higher first (safety >> recovery >> money). */
  rankWeight?: number;
  /** Live recovery drawer target. */
  opportunityId?: string;
};

export type GlanceContextMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type GlanceContextSection = {
  label: string;
  lines: string[];
};

export type GlanceContextPanel = {
  title: string;
  metrics: GlanceContextMetric[];
  sections: GlanceContextSection[];
  next?: { when: string; label: string } | null;
  ctaLabel?: string;
  ctaAction?: GlanceActionKind;
};

export type GlanceBrief = {
  role: RoleView;
  phase: ServicePhase;
  kicker: string;
  /** Under 3 seconds: what needs attention. */
  headline: string;
  /** Covers · countdown - not issue recount. */
  meta: string | null;
  minutesToOpen: number | null;
  primary: GlanceSignal[];
  secondary: GlanceSignal[];
  readyLine: string | null;
  /** Compact status strip - optional. */
  strip: {
    id: string;
    label: string;
    state: string;
    tone: GlanceTone;
    why?: string;
  }[];
  contextPanel: GlanceContextPanel | null;
};

export type GlanceComposeInput = {
  role: RoleView;
  phase: ServicePhase;
  locationName: string;
  expectedCovers: number;
  expectedWalkIns: number;
  projectedRevenue: number;
  expectedContribution: number;
  peakLabel: string;
  terraceOpen: boolean;
  terraceNet: number | null;
  menuPortionsLeft: number;
  menuPortionsExpected: number;
  menuRunOutBy: string;
  menuContributionAtRisk: number;
  menuSourcingNet: number;
  staffingAtRisk: number;
  staffingWindow: string;
  allergyTables: number;
  allergyUnconfirmed: number;
  allergyKitchenPending: number;
  allergyLines: { table: string; time: string; label: string }[];
  birthdays: number;
  engagements: number;
  anniversaries: number;
  quietRequests: number;
  terraceRequests: number;
  privateDining: number;
  returningGuests: number;
  liveSales?: number;
  livePacePct?: number;
  verifiedValue?: number;
  recoverable?: number;
  groupReady?: number;
  groupNeedAttention?: number;
  groupAtRisk?: number;
  groupExposure?: number;
  /** Minutes until service open (pre-shift). */
  minutesToOpen?: number | null;
};
