import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  authenticationPolicies,
  locationAccess,
  locations,
  organizationMembers,
  organizations,
} from "@/lib/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { ONBOARDING_COUNTRIES } from "@/lib/constants";
import { newId } from "@/lib/ids";
import { slugifyOrgName } from "@/lib/identity/slug";
import { ROLE_BY_KEY } from "@/lib/platform/rbac";
import type { OnboardingInput } from "@/lib/validation";
import {
  DEFAULT_ONBOARDING,
  type OnboardingState,
  type VenueType,
} from "@/lib/onboarding/types";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { progressFromLegacyState } from "@/lib/onboarding/engine/progress";

export type CreateWorkspaceInput = OnboardingInput & {
  locationBand?: string;
  hqCity?: string;
  locationCity?: string;
  venueType?: VenueType;
  timezone?: string;
};

function asState(raw: unknown): OnboardingState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ONBOARDING };
  return { ...DEFAULT_ONBOARDING, ...(raw as OnboardingState) };
}

export async function createOrganizationWithLocation(params: {
  userId: string;
  input: CreateWorkspaceInput;
}) {
  const countryMeta = ONBOARDING_COUNTRIES.find(
    (c) => c.code === params.input.country,
  );
  const timezone =
    params.input.timezone ?? countryMeta?.timezone ?? "UTC";

  const organizationId = newId();
  const locationId = newId();
  const membershipId = newId();
  const now = new Date();

  const onboarding: OnboardingState = {
    path: "first_value",
    step: "goal",
    stage: "your_goal",
    milestones: {
      account_created: now.toISOString(),
      org_created: now.toISOString(),
      first_location_created: now.toISOString(),
    },
    organizationName: params.input.organizationName,
    locationBand: params.input.locationBand as OnboardingState["locationBand"],
    hqCity: params.input.hqCity,
    hqCountry: params.input.country,
    currency: params.input.currency,
    reportingCurrency: params.input.currency,
    timezone,
    locationTimezone: timezone,
    localCurrency: params.input.currency,
    locationName: params.input.locationName,
    locationCity: params.input.locationCity,
    locationCountry: params.input.country,
    venueType: params.input.venueType,
    operateFamilies: params.input.operateFamilies as OnboardingState["operateFamilies"],
    operateSubtypes: params.input.operateSubtypes as OnboardingState["operateSubtypes"],
    operatingUnits: params.input.operatingUnits as OnboardingState["operatingUnits"],
    roomCount: params.input.roomCount,
    role: params.input.role as OnboardingState["role"],
    roleLens: (params.input.role as OnboardingState["roleLens"]) ?? undefined,
    helpFocus: params.input.helpFocus as OnboardingState["helpFocus"],
    selectedKpis: params.input.selectedKpis,
    operatingProfileId: params.input.operatingProfileId,
    pendingSystem: params.input.pendingSystem,
    pendingSystemLabel: params.input.pendingSystemLabel,
    decisionClass: "supplier_ap",
    materialityThresholdMinor: 10000,
    demoEnabled: false,
    startedAt: now.toISOString(),
    ...progressFromLegacyState("goal"),
  };

  const slug = slugifyOrgName(
    params.input.organizationName,
    organizationId.slice(-6).toLowerCase(),
  );

  await db.insert(organizations).values({
    id: organizationId,
    name: params.input.organizationName,
    slug,
    country: params.input.country,
    currency: params.input.currency,
    timezone,
    status: "active",
    plan: "pilot",
    onboarding,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(organizationMembers).values({
    id: membershipId,
    organizationId,
    userId: params.userId,
    role: "OWNER",
    roleId: ROLE_BY_KEY.owner.id,
    status: "active",
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(locationAccess).values({
    id: newId(),
    membershipId,
    scope: "all",
    locationIds: [],
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(authenticationPolicies).values({
    id: newId(),
    organizationId,
    mfaRequired: false,
    ssoEnforced: false,
    allowedDomains: [],
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(locations).values({
    id: locationId,
    organizationId,
    name: params.input.locationName,
    address: null,
    city: params.input.locationCity ?? params.input.hqCity ?? null,
    country: params.input.country,
    currency: params.input.currency,
    timezone,
    createdAt: now,
    updatedAt: now,
  });

  await writeAuditLog({
    organizationId,
    actorUserId: params.userId,
    action: "ORGANIZATION_CREATED",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: { country: params.input.country, currency: params.input.currency },
  });

  await writeAuditLog({
    organizationId,
    actorUserId: params.userId,
    action: "LOCATION_CREATED",
    resourceType: "location",
    resourceId: locationId,
    metadata: { name: params.input.locationName },
  });

  trackOnboarding("business_created", { country: params.input.country }, organizationId);
  trackOnboarding(
    "location_created",
    { venueType: params.input.venueType ?? null },
    organizationId,
  );

  return { organizationId, locationId, membershipId, onboarding };
}

export async function userHasOrganization(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);
  return Boolean(row);
}

export async function getWorkspaceForUser(userId: string) {
  const [row] = await db
    .select({
      organizationId: organizations.id,
      name: organizations.name,
      country: organizations.country,
      currency: organizations.currency,
      timezone: organizations.timezone,
      onboarding: organizations.onboarding,
      membershipId: organizationMembers.id,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  if (!row) return null;

  const [loc] = await db
    .select()
    .from(locations)
    .where(eq(locations.organizationId, row.organizationId))
    .limit(1);

  return {
    ...row,
    onboarding: asState(row.onboarding),
    primaryLocation: loc
      ? {
          id: loc.id,
          name: loc.name,
          city: loc.city,
          country: loc.country,
        }
      : null,
  };
}

export async function patchOnboardingState(
  organizationId: string,
  patch: Partial<OnboardingState>,
): Promise<OnboardingState> {
  const [row] = await db
    .select({ onboarding: organizations.onboarding })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  const next = { ...asState(row?.onboarding), ...patch };
  await db
    .update(organizations)
    .set({ onboarding: next, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));
  return next;
}
