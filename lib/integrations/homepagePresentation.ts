/**
 * Homepage Data Origin presentation — curated subset of the integration registry.
 * Status, names, and catalog membership always come from registry.ts.
 * Never invent availability here.
 */

import {
  CATALOG_COUNT,
  HOME_RESTING_PROVIDER_IDS,
  providerById,
  statusLabel,
} from "@/lib/marketing/homeConnections";
import {
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS_LABEL,
  type IntegrationProvider,
  type IntegrationStatus,
} from "@/lib/integrations/registry";

export type HomepageFeaturedSystem = {
  id: string;
  /** Display label (may shorten registry name) */
  label: string;
  brandColor: string;
  group:
    | "pos"
    | "reservations"
    | "hotel"
    | "finance"
    | "distribution";
  groupLabel: string;
  priority: number;
  possibleEvidence: string[];
  radrUses: string[];
  /** Resolved from registry */
  provider: IntegrationProvider;
  status: IntegrationStatus;
  statusLabel: string;
};

/**
 * Curated ~15 recognizable systems for homepage at-rest recognition.
 * Order = homepagePriority.
 */
const FEATURED_SPEC: {
  id: string;
  label: string;
  brandColor: string;
  group: HomepageFeaturedSystem["group"];
  groupLabel: string;
  priority: number;
  possibleEvidence: string[];
  radrUses: string[];
}[] = [
  {
    id: "toast",
    label: "Toast",
    brandColor: "#FF5A1F",
    group: "pos",
    groupLabel: "POS & operations",
    priority: 10,
    possibleEvidence: ["Sales", "Voids", "Comps", "Tender mix", "Locations"],
    radrUses: ["Settlement gaps", "Cost variance", "Perishable revenue"],
  },
  {
    id: "lightspeed-restaurant",
    label: "Lightspeed",
    brandColor: "#E6007A",
    group: "pos",
    groupLabel: "POS & operations",
    priority: 20,
    possibleEvidence: ["Sales", "Items", "Locations", "Payments"],
    radrUses: ["Settlement gaps", "Cost variance", "Menu economics"],
  },
  {
    id: "square",
    label: "Square",
    brandColor: "#000000",
    group: "pos",
    groupLabel: "POS & operations",
    priority: 30,
    possibleEvidence: ["Orders", "Payments", "Locations"],
    radrUses: ["Settlement gaps", "Refund mismatch"],
  },
  {
    id: "opentable",
    label: "OpenTable",
    brandColor: "#DA3743",
    group: "reservations",
    groupLabel: "Reservations / guest",
    priority: 40,
    possibleEvidence: ["Covers", "No-shows", "Cancellations", "Channel mix"],
    radrUses: ["Perishable revenue", "Peak capacity", "Walk-in Futures"],
  },
  {
    id: "sevenrooms",
    label: "SevenRooms",
    brandColor: "#111111",
    group: "reservations",
    groupLabel: "Reservations / guest",
    priority: 50,
    possibleEvidence: ["Reservations", "Guest tags", "Covers", "No-shows"],
    radrUses: ["Perishable revenue", "VIP context", "Peak Decisions"],
  },
  {
    id: "mews",
    label: "Mews",
    brandColor: "#1B4DFF",
    group: "hotel",
    groupLabel: "Hotel / stay",
    priority: 60,
    possibleEvidence: [
      "Reservations",
      "Room inventory",
      "Rates",
      "Folios",
      "Payments",
    ],
    radrUses: [
      "Premium inventory Decisions",
      "Cancellation recovery",
      "Channel economics",
      "Verified outcomes",
    ],
  },
  {
    id: "apaleo",
    label: "Apaleo",
    brandColor: "#00A89D",
    group: "hotel",
    groupLabel: "Hotel / stay",
    priority: 70,
    possibleEvidence: ["Reservations", "Inventory", "Rates", "Folios"],
    radrUses: ["Orphan nights", "Channel hold", "Verified Value"],
  },
  {
    id: "oracle-opera-cloud",
    label: "OPERA Cloud",
    brandColor: "#C74634",
    group: "hotel",
    groupLabel: "Hotel / stay",
    priority: 80,
    possibleEvidence: ["Reservations", "Rooms", "Rates", "Folios"],
    radrUses: ["Inventory Decisions", "Group pace", "Channel economics"],
  },
  {
    id: "xero",
    label: "Xero",
    brandColor: "#13B5EA",
    group: "finance",
    groupLabel: "Finance / payments",
    priority: 90,
    possibleEvidence: ["AP ledger", "Payments", "Credits applied", "Invoices"],
    radrUses: ["Reconciliation", "Verified recovery proof", "Supplier / AP"],
  },
  {
    id: "netsuite",
    label: "NetSuite",
    brandColor: "#1A1F71",
    group: "finance",
    groupLabel: "Finance / payments",
    priority: 100,
    possibleEvidence: ["AP", "GL postings", "Credits", "Vendor bills"],
    radrUses: ["Reconciliation", "Verified Value", "Group reporting"],
  },
  {
    id: "adyen",
    label: "Adyen",
    brandColor: "#0ABF53",
    group: "finance",
    groupLabel: "Finance / payments",
    priority: 110,
    possibleEvidence: [
      "Settlements",
      "Fees",
      "Refunds",
      "Chargebacks",
      "Payouts",
    ],
    radrUses: [
      "Settlement gaps",
      "Refund mismatch",
      "Payment reconciliation",
    ],
  },
  {
    id: "stripe",
    label: "Stripe",
    brandColor: "#635BFF",
    group: "finance",
    groupLabel: "Finance / payments",
    priority: 120,
    possibleEvidence: ["Charges", "Refunds", "Payouts", "Fees"],
    radrUses: ["Settlement gaps", "Refund mismatch", "Payment reconciliation"],
  },
  {
    id: "uber-eats",
    label: "Uber Eats",
    brandColor: "#06C167",
    group: "distribution",
    groupLabel: "Distribution / context",
    priority: 130,
    possibleEvidence: ["Orders", "Fees", "Cancellations", "Settlements"],
    radrUses: ["Delivery margin", "Channel economics", "Settlement gaps"],
  },
  {
    id: "booking-connectivity",
    label: "Booking.com",
    brandColor: "#003580",
    group: "distribution",
    groupLabel: "Distribution / context",
    priority: 140,
    possibleEvidence: ["Reservations", "Rates", "Cancellations", "Channel mix"],
    radrUses: ["Channel hold", "Orphan nights", "OTA economics"],
  },
  {
    id: "open-meteo",
    label: "Open-Meteo",
    brandColor: "#F59E0B",
    group: "distribution",
    groupLabel: "Distribution / context",
    priority: 150,
    possibleEvidence: ["Forecast", "Temperature", "Precipitation"],
    radrUses: ["Demand Futures", "Walk-in context", "Terrace / outdoor"],
  },
  {
    id: "predicthq",
    label: "PredictHQ",
    brandColor: "#7C3AED",
    group: "distribution",
    groupLabel: "Distribution / context",
    priority: 160,
    possibleEvidence: ["Events", "Attendance estimates", "Impact ranks"],
    radrUses: ["Demand Futures", "Peak staffing", "Inventory Decisions"],
  },
];

export function homepageFeaturedSystems(): HomepageFeaturedSystem[] {
  return FEATURED_SPEC.map((spec) => {
    const provider = providerById(spec.id);
    if (!provider) {
      throw new Error(
        `Homepage featured system "${spec.id}" missing from integration registry`,
      );
    }
    return {
      ...spec,
      provider,
      status: provider.status,
      statusLabel: INTEGRATION_STATUS_LABEL[provider.status],
    };
  }).sort((a, b) => a.priority - b.priority);
}

export function homepageFeaturedGroups(): {
  id: HomepageFeaturedSystem["group"];
  label: string;
  systems: HomepageFeaturedSystem[];
}[] {
  const systems = homepageFeaturedSystems();
  const order: HomepageFeaturedSystem["group"][] = [
    "pos",
    "reservations",
    "hotel",
    "finance",
    "distribution",
  ];
  return order
    .map((id) => {
      const items = systems.filter((s) => s.group === id);
      return {
        id,
        label: items[0]?.groupLabel ?? id,
        systems: items,
      };
    })
    .filter((g) => g.systems.length > 0);
}

export function exampleDecisionHrefForSystem(id: string): string | null {
  if (id === "xero" || id === "netsuite" || id === "adyen" || id === "stripe") {
    return "/product/decisions/D-4102/trace";
  }
  if (id === "mews" || id === "apaleo" || id === "oracle-opera-cloud") {
    return "/product/futures";
  }
  return null;
}

export {
  CATALOG_COUNT,
  HOME_RESTING_PROVIDER_IDS,
  statusLabel,
  INTEGRATION_PROVIDERS,
};
