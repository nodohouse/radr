/**
 * RADR Live (spatial) — normalized spatial entity model.
 * Geometry is abstract / deterministic demo — not CAD.
 * Distinct from lib/radr/live (shift economics stream).
 */

export type LiveVertical = "restaurant" | "hotel";

export type LiveEntityType =
  | "estate"
  | "location"
  | "property"
  | "zone"
  | "floor"
  | "room"
  | "station"
  | "department";

export type LiveSeverity = "healthy" | "watch" | "intervene" | "critical";

export type LiveMetric = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: "pos" | "neg" | "watch" | "neutral";
};

export type LiveEntity = {
  id: string;
  type: LiveEntityType;
  vertical: LiveVertical;
  parentId: string | null;
  label: string;
  shortLabel?: string;
  position: { x: number; y: number; z?: number };
  size?: { w: number; h: number; d?: number };
  status: string;
  severity: LiveSeverity;
  metrics: LiveMetric[];
  decisionIds: string[];
  exposureEuro?: number;
  confidence?: number;
  radrSees: string;
  driver?: string;
  expectedValue?: string;
  lastUpdated: string;
  lenses?: Array<"financial" | "operations" | "service" | "rooms" | "pace">;
};

export type LiveLevel = "estate" | "venue" | "property" | "floor" | "zone";

export type LiveSelection = {
  entityId: string | null;
  level: LiveLevel;
  trail: string[];
};
