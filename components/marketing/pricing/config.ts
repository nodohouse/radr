/**
 * RADR commercial packaging — public pricing page.
 * Motions: Start (Recovery Pilot) · Expand (RADR) · Enterprise (group scale).
 */

export type PlanId = "pilot" | "core" | "control";

export const pricingConfig = {
  pilot: {
    id: "pilot" as const,
    name: "Recovery Pilot",
    verb: "Prove",
    cta: { href: "/contact?plan=pilot", label: "Start a recovery pilot" },
  },
  core: {
    id: "core" as const,
    name: "Expand",
    verb: "RADR",
    cta: { href: "/contact?plan=core", label: "Discuss Expand" },
  },
  control: {
    id: "control" as const,
    name: "Enterprise",
    verb: "Group scale",
    cta: { href: "/contact?plan=control", label: "Discuss Enterprise" },
  },
  talkHref: "/contact?intent=recovery-pilot" as const,
  demoHref: "/demo" as const,
} as const;

/** How pricing scales — three concepts only. */
export const pricingDimensions = [
  {
    id: "locations",
    title: "Locations",
    body: "How much of the operation RADR covers.",
  },
  {
    id: "scope",
    title: "Operating scope",
    body: "The operational complexity RADR is responsible for understanding.",
  },
  {
    id: "responsibility",
    title: "Decision responsibility",
    body: "Whether RADR recommends, prepares, or governs.",
  },
] as const;

/** Start → Expand → Enterprise */
export const expansionSteps = [
  {
    id: "prove",
    label: "Start",
    title: "Prove recoverable value.",
    body: "A Recovery Pilot on one defined scope — measurable Verified outcomes.",
  },
  {
    id: "deploy",
    label: "Expand",
    title: "Make RADR the Decision layer.",
    body: "More locations, Decision classes, and connected evidence — with Verified Value and Memory.",
  },
  {
    id: "scale",
    label: "Enterprise",
    title: "RADR at group scale.",
    body: "Policies, approvals, governance, and enterprise controls across locations.",
  },
] as const;

export type CellTag = "yes" | "no" | "early" | "selected" | "pilot";

export type ResponsibilityGroup =
  | "scope"
  | "intelligence"
  | "proof"
  | "action"
  | "scale";

export type ResponsibilityRow = {
  group: ResponsibilityGroup;
  feature: string;
  pilot: CellTag;
  core: CellTag;
  control: CellTag;
};

/**
 * Commercial responsibility — not a 40-row SaaS matrix.
 * early = Early Access · selected = scoped in Pilot · pilot = Pilot-period memory
 */
export const responsibilityRows: ResponsibilityRow[] = [
  { group: "scope", feature: "Defined economic problem", pilot: "yes", core: "no", control: "no" },
  { group: "scope", feature: "Location(s)", pilot: "selected", core: "yes", control: "yes" },
  { group: "scope", feature: "Group / portfolio", pilot: "no", core: "no", control: "yes" },
  { group: "intelligence", feature: "Connected operating data", pilot: "yes", core: "yes", control: "yes" },
  { group: "intelligence", feature: "Cross-system Decisions", pilot: "yes", core: "yes", control: "yes" },
  { group: "intelligence", feature: "Operator context", pilot: "yes", core: "yes", control: "yes" },
  { group: "intelligence", feature: "Futures", pilot: "selected", core: "early", control: "early" },
  { group: "proof", feature: "Decision Trace", pilot: "yes", core: "yes", control: "yes" },
  { group: "proof", feature: "Verified Value", pilot: "yes", core: "yes", control: "yes" },
  { group: "proof", feature: "Operating Memory", pilot: "pilot", core: "early", control: "early" },
  { group: "action", feature: "Recommendations", pilot: "yes", core: "yes", control: "yes" },
  { group: "action", feature: "Prepared Actions", pilot: "no", core: "early", control: "yes" },
  { group: "action", feature: "Approval workflows", pilot: "no", core: "no", control: "yes" },
  { group: "scale", feature: "Multi-location governance", pilot: "no", core: "no", control: "yes" },
  { group: "scale", feature: "Group playbooks", pilot: "no", core: "no", control: "early" },
  { group: "scale", feature: "Portfolio value view", pilot: "no", core: "no", control: "yes" },
  { group: "scale", feature: "Advanced controls", pilot: "no", core: "no", control: "yes" },
];

export function cellLabel(tag: CellTag): string {
  if (tag === "yes") return "Yes";
  if (tag === "early") return "Early access";
  if (tag === "selected") return "Selected";
  if (tag === "pilot") return "Pilot scope";
  return "—";
}
