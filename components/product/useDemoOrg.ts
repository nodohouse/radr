"use client";

/**
 * useDemoOrg — reactive VerticalExperienceProfile + demo org.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  DEMO_ORG_EVENT,
  readDemoOrgSession,
  type DemoOrgSession,
} from "@/lib/radr/demo/demoOrgSession";
import {
  verticalExperienceFor,
  type VerticalExperienceProfile,
} from "@/lib/radr/vertical/experienceProfile";
import {
  demoOrgForVertical,
  type DemoOrganization,
} from "@/lib/radr/demo/organizations";

/** Stable refs — getServerSnapshot / getSnapshot must not allocate. */
const RESTAURANT_SESSION: DemoOrgSession = {
  vertical: "restaurant",
  orgId: "org_northstar_restaurants",
};
const HOTEL_SESSION: DemoOrgSession = {
  vertical: "hotel",
  orgId: "org_northstar_hotels",
};

function sessionRef(vertical: DemoOrgSession["vertical"]): DemoOrgSession {
  return vertical === "hotel" ? HOTEL_SESSION : RESTAURANT_SESSION;
}

function subscribe(cb: () => void) {
  window.addEventListener(DEMO_ORG_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(DEMO_ORG_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): DemoOrgSession {
  return sessionRef(readDemoOrgSession().vertical);
}

function getServerSnapshot(): DemoOrgSession {
  return RESTAURANT_SESSION;
}

export function useDemoOrg(): {
  session: DemoOrgSession;
  profile: VerticalExperienceProfile;
  org: DemoOrganization;
  isHotel: boolean;
  isRestaurant: boolean;
} {
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const profile = verticalExperienceFor(session.vertical);
  const org = demoOrgForVertical(session.vertical);
  return {
    session,
    profile,
    org,
    isHotel: session.vertical === "hotel",
    isRestaurant: session.vertical === "restaurant",
  };
}

/** Client-only hydration helper when SSR must stay restaurant-default. */
export function useDemoOrgHydrated() {
  const [ready, setReady] = useState(false);
  const demo = useDemoOrg();
  useEffect(() => setReady(true), []);
  return { ...demo, ready };
}
