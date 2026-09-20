/**
 * Intelligence demo registry — Operating States + lens Decisions.
 * All economics come from CanonDecision. Do not hardcode money in components.
 */

import {
  CANON_MENU_PEAK,
  CANON_LABOR,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_SUPPLIER,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import type {
  EconomicTerritory,
  OperatingState,
} from "@/lib/radr/intelligence";

export type TerritoryRouteId = "buy" | "labor" | "sell" | "recover";

export const TERRITORY_ROUTE: Record<
  TerritoryRouteId,
  { path: string; code: EconomicTerritory; decision: CanonDecision }
> = {
  buy: {
    path: "/solutions/buy",
    code: "BUY",
    decision: CANON_SUPPLIER,
  },
  labor: {
    path: "/solutions/labor",
    code: "LABOR",
    decision: CANON_LABOR,
  },
  sell: {
    path: "/solutions/sell",
    code: "SELL",
    decision: CANON_OTA,
  },
  recover: {
    path: "/solutions/recover",
    code: "RECOVER",
    decision: CANON_ORPHAN,
  },
};

/** Flagship Intelligence landing story — cross-domain D-7110 (not a second ID). */
export const INTELLIGENCE_CROSS_DOMAIN = CANON_MENU_PEAK;

export const OPERATING_STATE_BESTSELLER: OperatingState = {
  scope: "Berlin Mitte · dinner service",
  horizon: "SERVICE",
  timestamp: "18:52",
  demand: {
    bestsellerRank: 1,
    dishVelocity: "Highest",
  },
  capacity: {
    kitchenUtilization: "94%",
    peakWindow: "19:00–20:30",
    coldStation: "~96% projected",
  },
  economics: {
    ingredientCostDelta: "+8%",
    kitchenMinutesVsPeers: "+21%",
    contributionPerKitchenMinute: "−18%",
    ticketDelay: "+4 min",
  },
  procurement: {
    proteinCost: "+8%",
  },
  labor: {
    dishKitchenMinutes: "+21% vs peers · cold station",
  },
  stateSentence:
    "Expected peak demand for Tuna Tataki exceeds the contribution return on scarce cold-station minutes under current cost and ticket-time pressure.",
  evidence: [
    { source: "Supplier / invoice", freshness: "2 days", kind: "OBSERVED" },
    { source: "Recipe / BOM", freshness: "Contract", kind: "OBSERVED" },
    { source: "KDS", freshness: "Live", kind: "OBSERVED" },
    { source: "POS velocity", freshness: "2m", kind: "OBSERVED" },
    { source: "Kitchen / cold station", freshness: "Live", kind: "OBSERVED" },
    { source: "Operating Memory", freshness: "12 services", kind: "OBSERVED" },
  ],
  missingData: [],
  qualityFlags: [],
};

export const OPERATING_STATES: Record<TerritoryRouteId, OperatingState> = {
  buy: {
    scope: "Berlin Mitte · procurement week",
    horizon: "TACTICAL",
    timestamp: "Tue 09:40",
    procurement: {
      contract: "€6.80 / L",
      invoice: "€7.45 / L",
      delivered: "420 L",
      variance: "€273",
    },
    economics: {
      usage: "+4%",
      menuPrice: "Unchanged",
      dishContribution: "−13.2%",
    },
    stateSentence:
      "Invoice unit price exceeds contract while usage is up and menu price is unchanged — dish contribution is compressing, not only AP variance.",
    evidence: CANON_SUPPLIER.sources.map((s) => ({
      source: s.name,
      freshness: s.freshness,
      kind: "OBSERVED" as const,
    })),
  },
  labor: {
    scope: "Berlin Mitte · pre-peak",
    horizon: "SERVICE",
    timestamp: "16:45",
    demand: { expectedCovers: 142, delivery: "Open" },
    capacity: { kitchenLoad: "94%", fohPressure: "Rising" },
    labor: { agencyOption: "Available", rebalance: "1 FOH → bar" },
    stateSentence:
      "Expected order demand over the next service window exceeds effective kitchen capacity under the current delivery and reservation mix — FOH is not the bottleneck.",
    evidence: CANON_LABOR.sources.map((s) => ({
      source: s.name,
      freshness: s.freshness,
      kind: "OBSERVED" as const,
    })),
  },
  sell: {
    scope: "Canal House · high-demand night",
    horizon: "DAILY",
    timestamp: "09:12",
    demand: { occupancy: "89%", directPickup: "Ahead", otaShare: "+11 pts" },
    capacity: { premiumLeft: "4 ready", housekeeping: "Ready" },
    channelMix: { ota: "Elevated", direct: "Strong pace" },
    economics: { contributionAtRisk: CANON_OTA.exposureEuro },
    externalContext: { cityEvent: "Inbound" },
    stateSentence:
      "Occupancy looks healthy, but accepting OTA demand now displaces higher-contribution direct demand on scarce premium inventory.",
    evidence: CANON_OTA.sources.map((s) => ({
      source: s.name,
      freshness: s.freshness,
      kind: "OBSERVED" as const,
    })),
  },
  recover: {
    scope: "Chiado · orphan night",
    horizon: "DAILY",
    timestamp: "11:05",
    demand: { gap: "Unit 24 · one night", losDemand: "In-band" },
    economics: {
      takeNowNet: 78,
      waitExpectedNet: CANON_ORPHAN.expectedProtectedEuro,
      grossOpportunity: CANON_ORPHAN.exposureEuro,
    },
    capacity: { cleaningAbsorbed: "Yes", nextStay: "Booked" },
    stateSentence:
      "Orphan night recoverability is decaying — waiting for longer direct demand still beats take-now on expected net contribution.",
    evidence: CANON_ORPHAN.sources.map((s) => ({
      source: s.name,
      freshness: s.freshness,
      kind: "OBSERVED" as const,
    })),
    qualityFlags: ["Housekeeping feed 41 min stale"],
  },
};

export function decisionForRoute(id: TerritoryRouteId): CanonDecision {
  return TERRITORY_ROUTE[id].decision;
}

export function primaryTerritory(d: CanonDecision): EconomicTerritory {
  return d.territories[0] ?? "SELL";
}

/** Decision-quality narrative — resting state beats per demo. */
export type DecisionNarrative = {
  lookedNormal: string;
  obvious: string;
  climax: string;
  /** Short RADR counter-line (visual). */
  radrLine: string;
  deadline: string;
  expectedEuro: number;
  observedEuro: number;
  verifiedEuro: number;
  learned: string;
  /** Optional split causes (BUY). */
  priceEffect?: string;
  usageEffect?: string;
};

export const NARRATIVE_BY_DECISION: Record<string, DecisionNarrative> = {
  [CANON_MENU_PEAK.id]: {
    lookedNormal: "Tuna Tataki · menu-engineering STAR.",
    obvious: "Keep featuring the star.",
    climax: "Not during peak — cold-station minutes are scarce.",
    radrLine: "19:00–20:30 · de-emphasize · feature faster high-€/min · restore after",
    deadline: "Before 19:00",
    expectedEuro: 680,
    observedEuro: 610,
    verifiedEuro: 610,
    learned: "Peak de-emphasize when cold station ≥90% and dish €/min weak.",
  },
  [CANON_SUPPLIER.id]: {
    lookedNormal: "Invoice variance · AP can reconcile later.",
    obvious: "Reprice the menu — or just dispute and move on.",
    climax: "The invoice was the clue. The margin leak was the problem.",
    radrLine:
      "Dispute variance · hold next above-contract PO · check yield · do not reprice yet",
    deadline: "This week",
    expectedEuro: 273,
    observedEuro: 273,
    verifiedEuro: 273,
    learned: "Variance + usage watch before menu reprice.",
    priceEffect: "€273 current supplier variance",
    usageEffect: "Usage +4% · additional contribution pressure",
  },
  [CANON_LABOR.id]: {
    lookedNormal: "Service pressure rising · FOH looks tight.",
    obvious: "Add FOH / agency.",
    climax: "Kitchen is the bottleneck — more FOH feeds it.",
    radrLine: "Do not add agency · move 1 FOH to bar · throttle delivery 25m",
    deadline: "16:45",
    expectedEuro: 720,
    observedEuro: 690,
    verifiedEuro: 662,
    learned: "Do-not-add-FOH when kitchen ≥90% on Thursday peaks.",
  },
  [CANON_OTA.id]: {
    lookedNormal: "89% occupancy · release remaining to OTA.",
    obvious: "Fill now — or raise rate.",
    climax: "Scarce premium inventory wants higher-contribution demand.",
    radrLine: "Hold 4 premium rooms direct 72h — not rate lift",
    deadline: "Before noon",
    expectedEuro: 3100,
    observedEuro: 2960,
    verifiedEuro: 2840,
    learned: "Hold premium direct 72h on high-demand dates.",
  },
  [CANON_ORPHAN.id]: {
    lookedNormal: "Orphan night · a booking is available.",
    obvious: "Fill it now.",
    climax: "Wait — expected net still beats take-now.",
    radrLine: "Wait · protect direct / LOS · reject low-quality fill",
    deadline: "This morning",
    expectedEuro: CANON_ORPHAN.expectedProtectedEuro,
    observedEuro: CANON_ORPHAN.observedContributionEuro ?? CANON_ORPHAN.actualProtectedEuro,
    verifiedEuro:
      CANON_ORPHAN.verifiedIncrementalEuro ?? CANON_ORPHAN.actualProtectedEuro,
    learned: "Orphan gaps: hold direct until T−30h when LOS in-band.",
  },
};

export function narrativeFor(d: CanonDecision): DecisionNarrative {
  return (
    NARRATIVE_BY_DECISION[d.id] ?? {
      lookedNormal: d.problemLine.split("\n")[0] ?? d.title,
      obvious: "Take the obvious operational response.",
      climax: d.understand,
      radrLine: d.prepared,
      deadline: d.deadline,
      expectedEuro: d.expectedProtectedEuro,
      observedEuro: d.actualProtectedEuro,
      verifiedEuro: d.actualProtectedEuro,
      learned: d.learning.playbookTo,
    }
  );
}
