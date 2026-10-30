import { describe, expect, it } from "vitest";
import {
  hkStaffingPreview,
  readinessCostOfWaiting,
  readinessFutures,
} from "@/lib/product/decisionsWorkspace/hotelActions";

describe("hotel D-H-9201 compare futures", () => {
  it("exposes three deterministic futures A/B/C", () => {
    const futures = readinessFutures();
    expect(futures).toHaveLength(3);
    expect(futures.map((f) => f.id)).toEqual([
      "future_a_nothing",
      "future_b_one",
      "future_c_two",
    ]);
  });

  it("Future A keeps full €1,840 exposure and 7 at risk", () => {
    const a = readinessFutures()[0]!;
    expect(a.exposureEuro).toBe(1840);
    expect(a.expectedValueEuro).toBe(0);
    expect(a.operational.find((m) => m.label === "Ready")?.value).toBe("31 / 42");
    expect(a.operational.find((m) => m.label === "At risk")?.value).toBe("7 rooms");
  });

  it("Future B matches staffing-1 model", () => {
    const b = readinessFutures()[1]!;
    const preview = hkStaffingPreview(1);
    expect(b.exposureEuro).toBe(preview.exposureEuro);
    expect(b.expectedValueEuro).toBe(preview.protectedEuro);
    expect(b.confidence).toBe(78);
    expect(b.recommended).toBe(false);
  });

  it("Future C is recommended · not fake full recovery", () => {
    const c = readinessFutures()[2]!;
    expect(c.recommended).toBe(true);
    expect(c.exposureEuro).toBe(360);
    expect(c.expectedValueEuro).toBe(1480);
    expect(c.confidence).toBe(81);
    expect(c.operational.find((m) => m.label === "Ready")?.value).toBe("35 / 42");
    expect(c.operational.find((m) => m.label === "At risk")?.value).toBe("3 rooms");
    expect(c.risk).toMatch(/Residual 3/i);
  });

  it("cost of waiting stays qualitative — no false €180/10m precision", () => {
    const w = readinessCostOfWaiting();
    expect(w.decideBy).toBe("14:40");
    expect(w.note).not.toMatch(/€180/);
    expect(w.note).toMatch(/narrows after 14:40/i);
  });
});
