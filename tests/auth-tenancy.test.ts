/**
 * Auth + tenancy foundation tests (Phases A–E).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import path from "node:path";
import * as schema from "@/lib/db/schema";
import {
  AuthzError,
  filterLocationsByScope,
  resolveRoleId,
} from "@/lib/authz";
import {
  hashInviteToken,
  generateInviteToken,
} from "@/lib/identity/invitations";
import { slugifyOrgName } from "@/lib/identity/slug";
import {
  legacyRoleToRoleId,
  roleHasPermission,
  ROLE_BY_KEY,
} from "@/lib/platform/rbac";
import {
  defaultProgress,
  extractProgress,
  mergeProgressIntoOnboardingJson,
} from "@/lib/onboarding/engine/progress";
import { SELF_SERVE_FLOW } from "@/lib/onboarding/engine/flows/selfServe";

const migrationsFolder = path.join(process.cwd(), "drizzle");

describe("RBAC catalog", () => {
  it("maps legacy roles to system role ids", () => {
    expect(legacyRoleToRoleId("OWNER")).toBe("role_owner");
    expect(legacyRoleToRoleId("ADMIN")).toBe("role_admin");
    expect(legacyRoleToRoleId("MEMBER")).toBe("role_viewer");
  });

  it("owner can invite; viewer cannot", () => {
    expect(roleHasPermission(ROLE_BY_KEY.owner.id, "user.invite")).toBe(true);
    expect(roleHasPermission(ROLE_BY_KEY.viewer.id, "user.invite")).toBe(false);
  });

  it("gm can approve decisions; revenue cannot", () => {
    expect(roleHasPermission(ROLE_BY_KEY.gm.id, "decision.approve")).toBe(true);
    expect(roleHasPermission(ROLE_BY_KEY.revenue.id, "decision.approve")).toBe(
      false,
    );
  });
});

describe("location scope helper", () => {
  it("filters by explicit location list", () => {
    expect(
      filterLocationsByScope(["a", "b", "c"], ["b"]),
    ).toEqual(["b"]);
  });

  it("returns all when scope is all", () => {
    expect(filterLocationsByScope(["a", "b"], "all")).toEqual(["a", "b"]);
  });
});

describe("invite tokens", () => {
  it("hashes tokens stably without storing raw values", () => {
    const { raw, hash } = generateInviteToken();
    expect(hash).toBe(hashInviteToken(raw));
    expect(hash).not.toContain(raw.slice(0, 8));
  });
});

describe("slugify", () => {
  it("produces url-safe slugs", () => {
    expect(slugifyOrgName("Northstar Hospitality!", "ab12")).toBe(
      "northstar-hospitality-ab12",
    );
  });
});

describe("onboarding progress", () => {
  it("keeps progress fields separate from settings payloads", () => {
    const progress = defaultProgress("role");
    const merged = mergeProgressIntoOnboardingJson(
      { organizationName: "Acme", step: "who" },
      progress,
    );
    expect(merged.organizationName).toBe("Acme");
    expect(extractProgress(merged).flowId).toBe(SELF_SERVE_FLOW.id);
    expect(extractProgress(merged).currentStepId).toBe("role");
  });
});

describe("auth tenancy db", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;

  beforeAll(async () => {
    const client = new PGlite();
    db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder });

    const now = new Date();
    await db.insert(schema.user).values([
      {
        id: "user_owner",
        name: "Owner",
        email: "owner@northstar.test",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user_viewer",
        name: "Viewer",
        email: "viewer@northstar.test",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user_other",
        name: "Other",
        email: "other@elsewhere.test",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.organizations).values({
      id: "org_ns",
      name: "Northstar",
      slug: "northstar",
      country: "DE",
      currency: "EUR",
      timezone: "Europe/Berlin",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(schema.locations).values([
      {
        id: "loc_ber",
        organizationId: "org_ns",
        name: "Berlin",
        country: "DE",
        currency: "EUR",
        timezone: "Europe/Berlin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "loc_ams",
        organizationId: "org_ns",
        name: "Amsterdam",
        country: "NL",
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.organizationMembers).values([
      {
        id: "mem_owner",
        organizationId: "org_ns",
        userId: "user_owner",
        role: "OWNER",
        roleId: "role_owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mem_viewer",
        organizationId: "org_ns",
        userId: "user_viewer",
        role: "MEMBER",
        roleId: "role_viewer",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await db.insert(schema.locationAccess).values([
      {
        id: "la_owner",
        membershipId: "mem_owner",
        scope: "all",
        locationIds: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "la_viewer",
        membershipId: "mem_viewer",
        scope: "locations",
        locationIds: ["loc_ber"],
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }, 60_000);

  it("seeds system roles", async () => {
    const rows = await db.select().from(schema.roles);
    expect(rows.some((r) => r.id === "role_owner")).toBe(true);
  });

  it("stores location-scoped access for viewers", async () => {
    const [access] = await db
      .select()
      .from(schema.locationAccess)
      .where(eq(schema.locationAccess.membershipId, "mem_viewer"));
    expect(access?.scope).toBe("locations");
    expect(access?.locationIds).toEqual(["loc_ber"]);
  });

  it("resolves roleId from membership", async () => {
    const [mem] = await db
      .select()
      .from(schema.organizationMembers)
      .where(eq(schema.organizationMembers.id, "mem_viewer"));
    expect(resolveRoleId(mem!)).toBe("role_viewer");
    expect(roleHasPermission(resolveRoleId(mem!), "user.invite")).toBe(false);
  });

  it("rejects cross-tenant location ids in scope lists", () => {
    const orgLocations = ["loc_ber", "loc_ams"];
    const hostile = filterLocationsByScope(orgLocations, ["loc_ber", "loc_evil"]);
    expect(hostile).toEqual(["loc_ber"]);
  });

  it("creates hashed invitations", async () => {
    const now = new Date();
    const { raw, hash } = generateInviteToken();
    await db.insert(schema.invitations).values({
      id: "inv_1",
      organizationId: "org_ns",
      email: "new@northstar.test",
      roleId: "role_gm",
      tokenHash: hash,
      status: "pending",
      locationScope: "all",
      locationIds: [],
      invitedBy: "user_owner",
      expiresAt: new Date(now.getTime() + 86_400_000),
      createdAt: now,
      updatedAt: now,
    });
    const [row] = await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.tokenHash, hashInviteToken(raw)));
    expect(row?.email).toBe("new@northstar.test");
  });

  it("marks revoked invitations", async () => {
    const now = new Date();
    await db
      .update(schema.invitations)
      .set({ status: "revoked", revokedAt: now, updatedAt: now })
      .where(eq(schema.invitations.id, "inv_1"));
    const [row] = await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.id, "inv_1"));
    expect(row?.status).toBe("revoked");
  });
});

describe("AuthzError", () => {
  it("carries status", () => {
    const err = new AuthzError("nope", 403);
    expect(err.status).toBe(403);
  });
});
