export const APP_NAME = "RADR";

/** Pass 2 supported formats: PDF, JPG/JPEG, PNG */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_FILES_PER_UPLOAD = 10;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const FEATURE_DOCUMENT_CHECKING =
  process.env.FEATURE_DOCUMENT_CHECKING === "true";

/**
 * Live Shift economic pulse.
 * Client-visible: NEXT_PUBLIC_FEATURE_LIVE_SHIFT
 * Default: on in DEMO/SANDBOX; off in LIVE unless feeds are ready.
 */
export const FEATURE_LIVE_SHIFT =
  process.env.NEXT_PUBLIC_FEATURE_LIVE_SHIFT !== "false";

/** Set true only when real POS/payments event feeds are wired for LIVE. */
export const LIVE_SHIFT_FEEDS_READY =
  process.env.NEXT_PUBLIC_LIVE_SHIFT_FEEDS === "true";

/** Countries shown in onboarding (ISO 3166-1 alpha-2). Expand later. */
export const ONBOARDING_COUNTRIES = [
  { code: "NL", name: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
  { code: "BE", name: "Belgium", currency: "EUR", timezone: "Europe/Brussels" },
  { code: "DE", name: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
  { code: "FR", name: "France", currency: "EUR", timezone: "Europe/Paris" },
  { code: "GB", name: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { code: "US", name: "United States", currency: "USD", timezone: "America/New_York" },
  { code: "IE", name: "Ireland", currency: "EUR", timezone: "Europe/Dublin" },
  { code: "ES", name: "Spain", currency: "EUR", timezone: "Europe/Madrid" },
  { code: "IT", name: "Italy", currency: "EUR", timezone: "Europe/Rome" },
  { code: "PT", name: "Portugal", currency: "EUR", timezone: "Europe/Lisbon" },
] as const;

export const CURRENCIES = ["EUR", "GBP", "USD", "CHF", "SEK", "DKK", "NOK"] as const;
