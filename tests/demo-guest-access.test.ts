import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import {
  createDemoGrant,
  verifyDemoGrant,
  guestDemoAllowed,
} from "@/lib/identity/demoSession";
import { POST } from "@/app/api/demo/access/route";
import { resetRateLimitBuckets } from "@/lib/security/rate-limit";
import {
  registrationDetailsSchema,
  registrationFormSchema,
  meaningfulRegistrationText,
  plausibleRegistrationEmail,
} from "@/lib/marketing/registration";
import {
  publicPlan,
  planRegistrationHref,
  planSetupPreviewHref,
} from "@/lib/marketing/conversionJourney";
const details = {
  fullName: "Jamie Morgan",
  email: "jamie@cedar-dining.co",
  company: "Cedar Hospitality",
  role: "finance",
  locations: "2-5",
  vertical: "hotel",
  termsAccepted: true,
  website: "",
};
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
describe("validated registration preview without real account services", () => {
  it("accepts the new signed preview grant, rejects tampering and exact expiry", () => {
    const now = 1700000000000,
      token = createDemoGrant(now);
    expect(verifyDemoGrant(token, now)).toBe(true);
    expect(verifyDemoGrant(token + "bad", now)).toBe(false);
    expect(verifyDemoGrant(token, now + 8 * 60 * 60 * 1000)).toBe(false);
  });
  it("rejects old guest grants even with valid signatures", () => {
    const key = createHmac("sha256", "unit-test-demo-secret-only")
      .update("radr:fictional-demo:v1")
      .digest();
    const data = Buffer.from(
      JSON.stringify({
        scope: "fictional-demo",
        expires: Date.now() + 60000,
        nonce: "old",
      }),
    ).toString("base64url");
    expect(
      verifyDemoGrant(
        `${data}.${createHmac("sha256", key).update(data).digest("base64url")}`,
      ),
    ).toBe(false);
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
  it("has no production development-key fallback", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("DEMO_SESSION_SECRET", "");
    expect(verifyDemoGrant("anything")).toBe(false);
    expect(() => createDemoGrant()).toThrow();
  });
  it("requires completed details before granting a limited preview cookie", async () => {
    expect((await POST(request({ vertical: "hotel" }))).status).toBe(400);
    const r = await POST(request(details));
    expect(r.status).toBe(200);
    const cookie = r.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Max-Age=28800");
    expect(cookie).not.toContain("session_token");
    const token = cookie.split(";")[0].split("=")[1];
    const payload = Buffer.from(token.split(".")[0], "base64url").toString();
    expect(payload).not.toContain(details.email);
    expect(payload).not.toContain(details.company);
    expect(await r.json()).toEqual({
      ok: true,
      next: "/app/enter?vertical=hotel&go=1",
      contactDetailsSaved: false,
    });
  });
  it("supports same-origin requests behind a host rewrite", async () => {
    const r = new Request("http://localhost:3000/api/demo/access", {
      method: "POST",
      headers: {
        origin: "http://radr.example",
        host: "radr.example",
        "content-type": "application/json",
      },
      body: JSON.stringify(details),
    });
    expect((await POST(r)).status).toBe(200);
  });
  it("rejects cross-origin requests, missing origin, passwords, redirect injection and honeypots", async () => {
    expect(
      (await POST(request(details, "https://elsewhere.example"))).status,
    ).toBe(403);
    const noOrigin = request(details);
    noOrigin.headers.delete("origin");
    expect((await POST(noOrigin)).status).toBe(403);
    for (const data of [
      { ...details, password: "NeverTransmitMe123!" },
      { ...details, next: "https://evil.example" },
      { ...details, website: "bot-filled" },
      { ...details, termsAccepted: false },
    ]) {
      const r = await POST(request(data));
      expect(r.status).toBe(400);
      expect(r.headers.get("set-cookie")).toBeNull();
    }
  });
  it("fails closed on LIVE and bounds/rate-limits requests", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADR_ENV", "LIVE");
    expect((await POST(request(details))).status).toBe(503);
    vi.stubEnv("NEXT_PUBLIC_RADR_ENV", "DEMO");
    expect(
      (await POST(request({ ...details, oversized: "x".repeat(6000) }))).status,
    ).toBe(413);
    resetRateLimitBuckets();
    for (let i = 0; i < 10; i++)
      expect((await POST(request(details))).status).toBe(200);
    expect((await POST(request(details))).status).toBe(429);
  });
  it("accepts international names and real-looking business names without identity claims", () => {
    for (const name of [
      "O’Neill",
      "李明",
      "María-José",
      "محمد علي",
      "Zoë Dubois",
    ])
      expect(meaningfulRegistrationText(name, "name")).toBe(true);
    for (const company of [
      "3M Hospitality",
      "Test Kitchen",
      "Hôtel Côte d’Azur",
    ])
      expect(meaningfulRegistrationText(company, "company")).toBe(true);
  });
  it("blocks missing fields and obvious junk on both client and server schema", async () => {
    expect(registrationDetailsSchema.safeParse(details).success).toBe(true);
    for (const data of [
      { ...details, fullName: "asdf" },
      { ...details, fullName: "111111" },
      { ...details, company: "aaaaaaa" },
      { ...details, company: "https://spam.example" },
      { ...details, email: "test@example.com" },
      { ...details, email: "person@mailinator.com" },
      { ...details, role: "" },
      { ...details, locations: "" },
    ]) {
      expect(registrationDetailsSchema.safeParse(data).success).toBe(false);
      expect((await POST(request(data))).status).toBe(400);
    }
    expect(plausibleRegistrationEmail("owner+site@gmail.com")).toBe(true);
  });
  it("requires a non-common password, matching confirmation and acknowledgement", () => {
    const good = {
      ...details,
      password: "Cedar-preview-29!",
      confirmPassword: "Cedar-preview-29!",
    };
    expect(registrationFormSchema.safeParse(good).success).toBe(true);
    for (const bad of [
      { ...good, password: "password123", confirmPassword: "password123" },
      { ...good, confirmPassword: "Different-thing" },
      { ...good, password: "          ", confirmPassword: "          " },
      { ...good, termsAccepted: false },
    ])
      expect(registrationFormSchema.safeParse(bad).success).toBe(false);
  });
  it("keeps plan selections allowlisted and carries world into setup", () => {
    expect(publicPlan("expand")).toBe("expand");
    expect(publicPlan("https://evil.example")).toBeNull();
    expect(publicPlan("__proto__")).toBeNull();
    expect(planRegistrationHref("enterprise")).toBe(
      "/signup?intent=workspace&plan=enterprise",
    );
    expect(planSetupPreviewHref("expand", "hotel")).toBe(
      "/onboarding/preview?plan=expand&vertical=hotel",
    );
  });
});
