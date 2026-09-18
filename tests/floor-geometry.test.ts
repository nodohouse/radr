import { describe, expect, it } from "vitest";
import { BERLIN_FLOOR } from "@/lib/radr/berlinFloor";
import {
  SECTION_HEADER_GAP,
  SECTION_HEADER_HEIGHT,
  sectionCanvasTop,
  validateFloorGeometry,
} from "@/lib/radr/floorModel";

describe("Berlin floor geometry", () => {
  it("reserves a header safe zone in every section", () => {
    expect(SECTION_HEADER_HEIGHT).toBeGreaterThanOrEqual(58);
    expect(SECTION_HEADER_GAP).toBeGreaterThanOrEqual(12);
  });

  it("keeps every table below its section header canvas top", () => {
    const bySection = new Map(BERLIN_FLOOR.sections.map((s) => [s.id, s]));
    for (const t of BERLIN_FLOOR.tables) {
      const section = bySection.get(t.sectionId)!;
      expect(t.y).toBeGreaterThanOrEqual(sectionCanvasTop(section));
    }
  });

  it("passes header overlap, table overlap, and bounds validation", () => {
    expect(validateFloorGeometry(BERLIN_FLOOR)).toEqual([]);
  });

  it("keeps seat sum coherent", () => {
    const sum = BERLIN_FLOOR.tables.reduce((s, t) => s + t.seats, 0);
    expect(sum).toBe(BERLIN_FLOOR.seats);
  });
});
