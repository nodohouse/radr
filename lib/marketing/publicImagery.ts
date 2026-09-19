/**
 * Global public marketing imagery registry.
 * HARD RULE: each photographic `src` may appear on at most one editorial ID.
 * Product screenshots / mockups may repeat intentionally.
 *
 * Facility masters are 1152×864 — render ≤ cssMax (never upscale).
 */

export type MarketingImageKind = "photo" | "product";

export type MarketingImage = {
  id: string;
  src: string;
  alt: string;
  nativeWidth: number;
  nativeHeight: number;
  cssMax: number;
  focalX: string;
  focalY: string;
  route: string;
  usage: string;
  topic: string;
  vertical:
    | "restaurant"
    | "hotel"
    | "serviced_apartment"
    | "finance"
    | "labor"
    | "cross"
    | "product";
  kind: MarketingImageKind;
  credit?: string;
};

const FAC = { w: 1152, h: 864 } as const;
const MKT = { w: 1280, h: 720 } as const;

/**
 * ONE photograph = ONE editorial use.
 * Assignments are intentional and exclusive.
 */
export const MARKETING_IMAGES = {
  /* ── HOME evidence ───────────────────────────────── */
  homeRestaurantEconomics: {
    id: "homeRestaurantEconomics",
    src: "/demo/facilities/berlin-dining.jpg",
    alt: "Active restaurant dining room during service",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 520,
    focalX: "50%",
    focalY: "40%",
    route: "/en",
    usage: "Evidence 01 · restaurant economics",
    topic: "thin-margin hospitality service",
    vertical: "restaurant",
    kind: "photo",
    credit: "Restaurant service",
  },
  homeFoodPressure: {
    id: "homeFoodPressure",
    src: "/menu/menu-tuna-tataki.jpg",
    alt: "Plated tuna dish — food cost under service pressure",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "45%",
    route: "/en",
    usage: "Evidence 02 · food cost pressure",
    topic: "food cost / plated contribution",
    vertical: "restaurant",
    kind: "photo",
    credit: "Kitchen / menu",
  },
  homeHotelFragmentation: {
    id: "homeHotelFragmentation",
    src: "/marketing/hotel-ota-soldout.png",
    alt: "Hotel channel inventory pressure across systems",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 520,
    focalX: "50%",
    focalY: "40%",
    route: "/en",
    usage: "Evidence 03 · hotel system fragmentation",
    topic: "hotel channel / core-system fragmentation",
    vertical: "hotel",
    kind: "photo",
    credit: "Hotel operations",
  },

  /* ── COMPANY ─────────────────────────────────────── */
  companyHero: {
    id: "companyHero",
    src: "/menu/menu-salmon-teriyaki.jpg",
    alt: "Close-up plated salmon — hospitality craft",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 520,
    focalX: "48%",
    focalY: "42%",
    route: "/en/company",
    usage: "Company hero",
    topic: "hospitality craft / personal origin",
    vertical: "restaurant",
    kind: "photo",
    credit: "Food craft",
  },
  companyFounderStory: {
    id: "companyFounderStory",
    src: "/menu/menu-wine.jpg",
    alt: "Beverage service detail — abstract hospitality craft",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "40%",
    route: "/en/company",
    usage: "Founder letter visual (editorial, not documentary)",
    topic: "service detail / abstract craft",
    vertical: "restaurant",
    kind: "photo",
    credit: "Service detail",
  },
  companyRestaurant: {
    id: "companyRestaurant",
    src: "/demo/facilities/berlin-terrace.jpg",
    alt: "Restaurant terrace during outdoor service",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 360,
    focalX: "50%",
    focalY: "45%",
    route: "/en/company",
    usage: "Environment · restaurant",
    topic: "restaurant service environment",
    vertical: "restaurant",
    kind: "photo",
  },
  companyHotel: {
    id: "companyHotel",
    src: "/marketing/hero-hotel-brief.png",
    alt: "Hotel operating brief — front-of-house context",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 360,
    focalX: "50%",
    focalY: "40%",
    route: "/en/company",
    usage: "Environment · hotel",
    topic: "hotel front office / arrival",
    vertical: "hotel",
    kind: "photo",
  },
  companyApartments: {
    id: "companyApartments",
    src: "/marketing/apt-orphan-gap.png",
    alt: "Serviced apartment stay gap — unit turnover economics",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 360,
    focalX: "50%",
    focalY: "45%",
    route: "/en/company",
    usage: "Environment · serviced apartment",
    topic: "unit turnover / orphan night",
    vertical: "serviced_apartment",
    kind: "photo",
  },
  companyGroup: {
    id: "companyGroup",
    src: "/marketing/hotel-direct-mix.png",
    alt: "Multi-channel hotel inventory mix across a portfolio",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 360,
    focalX: "50%",
    focalY: "42%",
    route: "/en/company",
    usage: "Environment · group / portfolio",
    topic: "multi-property channel economics",
    vertical: "hotel",
    kind: "photo",
  },

  /* ── BLOG heroes (unique per article) ────────────── */
  blogCreditsHero: {
    id: "blogCreditsHero",
    src: "/marketing/hero-tuna-supply.png",
    alt: "Supplier goods receiving — invoice and delivery evidence",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 520,
    focalX: "45%",
    focalY: "40%",
    route: "/en/blog/credits-flagged-never-cashed",
    usage: "Article hero",
    topic: "supplier credit / AP recovery",
    vertical: "finance",
    kind: "photo",
  },
  blogDecisionGapHero: {
    id: "blogDecisionGapHero",
    src: "/demo/facilities/berlin-bar.jpg",
    alt: "Active hospitality service — judgment between systems",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 520,
    focalX: "45%",
    focalY: "35%",
    route: "/en/blog/the-decision-gap",
    usage: "Article hero",
    topic: "Decision Gap / live operation",
    vertical: "restaurant",
    kind: "photo",
  },
  blogOperatingJudgmentHero: {
    id: "blogOperatingJudgmentHero",
    src: "/menu/menu-miso-aubergine.jpg",
    alt: "Plated dish during service — operating judgment on the floor",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "45%",
    route: "/en/blog/what-is-hospitality-margin-intelligence",
    usage: "Article hero",
    topic: "operating judgment / margin intelligence",
    vertical: "restaurant",
    kind: "photo",
  },
  blogMultiLocationHero: {
    id: "blogMultiLocationHero",
    src: "/demo/facilities/lisbon-studio.jpg",
    alt: "Serviced apartment interior across a multi-location portfolio",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "42%",
    route: "/en/blog/multi-location-hospitality-control",
    usage: "Article hero",
    topic: "multi-location control",
    vertical: "serviced_apartment",
    kind: "photo",
  },
  blogRecoverClockHero: {
    id: "blogRecoverClockHero",
    src: "/demo/facilities/canal-classic-queen.jpg",
    alt: "Hotel room waiting — perishable inventory with a clock",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "55%",
    focalY: "45%",
    route: "/en/blog/hospitality-recovery-and-leakage",
    usage: "Article hero",
    topic: "perishable value / interrupted inventory",
    vertical: "hotel",
    kind: "photo",
  },
  blogLaborHero: {
    id: "blogLaborHero",
    src: "/menu/menu-chicken.jpg",
    alt: "Kitchen dish during peak service — labor and capacity",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "45%",
    route: "/en/blog/peak-service-understaffed",
    usage: "Article hero",
    topic: "labor / peak service capacity",
    vertical: "labor",
    kind: "photo",
  },
  blogBuyHero: {
    id: "blogBuyHero",
    src: "/marketing/dish-tuna-tataki.png",
    alt: "Signature dish tied to supplier purchasing economics",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "40%",
    route: "/en/blog/supplier-price-variance",
    usage: "Article hero",
    topic: "supplier price variance / BUY",
    vertical: "finance",
    kind: "photo",
  },
  blogVerifiedHero: {
    id: "blogVerifiedHero",
    src: "/mockup-exports/radr-closed-loop-3840x2160.png",
    alt: "RADR closed-loop Verified Value product view",
    nativeWidth: 3840,
    nativeHeight: 2160,
    cssMax: 720,
    focalX: "50%",
    focalY: "40%",
    route: "/en/blog/what-verified-value-means",
    usage: "Article hero · product screenshot",
    topic: "Verified Value evidence chain",
    vertical: "product",
    kind: "product",
  },
  blogAskRadrHero: {
    id: "blogAskRadrHero",
    src: "/marketing/hero-apt-brief.png",
    alt: "Operator brief on a lightweight digital surface",
    nativeWidth: MKT.w,
    nativeHeight: MKT.h,
    cssMax: 480,
    focalX: "50%",
    focalY: "40%",
    route: "/en/blog/ask-radr-operating-evidence",
    usage: "Article hero",
    topic: "Ask RADR / operator interface",
    vertical: "product",
    kind: "photo",
  },

  /* ── CONTACT (optional single artifact) ──────────── */
  contactArtifact: {
    id: "contactArtifact",
    src: "/marketing/dish-truffle-pasta.png",
    alt: "Hospitality plate detail — conversion surface accent",
    nativeWidth: FAC.w,
    nativeHeight: FAC.h,
    cssMax: 320,
    focalX: "50%",
    focalY: "45%",
    route: "/en/contact",
    usage: "Contact accent",
    topic: "hospitality artifact",
    vertical: "restaurant",
    kind: "photo",
  },
} as const satisfies Record<string, MarketingImage>;

export type MarketingImageId = keyof typeof MARKETING_IMAGES;

export function marketingImage(id: MarketingImageId): MarketingImage {
  return MARKETING_IMAGES[id];
}

/** Blog slug → exclusive hero image id */
export const BLOG_HERO_BY_SLUG: Record<string, MarketingImageId> = {
  "credits-flagged-never-cashed": "blogCreditsHero",
  "the-decision-gap": "blogDecisionGapHero",
  "what-is-hospitality-margin-intelligence": "blogOperatingJudgmentHero",
  "multi-location-hospitality-control": "blogMultiLocationHero",
  "hospitality-recovery-and-leakage": "blogRecoverClockHero",
  "peak-service-understaffed": "blogLaborHero",
  "supplier-price-variance": "blogBuyHero",
  "what-verified-value-means": "blogVerifiedHero",
  "ask-radr-operating-evidence": "blogAskRadrHero",
};

/** Photographic src → owning editorial id (for uniqueness tests) */
export function photographicSrcOwners(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const img of Object.values(MARKETING_IMAGES)) {
    if (img.kind !== "photo") continue;
    const list = map.get(img.src) ?? [];
    list.push(img.id);
    map.set(img.src, list);
  }
  return map;
}

export function assertUniquePhotographicAssets(): string[] {
  const errors: string[] = [];
  for (const [src, ids] of photographicSrcOwners()) {
    if (ids.length > 1) {
      errors.push(`${src} assigned to multiple editorial IDs: ${ids.join(", ")}`);
    }
  }
  return errors;
}

/** Internal QA map — not rendered publicly */
export const PUBLIC_PHOTO_USAGE_REPORT = Object.values(MARKETING_IMAGES).map(
  (img) => ({
    asset: img.src,
    route: img.route,
    id: img.id,
    topic: img.topic,
    dimensions: `${img.nativeWidth}×${img.nativeHeight}`,
    cssMax: img.cssMax,
    kind: img.kind,
    usedElsewhere: "NO (registry exclusive)",
  }),
);

/** @deprecated — prefer MARKETING_IMAGES / marketingImage() */
export const PUBLIC_IMAGES = {
  "berlin-dining": MARKETING_IMAGES.homeRestaurantEconomics,
  "berlin-bar": MARKETING_IMAGES.blogDecisionGapHero,
  "berlin-terrace": MARKETING_IMAGES.companyRestaurant,
  "canal-deluxe-king": MARKETING_IMAGES.blogRecoverClockHero,
  "lisbon-onebed": MARKETING_IMAGES.companyApartments,
  "lisbon-studio": MARKETING_IMAGES.blogMultiLocationHero,
} as const;

export const FACILITY_NATIVE = { w: 1152, h: 864 } as const;
export const FACILITY_CSS_MAX = 520;

/** @deprecated */
export const BLOG_HERO_IMAGE: Record<
  string,
  { imageId: string; panel: "sand" | "mint" | "ivory" }
> = Object.fromEntries(
  Object.entries(BLOG_HERO_BY_SLUG).map(([slug, id]) => [
    slug,
    {
      imageId: id,
      panel:
        id.includes("Verified") || id.includes("Credits")
          ? ("sand" as const)
          : id.includes("Labor") || id.includes("Judgment")
            ? ("mint" as const)
            : ("ivory" as const),
    },
  ]),
);
