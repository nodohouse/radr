import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postLoginDestination } from "@/lib/identity/postLoginDestination";
import {
  DEMO_SETTINGS_KEY, demoSettingsKey, readDemoSettings, writeDemoSettings,
  approvalAuthorityFor,
} from "@/lib/radr/product/demoSettings";
import { buildOtaDecisionRecord } from "@/lib/radr/decision/demos/ota";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { houseReadinessModel } from "@/lib/radr/product/houseReadiness";
import { hotelLivePropertyModel } from "@/lib/radr/product/hotelLive";
import { locationInSelection } from "@/lib/radr/product/selectedScope";
import { guestOverviewModel } from "@/lib/radr/product/guestAttention";

describe("post-login destinations", () => {
  it("keeps an explicit checkout journey ahead of a workspace landing", () => {
    expect(postLoginDestination("/en/checkout?plan=expand&billing=annual", "/app"))
      .toBe("/en/checkout?plan=expand&billing=annual");
  });
  it("uses the workspace destination when no next path was requested", () => {
    expect(postLoginDestination(null, "/onboarding/connect")).toBe("/onboarding/connect");
  });
  it.each(["https://outside.test", "//outside.test", "/%2foutside.test", "/\\outside.test"])(
    "rejects unsafe explicit destinations: %s", (candidate) => {
      expect(postLoginDestination(candidate, "/app")).toBe("/app");
    },
  );
  it("fails closed if both destinations are invalid", () => {
    expect(postLoginDestination("//outside.test", "https://outside.test")).toBe("/onboarding");
  });
});

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value) };
}
function world(vertical: "restaurant" | "hotel") {
  sessionStorage.setItem("radr.demoOrg.v1", JSON.stringify({ vertical }));
}

describe("demo settings isolation", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", storage());
    vi.stubGlobal("sessionStorage", storage());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("keeps organization, currency and users separate when switching worlds", () => {
    world("restaurant");
    writeDemoSettings({ ...readDemoSettings(), orgName: "Restaurant custom", currency: "GBP" });
    world("hotel");
    const hotel = readDemoSettings();
    expect(hotel.orgName).toBe("Northstar Hotels");
    expect(hotel.currency).toBe("USD");
    writeDemoSettings({ ...hotel, orgName: "Hotel custom", currency: "SGD" });
    world("restaurant");
    expect(readDemoSettings().orgName).toBe("Restaurant custom");
    expect(readDemoSettings().currency).toBe("GBP");
    expect(readDemoSettings().users.map(user => user.id)).not.toEqual(hotel.users.map(user => user.id));
  });
  it("imports legacy preferences only into their original world", () => {
    localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify({ orgName: "Legacy hotel", operatingModel: "hotel_model" }));
    world("hotel");
    expect(readDemoSettings().orgName).toBe("Legacy hotel");
    world("restaurant");
    expect(readDemoSettings().orgName).toBe("Northstar Restaurants");
  });
  it("does not import old restaurant users into a hotel demo", () => {
    localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify({ orgName: "Legacy restaurant" }));
    world("hotel");
    expect(readDemoSettings().orgName).toBe("Northstar Hotels");
  });
  it("keeps a stable external-store snapshot until persisted settings change", () => {
    world("hotel");
    writeDemoSettings({ ...readDemoSettings(), approvalGmMax: 420 });
    const before = readDemoSettings();
    expect(readDemoSettings()).toBe(before);
    writeDemoSettings({ ...before, approvalGmMax: 620 });
    expect(readDemoSettings()).not.toBe(before);
    expect(readDemoSettings().approvalGmMax).toBe(620);
  });
  it("writes delayed settings to the captured source world", () => {
    world("restaurant");
    const pending = { ...readDemoSettings(), orgName: "Restaurant pending" };
    world("hotel");
    writeDemoSettings(pending, "restaurant");
    expect(readDemoSettings().orgName).toBe("Northstar Hotels");
    world("restaurant");
    expect(readDemoSettings().orgName).toBe("Restaurant pending");
  });
  it("recovers corrupted scoped storage without adopting the other world", () => {
    world("hotel");
    localStorage.setItem(demoSettingsKey(), "{broken");
    expect(readDemoSettings().orgName).toBe("Northstar Hotels");
  });
  it("labels approval limits in the configured business currency", () => {
    world("restaurant");
    const settings = { ...readDemoSettings(), currency: "USD", approvalGmMax: 420 };
    expect(approvalAuthorityFor(300, settings).label).toContain("$420");
    expect(approvalAuthorityFor(3000, settings).label).not.toContain("€");
  });
});

it("keeps the Soho guest scenario in its USD presentation currency", () => {
  const model = guestOverviewModel();
  expect(model.locationLabel).toBe("Soho · New York");
  expect(JSON.stringify(model)).not.toContain("€");
  expect(JSON.stringify(model)).toContain("$52");
});

it("reconciles arrivals across the hotel decision, Live and readiness panels", () => {
  const count = canalHouseLive().arrivals;
  expect(hotelLivePropertyModel().arrivalsToday).toBe(count);
  expect(houseReadinessModel().arrivalsToday).toBe(count);
  const decision = buildOtaDecisionRecord();
  expect(decision.contextLine).toContain(`${count} arrivals today`);
  expect(JSON.stringify(decision)).not.toContain("12 arrivals");
});

describe("detailed snapshots follow the selected locations", () => {
  it("keeps the New York hotel out of a London-only selection", () => {
    expect(locationInSelection("loc_canal_house", "loc_lisbon_alfama")).toBe(false);
    expect(locationInSelection("loc_canal_house", "region_americas")).toBe(true);
    expect(locationInSelection("loc_canal_house", "region_europe")).toBe(false);
  });
  it("uses an explicit comparison ahead of the broad group scope", () => {
    expect(locationInSelection("loc_berlin_mitte", "all", ["loc_munich_altstadt", "loc_lisbon_alfama"])).toBe(false);
    expect(locationInSelection("loc_berlin_mitte", "all", ["loc_ber", "loc_munich_altstadt"])).toBe(true);
  });
});
