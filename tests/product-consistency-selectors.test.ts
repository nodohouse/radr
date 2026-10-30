import { beforeEach, describe, expect, it } from "vitest";
import { listDecisionRecords, resetDecisionStore, getDecisionRecord, approveDecision } from "@/lib/radr/decision/store";
import { decisionSummary } from "@/lib/radr/product/decisionSummary";
import { moneyContext } from "@/lib/radr/product/demoMoney";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";
import { applyDecisionEvidenceHealth } from "@/lib/radr/product/decisionEvidenceHealth";
import { buildDataHealthOverview } from "@/lib/radr/product/dataHealthProofEngine";
import { appPageTitle } from "@/lib/radr/product/pageIdentity";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { DecisionRecord } from "@/lib/radr/decision/record";

beforeEach(()=>resetDecisionStore());
describe("canonical product consistency",()=>{
 it("partitions every selected record exactly once, including resolved zero-value outcomes",()=>{
  const records=listDecisionRecords();const s=decisionSummary([...records,records[0]]);
  expect(Object.values(s.groups).flat()).toHaveLength(records.length);
  expect(s.counts.needs_you+s.counts.handling+s.counts.resolved+s.counts.watching).toBe(s.counts.all);
  expect(new Set(Object.values(s.groups).flat().map(r=>r.id)).size).toBe(records.length);
 });
 it("moves a reviewed decision between shared counts without changing total",()=>{
  const before=decisionSummary(listDecisionRecords());approveDecision(DECISION_IDS.peak);
  const after=decisionSummary(listDecisionRecords());expect(after.counts.all).toBe(before.counts.all);
  expect(after.counts.needs_you).toBe(before.counts.needs_you-1);expect(after.counts.handling).toBe(before.counts.handling+1);
 });
 it("keeps local amounts local and explicitly converts mixed-source group reporting",()=>{
  const usd=getDecisionRecord(DECISION_IDS.peak)!;
  const eur={...usd,id:"eur_case",sourceCurrency:"EUR" as const};
  expect(moneyContext([eur],"gm").currency).toBe("EUR");
  expect(moneyContext([eur],"gm").toDisplay(eur,100)).toBe(100);
  const group=moneyContext([usd,eur],"cfo");expect(group.currency).toBe("USD");expect(group.label).toContain("illustrative FX");
  expect(group.toDisplay(usd,100)+group.toDisplay(eur,100)).toBe(208);
 });
 it("reconciles converted category values and trend against the same headline",()=>{
  const original=getDecisionRecord(DECISION_IDS.supplier)!;
  const other:DecisionRecord={...original,id:DECISION_IDS.guestVoice,sourceCurrency:"EUR",verifiedValue:{...original.verifiedValue!,amount:100}};
  const usd:DecisionRecord={...original,id:DECISION_IDS.supplier,sourceCurrency:"USD",verifiedValue:{...original.verifiedValue!,amount:100}};
  const model=buildValueOverview("cfo","restaurant",[other,usd]);
  expect(model.verifiedTotal).toBe(208);expect(model.driversSum).toBe(208);expect(model.trend.at(-1)?.cumulative).toBe(208);
 });
 it("limits active decision data confidence from degraded required sources without inventing percentages",()=>{
  const record=getDecisionRecord(DECISION_IDS.peak)!;
  expect(record.confidence.userFacing).toBe("MEDIUM");expect(record.confidence.data).toBe("MEDIUM");expect(record.confidence.dataFreshness).toBe("MEDIUM");
  expect(record.autonomy.level).toBeLessThanOrEqual(3);expect(record.confidence.explanation).toContain("Deliverect degraded");
 });
 it("never revises a sealed verified outcome because its current source is stale",()=>{
  const sealed=getDecisionRecord(DECISION_IDS.supplier)!;
  expect(applyDecisionEvidenceHealth(sealed)).toEqual(sealed);expect(sealed.verifiedValue?.amount).toBe(273);
  const active=applyDecisionEvidenceHealth({...sealed,status:"AWAITING_APPROVAL",attentionOverride:undefined});
  expect(active.confidence.data).toBe("LOW");expect(active.autonomy.level).toBeLessThanOrEqual(2);
 });
 it("uses the same visible source dependency IDs for health impact counts",()=>{
  const h=buildDataHealthOverview();const affected=new Set(h.sources.flatMap(source=>source.affectedDecisions.map(d=>d.label)));
  expect(affected.size).toBe(h.decisionsAffected);expect(h.healthyCount+h.degradedCount+h.staleCount).toBe(h.sourceTotal);
 });
 it("derives non-Control-Center document titles from their route",()=>{
  expect(appPageTitle("/app/value")).toBe("RADR · Value");expect(appPageTitle("/app/data-health")).toBe("RADR · Data Health");
  expect(appPageTitle("/app/decisions/dec_peak_berlin")).toBe("RADR · Decision D-1911");
 });
});
