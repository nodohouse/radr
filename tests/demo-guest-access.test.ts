import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDemoGrant,
  verifyDemoGrant,
  guestDemoAllowed,
} from "@/lib/identity/demoSession";
import { POST } from "@/app/api/demo/access/route";
import { resetRateLimitBuckets } from "@/lib/security/rate-limit";
import { demoLeadSchema } from "@/lib/marketing/demoLeadSchema";
beforeEach(() => {
  vi.stubEnv("BETTER_AUTH_SECRET", "unit-test-demo-secret-only");
  vi.stubEnv("NEXT_PUBLIC_RADR_ENV", "DEMO");
  resetRateLimitBuckets();
});
afterEach(() => vi.unstubAllEnvs());
function request(body: unknown, origin = "https://radr.example") {
  return new Request("https://radr.example/api/demo/access", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}
describe("fictional guest access, independent from accounts", () => {
  it("accepts a signed unexpired grant but rejects tampering and expiry", () => {
    const now = 1700000000000,
      token = createDemoGrant(now);
    expect(verifyDemoGrant(token, now)).toBe(true);
    expect(verifyDemoGrant(token + "bad", now)).toBe(false);
    expect(verifyDemoGrant(token, now + 8 * 60 * 60 * 1000)).toBe(false);
    expect(verifyDemoGrant("fake", now)).toBe(false);
  });
  it("never grants LIVE or SANDBOX access", () => {
    const token = createDemoGrant();
    for (const env of ["LIVE", "SANDBOX"]) {
      vi.stubEnv("NEXT_PUBLIC_RADR_ENV", env);
      expect(guestDemoAllowed()).toBe(false);
      expect(verifyDemoGrant(token)).toBe(false);
      expect(() => createDemoGrant()).toThrow();
    }
  });
  it("does not fall back to a development signing key in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("DEMO_SESSION_SECRET", "");
    expect(verifyDemoGrant("anything")).toBe(false);
    expect(() => createDemoGrant()).toThrow();
  });
  it("issues a short HTTP-only demo cookie and only an allowlisted destination", async () => {
    const response = await POST(request({ vertical: "hotel" }));
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain("radr_demo_access=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Max-Age=28800");
    expect(cookie).not.toContain("session_token");
    expect(await response.json()).toEqual({
      ok: true,
      next: "/app/enter?vertical=hotel&go=1",
      contactDetailsSaved: false,
    });
  });
  it("accepts a same-origin request behind a trusted host rewrite", async () => {
    const r = new Request("http://localhost:3000/api/demo/access", {
      method: "POST",
      headers: {
        origin: "http://radr.example",
        host: "radr.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ vertical: "restaurant" }),
    });
    expect((await POST(r)).status).toBe(200);
  });
  it("rejects cross-origin, missing origin, invalid worlds and contact payloads", async () => {
    expect(
      (await POST(request({ vertical: "hotel" }, "https://elsewhere.example")))
        .status,
    ).toBe(403);
    const noOrigin = request({ vertical: "hotel" });
    noOrigin.headers.delete("origin");
    expect((await POST(noOrigin)).status).toBe(403);
    for (const body of [
      { vertical: "live" },
      { vertical: "hotel", email: "private@example.com" },
      { vertical: "hotel", next: "https://evil.example" },
    ]) {
      const r = await POST(request(body));
      expect(r.status).toBe(400);
      expect(r.headers.get("set-cookie")).toBeNull();
    }
  });
  it("does not issue guest access in a live environment", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADR_ENV", "LIVE");
    expect((await POST(request({ vertical: "hotel" }))).status).toBe(503);
  });
  it("bounds body size and throttles repeated entry requests", async () => {
    expect(
      (await POST(request({ vertical: "hotel", oversize: "x".repeat(3000) })))
        .status,
    ).toBe(413);
    resetRateLimitBuckets();
    for (let i = 0; i < 10; i++)
      expect((await POST(request({ vertical: "restaurant" }))).status).toBe(
        200,
      );
    expect((await POST(request({ vertical: "restaurant" }))).status).toBe(429);
  });
  it("requires complete, nonblank demo-introduction fields", () => {
    const good = {
      fullName: "Jamie Lee",
      email: "jamie@example.com",
      company: "Example Hospitality",
      role: "finance",
      locations: "2-5",
      vertical: "hotel",
    };
    expect(demoLeadSchema.safeParse(good).success).toBe(true);
    for (const [key, value] of Object.entries({
      fullName: "  ",
      email: "not-an-email",
      company: "  ",
      role: "",
      locations: "",
      vertical: "",
    })) {
      expect(
        demoLeadSchema.safeParse({ ...good, [key]: value }).success,
        key,
      ).toBe(false);
    }
  });
});
