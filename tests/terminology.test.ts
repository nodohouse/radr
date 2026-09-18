import { describe, expect, it } from "vitest";
import {
  abbrevWithExpansion,
  getTerm,
  searchTerms,
  TERMINOLOGY,
  termsByCategory,
} from "@/lib/radr/terminology";

describe("terminology catalog", () => {
  it("keeps reservations distinct from covers", () => {
    expect(getTerm("reservations").shortDefinition.toLowerCase()).toContain(
      "booking",
    );
    expect(getTerm("bookedCovers").shortDefinition.toLowerCase()).toContain(
      "guest",
    );
    expect(getTerm("reservations").id).not.toBe(getTerm("bookedCovers").id);
  });

  it("does not equate cancelled booking value with lost revenue", () => {
    const affected = getTerm("bookingValueAffected").shortDefinition.toLowerCase();
    const atRisk = getTerm("revenueAtRisk").shortDefinition.toLowerCase();
    expect(affected).toContain("does not mean");
    expect(atRisk).toMatch(/not confirmed|predictive/);
  });

  it("marks operating margin as configurable", () => {
    expect(getTerm("operatingMargin").configurable).toBe(true);
  });

  it("expands FOH / COGS abbreviations", () => {
    expect(getTerm("foh").expandsTo).toMatch(/Front of House/i);
    expect(getTerm("cogs").expandsTo).toMatch(/Cost of Goods/i);
  });

  it("formats FOH with expansion in parentheses for operator UI", () => {
    expect(abbrevWithExpansion("foh")).toBe("FOH (Front of House)");
    expect(abbrevWithExpansion("boh")).toBe("BOH (Back of House)");
  });

  it("searches across aliases and categories", () => {
    expect(searchTerms("yoy").some((t) => t.id === "yearOverYear")).toBe(true);
    expect(termsByCategory("reservations").length).toBeGreaterThan(5);
    expect(Object.keys(TERMINOLOGY).length).toBeGreaterThan(40);
  });
});
