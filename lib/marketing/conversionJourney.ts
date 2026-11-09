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
    ? "14-day free trial"
    : plan === "expand"
      ? "Expand"
      : "Enterprise";
}
export function planRegistrationHref(plan: PublicPlanId) {
  return `/signup?intent=workspace&plan=${plan}`;
}
export function planSetupPreviewHref(plan: PublicPlanId, vertical: DemoWorld) {
  return `/onboarding/preview?plan=${plan}&vertical=${vertical}`;
}
