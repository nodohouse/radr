import { describe, expect, it } from "vitest";
import {
  hkProgressLabel,
  hkStaffingPreview,
  nextHkProgress,
} from "@/lib/product/decisionsWorkspace/hotelActions";

describe("hotel decision actions", () => {
  it("staffing 2 is recommended with 81% and €1,480 protected", () => {
    const p = hkStaffingPreview(2);
    expect(p.recommended).toBe(true);
    expect(p.confidence).toBe(81);
    expect(p.protectedEuro).toBe(1480);
    expect(p.ready).toBe("35 / 42");
    expect(p.atRisk).toBe(3);
  });

  it("staffing 1 is partial recovery", () => {
    const p = hkStaffingPreview(1);
    expect(p.recommended).toBe(false);
    expect(p.atRisk).toBe(5);
    expect(p.protectedEuro).toBeLessThan(1480);
  });

  it("progress stages advance 0 → 25 → 50 → 75 → 100", () => {
    expect(nextHkProgress(0)).toBe(25);
    expect(nextHkProgress(25)).toBe(50);
    expect(nextHkProgress(50)).toBe(75);
    expect(nextHkProgress(75)).toBe(100);
    expect(nextHkProgress(100)).toBe(100);
    expect(hkProgressLabel(0)).toMatch(/Approved/i);
    expect(hkProgressLabel(50)).toMatch(/acknowledged/i);
    expect(hkProgressLabel(100)).toMatch(/verifying/i);
  });
});
