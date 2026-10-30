import { describe,expect,it } from "vitest";
import { buildButlerOpening } from "@/lib/radr/butler/opening";
import { getCancellationExposureTool,resolveButlerIntelligence } from "@/lib/radr/butler/tools";
import { euro } from "@/lib/ai/tools";
import type { ButlerContext } from "@/lib/radr/butler/types";
const ctx:ButlerContext={locationScope:"loc_ber",period:"today",role:"location_manager",allowedLocationIds:["loc_ber"]};
describe("Ask source currency consistency",()=>{
 it("uses USD for Soho opening, tool metadata and cancellation answer",()=>{
  expect(JSON.stringify(buildButlerOpening(ctx))).not.toContain("€");
  const exposure=getCancellationExposureTool(ctx);
  expect("currency" in exposure&&exposure.currency).toBe("USD");
  const response=resolveButlerIntelligence("Did we recover the Table 14 cancellation?",ctx);
  expect(JSON.stringify(response)).not.toContain("€");
 });
 it("keeps explicit Euro formatting available and does not leak Soho recovery into Lisbon",()=>{
  expect(euro(620,"EUR")).toBe("€620");
  expect(euro(620,"USD")).toBe("$620");
  const opening=buildButlerOpening({...ctx,locationScope:"loc_chiado_collective",allowedLocationIds:["loc_chiado_collective"]});
  expect(opening.observation?.body??"").not.toContain("Table 14");
 });
});
