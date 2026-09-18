import { describe, expect, it } from "vitest";
import { getOperatingSnapshot } from "@/lib/radr/operatingSnapshot";
import { resolveButlerQuery } from "@/lib/radr/butler/tools";

describe("operatingSnapshot", () => {
  it("returns berlin tonight + attention from one source", () => {
    const snap = getOperatingSnapshot("loc_ber", "yesterday");
    expect(snap.locationName).toMatch(/Berlin/i);
    expect(snap.tonight).not.toBeNull();
    expect(snap.tonight!.reservations).toBeGreaterThan(0);
    expect(snap.trading.revenue).toBeGreaterThan(0);
    expect(snap.attention.atRiskEuro).toBeGreaterThanOrEqual(0);
  });
});

describe("butler tools", () => {
  const ctx = {
    locationScope: "loc_ber",
    period: "yesterday" as const,
    role: "group_cfo" as const,
    allowedLocationIds: "all" as const,
  };

  it("answers cancellation from domain data", () => {
    const a = resolveButlerQuery("Show cancellations tonight", ctx);
    expect(a.toolUsed).toBe("get_cancellations");
    expect(a.evidence.length).toBeGreaterThan(0);
    expect(a.answer).toMatch(/€|EUR|exposure|cancel/i);
  });

  it("compares berlin and paris without inventing math", () => {
    const a = resolveButlerQuery("Why is Paris outperforming Berlin?", ctx);
    expect(a.toolUsed).toBe("compare_locations");
    expect(
      a.evidence.some((e) => e.label.toLowerCase().includes("margin")),
    ).toBe(true);
  });

  it("blocks location manager from foreign scope", () => {
    const denied = resolveButlerQuery("Why was margin down?", {
      ...ctx,
      role: "location_manager",
      allowedLocationIds: ["loc_par"],
      locationScope: "loc_ber",
    });
    const text = denied.answer.toLowerCase();
    expect(
      /permission|not authorized|don't have|scope|access|enough/.test(text),
    ).toBe(true);
  });
});
