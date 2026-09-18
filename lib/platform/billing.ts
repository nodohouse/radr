/**
 * Billing readiness model - schema-level, no complex UI.
 */

export type PlanCode = "trial" | "core" | "group" | "enterprise";

export type BillingStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type OrganizationSubscription = {
  id: string;
  organizationId: string;
  plan: PlanCode;
  status: BillingStatus;
  locationLimit: number;
  locationCount: number;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export function canAddLocation(sub: OrganizationSubscription): boolean {
  if (sub.status === "canceled") return false;
  return sub.locationCount < sub.locationLimit;
}

export function defaultTrialSubscription(
  organizationId: string,
): OrganizationSubscription {
  return {
    id: `sub_${organizationId}`,
    organizationId,
    plan: "trial",
    status: "trialing",
    locationLimit: 3,
    locationCount: 1,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
