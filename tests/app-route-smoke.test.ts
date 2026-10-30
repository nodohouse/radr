import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { locationById } from "@/lib/product/demo/catalog";
import { toCatalogLocationId } from "@/lib/radr/product/locationIds";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

const root = join(process.cwd());

function pageExists(route: string) {
  const rel = route.replace(/^\//, "");
  const candidates = [
    join(root, "app", rel, "page.tsx"),
    join(root, "app", rel, "page.ts"),
  ];
  return candidates.some((p) => existsSync(p));
}

describe("app route smoke — pages exist", () => {
  for (const route of [
    "app",
    "app/decisions",
    "app/value",
    "app/locations",
    "app/memory",
    "app/intelligence",
    "app/connections",
    "app/data-health",
    "app/settings",
    "app/service",
  ]) {
    it(`${route} page exists`, () => {
      expect(pageExists(route)).toBe(true);
    });
  }
});

describe("location ID namespace integrity", () => {
  it("canonical pulse IDs resolve in location catalog", () => {
    for (const id of [
      DEMO_LOCATIONS.berlin.id,
      DEMO_LOCATIONS.canal.id,
      DEMO_LOCATIONS.chiado.id,
    ]) {
      expect(locationById(id)).toBeTruthy();
      expect(toCatalogLocationId(id)).toBeTruthy();
    }
  });

  it("legacy loc_ber still resolves", () => {
    expect(locationById("loc_ber")?.name).toMatch(/Berlin/i);
  });
});
