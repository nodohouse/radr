/**
 * Operating canvas foundation tests — Phase 1.
 * Lens / time preserve location context; Ask schema accepts canvas fields.
 */

import { describe, expect, it } from "vitest";
import { askRequestSchema } from "@/lib/ai/answerSchema";
import { getRadrEnvironment } from "@/lib/radr/env";
import {
  DEFAULT_CANVAS,
  LENS_EMPHASIS,
  MONEY_VOCAB,
  OPERATING_LENSES,
  OPERATING_SERVICE_TIMES,
  isOperatingLens,
  isOperatingServiceTime,
  moneyVocabLabel,
  parseCanvasFromSearchParams,
  toFloorServiceTime,
  writeCanvasSearchParams,
} from "@/lib/radr/operatingCanvas";

describe("operating canvas contracts", () => {
  it("defines four lenses and service times including close", () => {
    expect(OPERATING_LENSES).toEqual([
      "operate",
      "money",
      "risk",
      "service",
    ]);
    expect(OPERATING_SERVICE_TIMES).toContain("now");
    expect(OPERATING_SERVICE_TIMES).toContain("close");
    expect(LENS_EMPHASIS.money.focus.length).toBeGreaterThan(8);
  });

  it("maps CLOSE and quarter-hours to floor ServiceTimeKey without inventing data", () => {
    expect(toFloorServiceTime("close")).toBe("21:00");
    expect(toFloorServiceTime("19:00")).toBe("19:00");
    expect(toFloorServiceTime("18:15")).toBe("18:00");
    expect(toFloorServiceTime("19:45")).toBe("20:00");
    expect(OPERATING_SERVICE_TIMES).toContain("18:15");
    expect(OPERATING_SERVICE_TIMES.length).toBeGreaterThan(6);
  });

  it("keeps money vocabulary distinct", () => {
    expect(moneyVocabLabel("exposure", "long")).toBe("Value at risk");
    expect(moneyVocabLabel("verified")).toBe("Verified");
    expect(MONEY_VOCAB.forecast.long).toMatch(/not verified/i);
  });

  it("parses and writes URL canvas params without touching location", () => {
    const params = new URLSearchParams(
      "lens=money&t=19:00&finding=fnd_buy_1&other=keep",
    );
    const parsed = parseCanvasFromSearchParams(params);
    expect(parsed.lens).toBe("money");
    expect(parsed.serviceTime).toBe("19:00");
    expect(parsed.selectedFindingId).toBe("fnd_buy_1");

    const written = writeCanvasSearchParams(params, {
      lens: "risk",
      serviceTime: "now",
      selectedFindingId: null,
    });
    expect(written.get("lens")).toBe("risk");
    expect(written.get("t")).toBeNull();
    expect(written.get("finding")).toBeNull();
    expect(written.get("other")).toBe("keep");
  });

  it("defaults omit lens/t from URL when at DEFAULT_CANVAS", () => {
    const written = writeCanvasSearchParams(new URLSearchParams(), DEFAULT_CANVAS);
    expect(written.toString()).toBe("");
  });

  it("guards lens and service time parsers", () => {
    expect(isOperatingLens("money")).toBe(true);
    expect(isOperatingLens("buy")).toBe(false);
    expect(isOperatingServiceTime("18:00")).toBe(true);
    expect(isOperatingServiceTime("noon")).toBe(false);
  });
});

describe("Ask RADR canvas payload", () => {
  it("accepts lens, serviceTime, and selectedFindingId", () => {
    const parsed = askRequestSchema.parse({
      question: "Why are we at risk?",
      locationScope: "loc_ber",
      period: "yesterday",
      lens: "money",
      serviceTime: "19:00",
      selectedFindingId: "fnd_labor_1",
    });
    expect(parsed.lens).toBe("money");
    expect(parsed.serviceTime).toBe("19:00");
    expect(parsed.selectedFindingId).toBe("fnd_labor_1");
    expect(parsed.locationScope).toBe("loc_ber");
    expect(parsed.period).toBe("yesterday");
  });

  it("preserves location and period when canvas fields omitted", () => {
    const parsed = askRequestSchema.parse({
      question: "What needs me?",
      locationScope: "loc_ber",
      period: "today",
    });
    expect(parsed.lens).toBeUndefined();
    expect(parsed.locationScope).toBe("loc_ber");
    expect(parsed.period).toBe("today");
  });
});

describe("demo environment default", () => {
  it("defaults to DEMO for product honesty", () => {
    expect(getRadrEnvironment()).toBe("DEMO");
  });
});
