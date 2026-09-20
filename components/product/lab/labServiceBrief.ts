/**
 * Service Brief — airline crew brief MVP.
 * Same Decision Record, role packets for ~90m.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { LabSeed } from "./labState";
import { canonicalVerifiedTotal, formatCanonicalVerified } from "@/lib/radr/product/verifiedValueCanon";

export type BriefPacket = "chef" | "foh" | "gm" | "cfo";

export type BriefItem = {
  id: string;
  check: string;
  detail: string;
  because: string;
  when: string;
  euro?: number;
  grade?: "Expected" | "Verified";
  decisionId?: string;
  displayId?: string;
  seed?: LabSeed;
  status: "do" | "watch" | "done";
};

export type BriefPacketModel = {
  packet: BriefPacket;
  title: string;
  horizon: string;
  lead: string;
  items: BriefItem[];
};

export type ServiceBriefModel = {
  phase: "pre" | "mid";
  phaseLabel: string;
  deltaNote: string;
  packets: Record<BriefPacket, BriefPacketModel>;
};

const SERVICE_BRIEF: ServiceBriefModel = {
  phase: "mid",
  phaseLabel: "Mid-service · +42m",
  deltaNote: "Since pre-shift: kitchen +18pts · inbound +12 · Wait-12 still open",
  packets: {
    chef: {
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
          decisionId: DECISION_IDS.menuPeak,
          displayId: "D-7110",
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
          decisionId: DECISION_IDS.peak,
          displayId: "D-1911",
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
    },
    foh: {
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
          decisionId: DECISION_IDS.peak,
          displayId: "D-1911",
          seed: "service",
          status: "do",
        },
        {
          id: "f2",
          check: "Turn-risk tables",
          detail: "T4 · T7 · T11 second-turn exposure",
          because: "Linked to D-1911 · delay seating until kitchen cools",
          when: "~11m",
          displayId: "D-1911",
          decisionId: DECISION_IDS.peak,
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
    },
    gm: {
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
          decisionId: DECISION_IDS.peak,
          displayId: "D-1911",
          seed: "service",
          status: "do",
        },
        {
          id: "g2",
          check: "Pulse snapshot",
          detail: "Delivery tax + cancels watching · net €1,840 Expected",
          because: "Turbulence chips map to open Decisions",
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
          decisionId: DECISION_IDS.labor,
          displayId: "D-1920",
          status: "done",
        },
      ],
    },
    cfo: {
      packet: "cfo",
      title: "CFO packet",
      horizon: "14d · money & risk",
      lead: "Recover and Buy exposures — not the floor map.",
      items: [
        {
          id: "cf1",
          check: "Dispute AP credit",
          detail: "INV-88421 · €273 Expected · 11 days",
          because: "Contract €6.80/L vs invoice €7.45/L · CM draft pending",
          when: "28 Sep",
          euro: 273,
          grade: "Expected",
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
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
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
          seed: "recover",
          status: "do",
        },
        {
          id: "cf3",
          check: "Verified Value",
          detail: `${formatCanonicalVerified("cfo")} Verified in CFO scope`,
          because: "Sum of Verified Decision records",
          when: "Since last check",
          euro: canonicalVerifiedTotal("cfo"),
          grade: "Verified",
          displayId: "LEDGER",
          status: "done",
        },
      ],
    },
  },
};

const RECOVER_BRIEF: ServiceBriefModel = {
  phase: "pre",
  phaseLabel: "Monday morning · recover focus",
  deltaNote:
    "One recovered credit · matched to invoice · Finance can verify",
  packets: {
    chef: SERVICE_BRIEF.packets.chef,
    foh: SERVICE_BRIEF.packets.foh,
    gm: {
      ...SERVICE_BRIEF.packets.gm,
      lead: "CFO Recover path owns D-4102 — floor stays quiet.",
      items: [
        {
          id: "g_r1",
          check: "AP credit verified",
          detail: "D-4102 · €273 Verified recovered",
          because: "Credit memo applied · matched to original invoice",
          when: "Sealed",
          euro: 273,
          grade: "Verified",
          seed: "recover",
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
          status: "done",
        },
        ...SERVICE_BRIEF.packets.gm.items.slice(0, 2),
      ],
    },
    cfo: {
      packet: "cfo",
      title: "CFO packet",
      horizon: "Verified recovery",
      lead: "One credit. Matched to AP. Verified.",
      items: [
        {
          id: "cf1",
          check: "AP credit applied",
          detail: "INV-88421 · CM-44102 · €273 Verified",
          because: "€273 recovered and matched to the original invoice",
          when: "Sealed",
          euro: 273,
          grade: "Verified",
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
          seed: "recover",
          status: "done",
        },
        {
          id: "cf2",
          check: "Hold above-contract PO",
          detail: "Next oil PO blocked until path reviewed",
          because: "Same variance must not fire again",
          when: "This week",
          euro: 273,
          grade: "Verified",
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
          seed: "recover",
          status: "do",
        },
        {
          id: "cf3",
          check: "Open Value Trace",
          detail: "Invoice → contract → decision → credit → Verified",
          because: "Follow the money end to end",
          when: "Now",
          euro: 273,
          grade: "Verified",
          decisionId: DECISION_IDS.supplier,
          displayId: "D-4102",
          seed: "recover",
          status: "do",
        },
      ],
    },
  },
};

export function briefForSeed(seed: LabSeed): ServiceBriefModel {
  return seed === "recover" ? RECOVER_BRIEF : SERVICE_BRIEF;
}

export function defaultPacketForRole(
  role: "gm" | "cfo" | "clevel",
): BriefPacket {
  if (role === "cfo") return "cfo";
  if (role === "clevel") return "gm";
  return "gm";
}
