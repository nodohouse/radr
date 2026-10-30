import { describe, expect, it } from "vitest";
import {
  approvalAuthorityFor,
  autonomyLabel,
  DEFAULT_DEMO_SETTINGS,
} from "@/lib/radr/product/demoSettings";

describe("demoSettings policy → authority", () => {
  it("GM alone when under threshold", () => {
    const a = approvalAuthorityFor(180, {
      ...DEFAULT_DEMO_SETTINGS,
      approvalGmMax: 250,
    });
    expect(a.level).toBe("gm");
    expect(a.label).toMatch(/GM may approve/);
  });

  it("GM+CFO when above GM max", () => {
    const a = approvalAuthorityFor(400, {
      ...DEFAULT_DEMO_SETTINGS,
      approvalGmMax: 250,
    });
    expect(a.level).toBe("gm_cfo");
  });

  it("executive above 2000", () => {
    const a = approvalAuthorityFor(2500, DEFAULT_DEMO_SETTINGS);
    expect(a.level).toBe("executive");
  });

  it("autonomy label maps ladder", () => {
    expect(autonomyLabel({ ...DEFAULT_DEMO_SETTINGS, autonomyScheduling: "prepare" })).toMatch(
      /Prepare/,
    );
    expect(autonomyLabel({ ...DEFAULT_DEMO_SETTINGS, autonomyScheduling: "policy" })).toMatch(
      /Auto-act/,
    );
  });
});
