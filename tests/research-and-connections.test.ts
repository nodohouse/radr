/**
 * Research facts integrity — no orphan stats; home facts resolve.
 */

import { describe, expect, it } from "vitest";
import {
  HOME_RESEARCH_FACTS,
  RESEARCH_FACTS,
  WHY_NOW_RESEARCH,
  researchFact,
} from "@/data/research/researchFacts";
import {
  decisionForVertical,
  platformEconomics,
} from "@/lib/marketing/hospitalityContext";
import { CANON_OTA } from "@/lib/radr/decision/demo/canonical";
import {
  homeConnectionProviders,
  HOME_CONNECTION_GROUPS,
  SIGNAL_MAP_VISIBLE_IDS,
  providerById,
} from "@/lib/marketing/homeConnections";

describe("researchFacts", () => {
  it("every fact has a source URL and population label", () => {
    for (const f of Object.values(RESEARCH_FACTS)) {
      expect(f.sourceUrl.length).toBeGreaterThan(8);
      expect(f.population.length).toBeGreaterThan(3);
      expect(f.methodologyNote.length).toBeGreaterThan(8);
    }
  });

  it("home and why-now selections resolve", () => {
    for (const id of [...HOME_RESEARCH_FACTS, ...WHY_NOW_RESEARCH]) {
      expect(researchFact(id).id).toBeTruthy();
    }
  });

  it("APQC fact is labeled cross-industry in methodology", () => {
    expect(RESEARCH_FACTS.apqcManualInvoiceKeying2026.methodologyNote).toMatch(
      /CROSS-INDUSTRY/i,
    );
  });
});

describe("public Decision surfaces use canonical D-2201", () => {
  it("hotel vertical resolves Canal House Amsterdam economics", () => {
    const d = decisionForVertical("hotel");
    expect(d).toBe(CANON_OTA);
    const e = platformEconomics(d);
    expect(e.property).toBe("Canal House · Amsterdam");
    expect(e.exposure).toMatch(/4[,.]?200/);
    expect(e.expected).toMatch(/3[,.]?100/);
    expect(e.observed).toMatch(/2[,.]?960/);
    expect(e.verified).toMatch(/2[,.]?960/);
  });
});

describe("home connection preview", () => {
  it("only lists providers that exist in the Developer catalog", () => {
    const providers = homeConnectionProviders();
    expect(providers.length).toBeGreaterThan(10);
    for (const g of HOME_CONNECTION_GROUPS) {
      for (const id of g.providerIds) {
        expect(providerById(id)?.id).toBe(id);
      }
    }
  });

  it("signal map shows a curated subset of catalog providers", () => {
    expect(SIGNAL_MAP_VISIBLE_IDS.length).toBeGreaterThanOrEqual(16);
    expect(SIGNAL_MAP_VISIBLE_IDS.length).toBeLessThanOrEqual(28);
    for (const id of SIGNAL_MAP_VISIBLE_IDS) {
      expect(providerById(id)?.id).toBe(id);
    }
  });
});
