import { describe, expect, it } from "vitest";
import {
  defaultSharedWith,
  shareMetaLabel,
  visibilityForShares,
} from "@/lib/product/dashboardSharing";
import type { RadrDashboard } from "@/lib/product/dashboards";

describe("dashboard sharing", () => {
  it("seeds GM with 4 collaborators excluding owner count semantics", () => {
    const shares = defaultSharedWith("dash_gm");
    expect(shares.some((s) => s.permission === "owner")).toBe(true);
    expect(shares.filter((s) => s.permission !== "owner")).toHaveLength(3);
  });

  it("labels shared metadata for library", () => {
    const dash = {
      id: "dash_gm",
      name: "General Manager",
      description: "",
      visibility: "ROLE" as const,
      roleTemplate: "gm",
      widgets: [],
      sharedWith: defaultSharedWith("dash_gm"),
      pinned: true,
      pinOrder: 0,
      updatedAt: new Date().toISOString(),
    } satisfies RadrDashboard;
    expect(shareMetaLabel(dash)).toBe("Shared with 3 users");
  });

  it("derives visibility from shares", () => {
    expect(
      visibilityForShares([
        {
          id: "person_jordan",
          kind: "person",
          label: "Jordan Blake",
          permission: "owner",
        },
      ]),
    ).toBe("PRIVATE");
    expect(
      visibilityForShares([
        {
          id: "person_jordan",
          kind: "person",
          label: "Jordan Blake",
          permission: "owner",
        },
        {
          id: "role_gm",
          kind: "role",
          label: "GMs",
          permission: "view",
        },
      ]),
    ).toBe("ROLE");
  });
});
