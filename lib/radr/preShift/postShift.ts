/**
 * Demo post-shift summary for Control Center POST_SHIFT phase.
 * VERIFY + LEARN - evening money in/out, food + drink mix, next shift.
 */

import { demoPostShiftLearning } from "@/lib/radr/learning/forecastLearning";
import {
  BERLIN_BEVERAGE_SHARE_PCT,
  berlinDrinkMixFixture,
  berlinFoodMixFixture,
  splitFnBNetSales,
  type FnBCategorySplit,
  type FnBMixItem,
} from "@/lib/radr/fnb";

export type PostShiftHighlight = {
  id: string;
  label: string;
  detail: string;
  /** Positive € contribution when known; omit for qualitative wins. */
  contributionEur?: number;
};

/** @deprecated Prefer FnBMixItem via dishes/drinks - kept for typed aliases. */
export type PostShiftDishResult = FnBMixItem;

export type PostShiftWatchPoint = {
  id: string;
  label: string;
  detail: string;
};

export type PostShiftNextAction = {
  id: string;
  label: string;
  reason: string;
  /** When RADR will apply this without a decision. */
  mode: "prepared" | "watching" | "decide";
};

export type PostShiftMoneyLine = {
  id: string;
  label: string;
  amount: number;
  side: "in" | "out";
  /** Share of net (in) or note for out. */
  sharePct?: number;
  detail?: string;
  /** One-line so-what for the dig-deeper sheet. */
  soWhat: string;
  /** Evidence / breakdown lines. */
  evidence: string[];
  /** vs typical for this weekday service, when known. */
  vsTypicalPct?: number;
  /** What we do with this - prepared / watching / decide. */
  actions: PostShiftNextAction[];
};

/**
 * Evening money picture - everything that moved cash this service.
 * `in` lines sum to netSales. `out` lines are leakage already reflected in net
 * (and delivery fees as contribution drag).
 */
export type PostShiftMoneyPicture = {
  food: number;
  beverage: number;
  delivery: number;
  refunds: number;
  comps: number;
  discounts: number;
  deliveryFees: number;
  /** refunds + comps + discounts */
  leakageTotal: number;
  netSales: number;
  in: PostShiftMoneyLine[];
  out: PostShiftMoneyLine[];
};

export function findPostShiftMoneyLine(
  money: PostShiftMoneyPicture,
  id: string,
): PostShiftMoneyLine | null {
  return (
    money.in.find((l) => l.id === id) ??
    money.out.find((l) => l.id === id) ??
    null
  );
}

export type PostShiftBrief = {
  netSales: number;
  vsExpectedPct: number;
  covers: number;
  walkIns: number;
  verifiedValue: number;
  changes: { label: string; contribution: number }[];
  learning: ReturnType<typeof demoPostShiftLearning>;
  /** Food vs beverage net + contribution for this service. */
  fnb: FnBCategorySplit;
  /** Full evening money in / out. */
  money: PostShiftMoneyPicture;
  /** What went well this service - operator learning, not vanity. */
  highlights: PostShiftHighlight[];
  /** Food mix outcomes. */
  dishes: FnBMixItem[];
  /** Beverage / drinks mix outcomes. */
  drinks: FnBMixItem[];
  /** Soft spots worth carrying forward (calm, few). */
  watchPoints: PostShiftWatchPoint[];
  /** Explicit carry into the next shift. */
  nextShift: PostShiftNextAction[];
};

function composeEveningMoney(netSales: number): PostShiftMoneyPicture {
  // Channel split of net - food + drinks + delivery = netSales.
  const foodIn = 5480;
  const bevIn = 3090;
  const delIn = 1170;
  const refunds = 88;
  const comps = 102;
  const discounts = 250;
  const deliveryFees = 186;
  const leakageTotal = refunds + comps + discounts;

  return {
    food: foodIn,
    beverage: bevIn,
    delivery: delIn,
    refunds,
    comps,
    discounts,
    deliveryFees,
    leakageTotal,
    netSales,
    in: [
      {
        id: "in_food",
        label: "Food",
        amount: foodIn,
        side: "in",
        sharePct: Math.round((foodIn / netSales) * 1000) / 10,
        detail: "Dine-in + included in house",
        soWhat:
          "Food carried the house tonight. Schnitzel and trout drove mix; burger was soft.",
        vsTypicalPct: 6,
        evidence: [
          "€5.480 of €9.740 net (56,3%)",
          "Wiener Schnitzel 38 portions · +18% vs typical",
          "Charred trout 27 portions · +22% vs typical",
          "House burger 9 portions · −28% vs typical",
          "Food contribution margin ~52% after COGS estimate",
        ],
        actions: [
          {
            id: "act_food_trout",
            label: "Hold trout depth for Thursday",
            reason: "Surprise bestseller - don’t under-prep tomorrow.",
            mode: "prepared",
          },
          {
            id: "act_food_burger",
            label: "Trim burger prep by ~6 portions",
            reason: "Soft mix frees board space for Schnitzel.",
            mode: "prepared",
          },
        ],
      },
      {
        id: "in_bev",
        label: "Drinks",
        amount: bevIn,
        side: "in",
        sharePct: Math.round((bevIn / netSales) * 1000) / 10,
        detail: "Wine, spirits, beer, soft",
        soWhat:
          "Drinks carried margin. Burgundy BTG and Negroni led attach; soft/zero lagged.",
        vsTypicalPct: 11,
        evidence: [
          "€3.090 of €9.740 net (31,7%)",
          "Burgundy by-the-glass 44 · best drink seller",
          "Negroni 29 · +24% vs typical",
          "Soft / zero −8% vs typical - low margin impact",
          "Beverage contribution margin ~72% after COGS estimate",
        ],
        actions: [
          {
            id: "act_bev_negroni",
            label: "Keep Negroni mise deep",
            reason: "High contribution surprise - don’t 86 mid-service.",
            mode: "prepared",
          },
          {
            id: "act_bev_btg",
            label: "Burgundy BTG par stays elevated",
            reason: "Best drink seller tonight.",
            mode: "watching",
          },
        ],
      },
      {
        id: "in_delivery",
        label: "Delivery",
        amount: delIn,
        side: "in",
        sharePct: Math.round((delIn / netSales) * 1000) / 10,
        detail: "Uber Eats · Deliveroo · Wolt",
        soWhat:
          "Delivery volume held, but stacked promos and fees thinned contribution.",
        vsTypicalPct: 3,
        evidence: [
          "€1.170 of €9.740 net (12,0%)",
          "Uber Eats · Deliveroo · Wolt orders settled",
          "€250 discounts touched delivery tickets",
          "€186 platform fees - contribution drag, not a second net cut",
          "House sparkling traveled well on delivery mix",
        ],
        actions: [
          {
            id: "act_del_promo",
            label: "Cap stacked delivery promos",
            reason: "Discounts + fees left contribution thin tonight.",
            mode: "decide",
          },
          {
            id: "act_del_sparkling",
            label: "Keep sparkling on delivery menu",
            reason: "High contribution · low packaging drag.",
            mode: "prepared",
          },
        ],
      },
    ],
    out: [
      {
        id: "out_refunds",
        label: "Refunds",
        amount: refunds,
        side: "out",
        detail: "Settled back to guests",
        soWhat:
          "Refunds were contained. Two tickets drove most of the outflow - review causes, don’t blanket-tighten policy.",
        vsTypicalPct: -12,
        evidence: [
          "€88 settled back to guests",
          "Table 11 · overcooked trout · €42",
          "Delivery ord_d02 · missing item · €28",
          "Remainder · small card adjustments",
          "Below typical Wednesday refund rate (−12%)",
        ],
        actions: [
          {
            id: "act_ref_pass",
            label: "Brief pass on trout timing",
            reason: "One kitchen refund - pass timing, not menu.",
            mode: "prepared",
          },
          {
            id: "act_ref_watch",
            label: "RADR watches refund rate",
            reason: "Still below typical - no policy change tonight.",
            mode: "watching",
          },
        ],
      },
      {
        id: "out_comps",
        label: "Comps",
        amount: comps,
        side: "out",
        detail: "Guest recovery · courtesy",
        soWhat:
          "Comps recovered two guest moments. Keep authority with floor - don’t invent a comp task queue.",
        vsTypicalPct: 4,
        evidence: [
          "€102 guest recovery / courtesy",
          "Table 5 · wait apology dessert · €34",
          "Table 18 · wine re-pour after cork · €48",
          "Bar · birthday sparkling · €20",
          "Near typical for warm terrace nights",
        ],
        actions: [
          {
            id: "act_comp_policy",
            label: "Keep current comp band",
            reason: "Within policy · guest recovery worked.",
            mode: "watching",
          },
          {
            id: "act_comp_wine",
            label: "Check Burgundy open-bottle QC",
            reason: "One cork event - prep, don’t over-correct.",
            mode: "prepared",
          },
        ],
      },
      {
        id: "out_discounts",
        label: "Discounts",
        amount: discounts,
        side: "out",
        detail: "Promo · campaign · platform",
        soWhat:
          "Discounts clustered on delivery. House dine-in stayed clean - the decision is promo stack, not menu price.",
        vsTypicalPct: 22,
        evidence: [
          "€250 promo / campaign / platform",
          "Uber Eats campaign code · €142",
          "Deliveroo multi-buy · €68",
          "In-house early bird · €40",
          "+22% vs typical Wednesday discount load",
        ],
        actions: [
          {
            id: "act_disc_cap",
            label: "Decide: pause stacked delivery codes",
            reason: "Discount load + fees ate contribution on delivery.",
            mode: "decide",
          },
          {
            id: "act_disc_house",
            label: "Keep early-bird house offer",
            reason: "Small · drove early covers · clean.",
            mode: "prepared",
          },
        ],
      },
      {
        id: "out_fees",
        label: "Delivery fees",
        amount: deliveryFees,
        side: "out",
        detail: "Platform commission - contribution drag",
        soWhat:
          "Fees are the cost of the delivery channel. Act on promo stack and mix - not on wishing fees away.",
        vsTypicalPct: 5,
        evidence: [
          "€186 platform commission",
          "~15,9% of delivery gross tonight",
          "Does not cut net sales again - contribution lens only",
          "Highest fee share on Uber Eats promo tickets",
          "Slightly above typical fee drag (+5%)",
        ],
        actions: [
          {
            id: "act_fee_mix",
            label: "Push high-contribution delivery items",
            reason: "Fees fixed by channel - mix is the lever.",
            mode: "prepared",
          },
          {
            id: "act_fee_decide",
            label: "Decide: promo vs fee trade-off",
            reason: "Same decision as discount cap - one approval.",
            mode: "decide",
          },
        ],
      },
    ],
  };
}

export function composeBerlinPostShiftBrief(): PostShiftBrief {
  const learning = demoPostShiftLearning();
  const netSales = learning.actual.revenue ?? 9740;
  const money = composeEveningMoney(netSales);
  // F&B category on total net (food+bev share of evening, delivery folded into categories for contribution math)
  const fnb = splitFnBNetSales(netSales, BERLIN_BEVERAGE_SHARE_PCT);
  const dishes = berlinFoodMixFixture(fnb.foodSharePct);
  const drinks = berlinDrinkMixFixture(fnb.beverageSharePct);

  return {
    netSales,
    vsExpectedPct: 2.7,
    covers: learning.actual.covers ?? 149,
    walkIns: learning.actual.walkIns ?? 29,
    verifiedValue: 1020,
    changes: [
      { label: "Terrace opened", contribution: 496 },
      { label: "Supplier alternative", contribution: 730 },
      { label: "Staffing adjustment", contribution: 218 },
      { label: "Wine-by-glass attach", contribution: 186 },
    ],
    learning,
    fnb,
    money,
    highlights: [
      {
        id: "hl_food",
        label: "Food held the house",
        detail: `${money.in[0]!.sharePct}% of net · Schnitzel + trout led the board.`,
        contributionEur: fnb.foodContribution,
      },
      {
        id: "hl_terrace",
        label: "Terrace held the upside",
        detail:
          "Warm evening - outdoor seats ran +16 covers vs plan. Weather call paid.",
        contributionEur: 496,
      },
      {
        id: "hl_beverage",
        label: "Drinks carried margin",
        detail: `${money.in[1]!.sharePct}% of net · Burgundy BTG + Negroni led attach.`,
        contributionEur: fnb.beverageContribution,
      },
      {
        id: "hl_recovery",
        label: "Cancellation recovered before empty",
        detail:
          "Table 8 CANCELLED - waitlist filled; €184 expected revenue kept in house.",
        contributionEur: 184,
      },
    ],
    dishes,
    drinks,
    watchPoints: [
      {
        id: "wp_burger",
        label: "House burger soft tonight",
        detail:
          "−28% vs typical Wednesday. Prep less tomorrow; keep Schnitzel / trout depth.",
      },
      {
        id: "wp_soft",
        label: "Soft / zero underperformed",
        detail:
          "−8% vs typical - not a margin story. Keep sparkling and BTG depth instead.",
      },
      {
        id: "wp_delivery_fees",
        label: "Delivery fees dragged contribution",
        detail: `€${deliveryFeesLabel(money.deliveryFees)} platform fees on €${money.delivery} delivery - watch promo stack tomorrow.`,
      },
      {
        id: "wp_late_kitchen",
        label: "22:10 ticket lag",
        detail:
          "Two tickets sat >12 min after last seating - pass timing, not menu.",
      },
    ],
    nextShift: [
      {
        id: "ns_trout",
        label: "Hold trout depth for Thursday",
        reason: "Tonight’s surprise food bestseller - contribution +22% vs typical.",
        mode: "prepared",
      },
      {
        id: "ns_negroni",
        label: "Keep Negroni mise deep",
        reason: "Drink surprise +24% vs typical - high beverage contribution.",
        mode: "prepared",
      },
      {
        id: "ns_delivery",
        label: "Cap stacked delivery promos",
        reason: `€${money.discounts} discounts + €${money.deliveryFees} fees - contribution thin on delivery tonight.`,
        mode: "decide",
      },
      {
        id: "ns_burger",
        label: "Trim burger prep by ~6 portions",
        reason: "Soft food mix tonight; free board space for Schnitzel.",
        mode: "prepared",
      },
      {
        id: "ns_terrace",
        label: "Weather gate stays on for terrace",
        reason: "Forecast warm again - same open/close rule as tonight.",
        mode: "watching",
      },
    ],
  };
}

function deliveryFeesLabel(n: number) {
  return n.toLocaleString("de-DE");
}
