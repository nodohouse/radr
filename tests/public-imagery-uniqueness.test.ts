/**
 * Unique photographic assets across public marketing editorial surfaces.
 * Registry exclusivity + live-surface scan (no hardcoded photo outside registry).
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  assertUniquePhotographicAssets,
  MARKETING_IMAGES,
  PHOTO_PATH_PREFIXES,
  PRODUCT_REPEAT_ALLOWLIST,
  PUBLIC_PHOTO_USAGE_REPORT,
} from "@/lib/marketing/publicImagery";

const ROOT = process.cwd();

/** Live public marketing surfaces that may reference photography */
const LIVE_SCAN_ROOTS = [
  "components/marketing/kinetic",
  "components/marketing/pages",
  "components/marketing/nav",
  "components/marketing/scenes/Hero.tsx",
  "components/marketing/scenes/home/HomepageSpine.tsx",
  "components/marketing/scenes/home/RecoveryStoryObject.tsx",
  "components/marketing/scenes/home/HeroHospitalityScene.tsx",
  "app/[locale]/blog",
  "app/[locale]/contact",
  "app/[locale]/company",
  "app/[locale]/product",
  "app/[locale]/solutions",
  "app/[locale]/why",
  "app/[locale]/pricing",
  "app/[locale]/industries",
  "app/[locale]/demo",
  "app/[locale]/security",
  "app/[locale]/developers",
  "lib/marketing/publicImagery.ts",
];

/** Dead / legacy sections — must not hardcode photographic paths either */
const LEGACY_MUST_BE_CLEAN = [
  "components/marketing/scenes/home/SectionFinalEngine.tsx",
  "components/marketing/scenes/home/SectionDecisionLoop.tsx",
  "components/marketing/scenes/home/SectionPainCinema.tsx",
  "components/marketing/scenes/home/HeroLensStage.tsx",
  "components/marketing/scenes/home/SectionFutures.tsx",
  "components/marketing/scenes/home/SectionCompounding.tsx",
  "components/marketing/scenes/home/SectionHospitalityProof.tsx",
  "components/marketing/data/homepageVerticalDemos.ts",
  "components/marketing/tour/ProductTour.tsx",
];

const PHOTO_RE =
  /["'`](\/(?:demo\/facilities|menu|marketing)\/[^"'`\s]+\.(?:jpg|jpeg|png|webp))["'`]/gi;

function walkFiles(entry: string, out: string[] = []): string[] {
  const abs = join(ROOT, entry);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return out;
  }
  if (st.isFile()) {
    if (/\.(tsx?|jsx?)$/.test(abs)) out.push(abs);
    return out;
  }
  if (st.isDirectory()) {
    for (const name of readdirSync(abs)) {
      if (name === "node_modules" || name === ".next") continue;
      walkFiles(join(entry, name), out);
    }
  }
  return out;
}

function extractPhotoPaths(source: string): string[] {
  const found: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(PHOTO_RE.source, "gi");
  while ((m = re.exec(source))) {
    found.push(m[1]!);
  }
  return found;
}

function isProductAllowlisted(src: string): boolean {
  return PRODUCT_REPEAT_ALLOWLIST.some((p) => src.includes(p));
}

function isPhotoPath(src: string): boolean {
  return PHOTO_PATH_PREFIXES.some((p) => src.startsWith(p));
}

describe("public marketing imagery uniqueness", () => {
  it("assigns each photographic src to exactly one editorial id", () => {
    const errors = assertUniquePhotographicAssets();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  it("keeps product screenshots marked as product kind", () => {
    const products = Object.values(MARKETING_IMAGES).filter(
      (img) => img.kind === "product",
    );
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.src.includes("mockup") || p.vertical === "product").toBe(true);
    }
  });

  it("exposes an internal usage report for QA", () => {
    expect(PUBLIC_PHOTO_USAGE_REPORT.length).toBe(
      Object.keys(MARKETING_IMAGES).length,
    );
    for (const row of PUBLIC_PHOTO_USAGE_REPORT) {
      expect(row.usedElsewhere).toContain("NO");
    }
  });

  it("live public surfaces only reference registry-owned photographic srcs", () => {
    const owned = new Set<string>(
      Object.values(MARKETING_IMAGES)
        .filter((img) => img.kind === "photo")
        .map((img) => img.src),
    );
    const errors: string[] = [];

    for (const root of LIVE_SCAN_ROOTS) {
      for (const file of walkFiles(root)) {
        if (file.endsWith("publicImagery.ts")) continue;
        const src = readFileSync(file, "utf8");
        for (const path of extractPhotoPaths(src)) {
          if (!isPhotoPath(path)) continue;
          if (isProductAllowlisted(path)) continue;
          if (!owned.has(path)) {
            errors.push(
              `${file.replace(ROOT + "/", "")}: ${path} not in MARKETING_IMAGES`,
            );
          }
        }
      }
    }

    expect(errors, errors.join("\n")).toEqual([]);
  });

  it("legacy / tour surfaces do not hardcode photographic paths", () => {
    const errors: string[] = [];
    for (const rel of LEGACY_MUST_BE_CLEAN) {
      const abs = join(ROOT, rel);
      let src: string;
      try {
        src = readFileSync(abs, "utf8");
      } catch {
        continue;
      }
      for (const path of extractPhotoPaths(src)) {
        if (isPhotoPath(path)) {
          errors.push(`${rel}: still hardcodes ${path}`);
        }
      }
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
