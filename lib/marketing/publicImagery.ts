/**
 * Public imagery registry — native dimensions, safe CSS render caps, focals.
 * Facility masters are 1152×864. Never render above ~576 CSS px @2x.
 * Audit is for QA — not a public page.
 */

export type PublicImageMeta = {
  src: string;
  alt: string;
  nativeWidth: number;
  nativeHeight: number;
  /** Max CSS width that stays sharp at DPR 2 */
  cssMax: number;
  focalX: string;
  focalY: string;
  credit?: string;
};

export const FACILITY_NATIVE = { w: 1152, h: 864 } as const;
/** 1152 / 2 = 576 — keep a safety margin for soft JPEG */
export const FACILITY_CSS_MAX = 520;

export const PUBLIC_IMAGES = {
  "berlin-dining": {
    src: "/demo/facilities/berlin-dining.jpg",
    alt: "Active restaurant dining room during service",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 520,
    focalX: "50%",
    focalY: "40%",
    credit: "Restaurant service",
  },
  "berlin-bar": {
    src: "/demo/facilities/berlin-bar.jpg",
    alt: "Hospitality service during an active shift",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 480,
    focalX: "45%",
    focalY: "35%",
    credit: "Restaurant operations",
  },
  "berlin-terrace": {
    src: "/demo/facilities/berlin-terrace.jpg",
    alt: "Outdoor hospitality terrace during service",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 480,
    focalX: "50%",
    focalY: "45%",
    credit: "Terrace service",
  },
  "canal-deluxe-king": {
    src: "/demo/facilities/canal-deluxe-king.jpg",
    alt: "Hotel guest room — operations behind the stay",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 440,
    focalX: "55%",
    focalY: "45%",
    credit: "Hotel operations",
  },
  "lisbon-onebed": {
    src: "/demo/facilities/lisbon-onebed.jpg",
    alt: "Serviced apartment interior — turnover and operations",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 480,
    focalX: "50%",
    focalY: "40%",
    credit: "Serviced apartment",
  },
  "lisbon-studio": {
    src: "/demo/facilities/lisbon-studio.jpg",
    alt: "Compact hospitality living space",
    nativeWidth: 1152,
    nativeHeight: 864,
    cssMax: 480,
    focalX: "50%",
    focalY: "42%",
    credit: "Serviced apartment",
  },
} as const satisfies Record<string, PublicImageMeta>;

export type PublicImageId = keyof typeof PUBLIC_IMAGES;

/** Blog article hero mapping — thematic, sharp-capped. */
export const BLOG_HERO_IMAGE: Record<
  string,
  { imageId: PublicImageId; panel: "sand" | "mint" | "ivory" }
> = {
  "credits-flagged-never-cashed": { imageId: "berlin-bar", panel: "sand" },
  "the-decision-gap": { imageId: "berlin-dining", panel: "ivory" },
  "what-is-hospitality-margin-intelligence": {
    imageId: "berlin-terrace",
    panel: "mint",
  },
  "multi-location-hospitality-control": {
    imageId: "lisbon-studio",
    panel: "sand",
  },
  "hospitality-recovery-and-leakage": { imageId: "berlin-bar", panel: "sand" },
  "peak-service-understaffed": { imageId: "berlin-dining", panel: "mint" },
  "supplier-price-variance": { imageId: "berlin-bar", panel: "sand" },
  "what-verified-value-means": { imageId: "canal-deluxe-king", panel: "ivory" },
  "ask-radr-operating-evidence": { imageId: "lisbon-onebed", panel: "mint" },
};

/**
 * Internal QA audit rows (not rendered publicly).
 * STATUS: PASS = render ≤ cssMax; FAIL = would soft-stretch.
 */
export const IMAGE_AUDIT_ROWS = [
  {
    route: "/en",
    asset: "berlin-dining.jpg",
    source: "1152×864",
    maxRender: "520px",
    status: "PASS",
  },
  {
    route: "/en",
    asset: "berlin-bar.jpg",
    source: "1152×864",
    maxRender: "480px",
    status: "PASS",
  },
  {
    route: "/en",
    asset: "canal-deluxe-king.jpg",
    source: "1152×864",
    maxRender: "440px",
    status: "PASS",
  },
  {
    route: "/en/company",
    asset: "berlin-dining full-bleed hero",
    source: "1152×864",
    maxRender: "was 100vw → FAIL",
    status: "FIXED → editorial split ≤520px",
  },
  {
    route: "/en/blog/*",
    asset: "facility heroes",
    source: "1152×864",
    maxRender: "≤520px + panel",
    status: "PASS",
  },
] as const;
