export type SeedId = "service" | "hotel" | "recover";
export type RoleId = "gm" | "cfo" | "clevel";
export type Industry = "restaurant" | "hotel";
export type MoneyGrade = "Expected" | "Observed" | "Verified";
export type Wedge = "BUY" | "SELL" | "LABOR" | "RECOVER" | "VALUE" | "MEMORY";
export type DecisionMode = "live" | "why" | "futures" | "context" | "approved";
export type PulseWindow = "shift" | "24h";
export type BriefPacketId = "chef" | "foh" | "gm" | "cfo";
export type AutopilotLevel = 1 | 2 | 3 | 4;
export type SeriesDirection = "in" | "out" | "net" | "forecast";
export type TurbulenceSeverity = "hot" | "watch" | "calm";

export type Clock = {
  nowLabel: string;
  deadlineLabel: string;
  waitMinutes: number;
  resumeLabel: string;
  nowMinutes: number;
};

export type BecauseEuro = {
  amount: number;
  grade: MoneyGrade;
  because: string;
  decisionId?: string;
  displayId?: string;
};

export type PulsePoint = {
  t: string;
  minutes: number;
  inEuro: number;
  outEuro: number;
  netEuro: number;
  forecastEuro: number;
};

export type PulseSeries = {
  id: string;
  label: string;
  direction: SeriesDirection;
  color: string;
};

export type TurbulenceMark = {
  id: string;
  minutes: number;
  t: string;
  label: string;
  severity: TurbulenceSeverity;
  euro: number;
  grade: MoneyGrade;
  because: string;
  decisionId: string;
  displayId: string;
};

export type PulseModel = {
  industry: Industry;
  seed: SeedId;
  windowLabel: string;
  window: PulseWindow;
  netEuro: number;
  netGrade: MoneyGrade;
  netBecause: string;
  forecastCloseEuro: number;
  forecastBecause: string;
  series: PulseSeries[];
  points: PulsePoint[];
  actualThroughMinutes: number;
  turbulence: TurbulenceMark[];
  legendNote: string;
};

export type FutureOption = {
  id: string;
  title: string;
  euro: number | null;
  note: string;
  recommended?: boolean;
};

export type PreparedAction = {
  system: string;
  title: string;
  detail: string;
  policy: "auto" | "ask" | "demo";
};

export type AutopilotPolicy = {
  level: AutopilotLevel;
  levelLabel: string;
  radrWill: string[];
  needsYou: string[];
  canAuto: string[];
  alwaysAsk: string[];
  memoryLine: string;
  similarCount: number;
};

export type DecisionHero = {
  id: string;
  displayId: string;
  title: string;
  sub: string;
  wedge: Wedge;
  euro: number;
  grade: MoneyGrade;
  because: string;
  moneyMeta: string;
  deadlineLabel: string;
  clockLabel: string;
  recommendedFuture: string;
  futures: FutureOption[];
  whyLines: string[];
  actions: PreparedAction[];
  autopilot: AutopilotPolicy;
  seed: SeedId;
};

export type ModulePin = {
  id: string;
  category: Wedge;
  decisionId: string;
  displayId: string;
  title: string;
  euro: number;
  euroLabel: string;
  clock: string;
  grade: MoneyGrade;
  because: string;
  blurb: string;
  href: string;
  seed?: SeedId;
};

export type RoleLens = {
  role: RoleId;
  label: string;
  title: string;
  subtitle: string;
  demoPath: string;
  note: string;
  defaultSeed: SeedId;
  defaultBrief: BriefPacketId;
  showBrief: boolean;
  showFloor: boolean;
  showWinLoss: boolean;
  showThemes: boolean;
  catalogEmphasis: Wedge[];
  moduleIds: string[];
  pulseEmphasis: "ops" | "pnl" | "summary";
};

export type BriefItem = {
  id: string;
  check: string;
  detail: string;
  because: string;
  when: string;
  euro?: number;
  grade?: MoneyGrade;
  decisionId?: string;
  displayId?: string;
  seed?: SeedId;
  status: "do" | "watch" | "done";
};

export type BriefPacket = {
  packet: BriefPacketId;
  title: string;
  horizon: string;
  lead: string;
  items: BriefItem[];
};

export type ServiceBrief = {
  phase: "pre" | "mid";
  phaseLabel: string;
  deltaNote: string;
  packets: Record<BriefPacketId, BriefPacket>;
};

export type FloorNote = {
  id: string;
  label: string;
  value: string;
  because: string;
  hot?: boolean;
};

export type ThemeCard = {
  id: string;
  title: string;
  euro: number;
  grade: MoneyGrade;
  because: string;
  wedge: string;
  href: string;
};

export type WinLoss = {
  kind: "win" | "loss";
  label: string;
  euro: number;
  grade: MoneyGrade;
  because: string;
  cta: string;
  href: string;
};

export type ValueLine = {
  id: string;
  displayId: string;
  title: string;
  euro: number;
  grade: MoneyGrade;
  because: string;
  band: "verified" | "active" | "pending";
  seed?: SeedId;
};

export type MemoryStory = {
  id: string;
  n: string;
  label: string;
  kicker: string;
  title: string;
  tried: string;
  observed: string;
  verified: string;
  next: string;
  euro?: number;
  grade?: MoneyGrade;
};

export type HealthIssue = {
  kind: "degraded" | "stale";
  source: string;
  detail: string;
};
