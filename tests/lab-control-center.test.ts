import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUTOPILOT_LEVELS, isVerifiedAllowed } from "@/lib/lab/format";
import { ROLE_LENSES } from "@/lib/lab/roles";
import {
  CATALOG,
  DECISIONS,
  HEALTH,
  LAB_NAV,
  MEMORY_STORIES,
  getDecision,
  worldFor,
} from "@/lib/lab/world";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("Control Center lab routes", () => {
  it("ships the live /app/lab surfaces", () => {
    for (const file of [
      "app/app/lab/layout.tsx",
      "app/app/lab/control-center/page.tsx",
      "app/app/lab/decisions/page.tsx",
      "app/app/lab/decisions/[id]/page.tsx",
      "app/app/lab/my-center/page.tsx",
      "app/app/lab/catalog/page.tsx",
      "app/app/lab/value/page.tsx",
      "app/app/lab/memory/page.tsx",
      "app/app/lab/service/page.tsx",
      "DESIGN.md",
    ]) {
      expect(read(file).length).toBeGreaterThan(20);
    }
  });

  it("nav matches Center / Decisions / Catalog / Value / Memory", () => {
    expect(LAB_NAV.map((n) => n.label)).toEqual([
      "Center",
      "Decisions",
      "Catalog",
      "Value",
      "Memory",
    ]);
    expect(LAB_NAV.find((n) => n.id === "catalog")?.href).toBe("/app/lab/catalog");
  });
});

describe("seeds", () => {
  it("restaurant, hotel, and recover worlds exist", () => {
    expect(worldFor("service").industry).toBe("restaurant");
    expect(worldFor("hotel").industry).toBe("hotel");
    expect(worldFor("recover").heroDecisionId).toBe("d-4102");
    expect(worldFor("service").heroDecisionId).toBe("d-1911");
    expect(worldFor("hotel").heroDecisionId).toBe("d-8801");
  });

  it("each pulse has a time series, forecast, and turbulence with D-ids", () => {
    for (const seed of ["service", "hotel", "recover"] as const) {
      const pulse = worldFor(seed).pulse;
      expect(pulse.series.length).toBeGreaterThan(4);
      expect(pulse.series24h.length).toBeGreaterThan(2);
      expect(pulse.turbulence.length).toBeGreaterThan(0);
      for (const t of pulse.turbulence) {
        expect(t.displayId.startsWith("D-")).toBe(true);
        expect(t.because.length).toBeGreaterThan(8);
        expect(t.euro).toBeGreaterThan(0);
      }
    }
  });
});

describe("role lenses", () => {
  it("GM, CFO, and C-level are not the same surface", () => {
    expect(ROLE_LENSES.gm.showFloor).toBe(true);
    expect(ROLE_LENSES.cfo.showFloor).toBe(false);
    expect(ROLE_LENSES.cfo.showWinLoss).toBe(true);
    expect(ROLE_LENSES.clevel.showThemes).toBe(true);
    expect(ROLE_LENSES.clevel.showBrief).toBe(false);
    expect(ROLE_LENSES.gm.catalogEmphasis).toContain("SELL");
    expect(ROLE_LENSES.cfo.catalogEmphasis).toContain("RECOVER");
  });
});

describe("Verified honesty", () => {
  it("never marks Verified without lineage", () => {
    for (const d of DECISIONS) {
      expect(isVerifiedAllowed(d.grade, d.lineage)).toBe(true);
      if (d.grade === "Verified") expect(d.lineage).toBeTruthy();
    }
    const bank = worldFor("service").verifiedBank;
    expect(bank.grade).toBe("Verified");
    expect(bank.lineage).toMatch(/Trace|ledger|POS/i);
  });

  it("AP credit stays Expected until a memo applies", () => {
    const ap = getDecision("d-4102");
    expect(ap?.grade).toBe("Expected");
    expect(ap?.lineage).toMatch(/credit_memo/i);
    expect(ap?.policy.alwaysAsk.join(" ")).toMatch(/Dispute AP/i);
  });
});

describe("autopilot + briefs + catalog", () => {
  it("defines four progressive trust levels", () => {
    expect(AUTOPILOT_LEVELS.suggest.n).toBe(1);
    expect(AUTOPILOT_LEVELS.stage.n).toBe(2);
    expect(AUTOPILOT_LEVELS.auto.n).toBe(3);
    expect(AUTOPILOT_LEVELS.verified.n).toBe(4);
  });

  it("ships Chef / FOH / GM / CFO packets", () => {
    const brief = worldFor("service").brief;
    expect(brief.packets.chef.items.length).toBeGreaterThan(1);
    expect(brief.packets.foh.title).toMatch(/FOH/i);
    expect(brief.packets.gm.items.length).toBeGreaterThan(1);
    expect(brief.packets.cfo.items.some((i) => i.displayId === "D-4102")).toBe(true);
    expect(brief.deltaNote.length).toBeGreaterThan(10);
  });

  it("catalog is Buy·Sell·Labor·Recover plus Value/Memory", () => {
    const cats = new Set(CATALOG.map((m) => m.category));
    for (const c of ["BUY", "SELL", "LABOR", "RECOVER", "VALUE", "MEMORY"]) {
      expect(cats.has(c as (typeof CATALOG)[number]["category"])).toBe(true);
    }
    expect(MEMORY_STORIES[0]?.verified).toMatch(/Verified/i);
    expect(HEALTH.some((h) => h.status === "degraded")).toBe(true);
  });
});

describe("brand + light canvas", () => {
  it("lab mark is a triangle, not a letter R", () => {
    const mark = read("components/lab/TriangleMark.tsx");
    expect(mark).toContain("M50 8 L90 81 H10 Z");
    expect(mark).toContain("Never a letter R");
    expect(mark).not.toContain("RadrWordmark");
  });

  it("CSS is sand/mint light, not a near-black board", () => {
    const css = read("app/lab.css");
    expect(css).toContain("--sand: #f3efe6");
    expect(css).toContain("--mint: #e8f4ee");
    expect(css).toContain("--acid: #00f56a");
    expect(css).not.toMatch(/background:\s*#050705/);
    expect(css).not.toMatch(/background:\s*#08100c/);
  });

  it("Pulse graph is a first-class surface", () => {
    const graph = read("components/lab/ShiftPulseGraph.tsx");
    expect(graph).toContain("Shift Pulse time series");
    expect(graph).toContain("onTurbulence");
    const board = read("components/lab/ControlCenter.tsx");
    expect(board).toContain("ShiftPulseGraph");
    expect(board).toContain("DecisionBand");
    expect(board).toContain("RoleBand");
    expect(board).toContain("lab-os-stack");
    const css = read("app/lab.css");
    expect(css).toContain("46vh");
    expect(css).toContain("lab-story-grid");
    expect(css).toContain("repeat(2, minmax(0, 1fr))");
  });
});
