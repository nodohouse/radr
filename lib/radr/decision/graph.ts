/**
 * Decision Graph — typed links from a Decision to operating entities.
 */

export type DecisionGraphEntityType =
  | "signal"
  | "booking"
  | "inventory"
  | "guest"
  | "staff"
  | "channel"
  | "cost"
  | "revenue"
  | "forecast"
  | "action"
  | "outcome"
  | "decision"
  | "supplier"
  | "menu_item"
  | "room"
  | "unit";

export type DecisionGraphNode = {
  id: string;
  entityType: DecisionGraphEntityType;
  label: string;
  detail?: string;
};

export type DecisionGraphEdge = {
  fromId: string;
  toId: string;
  relation:
    | "triggered_by"
    | "informed_by"
    | "option_for"
    | "executed_as"
    | "resulted_in"
    | "learned_as"
    | "escalates_to"
    | "precedes";
};

export type DecisionGraph = {
  nodes: DecisionGraphNode[];
  edges: DecisionGraphEdge[];
};
