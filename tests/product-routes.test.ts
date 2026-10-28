import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = join(process.cwd());

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("product navigation integrity", () => {
  it("AppNav exposes the five primary destinations", () => {
    const nav = read("components/AppNav.tsx");
    for (const href of ["/home", "/cases", "/money", "/controls", "/sources"]) {
      expect(nav).toContain(`href: "${href}"`);
    }
    expect(nav).not.toContain('href: "/scan"');
  });

  it("middleware protects money, controls, and sources", () => {
    const mw = read("middleware.ts");
    expect(mw).toContain('"/money"');
    expect(mw).toContain('"/controls"');
    expect(mw).toContain('"/sources"');
  });

  it("legacy /scan redirects to /sources", () => {
    const scan = read("app/(app)/scan/page.tsx");
    expect(scan).toContain('redirect("/sources")');
  });

  it("money page does not invent verified value numbers", () => {
    const money = read("app/(app)/money/page.tsx");
    expect(money).toContain("No verified value yet.");
    expect(money).not.toMatch(/€\d/);
  });

  it("preserves the approved RADR wordmark SVG masters", () => {
    // Exact supplied assets: changing logo geometry requires explicit brand approval.
    const approved = {
      "radr-wordmark-traced-white.svg":
        "099af87079bbf05bab69fa37e834cebde70ac23cfd61c29bb5cb275c093bec1f",
      "radr-wordmark-traced-monochrome-black.svg":
        "55f260c6e2c8888f0b732fef74eeeb02cca82791e815f72b65edcebcc99235fd",
    };
    for (const [filename, digest] of Object.entries(approved)) {
      const actual = createHash("sha256")
        .update(read(`public/brand/${filename}`))
        .digest("hex");
      expect(actual).toBe(digest);
    }
  });
});
