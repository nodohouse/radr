import type { EconomicTerritory } from "@/lib/radr/intelligence/architecture";
import { demoSignupHref } from "@/lib/marketing/demoAccess";
import type { CategoryId, CategoryResult, JourneyState } from "./index";

/** A single primary lens per category prevents double counting in the visual. */
export const CATEGORY_LENS: Record<CategoryId, EconomicTerritory> = {
  supplier_ap: "BUY",
  procurement: "BUY",
  food_waste: "BUY",
  labor: "LABOR",
  perishable: "SELL",
  channel_mix: "SELL",
  revenue_pricing: "SELL",
  readiness: "RECOVER",
  reconciliation: "RECOVER",
  guest_experience: "RECOVER",
};
export const LENS_COLORS: Record<EconomicTerritory, string> = {
  BUY: "#075cff",
  LABOR: "#0086c7",
  SELL: "#00a887",
  RECOVER: "#173b7b",
};
export function lensBreakdown(categories: CategoryResult[]) {
  const total = categories.reduce((sum, c) => sum + c.modeled, 0);
  return (["BUY", "LABOR", "SELL", "RECOVER"] as const).map((id) => {
    const members = categories.filter((c) => CATEGORY_LENS[c.id] === id);
    const amount = members.reduce((sum, c) => sum + c.modeled, 0);
    return { id, amount, share: total > 0 ? amount / total : 0, members };
  });
}
export function resultStory(j: JourneyState) {
  if (j.vertical === "hotel")
    return {
      title: "Look beyond occupancy.",
      subtitle: "See what each stay leaves behind.",
      focus:
        "Rooms, distribution and service costs belong in the same decision.",
      demoLabel: "Explore the hotel demo",
      demoHref: demoSignupHref("/app/enter?vertical=hotel&go=1"),
      demoDetail:
        "Explore a fictional hotel: room readiness, guest needs and the decisions behind contribution.",
      question:
        "Which rooms, channels and operating choices deserve your attention first?",
    };
  if (
    j.vertical === "restaurant" ||
    (j.vertical === "other" && j.otherKind === "bar")
  )
    return {
      title: "A busy service is only the beginning.",
      subtitle: "Follow what reaches the bottom line.",
      focus:
        "Connect purchasing, kitchen capacity and service demand in one picture.",
      demoLabel: "Explore the restaurant demo",
      demoHref: demoSignupHref("/app/enter?vertical=restaurant&go=1"),
      demoDetail:
        "Explore a fictional restaurant: live service, menu pressure and decisions with an evidence trail.",
      question:
        "Which purchasing and service choices deserve your attention first?",
    };
  return {
    title: "One portfolio. A connected picture.",
    subtitle: "Find the decisions behind contribution.",
    focus:
      "Look across food, rooms, staffing and settlements without losing the operating context.",
    demoLabel: "Choose your demo",
    demoHref: "/demo",
    demoDetail:
      "Choose a fictional hotel or restaurant and explore how RADR connects evidence, decisions and outcomes.",
    question:
      "Where should you investigate first across your hospitality operation?",
  };
}
export function categoryDecision(id: CategoryId, j: JourneyState) {
  const hotel = j.vertical === "hotel";
  const decisions: Record<
    CategoryId,
    { question: string; response: string; verify: string }
  > = {
    labor: {
      question: hotel
        ? "Do housekeeping hours match arrival pressure?"
        : "Are kitchen and service hours aligned with demand?",
      response:
        "Compare a different staffing allocation against the current plan.",
      verify: "Review labor cost, service timing and guest outcomes together.",
    },
    supplier_ap: {
      question: "Did the agreed supplier price reach the invoice?",
      response:
        "Prepare the disputed lines and supporting contract for review.",
      verify: "Match the credit received to the original difference.",
    },
    procurement: {
      question: "Are comparable items costing more at some locations?",
      response: "Compare normalized unit costs before changing the order.",
      verify: "Check invoiced cost, quality and availability after the change.",
    },
    food_waste: {
      question: "Is production exceeding what guests actually need?",
      response: "Compare a smaller production batch against service demand.",
      verify: "Measure waste cost alongside stockouts and service quality.",
    },
    perishable: {
      question: hotel
        ? "Which room nights might expire without a sale?"
        : "Where is service capacity going unused?",
      response:
        "Compare a demand or capacity adjustment before the window closes.",
      verify:
        "Review contribution after the service window, including displacement.",
    },
    channel_mix: {
      question: "Does a booking still contribute after channel costs?",
      response:
        "Compare direct and third-party demand after fees and acquisition costs.",
      verify: "Review net contribution, cancellations and displaced demand.",
    },
    readiness: {
      question: "Which sold rooms could miss their check-in window?",
      response:
        "Compare the room-release order against arrival times and dependencies.",
      verify: "Check actual release times, compensation and service cost.",
    },
    revenue_pricing: {
      question: hotel
        ? "Which room-rate decisions protect contribution?"
        : "Does the bestselling dish also earn its kitchen time?",
      response:
        "Compare price and sales mix with the capacity each option consumes.",
      verify: "Review contribution after costs and any demand displaced.",
    },
    reconciliation: {
      question: "Did the recorded sale become the expected settlement?",
      response: "Prepare unmatched transactions, fees and refunds for review.",
      verify: "Match the money received to the settlement and sales records.",
    },
    guest_experience: {
      question: "Which service problems recur alongside compensation?",
      response:
        "Compare the recorded incident, service context and response options.",
      verify: "Check refunds and guest outcomes before attributing any value.",
    },
  };
  return decisions[id];
}
