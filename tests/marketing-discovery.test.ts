import { describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { isNonLocalizedPath } from "../i18n/routing";

describe("public discovery boundaries", () => {
  it("keeps developer and approach pages crawlable while excluding private locale paths", () => {
    const rule = robots().rules as { disallow: string[] };
    function denied(path: string) {
      return rule.disallow.some((pattern) =>
        new RegExp("^" + pattern.replace(/\$/g, "$")).test(path),
      );
    }
    for (const path of [
      "/developers",
      "/en/developers",
      "/approach",
      "/en/approach",
      "/en/demo",
      "/en/value-calculator",
    ])
      expect(denied(path), path).toBe(false);
    for (const path of [
      "/app",
      "/app/settings",
      "/en/login",
      "/de/reset-password",
      "/en/brand-test",
      "/api/reports/request",
    ])
      expect(denied(path), path).toBe(true);
  });
  it("publishes unique canonical marketing URLs with real article dates", () => {
    const entries = sitemap();
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(
      entries.length,
    );
    for (const path of [
      "demo",
      "value-calculator",
      "radr-explained",
      "developers",
    ])
      expect(
        entries.some((entry) => entry.url === `https://radrup.com/en/${path}`),
      ).toBe(true);
    expect(
      entries.some((entry) => /login|forgot-password|\/app\//.test(entry.url)),
    ).toBe(false);
    expect(
      entries.filter((entry) => entry.url.endsWith("radr-explained")),
    ).toHaveLength(1);
    expect(
      entries
        .filter((entry) => !entry.url.includes("/blog/"))
        .every((entry) => !entry.lastModified),
    ).toBe(true);
  });
  it("serves the social image outside locale redirects", () => {
    expect(isNonLocalizedPath("/opengraph-image")).toBe(true);
    expect(isNonLocalizedPath("/opengraph-image/image-id")).toBe(true);
    expect(isNonLocalizedPath("/en/product")).toBe(false);
  });
});
