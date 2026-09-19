/**
 * Canonical fictional world for the public homepage product demonstration.
 *
 * Isolated from product `/app` demo fixtures (Northstar / Berlin / EUR), but
 * money semantics must match the product:
 * unresolved exposure = LABOR 290 + BUY 118 = 408
 * verified value = 184 (excluded from exposure)
 * weather SELL opportunity = 14 × 30 = 420 gross − 72 cost = 348 net
 *
 * Currency is USD for this New York hospitality group.
 *
 * Naming note: "Mercer Hospitality Group" was avoided because it collides with
 * the real NYC operator Mercer Street Hospitality.
 */

export const HOMEPAGE_DEMO_CURRENCY = "USD" as const;

export const HOMEPAGE_DEMO = {
  org: {
    name: "Halcyon Hospitality Group",
    chromeRight: "Halcyon Hospitality Group · New York",
    city: "New York",
    region: "NY",
  },
  chromeLeft: "Control Center",
  disclosure: {
    short: "Illustrative product data.",
    long: "The organizations, locations, findings and financial values shown in this product demonstration are fictional and used to illustrate RADR functionality.",
  },
  /** Unresolved exposure only. Verified value is never included. */
  exposure: {
    labor: 290,
    buy: 118,
    /** labor + buy */
    total: 408,
    openCount: 2,
  },
  /** Observed and attributed. Separate from exposure. */
  verified: {
    amount: 184,
    potential: 192,
    label: "Table 14 cancellation",
  },
  locations: {
    labor: {
      venue: "Halcyon House",
      neighborhood: "SoHo",
      label: "Halcyon House · SoHo",
    },
    recover: {
      venue: "Canal Street",
      neighborhood: "Tribeca",
      label: "Canal Street · Tribeca",
    },
    buy: {
      venue: "Orchard",
      neighborhood: "Lower East Side",
      label: "Orchard · Lower East Side",
    },
    sell: {
      venue: "Halcyon House",
      neighborhood: "SoHo",
      label: "Halcyon House · SoHo",
    },
    spare: {
      venue: "West Tenth",
      neighborhood: "Greenwich Village",
      label: "West Tenth · Greenwich Village",
    },
  },
  findings: {
    labor: {
      territory: "LABOR" as const,
      amount: 290,
      moneyLabel: "$290 at risk",
      peakStart: "19:00",
      peakEnd: "20:30",
      expectedCovers: 68,
      capacityCovers: 54,
      fohGap: 1,
      confidence: "High",
      action: "Add one FOH employee for peak service",
      summary: "Peak service demand exceeds scheduled FOH capacity.",
    },
    buy: {
      territory: "BUY" as const,
      amount: 118,
      moneyLabel: "$118 recoverable",
      action: "Request supplier credit",
      summary: "Supplier invoice pricing exceeds contracted pricing.",
      invoiceLines: [
        { id: "tomatoes", contract: 312, invoiced: 358, variance: 46 },
        { id: "oil", contract: 190, invoiced: 228, variance: 38 },
        { id: "herbs", contract: 96, invoiced: 130, variance: 34 },
      ] as const,
      invoiceTotals: {
        contract: 2722,
        invoiced: 2840,
        variance: 118,
      },
    },
    recover: {
      territory: "RECOVER" as const,
      amount: 184,
      potential: 192,
      moneyLabel: "$184 verified",
      verifiedLabel: "$184",
      summary:
        "A cancelled table was replaced and the resulting POS revenue was observed.",
    },
    sell: {
      territory: "SELL" as const,
      amount: 420,
      moneyLabel: "$420 gross opportunity",
      summary:
        "Warm, dry weather is expected to push Thursday terrace demand above the current operating plan.",
      weather: {
        highC: 29,
        summary: "Dry",
        precipitationProbabilityPct: 10,
        comparableLiftPct: 24,
        incrementalCovers: 14,
        contributionPerCover: 30,
        laborCostToCapture: 72,
        expectedDemand: 56,
        scheduledCapacity: 42,
        fohPlan: 46,
      },
    },
  },
  territoryExamples: {
    buy: "$118 recoverable · Supplier invoice pricing exceeds contracted pricing.",
    labor: "$290 at risk · Peak service demand exceeds scheduled FOH capacity.",
    sell: "$420 gross opportunity · Warm dry weather lifts Thursday terrace demand above plan.",
    recover: "$184 verified · Cancelled table replaced. POS observed.",
  },
  industries: {
    hotelFinding: {
      amount: 3840,
      moneyLabel: "$3,840 opportunity",
      summary:
        "Premium room demand is pacing ahead of comparable Fridays while remaining inventory is still priced at the current rate.",
      evidence: {
        premiumCommittedPct: 91,
        paceAheadPct: 17,
        remainingRooms: 8,
        confidence: "High",
      },
      action: "Review premium room pricing for remaining inventory.",
      directional: true,
    },
    barFinding: {
      amount: 310,
      moneyLabel: "$310 opportunity",
      summary:
        "Warm afternoon conditions historically increase terrace demand, while current staffing and inventory remain planned to the indoor baseline.",
      directional: true,
    },
    groupVariance: {
      amount: 4200,
      moneyLabel: "$4,200",
      summary:
        "Location A is outperforming Location B this week. Variance decomposes across covers, average spend, mix, discounting and labor efficiency.",
      directional: true,
    },
  },
  askExamples: [
    "What should I fix first?",
    "Why is this supplier invoice wrong?",
    "Will tomorrow's weather affect us?",
    "What did RADR handle today?",
    "What still needs my approval?",
    "Which location needs me?",
    "Can we recover tonight's cancellation?",
  ] as const,
  /**
   * Prepared-work demonstrations for marketing.
   * Status stays at "Approval required" unless product execution exists.
   */
  prepared: {
    buy: {
      territory: "BUY" as const,
      moneyLabel: "$118 recoverable",
      summary: "Supplier invoice pricing exceeds contracted pricing.",
      status: "Approval required",
      steps: [
        { label: "Contract line", value: "Located" },
        { label: "Invoice evidence", value: "Attached" },
        { label: "Variance", value: "$118" },
        { label: "Claim", value: "Prepared" },
        { label: "Supplier message", value: "Drafted" },
      ] as const,
      ready: "Supplier discrepancy ready for finance approval.",
    },
    labor: {
      territory: "LABOR" as const,
      moneyLabel: "$290 at risk",
      summary: "Peak service demand exceeds scheduled FOH capacity.",
      status: "Approval required",
      window: "19:00 to 20:30",
      change: "Add one FOH employee",
      laborCost: 72,
      valueProtected: 290,
      steps: [
        { label: "Demand window", value: "Identified" },
        { label: "Capacity constraint", value: "Identified" },
        { label: "Best staffing adjustment", value: "Identified" },
        { label: "Additional labor cost", value: "$72" },
        { label: "Expected value protected", value: "$290" },
        { label: "Shift adjustment", value: "Prepared" },
      ] as const,
      ready: "Recommended change ready for manager approval.",
    },
    recover: {
      territory: "RECOVER" as const,
      moneyLabel: "$184 verified",
      summary:
        "A cancelled table was replaced and the resulting POS revenue was observed.",
      status: "Verified",
      steps: [
        { label: "Cancellation", value: "Detected" },
        { label: "Released inventory", value: "Valued" },
        { label: "Waitlist match", value: "Prepared" },
        { label: "Replacement booking", value: "Accepted" },
        { label: "POS transaction", value: "$184 observed" },
        { label: "Verified Value", value: "$184" },
      ] as const,
      ready: "Recovery completed and verified.",
    },
    sell: {
      territory: "SELL" as const,
      moneyLabel: "$420 gross opportunity",
      summary:
        "Warm, dry weather is expected to push Thursday terrace demand above plan.",
      status: "Approval required",
      steps: [
        { label: "External context", value: "29°C · Dry · 10% precip" },
        { label: "Historical relationship", value: "+24% terrace demand" },
        { label: "Expected incremental demand", value: "+14 covers" },
        { label: "Gross opportunity", value: "$420" },
        { label: "Cost to capture", value: "$72" },
        { label: "Expected net value", value: "$348" },
        { label: "FOH adjustment", value: "Prepared" },
      ] as const,
      ready: "Terrace response ready for manager approval.",
    },
  },
  sinceLastCheck: {
    newFindings: 2,
    prepared: 1,
    recovered: 1,
    verifiedAmount: 184,
    decisionsReady: 1,
  },
  productStory: {
    buy: {
      territory: "BUY" as const,
      finding: "Supplier invoice above contract.",
      values: [{ label: "Value", value: "$118 recoverable" }] as const,
      done: [
        "Contract located",
        "Invoice checked",
        "Variance calculated",
        "Evidence attached",
        "Claim prepared",
      ] as const,
      needsYou: "Approve claim",
      needsYouDone: false,
    },
    labor: {
      territory: "LABOR" as const,
      finding: "Peak service understaffed.",
      values: [{ label: "Value", value: "$290 at risk" }] as const,
      done: [
        "Demand window identified",
        "Capacity checked",
        "Lowest cost staffing adjustment identified",
        "Economics calculated",
        "Shift change prepared",
      ] as const,
      needsYou: "Approve staffing change",
      needsYouDone: false,
    },
    sell: {
      territory: "SELL" as const,
      finding: "Tomorrow's terrace demand is expected above plan.",
      values: [
        { label: "Gross opportunity", value: "$420" },
        { label: "Cost to capture", value: "$72" },
        { label: "Expected net value", value: "$348" },
      ] as const,
      context: [
        { label: "Context", value: "29°C · Dry · 10% rain probability" },
        { label: "Expected demand", value: "+14 covers" },
      ] as const,
      done: [
        "Comparable days analyzed",
        "Demand impact calculated",
        "Staffing requirement checked",
        "Terrace adjustment prepared",
      ] as const,
      needsYou: "Approve operating change",
      needsYouDone: false,
    },
    recover: {
      territory: "RECOVER" as const,
      finding: "Late cancellation released Table 14.",
      values: [
        { label: "Potential", value: "$192" },
        { label: "Observed", value: "$184" },
        { label: "Verified Value", value: "$184" },
      ] as const,
      done: [
        "Waitlist evaluated",
        "Replacement identified",
        "Recovery action prepared",
        "Replacement accepted",
      ] as const,
      needsYou: "Nothing. Verified.",
      needsYouDone: true,
    },
  },
  operatingModels: {
    restaurants: {
      understands: [
        "Reservations",
        "Covers",
        "Tables",
        "POS",
        "Labor",
        "Suppliers",
        "Weather",
      ] as const,
      watches: [
        "Booking pace",
        "Service capacity",
        "Labor demand",
        "Food cost",
        "Cancellations",
        "Terrace demand",
      ] as const,
      handles: [
        "Daily operating brief",
        "Labor demand checks",
        "Supplier variance review",
        "Cancellation recovery preparation",
        "Forecast exceptions",
      ] as const,
    },
    hotels: {
      understands: [
        "PMS",
        "Rooms",
        "Bookings",
        "Labor",
        "Distribution",
        "Housekeeping",
        "F&B",
      ] as const,
      watches: [
        "Occupancy",
        "ADR",
        "RevPAR",
        "Pickup",
        "Channel mix",
        "Housekeeping demand",
        "Ancillary spend",
      ] as const,
      handles: [
        "Daily operating brief",
        "Rate anomaly review",
        "OTA commission checks",
        "Booking pace exceptions",
        "Housekeeping demand reconciliation",
      ] as const,
    },
    bars: {
      understands: [
        "POS",
        "Labor",
        "Inventory",
        "Suppliers",
        "Weather",
        "Events",
      ] as const,
      watches: [
        "Daypart demand",
        "Average ticket",
        "Product mix",
        "Waste",
        "Stock risk",
        "Weather sensitivity",
      ] as const,
      handles: [
        "Labor demand checks",
        "Supplier variance review",
        "Stock exceptions",
        "Weather demand preparation",
        "Forecast exceptions",
      ] as const,
    },
    groups: {
      understands: [
        "Locations",
        "Regions",
        "Performance",
        "Labor",
        "Procurement",
        "Value",
      ] as const,
      watches: [
        "Location variance",
        "Margin differences",
        "Portfolio exposure",
        "Operational exceptions",
        "Verified Value",
      ] as const,
      handles: [
        "Group operating brief",
        "Location comparison",
        "Variance investigation",
        "Exception escalation",
        "Value tracking",
      ] as const,
    },
  },
  /**
   * Bidirectional operating intelligence map.
   * Status labels must stay honest with the integrations registry.
   * available | context | connect | planned - never "Live" unless live.
   */
  operatingMaps: {
    restaurants: {
      systems: [
        { id: "reservations", label: "Reservations", status: "available" as const },
        { id: "pos", label: "POS", status: "available" as const },
        { id: "labor", label: "Labor", status: "available" as const },
        { id: "suppliers", label: "Suppliers", status: "available" as const },
        { id: "weather", label: "Weather", status: "context" as const },
        { id: "more", label: "And more", status: "connect" as const },
      ],
      signals: [
        { id: "covers", label: "Covers and demand", from: "reservations" },
        { id: "sales", label: "Sales and margin", from: "pos" },
        { id: "schedules", label: "Labor schedules", from: "labor" },
        { id: "invoice", label: "Invoice and pricing", from: "suppliers" },
        { id: "external", label: "External context", from: "weather" },
      ],
      outcomes: [
        { id: "revenue", title: "More revenue", detail: "Capture demand" },
        { id: "costs", title: "Lower costs", detail: "Stop leakage" },
        { id: "work", title: "Less manual work", detail: "Work prepared, not found" },
        { id: "time", title: "Return attention", detail: "More time for hospitality" },
        { id: "value", title: "Verified value", detail: "Proof, not promises" },
      ],
      /** Systems highlighted in the default terrace scenario */
      scenarioFocus: ["reservations", "pos", "labor", "weather"] as const,
      story: {
        id: "weather",
        territory: "SELL",
        finding: "Tomorrow's terrace demand is above plan.",
        covers: "+14 projected covers",
        gross: "$420 gross opportunity",
        cost: "$72 cost to capture",
        net: "$348 expected net value",
        prepare: "Staffing adjustment ready for approval",
        approval: "Manager approval required",
        observed: "Service and labor outcome returns",
        verified: "Verified when the outcome is observed.",
        note: "Weather story uses canonical SELL economics. No Verified Value is claimed until observation exists.",
      },
    },
    hotels: {
      systems: [
        { id: "pms", label: "PMS", status: "planned" as const },
        { id: "bookings", label: "Bookings", status: "planned" as const },
        { id: "revenue", label: "Revenue management", status: "planned" as const },
        { id: "housekeeping", label: "Housekeeping", status: "planned" as const },
        { id: "channel", label: "Channel manager", status: "planned" as const },
        { id: "weather", label: "Weather", status: "context" as const },
      ],
      signals: [
        { id: "occupancy", label: "Occupancy and pickup", from: "bookings" },
        { id: "adr", label: "ADR and RevPAR", from: "revenue" },
        { id: "inventory", label: "Room inventory", from: "pms" },
        { id: "channel", label: "Channel economics", from: "channel" },
        { id: "hk", label: "Housekeeping demand", from: "housekeeping" },
        { id: "external", label: "External context", from: "weather" },
      ],
      outcomes: [
        { id: "demand", title: "Capture more demand", detail: "Revenue opportunity" },
        { id: "dist", title: "Reduce leakage", detail: "Prevent avoidable loss" },
        { id: "work", title: "Remove manual work", detail: "Prepared, not investigated" },
        { id: "plan", title: "Return attention", detail: "More time for hospitality" },
        { id: "value", title: "Verified value", detail: "Proof of observed outcomes" },
      ],
      scenarioFocus: ["pms", "bookings", "revenue"] as const,
      story: {
        id: "hotel",
        territory: "SELL",
        finding: "Premium room demand is pacing ahead of current pricing.",
        covers: "Pickup ahead of rate plan",
        gross: "Rate opportunity under review",
        cost: "Pricing change prepared",
        net: "Premium pricing opportunity",
        prepare: "Premium rate review ready for approval",
        approval: "Manager approval required",
        observed: "Booking outcome returns for verification",
        verified: "Verified when supported.",
        note: "Hotel connectors are mostly planned. Map shows the operating model, not live writes.",
      },
    },
    bars: {
      systems: [
        { id: "pos", label: "POS", status: "available" as const },
        { id: "labor", label: "Labor", status: "available" as const },
        { id: "inventory", label: "Inventory", status: "planned" as const },
        { id: "suppliers", label: "Suppliers", status: "available" as const },
        { id: "weather", label: "Weather", status: "context" as const },
        { id: "events", label: "Events", status: "context" as const },
      ],
      signals: [
        { id: "daypart", label: "Daypart demand", from: "pos" },
        { id: "mix", label: "Product mix", from: "pos" },
        { id: "schedules", label: "Labor schedules", from: "labor" },
        { id: "stock", label: "Stock position", from: "inventory" },
        { id: "pricing", label: "Supplier pricing", from: "suppliers" },
        { id: "external", label: "External context", from: "weather" },
      ],
      outcomes: [
        { id: "demand", title: "Capture more demand", detail: "Revenue opportunity" },
        { id: "waste", title: "Reduce leakage", detail: "Prevent avoidable loss" },
        { id: "work", title: "Remove manual work", detail: "Prepared, not investigated" },
        { id: "time", title: "Return attention", detail: "More time for hospitality" },
        { id: "value", title: "Verified value", detail: "Proof of observed outcomes" },
      ],
      scenarioFocus: ["pos", "labor", "weather"] as const,
      story: {
        id: "bar-weather",
        territory: "SELL",
        finding: "Warm afternoon demand is above the current plan.",
        covers: "Daypart response prepared",
        gross: "Opportunity identified",
        cost: "Staffing check prepared",
        net: "Afternoon demand opportunity",
        prepare: "Staffing adjustment ready for approval",
        approval: "Manager approval required",
        observed: "Service outcome returns for verification",
        verified: "Verified when supported.",
        note: "Bar and café map uses directional examples where connectors are incomplete.",
      },
    },
    groups: {
      systems: [
        { id: "locations", label: "Locations", status: "available" as const },
        { id: "finance", label: "Finance", status: "planned" as const },
        { id: "labor", label: "Labor", status: "available" as const },
        { id: "procurement", label: "Procurement", status: "available" as const },
        { id: "reservations", label: "Reservations", status: "available" as const },
        { id: "performance", label: "Performance", status: "available" as const },
      ],
      signals: [
        { id: "variance", label: "Portfolio variance", from: "performance" },
        { id: "location", label: "Location performance", from: "locations" },
        { id: "labor", label: "Labor efficiency", from: "labor" },
        { id: "supplier", label: "Supplier exposure", from: "procurement" },
        { id: "value", label: "Verified Value", from: "finance" },
        { id: "exceptions", label: "Cross location exceptions", from: "locations" },
      ],
      outcomes: [
        { id: "compare", title: "Compare locations clearly", detail: "Variance decomposition" },
        { id: "escalate", title: "Escalate what needs attention", detail: "Portfolio exceptions" },
        { id: "work", title: "Remove manual work", detail: "Briefs prepared" },
        { id: "track", title: "Track Verified Value", detail: "Across the portfolio" },
        { id: "govern", title: "Keep approvals governed", detail: "Role and threshold aware" },
      ],
      scenarioFocus: ["locations", "labor", "finance"] as const,
      story: {
        id: "group",
        territory: "GROUP",
        finding: "One location is underperforming the group plan.",
        covers: "Variance brief prepared",
        gross: "Exception escalated",
        cost: "Attention required",
        net: "Location variance",
        prepare: "Group operating brief ready",
        approval: "Escalation ready",
        observed: "Location outcome returns",
        verified: "Verified Value tracked.",
        note: "Group view prioritizes variance and escalation, not fabricated portfolio savings.",
      },
    },
  },
  capabilities: [
    "Finds what matters",
    "Calculates the opportunity",
    "Prepares the next step",
    "Gets approval where needed",
    "Verifies the result",
  ] as const,
  proofChain: [
    { label: "Finding", value: "Late cancellation" },
    { label: "Potential", value: "$192" },
    { label: "Prepared action", value: "Replacement from waitlist" },
    { label: "Outcome", value: "Service completed" },
    { label: "Observed", value: "POS $184" },
    { label: "Verified Value", value: "$184" },
  ] as const,
  askCompact: [
    {
      q: "What needs me right now?",
      lead: "Peak staffing is your highest priority.",
      metrics: [
        { label: "At risk", value: "$290" },
        { label: "Window", value: "19:00 to 20:30" },
        { label: "Prepared", value: "Add one FOH" },
      ],
      why: "Expected peak demand exceeds scheduled FOH capacity for the service period.",
      outcome: "Staffing change is ready for approval.",
      meta: "Approval required",
    },
    {
      q: "What did RADR handle today?",
      lead: "One recovery completed and verified.",
      metrics: [
        { label: "Potential", value: "$192" },
        { label: "Observed", value: "$184" },
        { label: "Verified", value: "$184" },
      ],
      why: "Table 14 cancellation was replaced from the waitlist and POS recorded the cover.",
      outcome: "Verified Value attributed to the recovery.",
      meta: "Verified",
    },
    {
      q: "Why is labor at risk?",
      lead: "Peak service demand exceeds scheduled FOH capacity.",
      metrics: [
        { label: "Expected", value: "68 covers" },
        { label: "Capacity", value: "54 covers" },
        { label: "At risk", value: "$290" },
      ],
      why: "One additional FOH is prepared at $72 cost to protect $290 of service value.",
      outcome: "Shift change prepared for approval.",
      meta: "Approval required",
    },
    {
      q: "Why is this supplier invoice wrong?",
      lead: "Invoice pricing exceeds contracted rates.",
      metrics: [
        { label: "Recoverable", value: "$118" },
        { label: "Evidence", value: "Contract match" },
        { label: "Prepared", value: "Supplier claim" },
      ],
      why: "Contract located and variance calculated against the invoiced rate.",
      outcome: "Claim prepared for finance review.",
      meta: "Approval required",
    },
    {
      q: "What are we waiting to verify?",
      lead: "Expected recovery was higher than observed.",
      metrics: [
        { label: "Potential", value: "$192" },
        { label: "Observed", value: "$184" },
        { label: "Verified", value: "$184" },
      ],
      why: "The replacement guest completed service and POS recorded $184.",
      outcome: "Variance retained for future recovery estimates.",
      meta: "Evidence attached",
    },
    {
      q: "Which location needs attention?",
      lead: "Halcyon House · SoHo has the highest unresolved exposure.",
      metrics: [
        { label: "Exposed", value: "$408" },
        { label: "Labor", value: "$290" },
        { label: "Buy", value: "$118" },
      ],
      why: "Labor risk tonight and a supplier discrepancy at Orchard remain open.",
      outcome: "Two Findings ready for review.",
      meta: "Needs you",
    },
  ] as const,
} as const;

export type HomepageWeatherOpportunity = {
  gross: number;
  laborCost: number;
  net: number;
  constrainedCovers: number;
  doNothingValue: number;
  calc: string;
  netCalc: string;
  doNothingCalc: string;
};

export function homepageWeatherOpportunity(): HomepageWeatherOpportunity {
  const w = HOMEPAGE_DEMO.findings.sell.weather;
  const gross = w.incrementalCovers * w.contributionPerCover;
  const net = gross - w.laborCostToCapture;
  const constrainedCovers = w.expectedDemand - w.fohPlan;
  const doNothingValue = constrainedCovers * w.contributionPerCover;
  return {
    gross,
    laborCost: w.laborCostToCapture,
    net,
    constrainedCovers,
    doNothingValue,
    calc: `${w.incrementalCovers} covers × $${w.contributionPerCover} contribution = $${gross}`,
    netCalc: `$${gross} gross − $${w.laborCostToCapture} FOH cost = $${net} net`,
    doNothingCalc: `${constrainedCovers} constrained covers × $${w.contributionPerCover} = $${doNothingValue}`,
  };
}

/** Assert homepage ledger stays internally consistent. */
export function assertHomepageDemoMath(): void {
  const { labor, buy, total } = HOMEPAGE_DEMO.exposure;
  if (labor + buy !== total) {
    throw new Error(
      `Homepage demo exposure mismatch: ${labor}+${buy} !== ${total}`,
    );
  }
  if (HOMEPAGE_DEMO.verified.amount !== HOMEPAGE_DEMO.findings.recover.amount) {
    throw new Error("Verified amount must match recover finding.");
  }
  const lineSum = HOMEPAGE_DEMO.findings.buy.invoiceLines.reduce(
    (s, l) => s + l.variance,
    0,
  );
  if (lineSum !== buy) {
    throw new Error(
      `Homepage demo BUY line variances ${lineSum} !== buy ${buy}`,
    );
  }
  const w = HOMEPAGE_DEMO.findings.sell.weather;
  const gross = w.incrementalCovers * w.contributionPerCover;
  if (gross !== HOMEPAGE_DEMO.findings.sell.amount) {
    throw new Error(
      `Weather gross ${gross} !== sell amount ${HOMEPAGE_DEMO.findings.sell.amount}`,
    );
  }
  const opp = homepageWeatherOpportunity();
  if (opp.net !== gross - w.laborCostToCapture) {
    throw new Error("Weather net does not reconcile.");
  }
  if (
    opp.doNothingValue !==
    (w.expectedDemand - w.fohPlan) * w.contributionPerCover
  ) {
    throw new Error("Weather do-nothing does not reconcile.");
  }
}

export function formatHomepageUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

assertHomepageDemoMath();
