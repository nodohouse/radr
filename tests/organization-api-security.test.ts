import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  memberships: vi.fn(),
  setOrg: vi.fn(),
}));
vi.mock("@/lib/identity/provider", () => ({ getAuthIdentity: mocks.identity }));
vi.mock("@/lib/authz", () => ({
  listMembershipsForUser: mocks.memberships,
  setActiveOrganizationCookie: mocks.setOrg,
}));
vi.mock("@/lib/identity/postAuth", () => ({
  resolvePostAuthDestination: async () => "/app",
}));
import { GET, POST } from "@/app/api/orgs/route";
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/orgs", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockResolvedValue(null);
  mocks.memberships.mockResolvedValue([
    {
      organization: { id: "org-a", name: "A", slug: "a" },
      membership: { roleId: "owner" },
    },
  ]);
});
afterEach(() => vi.clearAllMocks());
describe("organization API boundaries", () => {
  it("returns JSON 401 for unauthenticated reads and writes", async () => {
    for (const response of [
      await GET(),
      await POST(request({ organizationId: "org-a" })),
    ]) {
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized" });
      expect(response.headers.get("cache-control")).toContain("no-store");
    }
    expect(mocks.memberships).not.toHaveBeenCalled();
  });
  it("rejects cross-origin selection before consulting identity", async () => {
    expect((await POST(request({}, "https://untrusted.example"))).status).toBe(
      403,
    );
    expect(mocks.identity).not.toHaveBeenCalled();
  });
  it("uses server identity for membership listings and marks responses private", async () => {
    mocks.identity.mockResolvedValue({ userId: "user-a" });
    const response = await GET();
    expect(mocks.memberships).toHaveBeenCalledWith("user-a");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects invalid bodies and attempts to select another tenant", async () => {
    mocks.identity.mockResolvedValue({ userId: "user-a" });
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request({ organizationId: "org-b" }))).status).toBe(403);
    expect(mocks.setOrg).not.toHaveBeenCalled();
  });
  it("sets the active organization only after membership is verified", async () => {
    mocks.identity.mockResolvedValue({ userId: "user-a" });
    expect((await POST(request({ organizationId: "org-a" }))).status).toBe(200);
    expect(mocks.setOrg).toHaveBeenCalledExactlyOnceWith("org-a");
  });
});
