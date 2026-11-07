import { describe, it, expect } from "vitest";
import {
  buildVerification,
  verificationSchema,
} from "@/lib/radr/domain/verification";
import { verifiedValueLedger } from "@/lib/radr/actions/service";
import {
  defaultTrialSubscription,
  subscriptionAllowsWrites,
  canAddLocation,
} from "@/lib/platform/billing";
const claim = (extra = {}) =>
  buildVerification({
    id: "claim-001",
    organizationId: "org-a",
    locationId: "loc-a",
    findingId: "finding-a",
    expectedValue: 100,
    observedValue: 80,
    currency: "EUR",
    attribution: "RADR_RECOMMENDED",
    method: "Credit matched to bank settlement",
    evidenceIds: ["credit-1"],
    now: "2026-11-07T00:00:00.000Z",
    ...extra,
  });
describe("financial evidence invariants", () => {
  it("rejects supported claims without evidence or with uncertain attribution", () => {
    expect(() => claim({ evidenceIds: [] })).toThrow(/evidence/);
    expect(() => claim({ attribution: "UNCERTAIN" })).toThrow(/estimated/);
  });
  it("keeps estimates out of verified value and rejects non-finite amounts", () => {
    expect(
      claim({
        strength: "ESTIMATED",
        evidenceIds: [],
        attribution: "UNCERTAIN",
      }).verifiedValue,
    ).toBe(0);
    for (const n of [NaN, Infinity, -Infinity])
      expect(() => claim({ observedValue: n })).toThrow();
    expect(
      verificationSchema.safeParse({ ...claim(), verifiedValue: 81 }).success,
    ).toBe(false);
  });
  it("deduplicates identical retries and rejects conflicting identities or repeated evidence", () => {
    const v = claim();
    expect(verifiedValueLedger([v, v]).verified).toBe(80);
    expect(() => verifiedValueLedger([v, claim({ id: "claim-002" })])).toThrow(
      /already counted/,
    );
    expect(() =>
      verifiedValueLedger([v, claim({ observedValue: 70 })]),
    ).toThrow(/Conflicting/);
  });
  it("adds money in currency minor units without floating-point inflation", () => {
    const a = claim({ expectedValue: 0.1, observedValue: 0.1 });
    const b = claim({
      id: "claim-002",
      evidenceIds: ["credit-2"],
      expectedValue: 0.2,
      observedValue: 0.2,
    });
    expect(verifiedValueLedger([a, b]).verified).toBe(0.3);
    expect(() =>
      verifiedValueLedger([claim({ expectedValue: 0.001 })]),
    ).toThrow(/precision/);
  });
  it("never combines tenants or currencies into one sum", () => {
    const v = claim();
    expect(() =>
      verifiedValueLedger([
        v,
        claim({ id: "claim-002", currency: "USD", evidenceIds: ["credit-2"] }),
      ]),
    ).toThrow(/currencies/);
    expect(() =>
      verifiedValueLedger([
        v,
        claim({ id: "claim-002", organizationId: "org-b" }),
      ]),
    ).toThrow(/tenant/);
  });
});
describe("trial entitlement boundaries", () => {
  it("enforces the exact expiry boundary and read-only states", () => {
    const sub = defaultTrialSubscription("org-a");
    const end = new Date(sub.trialEndsAt!);
    expect(canAddLocation(sub, new Date(end.getTime() - 1))).toBe(true);
    expect(canAddLocation(sub, end)).toBe(false);
    for (const status of ["canceled", "past_due", "incomplete"] as const)
      expect(subscriptionAllowsWrites({ ...sub, status })).toBe(false);
    expect(subscriptionAllowsWrites({ ...sub, trialEndsAt: "invalid" })).toBe(
      false,
    );
    expect(subscriptionAllowsWrites({ ...sub, trialEndsAt: null })).toBe(false);
    expect(canAddLocation({ ...sub, locationCount: -1 })).toBe(false);
  });
});
