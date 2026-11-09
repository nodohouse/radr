import { describe, expect, it } from "vitest";
import { scopedDemoAnswer } from "@/lib/product/scopedDemoAnswer";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { englishEditorialOnly } from "@/i18n/contentAvailability";

const hotel = listDecisionRecords().filter(record=>record.vertical==="hotel");
describe("grounded demo answers",()=>{
 it("answers hotel arrival and guest questions from the hotel snapshot",()=>{
  const answer=scopedDemoAnswer("Which rooms need attention before arrivals?",hotel,"Mercer House",true,"loc_canal_house");
  expect(answer.title).toContain("rooms");
  expect(answer.metrics?.find(metric=>metric.label==="Arrival wave ready")?.value).toBe("31 / 42");
  const guests=scopedDemoAnswer("What guest allergies and special requests matter?",hotel,"Mercer House",true,"loc_canal_house");
  expect(guests.summary).toContain("guest-reported shellfish allergy");
  expect(guests.evidence.some(item=>item.value.includes("Feather-free bedding"))).toBe(true);
  expect(guests.warnings?.[0].message).toContain("Nothing has been sent");
 });
 it("does not attach Mercer guest details to another property",()=>{
  const answer=scopedDemoAnswer("Guest allergies",[],"Another hotel",true,"loc_paris_opera");
  expect(JSON.stringify(answer)).not.toMatch(/Shellfish|Michael Tan|Room 310/i);
  expect(answer.primaryMetric).toBeUndefined();
  expect(answer.actions).toEqual([]);
 });
 it("does not invent records or a financial result for an empty scope",()=>{
  const answer=scopedDemoAnswer("Which decisions need me?",[],"Selected property",false,"unknown");
  expect(answer.evidence).toEqual([]);expect(answer.primaryMetric).toBeUndefined();
  expect(answer.answer).toContain("No result has been borrowed");
 });
});
describe("published content locales",()=>{
 it("publishes English editorial at its English URL while preserving translated authentication",()=>{
  expect(englishEditorialOnly("/pricing")).toBe(true);
  expect(englishEditorialOnly("/developers/api?from=nav")).toBe(true);
  expect(englishEditorialOnly("/signup")).toBe(false);
  expect(englishEditorialOnly("/login")).toBe(false);
 });
});
