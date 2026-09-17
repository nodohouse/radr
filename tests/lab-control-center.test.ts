import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AUTOPILOT_LEVELS, autopilotForSeed } from "@/lib/lab/autopilot";
import { getServiceBrief } from "@/lib/lab/briefs";
import { DECISION_QUEUE } from "@/lib/lab/decisions";
import { formatEuro } from "@/lib/lab/format";
import { getPulseModel } from "@/lib/lab/pulse";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { VALUE_LINES, VERIFIED_TOTAL } from "@/lib/lab/value";

const root = join(process.cwd());

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Control Center composition", () => {
  it("keeps Center as three bands: pulse, decision, role", () => {
    const board = read("components/lab/ControlCenter.tsx");
    expect(board).toContain("ShiftPulseGraph");
    expect(board).toContain("DecisionBand");
    expect(board).toContain("RoleBand");
    expect(board).not.toContain("lab-kpi");
  });

  it("uses a triangle mark, never a letter R logo", () => {
    const mark = read("components/lab/DeltaMark.tsx");
    expect(mark).toContain("M50 8 L90 81 H10 Z");
    expect(mark).toContain("Triangle mark");
    expect(mark).not.toContain("RadrWordmark");
    expect(mark).not.toContain('viewBox="0 0 152 44"');
  });

  it("documents composition, pulse, autopilot, and brief schema", () => {
    const design = read("DESIGN.md");
    expect(design).toContain("three bands");
    expect(design).toContain("Restaurant");
    expect(design).toContain("Hotel");
    expect(design).toContain("Autopilot levels");
    expect(design).toContain("Service Brief schema");
    expect(design).toContain("Estimated / Expected is **not** Verified");
  });
});

describe("Shift Pulse", () => {
  it("builds restaurant, hotel, and recover series with because-lines", () => {
    const service = getPulseModel("service", "shift");
    const hotel = getPulseModel("hotel", "shift");
    const recover = getPulseModel("recover", "shift");

    expect(service.industry).toBe("restaurant");
    expect(hotel.industry).toBe("hotel");
    expect(recover.windowLabel).toMatch(/14d/);

    for (const model of [service, hotel, recover]) {
      expect(model.points.length).toBeGreaterThan(4);
      expect(model.series.map((s) => s.direction)).toEqual(
        expect.arrayContaining(["in", "out", "net", "forecast"]),
      );
      expect(model.netGrade).toBe("Expected");
      expect(model.netBecause.length).toBeGreaterThan(10);
      for (const mark of model.turbulence) {
        expect(mark.because.length).toBeGreaterThan(8);
        expect(mark.displayId).toMatch(/^D-/);
        expect(["Expected", "Verified"]).toContain(mark.grade);
      }
    }
  });

  it("does not treat forecast or net as Verified", () => {
    const service = getPulseModel("service");
    expect(service.netGrade).not.toBe("Verified");
    expect(service.forecastBecause).toMatch(/not Verified|Expected/i);
  });
});

describe("Role lenses", () => {
  it("gives GM, CFO, and C-level different truths", () => {
    expect(ROLE_LENSES.gm.showFloor).toBe(true);
    expect(ROLE_LENSES.gm.showWinLoss).toBe(false);
    expect(ROLE_LENSES.cfo.showFloor).toBe(false);
    expect(ROLE_LENSES.cfo.showWinLoss).toBe(true);
    expect(ROLE_LENSES.cfo.pulseEmphasis).toBe("pnl");
    expect(ROLE_LENSES.clevel.showThemes).toBe(true);
    expect(ROLE_LENSES.gm.defaultSeed).toBe("service");
    expect(ROLE_LENSES.cfo.defaultSeed).toBe("recover");
  });
});

describe("Autopilot", () => {
  it("exposes four progressive-trust levels", () => {
    expect(AUTOPILOT_LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4]);
    expect(AUTOPILOT_LEVELS[3]?.label).toBe("Verified");
  });

  it("stages service, suggests recover, and never seals demo money", () => {
    const service = autopilotForSeed("service");
    const recover = autopilotForSeed("recover");
    expect(service.level).toBe(2);
    expect(service.memoryLine).toMatch(/12 similar Fridays/);
    expect(recover.level).toBe(1);
    expect(recover.alwaysAsk.join(" ")).toMatch(/Dispute AP/);
    expect(service.level).not.toBe(4);
    expect(recover.level).not.toBe(4);
  });
});

describe("Briefs and money law", () => {
  it("ships Chef, FOH, GM, and CFO packets for each seed", () => {
    for (const seed of ["service", "hotel", "recover"] as const) {
      const brief = getServiceBrief(seed);
      expect(brief.packets.chef.items.length).toBeGreaterThan(2);
      expect(brief.packets.foh.items.length).toBeGreaterThan(2);
      expect(brief.packets.gm.items.length).toBeGreaterThan(1);
      expect(brief.packets.cfo.items.length).toBeGreaterThan(1);
      expect(brief.deltaNote.length).toBeGreaterThan(10);
    }
  });

  it("keeps Expected and Verified distinct on the ledger", () => {
    const verified = VALUE_LINES.filter((l) => l.grade === "Verified");
    const expected = VALUE_LINES.filter((l) => l.grade === "Expected");
    expect(verified.length).toBeGreaterThan(0);
    expect(expected.length).toBeGreaterThan(0);
    expect(verified.every((l) => l.band === "verified")).toBe(true);
    expect(expected.every((l) => l.band !== "verified")).toBe(true);
    expect(VERIFIED_TOTAL).toBe(2830);
    expect(formatEuro(2830)).toBe("€2,830");
  });

  it("puts a because-line on every queued Decision euro", () => {
    for (const row of DECISION_QUEUE) {
      expect(row.because.length).toBeGreaterThan(8);
      expect(row.displayId.length).toBeGreaterThan(2);
    }
  });
});

describe("lab routes and light surface", () => {
  it("exposes the live lab paths", () => {
    expect(read("app/app/lab/control-center/page.tsx")).toContain("ControlCenter");
    expect(read("app/app/lab/decisions/page.tsx")).toContain("DecisionsPage");
    expect(read("app/app/lab/my-center/page.tsx")).toContain("CatalogPage");
    expect(read("app/app/lab/value/page.tsx")).toContain("ValuePage");
    expect(read("app/app/lab/memory/page.tsx")).toContain("MemoryPage");
  });

  it("keeps the lab sand/mint — no near-black board tokens", () => {
    const css = read("app/lab.css");
    expect(css).toContain("--lab-sand: #f3f0ea");
    expect(css).toContain("--lab-mint: #e8f7ef");
    expect(css).not.toContain("#050705");
    expect(css).not.toContain("--lab-mineral:#070c09");
  });

  it("tears down the live scatter: graph hero, CFO recover, dense queue, story cards", () => {
    const pulse = read("components/lab/ShiftPulseGraph.tsx");
    const store = read("lib/lab/store.tsx");
    const decisions = read("components/lab/DecisionsPage.tsx");
    const catalog = read("components/lab/CatalogPage.tsx");
    const css = read("app/lab.css");
    const role = read("components/lab/RoleBand.tsx");

    expect(pulse).toContain("lab-pulse-in-fill");
    expect(pulse).toContain("lab-pulse-y");
    expect(pulse).not.toContain("lab-kpi");
    expect(pulse).not.toContain("sparkline");

    expect(store).toContain('seedParam === "recover" ? "cfo"');
    expect(store).toContain('seed === "recover" ? "cfo"');
    expect(role).toContain("Recover sits in the Decision band");
    expect(role).toContain("lab-floor-strip");
    expect(role).toContain("lab-pin-list");

    expect(decisions).toContain("lab-queue");
    expect(decisions).toContain("lab-queue-because");
    expect(decisions).not.toContain("StoryCard");

    expect(catalog).toContain("StoryCard");
    expect(catalog).toContain("lab-story-grid-dense");
    expect(catalog).toContain("because={m.because}");

    expect(css).toContain(".lab-queue-row");
    expect(css).toContain(".lab-floor-strip");
    expect(css).toContain(".lab-pin-list");
    expect(css).toContain(".lab-pulse-in-fill");
    expect(css).toContain(".lab-story-grid-dense");
  });
});
