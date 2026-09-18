/**
 * Demo demand / social / guest / external fixtures — DEMO SIGNAL only.
 * Not live integrations. Never imply CONNECTED for Instagram / Meta.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

export type DemoSocialSignal = {
  id: string;
  locationId: string;
  channel: "INSTAGRAM_BUSINESS";
  contentType: "REEL" | "STORY" | "POST";
  publishedAt: string;
  featuredItemId?: string;
  reachIndex: number;
  engagementIndex: number;
  baselineNote: string;
  status: "DEMO_SIGNAL";
  thumbnailSrc?: string;
};

export type DemoGuestFeedbackCluster = {
  id: string;
  locationId: string;
  theme: string;
  mentionDeltaPct: number;
  window: string;
  clusterConditions: string[];
  foHStaffing: "normal" | "short" | "heavy";
  strongestExplanation: string;
  rejectedExplanations: { label: string; whyLower: string }[];
  status: "DEMO";
};

export type DemoExternalContext = {
  id: string;
  locationId: string;
  kind: "WEATHER" | "EVENT" | "HOLIDAY";
  label: string;
  at: string;
  effectNote: string;
  status: "DEMO" | "PLANNED";
};

export const DEMO_SOCIAL_SIGNALS: DemoSocialSignal[] = [
  {
    id: "soc_berlin_tuna_reel",
    locationId: DEMO_LOCATIONS.berlin.id,
    channel: "INSTAGRAM_BUSINESS",
    contentType: "REEL",
    publishedAt: "2026-09-17T14:32:00+02:00",
    featuredItemId: "mi_tuna_tataki",
    reachIndex: 1.8,
    engagementIndex: 2.4,
    baselineNote: "2.4× engagement vs 30-day content baseline",
    status: "DEMO_SIGNAL",
    thumbnailSrc: "/menu/menu-tuna-tataki.jpg",
  },
];

export const DEMO_GUEST_CLUSTERS: DemoGuestFeedbackCluster[] = [
  {
    id: "gf_berlin_slow_friday",
    locationId: DEMO_LOCATIONS.berlin.id,
    theme: "Slow service",
    mentionDeltaPct: 31,
    window: "Friday 19:15–20:15",
    clusterConditions: [
      "Delivery mix >28%",
      "Station load >94%",
      "Signature-dish mix >17%",
    ],
    foHStaffing: "normal",
    strongestExplanation:
      "Kitchen capacity × order mix — historically associated with slow-service mentions",
    rejectedExplanations: [
      {
        label: "FOH understaffing",
        whyLower: "Roster within plan · mentions cluster with kitchen load, not cover count alone",
      },
      {
        label: "Inventory stockout",
        whyLower: "No 86 spikes in the same windows",
      },
    ],
    status: "DEMO",
  },
];

export const DEMO_EXTERNAL: DemoExternalContext[] = [
  {
    id: "ext_berlin_rain",
    locationId: DEMO_LOCATIONS.berlin.id,
    kind: "WEATHER",
    label: "Rain from 18:30",
    at: "2026-09-17T18:30:00+02:00",
    effectNote:
      "Terrace likely unusable · delivery demand historically rises · indoor capacity becomes scarce",
    status: "DEMO",
  },
  {
    id: "ext_berlin_concert",
    locationId: DEMO_LOCATIONS.berlin.id,
    kind: "EVENT",
    label: "Nearby concert ends 21:45",
    at: "2026-09-17T21:45:00+02:00",
    effectNote: "Late walk-in / delivery pulse possible after show",
    status: "DEMO",
  },
];
