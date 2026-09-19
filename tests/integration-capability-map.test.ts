/**
 * Integration capability storytelling — potential signals, not live claims.
 */
import { describe, expect, it } from "vitest";
import {
  INTEGRATION_PROVIDERS,
  getProvider,
} from "@/lib/integrations/registry";
import {
  GOOGLE_STACK_IDS,
  INTEGRATION_CAPABILITY_STORY,
  accessStatusLabel,
  capabilityStoryFor,
} from "@/lib/integrations/capabilityStory";
import {
  HOME_CAPABILITY_GROUPS,
  HOME_RESTING_PROVIDER_IDS,
  SIGNAL_MAP_VISIBLE_IDS,
  providerById,
} from "@/lib/marketing/homeConnections";

describe("integration capability map", () => {
  it("homepage resting set stays curated (~14–20 chips)", () => {
    expect(HOME_RESTING_PROVIDER_IDS.length).toBeGreaterThanOrEqual(14);
    expect(HOME_RESTING_PROVIDER_IDS.length).toBeLessThanOrEqual(20);
    for (const id of HOME_RESTING_PROVIDER_IDS) {
      if (id === "google-stack") continue;
      expect(providerById(id)?.id).toBe(id);
    }
  });

  it("homepage visible ids resolve in the canonical registry", () => {
    for (const id of SIGNAL_MAP_VISIBLE_IDS) {
      expect(getProvider(id)?.id).toBe(id);
    }
  });

  it("homepage groups only reference registry providers or google-stack", () => {
    for (const g of HOME_CAPABILITY_GROUPS) {
      for (const id of g.providerIds) {
        if (id === "google-stack") continue;
        expect(providerById(id)?.id).toBe(id);
      }
    }
  });

  it("google stack children exist and stay external-signals", () => {
    for (const id of GOOGLE_STACK_IDS) {
      const p = getProvider(id);
      expect(p?.category).toBe("external-signals");
      expect(accessStatusLabel(p!)).toBe("External data");
    }
  });

  it("flagship providers have potential-signal stories", () => {
    for (const id of [
      "toast",
      "opentable",
      "mews",
      "adyen",
      "predicthq",
      "google-business-profile",
      "open-meteo",
      "siteminder",
    ]) {
      const story = capabilityStoryFor(id);
      expect(story?.potentialSignals.length).toBeGreaterThanOrEqual(3);
      expect(story?.potentialSignals.length).toBeLessThanOrEqual(6);
      expect(story?.radrCouldSee.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not mark illustrative commercial providers as available", () => {
    for (const id of ["toast", "opentable", "mews", "adyen", "uber-eats"]) {
      expect(getProvider(id)?.status).not.toBe("available");
    }
    expect(getProvider("files-csv")?.status).toBe("available");
  });

  it("catalog includes new contextual sources", () => {
    const ids = new Set(INTEGRATION_PROVIDERS.map((p) => p.id));
    for (const id of [
      ...GOOGLE_STACK_IDS,
      "ticketmaster",
      "personio",
      "netsuite",
      "adyen",
    ]) {
      expect(ids.has(id)).toBe(true);
      expect(INTEGRATION_CAPABILITY_STORY[id]).toBeTruthy();
    }
  });
});
