import { describe, it, expect } from "vitest";
import { productRequiresSession } from "../lib/identity/productAccess";
import { safeDemoNext, demoSignupHref } from "../lib/marketing/demoAccess";
describe("demo signup boundary", () => {
  it("requires a session on every production product, including default DEMO and an explicit false legacy flag", () => {
    for (const radrEnv of [undefined, "DEMO", "LIVE", "SANDBOX"])
      for (const requireAuth of [undefined, "false", "true"])
        expect(
          productRequiresSession({
            nodeEnv: "production",
            radrEnv,
            requireAuth,
          }),
        ).toBe(true);
  });
  it("keeps local fictional data QA available while respecting explicit protection", () => {
    expect(productRequiresSession({ nodeEnv: "development" })).toBe(false);
    expect(
      productRequiresSession({ nodeEnv: "development", requireAuth: "true" }),
    ).toBe(true);
    expect(
      productRequiresSession({ nodeEnv: "development", radrEnv: "live" }),
    ).toBe(true);
    expect(
      productRequiresSession({ nodeEnv: "test", radrEnv: "SANDBOX" }),
    ).toBe(true);
  });
  it("preserves the selected demo through signup without permitting an external redirect", () => {
    for (const vertical of ["hotel", "restaurant"]) {
      const next = `/app/enter?vertical=${vertical}&go=1`;
      const url = new URL(demoSignupHref(next), "https://example.test");
      expect(url.searchParams.get("next")).toBe(next);
      expect(url.searchParams.get("intent")).toBe("demo");
    }
    expect(safeDemoNext("https://untrusted.test")).toBe("/app/enter");
  });
});
