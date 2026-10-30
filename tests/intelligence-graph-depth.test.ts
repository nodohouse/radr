/**
 * Intelligence graph depth + structured second level.
 */
import { describe, expect, it } from "vitest";
import {
  assertStructuredDepth,
  breadcrumbForNode,
  contributionNodeFromBridge,
  getIntelligenceNode,
  rootNodeIdForMetric,
} from "@/lib/radr/intelligence/graph";

describe("Intelligence graph", () => {
  it("second-level nodes are structured (not prose-only)", () => {
    expect(assertStructuredDepth()).toEqual([]);
  });

  it("contribution → cogs → tuna → vendor breadcrumb", () => {
    const chain = breadcrumbForNode("vendor_a");
    expect(chain.map((n) => n.id)).toEqual([
      "contribution",
      "cogs",
      "tuna",
      "vendor_a",
    ]);
  });

  it("cogs has where/what + levers + no-action", () => {
    const n = getIntelligenceNode("cogs")!;
    expect(n.where.length).toBeGreaterThan(0);
    expect(n.what.some((w) => w.childNodeId === "tuna")).toBe(true);
    expect(n.levers.some((l) => l.isNoAction)).toBe(true);
    expect(n.whenSeries.length).toBeGreaterThan(1);
  });

  it("labor is NO ACTION root", () => {
    expect(rootNodeIdForMetric("labor_pct")).toBe("labor");
    const n = getIntelligenceNode("labor")!;
    expect(n.actionState).toMatch(/NO ACTION/i);
    expect(n.levers.every((l) => l.isNoAction || l.recommended)).toBe(true);
  });

  it("live bridge overlays contribution", () => {
    const n = contributionNodeFromBridge();
    expect(n.bridge.length).toBeGreaterThan(2);
    expect(n.bridge.some((b) => b.childNodeId === "cogs")).toBe(true);
  });
});
