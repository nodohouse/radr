import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  permission: vi.fn(),
  record: vi.fn(),
}));
vi.mock("@/lib/identity/provider", () => ({ getAuthIdentity: mocks.identity }));
vi.mock("@/lib/authz", () => ({
  requirePermission: mocks.permission,
  AuthzError: class extends Error {
    status = 403;
  },
}));
vi.mock("@/lib/outcomes/service", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/outcomes/service")>()),
  recordReviewedOutcome: mocks.record,
}));
import { POST } from "@/app/api/outcomes/route";
import { AuthzError } from "@/lib/authz";
const input = {
  id: "outcome-001",
  organizationId: "org-a",
  locationId: "loc-a",
  findingId: "finding-a",
  sourceOutcomeId: "provider:credit:1",
  expectedValue: 100,
  observedValue: 80,
  currency: "EUR",
  evidenceIds: ["doc-a"],
  method: "Credit matched to settlement",
  outcomeReviewed: true,
};
const req = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/outcomes", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.identity.mockResolvedValue(null);
  mocks.permission.mockResolvedValue({});
  mocks.record.mockResolvedValue({
    record: { id: "outcome-001" },
    replayed: false,
  });
});
it("rejects cross-origin, anonymous and incomplete requests before persistence", async () => {
  expect((await POST(req(input, "https://untrusted.example"))).status).toBe(
    403,
  );
  expect(mocks.identity).not.toHaveBeenCalled();
  expect((await POST(req(input))).status).toBe(401);
  mocks.identity.mockResolvedValue({ userId: "server-user" });
  expect((await POST(req({ ...input, evidenceIds: [] }))).status).toBe(400);
  expect(mocks.record).not.toHaveBeenCalled();
});
it("checks server identity, write permission and location before saving", async () => {
  mocks.identity.mockResolvedValue({ userId: "server-user" });
  const response = await POST(req(input));
  expect(response.status).toBe(201);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(mocks.permission).toHaveBeenCalledWith(
    "server-user",
    "org-a",
    "decision.approve",
    "loc-a",
  );
  expect(mocks.record).toHaveBeenCalledWith(input, "server-user");
});
it("denied permissions never reach persistence; actor spoofing is rejected", async () => {
  mocks.identity.mockResolvedValue({ userId: "server-user" });
  mocks.permission.mockRejectedValue(new AuthzError("Denied", 403));
  expect((await POST(req(input))).status).toBe(403);
  expect(mocks.record).not.toHaveBeenCalled();
  expect((await POST(req({ ...input, recordedBy: "owner" }))).status).toBe(400);
});
