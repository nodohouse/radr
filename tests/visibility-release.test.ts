import { describe, expect, it } from "vitest";
import { parseComparisonLocationIds } from "@/lib/radr/comparisonService";

describe("visibility release — compare route", () => {
  it("parses legacy from/to without blocking on ready gate", () => {
    const ids = parseComparisonLocationIds(
      null,
      "loc_hamburg_speicher",
      "loc_berlin_mitte",
    );
    expect(ids).toEqual(["loc_hamburg_speicher", "loc_berlin_mitte"]);
  });
});
