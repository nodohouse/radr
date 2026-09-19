/**
 * RADR commercial packaging — public pricing page.
 *
 * Motions: Pilot (paid proof) · Core (product) · Control (govern + scale).
 * No free tier. No list prices. No seat tax. No per-Decision charges.
 * BUY / LABOR / SELL / RECOVER are lenses — never separately priced modules.
 *
 * Capability honesty aligns with lib/radr/capabilityStatus.ts.
 */

export type PlanId = "pilot" | "core" | "control";

export const pricingConfig = {
  pilot: {
    id: "pilot" as const,
    name: "RADR Pilot",
    verb: "Prove",
    cta: { href: "/contact?plan=pilot", label: "Talk to us about a Pilot" },
  },
  core: {
    id: "core" as const,
    name: "RADR Core",
    verb: "Decide + Verify",
    cta: { href: "/contact?plan=core", label: "Discuss Core" },
  },
  control: {
    id: "control" as const,
    name: "RADR Control",
    verb: "Govern + Scale",
    cta: { href: "/contact?plan=control", label: "Discuss Control" },
  },
  talkHref: "/contact" as const,
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

/** Prove → Deploy → Scale */
export const expansionSteps = [
  {
    id: "prove",
    label: "Prove",
    title: "One operating problem.",
    body: "A paid Pilot on one location, defined systems, and a measurable outcome.",
  },
  {
    id: "deploy",
    label: "Deploy",
    title: "Make RADR part of one operation.",
    body: "Core connects the stack, decides what matters, and verifies what changed.",
  },
  {
    id: "scale",
    label: "Scale",
    title: "Govern Decisions across locations.",
    body: "Control prepares, approves, and learns across the group.",
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
