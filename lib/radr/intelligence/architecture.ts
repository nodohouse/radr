/**
 * RADR Intelligence — product architecture source of truth.
 *
 * BUY / LABOR / SELL / RECOVER are economic lenses over ONE normalized
 * hospitality operating model — not four isolated modules.
 *
 * Law: The number is not the intelligence. The connection is.
 *
 * Website + product demos should import vocabulary from here.
 * Do not invent parallel Finding / Signal / Decision models.
 */

/** Customer-facing Intelligence loop (STATE is internal architecture). */
export const CUSTOMER_LOOP = [
  "CONNECT",
  "UNDERSTAND",
  "FUTURES",
  "DECIDE",
  "VERIFY",
  "REMEMBER",
] as const;

/**
 * Lifecycle of one Decision object (audit / Decision Trace — not the marketing loop).
 */
export const DECISION_LIFECYCLE = [
  "DETECTED",
  "UNDERSTOOD",
  "SIMULATED",
  "RECOMMENDED",
  "APPROVED",
  "OBSERVED",
  "VERIFIED",
  "LEARNED",
] as const;

/**
 * Developer / technical pipeline. Finding ≠ Decision.
 */
export const TECHNICAL_PIPELINE = [
  "EVENT",
  "NORMALIZED OPERATING STATE",
  "FINDING",
  "DECISION",
  "SCENARIO / FUTURES",
  "ACTION",
  "OUTCOME",
  "VERIFIED VALUE",
  "MEMORY",
] as const;

/**
 * A Finding is a detected relationship, anomaly, exposure, opportunity or pattern.
 * It becomes a Decision only when material, time-relevant, sufficiently evidenced,
 * actionable, and capable of changing the outcome.
 */
export const FINDING_DEFINITION =
  "A Finding is a detected relationship, anomaly, exposure, opportunity or pattern. A Finding becomes a Decision only when it is material, time-relevant, sufficiently evidenced, actionable, and capable of changing the outcome.";

/**
 * How a Decision is based — teachable spine for Intelligence website.
 * Not a separate product; labels the same engine.
 */
export const DECISION_BASIS = [
  {
    step: "EVIDENCE",
    line: "Immutable facts from systems — plus operator context.",
  },
  {
    step: "STATE",
    line: "One operating state. Never an isolated metric.",
  },
  {
    step: "RELATE",
    line: "Where relationships change contribution.",
  },
  {
    step: "BASELINE",
    line: "Cost of doing nothing — always modeled first.",
  },
  {
    step: "FUTURES",
    line: "Risk-adjusted paths under uncertainty. WAIT can win.",
  },
  {
    step: "VERIFY",
    line: "Observed vs expected. Then remember.",
  },
] as const;

/**
 * Territory page choreography (cinematic stages — not six dashboard boxes).
 */
/** Territory choreography stages — STATE stays internal; public uses UNDERSTAND. */
export const INTELLIGENCE_SEQUENCE = [
  "SEE",
  "CONNECT",
  "UNDERSTAND",
  "FUTURES",
  "DECIDE",
  "VERIFY",
] as const;

/** Public product pipeline (website / platform spine). */
export const INTELLIGENCE_PIPELINE = [
  "DATA",
  "OPERATING STATE",
  "RELATIONSHIPS",
  "ECONOMIC EXPOSURE",
  "FUTURES",
  "DECISION",
  "ACTION",
  "OUTCOME",
  "VERIFIED VALUE",
  "MEMORY",
] as const;

/**
 * Forward-looking beat — not a fifth lens.
 * Futures = play feasible responses forward under uncertainty before DECIDE.
 * Platform surface: /product/futures · Intelligence: IntelFuturesFork.
 */
export const FUTURES_DEFINITION =
  "Play the operation forward — rank risk-adjusted paths vs no-action. Not a forecast dashboard.";


export const INTELLIGENCE_LAW =
  "The number is not the intelligence. The connection is.";

export const INTELLIGENCE_DEFINITION =
  "RADR continuously builds an economic model of the hospitality operation, detects where the future outcome can still change, evaluates feasible responses, prepares the strongest modeled move, verifies what actually happened, and remembers the result.";

export const INTELLIGENCE_SUBHEAD =
  "Four economic lenses. One hospitality operating model. RADR finds where the relationships change contribution.";

/** Final product principle — never four engines. */
export const INTELLIGENCE_PRINCIPLE =
  "RADR has one economic operating model. BUY, LABOR, SELL, and RECOVER are ways of looking at the Decisions it produces.";

/* —— Part 1: immutable raw events (LLM never invents these) —— */

export const RAW_EVENT_TYPES = [
  "reservation.created",
  "reservation.cancelled",
  "stay.created",
  "stay.cancelled",
  "order.opened",
  "order.closed",
  "order.item_added",
  "room.status_changed",
  "unit.status_changed",
  "invoice.received",
  "invoice.line_received",
  "delivery.received",
  "inventory.adjusted",
  "employee.shift_started",
  "employee.shift_ended",
  "payment.authorized",
  "payment.failed",
  "payment.settled",
  "housekeeping.room_ready",
  "maintenance.created",
  "weather.updated",
  "event.updated",
] as const;

export type RawEventType = (typeof RAW_EVENT_TYPES)[number];

/* —— Part 2: normalized entities —— */

export const NORMALIZED_ENTITIES = [
  "Organization",
  "Location",
  "OperatingUnit",
  "Guest",
  "Reservation",
  "Stay",
  "Table",
  "Room",
  "Unit",
  "Order",
  "OrderItem",
  "MenuItem",
  "RatePlan",
  "Employee",
  "Role",
  "Shift",
  "Supplier",
  "Contract",
  "PurchaseOrder",
  "Invoice",
  "InvoiceLine",
  "Delivery",
  "InventoryItem",
  "InventoryMovement",
  "Payment",
  "Settlement",
  "Task",
  "MaintenanceEvent",
  "Forecast",
  "ExternalEvent",
  "Decision",
  "Action",
  "Outcome",
  "VerifiedValue",
] as const;

export type NormalizedEntity = (typeof NORMALIZED_ENTITIES)[number];

/* —— Part 3: economic / semantic primitives —— */

export const DEMAND_PRIMITIVES = [
  "bookedDemand",
  "expectedDemand",
  "walkInProbability",
  "pickupVelocity",
  "replacementProbability",
  "unconstrainedDemand",
] as const;

export const CAPACITY_PRIMITIVES = [
  "physicalCapacity",
  "effectiveCapacity",
  "serviceCapacity",
  "productionCapacity",
  "turnoverCapacity",
  "availableInventory",
] as const;

export const ECONOMICS_PRIMITIVES = [
  "revenue",
  "grossMargin",
  "contribution",
  "marginalContribution",
  "acquisitionCost",
  "distributionCost",
  "fulfillmentCost",
  "laborCost",
  "wasteCost",
] as const;

export const TIME_PRIMITIVES = [
  "timeToExpiry",
  "decisionDeadline",
  "leadTime",
  "replacementWindow",
  "arrivalWindow",
  "serviceWindow",
] as const;

export const RISK_PRIMITIVES = [
  "serviceFailureRisk",
  "stockoutRisk",
  "selloutRisk",
  "readinessRisk",
  "noShowRisk",
] as const;

/** High-level operating primitive families (vertical language adapts). */
export const OPERATING_PRIMITIVES = [
  "Demand",
  "Inventory / Capacity",
  "Price / Revenue",
  "Contribution",
  "Labor / Execution Capacity",
  "Procurement",
  "Guest / Booking Behavior",
  "Operational Timing",
  "External Context",
  "Financial Truth",
  "Operator Context",
  "Operating Memory",
] as const;

/** Canonical Intelligence objects — do not invent parallel models. */
export const INTELLIGENCE_OBJECTS = [
  "Signal",
  "Evidence",
  "Finding",
  "Exposure",
  "Opportunity",
  "Decision",
  "Scenario",
  "Constraint",
  "Action",
  "Outcome",
  "VerifiedValue",
  "Pattern",
  "Playbook",
  "OperatorContext",
] as const;

/* —— Territories (lenses) —— */

export type EconomicTerritory = "BUY" | "LABOR" | "SELL" | "RECOVER";

export type DetectionType =
  | "LEAKAGE"
  | "EXPOSURE"
  | "OPPORTUNITY"
  | "RECOVERY"
  | "STRUCTURAL_PATTERN";

/** Alias — problem class = detection type. */
export type ProblemClass = DetectionType;

export const DETECTION_TYPES: {
  id: DetectionType;
  label: string;
  definition: string;
}[] = [
  {
    id: "LEAKAGE",
    label: "Leakage",
    definition: "Value is already disappearing.",
  },
  {
    id: "EXPOSURE",
    label: "Exposure",
    definition: "Value is likely to disappear if nothing changes.",
  },
  {
    id: "OPPORTUNITY",
    label: "Opportunity",
    definition: "Another response may create stronger contribution.",
  },
  {
    id: "RECOVERY",
    label: "Recovery",
    definition: "Expected value was disrupted but remains reclaimable.",
  },
  {
    id: "STRUCTURAL_PATTERN",
    label: "Structural pattern",
    definition:
      "The same issue keeps recurring and should become a permanent operating change.",
  },
];

export const TERRITORY_DEFINITIONS: Record<
  EconomicTerritory,
  {
    code: EconomicTerritory;
    definition: string;
    not: string;
    question: string;
    internal: string;
  }
> = {
  BUY: {
    code: "BUY",
    definition: "Know what inputs really cost the operation.",
    not: "Not invoice matching software.",
    question: "Did the cost change contribution — and what response is strongest?",
    internal: "Procurement → usage → contribution intelligence.",
  },
  LABOR: {
    code: "LABOR",
    definition: "Put capacity where demand will actually hit.",
    not: "Not headcount / scheduling software.",
    question: "Is labor the bottleneck — or will adding labor worsen another one?",
    internal: "Capacity intelligence — where does demand hit constrained capacity?",
  },
  SELL: {
    code: "SELL",
    definition: "Choose the demand that creates the strongest contribution.",
    not: "Not revenue management / RMS software.",
    question: "Will accepting this demand displace more valuable demand?",
    internal: "Demand allocation — which demand consumes scarce capacity?",
  },
  RECOVER: {
    code: "RECOVER",
    definition: "Reclaim value before it disappears.",
    not: "Not collections software.",
    question: "How does recoverability decay — and which intervention wins?",
    internal:
      "Rescue after the expected path broke — distinct from SELL before sale.",
  },
};

/* —— Part 9–10: horizon + scope —— */

export type DecisionHorizon =
  | "REAL_TIME"
  | "SERVICE"
  | "DAILY"
  | "TACTICAL"
  | "STRUCTURAL";

export const DECISION_HORIZONS: {
  id: DecisionHorizon;
  label: string;
  example: string;
}[] = [
  { id: "REAL_TIME", label: "Real-time", example: "Seat this table?" },
  { id: "SERVICE", label: "Service", example: "Reallocate staff tonight?" },
  { id: "DAILY", label: "Daily", example: "Hold rooms direct tomorrow?" },
  { id: "TACTICAL", label: "Tactical", example: "Supplier response this week?" },
  {
    id: "STRUCTURAL",
    label: "Structural",
    example: "Change Friday operating model?",
  },
];

export type DecisionScope =
  | "ITEM"
  | "TABLE"
  | "ROOM"
  | "UNIT"
  | "SERVICE"
  | "DEPARTMENT"
  | "LOCATION"
  | "GROUP";

/* —— Part 7: eligibility / silence —— */

export type DecisionEligibility =
  | "DECIDE"
  | "WATCH"
  | "NO_ACTION"
  | "INSUFFICIENT_EVIDENCE"
  | "WAIT"
  | "NEEDS_OPERATOR_CONTEXT"
  | "LOW_DATA_COVERAGE"
  | "LIMITED_HISTORY";

export const SILENCE_STATES: DecisionEligibility[] = [
  "WATCH",
  "NO_ACTION",
  "INSUFFICIENT_EVIDENCE",
  "WAIT",
  "NEEDS_OPERATOR_CONTEXT",
  "LOW_DATA_COVERAGE",
  "LIMITED_HISTORY",
];

/* —— Part 13–15: confidence + attribution —— */

export type ConfidenceBand = "HIGH" | "MEDIUM" | "LOW";

export const CONFIDENCE_AXES = [
  "Evidence Coverage",
  "Data Freshness",
  "Forecast Confidence",
  "Decision Confidence",
] as const;

export type AttributionStrength =
  | "DIRECTLY_VERIFIED"
  | "STRONGLY_ATTRIBUTED"
  | "MODELED"
  | "UNVERIFIED";

/** Website honesty — never present aspiration as shipped. */
export type CapabilityHonesty =
  | "AVAILABLE"
  | "EARLY_ACCESS"
  | "PLANNED"
  | "DEMO";

export const HONESTY_LABEL: Record<CapabilityHonesty, string> = {
  AVAILABLE: "Available",
  EARLY_ACCESS: "Early access",
  PLANNED: "Planned",
  DEMO: "Demo · illustrative",
};

/* —— Part 4: OperatingState (conceptual type) —— */

export type OperatingStateEvidenceRef = {
  source: string;
  freshness: string;
  kind?: "OBSERVED" | "ESTIMATED" | "PREDICTED";
};

/**
 * Derived operating state — RADR reasons from this, not isolated metrics.
 * Demo fixtures populate a subset; backend will fill the rest.
 */
export type OperatingState = {
  scope: string;
  horizon: DecisionHorizon | string;
  timestamp: string;
  demand?: Record<string, string | number>;
  capacity?: Record<string, string | number>;
  inventory?: Record<string, string | number>;
  economics?: Record<string, string | number>;
  labor?: Record<string, string | number>;
  procurement?: Record<string, string | number>;
  channelMix?: Record<string, string | number>;
  operationalPressure?: Record<string, string | number>;
  externalContext?: Record<string, string | number>;
  /** Prose state — the Intelligence sentence, not a single KPI. */
  stateSentence: string;
  evidence: OperatingStateEvidenceRef[];
  operatorContext?: { author: string; context: string; timestamp: string }[];
  missingData?: string[];
  qualityFlags?: string[];
};

/* —— Ingestion —— */

export const INGESTION_LEVELS = [
  {
    level: 1 as const,
    label: "Start with what you have",
    examples: [
      "CSV",
      "Excel",
      "PDF",
      "contract",
      "invoice",
      "manual",
      "operator context",
    ],
  },
  {
    level: 2 as const,
    label: "Connected systems",
    examples: ["APIs", "OAuth", "scheduled sync", "webhooks"],
  },
  {
    level: 3 as const,
    label: "Operating event streams",
    examples: [
      "POS",
      "KDS",
      "PMS",
      "bookings",
      "room readiness",
      "payments",
      "delivery",
      "inventory",
    ],
  },
  {
    level: 4 as const,
    label: "Enterprise ingestion",
    examples: ["SFTP", "warehouse", "enterprise API", "custom"],
  },
] as const;

/**
 * Internal reasoning pipeline (Part 11).
 * Compatible with OBSERVE→…→LEARN product stages.
 */
export const REASONING_PIPELINE = [
  "OBSERVE",
  "NORMALIZE",
  "DERIVE",
  "RELATE",
  "DETECT",
  "EXPLAIN",
  "BASELINE",
  "CONSTRAIN",
  "GENERATE",
  "SIMULATE",
  "VALUE",
  "RECOMMEND",
  "OPERATOR CONTEXT",
  "RE-SIMULATE",
  "PREPARE",
  "OBSERVE OUTCOME",
  "VERIFY",
  "LEARN",
] as const;

export const UNCERTAINTY_STATES = [
  "LOW EVIDENCE",
  "MEDIUM CONFIDENCE",
  "WAIT",
  "NO RECOMMENDATION",
  "INSUFFICIENT HISTORY",
] as const;

export const FINAL_PRODUCT_QUESTIONS = [
  "WHAT IS CHANGING?",
  "WHY?",
  "WHAT HAPPENS IF WE DO NOTHING?",
  "WHAT CAN WE ACTUALLY DO?",
  "WHICH RESPONSE HAS THE STRONGEST EXPECTED ECONOMICS?",
  "WHAT ACTUALLY HAPPENED?",
  "WHAT SHOULD WE REMEMBER?",
] as const;

/** Evidence contract sections (Part 16) — progressive disclosure. */
export const EVIDENCE_CONTRACT_SECTIONS = [
  "WHY",
  "SOURCE",
  "FRESHNESS",
  "ASSUMPTIONS",
  "UNKNOWN",
  "BASELINE",
  "OPTIONS",
  "CHOICE",
  "VERIFICATION PLAN",
] as const;
