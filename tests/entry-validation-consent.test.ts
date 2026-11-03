import { describe, it, expect, vi, afterEach } from "vitest";
import {
  validEmail,
  validName,
  validNewPassword,
  validTimezone,
  sameOriginMutation,
} from "@/lib/onboarding/requiredFields";
import { onboardingSchema } from "@/lib/validation";
import { progressError } from "@/lib/onboarding/progressValidation";
import {
  parsePreferences,
  analyticsAllowed,
  savePreferences,
} from "@/lib/privacy/consent";
const profile = {
  fullName: "Taylor Morgan",
  roleLens: "cfo" as const,
  organizationName: "Northstar",
  industry: "hotel_group" as const,
  locationBand: "2-5" as const,
  locationName: "Canal House",
  locationCity: "Amsterdam",
  locationCountry: "NL",
  reportingCurrency: "EUR",
  locationTimezone: "Europe/Amsterdam",
  decisionClass: "supplier_ap" as const,
  evidenceMethod: "upload" as const,
};
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("required field rules", () => {
  it("rejects whitespace names, malformed email, empty passwords and invalid timezones", () => {
    expect(validName("  ")).toBe(false);
    expect(validName("Li")).toBe(true);
    expect(validEmail("bad@")).toBe(false);
    expect(validEmail(" user@example.test ")).toBe(true);
    expect(validNewPassword("          ")).toBe(false);
    expect(validNewPassword("123456789")).toBe(false);
    expect(validNewPassword("a".repeat(129))).toBe(false);
    expect(validNewPassword("Long passphrase 2026")).toBe(true);
    expect(validTimezone("")).toBe(false);
    expect(validTimezone("Europe/Amsterdam")).toBe(true);
    expect(validTimezone("Not/AZone")).toBe(false);
  });
  it("requires all first-value creation fields on the server", () => {
    const input = {
      ...profile,
      path: "first_value",
      country: "NL",
      currency: "EUR",
      timezone: "Europe/Amsterdam",
    };
    expect(onboardingSchema.safeParse(input).success).toBe(true);
    for (const field of [
      "fullName",
      "roleLens",
      "industry",
      "locationBand",
      "locationCity",
      "timezone",
    ]) {
      expect(
        onboardingSchema.safeParse({ ...input, [field]: undefined }).success,
        field,
      ).toBe(false);
    }
  });
  it("rejects skipped stages and completion without server analysis", () => {
    expect(progressError({}, "goal", false)).toBeTruthy();
    expect(
      progressError({ ...profile, locationCity: "" }, "goal", false),
    ).toBeTruthy();
    expect(progressError(profile, "evidence", false)).toBeNull();
    expect(
      progressError(
        { ...profile, decisionClass: "cost_variance" },
        "evidence",
        false,
      ),
    ).toBeTruthy();
    expect(progressError(profile, "done", false)).toBeTruthy();
    expect(progressError(profile, "done", true)).toBeNull();
    expect(
      progressError(
        { ...profile, evidenceMethod: "demo", demoEnabled: true },
        "done",
        false,
      ),
    ).toBeNull();
  });
  it("rejects cross-origin mutations", () => {
    expect(
      sameOriginMutation(
        new Request("https://radr.test/api/onboarding", {
          headers: { origin: "https://other.test" },
        }),
      ),
    ).toBe(false);
    expect(
      sameOriginMutation(
        new Request("https://radr.test/api/onboarding", {
          headers: { origin: "https://radr.test" },
        }),
      ),
    ).toBe(true);
  });
});
describe("cookie preference boundaries", () => {
  it("fails closed if a browser refuses to persist a choice", () => {
    const choice = {
      version: 1 as const,
      necessary: true as const,
      analytics: true,
      marketing: true,
      savedAt: new Date().toISOString(),
    };
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify(choice),
      setItem: () => {
        throw new Error("Storage blocked");
      },
    });
    expect(() => savePreferences(choice)).toThrow();
    expect(analyticsAllowed()).toBe(false);
  });
  it("defaults to no consent on absent, malformed, expired or future preferences", () => {
    const savedAt = new Date().toISOString();
    for (const value of [
      null,
      "not-json",
      JSON.stringify({ version: 1, analytics: true }),
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: true,
        marketing: true,
        savedAt: "2020-01-01",
      }),
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: true,
        marketing: true,
        savedAt: "2099-01-01",
      }),
    ])
      expect(parsePreferences(value)).toBeNull();
    expect(
      parsePreferences(
        JSON.stringify({
          version: 1,
          necessary: true,
          analytics: false,
          marketing: false,
          savedAt,
        }),
      )?.analytics,
    ).toBe(false);
  });
});
