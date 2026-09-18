/**
 * Stay guests — hotel / serviced-apartment arrival intelligence.
 * Different from restaurant guest brief (covers, allergies, walk-ins).
 *
 * What matters before check-in:
 * - Who is arriving · when · which room/unit
 * - Returning relationship · occasions · explicit requests
 * - What the house should prepare (not a CRM dump)
 */

export type StayGuestSignal =
  | "returning"
  | "first_stay"
  | "anniversary"
  | "honeymoon"
  | "birthday"
  | "early_checkin"
  | "late_checkout"
  | "accessibility"
  | "high_floor"
  | "quiet"
  | "crib"
  | "direct"
  | "ota"
  | "corporate"
  | "upgrade_interest"
  | "remote_work"
  | "long_stay"
  | "review_sensitive"
  | "vip_relationship";

export type StayUnitStatus =
  | "ready"
  | "cleaning"
  | "delayed"
  | "occupied"
  | "maintenance"
  | "out_of_order"
  | "tbd";

export type StayArrival = {
  id: string;
  /** Check-in time window */
  time: string;
  /** Room or unit number, or TBD */
  unit: string;
  unitKind: "room" | "unit";
  guestName: string;
  partySize: number;
  nights: number;
  unitType: string;
  /** Prior completed stays at this property (0 = first) */
  priorStays: number;
  signals: StayGuestSignal[];
  /** Guest-stated or booking note — operational only */
  specialNote?: string;
  /** WHAT THE HOUSE SHOULD PREPARE */
  prepare?: string;
  /** Why the manager should care before they walk in */
  whyItMatters: string;
  unitStatus: StayUnitStatus;
  channel: "direct" | "ota" | "corporate";
};

export const STAY_SIGNAL_LABEL: Record<StayGuestSignal, string> = {
  returning: "Returning",
  first_stay: "First stay",
  anniversary: "Anniversary",
  honeymoon: "Honeymoon",
  birthday: "Birthday",
  early_checkin: "Early check-in",
  late_checkout: "Late checkout",
  accessibility: "Accessibility",
  high_floor: "High floor",
  quiet: "Quiet",
  crib: "Crib",
  direct: "Direct",
  ota: "OTA",
  corporate: "Corporate",
  upgrade_interest: "Upgrade interest",
  remote_work: "Remote work",
  long_stay: "Long stay",
  review_sensitive: "Review-sensitive",
  vip_relationship: "Relationship guest",
};

/** Signals that are occasions / relationship — show first */
export function primaryStaySignals(
  signals: StayGuestSignal[],
): StayGuestSignal[] {
  const priority: StayGuestSignal[] = [
    "honeymoon",
    "anniversary",
    "birthday",
    "returning",
    "vip_relationship",
    "accessibility",
    "review_sensitive",
    "early_checkin",
    "remote_work",
    "long_stay",
    "upgrade_interest",
    "high_floor",
    "quiet",
    "crib",
    "direct",
    "corporate",
    "first_stay",
    "ota",
    "late_checkout",
  ];
  return [...signals].sort(
    (a, b) => priority.indexOf(a) - priority.indexOf(b),
  );
}

export function stayRelationshipLine(a: StayArrival): string {
  if (a.priorStays <= 0) return "First stay";
  if (a.priorStays === 1) return "Returning · 1 prior stay";
  return `Returning · ${a.priorStays} prior stays`;
}

export function stayUnitStatusLabel(status: StayUnitStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "cleaning":
      return "Cleaning";
    case "delayed":
      return "At risk";
    case "occupied":
      return "Occupied";
    case "maintenance":
      return "Maintenance";
    case "out_of_order":
      return "OOO";
    case "tbd":
      return "Room TBD";
  }
}
