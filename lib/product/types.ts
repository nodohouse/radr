/** RADR Control Center: vision prototype types */

export type Area = "buy" | "labor" | "sell" | "recover";

export type SignalStatus =
  | "NEW"
  | "REVIEW"
  | "ASSIGNED"
  | "IN_REVIEW"
  | "ACTIONABLE"
  | "RESOLVED"
  | "VERIFIED"
  | "RECOVERABLE"
  | "MISSED_UPSIDE"
  | "AVOIDABLE";

export type ImpactType =
  | "exposure"
  | "recoverable"
  | "missed_upside"
  | "preventable"
  | "verified";

export type ValueEventKind =
  | "IDENTIFIED"
  | "ACTIONED"
  | "RESOLVED"
  | "RECOVERED"
  | "PREVENTED"
  | "CAPTURED"
  | "VERIFIED";

export type RoleView =
  | "owner"
  | "gm"
  | "hotel_gm"
  | "regional"
  | "coo"
  | "cfo"
  | "finance"
  | "fb_operator"
  | "head_chef"
  | "kitchen"
  | "host"
  | "server"
  | "revenue_manager"
  | "housekeeping_manager";

/** Migrate persisted demo prefs from pre-role-aware ids. */
export function migrateRoleView(raw: unknown): RoleView {
  if (raw === "procurement") return "finance";
  if (raw === "operations") return "coo";
  if (raw === "hotel_gm" || raw === "revenue_manager") return "revenue_manager";
  if (raw === "cfo" || raw === "finance") return "cfo";
  if (raw === "coo" || raw === "regional" || raw === "owner") return "coo";
  if (
    raw === "gm" ||
    raw === "fb_operator" ||
    raw === "head_chef" ||
    raw === "kitchen" ||
    raw === "host" ||
    raw === "server" ||
    raw === "housekeeping_manager"
  ) {
    return "gm";
  }
  if (
    typeof raw === "string" &&
    [
      "owner",
      "gm",
      "hotel_gm",
      "regional",
      "coo",
      "cfo",
      "finance",
      "fb_operator",
      "head_chef",
      "kitchen",
      "host",
      "server",
      "revenue_manager",
      "housekeeping_manager",
    ].includes(raw)
  ) {
    return raw as RoleView;
  }
  return "gm";
}

export type DataSourceStatus = "CONNECTED" | "SYNCING" | "NEEDS_ATTENTION";

export type Location = {
  id: string;
  name: string;
  city: string;
  country: string;
  openSignals: number;
  valueOnRadr: number;
  verifiedValue: number;
  lastSync: string;
};

export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
  scope: string;
  openAssignments: number;
};

export type SignalEvidence = {
  id: string;
  name: string;
  kind: "pdf" | "csv" | "xlsx";
  role: string;
};

export type SignalActivity = {
  id: string;
  actor: string;
  body: string;
  at: string;
};

export type Signal = {
  id: string;
  area: Area;
  type: string;
  title: string;
  description: string;
  /** Subject line for cards · e.g. "Truffle Rigatoni · FreshCo" */
  subject?: string;
  locationId: string;
  impact: number;
  impactLabel: string;
  impactType: ImpactType;
  period: string;
  expected: { label: string; value: string };
  actual: { label: string; value: string };
  delta: string;
  volume?: string;
  why: string;
  evidence: SignalEvidence[];
  ownerId: string | null;
  ownerName: string;
  status: SignalStatus;
  priority: number;
  detectedAt: string;
  resolvedAt?: string;
  verifiedAt?: string;
  controlId?: string;
  recommendation: string;
  activity: SignalActivity[];
};

export type Control = {
  id: string;
  name: string;
  description: string;
  sourceSignalId: string;
  scope: string;
  condition: string;
  action: string;
  status: "ACTIVE" | "PAUSED";
  createdAt: string;
  lastRunAt: string;
  preventedCount: number;
  protectedValue: number;
  owner: string;
  runHistory: ("Passed" | "Flagged")[];
};

export type DataSource = {
  id: string;
  name: string;
  status: DataSourceStatus;
  lastSync: string;
};

export type ValueSummary = {
  identified: number;
  actioned: number;
  resolved: number;
  recoveredPreventedCaptured: number;
  verified: number;
  byArea: Record<Area, number>;
  byLocation: { locationId: string; value: number }[];
  recovered: number;
  prevented: number;
  captured: number;
};

export type Organization = {
  id: string;
  name: string;
  locations: number;
  countries: number;
  demo: true;
};
