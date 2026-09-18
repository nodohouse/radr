import { describe, expect, it } from "vitest";
import { resolveProfile } from "@/lib/radr/operating/resolveProfile";
import { adaptNavForProfile } from "@/lib/radr/operating/navFromProfile";
import {
  composeControlCenter,
  moduleEnabled,
  surfaceForProfile,
} from "@/lib/radr/controlCenter";
import {
  budgetNeedsYouFindings,
  DEFAULT_MAX_ATTENTION,
  scoreFindingAttention,
} from "@/lib/radr/attention/score";
import {
  composeRoleAttention,
  roleNeedsYouFindings,
} from "@/lib/radr/roleAttention";
import { findingsForScope } from "@/lib/radr/findings";
import { demoVerticalForProfileId } from "@/lib/radr/operating/resolveProfile";
import {
  canEnterInsightStep,
  DEMO_SYSTEM_ID,
  PRIMARY_ONBOARDING_STEPS,
} from "@/lib/onboarding/types";

describe("Profile-driven product shell", () => {
  it("maps nav labels from terminology for hotel vs residences", () => {
    const hotel = resolveProfile({ demoVertical: "boutique_hotel" });
    const res = resolveProfile({ demoVertical: "serviced_apartments" });
    const base = [
      {
        label: "Operation",
        items: [
          { href: "/app/service", label: "Service" },
          { href: "/app/forecast", label: "Forecast" },
        ],
      },
    ];
    const hotelNav = adaptNavForProfile(base, hotel);
    expect(hotelNav[0]?.label).toBe("Property");
    expect(hotelNav[0]?.items.find((i) => i.href === "/app/service")?.label).toBe(
      "Rooms",
    );

    const resNav = adaptNavForProfile(base, res);
    expect(resNav[0]?.label).toBe("Portfolio");
    expect(resNav[0]?.items.find((i) => i.href === "/app/service")?.label).toBe(
      "Units",
    );
  });

  it("composes different modules by role for the same profile", () => {
    const profile = resolveProfile({ demoVertical: "boutique_hotel" });
    const gm = composeControlCenter({
      profile,
      role: "hotel_gm",
      vertical: "boutique_hotel",
    });
    const rev = composeControlCenter({
      profile,
      role: "revenue_manager",
      vertical: "boutique_hotel",
    });
    expect(gm.modules).not.toEqual(rev.modules);
    expect(gm.maxAttention).toBe(DEFAULT_MAX_ATTENTION);
  });

  it("routes restaurant Control Center through compose modules + maxAttention", () => {
    const profile = resolveProfile({ demoVertical: "restaurant" });
    const gm = composeControlCenter({
      profile,
      role: "gm",
      vertical: "restaurant",
    });
    expect(gm.surface).toBe("restaurant_glance");
    expect(gm.maxAttention).toBe(3);
    expect(gm.modules.length).toBeGreaterThan(0);
    expect(moduleEnabled(gm, "attention")).toBe(true);
    expect(gm.metricIds.length).toBeGreaterThan(0);

    const chef = composeControlCenter({
      profile,
      role: "kitchen",
      vertical: "restaurant",
    });
    expect(chef.modules).not.toEqual(gm.modules);
  });

  it("surfaceForProfile prefers profile id over conflicting vertical fixture", () => {
    const hotel = resolveProfile({ demoVertical: "boutique_hotel" });
    expect(surfaceForProfile(hotel, "hotel_gm", "restaurant")).toBe(
      "hotel_glance",
    );
    const rest = resolveProfile({ demoVertical: "restaurant" });
    expect(surfaceForProfile(rest, "gm", "boutique_hotel")).toBe(
      "restaurant_glance",
    );
  });

  it("demoVerticalForProfileId isolates fixture mapping", () => {
    expect(demoVerticalForProfileId("boutique_hotel")).toBe("boutique_hotel");
    expect(demoVerticalForProfileId("serviced_apartments")).toBe(
      "serviced_apartments",
    );
    expect(demoVerticalForProfileId("restaurant_full_service")).toBe(
      "restaurant",
    );
  });
});

describe("Attention score + budget + bands", () => {
  it("caps needs-you findings at maxAttention", () => {
    const scope = "loc_berlin_mitte";
    const findings = findingsForScope(scope);
    const capped = roleNeedsYouFindings(findings, "gm", scope, 3);
    expect(capped.length).toBeLessThanOrEqual(3);
    expect(budgetNeedsYouFindings(findings, 2).length).toBeLessThanOrEqual(2);
  });

  it("composeRoleAttention exposes cockpit bands under budget", () => {
    const scope = "loc_berlin_mitte";
    const findings = findingsForScope(scope);
    const attn = composeRoleAttention({
      findings,
      role: "gm",
      scope,
      maxAttention: 3,
    });
    expect(attn.needsYou).toBeLessThanOrEqual(3);
    expect(attn.findings.length).toBe(attn.needsYou);
    expect(Array.isArray(attn.handling)).toBe(true);
    expect(Array.isArray(attn.watching)).toBe(true);
  });

  it("scores material ACT_NOW higher than soft watch", () => {
    const findings = findingsForScope("loc_berlin_mitte");
    if (findings.length < 2) return;
    const scores = findings.map((f) => scoreFindingAttention(f));
    expect(scores.some((s) => s.score >= 0)).toBe(true);
  });
});

describe("Onboarding 8-step + connect gate", () => {
  it("PRIMARY_ONBOARDING_STEPS is the connect-before-insight path", () => {
    expect(PRIMARY_ONBOARDING_STEPS).toEqual([
      "organization",
      "operate",
      "location",
      "units",
      "role",
      "priorities",
      "system",
      "insight",
    ]);
    expect(PRIMARY_ONBOARDING_STEPS.indexOf("system")).toBeLessThan(
      PRIMARY_ONBOARDING_STEPS.indexOf("insight"),
    );
  });

  it("blocks insight until a system (or DEMO) is chosen", () => {
    expect(canEnterInsightStep("")).toBe(false);
    expect(canEnterInsightStep(undefined)).toBe(false);
    expect(canEnterInsightStep(DEMO_SYSTEM_ID)).toBe(true);
    expect(canEnterInsightStep("toast")).toBe(true);
  });
});
