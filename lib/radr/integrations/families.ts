/**
 * Integration families — filter connect UX by operating profile.
 */

export type IntegrationFamily =
  | "POS"
  | "PMS"
  | "RESERVATIONS"
  | "CHANNEL_MANAGER"
  | "RMS"
  | "LABOR"
  | "HOUSEKEEPING"
  | "ACCOUNTING"
  | "PAYMENTS"
  | "SUPPLIERS"
  | "DELIVERY"
  | "CRM"
  | "GUEST_MESSAGING"
  | "MAINTENANCE"
  | "EVENTS"
  | "WEATHER"
  | "LOCAL_EVENTS"
  | "CRS";

export type IntegrationProvider = {
  id: string;
  label: string;
  family: IntegrationFamily;
  /** Profiles that should see this first. */
  profiles?: string[];
};

export const INTEGRATION_FAMILY_LABEL: Record<IntegrationFamily, string> = {
  POS: "Point of sale",
  PMS: "Property management",
  RESERVATIONS: "Reservations",
  CHANNEL_MANAGER: "Channel manager",
  RMS: "Revenue management",
  LABOR: "Labor / workforce",
  HOUSEKEEPING: "Housekeeping",
  ACCOUNTING: "Accounting",
  PAYMENTS: "Payments",
  SUPPLIERS: "Suppliers",
  DELIVERY: "Delivery",
  CRM: "CRM",
  GUEST_MESSAGING: "Guest messaging",
  MAINTENANCE: "Maintenance",
  EVENTS: "Events",
  WEATHER: "Weather",
  LOCAL_EVENTS: "Local events",
  CRS: "Central reservation",
};

/** Soft-connect catalog (demo request, not live OAuth). */
export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  { id: "toast", label: "Toast", family: "POS", profiles: ["restaurant_full_service", "bar"] },
  { id: "lightspeed", label: "Lightspeed", family: "POS", profiles: ["restaurant_full_service", "bar"] },
  { id: "sevenrooms", label: "SevenRooms", family: "RESERVATIONS", profiles: ["restaurant_full_service"] },
  { id: "opentable", label: "OpenTable", family: "RESERVATIONS", profiles: ["restaurant_full_service"] },
  { id: "deputy", label: "Deputy", family: "LABOR" },
  { id: "mews", label: "Mews", family: "PMS", profiles: ["boutique_hotel", "hotel", "serviced_apartments"] },
  { id: "opera", label: "Oracle Opera", family: "PMS", profiles: ["hotel", "resort_mixed"] },
  { id: "cloudbeds", label: "Cloudbeds", family: "PMS", profiles: ["boutique_hotel", "vacation_rental"] },
  { id: "siteminder", label: "SiteMinder", family: "CHANNEL_MANAGER", profiles: ["boutique_hotel", "hotel"] },
  { id: "airbnb", label: "Airbnb", family: "CHANNEL_MANAGER", profiles: ["vacation_rental"] },
  { id: "booking", label: "Booking.com", family: "CHANNEL_MANAGER", profiles: ["boutique_hotel", "hotel", "vacation_rental"] },
  { id: "xero", label: "Xero", family: "ACCOUNTING" },
  { id: "quickbooks", label: "QuickBooks", family: "ACCOUNTING" },
];

export function providersForProfile(
  profileId: string | null | undefined,
  families: string[] | null | undefined,
): IntegrationProvider[] {
  const fam = new Set(families ?? []);
  return INTEGRATION_PROVIDERS.filter((p) => {
    if (fam.size > 0 && !fam.has(p.family)) return false;
    if (!p.profiles || p.profiles.length === 0) return true;
    if (!profileId) return true;
    return p.profiles.includes(profileId);
  });
}
