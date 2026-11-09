/** Images of fictional RADR operations. Marketing never mounts the product UI. */
export type PlatformSurfaceId =
  | "control"
  | "live"
  | "decisions"
  | "operations"
  | "house"
  | "intelligence"
  | "value"
  | "memory"
  | "health"
  | "connections";
export const PLATFORM_GALLERY = [
  {
    surface: "control",
    image: "control",
    alt: "RADR hotel Control Center with daily revenue, contribution and arrival readiness.",
    caption:
      "The operating brief. Priorities, performance and the next decision in one view.",
  },
  {
    surface: "live",
    image: "live-hotel",
    alt: "Three-dimensional hotel exterior with trees, landscaped paths and a highlighted guest floor.",
    caption:
      "The whole property. A landscaped exterior connects each floor to its room context.",
  },
  {
    surface: "live",
    image: "live-rooms",
    alt: "Hotel floor and Room 310 context showing an incoming shellfish allergy, birthday stay and readiness estimate.",
    caption:
      "The detail that matters. Room readiness, incoming guest needs and housekeeping ownership.",
  },
  {
    surface: "live",
    image: "live-restaurant",
    alt: "Restaurant service floor with table context, current guest needs and the next reservation.",
    caption:
      "Every service moment. Table context, guest requests and the next arrival.",
  },
  {
    surface: "decisions",
    image: "decisions",
    alt: "RADR Decisions screen showing hospitality decisions and their supporting context.",
    caption:
      "A decision worth reviewing. Evidence and operating priorities stay together.",
  },
  {
    surface: "operations",
    image: "operations",
    alt: "RADR Operations screen with service and readiness information.",
    caption:
      "The next wave. Understand readiness and operational pressure before handover.",
  },
  {
    surface: "house",
    image: "house",
    alt: "RADR Back of House screen for field evidence and operational readiness.",
    caption:
      "From the storeroom to the brief. Bring field evidence into the decision.",
  },
  {
    surface: "intelligence",
    image: "intelligence",
    alt: "RADR Intelligence screen with the economic lenses over the hospitality operating model.",
    caption:
      "The connection behind the number. Review the economics across the operation.",
  },
  {
    surface: "value",
    image: "value",
    alt: "RADR Value screen distinguishing expected outcomes from evidence-backed results.",
    caption:
      "Expectation meets evidence. Keep modeled effects and reviewed outcomes separate.",
  },
  {
    surface: "memory",
    image: "memory",
    alt: "RADR Memory screen showing the operation's decision history and retained context.",
    caption:
      "The operation remembers. Keep decision context for the next comparable situation.",
  },
  {
    surface: "health",
    image: "health",
    alt: "RADR Data Health screen showing evidence quality and sources needing attention.",
    caption:
      "Confidence starts at the source. Review freshness, quality and what needs attention.",
  },
  {
    surface: "connections",
    image: "connections",
    alt: "RADR Connections screen showing system sources and connection readiness.",
    caption:
      "One evidence layer. Understand source status before relying on a recommendation.",
  },
] as const satisfies readonly {
  surface: PlatformSurfaceId;
  image: string;
  alt: string;
  caption: string;
}[];
