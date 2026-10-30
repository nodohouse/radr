/** Local vendor marks — Simple Icons where available, monogram wells otherwise. */
const VENDOR_SLUG: Record<string, string> = {
  lightspeed: "lightspeed",
  sevenrooms: "sevenrooms",
  "toast-kds": "toast",
  toast: "toast",
  deliverect: "deliverect",
  xero: "xero",
  mews: "mews",
  opentable: "opentable",
  resy: "resy",
  thefork: "thefork",
  quandoo: "quandoo",
  square: "square",
  clover: "clover",
  oracle: "oracle",
  ncr: "ncr",
  deputy: "deputy",
  planday: "planday",
  personio: "personio",
  homebase: "homebase",
  stripe: "stripe",
  adyen: "adyen",
  worldpay: "worldpay",
  "uber-eats": "uber-eats",
  ubereats: "uber-eats",
  deliveroo: "deliveroo",
  doordash: "doordash",
  wolt: "wolt",
  netsuite: "netsuite",
  quickbooks: "quickbooks",
  sage: "sage",
  exact: "exact",
  datev: "datev",
  "toast-pos": "toast",
  "oracle-micros": "oracle",
  "opera-cloud": "oracle",
};

export function vendorSlugFor(idOrName: string): string | null {
  const key = idOrName.trim().toLowerCase().replace(/\s+/g, "-");
  if (VENDOR_SLUG[key]) return VENDOR_SLUG[key];
  if (VENDOR_SLUG[idOrName]) return VENDOR_SLUG[idOrName];
  return null;
}

export function VendorLogo({
  id,
  name,
  size = 36,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const slug = vendorSlugFor(id) ?? vendorSlugFor(name);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className="rp-vendor-logo"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {slug ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/vendors/${slug}.svg`}
          alt=""
          width={size}
          height={size}
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const fb = el.nextElementSibling as HTMLElement | null;
            if (fb) fb.hidden = false;
          }}
        />
      ) : null}
      <span className="rp-vendor-fallback" hidden={Boolean(slug)}>
        {initials}
      </span>
    </span>
  );
}

export type ConnectionCategory =
  | "POS"
  | "Reservations"
  | "Delivery"
  | "Payments"
  | "Accounting"
  | "Workforce"
  | "Inventory"
  | "Hotel PMS"
  | "Revenue"
  | "External";

export const CONNECTION_CATEGORIES: ConnectionCategory[] = [
  "POS",
  "Reservations",
  "Delivery",
  "Payments",
  "Accounting",
  "Workforce",
  "Inventory",
  "Hotel PMS",
  "Revenue",
  "External",
];

/**
 * Honest catalog statuses.
 * CONNECTED is never set here — it only comes from live source rows.
 * AVAILABLE = integration exists, not yet connected for this org.
 * REQUEST_ACCESS = partner / enterprise approval needed.
 * PLANNED = on roadmap, not shippable today.
 * CUSTOM = bring-your-own feed (API, file, inbox).
 */
export type CatalogStatus =
  | "AVAILABLE"
  | "REQUEST_ACCESS"
  | "PLANNED"
  | "CUSTOM";

export type CatalogWorld = "restaurant" | "hotel";

export type CatalogEntry = {
  id: string;
  name: string;
  /** Short sub-label (legacy `domain`). */
  domain: string;
  category: ConnectionCategory;
  status: CatalogStatus;
  /** What data comes in. */
  data: string;
  /** What RADR can decide / verify once connected. */
  unlocks: string;
  /** Omit for both worlds. */
  worlds?: CatalogWorld[];
};

const R: CatalogWorld[] = ["restaurant"];
const H: CatalogWorld[] = ["hotel"];

/** Catalog vendors for browse — never auto-connected; PLANNED is never CONNECTED. */
export const CONNECTION_CATALOG: CatalogEntry[] = [
  // POS
  { id: "lightspeed", name: "Lightspeed", domain: "POS", category: "POS", status: "AVAILABLE", data: "Orders · menu · tickets · voids", unlocks: "Margin per cover, menu mix, service pace", worlds: R },
  { id: "toast", name: "Toast POS", domain: "POS", category: "POS", status: "AVAILABLE", data: "Checks · items · labor punches", unlocks: "Revenue truth, menu engineering, comp/void leakage", worlds: R },
  { id: "square", name: "Square", domain: "POS", category: "POS", status: "AVAILABLE", data: "Orders · items · payments", unlocks: "Daily revenue and item-level margin", worlds: R },
  { id: "clover", name: "Clover", domain: "POS", category: "POS", status: "REQUEST_ACCESS", data: "Orders · tenders · items", unlocks: "Sales baseline for peak forecasting", worlds: R },
  { id: "oracle-micros", name: "Oracle MICROS", domain: "POS", category: "POS", status: "REQUEST_ACCESS", data: "Checks · revenue centers · menu", unlocks: "Multi-site sales truth for group estates", worlds: R },
  { id: "ncr", name: "NCR Aloha", domain: "POS", category: "POS", status: "PLANNED", data: "Checks · items · labor", unlocks: "Roadmap — not available yet", worlds: R },

  // Reservations
  { id: "sevenrooms", name: "SevenRooms", domain: "Reservations", category: "Reservations", status: "AVAILABLE", data: "Covers · waitlist · guest profiles", unlocks: "Booking pace, no-show exposure, guest value", worlds: R },
  { id: "opentable", name: "OpenTable", domain: "Reservations", category: "Reservations", status: "AVAILABLE", data: "Reservations · covers · cancellations", unlocks: "Forward covers for kitchen and labor load", worlds: R },
  { id: "resy", name: "Resy", domain: "Reservations", category: "Reservations", status: "AVAILABLE", data: "Reservations · notes · no-shows", unlocks: "Pace vs forecast, cancellation recovery", worlds: R },
  { id: "thefork", name: "TheFork", domain: "Reservations", category: "Reservations", status: "REQUEST_ACCESS", data: "Bookings · promotions · guests", unlocks: "Channel mix and discount-led demand", worlds: R },
  { id: "quandoo", name: "Quandoo", domain: "Reservations", category: "Reservations", status: "PLANNED", data: "Bookings · covers", unlocks: "Roadmap — not available yet", worlds: R },

  // Delivery
  { id: "deliverect", name: "Deliverect", domain: "Delivery", category: "Delivery", status: "AVAILABLE", data: "Aggregated delivery orders · channel fees", unlocks: "Delivery load vs kitchen capacity, fee leakage", worlds: R },
  { id: "uber-eats", name: "Uber Eats", domain: "Delivery", category: "Delivery", status: "AVAILABLE", data: "Orders · refunds · prep times", unlocks: "Refund risk and throttle decisions", worlds: R },
  { id: "deliveroo", name: "Deliveroo", domain: "Delivery", category: "Delivery", status: "AVAILABLE", data: "Orders · rider waits · refunds", unlocks: "Delivery lateness vs service pace", worlds: R },
  { id: "doordash", name: "DoorDash", domain: "Delivery", category: "Delivery", status: "REQUEST_ACCESS", data: "Orders · menu sync", unlocks: "Channel margin by platform", worlds: R },
  { id: "wolt", name: "Wolt", domain: "Delivery", category: "Delivery", status: "PLANNED", data: "Orders · prep times", unlocks: "Roadmap — not available yet", worlds: R },

  // Payments
  { id: "stripe", name: "Stripe", domain: "Payments", category: "Payments", status: "AVAILABLE", data: "Charges · payouts · disputes", unlocks: "Payout reconciliation, dispute exposure" },
  { id: "adyen", name: "Adyen", domain: "Payments", category: "Payments", status: "REQUEST_ACCESS", data: "Settlements · fees · chargebacks", unlocks: "Settlement evidence for verified value" },
  { id: "worldpay", name: "Worldpay", domain: "Payments", category: "Payments", status: "PLANNED", data: "Settlements · fees", unlocks: "Roadmap — not available yet" },

  // Accounting
  { id: "xero", name: "Xero", domain: "Accounting", category: "Accounting", status: "AVAILABLE", data: "AP ledger · bills · credit notes", unlocks: "Supplier variance proof, credit verification" },
  { id: "quickbooks", name: "QuickBooks", domain: "Accounting", category: "Accounting", status: "AVAILABLE", data: "Bills · vendors · payments", unlocks: "AP contract vs invoice checks" },
  { id: "sage", name: "Sage", domain: "Accounting", category: "Accounting", status: "REQUEST_ACCESS", data: "Purchase ledger · vendors", unlocks: "Supplier rate variance evidence" },
  { id: "datev", name: "DATEV", domain: "Accounting", category: "Accounting", status: "REQUEST_ACCESS", data: "Postings · cost centres", unlocks: "German estate cost allocation" },
  { id: "netsuite", name: "NetSuite", domain: "Accounting", category: "Accounting", status: "REQUEST_ACCESS", data: "ERP ledger · POs · budgets", unlocks: "Plan vs actual across entities" },
  { id: "exact", name: "Exact", domain: "Accounting", category: "Accounting", status: "PLANNED", data: "Ledger · invoices", unlocks: "Roadmap — not available yet" },
  { id: "invoice-inbox", name: "Supplier invoice inbox", domain: "Invoices", category: "Accounting", status: "CUSTOM", data: "Forwarded PDF / e-invoice attachments", unlocks: "Invoice vs contract variance without an ERP" },

  // Workforce
  { id: "planday", name: "Planday", domain: "Workforce", category: "Workforce", status: "AVAILABLE", data: "Rosters · shifts · hours", unlocks: "Labor vs forecast, rebalance before agency" },
  { id: "deputy", name: "Deputy", domain: "Workforce", category: "Workforce", status: "AVAILABLE", data: "Schedules · clock-ins · cost", unlocks: "Labor hour exposure, understaffed peaks" },
  { id: "personio", name: "Personio", domain: "Workforce", category: "Workforce", status: "REQUEST_ACCESS", data: "Headcount · contracts · absences", unlocks: "Absence-aware capacity planning" },
  { id: "homebase", name: "Homebase", domain: "Workforce", category: "Workforce", status: "PLANNED", data: "Schedules · timesheets", unlocks: "Roadmap — not available yet" },

  // Inventory
  { id: "marketman", name: "MarketMan", domain: "Inventory", category: "Inventory", status: "AVAILABLE", data: "Stock counts · POs · par levels", unlocks: "Run-out forecasts, auto-prepared reorders", worlds: R },
  { id: "apicbase", name: "Apicbase", domain: "Inventory", category: "Inventory", status: "REQUEST_ACCESS", data: "Recipes · stock · supplier catalogs", unlocks: "Recipe cost drift and supplier price checks", worlds: R },
  { id: "crunchtime", name: "Crunchtime", domain: "Inventory", category: "Inventory", status: "PLANNED", data: "Inventory · prep sheets", unlocks: "Roadmap — not available yet", worlds: R },
  { id: "housekeeping-counts", name: "Amenity & linen counts", domain: "Inventory", category: "Inventory", status: "CUSTOM", data: "Cart counts via voice / camera capture", unlocks: "House-standard gaps before arrival waves", worlds: H },

  // Hotel PMS
  { id: "mews", name: "Mews", domain: "PMS", category: "Hotel PMS", status: "AVAILABLE", data: "Rooms · stays · channel inventory", unlocks: "Pickup, ADR and readiness vs arrivals", worlds: H },
  { id: "apaleo", name: "Apaleo", domain: "PMS", category: "Hotel PMS", status: "AVAILABLE", data: "Reservations · rates · availability", unlocks: "Pickup pace and OTA release decisions", worlds: H },
  { id: "cloudbeds", name: "Cloudbeds", domain: "PMS", category: "Hotel PMS", status: "REQUEST_ACCESS", data: "Reservations · rooms · folios", unlocks: "Occupancy and arrival-wave readiness", worlds: H },
  { id: "opera-cloud", name: "Oracle Opera Cloud", domain: "PMS", category: "Hotel PMS", status: "REQUEST_ACCESS", data: "Reservations · housekeeping · rates", unlocks: "Enterprise estate coverage", worlds: H },
  { id: "protel", name: "Protel", domain: "PMS", category: "Hotel PMS", status: "PLANNED", data: "Reservations · rooms", unlocks: "Roadmap — not available yet", worlds: H },

  // Revenue
  { id: "siteminder", name: "SiteMinder", domain: "Channel manager", category: "Revenue", status: "AVAILABLE", data: "Channel rates · inventory · bookings", unlocks: "Direct vs OTA mix, hold / release timing", worlds: H },
  { id: "ideas", name: "IDeaS", domain: "RMS", category: "Revenue", status: "REQUEST_ACCESS", data: "Rate recommendations · forecasts", unlocks: "Compare RMS forecast with operating reality", worlds: H },
  { id: "duetto", name: "Duetto", domain: "RMS", category: "Revenue", status: "PLANNED", data: "Rates · forecast", unlocks: "Roadmap — not available yet", worlds: H },

  // External
  { id: "weather", name: "Weather", domain: "External", category: "External", status: "AVAILABLE", data: "Forecast · precipitation · temperature", unlocks: "Terrace, walk-in and delivery demand shifts" },
  { id: "events", name: "Local events", domain: "External", category: "External", status: "AVAILABLE", data: "Concerts · fairs · sports calendar", unlocks: "Demand spikes you did not book yet" },
  { id: "reviews", name: "Guest reviews", domain: "External", category: "External", status: "REQUEST_ACCESS", data: "Public review scores and themes", unlocks: "Service-time to sentiment links" },
  { id: "holidays", name: "Holidays & school breaks", domain: "External", category: "External", status: "PLANNED", data: "Public / school calendars", unlocks: "Roadmap — not available yet" },
  { id: "custom-api", name: "Custom API & webhooks", domain: "Custom", category: "External", status: "CUSTOM", data: "Your JSON events and endpoints", unlocks: "Bring any system of record into the twin" },
  { id: "sftp", name: "CSV / SFTP import", domain: "Custom", category: "External", status: "CUSTOM", data: "Scheduled file drops", unlocks: "Legacy systems with no API" },
];

const DOMAIN_CATEGORY: Record<string, ConnectionCategory> = {
  POS: "POS",
  Kitchen: "POS",
  Reservations: "Reservations",
  Delivery: "Delivery",
  Payments: "Payments",
  Accounting: "Accounting",
  Labor: "Workforce",
  Workforce: "Workforce",
  Inventory: "Inventory",
  PMS: "Hotel PMS",
  Revenue: "Revenue",
};

/** Category for a live source row (by its domain). */
export function categoryForDomain(domain: string): ConnectionCategory {
  return DOMAIN_CATEGORY[domain] ?? "External";
}
