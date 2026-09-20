/**
 * Public capability status — single source for marketing + Developers.
 * Never claim LIVE / AVAILABLE unless the registry says so.
 */

export type CapabilityStatus =
  | "live"
  | "available"
  | "beta"
  | "early_access"
  | "demo"
  | "technical_preview"
  | "partner_access"
  | "building"
  | "planned";

export const CAPABILITY_STATUS_LABEL: Record<CapabilityStatus, string> = {
  live: "Live",
  available: "Available",
  beta: "Beta",
  early_access: "Early access",
  demo: "Demo",
  technical_preview: "Technical preview",
  partner_access: "Partner access",
  building: "Building",
  planned: "Planned",
};

export type PublicCapability = {
  id: string;
  label: string;
  status: CapabilityStatus;
  /** Short public note — honesty over polish */
  note?: string;
};

/**
 * Platform surfaces + commercial claims used on public pages.
 * Statuses reflect what the public product may honestly claim today.
 */
export const PUBLIC_CAPABILITIES = {
  controlCenter: {
    id: "controlCenter",
    label: "Control Center",
    status: "demo",
    note: "Public surface is illustrative. Product direction: Shift Pulse → primary Decision → role lens.",
  },
  decisions: {
    id: "decisions",
    label: "Decisions",
    status: "demo",
    note: "Decision object model is demo-backed on public pages.",
  },
  futures: {
    id: "futures",
    label: "Futures",
    status: "demo",
    note: "Fork simulation shown with illustrative DEMO economics.",
  },
  floor: {
    id: "floor",
    label: "RADR Floor",
    status: "early_access",
    note: "Frontline projection — not primary Platform navigation until depth matches.",
  },
  verifiedValue: {
    id: "verifiedValue",
    label: "Verified Value",
    status: "demo",
    note: "Attribution semantics are real; public numbers are DEMO.",
  },
  memory: {
    id: "memory",
    label: "Operating Memory",
    status: "demo",
    note: "Playbook / pattern learning shown as DEMO.",
  },
  preparedActions: {
    id: "preparedActions",
    label: "Prepared Actions",
    status: "demo",
    note: "Coordination payload is DEMO — not production execution.",
  },
  autopilot: {
    id: "autopilot",
    label: "Autopilot within policy",
    status: "planned",
    note: "Not production autonomous execution.",
  },
  askRadr: {
    id: "askRadr",
    label: "Ask RADR",
    status: "demo",
    note: "Operator Q&A over evidence — DEMO on public surfaces.",
  },
  developersApi: {
    id: "developersApi",
    label: "Public API",
    status: "technical_preview",
    note: "Sandbox not live · proposed API design.",
  },
  filesCsv: {
    id: "filesCsv",
    label: "Files / CSV / Documents",
    status: "available",
    note: "Primary first-pilot ingestion path.",
  },
  demoReservations: {
    id: "demoReservations",
    label: "RADR Demo Reservations",
    status: "available",
    note: "Reference / sandbox path.",
  },
  recoveryPilot: {
    id: "recoveryPilot",
    label: "Recovery pilot",
    status: "early_access",
    note: "File-first commercial entry — secure exports before large API projects.",
  },
} as const satisfies Record<string, PublicCapability>;

export type PublicCapabilityId = keyof typeof PUBLIC_CAPABILITIES;

export function capabilityStatus(id: PublicCapabilityId): CapabilityStatus {
  return PUBLIC_CAPABILITIES[id].status;
}

export function capabilityLabel(id: PublicCapabilityId): string {
  const c = PUBLIC_CAPABILITIES[id];
  return `${CAPABILITY_STATUS_LABEL[c.status]}`;
}

export function capabilityBadge(id: PublicCapabilityId): string {
  const c = PUBLIC_CAPABILITIES[id];
  return CAPABILITY_STATUS_LABEL[c.status].toUpperCase();
}

/** Statuses that must never be described as live / automatic / executes */
export const NON_LIVE_STATUSES: ReadonlySet<CapabilityStatus> = new Set([
  "demo",
  "technical_preview",
  "partner_access",
  "building",
  "planned",
  "early_access",
  "beta",
]);
