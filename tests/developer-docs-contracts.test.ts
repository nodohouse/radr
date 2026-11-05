import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { validateOnboardingCsv } from "@/lib/onboarding/csvUpload";
import { getProvider } from "@/lib/integrations/registry";
describe("published developer contracts", () => {
  it("serves the same proposed OpenAPI contract as the source", () => {
    const published = readFileSync(
      "public/developers/radr-v1-preview.yaml",
      "utf8",
    );
    expect(published).toBe(readFileSync("openapi/radr-v1.yaml", "utf8"));
    expect(published).toContain("https://api.example.invalid/v1");
    expect(published).toContain("x-status: proposed");
  });
  it.each([
    ["contracts-example.csv", "CONTRACT"],
    ["invoices-example.csv", "INVOICE"],
  ] as const)(
    "publishes a valid %s for the actual onboarding validator",
    (name, kind) => {
      const bytes = readFileSync("public/developers/" + name);
      const result = validateOnboardingCsv(bytes, name, kind);
      expect(result.rows).toBe(1);
    },
  );
  it("does not advertise unrelated CSV domains as an implemented file capability", () => {
    expect(getProvider("files-csv")?.capabilities).toEqual([
      "files",
      "invoices",
    ]);
  });
});
