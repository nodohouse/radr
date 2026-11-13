import { PUBLIC_SUPPLIER, PUBLIC_RESTAURANT } from "./publicCanon";
export const ECONOMIC_GUIDES = {
  buy: {
    title: "Understand what inputs really cost.",
    question: "Is the same input costing more than it should?",
    records:
      "Contracts, invoices, quantities, pack sizes and supplier credits.",
    comparison:
      "Normalize unit cost, delivery terms and quality before comparing suppliers or locations.",
    decision:
      "Compare a disputed invoice, a negotiation or an alternative purchase.",
    verify:
      "Match subsequent invoices and credits to the original difference. An agreed credit is not cash received.",
    example: `An invoice at ${PUBLIC_SUPPLIER.invoiceFormatted} versus ${PUBLIC_SUPPLIER.contractFormatted} contracted across ${PUBLIC_SUPPLIER.volumeL} litres exposes ${PUBLIC_SUPPLIER.exposureFormatted} on that invoice.`,
    source: "Illustrative matched-invoice example",
    next: "/blog/supplier-price-variance",
  },
  labor: {
    title: "Put capacity where it matters.",
    question:
      "Is staffing the constraint, or is the bottleneck somewhere else?",
    records:
      "Scheduled and worked hours, payroll, reservations, sales and service or room-release times.",
    comparison:
      "Compare the same service window. More staff will not fix a kitchen or room-release dependency by itself.",
    decision:
      "Compare the current plan with a different allocation or service pace.",
    verify:
      "Review labor cost alongside service timing, contribution and guest outcomes. Include the cost of the response.",
    example: `The restaurant demo compares seating immediately with this response: ${PUBLIC_RESTAURANT.actionLabel.toLowerCase()}. It models ${PUBLIC_RESTAURANT.expectedFormatted} expected protected tonight.`,
    source: "Illustrative service scenario, not a measured customer result",
    next: "/blog/peak-service-understaffed",
  },
  sell: {
    title: "Follow contribution, not volume alone.",
    question: "Which demand is worth accepting after costs and constraints?",
    records:
      "Bookings or orders, prices, acquisition fees, cancellations, capacity and service costs.",
    comparison:
      "Compare contribution after channel costs and the higher-value demand each option could displace.",
    decision:
      "Compare accepting demand now with changing its timing, price, channel or mix.",
    verify:
      "Review the outcome after the service window. A full room or restaurant alone does not prove a stronger contribution.",
    example:
      "The hotel demo puts remaining room inventory, channel costs and incoming demand in the same decision.",
    source: "Illustrative hotel operating context",
    next: "/blog/hotel-distribution-contribution",
  },
  recover: {
    title: "Follow the difference to its resolution.",
    question: "Did the expected money or operating outcome actually arrive?",
    records:
      "Sales, settlements, fee schedules, refunds, invoice credits and the relevant accounting entries.",
    comparison:
      "Allow for legitimate fees, timing differences and refunds before treating a gap as recoverable.",
    decision:
      "Prepare the evidence for a dispute, correction or documented explanation.",
    verify:
      "Match the receipt or posted credit to the original case. Keep an explained difference separate from recovered money.",
    example:
      "A supplier credit can resolve an invoice difference without being a separate bank receipt. Count the economic effect once.",
    source: "A review principle, not a savings estimate",
    next: "/blog/a-supplier-credit-is-not-recovered-money",
  },
} as const;
export type EconomicGuideId = keyof typeof ECONOMIC_GUIDES;
export function economicGuideId(
  value: string | undefined,
): EconomicGuideId | null {
  return value && Object.hasOwn(ECONOMIC_GUIDES, value)
    ? (value as EconomicGuideId)
    : null;
}
export const LEAK_FIELD_NOTES = {
  supplier: {
    records:
      "Contract or price list, matched invoice lines, delivered quantities and credits.",
    check:
      "Use the same unit and pack size. Allow for tax, freight and an approved price change.",
    proof: `(${PUBLIC_SUPPLIER.invoiceFormatted} − ${PUBLIC_SUPPLIER.contractFormatted}) × ${PUBLIC_SUPPLIER.volumeL} litres = ${PUBLIC_SUPPLIER.exposureFormatted} exposed on this invoice. Match any posted credit to these lines before closing the case.`,
    takeaway:
      "A price difference becomes a reviewable case when the terms, quantity and invoice agree.",
  },
  recon: {
    records:
      "Sales export, settlement statement, fee schedule, refunds and bank receipt.",
    check:
      "Use the same settlement window and currency. Allow for fees, refunds and timing before treating a difference as a loss.",
    proof:
      "Expected settlement = recorded sales minus valid fees and refunds. Compare that amount with the receipt; document any remaining difference.",
    takeaway:
      "An explained timing gap and recovered money are different outcomes.",
  },
  cost: {
    records:
      "Purchase invoices, recipes or usage standards, production volumes and waste records.",
    check:
      "Compare the same product, portion and service period. Separate price, volume, yield and waste effects.",
    proof:
      "Start with quantity used × comparable unit cost. Check whether a change came from the price paid or the amount consumed.",
    takeaway:
      "A higher cost percentage is a starting question, not a confirmed cause.",
  },
  proc: {
    records:
      "Comparable invoice lines by location, specifications, pack sizes and delivery terms.",
    check:
      "Normalize cost per usable unit. A cheaper pack can be more expensive after waste, minimum orders or delivery.",
    proof:
      "Compare normalized unit cost × the same quantity. Verify any change in subsequent invoices and service quality.",
    takeaway:
      "Compare equivalent inputs before recommending a supplier or rate change.",
  },
  perish: {
    records:
      "Room or table availability, demand, rates, booking channels and the service deadline.",
    check:
      "Include channel costs, capacity and displaced demand. Discounting can fill capacity while reducing contribution.",
    proof:
      "Compare contribution under each response, including doing nothing. Review the recorded outcome after the selling window closes.",
    takeaway:
      "An unsold service window cannot be carried into tomorrow; the response still needs to earn its cost.",
  },
} as const;
