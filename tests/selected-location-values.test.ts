import { describe,expect,it } from "vitest";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { recordsForLocationSelection } from "@/lib/radr/product/selectedScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";

describe("selected location decision value",()=>{
  it("canonicalizes legacy scope IDs without leaking other locations",()=>{
    const rows=recordsForLocationSelection(listDecisionRecords(),"loc_ber");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(r=>r.locationId==="loc_berlin_mitte")).toBe(true);
  });
  it("preserves all permitted records when the whole estate is selected",()=>{
    const records=listDecisionRecords();
    expect(recordsForLocationSelection(records,"all")).toEqual(records);
  });
  it("uses the explicit comparison selection in preference to a single scope",()=>{
    const records=listDecisionRecords();
    const selected=recordsForLocationSelection(records,"all",["loc_ber","loc_canal_house"]);
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every(r=>["loc_berlin_mitte","loc_canal_house"].includes(r.locationId))).toBe(true);
    expect(selected.some(r=>r.locationId==="loc_berlin_mitte")).toBe(true);
  });
  it("excludes American hero records when a European region is selected",()=>{
    const selected=recordsForLocationSelection(listDecisionRecords(),"region_europe");
    expect(selected.some(r=>["loc_berlin_mitte","loc_canal_house"].includes(r.locationId))).toBe(false);
  });
  it("keeps cards, ledger classes, and trend reconciled for the selected records",()=>{
    const rows=recordsForLocationSelection(listDecisionRecords(),"loc_berlin_mitte");
    const aggregate=deriveValueAggregate("cfo","restaurant",rows);
    const value=buildValueOverview("cfo","restaurant",rows);
    expect(value.verifiedTotal).toBe(aggregate.verifiedTotal);
    expect(value.driversSum).toBe(aggregate.verifiedTotal);
    expect(value.trend.at(-1)?.cumulative??0).toBe(aggregate.verifiedTotal);
  });
  it("does not show another location's value when no decision records exist",()=>{
    const rows=recordsForLocationSelection(listDecisionRecords(),"loc_nonexistent");
    const value=buildValueOverview("cfo","restaurant",rows);
    expect(value.verifiedTotal).toBe(0);
    expect(value.driversSum).toBe(0);
    expect(value.trend).toEqual([]);
  });
});
