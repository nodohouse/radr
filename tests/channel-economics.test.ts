import { describe, expect, it } from "vitest";
import {
  composeBerlinChannelEconomics,
  channelNetSalesIdentity,
  contributionShareIdentity,
  deliveryProviderContributionIdentity,
  deliveryProviderCatalog,
  pauseRequiresApproval,
  revenueShareIdentity,
} from "@/lib/radr/channels";
import { classifyAskIntent } from "@/lib/ai/intents";
import { getTerm, searchTerms } from "@/lib/radr/terminology";

describe("Channel Economics", () => {
  it("keeps channel net sales equal to operating net sales", () => {
    const state = composeBerlinChannelEconomics();
    expect(channelNetSalesIdentity(state).ok).toBe(true);
  });

  it("keeps revenue and contribution shares near 100%", () => {
    const state = composeBerlinChannelEconomics();
    expect(revenueShareIdentity(state).ok).toBe(true);
    expect(contributionShareIdentity(state).ok).toBe(true);
  });

  it("sums provider contribution to delivery contribution", () => {
    const state = composeBerlinChannelEconomics();
    expect(deliveryProviderContributionIdentity(state).ok).toBe(true);
  });

  it("shows delivery contribution share below revenue share (quality)", () => {
    const state = composeBerlinChannelEconomics();
    const delivery = state.channels.find((c) => c.kind === "delivery");
    const dineIn = state.channels.find((c) => c.kind === "dine_in");
    expect(delivery).toBeTruthy();
    expect(dineIn).toBeTruthy();
    expect(delivery!.contributionSharePct).toBeLessThan(
      delivery!.revenueSharePct,
    );
    expect(dineIn!.contributionSharePct).toBeGreaterThan(
      dineIn!.revenueSharePct,
    );
  });

  it("never labels channel economics as profit", () => {
    const state = composeBerlinChannelEconomics();
    const labels = [
      ...state.channels.map((c) => c.label),
      ...(state.channels.find((c) => c.kind === "delivery")?.providers ?? []).flatMap(
        (p) => p.lines.map((l) => l.label),
      ),
      state.pauseDecision.recommendation,
    ];
    for (const label of labels) {
      expect(String(label).toLowerCase()).not.toContain("profit");
    }
  });

  it("requires approval before pausing delivery", () => {
    const state = composeBerlinChannelEconomics();
    expect(pauseRequiresApproval(state)).toBe(true);
  });

  it("resolves providers from catalog — not ad-hoc strings in identity", () => {
    const catalog = deliveryProviderCatalog();
    expect(catalog.some((p) => p.id === "uber-eats")).toBe(true);
    expect(catalog.some((p) => p.id === "deliveroo")).toBe(true);
    const state = composeBerlinChannelEconomics();
    const providers =
      state.channels.find((c) => c.kind === "delivery")?.providers ?? [];
    for (const p of providers) {
      expect(catalog.some((c) => c.id === p.providerId)).toBe(true);
      expect(p.providerName).toBe(
        catalog.find((c) => c.id === p.providerId)!.name,
      );
    }
  });

  it("scales with live net sales override", () => {
    const a = composeBerlinChannelEconomics();
    const b = composeBerlinChannelEconomics(7200);
    expect(b.netSales).toBe(7200);
    expect(channelNetSalesIdentity(b).ok).toBe(true);
    expect(b.channels[0].netSales).not.toBe(a.channels[0].netSales);
  });
});

describe("channel terminology + Ask", () => {
  it("defines contribution share and packaging terms", () => {
    expect(getTerm("channelContributionShare").term).toMatch(/contribution share/i);
    expect(getTerm("channelPackaging").term).toBe("Packaging");
    expect(
      searchTerms("contribution share").some(
        (t) => t.id === "channelContributionShare",
      ),
    ).toBe(true);
  });

  it("classifies delivery / pause questions as CHANNEL_ECONOMICS", () => {
    expect(
      classifyAskIntent("How much of today's revenue is delivery?").intent,
    ).toBe("CHANNEL_ECONOMICS");
    expect(
      classifyAskIntent("Should we pause delivery during peak?").intent,
    ).toBe("CHANNEL_ECONOMICS");
    expect(
      classifyAskIntent("Why is delivery margin lower?").intent,
    ).toBe("CHANNEL_ECONOMICS");
  });
});
