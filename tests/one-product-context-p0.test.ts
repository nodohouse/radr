/**
 * One-product P0 — Decisions uses ProductShell; pages must not force CFO/All/MTD.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("one-product P0 shell / context", () => {
  it("ProductShell no longer strips AppShell for /app/decisions", () => {
    const src = read("components/product/ProductShell.tsx");
    expect(src).not.toMatch(/isRadrDecisions/);
    expect(src).toMatch(/RoutePeriodSync/);
  });

  it("RadrDecisions embeds without private nav chrome", () => {
    const src = read("components/product/decisions/workspace/RadrDecisions.tsx");
    expect(src).toMatch(/data-embedded="true"/);
    expect(src).not.toMatch(/className="rd-nav"/);
    expect(src).toMatch(/band=needs_you|urlBand === "needs_you"/);
  });

  it("Locations / House Readiness / Live estate do not force global store", () => {
    const locations = read(
      "components/product/locations/engine/LocationsShell.tsx",
    );
    expect(locations).not.toMatch(/setPeriod\("mtd"\)/);

    const house = read(
      "components/product/operations/house-readiness/HouseReadinessShell.tsx",
    );
    expect(house).not.toMatch(/setPeriod\("today"\)/);

    const live = read("components/product/live-spatial/LiveSpatialShell.tsx");
    expect(live).not.toMatch(/setLocationScope\("all"\)/);
    expect(live).not.toMatch(
      /Keep Estate context locked: All locations · CFO/,
    );
  });

  it("hotel dashboard brief does not overwrite global persona/scope", () => {
    const src = read("app/app/dashboards/[id]/page.tsx");
    expect(src).not.toMatch(/setRoleView\("hotel_gm"\)/);
    expect(src).not.toMatch(/setLocationScope\("loc_canal_house"\)/);
  });
});
