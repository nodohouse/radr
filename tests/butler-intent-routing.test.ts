import { describe, expect, it } from "vitest";
import {
  nextSession,
  resolveButlerIntelligence,
} from "@/lib/radr/butler/tools";
import { classifyAskIntent } from "@/lib/ai/intents";
import { planAsk } from "@/lib/ai/planner";
import { resolveAskContext } from "@/lib/ai/context";
import { orchestrateAskSync } from "@/lib/ai";

const berlinCtx = {
  locationScope: "loc_ber",
  period: "yesterday" as const,
  role: "group_cfo" as const,
  allowedLocationIds: "all" as const,
};

const groupYesterday = {
  locationScope: "all",
  period: "yesterday" as const,
  role: "group_cfo" as const,
  allowedLocationIds: "all" as const,
};

describe("Ask RADR intent routing — staffing acceptance", () => {
  it("classifies call-in staffing, not control center", () => {
    const c = classifyAskIntent("do we need to call more people in tonight");
    expect(c.intent).toBe("LABOR_REQUIREMENT");
    expect(c.intent).not.toBe("CONTROL_CENTER_SUMMARY");
  });

  it('classifies "How will we do tonight" as tonight outlook, not clarify', () => {
    for (const q of [
      "How will we do tonight",
      "how will we do tonight?",
      "will we do good tonight",
      "how we doing tonight",
    ]) {
      const c = classifyAskIntent(q);
      expect(c.intent, q).toBe("RESERVATION_SUMMARY");
      expect(c.intent, q).not.toBe("CLARIFY");
    }

    const a = resolveButlerIntelligence(
      "How will we do tonight",
      groupYesterday,
    );
    expect(a.responseKind).toBe("reservation_pulse");
    expect(a.title).toMatch(/Tonight outlook|Tonight/i);
    expect(a.primaryMetric?.value).toMatch(/%/);
    expect(a.summary).not.toMatch(/sharper question|Clarify/i);
  });

  it("tonight overrides UI yesterday; staffing tools only", () => {
    const req = {
      question: "do we need to call more people in tonight",
      locationScope: "all",
      period: "yesterday",
      role: "group_cfo" as const,
      allowedLocationIds: "all" as const,
    };
    const ctx = resolveAskContext(req.question, req);
    expect(ctx.period).toBe("tonight");
    expect(ctx.periodLabel).toBe("Tonight");

    const plan = planAsk(req.question, ctx);
    expect(plan.intent).toBe("LABOR_REQUIREMENT");
    expect(plan.tools).toContain("get_labor_requirement");
    expect(plan.tools).not.toContain("get_findings");
    expect(plan.queryPlan.renderer).toBe("staffingRecommendation");
  });

  it("ACCEPTANCE: call more people tonight — not €592 summary", () => {
    const a = resolveButlerIntelligence(
      "do we need to call more people in tonight",
      groupYesterday,
    );

    expect(a.responseKind).toBe("staffing_requirement");
    expect(a.verdict).toMatch(/YES/i);
    expect(a.summary + a.title + a.answer).toMatch(/Berlin Mitte/i);
    expect(a.summary + a.title).toMatch(/\+1|FOH|19:15/i);
    expect(a.impactEuro).toBe(290);
    expect(a.visualization?.type).toBe("demandCapacity");
    expect(a.confidence?.band).toBe("HIGH");

    // Must NOT be the generic group exposure dump
    expect(a.primaryMetric?.value).not.toMatch(/592/);
    expect(a.impactEuro).not.toBe(592);
    expect(a.summary).not.toMatch(/supplier|invoice|cancellation exposure/i);
    expect(JSON.stringify(a.evidence)).not.toMatch(/BUY|RECOVER/i);
  });

  it("follow-up why stays on staffing drivers", () => {
    const first = resolveButlerIntelligence(
      "do we need to call more people in tonight",
      groupYesterday,
    );
    const session = nextSession(
      undefined,
      "do we need to call more people in tonight",
      first,
    );
    const why = resolveButlerIntelligence("Why?", groupYesterday, session);
    expect(why.responseKind).toBe("staffing_requirement");
    expect(why.topic).toBe("labor");
    expect(why.summary + why.answer).toMatch(/booked|forecast|parties|peak/i);
    expect(String(why.primaryMetric?.value ?? "")).not.toMatch(/592/);
    expect(why.impactEuro).not.toBe(592);
  });

  it("different intents produce different response kinds", () => {
    const staffing = resolveButlerIntelligence(
      "are we understaffed tonight?",
      berlinCtx,
    );
    const reservations = resolveButlerIntelligence(
      "how busy are we tonight",
      berlinCtx,
    );
    const waitlist = resolveButlerIntelligence(
      "how many on the waitlist",
      berlinCtx,
    );
    const cancel = resolveButlerIntelligence(
      "can we recover the cancellation",
      berlinCtx,
    );
    const margin = resolveButlerIntelligence(
      "why was margin down yesterday",
      berlinCtx,
    );
    const attention = resolveButlerIntelligence(
      "what needs my attention?",
      berlinCtx,
    );

    expect(staffing.responseKind).toBe("staffing_requirement");
    expect(reservations.responseKind).toBe("reservation_pulse");
    expect(waitlist.responseKind).toBe("waitlist");
    expect(cancel.responseKind).toBe("cancellation_recovery");
    expect(margin.responseKind).toBe("margin_analysis");
    expect(attention.responseKind).toBe("executive_summary");
    expect(attention.impactEuro).toBe(408);

    const kinds = new Set([
      staffing.responseKind,
      reservations.responseKind,
      waitlist.responseKind,
      cancel.responseKind,
      margin.responseKind,
      attention.responseKind,
    ]);
    expect(kinds.size).toBe(6);
  });

  it("grounds vague multi-word questions in data, not clarify", () => {
    expect(classifyAskIntent("how are numbers looking", { period: "yesterday" }).intent).toBe(
      "REVENUE_ANALYSIS",
    );
    expect(classifyAskIntent("anything I should know for service", { period: "tonight" }).intent).toBe(
      "RESERVATION_SUMMARY",
    );
    expect(classifyAskIntent("huh").intent).toBe("CLARIFY");
  });

  it("orchestrator analyzing steps match staffing domain", () => {
    const result = orchestrateAskSync(
      "do we need to call more people in tonight",
      groupYesterday,
    );
    expect(result.toolsCalled).toContain("get_labor_requirement");
    expect(result.toolsCalled).not.toContain("get_findings");
    expect(result.analyzing.map((s) => s.label).join(" ")).toMatch(
      /Reservations|Forecast|Labor/i,
    );
    expect(result.response.responseKind).toBe("staffing_requirement");
  });
});
