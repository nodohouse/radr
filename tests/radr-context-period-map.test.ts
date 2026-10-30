import { describe, expect, it } from "vitest";
import { resolvePeriodForRoute, routePeriodClass } from "@/lib/product/radrContext/periodMap";

describe("routePeriodClass", () => {
  it("classifies primary routes", () => {
    expect(routePeriodClass("/app")).toBe("control_center");
    expect(routePeriodClass("/app/live")).toBe("live");
    expect(routePeriodClass("/app/service")).toBe("operations");
    expect(routePeriodClass("/app/decisions")).toBe("decisions");
    expect(routePeriodClass("/app/decisions/dec_peak_berlin")).toBe("decisions");
    expect(routePeriodClass("/app/value")).toBe("value");
    expect(routePeriodClass("/app/locations")).toBe("locations");
  });
});

describe("resolvePeriodForRoute", () => {
  it("maps MTD → Today for operations / live", () => {
    expect(resolvePeriodForRoute("/app/service", "mtd")).toBe("today");
    expect(resolvePeriodForRoute("/app/live", "ytd")).toBe("today");
  });

  it("keeps Today on Decisions (Live-equivalent)", () => {
    expect(resolvePeriodForRoute("/app/decisions", "today")).toBe("today");
  });

  it("maps Today → MTD for Value", () => {
    expect(resolvePeriodForRoute("/app/value", "today")).toBe("mtd");
  });

  it("does not overwrite period for Locations", () => {
    expect(resolvePeriodForRoute("/app/locations", "today")).toBe("today");
  });
});
