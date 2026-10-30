import { describe, expect, it } from "vitest";
import {
  appendItem,
  autoArrange,
  hasOverlap,
  insertItem,
  moveItem,
  normalizeLayout,
  removeItem,
  resizeItem,
  type LayoutItem,
} from "@/lib/product/dashboardLayout";
import { DASHBOARD_TEMPLATES } from "@/lib/product/dashboards";

const it_ = (id: string, x: number, y: number, w: number, h: number): LayoutItem => ({
  id,
  x,
  y,
  w,
  h,
});
const at = (items: LayoutItem[], id: string) => items.find((i) => i.id === id)!;

describe("dashboard layout engine", () => {
  it("keeps every seeded template overlap-free and unchanged by normalize", () => {
    for (const t of DASHBOARD_TEMPLATES) {
      const out = normalizeLayout(t.widgets);
      expect(hasOverlap(out), t.id).toBe(false);
      for (const w of t.widgets) {
        const n = at(out, w.id);
        expect([n.x, n.y, n.w, n.h], `${t.id}/${w.id}`).toEqual([w.x, w.y, w.w, w.h]);
      }
    }
  });

  it("repairs legacy reorder saves (overlapping x/y) by flowing in array order", () => {
    const legacy = [
      it_("a", 0, 0, 6, 2),
      it_("b", 6, 1, 6, 2),
      it_("c", 0, 2, 6, 2),
      it_("d", 6, 3, 6, 2),
      it_("e", 0, 4, 6, 2),
    ];
    // a/b overlap on rows 1 → legacy
    const out = normalizeLayout(legacy);
    expect(hasOverlap(out)).toBe(false);
    expect(out.map((i) => i.id)).toEqual(["a", "b", "c", "d", "e"]);
    expect([at(out, "a").x, at(out, "b").x]).toEqual([0, 6]);
  });

  it("moves an item and pushes the one it lands on", () => {
    const base = [it_("a", 0, 0, 6, 2), it_("b", 6, 0, 6, 2)];
    const out = moveItem(base, "b", 0, 0);
    expect(hasOverlap(out)).toBe(false);
    expect([at(out, "b").x, at(out, "b").y]).toEqual([0, 0]);
    expect(at(out, "a").y).toBe(2);
  });

  it("swaps vertically when dragging an item down onto the one below", () => {
    const base = [it_("a", 0, 0, 6, 2), it_("b", 0, 2, 6, 2)];
    const out = moveItem(base, "a", 0, 2);
    expect(at(out, "b").y).toBe(0);
    expect(at(out, "a").y).toBe(2);
  });

  it("resizes and shoves neighbours instead of overlapping", () => {
    const base = [it_("a", 0, 0, 6, 2), it_("b", 6, 0, 6, 2), it_("c", 0, 2, 12, 2)];
    const out = resizeItem(base, "a", 12, 2);
    expect(hasOverlap(out)).toBe(false);
    expect(at(out, "a").w).toBe(12);
    expect(at(out, "b").y).toBe(2);
  });

  it("clamps size and position to the 12-col grid", () => {
    const out = resizeItem([it_("a", 10, 0, 2, 2)], "a", 40, 99);
    expect(at(out, "a").w).toBe(12);
    expect(at(out, "a").x).toBe(0);
    expect(at(out, "a").h).toBeLessThanOrEqual(8);
  });

  it("appends below and compacts after removal", () => {
    let items = [it_("a", 0, 0, 12, 2)];
    items = appendItem(items, it_("b", 0, 0, 6, 2));
    expect(at(items, "b").y).toBe(2);
    items = removeItem(items, "a");
    expect(at(items, "b").y).toBe(0);
  });

  it("inserts at a cell and moves others out of the way", () => {
    const base = [it_("a", 0, 0, 6, 2)];
    const out = insertItem(base, it_("n", 0, 0, 6, 2), 0, 0);
    expect(hasOverlap(out)).toBe(false);
    expect(at(out, "n").y).toBe(0);
    expect(at(out, "a").y).toBe(2);
  });

  it("auto-arranges largest-first without overlaps", () => {
    const base = [
      it_("s", 0, 4, 4, 1),
      it_("xl", 0, 0, 12, 2),
      it_("m", 0, 2, 6, 2),
    ];
    const out = autoArrange(base);
    expect(hasOverlap(out)).toBe(false);
    expect(at(out, "xl").y).toBe(0);
    expect(at(out, "xl").w).toBe(12);
    expect(out.map((i) => i.id).sort()).toEqual(["m", "s", "xl"]);
  });

  it("auto-arranges with persona module priority above fold", () => {
    type W = ReturnType<typeof it_> & { intelligenceModuleId: string };
    const base: W[] = [
      { ...it_("dec", 0, 0, 6, 2), intelligenceModuleId: "builder_decisions" },
      { ...it_("rev", 0, 2, 6, 2), intelligenceModuleId: "revenue_vs_forecast" },
      { ...it_("ready", 6, 0, 6, 2), intelligenceModuleId: "room_readiness" },
    ];
    const out = autoArrange(base, {
      modulePriority: [
        "revenue_vs_forecast",
        "verified_value_trend",
        "builder_decisions",
      ],
      moduleIdOf: (w) => w.intelligenceModuleId,
    });
    expect(hasOverlap(out)).toBe(false);
    expect(at(out, "rev").y).toBe(0);
    expect(at(out, "rev").x).toBe(0);
  });

  it("respects min width constraints on resize", () => {
    const out = resizeItem(
      [it_("a", 0, 0, 6, 2)],
      "a",
      1,
      2,
      { minW: 4, minH: 2 },
    );
    expect(at(out, "a").w).toBe(4);
  });
});
