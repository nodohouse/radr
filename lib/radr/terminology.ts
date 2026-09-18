/**
 * RADR terminology: single source of truth for tooltips, subtitles, glossary.
 * Customer-configurable calculation rules can later override `calculationDescription`.
 */

export type TermCategory =
  | "reservations"
  | "operations"
  | "sales"
  | "finance"
  | "labor"
  | "purchasing"
  | "forecasting"
  | "recovery"
  | "actions"
  | "radr";

export type TermDefinition = {
  id: string;
  /** Display term (professional) */
  term: string;
  /** Alias used by MetricExplain / existing call sites */
  label: string;
  /** One-line plain English */
  shortDefinition: string;
  /** Optional deeper explanation */
  longDefinition?: string;
  /** Layer-1 subtitle under a metric when space allows */
  subtitle?: string;
  /** Plain-language example */
  example?: string;
  /** How RADR calculates this (org config may override later) */
  calculationDescription?: string;
  /** Whether calculation rules can vary by customer */
  configurable?: boolean;
  dataSources?: readonly string[];
  lastUpdated?: string;
  category: TermCategory;
  unit?: string;
  aliases?: readonly string[];
  /** Expanded form for abbreviations, e.g. "Front of House" */
  expandsTo?: string;
};

function t(
  partial: Omit<TermDefinition, "label"> & { label?: string },
): TermDefinition {
  return {
    ...partial,
    label: partial.label ?? partial.term,
  };
}

export const TERMINOLOGY = {
  /* ── Reservations ── */
  reservation: t({
    id: "reservation",
    term: "Reservation",
    category: "reservations",
    shortDefinition:
      "A booking made for a party to dine at a specific date and time.",
    subtitle: "Bookings currently confirmed",
    example: "One reservation for four guests = one reservation and four covers.",
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  reservations: t({
    id: "reservations",
    term: "Reservations",
    category: "reservations",
    shortDefinition:
      "Number of booking records for the selected period. Not the same as covers: one reservation can include multiple guests.",
    subtitle: "Bookings currently confirmed",
    example: "46 reservations can represent 118 covers.",
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  cover: t({
    id: "cover",
    term: "Cover",
    category: "reservations",
    shortDefinition: "One restaurant guest.",
    subtitle: "Guests",
    example: "A table of four represents four covers.",
    aliases: ["covers"],
  }),
  covers: t({
    id: "covers",
    term: "Covers",
    category: "reservations",
    shortDefinition: "The number of guests served or expected to be served.",
    subtitle: "Guests",
    example: "122 covers yesterday means 122 guests were served.",
    dataSources: ["POS", "Booking system"],
    lastUpdated: "Today",
  }),
  bookedCovers: t({
    id: "bookedCovers",
    term: "Booked covers",
    category: "reservations",
    shortDefinition:
      "The number of guests currently confirmed through reservations.",
    subtitle: "Guests currently booked",
    example: "46 reservations may represent 118 booked covers.",
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  forecastCovers: t({
    id: "forecastCovers",
    term: "Forecast covers",
    category: "forecasting",
    shortDefinition:
      "RADR's estimate of total guests expected to be served, including booked guests and additional expected demand.",
    subtitle: "Guests RADR expects to serve",
    example: "118 booked + 24 expected additional = 142 forecast covers.",
    calculationDescription:
      "Booked covers + expected additional covers (later bookings and walk-ins).",
    dataSources: ["Booking system", "POS history", "Local demand model"],
    lastUpdated: "2 min ago",
  }),
  expectedCovers: t({
    id: "expectedCovers",
    term: "Expected covers",
    category: "forecasting",
    shortDefinition:
      "Estimated number of guests expected to be served during the selected period.",
    subtitle: "Guests expected",
    calculationDescription:
      "Current reservations, expected walk-ins, historical day-of-week demand, and known demand signals.",
    dataSources: ["Booking system", "POS history", "Local demand model"],
    lastUpdated: "2 min ago",
  }),
  expectedAdditionalCovers: t({
    id: "expectedAdditionalCovers",
    term: "Expected additional covers",
    category: "forecasting",
    shortDefinition:
      "Guests RADR expects beyond those already booked: later bookings or walk-in demand.",
    subtitle: "Beyond current bookings",
    example: "24 expected additional covers on top of 118 booked.",
    dataSources: ["Booking system", "Historical demand"],
    lastUpdated: "2 min ago",
  }),
  walkIn: t({
    id: "walkIn",
    term: "Walk-in",
    category: "reservations",
    shortDefinition: "A guest who arrives without an existing reservation.",
  }),
  partySize: t({
    id: "partySize",
    term: "Party size",
    category: "reservations",
    shortDefinition: "The number of guests included in a reservation.",
    example: "A party size of 4 means four covers on that booking.",
  }),
  groupBooking: t({
    id: "groupBooking",
    term: "Group booking",
    category: "reservations",
    shortDefinition:
      "A reservation large enough to need extra operational attention. The size threshold can vary by restaurant.",
    subtitle: "Above this location's group-size threshold",
    example: "A location may treat 8+ guests as a group.",
    configurable: true,
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  largeParty: t({
    id: "largeParty",
    term: "Large party",
    category: "reservations",
    shortDefinition:
      "A reservation with an unusually high guest count relative to normal bookings at that location.",
    configurable: true,
  }),
  privateEventBooking: t({
    id: "privateEventBooking",
    term: "Private / event booking",
    category: "reservations",
    shortDefinition:
      "A reservation involving a private area, event, buyout, or special service arrangement.",
  }),
  bookingChannel: t({
    id: "bookingChannel",
    term: "Booking channel",
    category: "reservations",
    shortDefinition:
      "Where the reservation originated: the restaurant's own system or an external platform.",
  }),
  bookingLeadTime: t({
    id: "bookingLeadTime",
    term: "Booking lead time",
    category: "reservations",
    shortDefinition:
      "How long between when a reservation is made and when guests are scheduled to arrive.",
  }),
  cancellationLeadTime: t({
    id: "cancellationLeadTime",
    term: "Cancellation lead time",
    category: "reservations",
    shortDefinition:
      "How long before the reservation time the booking was cancelled.",
  }),
  lateCancellation: t({
    id: "lateCancellation",
    term: "Late cancellation",
    category: "reservations",
    shortDefinition:
      "A reservation cancelled close enough to service that replacing it may be difficult. The exact threshold can vary by restaurant.",
    configurable: true,
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  waitlist: t({
    id: "waitlist",
    term: "Waitlist",
    category: "reservations",
    shortDefinition:
      "Guests or parties waiting for inventory. RADR evaluates whether a cancellation can be recovered by matching waitlist demand.",
    example: "7 guests · 3 parties waiting for 20:00 inventory.",
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  recoverableValue: t({
    id: "recoverableValue",
    term: "Recoverable value",
    category: "finance",
    shortDefinition:
      "The portion of exposed booking value RADR believes can still be protected or recovered through an action, for example matching a waitlist party to a late cancellation.",
  }),
  recoveryOpportunity: t({
    id: "recoveryOpportunity",
    term: "Recovery opportunity",
    category: "reservations",
    shortDefinition:
      "A time-sensitive chance to refill perishable inventory after a cancellation. Not a cancellation alert - a prepared recovery path.",
    aliases: ["table opened", "cancellation recovery"],
  }),
  guestOpportunity: t({
    id: "guestOpportunity",
    term: "Guest opportunity",
    category: "operations",
    shortDefinition:
      "At most one or two relevant hospitality suggestions for a table - timing, occasion, and preference first. Never margin-only.",
  }),
  activeRevenue: t({
    id: "activeRevenue",
    term: "Active revenue",
    category: "finance",
    shortDefinition:
      "Recover value that would disappear and recommend what fits the guest - then verify outcomes. Not a sales quota engine.",
  }),
  dataHealth: t({
    id: "dataHealth",
    term: "Data health",
    category: "radr",
    shortDefinition:
      "Freshness of connected systems. Live means current; Partial means at least one source is delayed; Stale means a material source is out of date.",
  }),
  noShow: t({
    id: "noShow",
    term: "No-show",
    category: "reservations",
    shortDefinition:
      "A reservation where guests do not arrive and the booking was not cancelled beforehand.",
  }),
  rebookedInventory: t({
    id: "rebookedInventory",
    term: "Rebooked / replaced inventory",
    category: "reservations",
    shortDefinition:
      "Cancelled table capacity that was subsequently booked by another guest.",
  }),
  cancelledReservations: t({
    id: "cancelledReservations",
    term: "Cancelled reservations",
    category: "reservations",
    shortDefinition:
      "Reservations cancelled for the selected period. RADR treats these as financial events, not just booking counts.",
    dataSources: ["Booking system"],
    lastUpdated: "2 min ago",
  }),
  bookingPace: t({
    id: "bookingPace",
    term: "Booking pace",
    category: "forecasting",
    shortDefinition:
      "How quickly reservations and covers are filling compared with similar days or the forecast.",
    subtitle: "vs comparable Wednesday",
    example:
      "118 covers booked now versus 108 at the same point before comparable Wednesdays → +9.3%.",
    dataSources: ["Booking system", "Historical demand"],
    lastUpdated: "2 min ago",
  }),

  /* ── Capacity / floor ── */
  seats: t({
    id: "seats",
    term: "Seats",
    category: "operations",
    shortDefinition: "The physical guest capacity available at the restaurant.",
    example: "Berlin Mitte has 72 seats.",
  }),
  table: t({
    id: "table",
    term: "Table",
    category: "operations",
    shortDefinition:
      "A physical table or combinable table configuration on the restaurant floor.",
  }),
  section: t({
    id: "section",
    term: "Section",
    category: "operations",
    shortDefinition:
      "A defined area of the restaurant floor, often assigned to specific service staff.",
  }),
  occupancy: t({
    id: "occupancy",
    term: "Occupancy",
    category: "operations",
    shortDefinition:
      "The share of available restaurant capacity expected to be occupied during a specific period. Always check which period is shown.",
    configurable: true,
  }),
  peakOccupancy: t({
    id: "peakOccupancy",
    term: "Peak occupancy",
    category: "operations",
    shortDefinition:
      "The highest expected share of available seats occupied at the same time during the selected service period.",
    subtitle: "Highest expected seat occupancy",
    example: "84% peak occupancy means about 60 of 72 seats filled at the busiest moment.",
    dataSources: ["Booking system", "Floor plan"],
    lastUpdated: "2 min ago",
  }),
  tableTurn: t({
    id: "tableTurn",
    term: "Table turn",
    category: "operations",
    shortDefinition: "One complete use of a table by a party.",
    example:
      "If Table 12 serves one party at 18:00 and another at 20:30, it has completed two turns.",
  }),
  expectedTurns: t({
    id: "expectedTurns",
    term: "Expected turns",
    category: "operations",
    shortDefinition:
      "How many parties a table is expected to serve during the selected service period.",
  }),
  tableUtilization: t({
    id: "tableUtilization",
    term: "Table utilization",
    category: "operations",
    shortDefinition:
      "How effectively available table capacity is being used during a period.",
  }),
  seatUtilization: t({
    id: "seatUtilization",
    term: "Seat utilization",
    category: "operations",
    shortDefinition:
      "How much of the restaurant's available seating capacity is actually being used.",
  }),
  servicePeriod: t({
    id: "servicePeriod",
    term: "Service period",
    category: "operations",
    shortDefinition:
      "A defined operating period such as breakfast, lunch, or dinner.",
  }),
  peakService: t({
    id: "peakService",
    term: "Peak service",
    category: "operations",
    shortDefinition:
      "The period when guest arrivals and active tables create the highest operational demand.",
    example: "Tonight's peak service is 19:00-20:30.",
  }),
  servicePressure: t({
    id: "servicePressure",
    term: "Service pressure",
    category: "operations",
    shortDefinition:
      "RADR's estimate of how heavily a section or team is loaded relative to its expected operating capacity. This is a RADR operational indicator, not a standard accounting metric.",
    subtitle: "Load vs service capacity",
    dataSources: ["Reservations", "Floor plan", "Labor schedule"],
    lastUpdated: "2 min ago",
  }),

  /* ── Revenue / finance ── */
  revenue: t({
    id: "revenue",
    term: "Revenue",
    category: "finance",
    shortDefinition:
      "Sales generated during the selected period. Exact tax and service-charge treatment follows your organization's accounting configuration.",
    subtitle: "Sales for the selected period",
    configurable: true,
    dataSources: ["POS"],
    lastUpdated: "Today",
  }),
  forecastRevenue: t({
    id: "forecastRevenue",
    term: "Forecast revenue",
    category: "forecasting",
    shortDefinition:
      "RADR's estimate of revenue expected during the selected future period.",
    subtitle: "Estimated sales tonight",
    calculationDescription:
      "Forecast covers × expected spend per cover (booked value + expected additional demand).",
    dataSources: ["Booking system", "POS history", "Local demand model"],
    lastUpdated: "2 min ago",
    configurable: true,
  }),
  actualRevenue: t({
    id: "actualRevenue",
    term: "Actual revenue",
    category: "finance",
    shortDefinition:
      "Revenue recorded for a completed or current period from connected transaction data.",
    dataSources: ["POS"],
  }),
  netSales: t({
    id: "netSales",
    term: "Net sales",
    category: "finance",
    shortDefinition:
      "Gross sales after discounts and refunds for the selected period. Deposits held are not net sales until earned.",
    subtitle: "Gross − discounts − refunds",
    calculationDescription:
      "POS gross sales − discounts − refunds (comps may appear separately).",
    dataSources: ["POS"],
    lastUpdated: "Live",
  }),
  liveContribution: t({
    id: "liveContribution",
    term: "Live contribution",
    category: "finance",
    shortDefinition:
      "Net sales less direct operating costs RADR can see for the service window (COGS estimate, direct labor, channel fees, payment fees, comps/refunds economic impact). Not accounting profit.",
    longDefinition:
      "Excludes overhead, depreciation, and full accruals. Use this for shift economics before the books close. Never label as profit.",
    subtitle: "Operating contribution tonight",
    calculationDescription:
      "Net sales − COGS − direct labor − channel fees − payment fees − comps/refunds economic impact.",
    dataSources: ["POS", "Labor", "Recipes", "Delivery", "Payments"],
    lastUpdated: "Live",
    configurable: true,
  }),
  channelFees: t({
    id: "channelFees",
    term: "Delivery / channel fees",
    category: "finance",
    shortDefinition:
      "Platform commissions and channel costs on delivery or marketplace volume.",
    dataSources: ["Delivery platforms"],
  }),
  paymentFees: t({
    id: "paymentFees",
    term: "Payment fees",
    category: "finance",
    shortDefinition:
      "Card, wallet, and processor fees on settled payment volume.",
    dataSources: ["Payment processor"],
  }),
  channelGrossSales: t({
    id: "channelGrossSales",
    term: "Channel gross sales",
    category: "finance",
    shortDefinition:
      "Gross sales attributed to a sales channel or delivery provider after POS↔aggregator dedupe. Not double-counted into net sales.",
    dataSources: ["POS", "Delivery platforms"],
  }),
  channelContributionShare: t({
    id: "channelContributionShare",
    term: "Contribution share",
    category: "finance",
    shortDefinition:
      "Share of live contribution produced by a channel. Compare to revenue share to judge revenue quality.",
    calculationDescription:
      "Channel live contribution ÷ total live contribution × 100.",
  }),
  channelPackaging: t({
    id: "channelPackaging",
    term: "Packaging",
    category: "finance",
    shortDefinition:
      "Containers, bags, and delivery packaging cost attributed to off-premise orders.",
    dataSources: ["Purchasing", "Recipes"],
  }),
  channelPromotion: t({
    id: "channelPromotion",
    term: "Channel promotion",
    category: "finance",
    shortDefinition:
      "Platform campaign economics. Restaurant-funded discounts reduce contribution; platform-funded do not. Order growth alone is not success.",
    dataSources: ["Delivery platforms"],
  }),
  deliveryPressure: t({
    id: "deliveryPressure",
    term: "Delivery pressure",
    category: "operations",
    shortDefinition:
      "Kitchen load and dine-in service impact from open delivery tickets - capacity consumed, not just revenue earned.",
  }),
  averageSpendPerCover: t({
    id: "averageSpendPerCover",
    term: "Average spend per cover",
    category: "sales",
    shortDefinition: "Average revenue generated per guest.",
    subtitle: "Revenue ÷ covers",
    example: "€7,812 ÷ 122 covers ≈ €64.03 per cover.",
    calculationDescription: "Revenue ÷ covers for the selected period.",
    dataSources: ["POS"],
    lastUpdated: "Today",
    aliases: ["avgSpend", "revenuePerCover"],
  }),
  bookingValue: t({
    id: "bookingValue",
    term: "Booking value",
    category: "sales",
    shortDefinition:
      "Estimated financial value of a reservation: usually party size × expected spend per cover, unless prepaid or contracted value is known.",
    example: "4 covers × €64 ≈ €256 booking value.",
  }),
  bookingValueAffected: t({
    id: "bookingValueAffected",
    term: "Booking value affected",
    category: "sales",
    shortDefinition:
      "Estimated value of reservations that were cancelled or otherwise affected. This does not mean the revenue was lost.",
    longDefinition:
      "Cancelled booking value is the starting point. Expected natural rebooking is subtracted to estimate what remains exposed.",
    calculationDescription:
      "Cancelled covers × expected spend per cover for those reservations.",
    dataSources: ["Booking system", "Historical spend"],
    lastUpdated: "2 min ago",
  }),
  revenueAtRisk: t({
    id: "revenueAtRisk",
    term: "Revenue currently at risk",
    category: "sales",
    shortDefinition:
      "Estimated revenue that may remain unrecovered if no corrective action occurs. Predictive, not confirmed lost revenue.",
    subtitle: "May remain unrecovered",
    calculationDescription:
      "Booking value affected − expected natural rebooking / replacement.",
    example:
      "€576 affected − €380 expected rebooking ≈ €196 currently at risk.",
    dataSources: ["Booking system", "Replacement demand model"],
    lastUpdated: "2 min ago",
  }),
  revenueAtRiskGeneric: t({
    id: "revenueAtRiskGeneric",
    term: "Revenue at risk",
    category: "sales",
    shortDefinition:
      "Estimated revenue that may not be realized if no action is taken. Not verified value.",
    lastUpdated: "2 min ago",
  }),
  revenueProtected: t({
    id: "revenueProtected",
    term: "Revenue protected",
    category: "sales",
    shortDefinition:
      "Estimated revenue an action may help preserve. Not Verified Value unless later supported by evidence.",
  }),
  expectedRevenueProtected: t({
    id: "expectedRevenueProtected",
    term: "Expected revenue protected",
    category: "actions",
    shortDefinition:
      "Estimated revenue that may be protected if the recommended action is taken. Not verified value.",
    lastUpdated: "2 min ago",
  }),
  potentialRevenue: t({
    id: "potentialRevenue",
    term: "Potential revenue",
    category: "sales",
    shortDefinition:
      "Revenue RADR estimates could be generated if an identified opportunity is captured. Not guaranteed.",
  }),
  contributionAtRisk: t({
    id: "contributionAtRisk",
    term: "Contribution at risk",
    category: "finance",
    shortDefinition:
      "Estimated revenue at risk after variable operating costs.",
    lastUpdated: "2 min ago",
    configurable: true,
  }),
  expectedContributionProtected: t({
    id: "expectedContributionProtected",
    term: "Expected contribution protected",
    category: "actions",
    shortDefinition:
      "Estimated contribution margin protected after variable costs if the action succeeds.",
    lastUpdated: "2 min ago",
    configurable: true,
  }),

  /* ── Margin ── */
  grossMargin: t({
    id: "grossMargin",
    term: "Gross margin",
    category: "finance",
    shortDefinition:
      "Revenue remaining after the direct cost of goods sold.",
    calculationDescription: "Revenue − cost of goods sold.",
    configurable: true,
  }),
  contributionMargin: t({
    id: "contributionMargin",
    term: "Contribution margin",
    category: "finance",
    shortDefinition:
      "Live contribution as a percentage of net sales. Included costs depend on configuration. Expressed in percent; changes are in percentage points (pts).",
    calculationDescription: "Live contribution ÷ net sales × 100.",
    configurable: true,
    aliases: ["liveContributionMargin"],
  }),
  operatingMargin: t({
    id: "operatingMargin",
    term: "Operating margin",
    category: "finance",
    shortDefinition:
      "Operating profit as a percentage of revenue after the operating costs included in RADR's configured calculation. Definitions can vary by organization.",
    subtitle: "Operating profit ÷ revenue",
    calculationDescription:
      "Calculated using your organization's configured operating-cost definition.",
    configurable: true,
    dataSources: ["POS", "Labor", "Cost of goods"],
    lastUpdated: "Today",
  }),
  forecastMargin: t({
    id: "forecastMargin",
    term: "Forecast operating margin",
    category: "forecasting",
    shortDefinition:
      "Expected operating profit as a percentage of revenue after the operating costs currently included in RADR's forecast.",
    subtitle: "Expected operating profit %",
    calculationDescription:
      "Forecast contribution after food, beverage, and labor costs in the operating model.",
    dataSources: ["POS", "Labor schedule", "Cost of goods"],
    lastUpdated: "2 min ago",
    configurable: true,
  }),
  marginPoints: t({
    id: "marginPoints",
    term: "Margin points (pts)",
    category: "finance",
    shortDefinition:
      "Percentage-point movement in margin, not a percent change of the margin itself.",
    example: "18.0% → 19.0% = +1.0 percentage points (pts), not +1%.",
  }),

  /* ── Labor ── */
  laborCost: t({
    id: "laborCost",
    term: "Labor cost",
    category: "labor",
    shortDefinition: "The cost of restaurant labor during the selected period.",
    configurable: true,
    dataSources: ["Labor scheduling", "Payroll"],
  }),
  laborCostPct: t({
    id: "laborCostPct",
    term: "Labor cost %",
    category: "labor",
    shortDefinition: "Labor cost as a percentage of revenue.",
    subtitle: "Share of revenue",
    calculationDescription: "Labor cost ÷ revenue × 100.",
    configurable: true,
    dataSources: ["Labor scheduling", "POS"],
    lastUpdated: "Today",
  }),
  foh: t({
    id: "foh",
    term: "FOH",
    expandsTo: "Front of House",
    category: "labor",
    shortDefinition:
      "Front of House: guest-facing operations such as servers, hosts, and other service staff.",
    aliases: ["frontOfHouse"],
  }),
  boh: t({
    id: "boh",
    term: "BOH",
    expandsTo: "Back of House",
    category: "labor",
    shortDefinition:
      "Back of House: kitchen and other non-guest-facing production operations.",
    aliases: ["backOfHouse"],
  }),
  fte: t({
    id: "fte",
    term: "FTE",
    expandsTo: "Full-Time Equivalent",
    category: "labor",
    shortDefinition:
      "Full-Time Equivalent: a standardized way of expressing staffing workload.",
  }),
  staffingCapacity: t({
    id: "staffingCapacity",
    term: "Staffing capacity",
    category: "labor",
    shortDefinition:
      "RADR's estimate of how much guest demand the current staffing plan can reasonably support. Modeled operational capacity, not simply headcount.",
  }),
  staffingGap: t({
    id: "staffingGap",
    term: "Staffing gap",
    category: "labor",
    shortDefinition:
      "The difference between forecast staffing requirements and the current staffing plan.",
  }),
  overtime: t({
    id: "overtime",
    term: "Overtime",
    category: "labor",
    shortDefinition:
      "Labor hours paid above the applicable standard working-time threshold. Rules vary by country and contract.",
    configurable: true,
  }),

  /* ── Purchasing / BUY ── */
  cogs: t({
    id: "cogs",
    term: "COGS",
    expandsTo: "Cost of Goods Sold",
    category: "purchasing",
    shortDefinition:
      "The direct cost of products used to generate restaurant sales, typically food and beverage inputs.",
    configurable: true,
  }),
  foodCostPct: t({
    id: "foodCostPct",
    term: "Food cost %",
    category: "purchasing",
    shortDefinition:
      "Food cost expressed as a percentage of relevant food revenue.",
    configurable: true,
  }),
  beverageCostPct: t({
    id: "beverageCostPct",
    term: "Beverage cost %",
    category: "purchasing",
    shortDefinition:
      "Beverage cost expressed as a percentage of beverage revenue (wine, spirits, beer, soft).",
    configurable: true,
  }),
  beverageShare: t({
    id: "beverageShare",
    term: "Beverage share",
    category: "sales",
    shortDefinition:
      "Beverage net sales as a share of total F&B net. Not the same as bar seating revenue.",
  }),
  purchaseVariance: t({
    id: "purchaseVariance",
    term: "Purchase variance",
    category: "purchasing",
    shortDefinition:
      "The difference between expected purchasing cost and actual purchasing cost.",
  }),
  priceVariance: t({
    id: "priceVariance",
    term: "Price variance",
    category: "purchasing",
    shortDefinition:
      "The financial difference from paying a different unit price than expected or contracted.",
  }),
  usageVariance: t({
    id: "usageVariance",
    term: "Usage variance",
    category: "purchasing",
    shortDefinition:
      "The difference from using more or less product than expected.",
  }),
  supplierVariance: t({
    id: "supplierVariance",
    term: "Supplier variance",
    category: "purchasing",
    shortDefinition:
      "A difference RADR detects between expected supplier cost and invoiced or actual supplier cost.",
  }),
  contractedPrice: t({
    id: "contractedPrice",
    term: "Contracted price",
    category: "purchasing",
    shortDefinition:
      "The agreed price RADR expects based on applicable supplier terms.",
  }),
  invoiceVariance: t({
    id: "invoiceVariance",
    term: "Invoice variance",
    category: "purchasing",
    shortDefinition:
      "The difference between the amount invoiced and the amount RADR expected.",
  }),
  recoverable: t({
    id: "recoverable",
    term: "Recoverable value",
    category: "recovery",
    shortDefinition:
      "Money RADR believes may be recoverable through review, correction, reconciliation, or claim. Not yet Verified Value.",
    lastUpdated: "2 min ago",
  }),

  /* ── Recovery ── */
  identifiedValue: t({
    id: "identifiedValue",
    term: "Identified value",
    category: "recovery",
    shortDefinition:
      "Potential financial value detected by RADR that has not yet been confirmed as realized.",
  }),
  recoveredValue: t({
    id: "recoveredValue",
    term: "Recovered value",
    category: "recovery",
    shortDefinition:
      "Value recovered through a completed correction, credit, refund, or other action.",
  }),
  verifiedValue: t({
    id: "verifiedValue",
    term: "Verified value",
    category: "recovery",
    shortDefinition:
      "Financial impact RADR can support with evidence after the relevant action or outcome occurred.",
    longDefinition:
      "Distinct from identified, recoverable, or protected estimates. Verification requires subsequent evidence.",
    lastUpdated: "Today",
  }),
  credit: t({
    id: "credit",
    term: "Credit",
    category: "recovery",
    shortDefinition:
      "An amount returned or applied against an amount owed, typically after a supplier correction or reconciliation.",
  }),
  reconciliation: t({
    id: "reconciliation",
    term: "Reconciliation",
    category: "recovery",
    shortDefinition:
      "Comparing records from different sources to identify and resolve financial differences.",
  }),

  /* ── Forecasting ── */
  forecast: t({
    id: "forecast",
    term: "Forecast",
    category: "forecasting",
    shortDefinition:
      "RADR's estimate of a future operational or financial result based on available data.",
  }),
  plan: t({
    id: "plan",
    term: "Plan",
    category: "forecasting",
    shortDefinition:
      "The operating or financial target currently configured for the selected period.",
    configurable: true,
  }),
  budget: t({
    id: "budget",
    term: "Budget",
    category: "forecasting",
    shortDefinition: "The financial target allocated to a period or category.",
  }),
  actual: t({
    id: "actual",
    term: "Actual",
    category: "forecasting",
    shortDefinition:
      "The result recorded from completed or current operations.",
  }),
  variance: t({
    id: "variance",
    term: "Variance",
    category: "forecasting",
    shortDefinition:
      "The difference between an actual or forecast result and a comparison baseline. Always shown with the baseline (vs plan, vs forecast, vs comparable day).",
  }),
  yearOverYear: t({
    id: "yearOverYear",
    term: "Year over year",
    expandsTo: "Year over year (YoY)",
    category: "forecasting",
    shortDefinition:
      "Comparison with the equivalent period one year earlier.",
    aliases: ["yoy", "YoY"],
  }),
  comparableDay: t({
    id: "comparableDay",
    term: "Comparable day",
    category: "forecasting",
    shortDefinition:
      "A historical day RADR considers meaningfully similar: weekday, season, operating pattern, and other context.",
  }),
  confidence: t({
    id: "confidence",
    term: "Confidence",
    category: "forecasting",
    shortDefinition:
      "How strongly available data supports RADR's estimate or finding (High / Medium / Low). Confidence is not certainty.",
    lastUpdated: "2 min ago",
  }),
  forecastConfidence: t({
    id: "forecastConfidence",
    term: "Forecast confidence",
    category: "forecasting",
    shortDefinition:
      "How strongly available booking, historical, and operational data support this forecast.",
    calculationDescription:
      "Agreement between booked demand, historical patterns, and live operational signals.",
    dataSources: ["Bookings", "Historical demand", "Operational signals"],
    lastUpdated: "2 min ago",
  }),

  /* ── Actions / status ── */
  finding: t({
    id: "finding",
    term: "Finding",
    category: "actions",
    shortDefinition:
      "An operational or financial condition RADR detected that may need attention or represent an opportunity.",
  }),
  recommendation: t({
    id: "recommendation",
    term: "Recommendation",
    category: "actions",
    shortDefinition:
      "An action RADR suggests based on available evidence and expected financial outcome.",
  }),
  action: t({
    id: "action",
    term: "Action",
    category: "actions",
    shortDefinition:
      "A recommendation that has been accepted or entered into the operator's workflow.",
  }),
  expectedBenefit: t({
    id: "expectedBenefit",
    term: "Expected benefit",
    category: "actions",
    shortDefinition:
      "RADR's estimate of the positive financial outcome that may result from taking an action.",
  }),
  expectedNetBenefit: t({
    id: "expectedNetBenefit",
    term: "Expected net benefit",
    category: "actions",
    shortDefinition:
      "Expected financial benefit after subtracting the incremental cost of the recommended action.",
    example:
      "€105 contribution protected − €68 additional labor cost = €37 expected net benefit.",
    lastUpdated: "2 min ago",
  }),
  actNow: t({
    id: "actNow",
    term: "Act now",
    category: "actions",
    shortDefinition:
      "RADR believes action is time-sensitive. Delaying may reduce the chance to improve the outcome.",
  }),
  today: t({
    id: "today",
    term: "Today",
    category: "actions",
    shortDefinition:
      "The finding should be reviewed during the current operating day.",
  }),
  watch: t({
    id: "watch",
    term: "Watch",
    category: "actions",
    shortDefinition:
      "Something worth monitoring, but immediate intervention may not yet be justified.",
  }),
  statusNew: t({
    id: "statusNew",
    term: "New",
    category: "actions",
    shortDefinition: "Detected and not yet reviewed.",
  }),
  statusReviewed: t({
    id: "statusReviewed",
    term: "Reviewed",
    category: "actions",
    shortDefinition: "A user has reviewed the finding.",
  }),
  statusActioned: t({
    id: "statusActioned",
    term: "Actioned",
    category: "actions",
    shortDefinition: "An action has been taken or initiated.",
  }),
  statusMonitoring: t({
    id: "statusMonitoring",
    term: "Monitoring",
    category: "actions",
    shortDefinition:
      "RADR is observing the outcome after an action or developing situation.",
  }),
  statusResolved: t({
    id: "statusResolved",
    term: "Resolved",
    category: "actions",
    shortDefinition: "The operational issue is no longer active.",
  }),
  statusDismissed: t({
    id: "statusDismissed",
    term: "Dismissed",
    category: "actions",
    shortDefinition: "The finding was intentionally closed without action.",
  }),
  statusVerified: t({
    id: "statusVerified",
    term: "Verified",
    category: "actions",
    shortDefinition:
      "The relevant financial result has been supported by subsequent evidence.",
  }),

  /* ── Territories ── */
  territoryBuy: t({
    id: "territoryBuy",
    term: "BUY",
    category: "radr",
    shortDefinition:
      "What you spend. RADR monitors purchasing, supplier pricing, food cost, and other controllable spend.",
  }),
  territoryLabor: t({
    id: "territoryLabor",
    term: "LABOR",
    category: "radr",
    shortDefinition:
      "How you staff. RADR compares staffing plans and labor cost with expected operating demand.",
  }),
  territorySell: t({
    id: "territorySell",
    term: "SELL",
    category: "radr",
    shortDefinition:
      "How you monetize. RADR monitors reservations, demand, pricing, capacity, and how effectively demand becomes sales.",
  }),
  territoryRecover: t({
    id: "territoryRecover",
    term: "RECOVER",
    category: "radr",
    shortDefinition:
      "What you're owed. RADR finds money that may be recoverable through corrections, credits, and reconciliations.",
  }),

  /* ── RevPASH (architecture only: use when decision-relevant) ── */
  revpash: t({
    id: "revpash",
    term: "Revenue per available seat hour",
    expandsTo: "Revenue per available seat hour (RevPASH)",
    category: "sales",
    shortDefinition:
      "Revenue relative to available seating capacity and operating time. Only shown when it helps a decision.",
    aliases: ["RevPASH"],
  }),
} as const satisfies Record<string, TermDefinition>;

export type TermId = keyof typeof TERMINOLOGY;

export const TERM_CATEGORY_LABELS: Record<TermCategory, string> = {
  reservations: "Reservations",
  operations: "Operations",
  sales: "Sales",
  finance: "Finance",
  labor: "Labor",
  purchasing: "Purchasing",
  forecasting: "Forecasting",
  recovery: "Recovery",
  actions: "Actions & status",
  radr: "RADR",
};

export function getTerm(id: TermId): TermDefinition {
  return TERMINOLOGY[id];
}

export function displayTerm(id: TermId, opts?: { expand?: boolean }): string {
  const def = TERMINOLOGY[id];
  if (opts?.expand && def.expandsTo) {
    return `${def.expandsTo} (${def.term})`;
  }
  return def.term;
}

/**
 * Abbreviation with expansion in parentheses for operator UI
 * (e.g. "FOH (Front of House)") - use whenever jargon appears in a glance.
 */
export function abbrevWithExpansion(id: TermId): string {
  const def = TERMINOLOGY[id];
  if (!def.expandsTo) return def.term;
  return `${def.term} (${def.expandsTo})`;
}

export function searchTerms(query: string): TermDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(TERMINOLOGY);
  return Object.values(TERMINOLOGY).filter((def) => {
    const hay = [
      def.term,
      def.label,
      def.shortDefinition,
      def.expandsTo ?? "",
      ...(def.aliases ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function termsByCategory(category: TermCategory): TermDefinition[] {
  return Object.values(TERMINOLOGY).filter((d) => d.category === category);
}

/** First-time discovery: restrained; clears after interaction. */
const SEEN_KEY = "radr.terminology.seen";

export function isTermFresh(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    const seen = raw ? (JSON.parse(raw) as string[]) : [];
    return !seen.includes(id);
  } catch {
    return false;
  }
}

export function markTermSeen(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    const seen = raw ? (JSON.parse(raw) as string[]) : [];
    if (!seen.includes(id)) {
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]));
    }
  } catch {
    /* ignore */
  }
}
