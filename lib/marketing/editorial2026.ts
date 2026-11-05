export type EditorialContent = {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  sections: { heading: string; paragraphs: string[] }[];
  research?: {
    title: string;
    caption: string;
    rows: { label: string; value: number; display: string }[];
    sources: { title: string; url: string; scope: string }[];
    calculation: {
      title: string;
      assumptions: string;
      formula: string;
      result: string;
      limitation: string;
    };
  };
};
export const EDITORIAL_2026: Record<string, EditorialContent> = {
  peakCapacity: {
    title: "Your bestseller could be slowing down the whole restaurant",
    excerpt:
      "A dish can earn a healthy margin and still consume the kitchen minutes your busiest service cannot spare. Here is how to see the trade-off.",
    metaTitle: "The hidden capacity cost of a restaurant bestseller | RADR",
    metaDescription:
      "A practical guide to restaurant contribution per kitchen minute, peak capacity, menu mix, and evidence-led service decisions.",
    tags: ["Restaurants", "Menu mix", "Kitchen capacity", "BUY × LABOR × SELL"],
    sections: [
      {
        heading: "The dish looks good. The service tells another story.",
        paragraphs: [
          "The bestseller has a familiar place in the menu meeting. Guests order it, the ingredient margin looks healthy, and the team is proud of it. Taking it off the menu would feel like an obvious mistake. Yet on the busiest nights, that same dish may occupy the station everyone else is waiting for.",
          "This is where a useful menu conversation changes. The question becomes how much contribution the dish creates for each minute of the resource that is actually constrained. That resource might be the cold station, the grill, a particular piece of equipment, or the person who has to finish every plate.",
          "The answer can change by daypart. A dish that is an excellent choice on a quiet afternoon may have a different economic role between the first dinner rush and the next seating wave. Its recipe has not changed. Its place in the operating system has.",
        ],
      },
      {
        heading: "Connect buying, preparation, and demand",
        paragraphs: [
          "Start with the evidence you already hold. Use item sales and prices from the POS, ingredient costs from purchasing, and a defensible estimate of preparation time. Then connect those records to station load and ticket times. Be explicit about the difference between an observed timestamp and a preparation-time estimate.",
          "Contribution per constrained kitchen minute is a useful lens: the contribution associated with a dish, divided by the minutes it uses at the bottleneck. It is a decision aid, not a universal replacement for menu engineering. Brand, guest expectations, dietary needs, and the rest of the order still matter.",
          "Avoid averaging away the pressure. A weekly sales total can hide a station that struggles for a short part of each evening. Look at the affected service window and check whether the same pattern appears on comparable nights.",
        ],
      },
      {
        heading: "Compare a smaller move before a permanent one",
        paragraphs: [
          "There are usually more options than keep the dish or remove it. The team could feature a faster alternative during the peak, adjust preparation before service, change how a component is finished, or preserve the current mix and accept the constraint. Each option has a guest and operating consequence.",
          "RADR’s illustrative D-7110 demo explores this specific distinction. A signature dish can look attractive in conventional contribution analysis while using scarce cold-station capacity at peak. The proposed response is limited to the affected window and keeps the dish available outside it. This is a synthetic example, not a customer result.",
          "A good decision record names the affected window, the recommended response, who approves it, and what would make the recommendation wrong. If preparation-time evidence is weak, the next move may be to observe the station more carefully before changing the menu.",
        ],
      },
      {
        heading: "Verify the service, not just the item",
        paragraphs: [
          "After the service, review the whole chain. Did the station release capacity? Did ticket times change? Did guests choose the alternative? Did total service contribution move in the expected direction? A higher margin on one item is not enough if the rest of the evening deteriorated.",
          "Record other plausible explanations, including a different team, lighter demand, a changed seating pattern, or a stock issue. A single better night is an observation. It does not establish that the menu intervention caused the result.",
          "The practical next step is small: choose one station, one service window, and one repeatable decision. Connect the evidence, compare the options, and review the outcome with the team. That is how a menu discussion becomes operating judgment.",
        ],
      },
    ],
  },
  hotelContribution: {
    title: "A full hotel can still have a margin problem",
    excerpt:
      "Occupancy is only the opening question. Channel cost, room readiness, housekeeping, and length of stay determine what the night leaves behind.",
    metaTitle:
      "Hotel occupancy versus contribution: an operator’s guide | RADR",
    metaDescription:
      "How hotel teams can connect occupancy, channel cost, housekeeping and room readiness before making commercial decisions.",
    tags: ["Hotels", "Contribution", "Room readiness", "Channel mix"],
    sections: [
      {
        heading: "Start with what the occupied night requires",
        paragraphs: [
          "A full occupancy forecast is reassuring. It can also hide a difficult operating day. The arrivals may be concentrated into a short window, the housekeeping roster may already be stretched, and much of the demand may come through channels with different acquisition costs.",
          "The rooms are sold, but the work and the economics are not finished. The general manager still has to coordinate readiness, guest commitments, labor, and the commercial choices that remain open. A room-night is a perishable unit of capacity with an operating cost attached to it.",
          "This makes occupancy a useful signal rather than a complete answer. Read it alongside the conditions under which the property will deliver the stay.",
        ],
      },
      {
        heading: "Build one view of the next arrival wave",
        paragraphs: [
          "Connect the PMS arrival picture to room status, housekeeping readiness, and the actual team available. Add relevant booking remarks through appropriate access controls. Early arrivals, accessible-room requirements, connected rooms, and guest commitments can change which rooms should be prepared first.",
          "Keep confirmed facts separate from assumptions. A room marked ready in a system is different from a forecast that it will become ready. A housekeeping estimate should carry a timestamp and an owner so the front desk knows how much to rely on it.",
          "The most valuable next decision may be operational: reassign a task, protect a promised room type, or prepare a guest communication for approval. Commercial decisions become better when they account for those constraints.",
        ],
      },
      {
        heading: "Compare the contribution of the remaining choices",
        paragraphs: [
          "For demand that is still open, compare options using consistent definitions. Consider the room rate, channel cost, included benefits, expected housekeeping work, and the effect of length of stay. Compare the same unit and horizon so one option does not look better simply because it counts different costs.",
          "A direct booking is not automatically better in every circumstance. An OTA booking is not automatically worse. The relevant question is what each option is expected to contribute under the property’s current demand, restrictions, and operating conditions.",
          "Write down the cost of holding capacity as well as the cost of accepting a booking. If the evidence does not support a strong view of later demand, make that uncertainty visible rather than hiding it inside a confident recommendation.",
        ],
      },
      {
        heading: "Learn across properties without flattening them",
        paragraphs: [
          "A portfolio comparison becomes useful when the sites are comparable. Similar occupancy can coexist with different room mix, stay patterns, labor agreements, or service promises. Ranking properties by a single headline metric can turn those differences into the wrong instruction.",
          "Use the comparison to find a question worth investigating. Is one property absorbing more turnover work? Is a channel mix change associated with different contribution? Are delayed rooms repeatedly concentrated in the same arrival wave? The answer should lead back to an operating decision and its evidence.",
          "For tomorrow’s briefing, bring three things together: the next arrival wave, the readiness constraint, and one commercial choice that can still change. Give each a clear owner and a review time. That is a more useful starting point than occupancy alone.",
        ],
      },
    ],
  },
  cfoForecast: {
    title: "The forecast gap needs a decision, not another spreadsheet",
    excerpt:
      "A practical briefing structure for hospitality CFOs: see the variance, trace its drivers, compare locations, and decide what is still changeable.",
    metaTitle: "A hospitality CFO’s guide to the daily forecast gap | RADR",
    metaDescription:
      "Build a hospitality forecast briefing around comparable locations, revenue drivers, operating constraints and decisions that can still change the day.",
    tags: ["CFO", "Forecast", "Multi-location", "Decision records"],
    sections: [
      {
        heading: "The headline variance is the start of the conversation",
        paragraphs: [
          "The group is trading behind the day’s forecast. That statement is important, but it is not yet an instruction. One site may have fewer covers, another may have a different channel mix, and a third may be selling strongly while using more labor than expected.",
          "The CFO and the general manager need a shared explanation of what changed, how much confidence to place in it, and what can still be done. Rebuilding that explanation in separate spreadsheets consumes time while the relevant service window gets smaller.",
          "A useful briefing therefore moves from variance to drivers to choices. It should make the operating response easier to assess, not simply make the variance more visually impressive.",
        ],
      },
      {
        heading: "Make the comparison fair before making it fast",
        paragraphs: [
          "Start by fixing the comparison frame. Align the trading date, local time, currency basis, forecast version, and revenue definition. Distinguish net sales from gross receipts and show whether refunds or unsettled transactions are included. A refresh timestamp belongs beside the chart.",
          "When comparing locations, normalize for the facts that matter to the question. A hotel with more available rooms and a restaurant with a longer service window cannot be compared fairly through unqualified totals. The right denominator depends on the decision under review.",
          "Keep the original forecast visible. If the forecast is revised during the day, show the revision and its time. Otherwise the team can appear to close a gap by moving the baseline rather than changing the operation.",
        ],
      },
      {
        heading: "Trace the drivers into the next move",
        paragraphs: [
          "Break the variance into a few economically meaningful drivers. For a restaurant, those may include covers, average check, food and drink mix, delivery, and refunds. For a hotel, room demand, rate, channel mix, ancillary revenue, and readiness may be more relevant.",
          "Connect the driver to its operating context before recommending action. A demand shortfall and a kitchen bottleneck call for different responses. So do a genuine drop in sales and a late data feed. Evidence health should change the confidence and the allowed action.",
          "Keep the first screen compact: what needs a decision, what is being prepared, what is being watched, and what has been handled. Let the operator open a location or a driver for detail. That preserves depth without making every user reconstruct the business from a wall of charts.",
        ],
      },
      {
        heading: "Close the loop with an accountable record",
        paragraphs: [
          "For each material response, record the baseline, the alternatives, the expected economics, the owner, and the review time. Include the cost of doing nothing. If the recommendation requires approval or a connected system, make that dependency explicit.",
          "After the relevant horizon, compare expected, observed, and verified outcomes separately. Revenue arriving after a decision is not automatically value created by that decision. Review timing, demand, execution, and other explanations before assigning economic credit.",
          "A useful five-minute finance briefing ends with a short list of decisions and owners. It should also name where no action is justified. That gives the group a disciplined way to protect today’s operation and improve the next forecast discussion.",
        ],
      },
    ],
  },
  recoveryEvidence: {
    title: "A supplier credit is not recovered money until the evidence closes",
    excerpt:
      "The invoice discrepancy is only the beginning. Build a recovery trail that finance can reconcile without overstating the result.",
    metaTitle: "Supplier credits and verified recovery in hospitality | RADR",
    metaDescription:
      "How hospitality finance teams can trace an invoice discrepancy through approval, supplier response, credit and reconciliation.",
    tags: ["RECOVER", "Supplier / AP", "Finance", "Evidence"],
    sections: [
      {
        heading: "A flagged discrepancy is a starting position",
        paragraphs: [
          "An invoice line is above the agreed price. The team flags it, the supplier acknowledges the message, and the case looks promising. It is tempting to put the amount into a savings report immediately.",
          "That shortcut creates a problem for finance. The discrepancy may still need approval, the supplier may dispute the unit conversion, or the credit may arrive in a later period. Until those steps are resolved, the original exposure and the recovered amount are different things.",
          "Treat recovery as a chain of evidence. Detection begins the case. It does not finish it.",
        ],
      },
      {
        heading: "Give the case a defensible foundation",
        paragraphs: [
          "Connect the invoice line to the contract or other agreed commercial evidence. Check the supplier entity, item identity, pack size, unit of measure, quantity, currency, and effective date. A plausible price difference can disappear when those definitions are aligned.",
          "Where a match is uncertain, preserve the uncertainty. Ask for a review instead of presenting a low-confidence join as a confirmed claim. The person approving the request should be able to inspect the original records and the calculation without reconstructing the analyst’s assumptions.",
          "Assign a case owner and a next review date. A clean evidence package without an owner can still become a forgotten email thread.",
        ],
      },
      {
        heading: "Separate the request from the economic outcome",
        paragraphs: [
          "The prepared request should identify the discrepancy, show the calculation, and reference the supporting documents. Approval and sending are separate steps. A product illustration or prepared payload should never imply that a supplier has actually been contacted.",
          "After a response, track what was agreed and what arrived. A supplier’s acknowledgement, a promised adjustment, a credit note, and a settled account entry are distinct records. Store their dates and references against the same case.",
          "Define what qualifies as recovery before reporting it. Some teams will need a posted credit matched to the relevant invoice. Others will require reconciliation against settlement. The rule should be explicit and consistent across the group.",
        ],
      },
      {
        heading: "Make the result useful for the next purchase",
        paragraphs: [
          "Once the evidence supports the outcome, record the amount recovered and its horizon. Keep the originally expected amount alongside it. If the supplier accepts only part of a claim, preserve the difference and the reason instead of rewriting the earlier expectation.",
          "Then ask whether the pattern should change the next decision. A repeated unit mismatch may call for better master data. A recurring price variance may justify a purchasing review. A slow credit process may need a different owner or escalation rule.",
          "Start with one supplier and one clear rule. A small recovery process with inspectable evidence is more valuable than a large headline that finance cannot reconcile.",
        ],
      },
    ],
  },
};
