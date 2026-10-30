/**
 * Cross-product deep-links for Hotel Decisions (PASS 6).
 * Same Decision ID · same economics · no duplicate objects.
 */

import { settingsPolicyHref } from "@/lib/radr/product/demoSettings";
import { HOTEL_READINESS_ID } from "./hotelActions";

export type HotelCrossLink = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

/** Canonical D-H-9201 numbers — must match CC / House / Decisions / Intelligence. */
export const HOTEL_READINESS_CANON = {
  decisionId: HOTEL_READINESS_ID,
  displayId: "D-H-9201",
  title: "Reassign 2 housekeepers",
  exposureEuro: 1840,
  protectedEuro: 1840,
  confidence: 81,
  ready: 31,
  due: 42,
  atRisk: 7,
  arrivals: 42,
  deadline: "14:40",
  clock: "14:20",
  verifiedMtdEuro: 6710,
} as const;

export function hotelCrossLinksFor(decisionId: string): HotelCrossLink[] {
  if (decisionId !== HOTEL_READINESS_ID) {
    return [
      {
        id: "cc",
        label: "Control Center",
        href: "/app",
        hint: "Operating brief",
      },
      {
        id: "decisions",
        label: "All Decisions",
        href: "/app/decisions",
        hint: "Judgment ledger",
      },
    ];
  }

  return [
    {
      id: "finding",
      label: "View analysis →",
      href: "/app/intelligence?module=room_readiness&stay=1",
      hint: "Floor 3 readiness will miss arrival demand",
    },
    {
      id: "house",
      label: "House Readiness",
      href: "/app/service",
      hint: "31/42 · 7 at risk · Floor 3",
    },
    {
      id: "cc",
      label: "Control Center",
      href: "/app",
      hint: "Active Decision card",
    },
    {
      id: "live",
      label: "Live",
      href: "/app/live",
      hint: "Spatial operating twin",
    },
    {
      id: "health",
      label: "Data Health",
      href: "/app/data-health?focus=housekeeping&stay=1",
      hint: "Evidence Health · Healthy",
    },
    {
      id: "policy",
      label: "View policy →",
      href: settingsPolicyHref("housekeeping_reassign"),
      hint: "Reassignment >1 worker · GM approval",
    },
    {
      id: "value",
      label: "Value lifecycle",
      href: `/app/value?decision=${HOTEL_READINESS_ID}&stay=1`,
      hint: "Expected → Observed → Verified",
    },
    {
      id: "memory",
      label: "View in Memory →",
      href: "/app/memory?lesson=mem_canal_hk&stay=1",
      hint: "Floor-3 pre-arrival bottleneck pattern",
    },
  ];
}
