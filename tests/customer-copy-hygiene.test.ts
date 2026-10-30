/**
 * Prohibited customer-facing copy + raw ID leaks.
 * Targets visible UI strings — not input placeholders or code identifiers.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PRODUCT_ROOTS = ["components/product", "app/app"];

const PROHIBITED =
  /\b(TODO:|FIXME:|Role column priority|hover plot or rail|implementation note|debug only|fixture seed)\b/i;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

describe("Customer copy hygiene", () => {
  const files = PRODUCT_ROOTS.flatMap((r) => walk(join(process.cwd(), r)));

  it("no prohibited internal wording in product UI strings", () => {
    const hits: string[] = [];
    for (const f of files) {
      if (f.includes("/lab/") || f.includes("design-review")) continue;
      const text = readFileSync(f, "utf8");
      for (const line of text.split("\n")) {
        if (!PROHIBITED.test(line)) continue;
        if (/^\s*(\/\/|\*|\/\*|\*)/.test(line)) continue;
        if (/placeholder=/.test(line)) continue;
        hits.push(`${f.replace(process.cwd() + "/", "")}:${line.trim().slice(0, 100)}`);
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("displayDecisionId / locationDisplayName used for customer Decision/location labels", () => {
    // Guard: HumanHandoff and LocationOverview must not render raw ids as titles
    const handoff = readFileSync(
      join(process.cwd(), "components/product/control-center/HumanHandoff.tsx"),
      "utf8",
    );
    expect(handoff).toContain("displayId");
    expect(handoff).not.toMatch(/>\s*dec_/);
    const overview = readFileSync(
      join(process.cwd(), "components/product/locations/LocationOverview.tsx"),
      "utf8",
    );
    expect(overview).not.toMatch(/>\s*loc_/);
  });
});
