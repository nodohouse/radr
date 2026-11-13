export const PUBLIC_PLAN_IDS = ["start", "expand", "enterprise"] as const;
export type PublicPlanId = (typeof PUBLIC_PLAN_IDS)[number];
export type DemoWorld = "hotel" | "restaurant";
export function publicPlan(value: unknown): PublicPlanId | null {
  return typeof value === "string" &&
    (PUBLIC_PLAN_IDS as readonly string[]).includes(value)
    ? (value as PublicPlanId)
    : null;
}
export function planName(plan: PublicPlanId) {
  return plan === "start"
    ? "Core"
    : plan === "expand"
      ? "Expand"
      : "Enterprise";
}
export function planRegistrationHref(plan: PublicPlanId) {
  if (plan === "enterprise") return "/contact?plan=enterprise";
  return `/signup?intent=workspace&plan=${plan}`;
}
export function planSetupPreviewHref(plan: PublicPlanId, vertical: DemoWorld) {
  if (plan === "enterprise") return "/contact?plan=enterprise";
  return `/onboarding/preview?plan=${plan}&vertical=${vertical}`;
}

/** Larger footprints require a sales discussion, rather than a fixed capacity offer. */
export function planForLocations(locations: number): PublicPlanId | null {
  if (!Number.isSafeInteger(locations) || locations < 1) return null;
  return locations === 1 ? "start" : locations <= 5 ? "expand" : "enterprise";
}
