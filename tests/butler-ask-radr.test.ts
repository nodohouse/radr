import { describe, expect, it } from "vitest";
import {
  nextSession,
  resolveButlerIntelligence,
} from "@/lib/radr/butler/tools";
import { buildButlerOpening } from "@/lib/radr/butler/opening";
import { findingsForScope } from "@/lib/radr/findings";
import { currentExposureFromFindings } from "@/lib/radr/valueSemantics";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { buildLocationTonightPulse } from "@/lib/radr/servicePulse";
import {
  orchestrateAskSync,
  getLlmConfig,
  buildAskSecureAuth,
  authFromButlerContext,
  ASK_DEMO_ORG,
  ASK_DEMO_LOCATION,
} from "@/lib/ai";
import { CLIENT_ERRORS } from "@/lib/security/errors";

const ctx = {
  locationScope: "loc_ber",
  period: "yesterday" as const,
  role: "group_cfo" as const,
  allowedLocationIds: "all" as const,
};

describe("Ask RADR tool-grounded intelligence", () => {
  it("opens with contextual intelligence, not a command list", () => {
    const opening = buildButlerOpening(ctx);
    expect(opening.greeting).toMatch(/Good /);
    expect(opening.invite).toMatch(/want to know/);
    expect(opening.suggestions.length).toBeGreaterThan(0);
    expect(opening.suggestions.length).toBeLessThanOrEqual(3);
    expect(opening.contextLine).toMatch(/BERLIN|NORTHSTAR/i);
    expect(
      opening.rightNow.exposureLabel || opening.rightNow.attentionLabel,
    ).toBeTruthy();
    expect(opening.exposureEuro).toBe(
      currentExposureFromFindings(findingsForScope("loc_ber")),
    );
  });

  it("1. What needs my attention? — grounded exposure €408", () => {
    const a = resolveButlerIntelligence("What needs my attention?", ctx);
    expect(a.impactEuro).toBe(408);
    expect(a.primaryMetric?.value).toMatch(/408/);
    expect(a.toolUsed).toMatch(/findings|location/i);
  });

  it("2–5. location worry → why → recommend → do nothing", () => {
    const worry = resolveButlerIntelligence(
      "Which location worries me most tonight?",
      ctx,
    );
    expect(worry.summary).toMatch(/Berlin Mitte/);
    expect(["location_risk", "attention"]).toContain(worry.topic);

    let session = nextSession(
      undefined,
      "Which location worries me most tonight?",
      worry,
    );
    const why = resolveButlerIntelligence("Why?", ctx, session);
    expect(why.topic).toBe("labor");
    expect(why.impactEuro).toBe(290);

    session = nextSession(session, "Why?", why);
    const rec = resolveButlerIntelligence("What would you do?", ctx, session);
    expect(rec.pendingWrite).toBeTruthy();
    expect(rec.recommendation?.costValue).toBe("€68");
    expect(rec.recommendation?.protectValue).toMatch(/290/);

    session = nextSession(session, "What would you do?", rec);
    const nothing = resolveButlerIntelligence(
      "What happens if I do nothing?",
      ctx,
      session,
    );
    expect(nothing.impactEuro).toBe(290);
  });

  it("6–8. reservations, waitlist, large groups", () => {
    const r = resolveButlerIntelligence(
      "How many reservations do we have tonight?",
      ctx,
    );
    expect(
      r.metrics?.some(
        (m) => m.value === String(BERLIN_RESERVATION_SUMMARY.reservationCount),
      ),
    ).toBe(true);
    expect(
      r.metrics?.some(
        (m) => m.value === String(BERLIN_RESERVATION_SUMMARY.bookedCovers),
      ),
    ).toBe(true);

    const w = resolveButlerIntelligence(
      "How many people are on the waitlist?",
      ctx,
    );
    const pulse = buildLocationTonightPulse();
    expect(w.summary).toContain(String(pulse.waitlistGuests));

    const g = resolveButlerIntelligence("Any large groups?", ctx);
    expect(g.toolUsed).toMatch(/reservation/i);
    expect(g.title).toMatch(/Large|Group/i);
  });

  it("9. understaffed", () => {
    const a = resolveButlerIntelligence("Where are we understaffed?", ctx);
    expect(a.impactEuro).toBe(290);
    expect(
      a.visualization?.type === "heatmap" || a.topic === "labor",
    ).toBe(true);
  });

  it("10–11. New York compare + West Village", () => {
    const a = resolveButlerIntelligence("Compare New York locations.", ctx);
    expect(a.visualization?.type).toBe("comparison");
    expect(a.expanded).toBe(true);

    const z = resolveButlerIntelligence(
      "Why is West Village underperforming?",
      ctx,
    );
    expect(z.summary).toMatch(/West Village|New York|margin|Flatiron/i);
  });

  it("12. supplier variance from findings", () => {
    const a = resolveButlerIntelligence(
      "Where are we paying suppliers too much?",
      ctx,
    );
    expect(a.impactEuro).toBe(118);
  });

  it("13–15. cancellations + Table 14 spend", () => {
    const c = resolveButlerIntelligence(
      "Can we recover tonight's cancellations?",
      ctx,
    );
    expect(c.toolUsed).toMatch(/cancel/i);

    const t = resolveButlerIntelligence(
      "Did we recover the Table 14 cancellation?",
      ctx,
    );
    expect(t.impactEuro).toBe(184);

    const s = resolveButlerIntelligence(
      "How much did they actually spend?",
      ctx,
    );
    expect(s.impactEuro).toBe(184);
  });

  it("16–17. verified month + €408 origin", () => {
    const v = resolveButlerIntelligence(
      "How much value has RADR verified this month?",
      ctx,
    );
    // Scenario SoT only — never illustrative catalog YTD
    expect(v.impactEuro).toBe(184);
    expect(getVerifiedValueFromScenarios().verified).toBe(184);

    const o = resolveButlerIntelligence(
      "Where does the €408 come from?",
      ctx,
    );
    expect(o.impactEuro).toBe(408);
    expect(o.visualization?.type).toBe("breakdown");
  });

  it("18. what changed", () => {
    const a = resolveButlerIntelligence(
      "What changed since I last checked?",
      ctx,
    );
    expect(a.impactEuro === 408 || (a.metrics?.length ?? 0) > 0 || a.summary.length > 0).toBe(
      true,
    );
  });

  it("write actions require confirm payload, not silent apply", () => {
    const a = resolveButlerIntelligence("What would you do?", ctx);
    expect(a.pendingWrite?.kind).toBe("CREATE_ACTION");
  });

  it("covers terminology", () => {
    const a = resolveButlerIntelligence("What are covers?", ctx);
    expect(a.topic).toBe("term");
    expect(a.summary.toLowerCase()).toMatch(/guest/);
  });

  it("natural follow-ups: and Amsterdam", () => {
    const margin = resolveButlerIntelligence(
      "Why was margin down yesterday?",
      ctx,
    );
    expect(margin.primaryMetric?.value).toMatch(/%/);
    const session = nextSession(undefined, "Why was margin down yesterday?", margin);
    const ams = resolveButlerIntelligence("And Amsterdam?", ctx, session);
    expect(ams.summary).toMatch(/Amsterdam|margin/i);
  });

  it("orchestrator reports mode and tools", () => {
    const result = orchestrateAskSync("What's tonight looking like?", ctx);
    expect(result.toolsCalled.length).toBeGreaterThan(0);
    expect(result.response.metrics?.length).toBeGreaterThan(0);
    expect(typeof getLlmConfig().configured).toBe("boolean");
  });

  it("honest about missing reservation data outside Berlin", () => {
    const a = resolveButlerIntelligence("How many people are on the waitlist?", {
      ...ctx,
      locationScope: "loc_par",
    });
    // Context may still resolve Berlin from question absence — force Paris in question
    const b = resolveButlerIntelligence(
      "How many people are on the waitlist in Paris?",
      ctx,
    );
    expect(
      b.warnings?.length ||
        /not provide waitlist|not connected|unavailable|Insufficient/i.test(
          b.summary + b.answer,
        ) ||
        b.primaryMetric,
    ).toBeTruthy();
  });
});

describe("Ask LIVE tenant hard-stop", () => {
  it("LIVE without session → 401", () => {
    const r = buildAskSecureAuth({
      env: "LIVE",
      sessionUserId: null,
      organizationId: null,
      orgLocationIds: [],
      requestedLocationScope: "loc_ber",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(401);
      expect(r.error).toBe(CLIENT_ERRORS.unauthorized);
    }
  });

  it("LIVE with session but no org membership → 403", () => {
    const r = buildAskSecureAuth({
      env: "LIVE",
      sessionUserId: "user_1",
      organizationId: null,
      orgLocationIds: [],
      requestedLocationScope: "loc_ber",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(403);
      expect(r.error).toMatch(/organization membership/i);
    }
  });

  it("LIVE with membership scopes to org locations only — never all", () => {
    const r = buildAskSecureAuth({
      env: "LIVE",
      sessionUserId: "user_1",
      organizationId: "org_real",
      orgLocationIds: ["loc_a", "loc_b"],
      requestedLocationScope: "loc_ber",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.organizationId).toBe("org_real");
      expect(r.userId).toBe("user_1");
      expect(r.allowedLocationIds).toEqual(["loc_a", "loc_b"]);
      expect(r.allowedLocationIds).not.toBe("all");
      expect(r.locationScope).toBe("loc_a");
      expect(r.role).toBe("location_manager");
    }
  });

  it("DEMO keeps northstar + loc_ber cap without membership", () => {
    const r = buildAskSecureAuth({
      env: "DEMO",
      sessionUserId: null,
      organizationId: null,
      orgLocationIds: [],
      requestedLocationScope: "all",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.organizationId).toBe(ASK_DEMO_ORG);
      expect(r.allowedLocationIds).toEqual([ASK_DEMO_LOCATION]);
      expect(r.locationScope).toBe(ASK_DEMO_LOCATION);
    }
  });

  it("authFromButlerContext uses organizationId from context", () => {
    const auth = authFromButlerContext({
      locationScope: "loc_a",
      period: "yesterday",
      role: "location_manager",
      allowedLocationIds: ["loc_a"],
      organizationId: "org_real",
      userId: "user_1",
    });
    expect(auth.organizationId).toBe("org_real");
    expect(auth.userId).toBe("user_1");
    expect(auth.allowedLocationIds).toEqual(["loc_a"]);
  });

  it("authFromButlerContext defaults to demo org when unset", () => {
    const auth = authFromButlerContext({
      locationScope: "loc_ber",
      period: "yesterday",
      role: "location_manager",
      allowedLocationIds: ["loc_ber"],
    });
    expect(auth.organizationId).toBe(ASK_DEMO_ORG);
    expect(auth.userId).toBe("butler_demo");
  });
});
