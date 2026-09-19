/**
 * Unique photographic assets across public marketing editorial surfaces.
 */
import { describe, expect, it } from "vitest";
import {
  assertUniquePhotographicAssets,
  MARKETING_IMAGES,
  PUBLIC_PHOTO_USAGE_REPORT,
} from "@/lib/marketing/publicImagery";

describe("public marketing imagery uniqueness", () => {
  it("assigns each photographic src to exactly one editorial id", () => {
    const errors = assertUniquePhotographicAssets();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  it("keeps product screenshots marked as product kind", () => {
    const products = Object.values(MARKETING_IMAGES).filter(
      (img) => img.kind === "product",
    );
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.src.includes("mockup") || p.vertical === "product").toBe(true);
    }
  });

  it("exposes an internal usage report for QA", () => {
    expect(PUBLIC_PHOTO_USAGE_REPORT.length).toBe(
      Object.keys(MARKETING_IMAGES).length,
    );
    for (const row of PUBLIC_PHOTO_USAGE_REPORT) {
      expect(row.usedElsewhere).toContain("NO");
    }
  });
});
