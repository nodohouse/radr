export type CfoIndustry = "restaurants" | "hotels";

export type PortfolioState = "healthy" | "watch" | "intervene";

export type SparkTone = "pos" | "neg" | "neutral";

/** Bridge driver keys used for cross-filtering */
export type DriverId =
  | "rev"
  | "labor"
  | "cogs"
  | "channel"
  | "refunds"
  | "proc"
  | "radr"
  | "adr"
  | "occ"
  | "dist"
  | "cx";

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTone: SparkTone;
  spark: number[];
};

export type BridgeBreakdownRow = {
  locationId: string;
  name: string;
  amount: number;
  amountLabel: string;
};

export type BridgeStep = {
  id: string;
  label: string;
  shortLabel?: string;
  value: number;
  kind: "start" | "up" | "down" | "end";
  /** When set, step is interactive and filters the center */
  driverId?: DriverId;
  breakdown?: BridgeBreakdownRow[];
  decisionsAddressed?: {
    count: number;
    valueLabel: string;
  };
};

export type ConcentrationSlice = {
  id: string;
  name: string;
  pct: number;
  locationIds?: string[];
};

export type OutlookScenarioMetric = {
  id: string;
  label: string;
  value: string;
  note?: string;
  tone?: SparkTone;
};

export type AttentionItem = {
  id: string;
  locationId: string;
  title: string;
  problem: string;
  exposure: string;
  driver: string;
  driverId?: DriverId;
  decisionId?: string;
  thumb: string;
  /** PROBLEM → RESPONSE → VALUE */
  recommendation: string;
  expected: string;
  confidence: number;
  deadline: string;
  href: string;
};

export type PendingDecision = {
  id: string;
  decisionId: string;
  title: string;
  scope: string;
  deadline: string;
  expected: string;
  confidence: number;
  driverId?: DriverId;
  locationIds?: string[];
  href: string;
};

export type VerifiedItem = {
  id: string;
  title: string;
  scope: string;
  value: string;
  expected: string;
  actual: string;
  accuracy: string;
  href: string;
};

export type ChannelSplit = {
  primary: number;
  primaryLabel: string;
  secondaryLabel: string;
};

export type PortfolioAction =
  | "review_decision"
  | "investigate"
  | "view_live"
  | "view_evidence"
  | "view"
  | "healthy";

export type PortfolioRow = {
  id: string;
  name: string;
  subtitle?: string;
  thumb: string;
  state: PortfolioState;
  revenue: string;
  vsPlan?: string;
  vsPlanTone?: SparkTone;
  contribution?: string;
  margin?: string;
  labor: string;
  laborTone: SparkTone;
  cogs?: string;
  cogsTone?: SparkTone;
  channel: ChannelSplit;
  exposure: string;
  exposurePct: number;
  verified: string;
  occupancy?: string;
  occupancyTone?: SparkTone;
  adr?: string;
  revpar?: string;
  gop?: string;
  /** Drivers material at this location */
  materialDrivers: DriverId[];
  action: PortfolioAction;
  decisionId?: string;
  liveHref: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
};

export type SinceLastCheckItem = {
  id: string;
  label: string;
  tone?: SparkTone;
  /** Jump target when clicked */
  focus?: {
    driverId?: DriverId;
    locationId?: string;
    tab?: string;
    href?: string;
  };
};

export type CausalDriverChip = {
  label: string;
  driverId: DriverId;
};

export type CfoControlCenterModel = {
  industry: CfoIndustry;
  greeting: string;
  pageTitle: string;
  /** e.g. Restaurants · All locations */
  contextLabel: string;
  roleLabel: string;
  periodLabel: string;
  dateRange: string;
  searchPlaceholder: string;
  dataLive: string;
  sourcesLabel: string;
  nav: NavItem[];
  sinceLastCheck: SinceLastCheckItem[];
  /** Canonical group exposure model — never duplicate "Exposure" elsewhere */
  exposureModel: {
    gross: string;
    covered: string;
    coveredPct: number;
    unmanaged: string;
    unmanagedPct: number;
  };
  /** Compact CFO action orientation under KPIs */
  posture: {
    needsYouCount: number;
    expectedValue: string;
    unmanaged: string;
    confidencePct: number;
  };
  forecast: {
    confidencePct: number;
    sourcesHealthy: string;
    reason?: string;
    href: string;
  };
  kpis: KpiMetric[];
  hero: {
    eyebrow: string;
    headline: string;
    focusEntities: string[];
    gapAmount: string;
    gapNoun: string;
    drivers: string[];
    radrStatus: string;
    cta: string;
    ctaHref: string;
    opportunity: string;
    concentration: ConcentrationSlice[];
    causalDrivers: CausalDriverChip[];
    /** e.g. 82% of gap */
    gapShareLabel: string;
    image: string;
    imageAlt: string;
  };
  bridge: {
    title: string;
    subtitle: string;
    steps: BridgeStep[];
    unit: string;
    planLabel: string;
    actualLabel: string;
  };
  outlook: {
    title: string;
    current: OutlookScenarioMetric[];
    withRadr: OutlookScenarioMetric[];
    protectedLabel: string;
  };
  portfolio: {
    title: string;
    entityLabel: string;
    tabs: { id: string; label: string; count: number }[];
    rows: PortfolioRow[];
    columns: "restaurant" | "hotel";
  };
  rail: {
    attention: AttentionItem[];
    pending: PendingDecision[];
    verified: VerifiedItem[];
  };
};
