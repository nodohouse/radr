import type {
  CategoryId,
  CategoryResult,
  VerticalId,
} from "@/lib/marketing/value-calculator";

/** Analytical / modeled revenue categories → RADR blue. Recovery → green. */
export function isAnalyticalCategory(id: CategoryId): boolean {
  return (
    id === "revenue_pricing" || id === "channel_mix" || id === "perishable"
  );
}

export function categoryTone(id: CategoryId): "green" | "blue" {
  return isAnalyticalCategory(id) ? "blue" : "green";
}

export function categoryDisplayLabel(
  c: CategoryResult,
  vertical: VerticalId | null,
): string {
  if (vertical === "hotel") {
    if (c.id === "perishable") return "Perishable room revenue";
    if (c.id === "readiness") return "Room readiness";
    if (c.id === "revenue_pricing") return "Pricing / yield";
    if (c.id === "guest_experience") return "Guest experience";
  }
  if (vertical === "restaurant") {
    if (c.id === "revenue_pricing") return "Pricing / menu mix";
    if (c.id === "perishable") return "Perishable capacity";
    if (c.id === "guest_experience") return "Guest / revenue";
  }
  return c.label;
}

export function evidenceLabel(n: number) {
  if (n >= 0.65) return "HIGH";
  if (n >= 0.4) return "MEDIUM";
  return "LOW";
}

export function proveLabel(timeToProve: number) {
  if (timeToProve >= 0.8) return "FAST";
  if (timeToProve >= 0.55) return "MEDIUM";
  return "SLOWER";
}

export function effortLabel(effort: number) {
  if (effort <= 0.4) return "LOW";
  if (effort <= 0.55) return "MEDIUM";
  return "HIGHER";
}

/** Fixed 6 collision-safe sectors (degrees from +x, CSS y down). */
export const MAP_SECTOR_DEG = [-90, -30, 30, 90, 150, -150] as const;

export function reasonKind(reason: string): "supplied" | "assumed" | "unknown" {
  const r = reason.toLowerCase();
  if (r.includes("assumed") || r.includes("unknown")) return "assumed";
  if (r.includes("not") && r.includes("know")) return "unknown";
  return "supplied";
}

/** Plain-language explanations shared by the questions and the result. */
export function categoryExplanation(
  id: CategoryId,
  vertical: VerticalId | null,
) {
  const hotel = vertical === "hotel";
  const entries: Record<CategoryId, { meaning: string; example: string }> = {
    labor: {
      meaning: "How staffing cost and timing match the work that needs doing.",
      example: hotel
        ? "Compare housekeeping hours with occupied rooms and arrival times."
        : "Compare scheduled kitchen and service hours with covers across the day.",
    },
    supplier_ap: {
      meaning:
        "Differences between what a supplier agreed to charge and what you were invoiced. AP means accounts payable, the money you owe suppliers.",
      example:
        "An invoice uses a higher price than the contract, or a promised credit has not arrived.",
    },
    procurement: {
      meaning:
        "What you pay for comparable products across suppliers and locations.",
      example:
        "Two locations buy the same product at different unit prices after adjusting for pack size and delivery terms.",
    },
    reconciliation: {
      meaning:
        "Checking that recorded sales, fees and refunds match the money actually received.",
      example:
        "Match a card or delivery-platform settlement to sales after commissions and refunds.",
    },
    food_waste: {
      meaning:
        "The cost of purchased food that is spoiled, overproduced or lost during preparation.",
      example:
        "Track unused buffet portions or preparation waste against purchasing and production records.",
    },
    perishable: {
      meaning:
        "Capacity that cannot be sold later once its service window has passed. This is about time-sensitive revenue, not just food expiry.",
      example: hotel
        ? "An unsold room night cannot be carried forward and sold tomorrow."
        : "An empty table during tonight’s service cannot be sold again after the restaurant closes.",
    },
    channel_mix: {
      meaning:
        "How the mix of direct and third-party bookings affects revenue after channel costs.",
      example:
        "Compare the contribution from a direct booking with one through an online travel agency after fees and acquisition costs.",
    },
    readiness: {
      meaning:
        "Whether rooms are clean, maintained and available when guests need them.",
      example:
        "A room is sold but a housekeeping delay prevents it from being available at check-in.",
    },
    revenue_pricing: {
      meaning:
        "How prices and the mix of what you sell affect financial contribution.",
      example: hotel
        ? "Compare room rates and room-type mix with demand and the cost of serving the stay."
        : "Compare menu prices, item popularity and ingredient costs rather than sales alone.",
    },
    guest_experience: {
      meaning:
        "Service problems associated with refunds, compensation or lost repeat business. A link needs evidence before value can be attributed.",
      example:
        "Investigate repeated service delays alongside recorded complaints and compensation.",
    },
  };
  return entries[id];
}
