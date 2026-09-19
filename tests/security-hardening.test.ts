import { describe, expect, it, beforeEach } from "vitest";
import { safeInternalPath } from "@/lib/security/safe-redirect";
import {
  rateLimit,
  resetRateLimitBuckets,
} from "@/lib/security/rate-limit";
import {
  assertMembershipRole,
  AuthzError,
  canAccessOrganization,
} from "@/lib/authz";
import type { OrganizationMember } from "@/lib/db/schema";

function member(
  overrides: Partial<OrganizationMember> = {},
): OrganizationMember {
  return {
    id: "mem_1",
    organizationId: "org_a",
    userId: "user_1",
    role: "MEMBER",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("safeInternalPath", () => {
  it("allows relative app paths", () => {
    expect(safeInternalPath("/onboarding")).toBe("/onboarding");
    expect(safeInternalPath("/app?welcome=1")).toBe("/app?welcome=1");
  });

  it("rejects open redirects", () => {
    expect(safeInternalPath("//evil.example")).toBe("/onboarding");
    expect(safeInternalPath("https://evil.example")).toBe("/onboarding");
    expect(safeInternalPath("/\\evil")).toBe("/onboarding");
    expect(safeInternalPath("javascript:alert(1)")).toBe("/onboarding");
  });

  it("uses fallback when empty", () => {
    expect(safeInternalPath(null, "/home")).toBe("/home");
  });
});

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("allows under the limit and blocks after", () => {
    const key = "test:ip";
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit({ key, limit: 2, windowMs: 60_000 }).ok).toBe(true);
    const blocked = rateLimit({ key, limit: 2, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});

describe("tenant isolation + roles", () => {
  it("denies cross-org access", () => {
    expect(canAccessOrganization("org_a", "org_b")).toBe(false);
  });

  it("blocks MEMBER from OWNER/ADMIN actions", () => {
    expect(() =>
      assertMembershipRole(member({ role: "MEMBER" }), ["OWNER", "ADMIN"]),
    ).toThrow(AuthzError);
  });

  it("allows OWNER for privileged actions", () => {
    expect(
      assertMembershipRole(member({ role: "OWNER" }), ["OWNER", "ADMIN"]).role,
    ).toBe("OWNER");
  });
});
