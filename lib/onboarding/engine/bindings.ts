/**
 * Step field → canonical settings writes.
 * Onboarding and future Settings share these destinations.
 */

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { locations, organizations } from "@/lib/db/schema";
import type { OnboardingResponseBinding } from "./types";

export type BindingContext = {
  organizationId: string;
  locationId?: string | null;
  userId: string;
};

type Writer = (
  ctx: BindingContext,
  value: unknown,
) => Promise<void>;

const WRITERS: Record<string, Writer> = {
  "organization.name": async (ctx, value) => {
    if (typeof value !== "string" || !value.trim()) return;
    await db
      .update(organizations)
      .set({ name: value.trim(), updatedAt: new Date() })
      .where(eq(organizations.id, ctx.organizationId));
  },
  "organization.country": async (ctx, value) => {
    if (typeof value !== "string" || !value.trim()) return;
    await db
      .update(organizations)
      .set({ country: value.trim(), updatedAt: new Date() })
      .where(eq(organizations.id, ctx.organizationId));
  },
  "organization.currency": async (ctx, value) => {
    if (typeof value !== "string" || !value.trim()) return;
    await db
      .update(organizations)
      .set({ currency: value.trim(), updatedAt: new Date() })
      .where(eq(organizations.id, ctx.organizationId));
  },
  "organization.timezone": async (ctx, value) => {
    if (typeof value !== "string" || !value.trim()) return;
    await db
      .update(organizations)
      .set({ timezone: value.trim(), updatedAt: new Date() })
      .where(eq(organizations.id, ctx.organizationId));
  },
  "location.name": async (ctx, value) => {
    if (!ctx.locationId || typeof value !== "string" || !value.trim()) return;
    await db
      .update(locations)
      .set({ name: value.trim(), updatedAt: new Date() })
      .where(eq(locations.id, ctx.locationId));
  },
  "location.country": async (ctx, value) => {
    if (!ctx.locationId || typeof value !== "string" || !value.trim()) return;
    await db
      .update(locations)
      .set({ country: value.trim(), updatedAt: new Date() })
      .where(eq(locations.id, ctx.locationId));
  },
  "location.city": async (ctx, value) => {
    if (!ctx.locationId || typeof value !== "string") return;
    await db
      .update(locations)
      .set({ city: value.trim() || null, updatedAt: new Date() })
      .where(eq(locations.id, ctx.locationId));
  },
  "location.timezone": async (ctx, value) => {
    if (!ctx.locationId || typeof value !== "string" || !value.trim()) return;
    await db
      .update(locations)
      .set({ timezone: value.trim(), updatedAt: new Date() })
      .where(eq(locations.id, ctx.locationId));
  },
  "location.currency": async (ctx, value) => {
    if (!ctx.locationId || typeof value !== "string" || !value.trim()) return;
    await db
      .update(locations)
      .set({ currency: value.trim(), updatedAt: new Date() })
      .where(eq(locations.id, ctx.locationId));
  },
  /** Role lens is preference — persisted via onboarding progress / prefs until Users settings ships. */
  "membership.roleLens": async () => {
    /* intentional no-op for SSOT columns — lens stays in progress prefs for now */
  },
};

export async function applyBindings(
  ctx: BindingContext,
  bindings: OnboardingResponseBinding[],
  payload: Record<string, unknown>,
): Promise<void> {
  for (const binding of bindings) {
    if (!(binding.field in payload)) continue;
    const writer = WRITERS[binding.settingsKey];
    if (!writer) continue;
    await writer(ctx, payload[binding.field]);
  }
}
