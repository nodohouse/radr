/**
 * Homepage integration marquee — representative systems only.
 * Status never implies partnership or production connection.
 * Assets: /public/vendors/*.svg via VendorLogo slug map.
 */

export type MarqueeStatus = "representative" | "available" | "planned";

export type MarqueeItem = {
  id: string;
  name: string;
  category: string;
  /** Optical row: core ops vs finance/workforce/distribution */
  row: 1 | 2;
  status: MarqueeStatus;
  dataUnlocked: string[];
  brandColor: string;
};

/** Row 1 — core operating systems. Row 2 — finance / workforce / distribution / external. */
export const MARQUEE_ITEMS: readonly MarqueeItem[] = [
  {
    id: "toast",
    name: "Toast",
    category: "Restaurant POS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Sales", "Checks", "Items", "Refunds", "Menu mix", "Service timing"],
    brandColor: "#FF5A1F",
  },
  {
    id: "lightspeed",
    name: "Lightspeed",
    category: "Restaurant POS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Sales", "Items", "Locations", "Payments"],
    brandColor: "#E6007A",
  },
  {
    id: "square",
    name: "Square",
    category: "POS / Payments",
    row: 1,
    status: "representative",
    dataUnlocked: ["Orders", "Payments", "Locations"],
    brandColor: "#000000",
  },
  {
    id: "clover",
    name: "Clover",
    category: "Restaurant POS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Orders", "Tenders", "Items"],
    brandColor: "#228800",
  },
  {
    id: "oracle-micros",
    name: "Oracle MICROS",
    category: "Restaurant POS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Checks", "Revenue centers", "Menu"],
    brandColor: "#C74634",
  },
  {
    id: "opentable",
    name: "OpenTable",
    category: "Reservations",
    row: 1,
    status: "representative",
    dataUnlocked: ["Covers", "No-shows", "Cancellations", "Channel mix"],
    brandColor: "#DA3743",
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    category: "Reservations / Guest",
    row: 1,
    status: "representative",
    dataUnlocked: ["Reservations", "Guest tags", "Covers", "No-shows"],
    brandColor: "#111111",
  },
  {
    id: "resy",
    name: "Resy",
    category: "Reservations",
    row: 1,
    status: "representative",
    dataUnlocked: ["Reservations", "Notes", "No-shows"],
    brandColor: "#E23744",
  },
  {
    id: "mews",
    name: "Mews",
    category: "Hotel PMS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Rooms", "Reservations", "Arrivals", "Occupancy", "Rate", "Room status"],
    brandColor: "#1B4DFF",
  },
  {
    id: "opera-cloud",
    name: "OPERA Cloud",
    category: "Hotel PMS",
    row: 1,
    status: "representative",
    dataUnlocked: ["Reservations", "Rooms", "Rates", "Housekeeping"],
    brandColor: "#C74634",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    category: "Finance / ERP",
    row: 2,
    status: "representative",
    dataUnlocked: ["AP", "GL postings", "Credits", "Vendor bills"],
    brandColor: "#1A1F71",
  },
  {
    id: "xero",
    name: "Xero",
    category: "Accounting",
    row: 2,
    status: "representative",
    dataUnlocked: ["AP ledger", "Payments", "Credits", "Invoices"],
    brandColor: "#13B5EA",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Accounting",
    row: 2,
    status: "representative",
    dataUnlocked: ["Bills", "Vendors", "Payments"],
    brandColor: "#2CA01C",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    row: 2,
    status: "representative",
    dataUnlocked: ["Charges", "Refunds", "Payouts", "Fees"],
    brandColor: "#635BFF",
  },
  {
    id: "adyen",
    name: "Adyen",
    category: "Payments",
    row: 2,
    status: "representative",
    dataUnlocked: ["Settlements", "Fees", "Refunds", "Chargebacks"],
    brandColor: "#0ABF53",
  },
  {
    id: "planday",
    name: "Planday",
    category: "Workforce",
    row: 2,
    status: "representative",
    dataUnlocked: ["Rosters", "Shifts", "Hours"],
    brandColor: "#00A0E3",
  },
  {
    id: "deputy",
    name: "Deputy",
    category: "Workforce",
    row: 2,
    status: "representative",
    dataUnlocked: ["Schedules", "Clock-ins", "Labor cost"],
    brandColor: "#000000",
  },
  {
    id: "uber-eats",
    name: "Uber Eats",
    category: "Delivery",
    row: 2,
    status: "representative",
    dataUnlocked: ["Orders", "Fees", "Cancellations", "Settlements"],
    brandColor: "#06C167",
  },
  {
    id: "deliveroo",
    name: "Deliveroo",
    category: "Delivery",
    row: 2,
    status: "representative",
    dataUnlocked: ["Orders", "Rider waits", "Refunds"],
    brandColor: "#00CCBC",
  },
  {
    id: "doordash",
    name: "DoorDash",
    category: "Delivery",
    row: 2,
    status: "representative",
    dataUnlocked: ["Orders", "Menu sync", "Fees"],
    brandColor: "#FF3008",
  },
] as const;

export function marqueeRow(row: 1 | 2): MarqueeItem[] {
  return MARQUEE_ITEMS.filter((i) => i.row === row);
}
