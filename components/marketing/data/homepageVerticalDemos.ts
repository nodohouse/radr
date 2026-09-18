/**
 * Homepage hero — one prepared decision arc per vertical.
 * Pattern: CONTEXT → SIGNAL → VALUE → EVIDENCE → RECOMMEND → ACT
 */

import { CANON_ORPHAN } from "@/lib/radr/decision/demo/canonical";

export type HeroVerticalId = "restaurant" | "hotel" | "apartments";
export type HeroTimeframeId = "pre" | "live" | "after" | "day";
export type HeroFrameMood = "decide" | "silence" | "review";

export type HeroPulse = {
  amount: number;
  amountLabel: string;
  forecastPct: number;
  forecastLabel: string;
  chips: { label: string; value: string; tone?: "watch" | "good" | "mute" }[];
};

export type HeroEvidence = {
  label: string;
  value: string;
};

/** One prepared decision — not a dashboard. */
export type HeroCritical = {
  image: string;
  imageAlt: string;
  domain: string;
  /** The hidden insight — primary headline */
  insight: string;
  /** Optional short supporting line under insight */
  shortfall?: string;
  stakeValue: number;
  stakeLabel: string;
  recommends: {
    primary: string;
    fallback?: string;
  };
  protectedAmount: string;
  protectedLabel: string;
  /** Compact proof row shown by default (2–3) */
  proof: HeroEvidence[];
  /** Deeper basis behind WHY */
  whyBasis: string[];
  cta: string;
  confidence?: string;
  decideBy?: string;
};

export type HeroOption = {
  label: string;
  outcome: string;
  recommended?: boolean;
};

/** Second attention window under the primary decision — options, not another dashboard. */
export type HeroSecondary = {
  domain: string;
  situation: string;
  detail: string;
  options: HeroOption[];
};

export type HeroFrame = {
  kicker: string;
  headline: string;
  meta: string;
  /** Compact operating context — demotes the old KPI strip */
  contextLine?: string;
  mood: HeroFrameMood;
  pulse?: HeroPulse;
  critical?: HeroCritical;
  /** Optional second decision that replaces critical after a beat */
  altCritical?: HeroCritical;
  /** Compact options card under the primary decision */
  secondary?: HeroSecondary;
  needsCount: number;
  handlingCount: number;
  watchingCount: number;
  handling: { status: string; label: string }[];
  verified: { amount: number; label: string };
  silenceNote?: string;
  /** After / Day — what worked */
  reviewLines?: string[];
  /** After / Day — where to improve next */
  improveLines?: string[];
  heroImage?: string;
};

export type HeroVerticalScenario = {
  id: HeroVerticalId;
  currency: "USD" | "EUR";
  place: string;
  frames: Record<HeroTimeframeId, HeroFrame>;
};

export const HERO_VERTICAL_ORDER: HeroVerticalId[] = [
  "restaurant",
  "hotel",
  "apartments",
];

/** Short hero tab labels — display only (`apartments` id unchanged). */
export const HERO_VERTICAL_LABELS: Record<HeroVerticalId, string> = {
  restaurant: "Restaurants",
  hotel: "Hotels",
  apartments: "Aparthotels",
};

export const HERO_TIMEFRAME_ORDER: HeroTimeframeId[] = [
  "pre",
  "live",
  "after",
  "day",
];

export const HERO_VERTICAL_SCENARIOS: Record<
  HeroVerticalId,
  HeroVerticalScenario
> = {
  restaurant: {
    id: "restaurant",
    currency: "EUR",
    place: "Berlin Mitte",
    frames: {
      pre: {
        kicker: "Live · Peak",
        headline: "Empty tables. Don't seat yet.",
        meta: "18:42 · floor 78% · walk-ins waiting",
        mood: "decide",
        needsCount: 1,
        handlingCount: 3,
        watchingCount: 1,
        contextLine: "Dinner · peak capacity collision · 18:42",
        critical: {
          image: "/demo/facilities/berlin-dining.jpg",
          imageAlt: "Dining room with empty tables and waiting walk-ins",
          domain: "Capacity",
          insight:
            "Dining room 78% occupied. Walk-ins waiting.\nObvious move: seat them.",
          stakeValue: 620,
          stakeLabel: "vs seat-now",
          recommends: {
            primary: "Wait 12 minutes. Hold 2 walk-in tables.",
            fallback:
              "Throttle delivery · feature fast dish · resume seating at 18:54.",
          },
          protectedAmount: "€620",
          protectedLabel: "expected vs immediate seating",
          proof: [
            { label: "Inbound 22m", value: "38 covers" },
            { label: "Kitchen", value: "92%" },
          ],
          whyBasis: [
            "Obvious path: seat now · kitchen →97% · second turns slip",
            "38 covers arriving in 22 min · ticket time 14 min ↑",
            "Delivery +31% vs plan · lower marginal contribution this window",
            "When kitchen >94% for >15 min: tickets ≥17m · comps rise",
            "Decide by 18:53 — hold window closes",
          ],
          confidence: "Medium-high confidence",
          decideBy: "Decide by 18:53",
          cta: "Approve hold",
        },
        handling: [
          { status: "Prepared", label: "Waitlist hold · peak" },
          { status: "Prepared", label: "FOH move 19:15–20:30" },
          { status: "Watching", label: "Terrace vs rain window" },
        ],
        verified: { amount: 184, label: "Yesterday · Table 14 recovered" },
      },
      live: {
        kicker: "Live · Dinner",
        headline: "One interrupt during service.",
        meta: "Table 8 cancelled · 4 covers · peak still open",
        mood: "decide",
        needsCount: 1,
        handlingCount: 2,
        watchingCount: 1,
        pulse: {
          amount: 4120,
          amountLabel: "contribution so far",
          forecastPct: 48,
          forecastLabel: "of dinner forecast",
          chips: [
            { label: "Wolt", value: "surging", tone: "watch" },
            { label: "Uber Eats", value: "+8%", tone: "good" },
            { label: "Floor", value: "peak open", tone: "mute" },
          ],
        },
        critical: {
          image: "/marketing/dish-truffle-pasta.png",
          imageAlt: "Peak table at stake after a cancellation",
          domain: "Sell",
          insight: "Table 8 just cancelled — 4 covers free before peak.",
          shortfall: "Waitlist ready · peak window still open.",
          stakeValue: 186,
          stakeLabel: "this turn at risk",
          whyBasis: [
            "Comparable cases at this location",
            "Current operating pace",
            "Economics include channel cost",
          ],
          proof: [
            { label: "Waitlist", value: "6 parties" },
            { label: "Historical fill", value: "64%" },
          ],
          recommends: {
            primary: "Post story and open the waitlist now.",
            fallback: "If fill stalls in 12 min, hold for walk-ins.",
          },
          protectedAmount: "€142",
          protectedLabel: "expected protected",
          confidence: "High confidence",
          decideBy: "Decide in 8 min",
          cta: "Approve plan",
        },
        handling: [
          { status: "Handling", label: "Course timing · pass" },
          { status: "Watching", label: "Walk-in pace" },
        ],
        verified: { amount: 96, label: "Earlier · bar recovery" },
      },
      after: {
        kicker: "After · Close",
        headline: "Since your last check.",
        meta: "Service closed · outcomes verified",
        mood: "review",
        needsCount: 0,
        handlingCount: 0,
        watchingCount: 0,
        pulse: {
          amount: 9840,
          amountLabel: "net sales tonight",
          forecastPct: 104,
          forecastLabel: "of forecast",
          chips: [
            { label: "Wolt", value: "+9% vs plan", tone: "good" },
            { label: "Uber Eats", value: "held", tone: "mute" },
            { label: "Interrupts", value: "3 handled", tone: "mute" },
          ],
        },
        handling: [],
        verified: {
          amount: 590,
          label: "Peak hold protected · D-1911",
        },
        reviewLines: [
          "D-1911 · expected +€620 vs seat-now · actual €590 protected",
          "Table 8 cancel filled via waitlist",
        ],
        improveLines: [
          "Playbook updated · wait-then-resume on peak collision · kitchen ≥90%",
        ],
      },
      day: {
        kicker: "Day · Lookback",
        headline: "One pattern still needs a call.",
        meta: "What worked · what to improve",
        mood: "decide",
        needsCount: 1,
        handlingCount: 0,
        watchingCount: 1,
        pulse: {
          amount: 41200,
          amountLabel: "week contribution",
          forecastPct: 98,
          forecastLabel: "of week plan",
          chips: [
            { label: "Verified", value: "€509", tone: "good" },
            { label: "Misses", value: "2 tuna", tone: "watch" },
            { label: "Attention", value: "saved 4h", tone: "good" },
          ],
        },
        critical: {
          image: "/marketing/dish-tuna-tataki.png",
          imageAlt: "Tuna Tataki",
          domain: "Buy · Learn",
          insight: "The same tuna shortfall twice this week.",
          shortfall: "Delivery reliability is drifting — set a rule.",
          stakeValue: 3200,
          stakeLabel: "weekly exposure",
          whyBasis: [
            "Two tuna misses already this week",
            "Peak exposure stacks to €3.2k",
            "Backup dish rule would have protected Friday",
            "Supplier lead time still slipping",
          ],
          proof: [
            { label: "Misses this week", value: "2" },
            { label: "Peak exposure", value: "€3.2k" },
          ],
          recommends: {
            primary: "Open supplier review and set a backup dish rule.",
          },
          protectedAmount: "€2,400",
          protectedLabel: "expected weekly protected",
          confidence: "High confidence",
          decideBy: "Decide this afternoon",
          cta: "Approve plan",
        },
        handling: [{ status: "Watching", label: "Tomorrow covers · fair week" }],
        verified: { amount: 509, label: "Verified this month" },
        reviewLines: [
          "Feature swap protected Friday peak",
          "Waitlist fill recovered two cancels",
        ],
        improveLines: [
          "Codify tuna backup dish when lead time slips",
        ],
      },
    },
  },
  hotel: {
    id: "hotel",
    currency: "EUR",
    place: "Canal House · Amsterdam",
    frames: {
      pre: {
        kicker: "Start of day · House",
        headline: "One decision before arrivals.",
        meta: "89% occupancy · 12 arrivals",
        contextLine: "Today · 89% occupancy · €14,800 projected · 12 arrivals",
        mood: "decide",
        needsCount: 1,
        handlingCount: 2,
        watchingCount: 1,
        heroImage: "/marketing/hero-hotel-brief.png",
        critical: {
          image: "/marketing/hotel-ota-soldout.png",
          imageAlt: "Boutique hotel room",
          domain: "Channel mix",
          insight: "You’re nearly sold out —\nbut giving too much away to OTAs.",
          stakeValue: 4200,
          stakeLabel: "exposed tonight",
          recommends: {
            primary: "Hold 4 premium rooms direct until 72h out.",
            fallback: "If pickup weakens: release 2 rooms back to OTA.",
          },
          protectedAmount: "€3,100",
          protectedLabel: "expected protected tonight",
          proof: [
            { label: "Historical direct-fill probability", value: "73%" },
            { label: "ADR uplift", value: "+€26" },
            { label: "OTA share above target", value: "11 pts" },
          ],
          whyBasis: [
            "18 comparable high-demand dates",
            "Current booking pace ahead of baseline",
            "Occupancy already 89%",
            "Direct share 48% vs 59% target",
            "Event-driven pickup remains strong",
            "OTA commission drag included",
          ],
          confidence: "High confidence",
          decideBy: "Decide before noon",
          cta: "Approve plan",
        },
        altCritical: {
          image: "/marketing/hero-hotel-brief.png",
          imageAlt: "Hotel corridor readiness",
          domain: "Guest operations",
          insight: "Two arrivals will beat their rooms.",
          shortfall: "Rooms 214 and 308",
          stakeValue: 40,
          stakeLabel: "upgrade cost",
          recommends: {
            primary: "Upgrade both to ready deluxe rooms.",
            fallback: "Alternative: lounge hold 40 min.",
          },
          protectedAmount: "High",
          protectedLabel: "guest-recovery / NPS protection",
          proof: [
            { label: "Rooms ready now", value: "2 deluxe" },
            { label: "Arrival window", value: "40 min" },
          ],
          whyBasis: [
            "Housekeeping still finishing 214 and 308",
            "Two deluxe rooms already ready",
            "Early arrivals confirmed on channel",
            "Lounge hold protects review if upgrade unavailable",
          ],
          confidence: "High confidence",
          decideBy: "Decide in 12 min",
          cta: "Approve plan",
        },
        handling: [
          { status: "Prepared", label: "HK priority · Floor 3" },
          { status: "Watching", label: "Pickup vs pace" },
        ],
        verified: { amount: 420, label: "Yesterday · deluxe direct" },
      },
      live: {
        kicker: "Live · House",
        headline: "Nothing needs you right now.",
        meta: "RADR is handling the house",
        mood: "silence",
        needsCount: 0,
        handlingCount: 2,
        watchingCount: 2,
        heroImage: "/marketing/hero-hotel-brief.png",
        pulse: {
          amount: 11200,
          amountLabel: "room revenue today",
          forecastPct: 78,
          forecastLabel: "of day plan",
          chips: [
            { label: "Ready", value: "38 / 42", tone: "good" },
            { label: "Arrivals left", value: "9", tone: "mute" },
            { label: "Mix watch", value: "on", tone: "watch" },
          ],
        },
        silenceNote:
          "Stay with the operation. RADR runs readiness and mix watch quietly.",
        handling: [
          { status: "Handling", label: "HK priority · Floor 3" },
          { status: "Watching", label: "Direct pace · tonight" },
        ],
        verified: { amount: 420, label: "Earlier · deluxe direct" },
      },
      after: {
        kicker: "End of day · House",
        headline: "Since your last check.",
        meta: "Arrivals complete · outcomes verified",
        mood: "review",
        needsCount: 0,
        handlingCount: 0,
        watchingCount: 0,
        heroImage: "/marketing/hotel-direct-mix.png",
        pulse: {
          amount: 19240,
          amountLabel: "room contribution today",
          forecastPct: 103,
          forecastLabel: "of plan",
          chips: [
            { label: "Direct", value: "held", tone: "good" },
            { label: "OTA", value: "capped", tone: "good" },
            { label: "Ready", value: "on time", tone: "mute" },
          ],
        },
        handling: [],
        verified: {
          amount: 420,
          label: "Deluxe night recovered · direct",
        },
        reviewLines: [
          "Direct hold protected weekend mix",
          "Housekeeping priority cleared Floor 3 on time",
        ],
        improveLines: [
          "Shoulder OTA still climbing — revisit hold rules",
        ],
      },
      day: {
        kicker: "Day · Canal House",
        headline: "Occupancy is strong. Mix still needs a call.",
        meta: "What worked · what to improve",
        mood: "decide",
        needsCount: 1,
        handlingCount: 0,
        watchingCount: 1,
        heroImage: "/marketing/hero-hotel-brief.png",
        pulse: {
          amount: 86400,
          amountLabel: "week room contribution",
          forecastPct: 101,
          forecastLabel: "of week plan",
          chips: [
            { label: "Verified", value: "€1,840", tone: "good" },
            { label: "Direct", value: "rising", tone: "good" },
            { label: "Shoulder", value: "OTA watch", tone: "watch" },
          ],
        },
        critical: {
          image: "/marketing/hotel-direct-mix.png",
          imageAlt: "Direct booking room",
          domain: "Channel mix · Learn",
          insight: "Weekend demand is strong —\nbut OTA share is climbing again.",
          shortfall: "Shoulder dates still leaking mix.",
          stakeValue: 4200,
          stakeLabel: "weekend contribution at risk",
          whyBasis: [
            "Shoulder OTA climb of +9 pts this week",
            "Direct hold protected Friday ADR",
            "Commission drag already €4.2k exposed",
            "Comparable weekends fill direct when held to 72h",
          ],
          proof: [
            { label: "Shoulder OTA climb", value: "+9 pts" },
            { label: "Direct-fill probability", value: "71%" },
          ],
          recommends: {
            primary: "Make the 72h direct hold a standing weekend rule.",
          },
          protectedAmount: "€3,100",
          protectedLabel: "expected protected",
          confidence: "High confidence",
          decideBy: "Decide today",
          cta: "Approve plan",
        },
        handling: [{ status: "Watching", label: "Weekend pickup" }],
        verified: { amount: 1840, label: "Verified this week" },
        reviewLines: [
          "Direct hold protected Friday ADR",
        ],
        improveLines: [
          "Make 72h direct hold a standing weekend rule",
        ],
      },
    },
  },
  apartments: {
    id: "apartments",
    currency: "EUR",
    place: CANON_ORPHAN.property,
    frames: {
      pre: {
        kicker: "Availability · Serviced apartments",
        headline: "One opportunity before it expires.",
        meta: "84 units · 78% occupancy",
        mood: "decide",
        needsCount: 1,
        handlingCount: 2,
        watchingCount: 1,
        heroImage: "/marketing/hero-apt-brief.png",
        contextLine: "Today · 84 units · 78% occupancy · 1 gap night · 72h out",
        critical: {
          image: "/marketing/apt-orphan-gap.png",
          imageAlt: "Empty apartment night",
          domain: "Availability",
          insight: "Unit 24 has a one-night gap.",
          stakeValue: 164,
          stakeLabel: "exposed if empty",
          recommends: {
            primary: "Wait 24h · prefer direct at €148.",
            fallback: "If pace weakens: release to OTA at floor.",
          },
          protectedAmount: `€${CANON_ORPHAN.expectedProtectedEuro}`,
          protectedLabel: "expected net contribution · wait path",
          proof: [
            { label: "Comparable gaps", value: "17" },
            {
              label: "Recommended rate",
              value: `€${CANON_ORPHAN.recommendedRateEuro}`,
            },
          ],
          whyBasis: [
            "One-night gap · 72 hours to arrival",
            "Cleaning already absorbed · next stay Wednesday",
            "17 comparable gaps · direct demand still building",
            "OTA cost known · discount leaves margin behind",
            "Judgment: do nothing yet",
          ],
          confidence: "High confidence",
          decideBy: "Reassess in 24h",
          cta: "Approve wait",
        },
        handling: [
          { status: "Prepared", label: "Cleaner capacity · peak" },
          { status: "Watching", label: "Channel fee variance" },
        ],
        verified: {
          amount: CANON_ORPHAN.actualProtectedEuro,
          label: "Last Tuesday recovered",
        },
      },
      live: {
        kicker: "Live · Serviced apartments",
        headline: "Nothing needs you right now.",
        meta: "RADR is handling turns",
        mood: "silence",
        needsCount: 0,
        handlingCount: 2,
        watchingCount: 1,
        heroImage: "/marketing/apt-occupied.png",
        pulse: {
          amount: 2860,
          amountLabel: "unit revenue today",
          forecastPct: 69,
          forecastLabel: "of day plan",
          chips: [
            { label: "Turns left", value: "3", tone: "mute" },
            { label: "Orphan", value: "open · watching", tone: "watch" },
            { label: "Guests", value: "quiet", tone: "good" },
          ],
        },
        silenceNote:
          "Stay with the operation. Orphan inventory and turns run quietly in RADR.",
        handling: [
          { status: "Handling", label: "Unit 24 · one-night open" },
          { status: "Watching", label: "Turn cluster · tonight" },
        ],
        verified: { amount: 164, label: "Earlier orphan fill" },
      },
      after: {
        kicker: "Evening · Serviced apartments",
        headline: "Since your last check.",
        meta: "Turns closed · orphan night verified",
        mood: "review",
        needsCount: 0,
        handlingCount: 0,
        watchingCount: 0,
        heroImage: "/marketing/apt-occupied.png",
        pulse: {
          amount: 4280,
          amountLabel: "unit contribution today",
          forecastPct: 104,
          forecastLabel: "of plan",
          chips: [
            { label: "Direct", value: "filled gap", tone: "good" },
            { label: "Guest impact", value: "none", tone: "good" },
            { label: "Cleaner", value: "held", tone: "mute" },
          ],
        },
        handling: [],
        verified: {
          amount: CANON_ORPHAN.actualProtectedEuro,
          label: "Orphan Tuesday recovered · direct",
        },
        reviewLines: [
          "Wait held · then direct filled at €148+",
          "Turns closed without guest impact",
        ],
        improveLines: [
          "Reinforce wait-24h before OTA on mid-week orphans",
        ],
      },
      day: {
        kicker: "Day · Chiado Collective",
        headline: "Portfolio is calm. One pattern remains.",
        meta: "What worked · what to improve",
        mood: "decide",
        needsCount: 1,
        handlingCount: 0,
        watchingCount: 1,
        heroImage: "/marketing/hero-apt-brief.png",
        pulse: {
          amount: 28600,
          amountLabel: "week unit contribution",
          forecastPct: 102,
          forecastLabel: "of week plan",
          chips: [
            { label: "Verified", value: "€984", tone: "good" },
            { label: "Orphan fill", value: "64%", tone: "good" },
            { label: "Rule", value: "still open", tone: "watch" },
          ],
        },
        critical: {
          image: "/marketing/apt-orphan-gap.png",
          imageAlt: "Orphan night gap",
          domain: "Availability · Learn",
          insight: "The same orphan Tuesday keeps returning.",
          shortfall: "Codify the one-night open before it expires again.",
          stakeValue: 2516,
          stakeLabel: "annual opportunity",
          whyBasis: [
            "Same orphan Tuesday pattern every week",
            "64% historical fill when opened ≥72h out",
            "€148 rate clears without guest impact",
            "Cleaner capacity already planned for turns",
          ],
          proof: [
            { label: "Historical fill", value: "64%" },
            { label: "Rate that works", value: "€148" },
          ],
          recommends: {
            primary:
              "Approve standing rule: open one-night inventory ≥72h out.",
          },
          protectedAmount: "€2,516",
          protectedLabel: "expected annual protected",
          confidence: "High confidence",
          decideBy: "Decide this week",
          cta: "Approve plan",
        },
        handling: [{ status: "Watching", label: "Event calendar · next month" }],
        verified: { amount: 984, label: "Verified this month" },
        reviewLines: [
          "One-night open filled twice this month",
        ],
        improveLines: [
          "Codify ≥72h orphan open as standing policy",
        ],
      },
    },
  },
};

export function formatHeroMoney(
  amount: number,
  currency: "USD" | "EUR",
): string {
  const symbol = currency === "EUR" ? "€" : "$";
  // English marketing site: comma thousands for both (€1,840 / $1,840)
  const grouped = Math.round(Math.abs(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${symbol}${grouped}`;
}
