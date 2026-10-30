import { describe, expect, it } from "vitest";
import {
  resolveExperienceContext,
  liveSceneFor,
  locationTabsFor,
  verticalOfLocation,
  composeControlCenterExperience,
} from "@/lib/radr/product/experienceComposer";
import {
  verticalDayFor,
  GROUP_OPERATING_OUTLIERS,
} from "@/lib/radr/product/verticalDay";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

describe("ExperienceComposer", () => {
  it("maps connected locations to correct verticals", () => {
    expect(verticalOfLocation(DEMO_LOCATIONS.berlin.id)).toBe("restaurant");
    expect(verticalOfLocation(DEMO_LOCATIONS.canal.id)).toBe("hotel");
    expect(verticalOfLocation(DEMO_LOCATIONS.chiado.id)).toBe("apartment");
  });

  it("hotel and apartment live scenes are not restaurant service", () => {
    const hotel = resolveExperienceContext({
      role: "gm",
      locationScope: DEMO_LOCATIONS.canal.id,
    });
    expect(liveSceneFor(hotel)).toBe("hotel_today");
    const hotelTabs = locationTabsFor("hotel").map((t) => t.id);
    expect(hotelTabs).toEqual([
      "overview",
      "live",
      "performance",
      "decisions",
      "value",
      "memory",
      "data",
    ]);
    expect(hotelTabs).not.toContain("distribution");
    expect(hotelTabs).not.toContain("today");

    const apt = resolveExperienceContext({
      role: "gm",
      locationScope: DEMO_LOCATIONS.chiado.id,
    });
    expect(liveSceneFor(apt)).toBe("apartment_turnover");
    const aptTabs = locationTabsFor("apartment").map((t) => t.id);
    expect(aptTabs[0]).toBe("overview");
    expect(aptTabs).toContain("live");
  });

  it("hotel day fixture has no restaurant covers metric", () => {
    const day = verticalDayFor(DEMO_LOCATIONS.canal.id)!;
    expect(day.vertical).toBe("hotel");
    const labels = day.heroMetrics.map((m) => m.label.toLowerCase());
    expect(labels.some((l) => l.includes("cover"))).toBe(false);
    expect(labels.some((l) => l.includes("occupancy"))).toBe(true);
    expect(labels.some((l) => l.includes("adr"))).toBe(true);
  });

  it("apartment day fixture has turnover / gap metrics", () => {
    const day = verticalDayFor(DEMO_LOCATIONS.chiado.id)!;
    expect(day.vertical).toBe("apartment");
    const blob = day.heroMetrics.map((m) => m.label).join(" ");
    expect(blob).toMatch(/gap|orphan|cleaning|arrivals/i);
    expect(blob).not.toMatch(/kitchen|covers served/i);
  });

  it("composes Control Center experience by role", () => {
    const gm = composeControlCenterExperience({
      role: "gm",
      locationScope: "loc_berlin_mitte",
      vertical: "restaurant",
    });
    expect(gm.decisionPriorityIds[0]).toBe("dec_peak_berlin");
    expect(gm.emphasis).toMatch(/Service/i);

    const coo = composeControlCenterExperience({
      role: "coo",
      locationScope: "all",
      vertical: "restaurant",
    });
    expect(coo.decisionPriorityIds[0]).toBe("dec_labor_berlin");
    expect(coo.emphasis).toMatch(/Estate|labor/i);

    const cfo = composeControlCenterExperience({
      role: "cfo",
      locationScope: "all",
      vertical: "restaurant",
    });
    expect(cfo.emphasis).toMatch(/Contribution|Verified/i);
  });
});
