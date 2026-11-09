/** Public, source-reviewed storage inventory. No runtime credentials or customer data. */
export const PRIVACY_NOTICE_VERSION = "2026-11-05";
export const PRIVACY_REVIEW_DATE = "5 November 2026";
export const STORAGE_INVENTORY = [
  {
    name: "radr_demo_access",
    type: "HTTP-only cookie",
    provider: "RADR · first party",
    purpose: "Signed permission to explore fictional demo screens. Contains a demo scope, random nonce and expiry, with no contact details or account identity. Does not grant workspace or API access.",
    duration: "8 hours",
    when: "Opening the fictional demo from its introduction form",
    category: "Essential / requested demo",
  },
  {
    name: "radr.cookie-preferences.v1",
    type: "Local storage",
    provider: "RADR · first party",
    purpose:
      "Records essential, analytics and marketing choices, version and the time you saved them. Contains no contact details.",
    duration:
      "Choice valid for 180 days. The stored record remains until replaced or cleared in your browser.",
    when: "When you save a cookie choice",
    category: "Privacy choice",
  },
  {
    name: "radr.cookie-prompt-dismissed.v1",
    type: "Session storage",
    provider: "RADR · first party",
    purpose:
      "Remembers that you closed the privacy prompt in this tab. It never grants analytics or marketing consent.",
    duration: "For the tab session",
    when: "Closing the prompt without saving, or following its policy links",
    category: "Privacy choice",
  },
  {
    name: "radr_locale",
    type: "Cookie",
    provider: "RADR · first party",
    purpose: "Remembers the selected website language.",
    duration: "Up to 1 year",
    when: "Language routing or selection",
    category: "Essential / preference",
  },
  {
    name: "better-auth.session_token",
    type: "HttpOnly cookie",
    provider: "RADR · Better Auth software",
    purpose:
      "Authenticates a product session. Production deployments use the Secure cookie prefix and Secure attribute.",
    duration:
      "Configured session lifetime up to 7 days; sessions may be refreshed or revoked earlier.",
    when: "After product authentication",
    category: "Essential",
  },
  {
    name: "better-auth.session_data",
    type: "HttpOnly cookie",
    provider: "RADR · Better Auth software",
    purpose:
      "Short-lived authentication session cache. The authentication library may also create flow-specific security cookies.",
    duration: "Session cache: up to 5 minutes",
    when: "Authenticated product flows",
    category: "Essential",
  },
  {
    name: "radr-org-id",
    type: "HttpOnly cookie",
    provider: "RADR · first party",
    purpose:
      "Remembers the selected organization. The server checks membership; this cookie alone does not authorize access.",
    duration: "Up to 1 year",
    when: "Selecting an authenticated workspace",
    category: "Essential / preference",
  },
  {
    name: "radr_report_access",
    type: "HttpOnly cookie",
    provider: "RADR · first party",
    purpose:
      "Signed report identifier and expiry, without lead contact details. Enables the requested report download under /api/reports.",
    duration: "30 minutes",
    when: "After a successfully delivered report request",
    category: "Essential / requested download",
  },
  {
    name: "Product and demo preferences (radr.*)",
    type: "Local / session storage",
    provider: "RADR · first party",
    purpose:
      "Remembers requested UI choices such as location, layout drafts, favorites, demo progress and dismissed guidance. These records are not advertising identifiers.",
    duration:
      "Local storage until reset or cleared; session storage for the tab session.",
    when: "Using the corresponding product or demo feature",
    category: "Functional preferences",
  },
] as const;
