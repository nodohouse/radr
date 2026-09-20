/**
 * Operating graph — relationships RADR can reason over.
 * Display is selective; the model is capable of the full graph.
 */

export type GraphNodeKind =
  | "MENU_ITEM"
  | "INGREDIENT"
  | "SUPPLIER"
  | "STATION"
  | "CHANNEL"
  | "BASKET"
  | "REVIEW"
  | "SOCIAL_SIGNAL"
  | "DEMAND"
  | "RESERVATION"
  | "CAPACITY"
  | "INVENTORY"
  | "LABOR"
  | "CONTRIBUTION";

export type GraphEdgeKind =
  | "USES"
  | "SUPPLIED_BY"
  | "CONSUMES_MINUTES"
  | "LOADS_STATION"
  | "SELLS_ON"
  | "ATTACHES_TO"
  | "MENTIONED_IN"
  | "FEATURED_IN"
  | "DRIVES_DEMAND"
  | "CREATES_PRESSURE"
  | "AFFECTS_TICKET_TIME"
  | "AFFECTS_TURNS"
  | "AFFECTS_CONTRIBUTION"
  | "SUBSTITUTES_FOR";

export type OperatingGraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  locationId?: string;
  demo?: true;
};

export type OperatingGraphEdge = {
  id: string;
  kind: GraphEdgeKind;
  from: string;
  to: string;
  /** Epistemic: observed / estimated / predicted / hypothesized */
  grade: "OBSERVED" | "ESTIMATED" | "PREDICTED" | "HYPOTHESIS";
  note?: string;
  demo?: true;
};

/** Contribution per constrained resource — beyond dish margin. */
export type ConstrainedResourceMetric = {
  resource:
    | "KITCHEN_MINUTE"
    | "OVEN_SLOT"
    | "LABOR_TOUCH"
    | "TABLE_MINUTE"
    | "SCARCE_INGREDIENT"
    | "PREMIUM_ROOM_NIGHT"
    | "SERVICE_CAPACITY_UNIT";
  contributionEuro: number;
  unitsConsumed: number;
  contributionPerUnit: number;
  currency: "EUR";
  window?: string;
  comparedToPeerPct?: number;
  demo?: true;
};
