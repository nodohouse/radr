/**
 * Demo editorial visual registry — copyright-safe project assets only.
 * DEMO EDITORIAL ASSET — not real customer photography.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

/** Focal crop — percentages 0–100 for object-position. Never rely on browser-center. */
export type VisualFocal = {
  focalX: number;
  focalY: number;
  preferredAspect: "16:9" | "4:3" | "3:2" | "1:1";
  mobileFocalX: number;
  mobileFocalY: number;
  midFocalX?: number;
  midFocalY?: number;
};

export type VisualAsset = {
  id: string;
  src: string;
  alt: string;
  locationId?: string;
  decisionId?: string;
  subject: string;
  crop?: "center" | "top" | "left";
  focal?: VisualFocal;
  credit?: string;
  demoLabel?: "DEMO EDITORIAL ASSET";
};

const FOCAL = {
  berlinDining: {
    focalX: 42,
    focalY: 48,
    preferredAspect: "3:2" as const,
    mobileFocalX: 48,
    mobileFocalY: 52,
    midFocalX: 44,
    midFocalY: 50,
  },
  berlinBar: {
    focalX: 50,
    focalY: 42,
    preferredAspect: "3:2" as const,
    mobileFocalX: 50,
    mobileFocalY: 45,
  },
  berlinTerrace: {
    focalX: 45,
    focalY: 55,
    preferredAspect: "3:2" as const,
    mobileFocalX: 50,
    mobileFocalY: 58,
  },
  canal: {
    focalX: 50,
    focalY: 45,
    preferredAspect: "3:2" as const,
    mobileFocalX: 50,
    mobileFocalY: 48,
  },
  chiado: {
    focalX: 50,
    focalY: 48,
    preferredAspect: "3:2" as const,
    mobileFocalX: 50,
    mobileFocalY: 50,
  },
  dish: {
    focalX: 50,
    focalY: 45,
    preferredAspect: "1:1" as const,
    mobileFocalX: 50,
    mobileFocalY: 45,
  },
};

export function objectPosition(focal?: VisualFocal, width = 1440): string {
  if (!focal) return "50% 50%";
  if (width < 1024) return `${focal.mobileFocalX}% ${focal.mobileFocalY}%`;
  if (width < 1280 && focal.midFocalX != null)
    return `${focal.midFocalX}% ${focal.midFocalY ?? focal.focalY}%`;
  return `${focal.focalX}% ${focal.focalY}%`;
}

export const VISUAL_ASSETS = {
  locations: {
    berlinMitte: {
      id: "loc_berlin_dining",
      src: "/demo/facilities/berlin-dining.jpg",
      alt: "Dining room at Berlin Mitte during evening service",
      locationId: DEMO_LOCATIONS.berlin.id,
      subject: "restaurant_dining_room",
      crop: "center" as const,
      focal: FOCAL.berlinDining,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    berlinKitchen: {
      id: "loc_berlin_bar",
      src: "/demo/facilities/berlin-bar.jpg",
      alt: "Service atmosphere at Berlin Mitte",
      locationId: DEMO_LOCATIONS.berlin.id,
      subject: "service_atmosphere",
      crop: "center" as const,
      focal: FOCAL.berlinBar,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    canalHouse: {
      id: "loc_canal_suite",
      src: "/demo/facilities/canal-suite.jpg",
      alt: "Premium suite interior at Canal House Amsterdam",
      locationId: DEMO_LOCATIONS.canal.id,
      subject: "hotel_room",
      crop: "center" as const,
      focal: FOCAL.canal,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    canalRoom: {
      id: "loc_canal_deluxe",
      src: "/demo/facilities/canal-deluxe-king.jpg",
      alt: "Deluxe king room at Canal House Amsterdam",
      locationId: DEMO_LOCATIONS.canal.id,
      subject: "hotel_room",
      crop: "center" as const,
      focal: FOCAL.canal,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    chiado: {
      id: "loc_chiado_studio",
      src: "/demo/facilities/lisbon-studio.jpg",
      alt: "Serviced apartment interior at Chiado Collective Lisbon",
      locationId: DEMO_LOCATIONS.chiado.id,
      subject: "apartment_interior",
      crop: "center" as const,
      focal: FOCAL.chiado,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    chiadoOneBed: {
      id: "loc_chiado_onebed",
      src: "/demo/facilities/lisbon-onebed.jpg",
      alt: "One-bedroom apartment at Chiado Collective Lisbon",
      locationId: DEMO_LOCATIONS.chiado.id,
      subject: "apartment_interior",
      crop: "center" as const,
      focal: FOCAL.chiado,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
  },
  decisions: {
    [DECISION_IDS.peak]: {
      id: "dec_peak_scene",
      src: "/demo/facilities/berlin-dining.jpg",
      alt: "Berlin Mitte dining room during dinner service — occupied tables, warm practical light",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.peak,
      subject: "peak_dinner_service",
      crop: "center" as const,
      focal: FOCAL.berlinDining,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.ota]: {
      id: "dec_ota_scene",
      src: "/demo/facilities/canal-deluxe-king.jpg",
      alt: "Premium hotel room inventory at Canal House Amsterdam",
      locationId: DEMO_LOCATIONS.canal.id,
      decisionId: DECISION_IDS.ota,
      subject: "premium_room_inventory",
      crop: "center" as const,
      focal: FOCAL.canal,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.orphan]: {
      id: "dec_orphan_scene",
      src: "/marketing/apt-orphan-gap.png",
      alt: "Empty serviced-apartment night at Chiado Collective",
      locationId: DEMO_LOCATIONS.chiado.id,
      decisionId: DECISION_IDS.orphan,
      subject: "orphan_unit_night",
      crop: "center" as const,
      focal: FOCAL.chiado,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.supplier]: {
      id: "dec_supplier_scene",
      src: "/menu/menu-wine.jpg",
      alt: "Premium ingredient and beverage inventory context",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.supplier,
      subject: "procurement_ingredient",
      crop: "center" as const,
      focal: FOCAL.dish,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.tableRecover]: {
      id: "dec_table_scene",
      src: "/demo/facilities/berlin-terrace.jpg",
      alt: "Dining atmosphere at Berlin Mitte during service",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.tableRecover,
      subject: "table_service",
      crop: "center" as const,
      focal: FOCAL.berlinTerrace,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.tuna]: {
      id: "dec_tuna_scene",
      src: "/marketing/dish-tuna-tataki.png",
      alt: "Signature tuna dish at Berlin Mitte",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.tuna,
      subject: "menu_item",
      crop: "center" as const,
      focal: FOCAL.dish,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.menuPeak]: {
      id: "dec_menu_peak_scene",
      src: "/menu/menu-tuna-tataki.jpg",
      alt: "Signature dish plating — profitable off-peak, capacity-expensive at peak",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.menuPeak,
      subject: "menu_peak_economics",
      crop: "center" as const,
      focal: FOCAL.dish,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.socialDemand]: {
      id: "dec_social_scene",
      src: "/menu/menu-tuna-tataki.jpg",
      alt: "Featured dish context for social demand signal — DEMO SIGNAL not live Instagram",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.socialDemand,
      subject: "social_demand",
      crop: "center" as const,
      focal: FOCAL.dish,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.guestVoice]: {
      id: "dec_guest_scene",
      src: "/demo/facilities/berlin-dining.jpg",
      alt: "Service floor at Berlin Mitte — guest experience under kitchen pressure",
      locationId: DEMO_LOCATIONS.berlin.id,
      decisionId: DECISION_IDS.guestVoice,
      subject: "guest_voice",
      crop: "center" as const,
      focal: FOCAL.berlinDining,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
    [DECISION_IDS.playbook]: {
      id: "dec_playbook_canal",
      src: "/demo/facilities/canal-suite.jpg",
      alt: "Canal House Amsterdam property context for group pattern",
      locationId: DEMO_LOCATIONS.canal.id,
      decisionId: DECISION_IDS.playbook,
      subject: "group_property",
      crop: "center" as const,
      focal: FOCAL.canal,
      demoLabel: "DEMO EDITORIAL ASSET" as const,
    },
  },
} as const;

export function sceneForDecision(decisionId: string): VisualAsset | null {
  const hit =
    VISUAL_ASSETS.decisions[
      decisionId as keyof typeof VISUAL_ASSETS.decisions
    ];
  return hit ?? null;
}

export function sceneForLocation(locationId: string): VisualAsset | null {
  if (locationId === DEMO_LOCATIONS.berlin.id) {
    return VISUAL_ASSETS.locations.berlinMitte;
  }
  if (locationId === DEMO_LOCATIONS.canal.id) {
    return VISUAL_ASSETS.locations.canalHouse;
  }
  if (locationId === DEMO_LOCATIONS.chiado.id) {
    return VISUAL_ASSETS.locations.chiado;
  }
  return null;
}
