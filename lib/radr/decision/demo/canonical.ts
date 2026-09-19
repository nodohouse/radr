/**
 * Canonical demo Decisions — single source of truth for website + product demos.
 * All surfaces must read economics from here (or from Decision Records built from here).
 *
 * Economic semantic types (use these labels in UI — never vague “value / saved / expected” alone):
 * - EXPOSURE / OPPORTUNITY — at stake if no action
 * - RATE — nightly / unit price (NOT Verified Value)
 * - EXPECTED CONTRIBUTION — modeled net contribution of a scenario
 * - EXPECTED PROTECTED / RECOVERED / CREATED / AVOIDED — expected of chosen kind
 * - OBSERVED CONTRIBUTION — after the window
 * - VERIFIED PROTECTED / RECOVERED / CREATED / AVOIDED — reconciled Verified Value
 *
 * Rate ≠ contribution. Never label a room/unit rate as Protected / Verified Value.
 */

import { DECISION_IDS } from "../ids";
import type {
  AttributionStrength,
  CapabilityHonesty,
  ConfidenceBand,
  DecisionHorizon,
  DecisionScope,
  DetectionType,
  EconomicTerritory,
} from "@/lib/radr/intelligence";
import type { ScenarioValue } from "../economics/scenarioValue";
import type { ScenarioEconomicMetric } from "../counterfactual";

export type CanonScenario = {
  id: string;
  title: string;
  /**
   * Modeled contribution for this scenario when a single comparable euro exists.
   * Prefer `economicMetrics` for public surfaces. Omit when not modeled.
   */
  expectedContributionEuro?: number;
  /** Multi-metric economics — never invent €0 for absent projections. */
  economicMetrics?: ScenarioEconomicMetric[];
  /** When no numeric metric exists. */
  economicEffectNote?: string;
  /** CFO-grade labeling — prefer on every public scenario. */
  value?: ScenarioValue;
  operationalRisk: "low" | "medium" | "high";
  /** Explicit severity — do not use as the main-risk sentence. */
  riskLevel?: "low" | "medium" | "high";
  /** Human-readable primary risk of choosing this scenario. */
  mainRiskDescription?: string;
  guestImpact: "none" | "low" | "medium" | "high";
  confidence: number;
  note: string;
  recommended?: boolean;
  isNoAction?: boolean;
};

export type CanonEvidence = {
  label: string;
  value: string;
  source?: string;
  freshness?: string;
  kind?: "OBSERVED" | "ESTIMATED" | "PREDICTED";
};

/** Optional per-unit channel illustration (hotel). Never multiply into block protected. */
export type CanonUnitEconomics = {
  otaPath: {
    grossRoomRevenue: number;
    channelCost: number;
    fulfillment: number;
    expectedContribution: number;
    scope: string;
    horizon: string;
  };
  directPath: {
    expectedRate: number;
    acquisitionCost: number;
    fulfillment: number;
    expectedContribution: number;
    scope: string;
    horizon: string;
  };
  /** Explicit: unit path ≠ block expected protected. */
  blockNote: string;
};

export type CanonDecision = {
  id: string;
  displayId: string;
  vertical: "restaurant" | "hotel" | "apartment";
  property: string;
  title: string;
  problemLine: string;
  /**
   * Economic lenses this Decision belongs to.
   * Primary lens first. Cross-domain Decisions list multiple.
   */
  territories: EconomicTerritory[];
  detectionType: DetectionType;
  horizon: DecisionHorizon;
  scope: DecisionScope;
  /** EXPOSURE / OPPORTUNITY at stake if no action. */
  exposureEuro: number;
  /** Recommended rate when the Decision sets a price — never Verified Value. */
  recommendedRateEuro?: number;
  deadline: string;
  selloutAt?: string;
  /** Relationship math for Intelligence pages. */
  connect: string;
  /** Non-obvious understanding — why the obvious move fails. */
  understand: string;
  /** What RADR prepared (not a task list). */
  prepared: string;
  scenarios: CanonScenario[];
  chosenScenarioId: string;
  /**
   * Expected amount of the chosen scenario.
   * For orphan (recovered): expected NET CONTRIBUTION (not “expected protected”).
   * For channel hold (protected): EXPECTED PROTECTED vs baseline.
   */
  expectedProtectedEuro: number;
  /**
   * Post-window amount of the chosen kind when incremental;
   * for orphan use observedContributionEuro for absolute observed net.
   */
  actualProtectedEuro: number;
  /**
   * Absolute observed net contribution when actualProtectedEuro is
   * incremental Verified Value (e.g. orphan night €118 observed · €40 verified vs take-now).
   */
  observedContributionEuro?: number;
  /** Counterfactual contribution used for incremental Verified Value. */
  counterfactualContributionEuro?: number;
  /** Explicit verified incremental when different from actualProtectedEuro. */
  verifiedIncrementalEuro?: number;
  verifiedKind: "protected" | "recovered" | "created" | "avoided";
  /** Hotel unit-path illustration — scope ≠ block Decision economics. */
  unitEconomics?: CanonUnitEconomics;
  attributionStrength: AttributionStrength;
  forecastVarianceEuro: number;
  forecastVariancePct: number;
  verificationSources: string[];
  sources: { name: string; freshness: string }[];
  decisionConfidence: ConfidenceBand;
  evidenceCoverage?: string;
  honesty: CapabilityHonesty;
  learning: {
    predictedConversionPct?: number;
    actualConversionPct?: number;
    lesson: string;
    playbookFrom: string;
    playbookTo: string;
    nextTimeImpact: string;
  };
  structural?: {
    displayId: string;
    incidents: number;
    window: number;
    cumulativeExposureEuro: number;
    temporaryFixes: number;
    recommendation: string;
  };
  evidence: CanonEvidence[];
};

/** D-1842 — restaurant tuna / supplier stock (demo library — not flagship). */
export const CANON_TUNA: CanonDecision = {
  id: DECISION_IDS.tuna,
  displayId: "D-1842",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Tuna Tataki shortfall before peak",
  problemLine:
    "Tuna Tataki is tonight’s bestseller.\n6 portions short for peak.\nThe obvious move is a rush order — RADR models why not.",
  territories: ["BUY", "SELL", "LABOR"],
  detectionType: "EXPOSURE",
  horizon: "SERVICE",
  scope: "ITEM",
  connect: "Portions × expected demand × kitchen load × substitute acceptance × rush premium",
  understand: "Rush protects volume but feeds a 91% kitchen. Feature-swap uses stock and reduces pressure — higher expected contribution.",
  prepared: "Feature Truffle Pasta first · supplier fallback prepared.",
  exposureEuro: 1840,
  deadline: "17:15",
  selloutAt: "20:10",
  scenarios: [
    {
      id: "do_nothing",
      title: "Do nothing",
      expectedContributionEuro: -1840,
      operationalRisk: "high",
      guestImpact: "high",
      confidence: 90,
      note: "Sellout ~20:10",
      isNoAction: true,
    },
    {
      id: "supplier_first",
      title: "Rush 6 portions",
      expectedContributionEuro: 1520,
      operationalRisk: "medium",
      guestImpact: "none",
      confidence: 74,
      note: "Protects volume · rush premium · kitchen 91% · lower net contribution",
    },
    {
      id: "feature_swap",
      title: "Feature Truffle Pasta first",
      expectedContributionEuro: 1640,
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 81,
      note: "Uses stock · reduces kitchen pressure · 71% substitute · supplier fallback",
      recommended: true,
    },
  ],
  chosenScenarioId: "feature_swap",
  expectedProtectedEuro: 1640,
  actualProtectedEuro: 1590,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "Inventory", freshness: "Live" },
    { name: "POS / demand", freshness: "2m" },
    { name: "KDS", freshness: "Live" },
    { name: "Supplier", freshness: "15m" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -50,
  forecastVariancePct: -3.0,
  verificationSources: [
    "POS close",
    "Inventory event",
    "Supplier event",
    "Kitchen load",
  ],
  learning: {
    predictedConversionPct: 64,
    actualConversionPct: 71,
    lesson:
      "Without memory: rush 6 portions. With 11 comparable services: feature swap first outperformed the rush.",
    playbookFrom: "Rush order first → substitute fallback",
    playbookTo: "Feature swap first → supplier fallback",
    nextTimeImpact:
      "Next similar service: feature-swap-first receives higher priority than rush.",
  },
  structural: {
    displayId: "D-1842-S",
    incidents: 7,
    window: 12,
    cumulativeExposureEuro: 8420,
    temporaryFixes: 5,
    recommendation:
      "Review backup supplier · par level · menu dependency",
  },
  evidence: [
    { label: "Portions on hand", value: "31" },
    { label: "Expected demand", value: "37 portions" },
    { label: "Shortfall", value: "6 portions" },
    { label: "Kitchen utilization", value: "91%" },
    { label: "Substitute acceptance", value: "71%" },
    { label: "Rush path expected contribution", value: "€1,520" },
    { label: "Feature-swap expected contribution", value: "€1,640" },
  ],
};

/**
 * D-1911 — Peak capacity collision (flagship restaurant Decision).
 * Empty tables ≠ available capacity. Cross-system: reservations × KDS ×
 * delivery × menu economics × table turns.
 */
export const CANON_PEAK: CanonDecision = {
  id: DECISION_IDS.peak,
  displayId: "D-1911",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Peak capacity collision",
  problemLine:
    "Dining room 78% occupied. Walk-ins waiting.\nThe obvious move is seat them — RADR holds 12 minutes.",
  territories: ["SELL", "LABOR"],
  detectionType: "EXPOSURE",
  horizon: "REAL_TIME",
  scope: "SERVICE",
  connect: "Inbound covers × KDS ticket time × kitchen capacity × delivery × table turns",
  understand: "Empty tables are not free capacity when kitchen ≥90% and 38 covers are inbound. Seating now destroys second-turn contribution.",
  prepared: "Hold 2 tables 12m · throttle delivery · feature fast dish · resume 18:54.",
  exposureEuro: 620,
  deadline: "18:53",
  scenarios: [
    {
      id: "seat_now",
      title: "Seat walk-ins now",
      expectedContributionEuro: 0,
      economicMetrics: [
        {
          type: "INCREMENTAL_CONTRIBUTION",
          value: 0,
          currency: "EUR",
          label: "Baseline · no incremental contribution vs wait path",
          baseline: "vs wait-12 path",
          scope: "Peak service · Berlin Mitte",
          horizon: "tonight",
          status: "EXPECTED",
        },
      ],
      value: {
        amount: 0,
        currency: "EUR",
        metricType: "INCREMENTAL_CONTRIBUTION",
        scope: "Peak service · Berlin Mitte",
        horizon: "tonight",
        comparedTo: "vs wait-12 path (baseline / cost of seating now)",
        label: "Baseline · no incremental contribution vs wait path",
        baselineId: "wait_12",
      },
      operationalRisk: "high",
      riskLevel: "high",
      mainRiskDescription:
        "Kitchen overload destroys second-turn contribution and guest experience",
      guestImpact: "medium",
      confidence: 86,
      note: "Immediate covers · kitchen →97% · tickets >17m · second turns slip · comps ↑ · baseline",
      isNoAction: true,
    },
    {
      id: "hard_stop",
      title: "Refuse walk-ins · kill delivery",
      expectedContributionEuro: 180,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 180,
          currency: "EUR",
          label: "Expected incremental contribution",
          baseline: "vs seat-now",
          scope: "Peak service · Berlin Mitte",
          horizon: "tonight",
          status: "EXPECTED",
        },
      ],
      value: {
        amount: 180,
        currency: "EUR",
        metricType: "INCREMENTAL_CONTRIBUTION",
        scope: "Peak service · Berlin Mitte",
        horizon: "tonight",
        comparedTo: "vs seat-now",
        label: "Expected incremental contribution",
        baselineId: "seat_now",
      },
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription:
        "Guest experience and reputation damage from refusing demand",
      guestImpact: "high",
      confidence: 70,
      note: "Protects kitchen · over-corrects guest experience · underfills room",
    },
    {
      id: "wait_12",
      title: "Wait 12 min · throttle · feature",
      expectedContributionEuro: 620,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 620,
          currency: "EUR",
          label: "Expected incremental contribution",
          baseline: "vs seat-now",
          scope: "Tonight's dinner service · Berlin Mitte",
          horizon: "tonight · decide by 18:53",
          status: "EXPECTED",
        },
      ],
      value: {
        amount: 620,
        currency: "EUR",
        metricType: "EXPECTED_INCREMENTAL_CONTRIBUTION",
        scope: "Tonight's dinner service · Berlin Mitte",
        horizon: "tonight · decide by 18:53",
        comparedTo: "vs seat-now",
        label: "Expected incremental contribution",
        baselineId: "seat_now",
      },
      operationalRisk: "low",
      riskLevel: "low",
      mainRiskDescription: "Walk-in abandonment during the 12-minute hold",
      guestImpact: "low",
      confidence: 78,
      note: "+€620 expected incremental contribution vs seat-now · hold 2 tables · throttle delivery · feature fast dish · resume 18:54",
      recommended: true,
    },
  ],
  chosenScenarioId: "wait_12",
  expectedProtectedEuro: 620,
  actualProtectedEuro: 590,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "Reservations", freshness: "Live" },
    { name: "KDS", freshness: "Live" },
    { name: "Delivery", freshness: "5m" },
    { name: "POS / menu", freshness: "2m" },
    { name: "Table management", freshness: "Live" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -30,
  forecastVariancePct: -4.8,
  verificationSources: [
    "Reservations inbound",
    "KDS ticket times",
    "Delivery intake",
    "POS / menu velocity",
    "Table management turns",
  ],
  learning: {
    lesson:
      "Holding two walk-in tables for 12 minutes protected second turns better than seating into a 92% kitchen with inbound covers.",
    playbookFrom: "Seat empty tables whenever walk-ins wait",
    playbookTo:
      "When kitchen ≥90% and ≥30 covers inbound <25m: hold walk-ins · throttle delivery · feature high €/min dish",
    nextTimeImpact:
      "Peak collision: wait-then-resume ranked ahead of seat-now when ticket time rising.",
  },
  structural: {
    displayId: "D-1911-S",
    incidents: 5,
    window: 12,
    cumulativeExposureEuro: 3100,
    temporaryFixes: 4,
    recommendation:
      "Codify peak hold when kitchen ≥90% and inbound ≥30 covers in <25m",
  },
  evidence: [
    { label: "Floor occupancy", value: "78%" },
    { label: "Reservations inbound · 22 min", value: "38 covers" },
    { label: "KDS ticket time", value: "14 min ↑" },
    { label: "Kitchen modeled capacity", value: "92%" },
    { label: "Delivery vs plan", value: "+31%" },
    { label: "Second-turn tables at risk", value: "9" },
    { label: "Seat-now", value: "€0 incremental vs wait path · not €0 total covers" },
    { label: "Wait-12 expected protected", value: "+€620 vs seat-now · tonight" },
    { label: "Expected vs seat-now", value: "+€620" },
    { label: "History · load >94% >15m", value: "tickets ≥17m · comps ↑" },
  ],
};

/** D-2201 — hotel channel mix. */
export const CANON_OTA: CanonDecision = {
  id: DECISION_IDS.ota,
  displayId: "D-2201",
  vertical: "hotel",
  property: "Canal House · Amsterdam",
  title: "Channel mix on a high-demand night",
  problemLine:
    "89% occupancy looks excellent.\nThe obvious move is release remaining to OTA — RADR holds premium direct instead.",
  territories: ["SELL"],
  detectionType: "OPPORTUNITY",
  horizon: "DAILY",
  scope: "ROOM",
  connect: "Occupancy × channel mix × direct pace × housekeeping × events",
  understand:
    "Scarce premium inventory + direct pickup + event demand makes the hold economically stronger than OTA fill. Not maximizing occupancy — allocating scarce demand capacity.",
  prepared: "Hold 4 premium rooms direct 72h — not rate lift.",
  exposureEuro: 4200,
  deadline: "Before noon",
  scenarios: [
    {
      id: "do_nothing",
      title: "Release to OTA now",
      expectedContributionEuro: 0,
      value: {
        amount: 0,
        currency: "EUR",
        metricType: "INCREMENTAL_CONTRIBUTION",
        scope: "Remaining 4 premium rooms",
        horizon: "72h",
        comparedTo: "vs hold-direct allocation (baseline)",
        label: "€0 incremental contribution vs hold path",
        baselineId: "hold_72h",
      },
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 88,
      note: "Obvious fill · commission drag stands · not €0 room revenue",
      isNoAction: true,
    },
    {
      id: "soft_cap",
      title: "Raise rate",
      expectedContributionEuro: 1800,
      value: {
        amount: 1800,
        currency: "EUR",
        metricType: "EXPECTED_PROTECTED",
        scope: "Remaining 4 premium rooms",
        horizon: "72h",
        comparedTo: "vs current OTA allocation baseline",
        label: "Expected protected contribution vs OTA release",
        baselineId: "do_nothing",
      },
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 70,
      note: "Looks like demand pricing · weakens direct mix further",
    },
    {
      id: "hold_72h",
      title: "Hold premium direct 72h",
      expectedContributionEuro: 3100,
      value: {
        amount: 3100,
        currency: "EUR",
        metricType: "EXPECTED_PROTECTED",
        scope: "Remaining 4 premium rooms · Canal House",
        horizon: "72h",
        comparedTo: "vs current OTA allocation baseline",
        label: "Expected protected contribution vs OTA release",
        baselineId: "do_nothing",
      },
      operationalRisk: "medium",
      guestImpact: "none",
      confidence: 73,
      note: "Slightly lower fill probability · higher expected contribution",
      recommended: true,
    },
  ],
  chosenScenarioId: "hold_72h",
  expectedProtectedEuro: 3100,
  actualProtectedEuro: 2960,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "PMS · occupancy / inventory", freshness: "Live" },
    { name: "Channel manager · OTA share", freshness: "3m" },
    { name: "Booking engine · direct pickup", freshness: "Live" },
    { name: "Housekeeping readiness", freshness: "12m" },
    { name: "Distribution economics", freshness: "Contract" },
    { name: "City events", freshness: "Daily" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -140,
  forecastVariancePct: -4.5,
  verificationSources: [
    "PMS booking",
    "Channel manager",
    "Booking engine / CRS",
    "Housekeeping state",
    "Payments / settlement",
  ],
  learning: {
    lesson:
      "Direct pickup was slightly weaker than modeled. Hold still outperformed early OTA release.",
    playbookFrom: "Release remaining to OTA",
    playbookTo: "Hold premium direct 72h on high-demand dates",
    nextTimeImpact: "Weekend OTA-mix playbook reinforced with softer direct band.",
  },
  evidence: [
    { label: "PMS occupancy", value: "89%" },
    { label: "Premium room inventory", value: "4 open" },
    { label: "Channel manager · OTA share", value: "+11 pts" },
    { label: "Booking engine · direct pickup", value: "Ahead of pace" },
    { label: "Housekeeping readiness", value: "4 premium ready" },
    { label: "Distribution economics · OTA commission drag", value: "~18%" },
    { label: "City events calendar", value: "Weekend demand spike" },
    { label: "Comparable demand", value: "11 event weekends" },
  ],
  /**
   * Unit path economics (1 premium room · 1 night) — channel quality illustration.
   * Not multiplied into expectedProtectedEuro: the Decision models the remaining
   * block over 72h vs OTA-release baseline (€3,100 expected protected).
   */
  unitEconomics: {
    otaPath: {
      grossRoomRevenue: 420,
      channelCost: -76,
      fulfillment: -38,
      expectedContribution: 306,
      scope: "Expected contribution / premium room",
      horizon: "1 night",
    },
    directPath: {
      expectedRate: 485,
      acquisitionCost: -18,
      fulfillment: -38,
      expectedContribution: 429,
      scope: "Expected contribution / premium room",
      horizon: "1 night",
    },
    blockNote:
      "Unit path = channel quality on one premium room. Block expected protected (€3,100) = remaining 4 premium rooms · 72h · vs OTA release — not 4 × unit delta.",
  },
};

export const CANON_ORPHAN: CanonDecision = {
  id: DECISION_IDS.orphan,
  displayId: "D-3104",
  vertical: "apartment",
  property: "Chiado Collective · Lisbon",
  title: "Orphan night · Unit 24",
  problemLine:
    "T−72h to an orphan night.\nThe obvious move is fill now — RADR waits 24 hours, keeping the unit direct-first.",
  territories: ["RECOVER", "SELL"],
  detectionType: "RECOVERY",
  horizon: "DAILY",
  scope: "UNIT",
  connect: "Orphan night × LOS demand × cleaning × channel cost × next-stay",
  understand: "SELL chooses demand before sale. RECOVER rescues value after the expected path broke — take-now burns net contribution.",
  prepared: "Wait 24 hours · keep unit direct-first. At T−48h release one-night direct at €148 if still open. T−24h reassess / channel fallback.",
  exposureEuro: 164,
  recommendedRateEuro: 148,
  deadline: "T−72h · wait 24h",
  scenarios: [
    {
      id: "do_nothing",
      title: "Leave empty",
      expectedContributionEuro: 0,
      value: {
        amount: 0,
        currency: "EUR",
        metricType: "NET_CONTRIBUTION",
        scope: "Unit 24 · one orphan night",
        horizon: "gap night",
        comparedTo: "night expires empty",
        label: "€0 net contribution if empty",
      },
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 90,
      note: "Night expires empty · €0 recovered contribution",
      isNoAction: true,
    },
    {
      id: "discount_128",
      title: "Fill immediately",
      expectedContributionEuro: 78,
      value: {
        amount: 78,
        currency: "EUR",
        metricType: "NET_CONTRIBUTION",
        scope: "Unit 24 · one orphan night",
        horizon: "immediate fill",
        comparedTo: "vs leave empty · after channel + turnover economics",
        label: "Immediate-fill counterfactual net contribution",
        baselineId: "do_nothing",
      },
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 78,
      note: "Fills the gap · OTA/channel drag · turnover already absorbed · weakens longer-stay probability",
    },
    {
      id: "open_148",
      title: "Wait 24 hours · keep direct-first",
      expectedContributionEuro: 112,
      value: {
        amount: 112,
        currency: "EUR",
        metricType: "NET_CONTRIBUTION",
        scope: "Unit 24 · one orphan night",
        horizon: "wait 24h · then T−48h / T−24h gates",
        comparedTo: "vs immediate-fill €78 net · not vs gross €164",
        label: "Expected net contribution · wait",
        baselineId: "discount_128",
      },
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 64,
      note: "Recommended rate €148 · expected net €112 · T−48h release direct if still open · T−24h reassess",
      recommended: true,
    },
  ],
  chosenScenarioId: "open_148",
  expectedProtectedEuro: 112,
  actualProtectedEuro: 118,
  observedContributionEuro: 118,
  counterfactualContributionEuro: 78,
  verifiedIncrementalEuro: 40,
  verifiedKind: "recovered",
  attributionStrength: "DIRECTLY_VERIFIED",
  sources: [
    { name: "Unit PMS", freshness: "Live" },
    { name: "Channel manager", freshness: "Live" },
    { name: "Housekeeping / turnover", freshness: "41m" },
    { name: "Next-stay calendar", freshness: "Daily" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: 6,
  forecastVariancePct: 5.4,
  verificationSources: [
    "Channel booking",
    "Unit PMS",
    "Housekeeping / turnover",
    "Payments / settlement",
  ],
  learning: {
    lesson:
      "Rejecting the first available fill protected net contribution when turnover was already absorbed and longer direct demand was in-band.",
    playbookFrom: "Fill any orphan gap as soon as a booking appears",
    playbookTo:
      "Model turnover · channel cost · next-stay · LOS probability before accepting one-night fill",
    nextTimeImpact:
      "Orphan playbook prefers wait-for-direct when cleaning is absorbed and next stay is mid-week.",
  },
  evidence: [
    { label: "Gross night value", value: "€164 · not net contribution" },
    { label: "Recommended nightly rate", value: "€148" },
    { label: "Wait · expected net contribution", value: "€112" },
    { label: "Take-now · expected net contribution", value: "€78" },
    { label: "Observed net contribution", value: "€118" },
    {
      label: "Verified incremental vs take-now",
      value: "+€40 · attribution on incremental, not full €118",
    },
    { label: "Value category", value: "recovered (incremental)" },
    { label: "Turnover / cleaning", value: "Already absorbed" },
    { label: "OTA / channel cost on take-now", value: "~18% drag" },
    { label: "Longer direct stay probability", value: "41% in 48h" },
    { label: "Next-stay constraint", value: "Wednesday arrival" },
    { label: "Comparable gaps", value: "17" },
  ],
};

/** D-1920 — labor mismatch at peak. */
export const CANON_LABOR: CanonDecision = {
  id: DECISION_IDS.labor,
  displayId: "D-1920",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Service pressure before peak",
  problemLine:
    "At 18:30 RADR predicts service pressure.\nThe obvious move is add FOH — kitchen is already at 94%. Adding FOH accelerates orders into a bottleneck.",
  territories: ["LABOR", "SELL"],
  detectionType: "EXPOSURE",
  horizon: "SERVICE",
  scope: "DEPARTMENT",
  connect: "Reservations × FOH × kitchen throughput × delivery",
  understand:
    "More FOH → more order injection → longer tickets → lower throughput. Optimize the bottleneck, not headcount.",
  prepared:
    "Do not add agency · move 1 FOH to bar · throttle delivery 25m · restore when kitchen < threshold.",
  exposureEuro: 840,
  deadline: "16:45",
  scenarios: [
    {
      id: "do_nothing",
      title: "Do nothing",
      expectedContributionEuro: -840,
      operationalRisk: "high",
      guestImpact: "high",
      confidence: 88,
      note: "Guest waits compound",
      isNoAction: true,
    },
    {
      id: "agency",
      title: "Add FOH / agency",
      expectedContributionEuro: 410,
      operationalRisk: "high",
      guestImpact: "medium",
      confidence: 70,
      note: "Obvious · feeds kitchen bottleneck · high cost",
    },
    {
      id: "rebalance",
      title: "Move 1 FOH to bar · slow delivery 25m",
      expectedContributionEuro: 720,
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 78,
      note: "Protects waits · kitchen throughput · contribution",
      recommended: true,
    },
  ],
  chosenScenarioId: "rebalance",
  expectedProtectedEuro: 720,
  actualProtectedEuro: 690,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "SevenRooms", freshness: "Live" },
    { name: "Planday", freshness: "15m" },
    { name: "POS", freshness: "2m" },
    { name: "KDS", freshness: "Live" },
    { name: "Delivery", freshness: "5m" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -30,
  forecastVariancePct: -4.2,
  verificationSources: ["POS covers", "Labor schedule", "Kitchen tickets"],
  learning: {
    lesson: "Do-not-add-FOH when kitchen ≥90% beats agency on Thursday peaks.",
    playbookFrom: "Agency / add FOH first",
    playbookTo: "Rebalance FOH to bar · slow delivery release",
    nextTimeImpact: "Thursday peak: rebalance before adding heads.",
  },
  evidence: [
    { label: "Expected covers", value: "142" },
    { label: "Kitchen capacity", value: "94%" },
    { label: "Add-FOH path", value: "€410 expected" },
    { label: "Rebalance path", value: "€720 expected" },
  ],
};

/** D-4102 — supplier invoice variance + dish economics (BUY lens). */
export const CANON_SUPPLIER: CanonDecision = {
  id: DECISION_IDS.supplier,
  displayId: "D-4102",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Contract vs invoice · contribution compression",
  problemLine:
    "Supplier unit price +9.6%.\nInvoice variance €273 is the clue — dish contribution compressed 13.2% with menu price unchanged.",
  territories: ["BUY", "SELL"],
  detectionType: "LEAKAGE",
  horizon: "TACTICAL",
  scope: "ITEM",
  connect: "Contract × invoice × delivery × usage × menu",
  understand:
    "This is not purely a menu-pricing problem. Price effect (€273 variance) and usage effect (+4%) are separate — normalize input cost before reprice.",
  prepared:
    "Dispute variance · hold next above-contract PO · check yield · do not reprice menu yet.",
  exposureEuro: 273,
  deadline: "This week",
  scenarios: [
    {
      id: "do_nothing",
      title: "Pay as invoiced",
      economicMetrics: [
        {
          type: "SUPPLIER_VARIANCE",
          value: 273,
          currency: "EUR",
          label: "Supplier variance remains exposed",
          scope: "Current invoice",
          status: "EXPOSED",
        },
      ],
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 95,
      note: "Drift compounds · contribution keeps compressing",
      isNoAction: true,
    },
    {
      id: "reprice_now",
      title: "Reprice menu now",
      economicEffectNote: "Economic effect not yet modeled",
      operationalRisk: "medium",
      guestImpact: "medium",
      confidence: 58,
      note: "Does not resolve source of variance · guest / demand trade-off · not recommended yet",
    },
    {
      id: "query",
      title: "Dispute + check yield",
      economicMetrics: [
        {
          type: "SUPPLIER_VARIANCE",
          value: 273,
          currency: "EUR",
          label: "Potentially recoverable variance",
          scope: "Current invoice",
          status: "POTENTIAL",
          baseline: "Outcome pending credit / yield check",
        },
      ],
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 82,
      note: "Supplier variance challenged · next exception held · usage / yield investigated · no menu reprice yet",
      recommended: true,
    },
  ],
  chosenScenarioId: "query",
  /** Not an “expected recovered” figure — exposure / variance only until credit lands. */
  expectedProtectedEuro: 0,
  actualProtectedEuro: 0,
  verifiedKind: "recovered",
  attributionStrength: "MODELED",
  sources: [
    { name: "Contract", freshness: "08:12" },
    { name: "Invoice", freshness: "2 days" },
    { name: "Delivery note", freshness: "2 days" },
    { name: "Usage / inventory", freshness: "Live" },
    { name: "Recipe / POS", freshness: "Live" },
    { name: "AP", freshness: "Daily" },
  ],
  decisionConfidence: "HIGH",
  honesty: "DEMO",
  forecastVarianceEuro: 0,
  forecastVariancePct: 0,
  verificationSources: [
    "Contract",
    "Invoice line",
    "Delivery note",
    "AP credit",
    "Usage / yield",
    "Menu / POS contribution",
  ],
  learning: {
    lesson:
      "Credit received and unit price normalized; usage pressure remained — menu reprice still deferred.",
    playbookFrom: "Dispute invoice · or reprice menu immediately",
    playbookTo:
      "Dispute variance · hold above-contract PO · check yield before any menu reprice",
    nextTimeImpact:
      "Variance + usage watch gate before menu economics change.",
  },
  evidence: [
    { label: "Contract", value: "€6.80/L" },
    { label: "Invoice", value: "€7.45/L · 420 L" },
    { label: "Price effect · invoice variance", value: "€273" },
    { label: "Unit price", value: "+9.6%" },
    { label: "Usage effect", value: "+4%" },
    { label: "Menu price", value: "Unchanged" },
    { label: "Dish contribution", value: "−13.2%" },
    { label: "Do not reprice yet", value: "Until normalized input cost known" },
  ],
};

/** D-5208 — cross-location playbook adoption (group). */
export const CANON_PLAYBOOK: CanonDecision = {
  id: DECISION_IDS.playbook,
  displayId: "D-5208",
  vertical: "hotel",
  property: "Northstar Hospitality Group",
  title: "Structural margin pattern",
  problemLine:
    "Amsterdam Hotel ADR €214 · GOP 38%.\nBerlin Hotel ADR €216 · GOP 31% — similar commercial performance, different profit.",
  territories: ["SELL", "LABOR", "BUY"],
  detectionType: "STRUCTURAL_PATTERN",
  horizon: "STRUCTURAL",
  scope: "GROUP",
  connect: "ADR parity × channel cost × housekeeping labor × waste × overtime",
  understand: "Similar ADR, divergent GOP — drivers are operating, not market. Test Amsterdam playbook where context matches.",
  prepared: "Local Decision → playbook candidate · Berlin similarity check prepared.",
  exposureEuro: 14800,
  deadline: "This month",
  scenarios: [
    {
      id: "do_nothing",
      title: "Leave local and reactive",
      expectedContributionEuro: 0,
      operationalRisk: "medium",
      guestImpact: "none",
      confidence: 80,
      note: "Same intervention repeats · structural gap compounds monthly",
      isNoAction: true,
    },
    {
      id: "adopt_playbook",
      title: "Local Decision → playbook → group rollout",
      expectedContributionEuro: 6200,
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 74,
      note: "Verified locally · Operating Memory rolls the driver set across comparable sites",
      recommended: true,
    },
  ],
  chosenScenarioId: "adopt_playbook",
  expectedProtectedEuro: 6200,
  actualProtectedEuro: 6042,
  verifiedKind: "avoided",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "PMS booking", freshness: "Daily" },
    { name: "Channel manager", freshness: "Daily" },
    { name: "Labor / housekeeping", freshness: "Daily" },
    { name: "Payments / settlement", freshness: "Daily" },
    { name: "Operating Memory", freshness: "Live" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -158,
  forecastVariancePct: -2.5,
  verificationSources: [
    "PMS booking",
    "Channel manager",
    "Labor / housekeeping",
    "Payments / settlement",
    "Operating Memory",
  ],
  learning: {
    lesson:
      "Playbook adoption compounded across locations — slightly under model on soft pickup nights.",
    playbookFrom: "Local reactive OTA release",
    playbookTo: "Group weekend direct-hold playbook",
    nextTimeImpact: "Roll playbook to remaining event markets.",
  },
  evidence: [
    { label: "Amsterdam ADR / GOP", value: "€214 · 38%" },
    { label: "Berlin ADR / GOP", value: "€216 · 31%" },
    { label: "Structural value at risk / month", value: "€14,800" },
    { label: "Drivers", value: "Labor · channel · supplier · HK · F&B" },
    { label: "Locations adopted", value: "4" },
    { label: "Comparable weekends", value: "11" },
    { label: "Expected avoided", value: "€6,200" },
    { label: "Verified avoided", value: "€6,042" },
  ],
};

/** D-4410 — terrace / upsell created contribution (restaurant). */
export const CANON_CREATED: CanonDecision = {
  id: DECISION_IDS.created,
  displayId: "D-4410",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Terrace open window · weather hold",
  problemLine:
    "Sun window opens at 17:40.\nThe obvious move is wait for walk-ins — RADR prepares terrace service now.",
  territories: ["SELL", "LABOR"],
  detectionType: "OPPORTUNITY",
  horizon: "REAL_TIME",
  scope: "SERVICE",
  connect: "Weather hold × terrace capacity × roster on-site × walk-in pace",
  understand: "Waiting for walk-ins wastes a perishable sun window. Staging uses staff already on site.",
  prepared: "Terrace staged · 2 covers · weather hold confirmed.",
  exposureEuro: 820,
  deadline: "17:25",
  scenarios: [
    {
      id: "do_nothing",
      title: "Wait for walk-ins",
      expectedContributionEuro: 0,
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 80,
      note: "Window often closes unused",
      isNoAction: true,
    },
    {
      id: "open_soft",
      title: "Soft open · no staffing change",
      expectedContributionEuro: 340,
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 72,
      note: "Captures some demand · understaffed service risk",
    },
    {
      id: "prepare_terrace",
      title: "Prepare terrace · 2 covers staged",
      expectedContributionEuro: 640,
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 76,
      note: "Staffing already on site · weather hold confirmed",
      recommended: true,
    },
  ],
  chosenScenarioId: "prepare_terrace",
  expectedProtectedEuro: 640,
  actualProtectedEuro: 620,
  verifiedKind: "created",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "Weather", freshness: "10m" },
    { name: "Roster", freshness: "Live" },
    { name: "POS terrace", freshness: "Live" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -20,
  forecastVariancePct: -3.1,
  verificationSources: ["POS terrace tickets", "Weather hold", "Roster"],
  learning: {
    lesson: "Prepared terrace before the sun window beat passive walk-in wait.",
    playbookFrom: "Open terrace only after first walk-in",
    playbookTo: "Stage terrace 15m before forecasted sun window",
    nextTimeImpact: "Weather-hold terrace prep ranked ahead of wait.",
  },
  evidence: [
    { label: "Gross opportunity", value: "€820" },
    { label: "Expected net contribution", value: "€640" },
    { label: "Observed net contribution", value: "€620" },
    { label: "Verified incremental value", value: "€620 created" },
    { label: "Value category", value: "created" },
    { label: "Weather hold", value: "Clear · 17:40–19:10" },
  ],
};

/** D-6671 — cancelled table recovered same service. */
export const CANON_TABLE: CanonDecision = {
  id: DECISION_IDS.tableRecover,
  displayId: "D-6671",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Table 14 cancellation · same-service recover",
  problemLine:
    "Table 14 cancelled at 18:12.\nThe obvious move is leave empty — RADR rebooks from waitlist.",
  territories: ["RECOVER", "SELL"],
  detectionType: "RECOVERY",
  horizon: "REAL_TIME",
  scope: "TABLE",
  connect: "Cancellation × waitlist fit × cover window × kitchen load",
  understand: "Empty after cancel is not free — waitlist rebook recovers contribution in the same service window.",
  prepared: "Waitlist SMS prepared · same cover window.",
  exposureEuro: 210,
  deadline: "18:25",
  scenarios: [
    {
      id: "do_nothing",
      title: "Leave empty",
      expectedContributionEuro: 0,
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 90,
      note: "Night contribution lost",
      isNoAction: true,
    },
    {
      id: "walk_in_only",
      title: "Hold for walk-ins",
      expectedContributionEuro: 95,
      operationalRisk: "low",
      guestImpact: "none",
      confidence: 58,
      note: "Uncertain fill · lower party fit",
    },
    {
      id: "waitlist_rebook",
      title: "Rebook waitlist party of 2",
      expectedContributionEuro: 184,
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 81,
      note: "SMS prepared · same cover window · €184 potential recovered contribution",
      recommended: true,
    },
  ],
  chosenScenarioId: "waitlist_rebook",
  expectedProtectedEuro: 184,
  actualProtectedEuro: 184,
  verifiedKind: "recovered",
  attributionStrength: "DIRECTLY_VERIFIED",
  sources: [
    { name: "Reservations", freshness: "Live" },
    { name: "Waitlist", freshness: "Live" },
    { name: "POS", freshness: "Live" },
  ],
  decisionConfidence: "HIGH",
  honesty: "DEMO",
  forecastVarianceEuro: 0,
  forecastVariancePct: 0,
  verificationSources: ["POS close", "Reservation log", "SMS delivery"],
  learning: {
    lesson: "Waitlist rebook beat passive walk-in hold on midweek cancellations.",
    playbookFrom: "Leave cancelled covers empty",
    playbookTo: "Rebook waitlist within 15 minutes",
    nextTimeImpact: "Same-service recover ranked ahead of walk-in hold.",
  },
  evidence: [
    { label: "Gross opportunity", value: "€210" },
    { label: "Potential recovered contribution", value: "€184" },
    { label: "Observed recovered contribution", value: "€184" },
    { label: "Verified recovered value", value: "€184" },
    { label: "Value category", value: "recovered" },
    { label: "Waitlist party", value: "2 · confirmed 18:19" },
  ],
};

/**
 * D-1855 — Legacy cross-domain bestseller demo (library only).
 * Flagship Intelligence story is D-7110 (CANON_MENU_PEAK) — do not present both as current.
 */
export const CANON_BESTSELLER: CanonDecision = {
  id: DECISION_IDS.bestsellerPeak,
  displayId: "D-1855",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Bestseller weak at peak",
  problemLine:
    "Bestseller #1 looks healthy.\nVolume is not the Decision — contribution per kitchen minute during peak is.",
  territories: ["BUY", "LABOR", "SELL"],
  detectionType: "EXPOSURE",
  horizon: "SERVICE",
  scope: "ITEM",
  connect:
    "Ingredient cost ↑ × kitchen minutes × ticket delay × peak capacity × alternative dish demand",
  understand:
    "The bestseller is economically strong off-peak but creates weak capacity economics during peak — scarce kitchen capacity has a better alternative use.",
  prepared:
    "De-emphasize 19:00–20:30 only · feature higher €/min dish · restore after peak.",
  exposureEuro: 940,
  deadline: "19:00",
  scenarios: [
    {
      id: "do_nothing",
      title: "Keep featuring #1 through peak",
      expectedContributionEuro: 0,
      operationalRisk: "high",
      guestImpact: "medium",
      confidence: 84,
      note: "Volume holds · kitchen minutes burn · ticket delay compounds · second turns slip",
      isNoAction: true,
    },
    {
      id: "reprice",
      title: "Raise price on bestseller",
      expectedContributionEuro: 220,
      operationalRisk: "medium",
      guestImpact: "medium",
      confidence: 62,
      note: "Partial margin recovery · still consumes scarce peak minutes",
    },
    {
      id: "deemphasize_peak",
      title: "De-emphasize 19:00–20:30 only",
      expectedContributionEuro: 680,
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 76,
      note: "Not because demand is weak — because peak kitchen capacity has stronger alternatives",
      recommended: true,
    },
  ],
  chosenScenarioId: "deemphasize_peak",
  expectedProtectedEuro: 680,
  actualProtectedEuro: 584,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "Supplier / invoice", freshness: "2 days" },
    { name: "Recipe / BOM", freshness: "Contract" },
    { name: "KDS ticket time", freshness: "Live" },
    { name: "POS velocity", freshness: "2m" },
    { name: "Kitchen load", freshness: "Live" },
    { name: "Menu engineering", freshness: "Weekly" },
  ],
  decisionConfidence: "MEDIUM",
  evidenceCoverage: "6 / 6 relevant sources",
  honesty: "DEMO",
  forecastVarianceEuro: -96,
  forecastVariancePct: -14.1,
  verificationSources: [
    "POS dish mix 19:00–20:30",
    "KDS ticket times",
    "Kitchen utilization",
    "Contribution / kitchen minute",
  ],
  learning: {
    lesson:
      "Peak de-emphasis protected contribution per kitchen minute — slightly under model on soft second turns.",
    playbookFrom: "Feature #1 all service",
    playbookTo:
      "When kitchen ≥90% and dish €/min weak: de-emphasize peak window only",
    nextTimeImpact:
      "Friday peak: kitchen threshold adjusted for featuring rules.",
  },
  evidence: [
    { label: "Bestseller rank", value: "#1 by volume" },
    { label: "BUY · ingredient cost", value: "+8%" },
    { label: "LABOR · kitchen time vs peers", value: "+21%" },
    { label: "Ticket delay at peak", value: "+4 min" },
    { label: "Contribution / kitchen minute", value: "−18%" },
    { label: "No-action baseline", value: "€0 · peak capacity burned" },
    { label: "De-emphasize expected", value: "+€680 vs feature-through" },
    { label: "Window", value: "19:00–20:30 only" },
  ],
};


/** D-7110 — Signature dish profitable but destroying peak contribution. */
export const CANON_MENU_PEAK: CanonDecision = {
  id: DECISION_IDS.menuPeak,
  displayId: "D-7110",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Signature dish profitable · destroying peak contribution",
  problemLine:
    "Tuna Tataki is a menu-engineering STAR.\n€14.20 contribution · high sales — and −18% contribution per kitchen minute at peak.",
  territories: ["BUY", "LABOR", "SELL"],
  detectionType: "EXPOSURE",
  horizon: "SERVICE",
  scope: "ITEM",
  connect:
    "Dish contribution × cold-station minutes × ticket time × second turns × substitutes",
  understand:
    "Classic margin analysis keeps the STAR. At peak the dish consumes scarce cold-station capacity — constrained-resource economics says de-emphasize only 19:00–20:30 and feature a faster high €/min alternative.",
  prepared:
    "Keep the dish · de-emphasize 19:00–20:30 · feature Truffle Pasta · restore after peak.",
  exposureEuro: 940,
  deadline: "Tonight · before 19:00",
  scenarios: [
    {
      id: "keep_mix",
      title: "Keep current mix",
      expectedContributionEuro: 0,
      economicMetrics: [
        {
          type: "INCREMENTAL_CONTRIBUTION",
          value: 0,
          currency: "EUR",
          label: "Baseline · peak capacity burned on weak €/min mix",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "high",
      riskLevel: "high",
      mainRiskDescription: "Peak capacity burned on weak €/min mix",
      guestImpact: "medium",
      confidence: 86,
      note: "STAR volume holds · kitchen minutes burn · tickets stretch · second turns slip",
      isNoAction: true,
    },
    {
      id: "remove",
      title: "Remove dish",
      expectedContributionEuro: 220,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 220,
          currency: "EUR",
          label: "Expected incremental contribution vs keep-mix",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Brand and off-peak contribution loss from permanent removal",
      guestImpact: "high",
      confidence: 58,
      note: "Permanent removal destroys brand signal and off-peak contribution",
    },
    {
      id: "reprice",
      title: "Price increase",
      expectedContributionEuro: 180,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 180,
          currency: "EUR",
          label: "Expected incremental contribution vs keep-mix",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Price resistance without freeing peak kitchen minutes",
      guestImpact: "medium",
      confidence: 61,
      note: "Margin recovers partially · still consumes scarce peak minutes",
    },
    {
      id: "feature_sub",
      title: "Feature substitute all service",
      expectedContributionEuro: 410,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 410,
          currency: "EUR",
          label: "Expected incremental contribution vs keep-mix",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      riskLevel: "low",
      mainRiskDescription: "Over-corrects off-peak when STAR economics are healthy",
      guestImpact: "medium",
      confidence: 70,
      note: "Stronger than keep-mix · over-corrects off-peak",
    },
    {
      id: "peak_deemphasis",
      title: "Peak-only de-emphasis 19:00–20:30",
      expectedContributionEuro: 680,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 680,
          currency: "EUR",
          label: "Expected incremental contribution",
          baseline: "vs keep-current-mix",
          scope: "Tonight peak window · Berlin Mitte",
          horizon: "19:00–20:30",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      riskLevel: "medium",
      mainRiskDescription: "Guests may not substitute toward featured alternative",
      guestImpact: "low",
      confidence: 78,
      note: "Keep the dish · shift mix only while kitchen is constrained",
      recommended: true,
    },
  ],
  chosenScenarioId: "peak_deemphasis",
  expectedProtectedEuro: 680,
  actualProtectedEuro: 610,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "POS / menu mix", freshness: "Live" },
    { name: "KDS", freshness: "Live" },
    { name: "Recipe / BOM", freshness: "Contract" },
    { name: "Supplier", freshness: "2 days" },
    { name: "Kitchen load", freshness: "Live" },
    { name: "Operating Memory", freshness: "12 services" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -70,
  forecastVariancePct: -10.3,
  verificationSources: [
    "POS mix 19:00–20:30",
    "Contribution / kitchen minute",
    "KDS ticket times",
    "Substitute acceptance",
  ],
  learning: {
    lesson:
      "Peak-only de-emphasis protected contribution per kitchen minute without killing the signature dish.",
    playbookFrom: "Feature STAR all service",
    playbookTo:
      "When kitchen ≥90% and dish €/min weak vs peer: de-emphasize peak window only",
    nextTimeImpact: "Friday peak featuring rules prefer high €/min dishes.",
  },
  evidence: [
    { label: "Dish contribution", value: "€14.20" },
    { label: "Classic menu class", value: "STAR" },
    { label: "Prep time vs category", value: "+21%" },
    { label: "Station at peak", value: "92% utilization" },
    { label: "Ingredient cost", value: "+8%" },
    { label: "Delivery mix on item", value: "High" },
    { label: "Ticket-time impact when mix >18%", value: "+3.8 min" },
    { label: "Contribution / kitchen minute vs alt", value: "−18%" },
  ],
};

/** D-7302 — Social demand changing tonight's product mix. */
export const CANON_SOCIAL_DEMAND: CanonDecision = {
  id: DECISION_IDS.socialDemand,
  displayId: "D-7302",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Social demand is changing tonight's product mix",
  problemLine:
    "14:32 Reel featured Tuna Tataki.\nBy 17:30 engagement is 2.4× baseline — inventory and kitchen are already constrained.",
  territories: ["SELL", "LABOR"],
  detectionType: "EXPOSURE",
  horizon: "REAL_TIME",
  scope: "SERVICE",
  connect:
    "Social signal × expected mix shift × inventory × kitchen capacity × booked covers",
  understand:
    "Engagement is a demand indicator — not revenue. Protect signature stock for booked covers and shift owned promotion toward a viable substitute.",
  prepared:
    "Cap promotion of constrained item · feature substitute in next owned content · protect stock for reservations · monitor mix.",
  exposureEuro: 420,
  deadline: "Before service · 18:00",
  scenarios: [
    {
      id: "boost_more",
      title: "Boost the featured dish again",
      economicEffectNote: "Economic effect not yet modeled · increases stockout / kitchen risk",
      operationalRisk: "high",
      riskLevel: "high",
      mainRiskDescription: "Amplifies stockout and kitchen pressure into booked covers",
      guestImpact: "high",
      confidence: 72,
      note: "Amplifies pressure on scarce inventory and station",
      isNoAction: true,
    },
    {
      id: "ignore",
      title: "Ignore social signal",
      expectedContributionEuro: 0,
      economicMetrics: [
        {
          type: "EXPOSURE",
          value: 420,
          currency: "EUR",
          label: "Contribution exposure remains if mix spike hits empty stock",
          status: "EXPOSED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Demand signal may not convert — but prep stays misaligned if it does",
      guestImpact: "medium",
      confidence: 68,
      note: "Leaves prep and promotion unaligned with likely mix",
    },
    {
      id: "protect_shift",
      title: "Protect stock · shift promotion",
      expectedContributionEuro: 310,
      economicMetrics: [
        {
          type: "EXPECTED_PROTECTED",
          value: 310,
          currency: "EUR",
          label: "Expected protected contribution vs unaligned prep",
          scope: "Tonight · Berlin Mitte",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      riskLevel: "medium",
      mainRiskDescription: "Demand signal may not convert into item demand",
      guestImpact: "low",
      confidence: 74,
      note: "Demand indicator → prep + promotion realignment · not a post-more response",
      recommended: true,
    },
  ],
  chosenScenarioId: "protect_shift",
  expectedProtectedEuro: 310,
  actualProtectedEuro: 280,
  verifiedKind: "protected",
  attributionStrength: "MODELED",
  sources: [
    { name: "Social · DEMO SIGNAL", freshness: "17:30" },
    { name: "Reservations", freshness: "Live" },
    { name: "Inventory", freshness: "Live" },
    { name: "KDS / kitchen", freshness: "Live" },
    { name: "Operating Memory", freshness: "Comparable campaigns" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: -30,
  forecastVariancePct: -9.7,
  verificationSources: [
    "Item mix vs baseline",
    "Stock events",
    "Kitchen load",
    "Booked-cover fulfillment",
  ],
  learning: {
    lesson:
      "Campaign residual demand is a prep and promotion Decision — not a content Decision.",
    playbookFrom: "Boost whatever is performing on social",
    playbookTo:
      "When engagement ≫ baseline and station/inventory constrained: protect stock · shift feature",
    nextTimeImpact: "Pre-service social pulse checks inventory + kitchen before amplify.",
  },
  evidence: [
    { label: "Content", value: "Reel · 14:32 · DEMO SIGNAL" },
    { label: "Engagement", value: "2.4× baseline" },
    { label: "Reach", value: "Above baseline" },
    { label: "Historical mix relationship", value: "Featured item mix ↑ after similar posts" },
    { label: "Ingredient inventory", value: "Limited" },
    { label: "Kitchen station", value: "Already constrained" },
    { label: "Attribution", value: "MODELED · not directly verified revenue" },
  ],
};

/** D-7401 — Guest sentiment rooted in kitchen bottleneck. */
export const CANON_GUEST_VOICE: CanonDecision = {
  id: DECISION_IDS.guestVoice,
  displayId: "D-7401",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Slow-service mentions ↑ — labor is not the driver",
  problemLine:
    "“Slow service” mentions +31%.\nFOH staffing is normal. Complaints cluster with delivery mix, signature mix, and kitchen load.",
  territories: ["LABOR", "SELL"],
  detectionType: "LEAKAGE",
  horizon: "TACTICAL",
  scope: "SERVICE",
  connect:
    "Guest voice × delivery mix × signature mix × station load × ticket time × FOH roster",
  understand:
    "Sentiment is the symptom. Strongest current explanation is kitchen capacity × order mix — not FOH understaffing.",
  prepared:
    "Do not add FOH labor · reduce peak kitchen load / adjust demand mix · verify ticket times and complaint rate.",
  exposureEuro: 520,
  deadline: "This week · next Friday peak",
  scenarios: [
    {
      id: "add_foh",
      title: "Add FOH labor",
      expectedContributionEuro: -180,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: -180,
          currency: "EUR",
          label: "Expected contribution impact · labor cost without fixing bottleneck",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      guestImpact: "low",
      confidence: 64,
      note: "Spends against a root cause that does not match the evidence cluster",
      isNoAction: true,
    },
    {
      id: "ignore_voice",
      title: "Treat as review noise",
      economicMetrics: [
        {
          type: "EXPOSURE",
          value: 520,
          currency: "EUR",
          label: "Contribution / reputation exposure remains",
          status: "EXPOSED",
        },
      ],
      operationalRisk: "high",
      guestImpact: "high",
      confidence: 70,
      note: "Leaves recurring Friday pattern unaddressed",
    },
    {
      id: "fix_mix_load",
      title: "Reduce peak kitchen load · adjust mix",
      expectedContributionEuro: 390,
      economicMetrics: [
        {
          type: "EXPECTED_PROTECTED",
          value: 390,
          currency: "EUR",
          label: "Expected protected contribution vs recurring Friday drag",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      guestImpact: "low",
      confidence: 77,
      note: "Aligns intervention with clustered operating evidence",
      recommended: true,
    },
  ],
  chosenScenarioId: "fix_mix_load",
  expectedProtectedEuro: 390,
  actualProtectedEuro: 350,
  verifiedKind: "protected",
  attributionStrength: "STRONGLY_ATTRIBUTED",
  sources: [
    { name: "Guest reviews · DEMO", freshness: "7 days" },
    { name: "KDS", freshness: "Historical Fridays" },
    { name: "Delivery", freshness: "Historical" },
    { name: "POS mix", freshness: "Historical" },
    { name: "Labor roster", freshness: "Plan" },
  ],
  decisionConfidence: "HIGH",
  honesty: "DEMO",
  forecastVarianceEuro: -40,
  forecastVariancePct: -10.3,
  verificationSources: [
    "Ticket times",
    "Complaint rate",
    "Turn times",
    "Contribution",
    "Service sentiment",
  ],
  learning: {
    lesson:
      "Guest voice pointed at kitchen mix — adding FOH would have been the expensive wrong move.",
    playbookFrom: "Add FOH when slow-service mentions rise",
    playbookTo:
      "Cluster guest themes with delivery · mix · station load before labor changes",
    nextTimeImpact: "Sentiment spikes open a kitchen-mix investigation first.",
  },
  evidence: [
    { label: "Theme", value: "Slow service · +31%" },
    { label: "Cluster window", value: "Friday 19:15–20:15" },
    { label: "When delivery >28%", value: "Mentions concentrate" },
    { label: "When station >94%", value: "Mentions concentrate" },
    { label: "When signature mix >17%", value: "Mentions concentrate" },
    { label: "FOH staffing", value: "Normal" },
  ],
};

/**
 * D-7501 — Margin Response · Coca-Cola cost shock.
 * Price-needed-to-hit-margin is an input — not the Decision.
 */
export const CANON_MARGIN_COKE: CanonDecision = {
  id: DECISION_IDS.marginCoke,
  displayId: "D-7501",
  vertical: "restaurant",
  property: "Berlin Mitte",
  title: "Beverage margin shock · Coca-Cola 330ml",
  problemLine:
    "Supplier unit cost +€0.10 (+23.8%).\nThe obvious move is raise Coke — RADR asks which response is strongest.",
  territories: ["BUY", "SELL"],
  detectionType: "EXPOSURE",
  horizon: "TACTICAL",
  scope: "ITEM",
  connect:
    "Supplier invoice × SKU × beverage menu × bundles × category contribution × location P&L",
  understand:
    "Price needed to restore theoretical margin (€0.55) is not the Decision. Category rebalance may recover more contribution with less guest-price concentration — elasticity evidence is insufficient for a blunt raise.",
  prepared:
    "Category rebalance draft · negotiation pack · hold single-item raise pending approval",
  exposureEuro: 796,
  deadline: "This week · before next beverage feature",
  scenarios: [
    {
      id: "absorb",
      title: "Absorb cost",
      expectedContributionEuro: 0,
      economicMetrics: [
        {
          type: "INCREMENTAL_CONTRIBUTION",
          value: 0,
          currency: "EUR",
          label: "Baseline · full exposure absorbed",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Weekly contribution bleed compounds if surcharge persists",
      guestImpact: "none",
      confidence: 88,
      note: "No guest price move · ~€184 / week exposure",
      isNoAction: true,
    },
    {
      id: "raise_item",
      title: "Raise Coke only (+€0.20)",
      expectedContributionEuro: 142,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 142,
          currency: "EUR",
          label: "Expected incremental contribution vs absorb",
          baseline: "vs absorb",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "PRICE RESPONSE UNCERTAIN — attach and volume risk",
      guestImpact: "medium",
      confidence: 54,
      note: "Price-needed input €0.55 · elasticity evidence insufficient",
    },
    {
      id: "category_rebalance",
      title: "Beverage category rebalance",
      expectedContributionEuro: 168,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 168,
          currency: "EUR",
          label: "Expected incremental contribution vs absorb",
          baseline: "vs absorb",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      riskLevel: "low",
      mainRiskDescription: "Guest perception of category architecture",
      guestImpact: "medium",
      confidence: 72,
      note: "Small anchor move · larger premium soft · protect lunch bundle",
      recommended: true,
    },
    {
      id: "negotiate",
      title: "Negotiate · procurement case",
      expectedContributionEuro: 110,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 110,
          currency: "EUR",
          label: "Expected incremental if terms improve",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "low",
      riskLevel: "low",
      mainRiskDescription: "Supplier may refuse · timeline exceeds week",
      guestImpact: "none",
      confidence: 61,
      note: "Cross-location leverage Berlin/Amsterdam/Lisbon prepared",
    },
    {
      id: "wait",
      title: "Wait · option value",
      expectedContributionEuro: 40,
      economicMetrics: [
        {
          type: "EXPECTED_INCREMENTAL_CONTRIBUTION",
          value: 40,
          currency: "EUR",
          label: "Option value of waiting 2 invoice cycles",
          status: "EXPECTED",
        },
      ],
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "If market price sticks, delay compounds exposure",
      guestImpact: "none",
      confidence: 58,
      note: "Information value of next two invoices",
    },
  ],
  chosenScenarioId: "category_rebalance",
  expectedProtectedEuro: 168,
  actualProtectedEuro: 0,
  verifiedKind: "protected",
  attributionStrength: "MODELED",
  sources: [
    { name: "Supplier invoice", freshness: "2 days" },
    { name: "Contract rate", freshness: "Contract" },
    { name: "Market list · DEMO", freshness: "Weekly" },
    { name: "POS beverage mix", freshness: "Live" },
    { name: "Recipe / BOM", freshness: "Contract" },
    { name: "Category P&L", freshness: "Weekly" },
  ],
  decisionConfidence: "MEDIUM",
  honesty: "DEMO",
  forecastVarianceEuro: 0,
  forecastVariancePct: 0,
  verificationSources: [
    "Beverage contribution after change",
    "Attach rates",
    "Invoice unit cost",
  ],
  learning: {
    lesson:
      "Category rebalance beat blunt item raise when elasticity evidence was thin.",
    playbookFrom: "Always raise the shocked SKU first",
    playbookTo: "Recover category contribution · protect high-attach anchors",
    nextTimeImpact:
      "Next beverage cost shock opens Margin Response Futures before a POS price ticket",
  },
  evidence: [
    { label: "SKU", value: "Coca-Cola 330ml" },
    { label: "Unit cost", value: "€0.42 → €0.52" },
    { label: "Shock class", value: "Market price change" },
    { label: "Weekly exposure", value: "€184 if absorbed" },
    { label: "Price needed", value: "€0.55 · input only" },
    { label: "Elasticity", value: "Insufficient sample" },
  ],
};

export const CANON_BY_ID: Record<string, CanonDecision> = {
  [CANON_TUNA.id]: CANON_TUNA,
  [CANON_PEAK.id]: CANON_PEAK,
  [CANON_OTA.id]: CANON_OTA,
  [CANON_ORPHAN.id]: CANON_ORPHAN,
  [CANON_LABOR.id]: CANON_LABOR,
  [CANON_SUPPLIER.id]: CANON_SUPPLIER,
  [CANON_PLAYBOOK.id]: CANON_PLAYBOOK,
  [CANON_CREATED.id]: CANON_CREATED,
  [CANON_TABLE.id]: CANON_TABLE,
  [CANON_BESTSELLER.id]: CANON_BESTSELLER,
  [CANON_MENU_PEAK.id]: CANON_MENU_PEAK,
  [CANON_SOCIAL_DEMAND.id]: CANON_SOCIAL_DEMAND,
  [CANON_GUEST_VOICE.id]: CANON_GUEST_VOICE,
  [CANON_MARGIN_COKE.id]: CANON_MARGIN_COKE,
};

export function canonScenario(
  d: CanonDecision,
  id: string,
): CanonScenario | undefined {
  return d.scenarios.find((s) => s.id === id);
}

export function canonChosen(d: CanonDecision): CanonScenario {
  return (
    d.scenarios.find((s) => s.id === d.chosenScenarioId) ?? d.scenarios[0]!
  );
}

export function canonRecommended(d: CanonDecision): CanonScenario {
  return d.scenarios.find((s) => s.recommended) ?? canonChosen(d);
}

/** Format variance for UI: "−€50 · −3.0%" */
export function formatCanonVariance(d: CanonDecision): string {
  const sign = d.forecastVarianceEuro > 0 ? "+" : d.forecastVarianceEuro < 0 ? "−" : "";
  const abs = Math.abs(d.forecastVarianceEuro);
  const pctSign =
    d.forecastVariancePct > 0 ? "+" : d.forecastVariancePct < 0 ? "−" : "";
  return `${sign}€${abs} · ${pctSign}${Math.abs(d.forecastVariancePct).toFixed(1)}%`;
}

/** Public scenario euro caption — never ambiguous. */
export function formatScenarioEuro(s: CanonScenario): string {
  if (s.value?.label) return s.value.label;
  if (s.economicEffectNote) return s.economicEffectNote;
  if (s.economicMetrics?.[0]?.label && s.economicMetrics[0].value != null) {
    return `€${Math.abs(s.economicMetrics[0].value!).toLocaleString("en-US")} · ${s.economicMetrics[0].label}`;
  }
  if (s.isNoAction && (s.expectedContributionEuro == null || s.expectedContributionEuro === 0)) {
    return "€0 incremental vs recommended path · not €0 total";
  }
  if (s.expectedContributionEuro == null) return "Economic effect not yet modeled";
  return `€${Math.abs(s.expectedContributionEuro).toLocaleString("en-US")}`;
}

/** Verified amount for ledgers — prefer explicit incremental when set. */
export function verifiedEuro(d: CanonDecision): number {
  return d.verifiedIncrementalEuro ?? d.actualProtectedEuro;
}

/**
 * Public metric labels — never synonymize protected / contribution / recovered.
 * Orphan (D-3104): expected/observed are NET CONTRIBUTION; verified is RECOVERED incremental.
 */
export function expectedMetricLabel(d: CanonDecision): string {
  if (d.verifiedKind === "recovered" && d.observedContributionEuro != null) {
    return "Expected net contribution";
  }
  if (d.verifiedKind === "protected") return "Expected protected";
  if (d.verifiedKind === "created") return "Expected created";
  if (d.verifiedKind === "avoided") return "Expected avoided";
  return "Expected contribution";
}

export function observedMetricLabel(d: CanonDecision): string {
  if (d.observedContributionEuro != null) return "Observed net contribution";
  if (d.verifiedKind === "protected") return "Observed protected";
  return "Observed contribution";
}

export function verifiedMetricLabel(d: CanonDecision): string {
  switch (d.verifiedKind) {
    case "recovered":
      return "Verified recovered value";
    case "protected":
      return "Verified protected";
    case "created":
      return "Verified created";
    case "avoided":
      return "Verified avoided";
  }
}

/** Scenario list caption — prefer ScenarioValue.label when present. */
export function scenarioMetricCaption(s: CanonScenario): string {
  if (s.value?.metricType === "INCREMENTAL_CONTRIBUTION") {
    return "Incremental contribution vs baseline";
  }
  if (s.value?.metricType === "NET_CONTRIBUTION") {
    return "Expected net contribution";
  }
  if (s.value?.metricType === "EXPECTED_PROTECTED") {
    return "Expected protected";
  }
  if (s.value?.label) return s.value.label;
  return "Expected contribution";
}
