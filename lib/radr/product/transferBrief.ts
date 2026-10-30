/**
 * Estate transfer comparison briefs — Learn from the estate → Compare.
 * Not blind best-store copy. Source ≠ target. Transferability explicit.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";

export type TransferFuture = {
  id: string;
  title: string;
  expectedMonthlyEuro: number;
  note: string;
  isNoAction?: boolean;
};

export type TransferBrief = {
  id: string;
  pattern: string;
  sourceLabel: string;
  targetLabel: string;
  transferability: "HIGH" | "MEDIUM" | "LOW";
  sourceEvidence: string[];
  targetFit: string[];
  differences: string[];
  futures: TransferFuture[];
  decisionHref?: string;
};

const BRIEFS: Record<string, TransferBrief> = {
  xfer_wine_hamburg: {
    id: "xfer_wine_hamburg",
    pattern: "Wine attach rate playbook",
    sourceLabel: "Roma Norte · Mexico City",
    targetLabel: "Soho · New York",
    transferability: "HIGH",
    sourceEvidence: [
      "+9.4pp wine attach across 18 comparable dinner services",
      "No ticket-time penalty observed",
      "Verified contribution lift on attach nights",
    ],
    targetFit: [
      "Similar dinner mix and price level",
      "Cold-station capacity available off absolute peak",
      "Wine list depth already in place",
    ],
    differences: [
      "Guest mix slightly more delivery-heavy in Berlin",
      "Menu composition: more signature hot dishes",
      "Staff selling behavior not yet coached on attach",
    ],
    futures: [
      {
        id: "nothing",
        title: "Do nothing",
        expectedMonthlyEuro: 0,
        note: "Attach stays at Berlin baseline",
        isNoAction: true,
      },
      {
        id: "test_2w",
        title: "Run 2-week controlled test",
        expectedMonthlyEuro: 620,
        note: "Floor briefing + feature pairing · measure attach + ticket time",
      },
      {
        id: "rollout",
        title: "Full rollout",
        expectedMonthlyEuro: 1240,
        note: "Playbook V1 across dinner services after test clears",
      },
    ],
    decisionHref: `/app/decisions/${DECISION_IDS.playbook}`,
  },
  xfer_delivery_throttle: {
    id: "xfer_delivery_throttle",
    pattern: "Throttle delivery 19:30–20:30 under kitchen pressure",
    sourceLabel: "Roma Norte · Mexico City",
    targetLabel: "West Hollywood · Los Angeles",
    transferability: "HIGH",
    sourceEvidence: [
      "Refund rate −0.6pp after throttle on comparable Fridays",
      "Kitchen load stayed below break threshold",
    ],
    targetFit: [
      "Similar Friday pressure profile already detected",
      "Delivery share elevated in the same window",
    ],
    differences: [
      "Kreuzberg delivery mix slightly higher",
      "Staffing buffer thinner on hot stations",
    ],
    futures: [
      {
        id: "nothing",
        title: "Do nothing",
        expectedMonthlyEuro: 0,
        note: "Pressure window repeats",
        isNoAction: true,
      },
      {
        id: "test_2w",
        title: "Run 2-week controlled test",
        expectedMonthlyEuro: 445,
        note: "Throttle 19:30–20:30 · watch refunds + ticket time",
      },
      {
        id: "rollout",
        title: "Full rollout",
        expectedMonthlyEuro: 890,
        note: "Standing Friday rule after verification",
      },
    ],
    decisionHref: `/app/decisions/${DECISION_IDS.labor}`,
  },
  xfer_frankfurt_menu: {
    id: "xfer_frankfurt_menu",
    pattern: "Premium casual lunch mix",
    sourceLabel: "Tanjong Pagar · Singapore",
    targetLabel: "Jardins · São Paulo",
    transferability: "LOW",
    sourceEvidence: ["Lunch mix works under Düsseldorf guest profile"],
    targetFit: ["Price band overlaps"],
    differences: [
      "Different guest mix",
      "Frankfurt under procurement shock — cost structure not shared",
    ],
    futures: [
      {
        id: "nothing",
        title: "Do nothing",
        expectedMonthlyEuro: 0,
        note: "Not comparable — do not transfer blind",
        isNoAction: true,
      },
    ],
    decisionHref: `/app/decisions/${DECISION_IDS.playbook}`,
  },
  xfer_canal_direct: {
    id: "xfer_canal_direct",
    pattern: "Direct-hold premium inventory on comparable pickup windows",
    sourceLabel: "Mercer House · New York",
    targetLabel: "Amsterdam Harbour",
    transferability: "HIGH",
    sourceEvidence: [
      "Protected contribution across 8 comparable windows",
      "Direct share held without ADR collapse",
    ],
    targetFit: [
      "Similar Design Week–style demand",
      "Boutique city format",
    ],
    differences: ["Harbour has slightly higher OTA mix"],
    futures: [
      {
        id: "nothing",
        title: "Do nothing",
        expectedMonthlyEuro: 0,
        note: "OTA share drifts",
        isNoAction: true,
      },
      {
        id: "test_2w",
        title: "Run 2-week controlled test",
        expectedMonthlyEuro: 920,
        note: "Hold premium inventory · measure direct share",
      },
      {
        id: "rollout",
        title: "Full rollout",
        expectedMonthlyEuro: 1840,
        note: "Standing hold rule on comparable pickup",
      },
    ],
    decisionHref: `/app/decisions/${DECISION_IDS.ota}`,
  },
  xfer_hk_reprio: {
    id: "xfer_hk_reprio",
    pattern: "Housekeeping reprioritization before arrival wave",
    sourceLabel: "Mercer House · New York",
    targetLabel: "Schiphol Gate",
    transferability: "MEDIUM",
    sourceEvidence: ["Readiness miss rate improved after reassignment"],
    targetFit: ["Comparable arrival bunching"],
    differences: ["Gate property has shorter HK buffer"],
    futures: [
      {
        id: "nothing",
        title: "Do nothing",
        expectedMonthlyEuro: 0,
        note: "Misses repeat on bunching days",
        isNoAction: true,
      },
      {
        id: "test_2w",
        title: "Run 2-week controlled test",
        expectedMonthlyEuro: 480,
        note: "Reprio before wave · measure readiness",
      },
      {
        id: "rollout",
        title: "Full rollout",
        expectedMonthlyEuro: 960,
        note: "Standing HK sequencing after verify",
      },
    ],
    decisionHref: `/app/decisions/${HOTEL_DECISION_IDS.readiness}`,
  },
};

export function getTransferBrief(transferId: string | null | undefined): TransferBrief | null {
  if (!transferId) return null;
  return BRIEFS[transferId] ?? null;
}
