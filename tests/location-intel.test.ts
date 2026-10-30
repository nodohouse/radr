/**
 * Every canonical location resolves + reconciles.
 */
import { describe, expect, it } from "vitest";
import {
  allCanonicalLocationIds,
  locationExists,
  resolveLocation,
} from "@/lib/radr/location/resolve";
import { composeLocationIntel } from "@/lib/radr/location/composeLocationIntel";
import { NORTHSTAR_HOTELS, NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";
import { generateDailyHistory, aggregateMonths } from "@/lib/radr/location/historyEngine";

describe("location resolve", () => {
  it("every org location exists", () => {
    for (const id of allCanonicalLocationIds()) {
      expect(locationExists(id), id).toBe(true);
      expect(resolveLocation(id)?.id).toBe(id);
    }
    expect(allCanonicalLocationIds()).toHaveLength(
      NORTHSTAR_RESTAURANTS.locations.length + NORTHSTAR_HOTELS.locations.length,
    );
  });

  it("aliases legacy marketing IDs onto living locations", () => {
    expect(resolveLocation("loc_london_shoreditch")?.id).toBe(
      "loc_berlin_kreuzberg",
    );
    expect(resolveLocation("loc_paris_marais")?.id).toBe(
      "loc_dusseldorf_medienhafen",
    );
    expect(resolveLocation("loc_frankfurt")?.id).toBe("loc_frankfurt_westend");
  });

  it("composeLocationIntel never null for org locations", () => {
    for (const id of allCanonicalLocationIds()) {
      const intel = composeLocationIntel(id, { role: "coo" });
      expect(intel, id).not.toBeNull();
      expect(intel!.statement.line.length).toBeGreaterThan(5);
      expect(intel!.economics.locationId).toBe(id);
      expect(intel!.daily.length).toBe(730);
      expect(intel!.dna.strongestDays).toBeTruthy();
    }
  });

  it("history reconciles month revenue to daily sum", () => {
    const seed = NORTHSTAR_RESTAURANTS.locations[0]!;
    const daily = generateDailyHistory(seed, 60);
    const months = aggregateMonths(daily);
    for (const m of months) {
      const sum = daily
        .filter((d) => d.date.startsWith(m.month))
        .reduce((s, d) => s + d.revenue, 0);
      expect(m.revenue).toBe(sum);
    }
  });

  it("Berlin statement is revenue ahead / contribution behind", () => {
    const intel = composeLocationIntel("loc_berlin_mitte")!;
    expect(intel.statement.line.toLowerCase()).toMatch(/revenue/);
    expect(intel.statement.line.toLowerCase()).toMatch(/contribution/);
  });
});
