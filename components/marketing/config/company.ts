/**
 * Central company / legal identity for marketing + legal pages.
 * Leave fields empty until counsel confirms. Never invent values.
 */
export const COMPANY = {
  brandName: "RADR",
  slogan: "Nothing off the RADR.",
  tagline: "Find the margin you’re losing — and prove you got it back.",
  beachhead: "Built for hospitality.",
  category: "Adaptive Decision System",
  vision: "Every complex operation on RADR.",
  domain: "radrup.com",
  siteUrl: "https://radrup.com",
  /** Public contact inbox: leave empty until live */
  email: "",
  privacyEmail: "",
  /** Legal entity (Imprint / Privacy controller): leave empty until confirmed */
  legalName: "",
  legalForm: "",
  addressLines: [] as string[],
  country: "",
  managingDirector: "",
  commercialRegister: "",
  registrationNumber: "",
  vatId: "",
  responsiblePerson: "",
  /** Governing law placeholder: counsel to confirm */
  governingLaw: "",
  disputeVenue: "",
  /** Last reviewed dates (ISO) for legal pages: update when counsel signs off */
  privacyUpdated: "",
  termsUpdated: "",
  imprintUpdated: "",
} as const;

export type CompanyConfig = typeof COMPANY;

export function hasValue(v: string | readonly string[] | undefined): boolean {
  if (Array.isArray(v)) return v.length > 0 && v.some((x) => x.trim().length > 0);
  return Boolean(v && String(v).trim().length > 0);
}

export function isLegalEntityComplete(): boolean {
  return (
    hasValue(COMPANY.legalName) &&
    hasValue(COMPANY.addressLines) &&
    hasValue(COMPANY.email)
  );
}

export function displayOrPending(value: string, pending = "To be published"): string {
  return hasValue(value) ? value : pending;
}

export function contactEmail(): string {
  return COMPANY.email || COMPANY.privacyEmail || "";
}
