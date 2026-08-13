import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  locations,
  organizationMembers,
  organizations,
} from "@/lib/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { ONBOARDING_COUNTRIES } from "@/lib/constants";
import { newId } from "@/lib/ids";
import type { OnboardingInput } from "@/lib/validation";

export async function createOrganizationWithLocation(params: {
  userId: string;
  input: OnboardingInput;
}) {
  const countryMeta = ONBOARDING_COUNTRIES.find(
    (c) => c.code === params.input.country,
  );
  const timezone = countryMeta?.timezone ?? "UTC";

  const organizationId = newId();
  const locationId = newId();
  const membershipId = newId();
  const now = new Date();

  await db.insert(organizations).values({
    id: organizationId,
    name: params.input.organizationName,
    country: params.input.country,
    currency: params.input.currency,
    timezone,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(organizationMembers).values({
    id: membershipId,
    organizationId,
    userId: params.userId,
    role: "OWNER",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(locations).values({
    id: locationId,
    organizationId,
    name: params.input.locationName,
    address: null,
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

  return { organizationId, locationId, membershipId };
}

export async function userHasOrganization(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);
  return Boolean(row);
}
