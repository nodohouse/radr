import type { EditorialContent } from "./editorial2026";

/** Source-reviewed 5 November 2026. Research is context, never evidence of RADR returns. */
export const RESEARCH_2026: Record<string, EditorialContent> = {
  restaurantEconomics: {
    title:
      "A busy restaurant can still lose money. Start with the right denominator.",
    excerpt:
      "Restaurant profitability is under pressure. Understand the difference between full-service and limited-service economics before choosing your next move.",
    metaTitle:
      "Restaurant profitability: the numbers behind a busy service | RADR",
    metaDescription:
      "Source-led restaurant profitability analysis, full-service and limited-service labor comparisons, and a transparent contribution calculation.",
    tags: ["Restaurants", "Labor", "Profitability", "Research"],
    sections: [
      {
        heading: "The room is full. Is the business healthier?",
        paragraphs: [
          "A sales dashboard can celebrate a successful evening while the income statement tells a different story. More covers can bring more contribution, but they also consume ingredients, kitchen capacity and service time. The useful question is what remains after the costs needed to serve those guests.",
          "The National Restaurant Association reported in July 2026 that 42% of U.S. restaurant operators said their restaurant was not profitable in 2025. That includes businesses breaking even. It is not a count of bankruptcies, a global estimate, or evidence that every one of those restaurants lost money.",
        ],
      },
      {
        heading: "Two branches. Different cost structures.",
        paragraphs: [
          "Separate Association analysis of 2024 operating data from more than 900 U.S. operators reported median labor costs, including benefits, of 34.2% of sales for profitable full-service respondents and 42.9% for loss-making full-service respondents. For limited-service respondents, the corresponding figures were 30.0% and 34.1%.",
          "These are comparisons between groups, not a prescription to cut a specific number of labor points. Service format, geography, pay, pricing, opening hours and demand all matter. A lower labor percentage can reflect stronger sales rather than fewer people. Cutting capacity during a rush may make the problem worse.",
        ],
      },
      {
        heading: "Look at the service, the channel and the constraint",
        paragraphs: [
          "For a full-service restaurant, compare contribution and ticket times by daypart before adjusting seating pace or menu mix. For a limited-service site, separate delivery and counter orders: packaging, channel fees and preparation effort can change the contribution of an identical menu item.",
          "Build a small decision record: the expected covers, the actual covers, the labor hours, ingredient cost, channel fees and the guest-service outcome. Give the decision an owner and a review time. Protecting contribution while preserving service is more useful than improving a percentage in isolation.",
        ],
      },
      {
        heading: "Turn a small percentage-point change into a testable case",
        paragraphs: [
          "The illustration below starts with an assumed USD 10 million annual revenue base. A 0.5 percentage-point contribution improvement would protect USD 50,000 annually if the revenue base and other costs stayed comparable. It is a sensitivity calculation, not a forecast of what RADR will deliver.",
          "Compare any proposed program against its complete cost and a comparable baseline. Include training, implementation and the time needed to review decisions. Check that apparent savings have not simply shifted into longer ticket times, lost covers or worse guest feedback. RADR’s public demo illustrates this decision-and-verification workflow using synthetic data; commercial connectors remain planned.",
        ],
      },
    ],
    research: {
      title: "Labor cost as a share of sales",
      caption:
        "2024 U.S. restaurant respondents. Group medians, including benefits. Association analysis published October 2025. These are not target ratios or causal estimates.",
      rows: [
        { label: "Full-service · profitable", value: 34.2, display: "34.2%" },
        { label: "Full-service · loss-making", value: 42.9, display: "42.9%" },
        { label: "Limited-service · profitable", value: 30, display: "30.0%" },
        {
          label: "Limited-service · loss-making",
          value: 34.1,
          display: "34.1%",
        },
      ],
      sources: [
        {
          title: "National Restaurant Association · July 2026",
          url: "https://www.restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-costs-continue-to-pressure-restaurant-profitability/",
          scope:
            "U.S. operators reporting on 2025 profitability; not profitable includes break-even.",
        },
        {
          title: "National Restaurant Association · October 2025",
          url: "https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-labor-costs-had-a-significant-impact-on-restaurant-profitability-in-2024/",
          scope:
            "2024 operating data from more than 900 U.S. operators; medians within profitability groups.",
        },
      ],
      calculation: {
        title: "50 basis points. A material annual difference.",
        assumptions:
          "Illustrative assumptions: USD 10m annual revenue; 0.5 percentage-point contribution improvement; USD 18,000 total annual program cost. This is not a RADR price.",
        formula:
          "USD 10,000,000 × 0.005 = USD 50,000 protected per year. (50,000 − 18,000) ÷ 18,000 = 177.8% modeled annual net ROI.",
        result: "USD 32,000 modeled annual net benefit",
        limitation:
          "Break-even improvement: 0.18 percentage points, or 18 basis points. Revenue held constant. No return is guaranteed; validate costs, displacement and realized results.",
      },
    },
  },
  hotelDistribution: {
    title: "The booking is only the beginning. Follow the contribution.",
    excerpt:
      "Hotels need to understand the cost of the stay, the channel and the service. A practical guide to distribution economics without confusing bookings with profit.",
    metaTitle:
      "Hotel channel economics and contribution: a practical guide | RADR",
    metaDescription:
      "HOTREC booking-channel research, CBRE hotel cost growth, and an explicit room-night calculation for evaluating channel mix.",
    tags: ["Hotels", "Distribution", "Contribution", "Research"],
    sections: [
      {
        heading: "Occupancy is a starting point",
        paragraphs: [
          "A sold room creates an opportunity to earn contribution. The booking channel, acquisition cost, rate, length of stay and operating costs determine how much of that opportunity remains. Two properties with the same occupancy can have very different economics.",
          "HOTREC’s 2026 distribution study covers 2,713 European hotels and their 2025 bookings. Direct channels represented 51.3% of bookings and online travel agencies 29.9%. Booking Holdings and Expedia Group together accounted for 85.4% of OTA bookings. That last percentage refers to the OTA channel, not all hotel bookings.",
        ],
      },
      {
        heading: "Cost pressure differs by property type",
        paragraphs: [
          "CBRE’s May 2025 analysis of preliminary 2024 data from 2,600 U.S. hotels reported revenue growth of 2.3% and expense growth above gross operating profit of 4.1%. The pattern of expenses outgrowing revenue extended across property types except limited-service and extended-stay hotels.",
          "Those growth rates do not tell us what proportion of hotels were loss-making. Nor do European channel shares describe every U.S. hotel. Use each study for the question it actually answers, then reconcile the property’s own room revenue, acquisition costs and operating expenses.",
        ],
      },
      {
        heading: "Direct is not free. OTA is not automatically waste.",
        paragraphs: [
          "An OTA may bring demand a property would not otherwise have captured. Direct bookings may require paid media, loyalty discounts, booking-engine fees and staff time. Compare net acquisition cost after cancellations and refunds before treating a channel shift as protected contribution.",
          "Evaluate dates and room types separately. A channel strategy for a sold-out event night may be wrong for a low-demand weekday. Protect access to valuable demand while testing whether the same guest or a comparable booking could be acquired more efficiently.",
        ],
      },
      {
        heading: "Keep the counterfactual visible",
        paragraphs: [
          "The worked example assumes the same sold room nights and room rate before and after a channel shift. It isolates the acquisition-cost difference rather than claiming extra room revenue. Actual demand, discounts, cancellations and incremental marketing spend can change the result.",
          "Start with one property and a comparable period. Assign an owner, agree the eligible bookings and reconcile actual costs after the stay. In the RADR demo, room readiness and guest needs are illustrative operating context. Production PMS connectivity and booking changes are planned, not live capabilities.",
        ],
      },
    ],
    research: {
      title: "Hotel growth: revenue versus operating costs",
      caption:
        "CBRE preliminary sample of 2,600 U.S. hotels, 2024 versus 2023. Expenses shown are above gross operating profit. Percentage growth is not a margin or a loss-making rate.",
      rows: [
        { label: "Revenue growth", value: 2.3, display: "+2.3%" },
        { label: "Expense growth above GOP", value: 4.1, display: "+4.1%" },
      ],
      sources: [
        {
          title: "HOTREC · September 2026 distribution study",
          url: "https://www.hotrec.eu/en/news_booking-holdings-and-expedia-group-account-for-85-of-europe_E2_80_99s-ota-market-hotrec-study-finds.html",
          scope:
            "2,713 European hotels; 2025 booking-channel shares. These are not commission rates.",
        },
        {
          title: "CBRE · May 2025",
          url: "https://www.cbre.com/insights/articles/all-eyes-on-operating-costs-in-2025-lessons-learned-in-2024",
          scope:
            "Preliminary 2024 U.S. hotel sample. Limited-service and extended-stay are exceptions to the cross-property cost-growth pattern.",
        },
      ],
      calculation: {
        title: "Model a channel shift without inventing new demand",
        assumptions:
          "Illustrative assumptions: 200 rooms; 365 days; 75% occupancy; USD 160 room rate; a 2 percentage-point shift of sold room nights; an 8 percentage-point net acquisition-cost difference.",
        formula:
          "200 × 365 × 75% = 54,750 sold room nights. 54,750 × 2% × USD 160 × 8% = USD 14,016 annual contribution protected.",
        result: "USD 14,016 modeled annual contribution protected",
        limitation:
          "This is a scenario, not a HOTREC or CBRE result and not a RADR forecast. Net cost gap must include direct acquisition costs. Assumes unchanged rate and demand; excludes program costs.",
      },
    },
  },
  kitchenWaste: {
    title:
      "The quiet cost in your kitchen. Measure what never reaches a guest.",
    excerpt:
      "From restaurant preparation to hotel buffets and catering, waste becomes actionable when it has a cost, a cause and an owner.",
    metaTitle:
      "Hospitality food waste: evidence, measurement and practical ROI | RADR",
    metaDescription:
      "WRAP sector estimates, historical hotel food-waste research and a transparent cost-based reduction scenario for hospitality operators.",
    tags: ["Kitchens", "Hotels", "Food waste", "Research"],
    sections: [
      {
        heading: "A purchasing decision with an operational afterlife",
        paragraphs: [
          "An ingredient can become waste at delivery, in storage, during preparation, at the buffet or after service. A single monthly waste total hides these different causes. Separate the stages before deciding whether the next move belongs to purchasing, preparation, menu design or service.",
          "UKHospitality cites WRAP’s Guardians of Grub estimate that wasted food costs the UK hospitality and food-service sector GBP 3.2 billion annually. This is a sector estimate, not a new 2026 measurement, a restaurant-only total or an estimate of what RADR can recover.",
        ],
      },
      {
        heading: "Restaurants, hotel buffets and catering need different tests",
        paragraphs: [
          "A restaurant might investigate preparation yields and dishes repeatedly left unfinished. A hotel might measure buffet replenishment against the actual breakfast arrivals, while protecting availability and food safety. A caterer might separate production overage from guest-count variance at an event.",
          "Track kilograms and ingredient cost alongside covers or meals served. Keep unavoidable portions distinct from avoidable waste. Do not combine reduced purchases and the estimated value of those same discarded ingredients into two savings claims. They describe one economic change.",
        ],
      },
      {
        heading: "There is evidence for measurement, but no universal return",
        paragraphs: [
          "A 2018 Champions 12.3 study reviewed food-waste reduction programs at 42 hotels across 15 countries. It reported average savings of USD 7 for each USD 1 invested and an average 21% reduction in kitchen food waste by weight within a year.",
          "Those are historical results from reviewed programs, not randomized proof, a current sector-wide average, or RADR customer outcomes. They make a case for testing a measured intervention; they do not establish your property’s return.",
        ],
      },
      {
        heading: "Make the baseline usable before changing the process",
        paragraphs: [
          "Measure a representative service cycle, record the cause and assign one practical change. Compare like-for-like service volumes after the change. Keep a guest-experience and food-safety check alongside the financial measure. A smaller buffet with empty trays is not automatically an improvement.",
          "The example below deliberately begins with an assumed measured ingredient-cost baseline. Add the real cost of scales, tools, training and review time before calculating a return. RADR’s synthetic demo illustrates how evidence can support a decision; mobile stock capture and production integrations remain planned.",
        ],
      },
    ],
    research: {
      title: "A measured kitchen scenario",
      caption:
        "Illustrative monthly ingredient-cost waste. These are assumed values, not observed hospitality averages or RADR results. Compare equal service volumes.",
      rows: [
        {
          label: "Baseline waste cost · USD/month",
          value: 6000,
          display: "USD 6,000",
        },
        {
          label: "After assumed 10% reduction · USD/month",
          value: 5400,
          display: "USD 5,400",
        },
      ],
      sources: [
        {
          title: "UKHospitality · WRAP sector estimate",
          url: "https://www.ukhospitality.org.uk/guidance/reducing-food-waste/",
          scope:
            "UK hospitality and food-service sector; cites WRAP Guardians of Grub. The estimate is not a 2026 survey.",
        },
        {
          title: "Champions 12.3 / WRI / WRAP · 2018",
          url: "https://champions123.org/publication/business-case-reducing-food-loss-and-waste-hotels",
          scope:
            "Historical reviewed programs at 42 hotels in 15 countries. Program returns are not RADR outcomes.",
        },
      ],
      calculation: {
        title: "Start with ingredient cost, then subtract the work",
        assumptions:
          "Illustrative assumptions: USD 6,000 measured waste cost per month; 10% reduction sustained for 12 months; USD 3,000 complete annual program cost. This is not a RADR quote.",
        formula:
          "USD 6,000 × 10% × 12 = USD 7,200 annual protected cost. (7,200 − 3,000) ÷ 3,000 = 140% modeled annual net ROI.",
        result: "USD 4,200 modeled annual net benefit",
        limitation:
          "Assumes comparable service volume, ingredient prices and a sustained change. Measure actual purchasing impact and guest outcomes; do not count the same avoided ingredient cost twice.",
      },
    },
  },
};
