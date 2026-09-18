/**
 * Canonical hospitality verticals + Decision selection for public surfaces.
 * Single source — no duplicated economics literals on pages.
 */

import {
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  formatCanonVariance,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type HospitalityVertical =
  | "restaurant"
  | "hotel"
  | "serviced_apartment";

export const HOSPITALITY_TAXONOMY = [
  "Restaurants & F&B",
  "Hotels & Resorts",
  "Serviced apartments",
] as const;

export const HOSPITALITY_SCOPE = "Single location → multi-location group" as const;

export const HOSPITALITY_VERTICALS: {
  id: HospitalityVertical;
  label: string;
  short: string;
}[] = [
  { id: "restaurant", label: "Restaurant", short: "Restaurant" },
  { id: "hotel", label: "Hotel", short: "Hotel" },
  { id: "serviced_apartment", label: "Serviced apartment", short: "Serviced" },
];

export function decisionForVertical(v: HospitalityVertical): CanonDecision {
  if (v === "hotel") return CANON_OTA;
  if (v === "serviced_apartment") return CANON_ORPHAN;
  return CANON_PEAK;
}

export function euro(n: number): string {
  return formatDecisionMoney(n);
}

export type HeroSceneModel = {
  vertical: HospitalityVertical;
  decision: CanonDecision;
  desktop: {
    kicker: string;
    idLine: string;
    title: string;
    action: string;
    euro: string;
    grade: string;
    because: string;
  };
  phone: {
    role: string;
    badge: string;
    title: string;
    body: string;
    meta: string;
    primary: string;
    tone: "brief" | "urgent" | "recover";
  };
};

export function heroSceneFor(v: HospitalityVertical): HeroSceneModel {
  const d = decisionForVertical(v);

  if (v === "hotel") {
    return {
      vertical: v,
      decision: d,
      desktop: {
        kicker: "Canal House · Amsterdam",
        idLine: `${d.displayId} · Hotel · Demo`,
        title: "Premium inventory",
        action: "Hold 4 premium rooms direct",
        euro: euro(d.exposureEuro),
        grade: "EXPOSURE",
        because: `${euro(d.expectedProtectedEuro)} expected protected · vs OTA release`,
      },
      phone: {
        role: "Front desk",
        badge: "Arrival",
        title: "Returning guest · 16:40",
        body: "Premium room ready · direct upgrade opportunity",
        meta: d.displayId,
        primary: "Open arrival brief",
        tone: "brief",
      },
    };
  }

  if (v === "serviced_apartment") {
    return {
      vertical: v,
      decision: d,
      desktop: {
        kicker: "Chiado Collective · Lisbon",
        idLine: `${d.displayId} · Serviced · Demo`,
        title: "Orphan night",
        action: "Keep unit direct-first",
        euro: euro(d.exposureEuro),
        grade: "AT RISK",
        because: "72h window · direct recovery staged",
      },
      phone: {
        role: "Ops",
        badge: "Value at risk",
        title: "Unit 24 · 1-night gap",
        body: "72h recovery window · direct recovery staged",
        meta: d.displayId,
        primary: "Review",
        tone: "urgent",
      },
    };
  }

  return {
    vertical: v,
    decision: d,
    desktop: {
      kicker: "Berlin Mitte · Dinner service",
      idLine: `${d.displayId} · Restaurant · Demo`,
      title: d.title,
      action: "Wait 12 minutes",
      euro: euro(d.expectedProtectedEuro),
      grade: "EXPECTED",
      because: `vs seat-now baseline · ${formatCanonVariance(d)}`,
    },
    phone: {
      role: "FOH",
      badge: "RADR Floor",
      title: "VIP reservation updated",
      body: "Party of 6 · 18:50 · Table 12 · nut allergy · returning guest",
      meta: "18:42 · Dinner · FOH brief updated",
      primary: "Open brief",
      tone: "brief",
    },
  };
}

/** Secondary restaurant Floor phone — service intelligence */
export function restaurantFloorSecondaryPhone(): HeroSceneModel["phone"] {
  return {
    role: "FOH",
    badge: "Service update",
    title: "Recommend Ribeye",
    body: "Cold station 92% · Table 7 · 4 guests · guest preference + lower constrained load",
    meta: "18:42 · Dinner",
    primary: "Open brief",
    tone: "brief",
  };
}

export function platformEconomics(d: CanonDecision) {
  return {
    id: d.displayId,
    property: d.property,
    title: d.title,
    exposure: euro(d.exposureEuro),
    expected: euro(d.expectedProtectedEuro),
    observed: euro(d.actualProtectedEuro),
    verified: euro(d.actualProtectedEuro),
    variance: formatCanonVariance(d),
    prepared: d.prepared,
    verticalLabel:
      d.vertical === "hotel"
        ? "Hotel"
        : d.vertical === "apartment"
          ? "Serviced"
          : "Restaurant",
  };
}

export type PlatformSceneContent = {
  signals: { k: string; v: string; note: string }[];
  understand: { nodes: string[]; hot: string; line: string };
  futures: { id: string; title: string; euro: string; note: string; rec: boolean }[];
  actions: { em: string; strong: string }[];
  roles: { em: string; strong: string; hot?: boolean }[];
  heads: Record<string, string>;
};

export function platformSceneFor(v: HospitalityVertical): PlatformSceneContent {
  const d = decisionForVertical(v);
  const econ = platformEconomics(d);

  if (v === "hotel") {
    return {
      signals: [
        { k: "Occupancy", v: "89%", note: "looks excellent" },
        { k: "Premium left", v: "4", note: "scarce inventory" },
        { k: "Direct pace", v: "↑", note: "pickup strong" },
        { k: "OTA share", v: "High", note: "commission drag" },
        { k: "Housekeeping", v: "Ready", note: "premium set" },
        { k: "Deadline", v: "Noon", note: "release window" },
      ],
      understand: {
        nodes: ["PMS", "Channels", "Direct", "Housekeeping", "Events"],
        hot: "Direct",
        line: "Scarce premium + direct pickup beats OTA fill.",
      },
      futures: [
        {
          id: "ota",
          title: "Release to OTA",
          euro: "€0",
          note: "Fills · commission stands",
          rec: false,
        },
        {
          id: "rate",
          title: "Raise rate",
          euro: euro(1800),
          note: "Looks smart · weakens direct",
          rec: false,
        },
        {
          id: "hold",
          title: "Hold premium direct 72h",
          euro: econ.expected,
          note: "Higher expected contribution",
          rec: true,
        },
      ],
      actions: [
        { em: "Inventory", strong: "Hold 4 premium rooms direct 72h" },
        { em: "Channels", strong: "Suppress OTA push on block" },
        { em: "Front desk", strong: "Stage arrival upgrade path" },
      ],
      roles: [
        { em: "GM", strong: `Hold direct · ${econ.exposure} exposure` },
        { em: "Front desk", strong: "Returning guest · premium ready", hot: true },
        { em: "Revenue", strong: "Channel mix · not occupancy max" },
      ],
      heads: {
        Detected: "Signals converging",
        Understood: "Occupancy ≠ best allocation",
        Futures: "Three paths",
        Recommended: "Hold premium direct 72h",
        Approved: "Prepared for the property",
        Observed: `${econ.observed} observed`,
        Verified: `${econ.verified} protected`,
        Learned: `Playbook joins ${econ.id}`,
      },
    };
  }

  if (v === "serviced_apartment") {
    return {
      signals: [
        { k: "Gap", v: "1 night", note: "orphan window" },
        { k: "Horizon", v: "72h", note: "clock running" },
        { k: "Channel", v: "Open", note: "fill pressure" },
        { k: "Cleaning", v: "Absorbed", note: "turnover done" },
        { k: "Next stay", v: "Wed", note: "LOS constraint" },
        { k: "Direct", v: "In band", note: "longer stay odds" },
      ],
      understand: {
        nodes: ["Unit PMS", "Channels", "Cleaning", "Next stay", "Net"],
        hot: "Net",
        line: "Gross night ≠ net contribution after channel drag.",
      },
      futures: [
        {
          id: "empty",
          title: "Leave empty",
          euro: "€0",
          note: "Night expires",
          rec: false,
        },
        {
          id: "fill",
          title: "Fill immediately",
          euro: euro(78),
          note: "Channel drag · weakens LOS",
          rec: false,
        },
        {
          id: "wait",
          title: "Keep unit direct-first",
          euro: econ.expected,
          note: "Wait 24h · then gate",
          rec: true,
        },
      ],
      actions: [
        { em: "Unit", strong: "Keep Unit 24 direct-first 24h" },
        { em: "Channels", strong: "Hold one-night push" },
        { em: "Ops", strong: "Reassess at T−48h" },
      ],
      roles: [
        { em: "Ops", strong: `Unit 24 · ${econ.exposure} at risk`, hot: true },
        { em: "GM", strong: "Direct-first · not first fill" },
        { em: "Finance", strong: "Net contribution · not gross" },
      ],
      heads: {
        Detected: "Orphan night opening",
        Understood: "Fill-now burns net",
        Futures: "Three paths",
        Recommended: "Keep unit direct-first",
        Approved: "Recovery staged",
        Observed: `${econ.observed} observed`,
        Verified: `${econ.verified} recovered`,
        Learned: `Playbook joins ${econ.id}`,
      },
    };
  }

  return {
    signals: [
      { k: "Floor occ.", v: "78%", note: "walk-ins waiting" },
      { k: "Kitchen", v: "92%", note: "KDS pressure" },
      { k: "Inbound", v: "38", note: "covers" },
      { k: "Delivery", v: "Open", note: "throttle candidate" },
      { k: "Tables free", v: "2", note: "not free capacity" },
      { k: "Deadline", v: "18:53", note: "decision window" },
    ],
    understand: {
      nodes: ["Reservations", "KDS", "Delivery", "Menu econ", "Table turns"],
      hot: "Table turns",
      line: "Empty tables ≠ capacity when kitchen is constrained.",
    },
    futures: [
      {
        id: "seat",
        title: "Seat now",
        euro: "€0",
        note: "Fills fast · burns second turn",
        rec: false,
      },
      {
        id: "wait",
        title: "Wait 12 minutes",
        euro: econ.expected,
        note: "Protect contribution · reversible",
        rec: true,
      },
      {
        id: "hard",
        title: "Hard stop",
        euro: euro(180),
        note: "Safer · leaves money on table",
        rec: false,
      },
    ],
    actions: [
      { em: "Floor", strong: "Hold 2 tables · 12 minutes" },
      { em: "Delivery", strong: "Throttle until 18:54" },
      { em: "Menu", strong: "Feature fast dish" },
    ],
    roles: [
      { em: "GM", strong: `Wait 12 · ${econ.expected} at stake` },
      { em: "FOH", strong: "Hold T12 · VIP 18:50 · allergy note", hot: true },
      { em: "Kitchen", strong: "Cold station 92% · feature fast dish" },
    ],
    heads: {
      Detected: "Signals converging",
      Understood: "Empty tables ≠ capacity",
      Futures: "Three paths",
      Recommended: "Wait 12 minutes",
      Approved: "Prepared for the floor",
      Observed: `${econ.observed} observed`,
      Verified: `${econ.verified} protected`,
      Learned: `Playbook joins ${econ.id}`,
    },
  };
}
