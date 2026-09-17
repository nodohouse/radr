export type LabSeed = "service" | "hotel" | "recover";
export type LabRole = "gm" | "cfo" | "clevel";
export type LabIndustry = "restaurant" | "hotel";
export type MoneyGrade = "Expected" | "Observed" | "Verified";
export type Wedge = "BUY" | "SELL" | "LABOR" | "RECOVER";
export type PulseWindow = "shift" | "24h";
export type BriefRole = "chef" | "foh" | "gm" | "cfo";
export type AutopilotLevel = 1 | 2 | 3 | 4;
export type AutopilotLevelName = "Suggest" | "Stage" | "Auto" | "Verified";

export type AutopilotLevelId =
  | "suggest"
  | "stage"
  | "auto"
  | "verified";

export type DecisionStatus =
  | "needs_you"
  | "handling"
  | "verified"
  | "learned";

export type AutopilotPolicy = {
  canAuto: string[];
  alwaysAsk: string[];
  memoryLine: string;
  interruptReason: string | null;
};

export type BecauseMoney = {
  euro: number;
  grade: MoneyGrade;
  because: string;
  /** Only set when grade is Verified and lineage exists. */
  lineage?: string;
  demo?: boolean;
};

export type PulseSeriesKey = "in" | "out" | "net" | "forecast";

export type PulsePoint = {
  t: string;
  label: string;
  in: number;
  out: number;
  net: number;
  forecast: number;
};

export type TurbulenceMarker = {
  id: string;
  t: string;
  label: string;
  because: string;
  decisionId: string;
  displayId: string;
  euro: number;
  grade: MoneyGrade;
  kind: "delivery" | "cancel" | "kitchen" | "channel" | "hold" | "recover";
};

export type PulseMetric = {
  id: string;
  label: string;
  euro: number;
  because: string;
  grade?: MoneyGrade;
  tone: "in" | "out" | "net" | "watch";
};

export type ShiftPulse = {
  industry: LabIndustry;
  title: string;
  windowLabel: string;
  headline: string;
  net: BecauseMoney;
  forecastClose: BecauseMoney;
  trackingNote: string;
  metrics: PulseMetric[];
  series: PulsePoint[];
  series24h: PulsePoint[];
  turbulence: TurbulenceMarker[];
};

export type FutureOption = {
  id: string;
  title: string;
  euro: number | null;
  euroLabel?: string;
  note: string;
  recommended?: boolean;
  recover?: boolean;
};

export type DecisionActuator = {
  system: string;
  title: string;
  detail: string;
  policy: "auto" | "ask" | "demo";
};

export type LabDecision = {
  id: string;
  displayId: string;
  title: string;
  sub: string;
  wedge: Wedge;
  euro: number;
  grade: MoneyGrade;
  because: string;
  clock: string;
  decideBy?: string;
  seed: LabSeed;
  status: DecisionStatus;
  autopilot: AutopilotLevelId;
  policy: AutopilotPolicy;
  futures: FutureOption[];
  recommendedFuture: string;
  actuators: DecisionActuator[];
  lineage?: string;
  demo?: boolean;
};

export type FloorNote = {
  id: string;
  label: string;
  value: string;
  because: string;
};

export type WinLossRow = {
  id: string;
  side: "win" | "loss";
  title: string;
  money: BecauseMoney;
  href: string;
};

export type MoneyTheme = {
  id: string;
  title: string;
  wedge: string;
  money: BecauseMoney;
  href: string;
};

export type CatalogModule = {
  id: string;
  category: Wedge | "VALUE" | "MEMORY";
  displayId?: string;
  decisionId?: string;
  title: string;
  euro: number;
  euroLabel: string;
  grade: MoneyGrade | "Playbook";
  because: string;
  clock?: string;
  blurb: string;
  href: string;
  pinDefault?: LabRole[];
};

export type BriefItem = {
  id: string;
  check: string;
  detail: string;
  because: string;
  when: string;
  euro?: number;
  grade?: MoneyGrade;
  displayId?: string;
  decisionId?: string;
  seed?: LabSeed;
  status: "do" | "watch" | "done";
};

export type BriefPacket = {
  packet: BriefRole;
  title: string;
  horizon: string;
  lead: string;
  items: BriefItem[];
};

export type ServiceBrief = {
  phase: "pre" | "mid";
  phaseLabel: string;
  deltaNote: string;
  packets: Record<BriefRole, BriefPacket>;
};

export type ValueEntry = {
  id: string;
  displayId: string;
  title: string;
  money: BecauseMoney;
  stage: "identified" | "expected" | "observed" | "attributed" | "verified";
};

export type MemoryStory = {
  id: string;
  title: string;
  euro: number;
  grade: MoneyGrade;
  tried: string;
  observed: string;
  verified: string;
  nextTime: string;
  links: { label: string; because: string; href: string }[];
};

export type RoleLens = {
  role: LabRole;
  label: string;
  title: string;
  subtitle: string;
  demoPath: string;
  showBrief: boolean;
  defaultBrief: BriefRole;
  showFloor: boolean;
  showWinLoss: boolean;
  showThemes: boolean;
  catalogEmphasis: Array<Wedge | "VALUE" | "MEMORY">;
  pulseMode: "ops" | "pnl" | "summary";
};

export type HealthSource = {
  id: string;
  name: string;
  status: "ok" | "degraded" | "stale";
  freshness: string;
  impact?: string;
};

export type LabWorld = {
  seed: LabSeed;
  industry: LabIndustry;
  location: string;
  serviceLabel: string;
  nowLabel: string;
  liveNote: string;
  pulse: ShiftPulse;
  heroDecisionId: string;
  decisions: LabDecision[];
  floor: FloorNote[];
  winLoss: WinLossRow[];
  themes: MoneyTheme[];
  brief: ServiceBrief;
  verifiedBank: BecauseMoney;
  activeExposure: BecauseMoney;
};
