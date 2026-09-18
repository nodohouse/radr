import { describe, expect, it, beforeEach } from "vitest";
import { pctVsForecast, occupancyPct, laborCostPct } from "@/lib/radr/calc";
import { findingsForScope, runFindingEngine, dedupeFindings } from "@/lib/radr/findings";
import { getDemoOperatingContext } from "@/lib/radr/ports/demoOperatingContext";
import { computeForecast, laborDemandFromForecast } from "@/lib/radr/forecast/service";
import {
  buildLocationMorningBrief,
  buildGroupMorningBrief,
} from "@/lib/radr/brief/morningBrief";
import {
  createActionFromFinding,
  verifyOutcome,
  __resetActionMemory,
  conservativeVerifiedValue,
} from "@/lib/radr/actions/service";
import { matchWaitlistToReleasedCovers } from "@/lib/radr/reservations/waitlistRecovery";
import { computeReservationEconomics } from "@/lib/radr/reservations/economics";
import {
  claimIdempotentIngest,
  ingestionIdentity,
  __resetIdempotencyMemory,
} from "@/lib/ingest/idempotency";
import { ingestExternalReservation } from "@/lib/ingest/processors/reservation";
import {
  reconcileReservationToPos,
  explicitLink,
} from "@/lib/radr/reconciliation/service";
import {
  canAccessLocation,
  hasPermission,
  validateOnboardingCoverage,
  demoDataHealth,
  draftFindingNotification,
  defaultTrialSubscription,
  canAddLocation,
  verifyWebhookSignature,
  signWebhookPayload,
  stripReservationPii,
  sanitizeMeta,
} from "@/lib/platform";

describe("phase 3 calc", () => {
  it("computes pct vs forecast and occupancy", () => {
    expect(pctVsForecast(110, 100)).toBe(10);
    expect(pctVsForecast(100, 0)).toBe(0);
    expect(occupancyPct(50, 100)).toBe(50);
    expect(laborCostPct(30, 200)).toBe(15);
  });
});

describe("phase 4 finding engine", () => {
  it("detects, dedupes, and ranks Berlin findings", () => {
    const findings = runFindingEngine("loc_ber");
    expect(findings.length).toBeGreaterThanOrEqual(2);
    expect(findings.length).toBeLessThanOrEqual(4);
    expect(findings[0]!.priorityScore).toBeGreaterThanOrEqual(
      findings[findings.length - 1]!.priorityScore,
    );
    const keys = new Set(findings.map((f) => f.dedupeKey));
    expect(keys.size).toBe(findings.length);
    expect(findings.every((f) => f.summary && f.explanation)).toBe(true);
  });

  it("merges waitlist recovery into cancellation dedupe key", () => {
    const raw = findingsForScope("loc_ber");
    const cancelFamily = raw.filter((f) =>
      f.dedupeKey.includes("cancellation_exposure"),
    );
    expect(cancelFamily.length).toBeLessThanOrEqual(1);
  });
});

describe("phase 5 actions + verification", () => {
  beforeEach(() => __resetActionMemory());

  it("creates action and verifies conservatively", () => {
    const finding = findingsForScope("loc_ber")[0]!;
    const action = createActionFromFinding(finding, "user_1", "act_test");
    expect(action.status).toBe("PROPOSED");
    const v = verifyOutcome({
      id: "ver_test",
      finding,
      actionId: action.id,
      expectedValue: 166,
      observedValue: 148,
      attribution: "RADR_RECOMMENDED",
      method: "POS close",
    });
    expect(v.verifiedValue).toBe(148);
    expect(conservativeVerifiedValue(200, 50)).toBe(50);
  });
});

describe("phase 6–8 brief forecast waitlist", () => {
  it("builds location morning brief with linked actions", () => {
    const brief = buildLocationMorningBrief("loc_ber");
    expect(brief).not.toBeNull();
    expect(brief!.metrics.length).toBeGreaterThan(0);
    expect(brief!.topActions.length).toBeGreaterThan(0);
  });

  it("builds group brief", () => {
    const g = buildGroupMorningBrief({
      orgName: "Northstar",
      locationIds: ["loc_ber"],
      totalLocations: 18,
    });
    expect(g.kind).toBe("group");
    expect(g.attentionCount).toBeGreaterThan(0);
  });

  it("forecast exposes drivers and labor gap", () => {
    const ctx = getDemoOperatingContext("loc_ber")!;
    const fc = computeForecast(ctx);
    expect(fc.forecastCovers).toBeGreaterThan(0);
    expect(fc.drivers.length).toBeGreaterThan(0);
    const labor = laborDemandFromForecast(ctx, fc);
    expect(labor.gap).toBeGreaterThan(0);
    expect(labor.recommendation).toBe("+1 FOH");
  });

  it("matches waitlist to released covers", () => {
    const ctx = getDemoOperatingContext("loc_ber")!;
    const match = matchWaitlistToReleasedCovers(ctx.waitlist, 4);
    expect(match).not.toBeNull();
    expect(match!.partySize).toBeLessThanOrEqual(4);
    const econ = computeReservationEconomics({
      covers: 118,
      spendPerCover: 64,
      cancelledCovers: 4,
      cancelledGross: 256,
      waitlistMatchValue: match!.expectedValue ?? 0,
      naturalRebookExpected: 90,
      noShowCovers: 5,
      noShowGross: 320,
      groupCovers: 19,
      currency: "EUR",
    });
    expect(econ.bookingValue).toBeGreaterThan(0);
  });
});

describe("phase 10–11 ingest + reconcile", () => {
  beforeEach(() => __resetIdempotencyMemory());

  it("is idempotent on retries", () => {
    const identity = ingestionIdentity({
      organizationId: "org_northstar",
      provider: "demo",
      externalId: "r1",
    });
    expect(claimIdempotentIngest(identity, "raw_1").accepted).toBe(true);
    expect(claimIdempotentIngest(identity, "raw_2").accepted).toBe(false);
  });

  it("ingests reservation without PII and reconciles", () => {
    const first = ingestExternalReservation({
      organizationId: "org_northstar",
      locationId: "loc_ber",
      provider: "demo_reservations",
      connectionId: "conn_1",
      external: {
        externalId: "ext_99",
        locationExternalId: "ber",
        serviceTime: "2026-08-24T20:00:00+02:00",
        partySize: 4,
        status: "confirmed",
        tableExternalId: "t14",
        sourceUpdatedAt: "2026-08-24T18:00:00+02:00",
      },
    });
    expect(first.ok && first.duplicate === false).toBe(true);
    const second = ingestExternalReservation({
      organizationId: "org_northstar",
      locationId: "loc_ber",
      provider: "demo_reservations",
      connectionId: "conn_1",
      external: {
        externalId: "ext_99",
        locationExternalId: "ber",
        serviceTime: "2026-08-24T20:00:00+02:00",
        partySize: 4,
        status: "confirmed",
        sourceUpdatedAt: "2026-08-24T18:00:00+02:00",
      },
    });
    expect(second.ok && second.duplicate === true).toBe(true);

    const link = reconcileReservationToPos(
      {
        reservationId: "res_1",
        locationId: "loc_ber",
        serviceTimeMs: Date.parse("2026-08-24T20:00:00+02:00"),
        partySize: 4,
        tableId: "t14",
      },
      [
        {
          posOrderId: "pos_1",
          locationId: "loc_ber",
          openedAtMs: Date.parse("2026-08-24T20:05:00+02:00"),
          covers: 4,
          tableId: "t14",
        },
      ],
    );
    expect(link?.confidence).toBe("HIGH");
    expect(explicitLink({ reservationId: "r", posOrderId: "p" }).confidence).toBe(
      "EXPLICIT",
    );
  });
});

describe("phase 12–17 platform", () => {
  it("enforces location RBAC", () => {
    const gm = {
      userId: "u1",
      organizationId: "org",
      role: "GENERAL_MANAGER" as const,
      locationIds: ["loc_ber"],
    };
    expect(canAccessLocation(gm, "loc_ber")).toBe(true);
    expect(canAccessLocation(gm, "loc_ams")).toBe(false);
    expect(hasPermission(gm, "butler:read")).toBe(true);
  });

  it("validates onboarding coverage", () => {
    const partial = validateOnboardingCoverage({
      locationsMapped: true,
      currencyPresent: true,
      timezonePresent: true,
      reservationDataValid: false,
      posTotalsReconcile: false,
      laborDataValid: false,
      freshnessHealthy: true,
    });
    expect(partial.ready).toBe(false);
    const ready = validateOnboardingCoverage({
      locationsMapped: true,
      currencyPresent: true,
      timezonePresent: true,
      reservationDataValid: true,
      posTotalsReconcile: true,
      laborDataValid: true,
      freshnessHealthy: true,
    });
    expect(ready.ready).toBe(true);
  });

  it("reports data health and notification rules", () => {
    const health = demoDataHealth();
    expect(health.overall).toBe("STALE");
    expect(health.confidenceMultiplier).toBe(0.85);
    expect(health.sources.some((s) => s.sourceKey === "labor" && s.status === "STALE")).toBe(
      true,
    );
    const note = draftFindingNotification({
      userId: "u1",
      urgency: "ACT_NOW",
      title: "Peak staffing",
      locationName: "Berlin Mitte",
    });
    expect(note?.interrupt).toBe(true);
    expect(
      draftFindingNotification({
        userId: "u1",
        urgency: "WATCH",
        title: "Watch item",
        locationName: "Berlin Mitte",
      }),
    ).toBeNull();
  });

  it("billing trial limits locations", () => {
    const sub = defaultTrialSubscription("org_x");
    expect(canAddLocation(sub)).toBe(true);
    expect(canAddLocation({ ...sub, locationCount: 3 })).toBe(false);
  });

  it("verifies webhook signatures and strips PII", () => {
    const payload = '{"id":1}';
    const secret = "test_secret";
    const sig = signWebhookPayload(payload, secret);
    expect(verifyWebhookSignature({ payload, secret, signature: sig })).toBe(
      true,
    );
    expect(
      stripReservationPii({
        partySize: 2,
        guestName: "Ada",
        email: "a@b.c",
      }),
    ).toEqual({ partySize: 2 });
    expect(sanitizeMeta({ password: "x", count: 1 }).password).toBe(
      "[redacted]",
    );
  });
});

describe("dedupe helper", () => {
  it("unions drivers on same key", () => {
    const a = findingsForScope("loc_ber")[0]!;
    const clone = {
      ...a,
      id: "clone",
      drivers: [...a.drivers, { label: "Extra", value: "1" }],
      priorityScore: a.priorityScore - 1,
    };
    const merged = dedupeFindings([a, clone]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.drivers.some((d) => d.label === "Extra")).toBe(true);
  });
});
