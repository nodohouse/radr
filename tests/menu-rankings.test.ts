import { describe, expect, it } from "vitest";
import {
  getBasketPairs,
  getMenuRankings,
  rankingsAreDistinct,
} from "@/lib/radr/intelligence/menuRankings";

describe("menu rankings", () => {
  it("sellers / contributors / operators are not identical", () => {
    expect(rankingsAreDistinct()).toBe(true);
    const sellers = getMenuRankings("sellers").map((d) => d.itemId);
    const contrib = getMenuRankings("contributors").map((d) => d.itemId);
    const ops = getMenuRankings("operators").map((d) => d.itemId);
    expect(sellers[0]).toBe("mi_tuna_tataki");
    expect(ops[0]).toBe("mi_truffle_pasta");
    expect(sellers.join()).not.toBe(ops.join());
    expect(contrib.join()).not.toBe(ops.join());
  });

  it("peak HOLD on tuna; PUSH on pasta", () => {
    const peak = getMenuRankings("sellers", { peak: true });
    const tuna = peak.find((d) => d.itemId === "mi_tuna_tataki");
    const pasta = peak.find((d) => d.itemId === "mi_truffle_pasta");
    expect(tuna?.action).toBe("HOLD");
    expect(pasta?.action).toBe("PUSH");
  });

  it("basket pairs include capacity hold at peak", () => {
    const pairs = getBasketPairs({ peak: true });
    const tuna = pairs.find((p) => p.id === "tuna_negroni");
    const pasta = pairs.find((p) => p.id === "pasta_wine");
    expect(tuna?.promoteNow).toBe(false);
    expect(tuna?.holdReason).toMatch(/DO NOT PUSH/i);
    expect(tuna?.kitchen).toMatch(/Cold station/i);
    expect(pasta?.promoteNow).toBe(true);
    expect(pasta?.incremental).toBe(8.1);
  });
});
