import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { securityHeaders } from "@/lib/security/headers";
import { rateLimit, resetRateLimitBuckets } from "@/lib/security/rate-limit";
vi.mock("@/lib/radr/tools", () => ({
  invokeTool: vi.fn(() => ({ data: { synthetic: true } })),
  listGatewayTools: () => [],
  TOOL_GATEWAY_VERSION: "test",
}));
import { GET, POST } from "@/app/api/tools/[name]/route";
const ctx = { params: Promise.resolve({ name: "get_group_pulse" }) };
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/tools/get_group_pulse", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  resetRateLimitBuckets();
  vi.stubEnv("NEXT_PUBLIC_RADR_ENV", "DEMO");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("release security boundaries", () => {
  it("removes JavaScript eval permission in production while retaining development HMR", () => {
    vi.stubEnv("NODE_ENV", "production");
    const prod = securityHeaders();
    const csp = prod.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(
      prod.find((h) => h.key === "Strict-Transport-Security"),
    ).toBeDefined();
    vi.stubEnv("NODE_ENV", "development");
    expect(
      securityHeaders().find((h) => h.key === "Content-Security-Policy")!.value,
    ).toContain("'unsafe-eval'");
  });
  it.each(["LIVE", "SANDBOX"])(
    "never exposes the synthetic public tool preview in %s",
    async (env) => {
      vi.stubEnv("NEXT_PUBLIC_RADR_ENV", env);
      expect(
        (
          await GET(
            new Request("http://localhost/api/tools/get_group_pulse"),
            ctx,
          )
        ).status,
      ).toBe(404);
      expect((await POST(request({ role: "cfo" }), ctx)).status).toBe(404);
    },
  );
  it("rejects cross-origin tool calls and malformed or oversized payloads", async () => {
    expect(
      (await POST(request({}, "https://untrusted.example"), ctx)).status,
    ).toBe(403);
    for (const body of [null, [], false, "text"])
      expect((await POST(request(body), ctx)).status).toBe(400);
    expect(
      (await POST(request({ value: "x".repeat(17000) }), ctx)).status,
    ).toBe(413);
  });
  it("throttles the anonymous synthetic tool preview", async () => {
    for (let i = 0; i < 30; i++)
      expect(
        (
          await GET(
            new Request("http://localhost/api/tools/get_group_pulse"),
            ctx,
          )
        ).status,
      ).toBe(200);
    const response = await GET(
      new Request("http://localhost/api/tools/get_group_pulse"),
      ctx,
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
  });
  it("bounds limiter memory without evicting active limits, and reclaims expired entries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-05T12:00:00Z"));
    for (let i = 0; i < 10000; i++)
      expect(rateLimit({ key: "key" + i, limit: 1, windowMs: 60000 }).ok).toBe(
        true,
      );
    expect(rateLimit({ key: "new", limit: 1, windowMs: 60000 }).ok).toBe(false);
    expect(rateLimit({ key: "key0", limit: 1, windowMs: 60000 }).ok).toBe(
      false,
    );
    vi.advanceTimersByTime(61000);
    expect(rateLimit({ key: "new", limit: 1, windowMs: 60000 }).ok).toBe(true);
  });
});
