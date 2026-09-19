/**
 * Structured Butler intelligence response.
 * UI renders primitives from this shape; tools own all money.
 */

export type ButlerRole = "location_manager" | "regional_manager" | "group_cfo";

export type ButlerContext = {
  locationScope: string;
  period: string;
  role: ButlerRole;
  allowedLocationIds: string[] | "all";
  /** Server-resolved tenant - never trust client for LIVE. */
  organizationId?: string;
  userId?: string;
  page?: string;
  selectedEntityId?: string;
  selectedEntityLabel?: string;
  defaultLocationId?: string;
  comparisonLocationIds?: string[];
  seedQuery?: string;
  /** Operating canvas lens */
  lens?: "operate" | "money" | "risk" | "service";
  /** Operating canvas service time */
  serviceTime?: string;
  selectedFindingId?: string;
};

export type ButlerActionLink = {
  label: string;
  href: string;
};

export type ButlerMetric = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "watch" | "risk" | "signal";
};

export type ButlerDriver = {
  label: string;
  value: string;
  delta?: string;
};

export type ButlerSource = {
  system: string;
  detail: string;
  syncedLabel?: string;
};

export type ButlerWarning = {
  message: string;
  severity: "info" | "watch" | "risk";
};

export type ButlerVizComparisonRow = {
  id: string;
  name: string;
  cells: { key: string; value: string; tone?: ButlerMetric["tone"] }[];
  attention?: "none" | "watch" | "risk";
};

export type ButlerVisualization =
  | {
      type: "metric";
      label: string;
      value: string;
      sublabel?: string;
    }
  | {
      type: "breakdown";
      rows: { label: string; value: string; amount?: number; tone?: ButlerMetric["tone"] }[];
      totalLabel?: string;
      totalValue?: string;
    }
  | {
      type: "comparison";
      columns: string[];
      rows: ButlerVizComparisonRow[];
      footnote?: string;
    }
  | {
      type: "heatmap";
      columns: string[];
      rows: { label: string; cells: ("low" | "mid" | "high" | "none")[] }[];
      footnote?: string;
    }
  | {
      type: "reservationPulse";
      peakLabel: string;
      slots: { time: string; intensity: number }[];
    }
  | {
      type: "demandCapacity";
      times: string[];
      demand: number[];
      capacity: number[];
      gapLabel: string;
      peakGap: number;
    }
  | {
      type: "marginBridge";
      planPct: number;
      actualPct: number;
      steps: { label: string; pts: number }[];
    }
  | {
      type: "sparkline";
      points: number[];
      label?: string;
    }
  | {
      type: "table";
      columns: string[];
      rows: string[][];
    };

export type ButlerResponseKind =
  | "executive_summary"
  | "staffing_requirement"
  | "labor_cost"
  | "reservation_pulse"
  | "waitlist"
  | "cancellation_recovery"
  | "margin_analysis"
  | "channel_economics"
  | "active_revenue"
  | "revenue_analysis"
  | "location_comparison"
  | "supplier_variance"
  | "forecast"
  | "guest_value"
  | "hospitality_safety"
  | "verified_value"
  | "provenance"
  | "data_health"
  | "clarification"
  | "term"
  | "generic";

export type ButlerRecommendation = {
  title: string;
  detail?: string;
  costLabel?: string;
  costValue?: string;
  protectLabel?: string;
  protectValue?: string;
  href?: string;
};

export type ButlerPendingWrite = {
  kind: string;
  summary: string;
  details: { label: string; value: string }[];
};

export type ButlerTopic =
  | "attention"
  | "location_risk"
  | "labor"
  | "reservations"
  | "waitlist"
  | "cancellations"
  | "table14"
  | "verified_value"
  | "exposure_breakdown"
  | "amsterdam"
  | "zuid"
  | "supplier"
  | "forecast"
  | "term"
  | "action"
  | "general"
  | "command";

export type ButlerSession = {
  topic?: ButlerTopic;
  locationId?: string;
  locationName?: string;
  findingId?: string;
  lastQuery?: string;
  history: { query: string; title: string; at: string }[];
};

export type ButlerResponse = {
  title: string;
  summary: string;
  /** Legacy / search-compat string */
  answer: string;
  /** Discriminated answer family - frontend picks layout from this */
  responseKind?: ButlerResponseKind;
  /** Short verdict line e.g. "YES." */
  verdict?: string;
  primaryMetric?: ButlerMetric;
  metrics?: ButlerMetric[];
  explanation?: string;
  drivers?: ButlerDriver[];
  visualization?: ButlerVisualization;
  recommendation?: ButlerRecommendation;
  actions: ButlerActionLink[];
  evidence: { label: string; value: string }[];
  sources?: ButlerSource[];
  confidence?: { band: string; score?: number };
  warnings?: ButlerWarning[];
  deepLinks?: ButlerActionLink[];
  followUps?: string[];
  pendingWrite?: ButlerPendingWrite;
  toolUsed: string;
  topic: ButlerTopic;
  expanded?: boolean;
  why?: string;
  impactEuro?: number;
};

export type ButlerOpeningSuggestion = {
  id: string;
  label: string;
  query: string;
  reason?: string;
};

export type ButlerOpening = {
  greeting: string;
  invite: string;
  scopeLabel: string;
  periodLabel: string;
  /** Uppercase editorial context: NORTHSTAR · ALL LOCATIONS · TODAY */
  contextLine: string;
  headline: string;
  attentionLine: string | null;
  exposureEuro: number | null;
  rightNow: {
    exposureLabel: string | null;
    attentionLabel: string | null;
    actionsLabel: string | null;
  };
  observation: {
    title: string;
    body: string;
    query: string;
  } | null;
  suggestions: ButlerOpeningSuggestion[];
  contextChips: { id: string; label: string }[];
};
