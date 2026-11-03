import { POST } from "@/app/api/reports/request/route";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createReportGrant,
  verifyReportGrant,
  reportDeliveryReady,
  reportLeadSchema,
} from "@/lib/marketing/reportGate";
import { BLOG_POSTS } from "@/lib/marketing/blog";
import { readFileSync } from "node:fs";
afterEach(() => vi.unstubAllEnvs());
describe("report access boundary", () => {
  it("requires successful delivery configuration before enabling requests", () => {
    vi.stubEnv("REPORT_LEAD_WEBHOOK_URL", "");
    vi.stubEnv("CONTACT_WEBHOOK_URL", "");
    vi.stubEnv(
      "REPORT_DOWNLOAD_SECRET",
      "test-secret-at-least-thirty-two-characters",
    );
    expect(reportDeliveryReady()).toBe(false);
    vi.stubEnv("REPORT_LEAD_WEBHOOK_URL", "https://leads.example.test");
    expect(reportDeliveryReady()).toBe(true);
  });
  it("rejects absent, altered, expired, and incorrectly signed grants", () => {
    vi.stubEnv(
      "REPORT_DOWNLOAD_SECRET",
      "test-secret-at-least-thirty-two-characters",
    );
    const now = Date.now();
    const grant = createReportGrant(now);
    expect(verifyReportGrant(grant, now)).toBe(true);
    expect(verifyReportGrant(undefined, now)).toBe(false);
    expect(verifyReportGrant(grant + "x", now)).toBe(false);
    expect(verifyReportGrant(grant, now + 1800001)).toBe(false);
    vi.stubEnv(
      "REPORT_DOWNLOAD_SECRET",
      "a-different-secret-at-least-thirty-two-characters",
    );
    expect(verifyReportGrant(grant, now)).toBe(false);
  });
  it("requires the contact request but leaves newsletter opt-in optional", () => {
    const data = {
      fullName: "Taylor Morgan",
      email: "taylor@example.test",
      company: "Example Hotel",
      role: "finance",
      locations: "2-5",
      requestContact: true,
    };
    expect(reportLeadSchema.safeParse(data).success).toBe(true);
    expect(reportLeadSchema.parse(data).marketingOptIn).toBe(false);
    for (const field of [
      "fullName",
      "email",
      "company",
      "role",
      "locations",
      "requestContact",
    ])
      expect(
        reportLeadSchema.safeParse({ ...data, [field]: undefined }).success,
        field,
      ).toBe(false);
    expect(reportLeadSchema.safeParse({ ...data, company: "  " }).success).toBe(
      false,
    );
  });
});
describe("editorial quality boundaries", () => {
  it("has four substantive original articles without fabricated statistics or em dashes", () => {
    const posts = BLOG_POSTS.filter((p) => p.content);
    expect(posts).toHaveLength(4);
    for (const post of posts) {
      const text = post
        .content!.sections.flatMap((s) => s.paragraphs)
        .join(" ");
      expect(text.split(/\s+/).length).toBeGreaterThan(350);
      expect(text).not.toContain("—");
      expect(post.date).toBe("2026-11-03");
    }
  });
  it("keeps the report outside public static assets", () => {
    const pdf = readFileSync(
      "private/reports/RADR-Hospitality-Decision-Playbook-2026.pdf",
    );
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("lead submission failure boundaries", () => {
  const data = {
    fullName: "Taylor QA",
    email: "qa@example.test",
    company: "Example Hotel",
    role: "finance",
    locations: "2-5",
    requestContact: true,
  };
  const req = (body: unknown, origin = "https://radr.test") =>
    new Request("https://radr.test/api/reports/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify(body),
    });
  it("does not accept or unlock leads when delivery is not configured", async () => {
    vi.stubEnv("REPORT_LEAD_WEBHOOK_URL", "");
    vi.stubEnv("CONTACT_WEBHOOK_URL", "");
    const r = await POST(req(data));
    expect(r.status).toBe(503);
    expect(r.headers.get("set-cookie")).toBeNull();
  });
  it("rejects missing contact consent and filled honeypots before delivery", async () => {
    expect((await POST(req({ ...data, requestContact: false }))).status).toBe(
      400,
    );
    expect((await POST(req({ ...data, website: "spam.test" }))).status).toBe(
      400,
    );
  });
  it("rejects cross-origin browser submissions", async () => {
    expect((await POST(req(data, "https://other.test"))).status).toBe(403);
  });
});
