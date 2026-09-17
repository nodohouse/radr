import { DECISION } from "./ids";
import type { BriefPacket, BriefPacketId, SeedId, ServiceBrief } from "./types";

const CHEF: BriefPacket = {
  packet: "chef",
  title: "Chef packet",
  horizon: "Next 90m",
  lead: "Ticket risk + feature path — not a full board.",
  items: [
    {
      id: "c1",
      check: "Cold-station load",
      detail: "Peak signature burning minutes 19:00–20:30",
      because: "De-emphasize peak window protects kitchen minutes",
      when: "Now",
      euro: 610,
      grade: "Expected",
      decisionId: DECISION.menuPeak.id,
      displayId: DECISION.menuPeak.displayId,
      status: "do",
    },
    {
      id: "c2",
      check: "Wait-12 implication",
      detail: "Hold walk-ins · throttle delivery 25m",
      because: "Seat-now →97% kitchen · 9 turns exposed",
      when: "Decide by 18:53",
      euro: 620,
      grade: "Expected",
      decisionId: DECISION.peak.id,
      displayId: DECISION.peak.displayId,
      seed: "service",
      status: "do",
    },
    {
      id: "c3",
      check: "Allergy / VIP tickets",
      detail: "T12 nut allergy · VIP 6 at 18:50 must sit",
      because: "Ticket flags already staged — confirm fire order",
      when: "18:50",
      status: "watch",
    },
    {
      id: "c4",
      check: "Feature high €/min",
      detail: "Push high-contribution plates while holding",
      because: "Protects contribution without rush-order chaos",
      when: "Tonight",
      status: "do",
    },
  ],
};

const FOH: BriefPacket = {
  packet: "foh",
  title: "FOH packet",
  horizon: "Next 90m",
  lead: "Who’s coming · what to hold · tables linked to Decisions.",
  items: [
    {
      id: "f1",
      check: "Walk-in hold",
      detail: "Hold 2 walk-ins until 18:54 resume",
      because: "Wait-12 Decision open — seating now burns turns",
      when: "Until 18:54",
      euro: 620,
      grade: "Expected",
      decisionId: DECISION.peak.id,
      displayId: DECISION.peak.displayId,
      seed: "service",
      status: "do",
    },
    {
      id: "f2",
      check: "Turn-risk tables",
      detail: "T4 · T7 · T11 second-turn exposure",
      because: "Linked to D-1911 · delay seating until kitchen cools",
      when: "~11m",
      displayId: DECISION.peak.displayId,
      decisionId: DECISION.peak.id,
      seed: "service",
      status: "watch",
    },
    {
      id: "f3",
      check: "VIP / allergy",
      detail: "VIP party 6 · T12 nut allergy · must sit 18:50",
      because: "Operator context already on Decision — honor clock",
      when: "18:50",
      status: "do",
    },
    {
      id: "f4",
      check: "Arriving / returning",
      detail: "4 arrivals next 20m · 2 returning regulars",
      because: "Density compresses — hold walk-ins first",
      when: "18:42–19:00",
      status: "watch",
    },
  ],
};

const GM: BriefPacket = {
  packet: "gm",
  title: "GM packet",
  horizon: "Tonight",
  lead: "Money decision + clock + Pulse — Approve when ready.",
  items: [
    {
      id: "g1",
      check: "Approve Wait-12",
      detail: "€620 Expected · decide by 18:53",
      because: "Protects second turns vs seat-now kitchen spike",
      when: "11m",
      euro: 620,
      grade: "Expected",
      decisionId: DECISION.peak.id,
      displayId: DECISION.peak.displayId,
      seed: "service",
      status: "do",
    },
    {
      id: "g2",
      check: "Pulse snapshot",
      detail: "Delivery tax + cancels watching · net €1,840 Expected",
      because: "Turbulence on the graph maps to open Decisions",
      when: "Live",
      status: "watch",
    },
    {
      id: "g3",
      check: "Labor hold",
      detail: "Do not add headcount — mix risk, not roster",
      because: "D-1920 · €410 Expected protected",
      when: "Tonight",
      euro: 410,
      grade: "Expected",
      decisionId: DECISION.labor.id,
      displayId: DECISION.labor.displayId,
      status: "done",
    },
  ],
};

const CFO: BriefPacket = {
  packet: "cfo",
  title: "CFO packet",
  horizon: "14d · money & risk",
  lead: "Recover + Buy exposures — not the floor map.",
  items: [
    {
      id: "cf1",
      check: "Dispute AP credit",
      detail: "INV-88421 · €273 Expected · 11 days",
      because: "Contract €6.80/L vs invoice €7.45/L · CM draft pending",
      when: "28 Sep",
      euro: 273,
      grade: "Expected",
      decisionId: DECISION.supplier.id,
      displayId: DECISION.supplier.displayId,
      seed: "recover",
      status: "do",
    },
    {
      id: "cf2",
      check: "Hold above-contract PO",
      detail: "Block next oil PO until yield + CM path",
      because: "Same variance compounds if PO fires",
      when: "This week",
      euro: 273,
      grade: "Expected",
      decisionId: DECISION.supplier.id,
      displayId: DECISION.supplier.displayId,
      seed: "recover",
      status: "do",
    },
    {
      id: "cf3",
      check: "Verified ladder",
      detail: "€2,830 Verified · Trace sealed on tuna shortfall",
      because: "POS close + stock adjustment matched — not an estimate",
      when: "Since last check",
      euro: 2830,
      grade: "Verified",
      displayId: DECISION.tuna.displayId,
      status: "done",
    },
  ],
};

const HOTEL_FOH: BriefPacket = {
  packet: "foh",
  title: "Front office packet",
  horizon: "Next 90m",
  lead: "Who’s arriving · what to hold · rooms linked to Decisions.",
  items: [
    {
      id: "hf1",
      check: "Orphan-night release",
      detail: "2 unit-nights unsold after cancel cluster",
      because: "Window closes 20:00 — D-3301 still open",
      when: "Before 20:00",
      euro: 640,
      grade: "Expected",
      decisionId: DECISION.hotelOrphan.id,
      displayId: DECISION.hotelOrphan.displayId,
      seed: "hotel",
      status: "do",
    },
    {
      id: "hf2",
      check: "Arrivals 90m",
      detail: "8 arrivals · 2 VIP · 1 late flight risk",
      because: "Honor VIP rooms before dumping remainder to OTA",
      when: "18:42–20:00",
      status: "watch",
    },
    {
      id: "hf3",
      check: "Direct vs OTA",
      detail: "Hold last 3 deluxe on direct",
      because: "OTA take already diluting tonight’s contribution",
      when: "Now",
      euro: 420,
      grade: "Expected",
      decisionId: DECISION.hotelOta.id,
      displayId: DECISION.hotelOta.displayId,
      seed: "hotel",
      status: "do",
    },
    {
      id: "hf4",
      check: "No-show watch",
      detail: "1 prepaid no-show risk after 18:00",
      because: "Fee / waiver is Recover — always ask",
      when: "18:00+",
      status: "watch",
    },
  ],
};

const HOTEL_CHEF: BriefPacket = {
  packet: "chef",
  title: "F&B packet",
  horizon: "Next 90m",
  lead: "In-house dining load from arrivals — not a restaurant rush board.",
  items: [
    {
      id: "hc1",
      check: "In-house covers",
      detail: "12 dinner reservations from in-house + 4 walk-in hotel guests",
      because: "Arrival compression 19:00 — protect kitchen minutes",
      when: "19:00",
      status: "do",
    },
    {
      id: "hc2",
      check: "Upsell path",
      detail: "Late checkout + breakfast attach still open",
      because: "Money IN on Pulse includes upsells — Expected until posted",
      when: "Tonight",
      euro: 180,
      grade: "Expected",
      status: "watch",
    },
    {
      id: "hc3",
      check: "Comp watch",
      detail: "1 delayed-arrival amenity staged",
      because: "Comps are OUT on Pulse — do not silently widen",
      when: "On arrival",
      status: "watch",
    },
  ],
};

const HOTEL_GM: BriefPacket = {
  packet: "gm",
  title: "Hotel GM packet",
  horizon: "Tonight",
  lead: "Pickup + orphan + mix — Approve release before 20:00.",
  items: [
    {
      id: "hg1",
      check: "Approve orphan release",
      detail: "€640 Expected · decide by 20:00",
      because: "Leave-orphan writes off two nights; release keeps them in play",
      when: "78m",
      euro: 640,
      grade: "Expected",
      decisionId: DECISION.hotelOrphan.id,
      displayId: DECISION.hotelOrphan.displayId,
      seed: "hotel",
      status: "do",
    },
    {
      id: "hg2",
      check: "Pulse snapshot",
      detail: "OTA mix heavy · net still Expected",
      because: "Graph turbulence maps to D-3301 / D-3308",
      when: "Live",
      status: "watch",
    },
    {
      id: "hg3",
      check: "VIP arrivals",
      detail: "2 VIP must keep booked rooms",
      because: "Do not release VIP inventory into the orphan pool",
      when: "Tonight",
      status: "done",
    },
  ],
};

const SERVICE_BRIEF: ServiceBrief = {
  phase: "mid",
  phaseLabel: "Mid-service · +42m",
  deltaNote: "Since pre-shift: kitchen +18pts · inbound +12 · Wait-12 still open",
  packets: { chef: CHEF, foh: FOH, gm: GM, cfo: CFO },
};

const RECOVER_BRIEF: ServiceBrief = {
  phase: "pre",
  phaseLabel: "Monday morning · recover focus",
  deltaNote: "AP variance aged 11d · credit memo still draft · next PO at risk",
  packets: {
    chef: CHEF,
    foh: FOH,
    gm: {
      ...GM,
      lead: "Recover clock shares attention with tonight — don’t lose the AP path.",
      items: [
        {
          id: "g_r1",
          check: "AP dispute staged?",
          detail: "D-4102 · Confirm prepare if not yet staged",
          because: "€273 Expected until CM posts",
          when: "11d",
          euro: 273,
          grade: "Expected",
          seed: "recover",
          decisionId: DECISION.supplier.id,
          displayId: DECISION.supplier.displayId,
          status: "do",
        },
        ...GM.items.slice(0, 2),
      ],
    },
    cfo: CFO,
  },
};

const HOTEL_BRIEF: ServiceBrief = {
  phase: "mid",
  phaseLabel: "Arrivals · +42m",
  deltaNote: "Since pre-shift: 3 late cancels · 2 orphan nights · OTA mix +8pts",
  packets: { chef: HOTEL_CHEF, foh: HOTEL_FOH, gm: HOTEL_GM, cfo: CFO },
};

export function getServiceBrief(seed: SeedId): ServiceBrief {
  if (seed === "recover") return RECOVER_BRIEF;
  if (seed === "hotel") return HOTEL_BRIEF;
  return SERVICE_BRIEF;
}

export function defaultBriefForRole(role: string): BriefPacketId {
  if (role === "cfo") return "cfo";
  if (role === "gm") return "foh";
  return "gm";
}

export const BRIEF_TABS: { id: BriefPacketId; label: string }[] = [
  { id: "foh", label: "FOH" },
  { id: "chef", label: "Chef" },
  { id: "gm", label: "GM" },
  { id: "cfo", label: "CFO" },
];
