import { describe, expect, it } from "vitest";
import { composeBerlinOperatingHorizon } from "@/lib/radr/horizon";

describe("operating horizon", () => {
  it("always exposes tomorrow and this week", () => {
    const h = composeBerlinOperatingHorizon();
    expect(h.tomorrow.covers).toBeGreaterThan(0);
    expect(h.week.length).toBeGreaterThanOrEqual(2);
    expect(h.headline.length).toBeGreaterThan(0);
  });

  it("surfaces HUGE events within 4 weeks", () => {
    const h = composeBerlinOperatingHorizon();
    const huge = h.leads.filter((l) => l.scale === "HUGE");
    expect(huge.length).toBeGreaterThanOrEqual(1);
    expect(huge.every((l) => l.weeksOut <= 4)).toBe(true);
  });

  it("keeps BIG leads visible inside the 4-week window", () => {
    const h = composeBerlinOperatingHorizon();
    expect(h.leads.every((l) => l.weeksOut <= 4)).toBe(true);
  });
});
