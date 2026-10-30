/**
 * Demo org session — first-class Restaurant vs Hotel demos.
 * Persists in sessionStorage; recomposes all product surfaces.
 */

import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  verticalExperienceFor,
  type VerticalExperienceProfile,
} from "@/lib/radr/vertical/experienceProfile";
import {
  demoOrgForVertical,
  primaryLocationId,
  type DemoOrganization,
} from "@/lib/radr/demo/organizations";

export const DEMO_ORG_KEY = "radr.demoOrg.v1";
export const DEMO_ORG_EVENT = "radr-demo-org";

export type DemoOrgSession = {
  vertical: DemoVerticalFamily;
  orgId: string;
};

export function readDemoOrgSession(): DemoOrgSession {
  if (typeof window === "undefined") {
    return { vertical: "restaurant", orgId: "org_northstar_restaurants" };
  }
  try {
    const raw = sessionStorage.getItem(DEMO_ORG_KEY);
    if (!raw) {
      return { vertical: "restaurant", orgId: "org_northstar_restaurants" };
    }
    const parsed = JSON.parse(raw) as { vertical?: string };
    if (parsed.vertical === "hotel") {
      return { vertical: "hotel", orgId: "org_northstar_hotels" };
    }
  } catch {
    /* ignore */
  }
  return { vertical: "restaurant", orgId: "org_northstar_restaurants" };
}

export function writeDemoOrgSession(vertical: DemoVerticalFamily): void {
  const org = demoOrgForVertical(vertical);
  const payload: DemoOrgSession = { vertical, orgId: org.id };
  try {
    sessionStorage.setItem(DEMO_ORG_KEY, JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent(DEMO_ORG_EVENT, { detail: payload }),
    );
  } catch {
    /* ignore */
  }
}

export function activeDemoOrg(): DemoOrganization {
  const s = readDemoOrgSession();
  return demoOrgForVertical(s.vertical);
}

export function activeExperienceProfile(): VerticalExperienceProfile {
  return verticalExperienceFor(readDemoOrgSession().vertical);
}

export function activePrimaryLocationId(): string {
  return primaryLocationId(activeDemoOrg());
}

export function isHotelDemo(): boolean {
  return readDemoOrgSession().vertical === "hotel";
}

export function isRestaurantDemo(): boolean {
  return readDemoOrgSession().vertical === "restaurant";
}
