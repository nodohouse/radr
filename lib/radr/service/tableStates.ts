/**
 * Canonical Service table states — one vocabulary for Floor / Timeline / Recovery.
 * Map from legacy ServiceMapUnit.state at the edge; never invent page-local enums.
 */

export const SERVICE_TABLE_STATES = [
  "AVAILABLE",
  "RESERVED",
  "ARRIVING",
  "SEATED",
  "ORDERING",
  "IN_SERVICE",
  "CHECKING_OUT",
  "TURNING",
  "HELD",
  "BLOCKED",
  "PROTECTED",
] as const;

export type ServiceTableState = (typeof SERVICE_TABLE_STATES)[number];

/** Legacy demo floor states → canonical. */
export function toServiceTableState(
  legacy:
    | "occupied"
    | "available"
    | "held"
    | "inbound"
    | "turn_risk"
    | "cancelled"
    | "dirty"
    | "ready"
    | "ooo"
    | string,
  opts?: { protected?: boolean },
): ServiceTableState {
  if (opts?.protected) return "PROTECTED";
  switch (legacy) {
    case "available":
    case "ready":
      return "AVAILABLE";
    case "inbound":
      return "RESERVED";
    case "held":
      return "HELD";
    case "occupied":
      return "IN_SERVICE";
    case "turn_risk":
      return "TURNING";
    case "dirty":
      return "CHECKING_OUT";
    case "cancelled":
    case "ooo":
      return "BLOCKED";
    default:
      return "AVAILABLE";
  }
}

export function serviceTableStateLabel(s: ServiceTableState): string {
  return s.replace(/_/g, " ");
}
