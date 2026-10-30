export type ServiceView = "floor" | "timeline" | "kitchen" | "staff";
export type TimeKey = "now" | "+30" | "+60" | "+120" | "18:00" | "19:00" | "19:48" | "20:00" | "21:00";
export type ZoneKey = "main" | "terrace" | "bar" | "private";
export type TableTone = "seated" | "turning" | "wait" | "empty" | "blocked";

export type ServiceKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTone: "pos" | "neg" | "amber" | "neutral";
  spark: number[];
  detail: { label: string; value: string }[];
};

export type FloorTable = {
  id: string;
  n: number;
  zone: ZoneKey;
  x: number;
  y: number;
  seats: number;
  tone: TableTone;
  party?: number;
  statusLabel: string;
  seatedMin?: number;
  waitMin?: number;
  stage?: string;
  nextBooking?: string;
};

export type PressureRow = {
  id: string;
  label: string;
  current: number;
  seatNow: number;
  optimized: number;
  delta: number;
  cause: string;
  recommendation: string;
  expectedValue: string;
};

export type DemandBar = {
  id: string;
  time: string;
  current: number;
  expected: number;
  peak?: string;
  covers: number;
  parties: number;
  walkIns: number;
  note?: string;
};

export type Insight = {
  title: string;
  body: string;
  expected: { label: string; value: string }[];
  confidence: string;
  why: string[];
  affectedTables: string[];
};

export type TableDetail = {
  tableId: string;
  title: string;
  status: string;
  statusTone: "wait" | "turning" | "seated";
  meta: string;
  problem: string;
  context: string[];
  recommendation: string;
  confidence: string;
  outcomes: { value: string; label: string }[];
  doNothing: { label: string; value: string }[];
  withRadr: { label: string; value: string }[];
};

export type StaffRow = {
  id: string;
  name: string;
  role: string;
  task: string;
  load: string;
  status: "high" | "busy" | "ok";
};

export type KitchenStation = {
  id: string;
  name: string;
  load: number;
  queue: number;
  oldest: string;
  bottleneck?: boolean;
};

export type ServiceCommandModel = {
  location: string;
  mode: string;
  liveTime: string;
  syncLabel: string;
  kpis: ServiceKpi[];
  insight: Insight;
  tables: FloorTable[];
  pressure: PressureRow[];
  demand: DemandBar[];
  demandMeta: { label: string; value: string }[];
  tableDetails: Record<string, TableDetail>;
  defaultTableId: string;
  staff: StaffRow[];
  kitchen: KitchenStation[];
  floorImage: string;
};
