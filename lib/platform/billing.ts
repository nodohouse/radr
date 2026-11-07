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

/** Exact expiry boundary; missing or malformed entitlement dates fail closed. */
export function subscriptionAllowsWrites(
  sub: OrganizationSubscription,
  now = new Date(),
): boolean {
  if (!Number.isFinite(now.getTime())) return false;
  const end =
    sub.status === "trialing" ? sub.trialEndsAt : sub.currentPeriodEnd;
  if (sub.status !== "trialing" && sub.status !== "active") return false;
  return Boolean(
    end && Number.isFinite(Date.parse(end)) && Date.parse(end) > now.getTime(),
  );
}

export function canAddLocation(
  sub: OrganizationSubscription,
  now = new Date(),
): boolean {
  if (!subscriptionAllowsWrites(sub, now)) return false;
  return (
    Number.isInteger(sub.locationCount) &&
    sub.locationCount >= 0 &&
    Number.isInteger(sub.locationLimit) &&
    sub.locationLimit > sub.locationCount
  );
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
