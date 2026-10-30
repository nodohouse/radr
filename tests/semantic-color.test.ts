import { describe, expect, it } from "vitest";
import { resolveSemantic } from "@/lib/radr/product/semantic";

describe("business semantic color", () => {
  it("marks revenue up as positive", () => {
    const s = resolveSemantic(3.1, true);
    expect(s.semantic).toBe("positive");
    expect(s.glyph).toBe("↑");
    expect(s.direction).toBe("up");
  });

  it("marks contribution down as negative", () => {
    const s = resolveSemantic(-4780, true);
    expect(s.semantic).toBe("negative");
    expect(s.glyph).toBe("↓");
  });

  it("marks waste reduction as positive", () => {
    const s = resolveSemantic(-12, false);
    expect(s.semantic).toBe("positive");
    expect(s.glyph).toBe("↓");
  });

  it("marks COGS increase as negative", () => {
    const s = resolveSemantic(11, false);
    expect(s.semantic).toBe("negative");
    expect(s.glyph).toBe("↑");
  });

  it("marks exposure as warning via force", () => {
    const s = resolveSemantic(788, true, { force: "warning" });
    expect(s.semantic).toBe("warning");
    expect(s.glyph).toBe("△");
  });

  it("marks near-zero as neutral", () => {
    const s = resolveSemantic(0.02, true);
    expect(s.semantic).toBe("neutral");
    expect(s.glyph).toBe("→");
  });
});
