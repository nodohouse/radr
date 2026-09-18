/**
 * Shared Decision catalog — same IDs on homepage, platform, and /app.
 */

import type { Decision, DecisionVertical } from "./core";
import { DECISION_IDS } from "./ids";
import { getDecisionRecord } from "./store";
import { projectDecision } from "./project";

export { DECISION_IDS };

const PAYLOAD =
  "Prepared — not written back to POS/PMS/channel. Operator confirms in the system of record.";

const tunaWhyDecide = {
  blocks: [
    {
      epistemic: "OBSERVED" as const,
      title: "Shortfall confirmed",
      body: "Tuna Tataki is the peak bestseller. Supplier shortfall: 6 portions missing for dinner.",
    },
    {
      epistemic: "ESTIMATED" as const,
      title: "Peak exposure",
      body: "37 expected tuna covers in the peak window. €1,840 contribution exposed tonight if stockout stands.",
    },
    {
      epistemic: "PREDICTED" as const,
      title: "Sell-through",
      body: "82% historical sell-through before 20:15 on comparable nights. Substitution acceptance 64% (n=28) when Truffle Pasta is featured.",
    },
    {
      epistemic: "RECOMMENDED" as const,
      title: "Feature swap first",
      body: "Feature Truffle Pasta during peak. Hold supplier as fallback if uptake weak by 17:30.",
    },
  ],
  sources: [
    { name: "POS", freshness: "14 min ago" },
    { name: "Supplier feed", freshness: "14 min ago" },
    { name: "Reservation book", freshness: "8 min ago" },
    { name: "Historical menu mix", freshness: "Week lookback" },
  ],
  sample: { n: 41, window: "comparable peak services" },
  baseline: "Peak sell-through vs remaining portions",
  effect: "Historically followed by protected peak contribution",
  confidence: { point: 81, low: 74, high: 88 },
  assumptions: [
    "Kitchen can execute Truffle feature without extra FOH",
    "Supplier fallback remains available until 17:30",
  ],
  locationDna:
    "At Berlin Mitte, under these peak conditions, feature-swap-first historically preceded higher protected contribution than supplier-first.",
};

const hotelWhy = {
  blocks: [
    {
      epistemic: "OBSERVED" as const,
      title: "Mix leak",
      body: "Nearly sold out (89% · 12 arrivals). Direct share 48% vs 59% target. OTA share 11 pts above target.",
    },
    {
      epistemic: "ESTIMATED" as const,
      title: "Commission drag",
      body: "€4.200 contribution exposed to OTA commission on demand that can still fill direct.",
    },
    {
      epistemic: "PREDICTED" as const,
      title: "Direct fill",
      body: "73% historical direct-fill probability on comparable high-demand dates.",
    },
    {
      epistemic: "RECOMMENDED" as const,
      title: "Hold premium",
      body: "Hold 4 premium rooms direct until 72h out. If pickup weakens, release 2 rooms back to OTA.",
    },
  ],
  sources: [
    { name: "PMS", freshness: "9 min ago" },
    { name: "Channel manager", freshness: "9 min ago" },
    { name: "Booking pace", freshness: "Live" },
    { name: "Event calendar", freshness: "Today" },
  ],
  sample: { n: 18, window: "comparable high-demand dates" },
  baseline: "Direct mix vs OTA share on high-demand nights",
  effect: "Historically followed by higher ADR and lower commission",
  confidence: { point: 73, low: 68, high: 79 },
  assumptions: [
    "Pickup does not collapse before the 72h window",
    "House brand can absorb the held inventory",
  ],
  locationDna:
    "At Canal House, under sold-out pressure with OTA above target, a 72h direct hold historically preceded protected contribution on remaining premium rooms.",
};

const apartmentWhy = {
  blocks: [
    {
      epistemic: "OBSERVED" as const,
      title: "One-night gap",
      body: "Unit 24 · 72 hours to arrival. Cleaning already absorbed. Next stay Wednesday.",
    },
    {
      epistemic: "ESTIMATED" as const,
      title: "Empty night",
      body: "€164 opportunity exposed if the gap stays closed. Recommended rate €148 · expected contribution €112 on wait path.",
    },
    {
      epistemic: "PREDICTED" as const,
      title: "Direct demand curve",
      body: "17 comparable gaps · direct arrival still building · OTA cost known.",
    },
    {
      epistemic: "RECOMMENDED" as const,
      title: "Wait 24h · direct first",
      body: "Do nothing yet. Prefer direct at €148. OTA fallback only if pace drops.",
    },
  ],
  sources: [
    { name: "Channel calendar", freshness: "11 min ago" },
    { name: "PMS", freshness: "11 min ago" },
    { name: "Turn schedule", freshness: "Today" },
    { name: "Pricing history", freshness: "Quarter lookback" },
  ],
  sample: { n: 17, window: "comparable one-night gaps" },
  baseline: "Wait for direct when arrival ≥72h and cleaning already absorbed",
  effect: "Historically followed by recovered contribution without early discount",
  confidence: { point: 64, low: 58, high: 71 },
  assumptions: [
    "Rate €148 remains competitive for tonight’s demand",
    "No guest-impact conflict on adjacent stays",
  ],
  locationDna:
    "At Lisbon Chiado, under these gap conditions, opening one-night inventory ≥72h out historically preceded recovered nights without guest impact.",
};

/** Hero / needs-you decide state */
export const HERO_BY_VERTICAL: Record<DecisionVertical, Decision> = {
  restaurant: {
    id: DECISION_IDS.tuna,
    vertical: "restaurant",
    property: "Berlin Mitte",
    phase: "pre",
    phaseLabel: "Pre-shift · Dinner",
    contextLine: "Peak 19:30 · supplier shortfall",
    headline: "Tuna Tataki is tonight’s bestseller.\n6 portions short for peak.",
    soWhat: "Peak contribution is exposed if the shortfall stands.",
    exposed: { amount: 1840, kind: "exposed", horizon: "tonight" },
    expected: { amount: 1640, kind: "protected", horizon: "tonight" },
    action: "Feature Truffle Pasta during peak.",
    fallback: "If uptake weak by 17:30: secure 6 portions supplier fallback.",
    deadline: "Decide by 17:15",
    evidence: [
      { value: "82%", label: "Sellout probability" },
      { value: "81%", label: "Feature-swap success" },
    ],
    why: tunaWhyDecide,
    options: [
      {
        id: "do_nothing",
        title: "Do nothing",
        netVsDoNothing: 0,
        note: "€1,840 perishes at peak sellout",
      },
      {
        id: "supplier_first",
        title: "Secure 6 portions now",
        netVsDoNothing: 1520,
        note: "Supplier-first · historically 62% at Berlin Mitte",
      },
      {
        id: "feature_swap",
        title: "Feature Truffle Pasta first",
        netVsDoNothing: 1640,
        note: "Best net · memory ranks 81% success",
        recommended: true,
      },
    ],
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/hero-tuna-supply.png",
    imageAlt: "Tuna delivery shortfall",
  },
  hotel: {
    id: DECISION_IDS.ota,
    vertical: "hotel",
    property: "Canal House · Amsterdam",
    phase: "pre",
    phaseLabel: "Start of day · House",
    contextLine: "89% occupancy · 12 arrivals",
    headline: "You’re nearly sold out —\nbut giving too much away to OTAs.",
    soWhat: "High demand is still leaking through expensive channels.",
    exposed: { amount: 4200, kind: "exposed", horizon: "tonight" },
    expected: { amount: 3100, kind: "protected", horizon: "tonight" },
    action: "Hold 4 premium rooms direct until 72h out.",
    fallback: "If pickup weakens: release 2 rooms back to OTA.",
    deadline: "Decide before noon",
    evidence: [
      { value: "73%", label: "Direct-fill probability" },
      { value: "+€26", label: "ADR uplift" },
    ],
    why: hotelWhy,
    options: [
      {
        id: "do_nothing",
        title: "Do nothing",
        netVsDoNothing: 0,
        note: "€4.200 perishes to OTA commission drag",
      },
      {
        id: "soft_cap",
        title: "Soft cap OTA",
        netVsDoNothing: 1800,
        note: "Partial protection · still leaks premium",
      },
      {
        id: "hold_72h",
        title: "Hold premium direct to 72h",
        netVsDoNothing: 3100,
        note: "Best net · protects ADR and commission",
        recommended: true,
      },
    ],
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/hotel-ota-soldout.png",
    imageAlt: "Boutique hotel room",
  },
  apartment: {
    id: DECISION_IDS.orphan,
    vertical: "apartment",
    property: "Chiado Collective · Lisbon",
    phase: "pre",
    phaseLabel: "Availability · Serviced apartments",
    contextLine: "Unit 24 · one-night gap · 72h to arrival",
    headline: "Unit 24 has a one-night gap.",
    soWhat: "Three viable paths — discount, OTA now, or wait for direct.",
    exposed: { amount: 164, kind: "exposed", horizon: "tonight" },
    expected: { amount: 112, kind: "protected", horizon: "tonight" },
    action: "Wait 24h · prefer direct at €148 before OTA fallback.",
    fallback: "If pace weakens: release to OTA at floor.",
    deadline: "Reassess in 24h",
    evidence: [
      { value: "17", label: "Comparable gaps" },
      { value: "€148", label: "Recommended rate" },
      { value: "€112", label: "Expected contribution (wait)" },
    ],
    why: apartmentWhy,
    options: [
      {
        id: "discount_now",
        title: "Discount now",
        netVsDoNothing: 78,
        note: "Faster fill · lower expected contribution",
      },
      {
        id: "ota_now",
        title: "OTA release now",
        netVsDoNothing: 72,
        note: "Fills · pays distribution tax",
      },
      {
        id: "wait_direct",
        title: "Wait 24h · direct first",
        netVsDoNothing: 112,
        note: "Recommended rate €148 · expected contribution €112",
        recommended: true,
      },
    ],
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/apt-orphan-gap.png",
    imageAlt: "Empty apartment night",
  },
};

/** Same ID as hero — verified after the night */
export function verifiedOf(hero: Decision): Decision {
  if (hero.id === DECISION_IDS.tuna) {
    return {
      ...hero,
      phase: "after",
      phaseLabel: "After · Close",
      contextLine: "Service closed · outcomes verified",
      headline: "Tuna shortfall caught before open.",
      soWhat: "Peak held. Feature-swap-first protected contribution.",
      exposed: undefined,
      expected: undefined,
      options: undefined,
      status: "verified",
      action: "Protected",
      verified: {
        amount: 1590,
        kind: "protected",
        note: "Peak contribution protected · POS close",
      },
      learn:
        "Feature-swap-first outperformed supplier-first — reinforce playbook. Supply risk is structural.",
      silenceNote: "Everything else operated within expectations.",
      evidence: [
        { value: "€1,590", label: "Protected tonight" },
        { value: "0", label: "Guest impact" },
      ],
      proof: [
        { label: "Event", detail: "Supplier shortfall · 6 portions tuna" },
        { label: "Exposure", detail: "€1,840 peak contribution exposed" },
        { label: "Decision", detail: "Feature Truffle Pasta first" },
        { label: "Action", detail: "Menu feature prepared — not auto-written" },
        {
          label: "Observed outcome",
          detail: "Peak held · feature executed · no guest impact",
        },
        {
          label: "Verified value",
          detail: "€1,590 protected tonight",
        },
      ],
      why: {
        ...hero.why,
        blocks: [
          ...hero.why.blocks,
          {
            epistemic: "VERIFIED",
            title: "Peak held",
            body: "€1,590 protected tonight. Feature swap executed. Supplier fallback unused.",
          },
        ],
      },
    };
  }
  if (hero.id === DECISION_IDS.ota) {
    return {
      ...hero,
      phase: "after",
      phaseLabel: "End of day · House",
      contextLine: "Arrivals complete · outcomes verified",
      headline: "Direct hold protected weekend mix.",
      soWhat: "OTA share capped. ADR held on remaining premium rooms.",
      exposed: undefined,
      expected: undefined,
      options: undefined,
      status: "verified",
      action: "Protected",
      verified: {
        amount: 2960,
        kind: "protected",
        note: "Contribution protected · direct fill on held inventory",
      },
      learn:
        "Direct pickup was slightly weaker than modeled. Hold still beat early OTA release — reinforce the 72h weekend rule.",
      silenceNote: "Everything else operated within expectations.",
      evidence: [
        { value: "€2,960", label: "Protected tonight" },
        { value: "−4.5%", label: "Vs expected" },
      ],
      proof: [
        { label: "Event", detail: "OTA share above target on high-demand date" },
        { label: "Exposure", detail: "€4,200 contribution exposed" },
        { label: "Decision", detail: "Hold premium direct 72h" },
        { label: "Action", detail: "Channel hold prepared — not auto-written" },
        {
          label: "Observed outcome",
          detail: "3 of 4 premium rooms sold direct",
        },
        { label: "Verified value", detail: "€2,960 protected tonight" },
      ],
    };
  }
  return {
    ...hero,
    phase: "after",
    phaseLabel: "Evening · Serviced apartments",
    contextLine: "Turns closed · orphan night verified",
    headline: "Wait held — then direct filled at €148.",
    soWhat: "Judgment to wait beat early discount and early OTA.",
    exposed: undefined,
    expected: undefined,
    options: undefined,
    status: "verified",
    action: "Recovered",
    verified: {
      amount: 118,
      kind: "recovered",
      note: "Contribution recovered · direct fill on Unit 24",
    },
    learn:
      "Direct arrived within the wait window. Reinforce: wait 24h before OTA on ≥72h orphan gaps.",
    silenceNote: "Everything else operated within expectations.",
    evidence: [
      { value: "€118", label: "Recovered tonight" },
      { value: "+€6", label: "Vs expected €112" },
    ],
    proof: [
      { label: "Event", detail: "One-night gap on Unit 24 · 72h to arrival" },
      { label: "Exposure", detail: "€164 if empty" },
      { label: "Decision", detail: "Wait 24h · direct first" },
      { label: "Action", detail: "Hold open · OTA fallback armed — not auto-written" },
      { label: "Observed outcome", detail: "Filled direct at €148+" },
      { label: "Verified value", detail: "€118 recovered" },
    ],
  };
}

export const VERIFIED_BY_VERTICAL: Record<DecisionVertical, Decision> = {
  restaurant: verifiedOf(HERO_BY_VERTICAL.restaurant),
  hotel: verifiedOf(HERO_BY_VERTICAL.hotel),
  apartment: verifiedOf(HERO_BY_VERTICAL.apartment),
};

/**
 * Extra Simulate fork — only when hero has no options (restaurant rain).
 * Arithmetic reconciles: do nothing = €0 net; options net vs do nothing.
 */
export const RAIN_SIMULATE: Decision = {
  id: DECISION_IDS.rain,
  vertical: "restaurant",
  property: "Berlin Mitte",
  phase: "live",
  phaseLabel: "Live · Weather",
  contextLine: "Heavy rain · terrace 36 covers",
  headline: "Rain changed the operation.",
  soWhat:
    "Terrace demand collapses. Bar and delivery can absorb part of it.",
  exposed: { amount: 467, kind: "exposed", horizon: "tonight" },
  action: "FOH + standing + delivery prep",
  deadline: "Decide by 18:45",
  evidence: [
    { value: "€467", label: "Unmanaged perish" },
    { value: "78%", label: "Confidence" },
  ],
  options: [
    {
      id: "do_nothing",
      title: "Do nothing",
      netVsDoNothing: 0,
      note: "€467 perishes unmanaged",
    },
    {
      id: "move_foh",
      title: "Move 1 FOH",
      netVsDoNothing: 212,
      cost: 48,
      note: "Partial capture · labor already netted",
    },
    {
      id: "full_replan",
      title: "FOH + standing + delivery",
      netVsDoNothing: 373,
      cost: 94,
      note: "Best net · labor €94 already netted",
      recommended: true,
    },
  ],
  why: {
    blocks: [
      {
        epistemic: "OBSERVED",
        title: "Rain at location",
        body: "Heavy rain. Terrace 36 covers exposed. Bar constrained 19:15–20:00.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Unmanaged perish",
        body: "€467 contribution perishes if unmanaged. Indoor + delivery can reclaim most of it after labor.",
      },
      {
        epistemic: "PREDICTED",
        title: "Rainy dinners",
        body: "Full replan historically retained the most contribution on rainy services here.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Full replan",
        body: "FOH + standing + delivery. Net +€373 vs do nothing after €94 labor.",
      },
    ],
    sources: [
      { name: "Weather", freshness: "Live" },
      { name: "POS", freshness: "Live" },
      { name: "Labor roster", freshness: "Today" },
      { name: "Delivery channels", freshness: "Live" },
    ],
    sample: { n: 38, window: "rainy dinners at this location" },
    baseline: "Do nothing = €0 net vs itself; €467 perishes",
    effect: "Historically followed by highest net recovery after labor",
    confidence: { point: 78, low: 69, high: 84 },
    assumptions: ["One FOH can move without collapsing the floor"],
    locationDna:
    "At Berlin Mitte, on 38 comparable rainy dinners at this location, a full indoor + delivery replan historically preceded the highest net vs doing nothing.",
  },
  status: "needs_you",
  payloadNote: PAYLOAD,
};

/** Hidden signal — tonight/this-week first; annual only in Why */
export const HIDDEN_BY_VERTICAL: Record<DecisionVertical, Decision> = {
  restaurant: {
    id: DECISION_IDS.hiddenMenu,
    vertical: "restaurant",
    property: "Berlin Mitte",
    phase: "day",
    phaseLabel: "Learn · Menu",
    contextLine: "Peak prominence · this week",
    headline: "Your bestseller isn’t your best dish.",
    soWhat:
      "Tuna wins volume. Truffle Pasta wins contribution per kitchen minute.",
    expected: { amount: 162, kind: "created", horizon: "this_week" },
    action: "Increase Truffle Pasta prominence during 19:00–21:00.",
    deadline: "Decide this week",
    evidence: [
      { value: "+34%", label: "Contribution / kitchen minute" },
      { value: "€162", label: "Expected this week" },
    ],
    why: {
      blocks: [
        {
          epistemic: "OBSERVED",
          title: "Volume vs contribution",
          body: "Tuna Tataki #1 by volume. Truffle Pasta higher contribution per kitchen minute.",
        },
        {
          epistemic: "ESTIMATED",
          title: "This week",
          body: "€162 expected created this week if peak prominence shifts. €8.420 annual is the supporting horizon only.",
        },
        {
          epistemic: "PREDICTED",
          title: "Peak re-weight",
          body: "Peak re-weight historically followed by higher contribution with lower waste.",
        },
        {
          epistemic: "RECOMMENDED",
          title: "Shift prominence",
          body: "Increase Truffle prominence 19:00–21:00.",
        },
      ],
      sources: [
        { name: "POS", freshness: "Week lookback" },
        { name: "Recipe cost", freshness: "Week lookback" },
        { name: "Ticket time", freshness: "Week lookback" },
      ],
      sample: { n: 52, window: "peak services this quarter" },
      baseline: "Current menu prominence",
      effect: "Associated with higher peak contribution",
      confidence: { point: 76, low: 70, high: 82 },
      assumptions: ["Kitchen capacity holds under re-weight"],
      locationDna:
        "At Berlin Mitte, under peak pressure, shifting prominence toward higher contribution-per-minute dishes historically preceded stronger peak economics.",
    },
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/dish-truffle-pasta.png",
    imageAlt: "Truffle Pasta",
  },
  hotel: {
    id: DECISION_IDS.hiddenMix,
    vertical: "hotel",
    property: "Canal House · Amsterdam",
    phase: "day",
    phaseLabel: "Learn · Mix",
    contextLine: "High-demand nights · this week",
    headline: "Sold out is not the same as protected.",
    soWhat: "OTA share on high-demand dates is still climbing after strong nights.",
    exposed: { amount: 4200, kind: "exposed", horizon: "this_week" },
    action: "Make the 72h direct hold a standing weekend rule.",
    deadline: "Decide today",
    evidence: [
      { value: "+9 pts", label: "OTA climb vs target" },
      { value: "€4.200", label: "Exposed this week" },
    ],
    why: hotelWhy,
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/hotel-direct-mix.png",
    imageAlt: "Direct booking room",
  },
  apartment: {
    id: DECISION_IDS.hiddenOrphanRule,
    vertical: "apartment",
    property: "Chiado Collective · Lisbon",
    phase: "day",
    phaseLabel: "Learn · Availability",
    contextLine: "Same orphan Tuesday · this week",
    headline: "The same gap keeps returning.",
    soWhat: "One-night opens work — until the rule is forgotten next week.",
    expected: { amount: 328, kind: "created", horizon: "this_week" },
    action: "Approve standing rule: open one-night inventory ≥72h out.",
    deadline: "Decide this week",
    evidence: [
      { value: "64%", label: "Historical fill" },
      { value: "€328", label: "Expected this week" },
    ],
    why: {
      ...apartmentWhy,
      blocks: [
        ...apartmentWhy.blocks,
        {
          epistemic: "ESTIMATED",
          title: "Annual support",
          body: "€2.516 annual is supporting context only — act on this week’s €328.",
        },
      ],
    },
    status: "needs_you",
    payloadNote: PAYLOAD,
    image: "/marketing/apt-orphan-gap.png",
    imageAlt: "Orphan night gap",
  },
};

/** Extra verified example for ledger (in addition to hero thread) */
export const TABLE_RECOVERED: Decision = {
  id: DECISION_IDS.tableRecover,
  vertical: "restaurant",
  property: "Berlin Mitte",
  phase: "after",
  phaseLabel: "After · Recovery",
  contextLine: "Table 8 · earlier tonight",
  headline: "Table 8 recovered after late cancel.",
  soWhat: "Waitlist fill held contribution that would have expired.",
  status: "verified",
  action: "Recovered",
  verified: {
    amount: 184,
    kind: "recovered",
    note: "Table 8 · waitlist fill verified",
  },
  evidence: [
    { value: "€184", label: "Recovered tonight" },
    { value: "12 min", label: "Time to fill" },
  ],
  why: {
    blocks: [
      {
        epistemic: "VERIFIED",
        title: "Waitlist fill",
        body: "Late cancel → waitlist prepare → fill observed → €184 recovered.",
      },
    ],
    sources: [
      { name: "Reservation book", freshness: "Verified" },
      { name: "POS", freshness: "Verified" },
    ],
    sample: { n: 24, window: "comparable late cancels" },
    baseline: "Empty table after cancel",
    effect: "Historically followed by recovered covers when waitlist is ready",
    confidence: { point: 81, low: 74, high: 87 },
    assumptions: [],
    locationDna:
      "At Berlin Mitte, prepared waitlist recovery historically preceded recovered table contribution after late cancels.",
  },
  payloadNote: PAYLOAD,
  proof: [
    { label: "Event", detail: "Late cancel Table 8" },
    { label: "Exposure", detail: "€184 cover contribution" },
    { label: "Decision", detail: "Prepare waitlist fill" },
    { label: "Action", detail: "Host notified · seat held" },
    { label: "Observed outcome", detail: "Filled in 12 min" },
    { label: "Verified value", detail: "€184 recovered" },
  ],
};

export function heroFor(vertical: DecisionVertical): Decision {
  return HERO_BY_VERTICAL[vertical];
}

/** Extra Simulate section only when hero has no options (restaurant rain). */
export function simulateFor(vertical: DecisionVertical): Decision | null {
  if (vertical === "restaurant") return RAIN_SIMULATE;
  if (!HERO_BY_VERTICAL[vertical].options?.length) return RAIN_SIMULATE;
  return null;
}

export function needsYouFor(vertical: DecisionVertical): Decision[] {
  const hero = HERO_BY_VERTICAL[vertical];
  if (vertical === "restaurant") {
    return [hero, RAIN_SIMULATE];
  }
  return [hero];
}

export function ledgerFor(vertical: DecisionVertical): Decision[] {
  const verified = VERIFIED_BY_VERTICAL[vertical];
  if (vertical === "restaurant") {
    return [verified, TABLE_RECOVERED];
  }
  return [verified];
}

export function decisionById(id: string): Decision | undefined {
  const all = [
    ...Object.values(HERO_BY_VERTICAL),
    ...Object.values(VERIFIED_BY_VERTICAL),
    ...Object.values(HIDDEN_BY_VERTICAL),
    RAIN_SIMULATE,
    TABLE_RECOVERED,
  ];
  const hit = all.find((d) => d.id === id);
  if (hit) return hit;
  const record = getDecisionRecord(id);
  if (record) return projectDecision(record);
  return undefined;
}

export function toDecisionVertical(
  id: "restaurant" | "hotel" | "apartments" | "apartment",
): DecisionVertical {
  return id === "apartments" ? "apartment" : id;
}

export function toHeroVertical(
  id: DecisionVertical,
): "restaurant" | "hotel" | "apartments" {
  return id === "apartment" ? "apartments" : id;
}
