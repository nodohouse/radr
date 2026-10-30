export type DecisionState = "judgment" | "motion" | "resolved";

export type DriverKind =
  | "labor"
  | "procurement"
  | "menu"
  | "channel"
  | "cancellations"
  | "waste"
  | "capacity"
  /** Hotel drivers */
  | "housekeeping"
  | "guests"
  | "maintenance"
  | "revenue"
  | "front_office"
  | "readiness";

export type DecisionNavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export type SummaryMetric = {
  id: string;
  label: string;
  value: string;
  sub: string;
  tone: "pos" | "neg" | "amber" | "neutral";
  spark: number[];
  sparkKind?: "bars" | "line";
};

export type JudgmentRow = {
  id: string;
  title: string;
  subtitle: string;
  thumb: string;
  impact: string;
  impactNoun: string;
  driver: string;
  driverKind: DriverKind;
  locationCount: number;
  locationsShort: string;
  confidence: number;
  deadline: string;
  deadlineTone: "today" | "week" | "future";
  liveHref?: string;
};

export type MotionRow = {
  id: string;
  title: string;
  subtitle: string;
  thumb: string;
  impact: string;
  impactNoun: string;
  driver: string;
  driverKind: DriverKind;
  locationsShort: string;
  status: string;
  progress: number;
  expectedDate: string;
};

export type ResolvedRow = {
  id: string;
  title: string;
  subtitle: string;
  thumb: string;
  expected: string;
  actual: string;
  accuracy: string;
  driver: string;
  driverKind: DriverKind;
  locationsShort: string;
  completed: string;
};

export type LocationImpact = {
  id: string;
  name: string;
  currentLabel: string;
  afterLabel: string;
  currentPct: number;
  afterPct: number;
  gain: string;
};

export type OutcomeMetric = {
  id: string;
  value: string;
  label: string;
  detail: string;
};

export type FinancialImpact = {
  expected: string;
  low: string;
  high: string;
  costOfNothing: string;
  implementationCost: string;
  net: string;
  horizon: string;
};

export type EvidenceSource = {
  id: string;
  name: string;
  freshness: string;
  healthy?: boolean;
};

export type PlanStep = {
  n: number;
  text: string;
};

export type FuturesSide = {
  title: string;
  lines: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
};

export type DecisionDetail = {
  id: string;
  state: DecisionState;
  title: string;
  subtitle: string;
  statusLabel: string;
  expected: string;
  expectedRange: string;
  confidence: number;
  deadline: string;
  deadlineTone: "today" | "week" | "future";
  why: string[];
  outcomes: OutcomeMetric[];
  locations: LocationImpact[];
  financial: FinancialImpact;
  evidenceSources: EvidenceSource[];
  evidenceNotes: string[];
  plan: PlanStep[];
  planMeta: { owner: string; effective: string; monitor: string; rollback: string };
  futures: { doNothing: FuturesSide; withRadr: FuturesSide };
  liveHref?: string;
  /** In-motion extras */
  motion?: {
    progress: number;
    signals: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
    earlyValue: string;
    verifyFrom: string;
    owner: string;
    nextCheck: string;
  };
  /** Resolved extras */
  verified?: {
    expected: string;
    actual: string;
    accuracy: string;
    confidenceAtDecision: number;
    whatHappened: string;
    whyWorked: string;
    learned: string;
  };
};

export type DecisionsWorkspaceModel = {
  industry: "restaurants" | "hotels";
  contextLabel: string;
  roleLabel: string;
  periodLabel: string;
  searchPlaceholder: string;
  pageTitle: string;
  pageSubtitle: string;
  nav: DecisionNavItem[];
  summary: SummaryMetric[];
  insight: {
    body: string;
    exposureShare: string;
    href: string;
  };
  tabs: { id: "all" | "judgment" | "motion" | "resolved"; label: string; count: number }[];
  judgment: JudgmentRow[];
  motion: MotionRow[];
  resolved: ResolvedRow[];
  details: Record<string, DecisionDetail>;
  defaultDecisionId: string;
};
