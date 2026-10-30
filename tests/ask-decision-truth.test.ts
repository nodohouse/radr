import { afterEach,beforeEach,describe,expect,it } from "vitest";
import { resolveButlerIntelligence } from "@/lib/radr/butler/tools";
import { buildButlerOpening } from "@/lib/radr/butler/opening";
import { table14DecisionTruth, scopedButlerDecisionTruth } from "@/lib/radr/butler/decisionTruth";
import { resetDecisionStore,verifyDecision,getDecisionRecord } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { ButlerContext } from "@/lib/radr/butler/types";
const ctx:ButlerContext={locationScope:"loc_ber",period:"today",role:"location_manager",allowedLocationIds:["loc_ber"]};
describe("Ask live recovery truth",()=>{
 beforeEach(()=>resetDecisionStore());afterEach(()=>resetDecisionStore());
 it("does not claim scenario-replay recovery for the current approved Decision",()=>{
  expect(getDecisionRecord(DECISION_IDS.tableRecover)?.status).toBe("APPROVED");
  expect(table14DecisionTruth()).toMatchObject({expected:184,observed:null,verified:0,isVerified:false});
  for(const query of["Did we recover the Table 14 cancellation?","Which cancellations can we still recover?"]){
   const answer=resolveButlerIntelligence(query,ctx);
   expect(JSON.stringify(answer)).not.toMatch(/Observed POS[^}]*184/);
   expect(answer.answer).toMatch(/awaiting|pending|no verified/i);
   expect(JSON.stringify(answer)).toContain("$0");
  }
 });

 it("keeps hotel group truth separate from Soho recovery",()=>{
  const hotel={...ctx,role:"group_cfo" as const,locationScope:"all",organizationId:"org_northstar_hotels",allowedLocationIds:"all" as const};
  const current=scopedButlerDecisionTruth(hotel);
  expect(current.records.every(record=>record.vertical==="hotel")).toBe(true);
  expect(current.records.some(record=>record.id===DECISION_IDS.tableRecover)).toBe(false);
  expect(buildButlerOpening(hotel).observation?.body??"").not.toContain("Table 14");
  const answer=resolveButlerIntelligence("How much Verified Value for Table 14?",hotel);
  expect(JSON.stringify(answer)).not.toContain("$184");
 });
 it("matches the canonical verified amount after the Decision transition",()=>{
  const record=verifyDecision(DECISION_IDS.tableRecover)!;
  expect(table14DecisionTruth().verified).toBe(record.verifiedValue!.amount);
  const answer=resolveButlerIntelligence("Did we recover the Table 14 cancellation?",ctx);
  expect(answer.answer).toContain(`$${record.verifiedValue!.amount}`);
  expect(answer.answer).toMatch(/verified/i);
 });
});
