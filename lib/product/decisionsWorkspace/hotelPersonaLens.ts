/**
 * Hotel Decisions — same UI, persona-weighted priorities (PASS 7).
 * Does not fork the Decision engine.
 */

import type { RoleView } from "@/lib/product/types";
import type { DriverFilter, LedgerSort } from "./ledgerQuery";

export type HotelPersonaLens = {
  id: string;
  roleLabel: string;
  pageSubtitle: string;
  defaultSort: LedgerSort;
  /** Soft default for Driver filter (user can clear). */
  defaultDriver: DriverFilter;
  /** Lower index = higher priority when ranking Needs Judgment. */
  preferredDrivers: DriverFilter[];
  insightHint: string;
  focuses: string[];
};

const GM: HotelPersonaLens = {
  id: "hotel_gm",
  roleLabel: "GM",
  pageSubtitle: "Turn hotel operating intelligence into measurable impact.",
  defaultSort: "urgency",
  defaultDriver: "all",
  preferredDrivers: ["housekeeping", "guests", "channel", "maintenance", "labor"],
  insightHint: "Arrival readiness is the material call before 14:40.",
  focuses: ["Readiness", "Guest impact", "Deadline", "Contribution"],
};

export function hotelPersonaLens(role: RoleView): HotelPersonaLens {
  switch (role) {
    case "cfo":
    case "finance":
    case "owner":
      return {
        id: "hotel_cfo",
        roleLabel: "CFO",
        pageSubtitle:
          "Contribution · channel · labor · verified value — judgment first.",
        defaultSort: "value",
        defaultDriver: "all",
        preferredDrivers: [
          "channel",
          "revenue",
          "cancellations",
          "labor",
          "maintenance",
        ],
        insightHint:
          "Prioritize Decisions that protect contribution, channel mix, and Verified Value.",
        focuses: [
          "Revenue",
          "Contribution / GOP",
          "Channel",
          "Labor",
          "Exposure",
          "Verified Value",
        ],
      };
    case "revenue_manager":
      return {
        id: "revenue_manager",
        roleLabel: "Revenue",
        pageSubtitle:
          "Rate · inventory · pace · channel — same Decision engine.",
        defaultSort: "value",
        defaultDriver: "channel",
        preferredDrivers: ["channel", "revenue", "cancellations", "guests"],
        insightHint:
          "Close discounted OTA inventory and release recovered rooms before pace softens.",
        focuses: [
          "Rate",
          "Inventory",
          "Pace",
          "Pickup",
          "Channel",
          "Restrictions",
        ],
      };
    case "housekeeping_manager":
      return {
        id: "housekeeping",
        roleLabel: "Housekeeping",
        pageSubtitle:
          "Room readiness · reassignment · inspection · capacity.",
        defaultSort: "urgency",
        defaultDriver: "housekeeping",
        preferredDrivers: ["housekeeping", "labor", "maintenance", "guests"],
        insightHint:
          "Floor 3 reassignment is the urgent readiness Decision before the arrival wave.",
        focuses: [
          "Room readiness",
          "Reassignment",
          "Inspection",
          "Labor capacity",
          "Maintenance dependency",
        ],
      };
    case "host":
      return {
        id: "front_office",
        roleLabel: "Front Office",
        pageSubtitle:
          "VIP · upgrades · recovery · room release — guest path first.",
        defaultSort: "urgency",
        defaultDriver: "guests",
        preferredDrivers: ["guests", "housekeeping", "maintenance", "channel"],
        insightHint:
          "Protect VIP arrivals and readiness before Front Office feels the wave.",
        focuses: [
          "VIP check-in",
          "Upgrade hold",
          "Guest recovery",
          "Room release",
          "Late checkout tradeoff",
        ],
      };
    case "coo":
    case "regional":
      return {
        id: "hotel_ops",
        roleLabel: "Operations",
        pageSubtitle:
          "Portfolio operating Decisions — readiness, labor, maintenance.",
        defaultSort: "urgency",
        defaultDriver: "all",
        preferredDrivers: [
          "housekeeping",
          "maintenance",
          "labor",
          "guests",
          "channel",
        ],
        insightHint:
          "Ops ranks by deadline risk and readiness before commercial forks.",
        focuses: ["Readiness", "Labor", "Maintenance", "Deadline", "Properties"],
      };
    case "hotel_gm":
    case "gm":
    default:
      return GM;
  }
}

/** Persona rank: preferred drivers first, then fall through to sort. */
export function personaDriverRank(
  driverKind: string,
  preferred: DriverFilter[],
): number {
  const idx = preferred.indexOf(driverKind as DriverFilter);
  return idx === -1 ? preferred.length + 1 : idx;
}

/** Re-rank while preserving prior sort order within the same driver priority. */
export function boostByPersonaDriver<T extends { driverKind: string }>(
  rows: T[],
  preferred: DriverFilter[],
): T[] {
  if (!preferred.length) return rows;
  return [...rows].sort((a, b) => {
    const d =
      personaDriverRank(a.driverKind, preferred) -
      personaDriverRank(b.driverKind, preferred);
    if (d !== 0) return d;
    return rows.indexOf(a) - rows.indexOf(b);
  });
}
