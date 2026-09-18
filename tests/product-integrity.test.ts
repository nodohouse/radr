/**
 * Product integrity — role scope + economic semantics.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  resetDecisionStore,
  listDecisionRecords,
  getDecisionRecord,
} from "@/lib/radr/decision/store";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import {
  scopedDecisions,
  splitNeedsYou,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { primaryMetricOf } from "@/lib/radr/product/primaryMetric";
import { AskRadrService } from "@/lib/radr/product/services";
import { DEMO_ORG } from "@/lib/radr/product/demoOrg";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import {
  berlinPreShiftBrief,
  EVIDENCE_CONFLICTS,
} from "@/lib/radr/product/shiftIntelligence";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_SUPPLIER,
  CANON_TABLE,
  CANON_MENU_PEAK,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import {
  PEAK_SERVICE_CLOCK,
  peakDecisionWindowMinutes,
  peakDeadlineDisplay,
} from "@/lib/radr/decision/demos/peakClock";
import { INTELLIGENCE_CROSS_DOMAIN } from "@/data/demo/intelligence";
import { DEMO_MENU_ITEMS } from "@/data/demo/menuIntelligence";
import {
  COKE_MARGIN_SHOCK,
  COKE_MARGIN_FUTURES,
  simulateCokePriceRaise,
  tunaComplexityAdjusted,
} from "@/lib/radr/product/marginResponse";
import {
  sourcesForRole,
  sourceIssueSummary,
} from "@/lib/radr/product/integrations";

describe("Role scope integrity", () => {
  beforeEach(() => resetDecisionStore());

  it("GM Berlin sees only Berlin Decisions", () => {
    const scoped = scopedDecisions(listDecisionRecords(), "gm");
    const ids = scoped.map((r) => r.id);
    expect(ids).toContain(DECISION_IDS.peak);
    expect(ids).toContain(DECISION_IDS.supplier);
    expect(ids).toContain(DECISION_IDS.tableRecover);
    expect(ids).not.toContain(DECISION_IDS.ota);
    expect(ids).not.toContain(DECISION_IDS.orphan);
    expect(ids).not.toContain(DECISION_IDS.playbook);
  });

  it("COO sees portfolio including D-5208", () => {
    const ids = scopedDecisions(listDecisionRecords(), "coo").map((r) => r.id);
    expect(ids).toContain(DECISION_IDS.peak);
    expect(ids).toContain(DECISION_IDS.ota);
    expect(ids).toContain(DECISION_IDS.orphan);
    expect(ids).toContain(DECISION_IDS.playbook);
  });

  it("Revenue Canal House sees hotel commercial only", () => {
    const ids = scopedDecisions(listDecisionRecords(), "revenue_manager").map(
      (r) => r.id,
    );
    expect(ids).toContain(DECISION_IDS.ota);
    expect(ids).not.toContain(DECISION_IDS.peak);
    expect(ids).not.toContain(DECISION_IDS.supplier);
  });

  it("Control Center counts match visible needs_you", () => {
    const scoped = scopedDecisions(listDecisionRecords(), "gm");
    const { urgent, review } = splitNeedsYou(scoped);
    expect(urgent.length + review.length).toBe(
      scoped.filter((r) => r.status === "AWAITING_APPROVAL").length,
    );
    expect(urgent.some((r) => r.id === DECISION_IDS.peak)).toBe(true);
    // D-4102 is Verified recovered — not in needs_you. Margin Response stays open.
    expect(review.some((r) => r.id === DECISION_IDS.marginCoke)).toBe(true);
    expect(scoped.some((r) => r.id === DECISION_IDS.supplier)).toBe(true);
  });

  it("Ask RADR for GM does not name Amsterdam Decisions", () => {
    const a = AskRadrService.answer("gm", "What needs me?");
    expect(a.answer).not.toMatch(/Canal House|Amsterdam|Chiado|D-2201|D-3104/i);
    expect(a.decisionIds.every((id) =>
      [
        DECISION_IDS.peak,
        DECISION_IDS.supplier,
        DECISION_IDS.marginCoke,
      ].includes(id as typeof DECISION_IDS.peak),
    )).toBe(true);
  });
});

describe("Economic semantics", () => {
  beforeEach(() => resetDecisionStore());

  it("D-1911 primary metric is expected incremental contribution €620", () => {
    const r = getDecisionRecord(DECISION_IDS.peak)!;
    const m = primaryMetricOf(r)!;
    expect(m.type).toBe("EXPECTED_INCREMENTAL_CONTRIBUTION");
    expect(m.value).toBe(620);
    expect(m.label.toLowerCase()).toContain("incremental");
    expect(m.label.toLowerCase()).not.toContain("protected");
    expect(CANON_PEAK.expectedProtectedEuro).toBe(620);
    expect(CANON_PEAK.actualProtectedEuro).toBe(590);
  });

  it("D-2201 uses 72h protected semantics", () => {
    const r = getDecisionRecord(DECISION_IDS.ota)!;
    const m = primaryMetricOf(r)!;
    expect(m.type).toBe("VERIFIED_PROTECTED");
    expect(m.value).toBe(CANON_OTA.actualProtectedEuro);
    expect(`${m.scopeLabel} ${m.horizonLabel}`).toMatch(/72h/i);
  });

  it("D-3104 verified recovered is €40 not observed €118", () => {
    expect(verifiedEuro(CANON_ORPHAN)).toBe(40);
    expect(CANON_ORPHAN.actualProtectedEuro).toBe(118);
    expect(CANON_ORPHAN.expectedProtectedEuro).toBe(112);
    const r = getDecisionRecord(DECISION_IDS.orphan)!;
    expect(r.property).toBe("Chiado Collective · Lisbon");
    expect(r.verifiedValue?.amount).toBe(40);
  });

  it("D-4102 shows supplier variance recovered €273 when Verified", () => {
    const r = getDecisionRecord(DECISION_IDS.supplier)!;
    const m = primaryMetricOf(r)!;
    expect(r.status).toBe("VERIFIED");
    expect(r.verifiedValue?.amount).toBe(273);
    expect(m.type).toBe("VERIFIED_RECOVERED");
    expect(m.value).toBe(273);
    expect(CANON_SUPPLIER.exposureEuro).toBe(273);
  });

  it("D-6671 potential recovered is €184 everywhere", () => {
    const r = getDecisionRecord(DECISION_IDS.tableRecover)!;
    const m = primaryMetricOf(r)!;
    expect(m.value).toBe(184);
    expect(m.label.toLowerCase()).toMatch(/potential|observed|verified/);
    expect(CANON_TABLE.expectedProtectedEuro).toBe(184);
  });

  it("D-1842 historical metric is verified protected €1590", () => {
    const r = getDecisionRecord(DECISION_IDS.tuna)!;
    const m = primaryMetricOf(r)!;
    expect(m.type).toBe("VERIFIED_PROTECTED");
    expect(m.value).toBe(1590);
    expect(m.label.toLowerCase()).toContain("protected");
  });

  it("integrations scope by persona", () => {
    const gm = sourcesForRole("gm");
    expect(gm.some((s) => s.id === "pms")).toBe(false);
    expect(gm.some((s) => s.id === "pos")).toBe(true);
    const rev = sourcesForRole("revenue_manager");
    expect(rev.some((s) => s.id === "pms")).toBe(true);
    expect(rev.some((s) => s.id === "kds")).toBe(false);
    const coo = sourcesForRole("coo");
    expect(coo.length).toBeGreaterThan(gm.length);
    expect(sourceIssueSummary(gm)).toMatch(/degraded|stale/i);
    expect(sourceIssueSummary(gm)).not.toBe("2 sources degraded");
  });

  it("D-4102 scenarios never show fake €0 expected effect", () => {
    const r = getDecisionRecord(DECISION_IDS.supplier)!;
    for (const o of r.options) {
      if (o.id === "reprice_now") {
        expect(o.economicEffectNote?.toLowerCase()).toMatch(/not yet modeled/);
        expect(o.expectedContributionEuro).toBeUndefined();
      }
      if (o.id === "do_nothing") {
        expect(o.economicMetrics?.[0]?.value).toBe(273);
        expect(o.economicMetrics?.[0]?.label.toLowerCase()).toMatch(/exposed/);
      }
      if (o.id === "query") {
        expect(o.economicMetrics?.[0]?.status).toBe("POTENTIAL");
      }
    }
  });

  it("prepared actions never leak Provider class names", () => {
    for (const r of listDecisionRecords()) {
      for (const step of r.actionPlan.steps) {
        expect(step.provider).not.toMatch(/Provider$/);
      }
    }
  });

  it("D-6671 freshness is explicit", () => {
    const r = getDecisionRecord(DECISION_IDS.tableRecover)!;
    expect(r.confidence.dataFreshness).toBeTruthy();
  });

  it("Ask RADR copy has no debug metadata", () => {
    const a = AskRadrService.answer("gm", "What needs me?");
    expect(a.answer).not.toMatch(/Decision store|needs_you|attention band/i);
    expect(a.evidence?.[0]).toMatch(/Grounded in|active Decision/i);
  });

  it("D-7110 menu peak economics exist as learned Decision", () => {
    const r = getDecisionRecord(DECISION_IDS.menuPeak)!;
    expect(displayDecisionId(r.id)).toBe("D-7110");
    expect(r.territories).toEqual(expect.arrayContaining(["BUY", "LABOR", "SELL"]));
    expect(primaryMetricOf(r)?.value).toBe(610);
    expect(r.options.some((o) => o.id === "reprice")).toBe(true);
    expect(r.options.find((o) => o.id === "peak_deemphasis")?.recommended).toBe(
      true,
    );
  });

  it("Ask RADR what am I missing grounds in guest voice", () => {
    const a = AskRadrService.answer("gm", "What am I missing?");
    expect(a.answer).toMatch(/kitchen mix|labor/i);
    expect(a.decisionIds).toContain(DECISION_IDS.guestVoice);
    expect(a.answer).not.toMatch(/Decision store|needs_you/i);
  });

  it("active exposure is needs_you primary metrics — not absorb-cost monthly exposure", () => {
    const a = deriveValueAggregate("gm");
    const scoped = scopedDecisions(listDecisionRecords(), "gm");
    const needs = scoped.filter((r) => recordAttention(r) === "needs_you");
    const expected = needs.reduce(
      (s, r) => s + (primaryMetricOf(r)?.value ?? 0),
      0,
    );
    expect(a.activeExposure + a.activeOpportunity).toBe(expected);
    expect(a.activeExposure).toBe(expected); // GM needs_you are exposure-class
    // Peak 620 + margin Coke 168 (supplier D-4102 is Verified recovered — not active exposure)
    expect(a.activeExposure).toBe(620 + 168);
    expect(a.decisionIdsActiveExposure).not.toContain(DECISION_IDS.tableRecover);
    const pending = scoped.filter((r) => recordAttention(r) === "handling");
    const pendingSum = pending.reduce(
      (s, r) => s + (r.expectedContributionImpact ?? 0),
      0,
    );
    expect(a.pendingVerification).toBe(pendingSum);
    expect(a.pendingVerification).toBe(184);
    // Headline layers are mutually exclusive
    expect(a.activeExposure + a.pendingVerification).not.toBe(1103);
  });

  it("D-7501 primary metric is expected incremental vs absorb — not Contribution", () => {
    const r = getDecisionRecord(DECISION_IDS.marginCoke)!;
    const m = primaryMetricOf(r)!;
    expect(m.type).toBe("EXPECTED_INCREMENTAL_CONTRIBUTION");
    expect(m.value).toBe(168);
    expect(m.baselineLabel).toMatch(/absorb/i);
    expect(m.label.toLowerCase()).toMatch(/expected incremental/);
    // Monthly absorb exposure remains on the record for cost-of-doing-nothing
    expect(r.exposedContribution).toBe(796);
  });

  it("D-1911 main risk is abandonment narrative not risk level", () => {
    const r = getDecisionRecord(DECISION_IDS.peak)!;
    const wait = r.options.find((o) => o.id === "wait_12")!;
    expect(wait.mainRiskDescription?.toLowerCase()).toMatch(/abandonment|walk-in/);
    expect(wait.riskLevel ?? wait.operationalRisk).toBe("low");
  });

  it("verified totals equal sum of verified Decision amounts", () => {
    const a = deriveValueAggregate("coo");
    const sum = Object.values(a.verifiedByKind).reduce((x, y) => x + y, 0);
    expect(a.verifiedTotal).toBe(sum);
  });

  it("pre-shift brief has no fake readiness score", () => {
    const b = berlinPreShiftBrief();
    expect(b.headline.toLowerCase()).toMatch(/demand mix|cold-station/);
    expect(b.conditions.every((c) =>
      ["READY", "WATCH", "CONSTRAINT_IDENTIFIED", "ACTION_RECOMMENDED"].includes(
        c.state,
      ),
    )).toBe(true);
    expect(b.arrivalDensity.coversInWindow).toBe(42);
  });

  it("Ask what will break tonight points to pre-shift conditions", () => {
    const a = AskRadrService.answer("gm", "What will break tonight?");
    expect(a.answer).toMatch(/arrival compression|cold station/i);
    expect(a.answer).not.toMatch(/readiness \d/i);
  });

  it("evidence conflict Finding exists for supplier Decision", () => {
    expect(EVIDENCE_CONFLICTS[0]?.affectsDecisionIds).toContain(
      DECISION_IDS.supplier,
    );
    expect(EVIDENCE_CONFLICTS[0]?.sources.length).toBeGreaterThanOrEqual(2);
  });

  it("D-1911 clock is consistent — 18:42 now · 18:53 deadline · ~11 min", () => {
    expect(PEAK_SERVICE_CLOCK.nowLabel).toBe("18:42");
    expect(PEAK_SERVICE_CLOCK.deadlineLabel).toBe("18:53");
    expect(peakDecisionWindowMinutes()).toBe(11);
    expect(peakDeadlineDisplay()).toBe("Decide by 18:53 · ~11 min");
    expect(CANON_PEAK.deadline).toBe("18:53");
    const r = getDecisionRecord(DECISION_IDS.peak)!;
    expect(r.decisionDeadline).toBe(peakDeadlineDisplay());
    expect(r.decisionDeadlineAt).toBe(PEAK_SERVICE_CLOCK.deadlineIso);
  });

  it("D-7110 is the Intelligence flagship — cold station consistent", () => {
    expect(INTELLIGENCE_CROSS_DOMAIN.id).toBe(CANON_MENU_PEAK.id);
    expect(INTELLIGENCE_CROSS_DOMAIN.displayId).toBe("D-7110");
    const tuna = DEMO_MENU_ITEMS.find((i) => i.itemId === "mi_tuna_tataki")!;
    expect(tuna.station.toLowerCase()).toMatch(/cold/);
    expect(CANON_MENU_PEAK.understand.toLowerCase()).toMatch(/cold-station|cold station/);
  });

  it("D-7501 Margin Response — shock class before price, category rebalance recommended", () => {
    const r = getDecisionRecord(DECISION_IDS.marginCoke)!;
    expect(displayDecisionId(r.id)).toBe("D-7501");
    expect(r.exposedContribution).toBe(796);
    expect(r.options.find((o) => o.recommended)?.id).toMatch(
      /category_rebalance|rebalance/,
    );
    expect(COKE_MARGIN_SHOCK.shockClass).toBe("MARKET_PRICE_CHANGE");
    expect(COKE_MARGIN_SHOCK.disputeFirst).toBe(false);
    expect(COKE_MARGIN_SHOCK.elasticityEvidence).toBe("INSUFFICIENT");
    const rec = COKE_MARGIN_FUTURES.find((f) => f.recommended)!;
    expect(rec.expectedContributionEuro).toBe(168);
    expect(simulateCokePriceRaise(0.2).modeled).toBe(true);
    expect(tunaComplexityAdjusted().verdict).toMatch(/SYSTEM ECONOMICS WEAK/);
  });

  it("Ask Coke €0.20 returns modeled scenario fixture", () => {
    const a = AskRadrService.answer("gm", "What if we raise Coke by €0.20?");
    expect(a.answer).toMatch(/MODELED SCENARIO/);
    expect(a.decisionIds).toContain(DECISION_IDS.marginCoke);
    expect(a.answer).not.toMatch(/hallucin/i);
  });

  it("pre-shift demand quality is projected — not live 18:42", () => {
    const b = berlinPreShiftBrief();
    expect(b.demandQuality.some((d) => /projected|committed/i.test(d.label))).toBe(
      true,
    );
    expect(b.demandQuality.every((d) => !/18:42/.test(d.reason))).toBe(true);
  });
});
