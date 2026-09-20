/**
 * Demo fleet performance - Northstar group / NL region.
 * Each row carries why it ranks + drivers others can copy.
 */

import { LOCATIONS } from "@/lib/product/demo/catalog";
import { LOCATION_META } from "@/lib/product/demo/locations";
import type { RoleView } from "@/lib/product/types";
import type {
  FleetBrief,
  FleetDriver,
  FleetLocationRow,
  FleetSort,
  FleetSuccessCriterion,
} from "./types";

type Seed = Omit<
  FleetLocationRow,
  "id" | "name" | "city" | "country" | "region"
>;

const FLEET_SEED: Record<string, Seed> = {
  loc_ams: {
    contribution: 6120,
    marginPct: 19.8,
    marginVsPlan: 1.4,
    verified: 890,
    recoverable: 120,
    paceVsExpectedPct: 4.2,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Weather-matched terrace open + labor held to cover curve.",
    drivers: [
      {
        practice: "Open terrace when forecast ≥18°C & dry",
        effect: "+€740 contribution",
      },
      {
        practice: "Staff to covers, not to roster habit",
        effect: "−1.2 pts labor",
      },
      {
        practice: "Approve sourcing before 16:00",
        effect: "Zero 86’s at peak",
      },
    ],
  },
  loc_ber: {
    contribution: 5860,
    marginPct: 18.9,
    marginVsPlan: 0.8,
    verified: 1020,
    recoverable: 290,
    paceVsExpectedPct: 2.7,
    needsYou: 2,
    attentionEuro: 1020,
    status: "NEEDS_YOU",
    why: "Strong verified recoveries; two decisions still open tonight.",
    drivers: [
      {
        practice: "Bluefin sourcing prepared early",
        effect: "+€558 net protected",
      },
      {
        practice: "Terrace opened on weather call",
        effect: "+€496 contribution",
      },
      {
        practice: "Late cancel → waitlist match",
        effect: "+€184 verified",
      },
    ],
  },
  loc_lon: {
    contribution: 5480,
    marginPct: 18.2,
    marginVsPlan: 0.3,
    verified: 640,
    recoverable: 80,
    paceVsExpectedPct: 1.1,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Steady private dining mix; no material exceptions.",
    drivers: [
      {
        practice: "Private dining locked 72h ahead",
        effect: "+€420 contribution",
      },
      {
        practice: "Wine-by-glass attach at host stand",
        effect: "+0.4 pts margin",
      },
    ],
  },
  loc_par: {
    contribution: 5210,
    marginPct: 17.4,
    marginVsPlan: -0.4,
    verified: 410,
    recoverable: 210,
    paceVsExpectedPct: -1.8,
    needsYou: 1,
    attentionEuro: 480,
    status: "WATCH",
    why: "Pace soft at lunch; supplier credit still open.",
    drivers: [
      {
        practice: "Lunch covers under forecast",
        effect: "−€210 vs expected",
      },
      {
        practice: "Credit note not filed",
        effect: "€210 recoverable idle",
      },
    ],
  },
  loc_ber_kreuz: {
    contribution: 4920,
    marginPct: 17.1,
    marginVsPlan: -0.6,
    verified: 380,
    recoverable: 95,
    paceVsExpectedPct: -0.9,
    needsYou: 0,
    attentionEuro: 0,
    status: "WATCH",
    why: "Walk-ins soft; terrace stayed closed despite clear window.",
    drivers: [
      {
        practice: "Terrace left closed (dry evening)",
        effect: "Missed ~€380 lift",
      },
      {
        practice: "FOH understaffed 19:00-20:30",
        effect: "−0.6 pts margin",
      },
    ],
  },
  loc_nyc: {
    contribution: 7840,
    marginPct: 16.8,
    marginVsPlan: -1.1,
    verified: 1280,
    recoverable: 520,
    paceVsExpectedPct: -2.4,
    needsYou: 3,
    attentionEuro: 2140,
    status: "NEEDS_YOU",
    why: "Highest volume, weakest margin - labor + buy exposure.",
    drivers: [
      {
        practice: "Peak overstaffed vs covers",
        effect: "+2.1 pts labor drag",
      },
      {
        practice: "Three open buy decisions",
        effect: "€2.140 at stake",
      },
      {
        practice: "High verified recoveries still",
        effect: "+€1.280 verified",
      },
    ],
  },
  loc_nyc_wvill: {
    contribution: 6410,
    marginPct: 18.6,
    marginVsPlan: 0.9,
    verified: 760,
    recoverable: 140,
    paceVsExpectedPct: 3.1,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Tight labor curve + strong walk-in conversion.",
    drivers: [
      {
        practice: "Walk-in hold seats until 19:15",
        effect: "+28 covers converted",
      },
      {
        practice: "Labor flexed to covers real-time",
        effect: "+0.9 pts vs plan",
      },
    ],
  },
  loc_sf: {
    contribution: 5680,
    marginPct: 17.9,
    marginVsPlan: 0.2,
    verified: 540,
    recoverable: 70,
    paceVsExpectedPct: 0.6,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "On plan; no standout practice vs peers yet.",
    drivers: [
      {
        practice: "Pre-shift decisions cleared before open",
        effect: "Zero peak 86’s",
      },
    ],
  },
  loc_tyo: {
    contribution: 4290,
    marginPct: 20.4,
    marginVsPlan: 1.8,
    verified: 320,
    recoverable: 40,
    paceVsExpectedPct: 5.0,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Best margin in fleet - portion control + menu mix.",
    drivers: [
      {
        practice: "Portion variance checked twice daily",
        effect: "+1.8 pts margin vs plan",
      },
      {
        practice: "High-margin omakase mix protected",
        effect: "+€290 contribution quality",
      },
      {
        practice: "No waste above 3.2%",
        effect: "Buy leakage near zero",
      },
    ],
  },
  loc_sin: {
    contribution: 4550,
    marginPct: 19.1,
    marginVsPlan: 1.0,
    verified: 290,
    recoverable: 55,
    paceVsExpectedPct: 2.2,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Strong pace; group bookings confirmed early.",
    drivers: [
      {
        practice: "Groups locked 5 days out",
        effect: "+42 covers secured",
      },
      {
        practice: "Beverage attach scripted at host",
        effect: "+0.6 pts margin",
      },
    ],
  },
  loc_dxb: {
    contribution: 3980,
    marginPct: 16.2,
    marginVsPlan: -1.6,
    verified: 180,
    recoverable: 310,
    paceVsExpectedPct: -3.5,
    needsYou: 1,
    attentionEuro: 620,
    status: "NEEDS_YOU",
    why: "Pace down; supplier credit and labor still open.",
    drivers: [
      {
        practice: "Covers −12% vs expected",
        effect: "−€620 contribution",
      },
      {
        practice: "Credit not chased",
        effect: "€310 recoverable idle",
      },
    ],
  },
  loc_syd: {
    contribution: 4720,
    marginPct: 18.0,
    marginVsPlan: 0.1,
    verified: 260,
    recoverable: 45,
    paceVsExpectedPct: 0.4,
    needsYou: 0,
    attentionEuro: 0,
    status: "READY",
    why: "Flat vs plan - no clear leading practice tonight.",
    drivers: [
      {
        practice: "Service on forecast",
        effect: "Within ±0.5 pts",
      },
    ],
  },
};

const EU_IDS = new Set([
  "loc_ams",
  "loc_ber",
  "loc_ber_kreuz",
  "loc_lon",
  "loc_par",
]);

export const FLEET_SORT_LABEL: Record<FleetSort, string> = {
  contribution: "Contribution",
  margin: "Margin vs plan",
  verified: "Verified value",
  attention: "Needs you",
  pace: "Pace vs expected",
};

export function isFleetRole(role: RoleView): boolean {
  return (
    role === "cfo" ||
    role === "coo" ||
    role === "regional" ||
    role === "owner" ||
    role === "finance"
  );
}

export function defaultFleetSort(role: RoleView): FleetSort {
  if (role === "coo" || role === "regional") return "attention";
  if (role === "finance") return "verified";
  return "contribution";
}

function buildRows(ids: string[] | null): FleetLocationRow[] {
  return LOCATIONS.filter((l) => (ids ? ids.includes(l.id) : true))
    .map((l) => {
      const seed = FLEET_SEED[l.id];
      if (!seed) return null;
      return {
        id: l.id,
        name: l.name,
        city: l.city,
        country: l.country,
        region: LOCATION_META[l.id]?.region ?? l.country,
        ...seed,
      } satisfies FleetLocationRow;
    })
    .filter((r): r is FleetLocationRow => r !== null);
}

export function rankFleetRows(
  rows: FleetLocationRow[],
  sort: FleetSort,
): FleetLocationRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (sort) {
      case "contribution":
        return b.contribution - a.contribution;
      case "margin":
        return b.marginVsPlan - a.marginVsPlan;
      case "verified":
        return b.verified - a.verified;
      case "pace":
        return b.paceVsExpectedPct - a.paceVsExpectedPct;
      case "attention":
        if (b.needsYou !== a.needsYou) return b.needsYou - a.needsYou;
        return b.attentionEuro - a.attentionEuro;
      default:
        return 0;
    }
  });
  return copy;
}

function leaderForSort(
  rows: FleetLocationRow[],
  sort: FleetSort,
): FleetLocationRow {
  return rankFleetRows(rows, sort)[0]!;
}

/** Distill top practices that lagging sites have not matched. */
export function distillSuccessCriteria(
  rows: FleetLocationRow[],
): FleetSuccessCriterion[] {
  const byMargin = rankFleetRows(rows, "margin");
  const byContribution = rankFleetRows(rows, "contribution");
  const byPace = rankFleetRows(rows, "pace");
  const lagging = [...rows]
    .filter((r) => r.marginVsPlan < 0.3 || r.status !== "READY")
    .map((r) => r.name)
    .slice(0, 4);

  const criteria: FleetSuccessCriterion[] = [];

  const marginLeader = byMargin[0]!;
  if (marginLeader.drivers[0]) {
    criteria.push({
      id: "sc_margin",
      practice: marginLeader.drivers[0].practice,
      evidenceFrom: marginLeader.name,
      effect: marginLeader.drivers[0].effect,
      applyTo: lagging.filter((n) => n !== marginLeader.name),
    });
  }

  const contribLeader = byContribution[0]!;
  const terraceLike = contribLeader.drivers.find((d) =>
    /terrace|walk-in|weather|covers/i.test(d.practice),
  );
  if (terraceLike) {
    criteria.push({
      id: "sc_demand",
      practice: terraceLike.practice,
      evidenceFrom: contribLeader.name,
      effect: terraceLike.effect,
      applyTo: lagging.filter((n) => n !== contribLeader.name),
    });
  }

  const paceLeader = byPace[0]!;
  const laborLike =
    paceLeader.drivers.find((d) => /labor|staff|flex/i.test(d.practice)) ??
    marginLeader.drivers.find((d) => /labor|staff|portion/i.test(d.practice));
  if (laborLike) {
    criteria.push({
      id: "sc_labor",
      practice: laborLike.practice,
      evidenceFrom: /labor|staff|portion/i.test(
        paceLeader.drivers.map((d) => d.practice).join(" "),
      )
        ? paceLeader.name
        : marginLeader.name,
      effect: laborLike.effect,
      applyTo: lagging.filter(
        (n) => n !== paceLeader.name && n !== marginLeader.name,
      ),
    });
  }

  // Pre-shift clearance from a clean high performer
  const clean = byContribution.find(
    (r) => r.status === "READY" && r.needsYou === 0 && r.id !== contribLeader.id,
  );
  const preShift = clean?.drivers.find((d) =>
    /pre-shift|16:00|before open|sourcing/i.test(d.practice),
  );
  if (clean && preShift) {
    criteria.push({
      id: "sc_preshift",
      practice: preShift.practice,
      evidenceFrom: clean.name,
      effect: preShift.effect,
      applyTo: rows
        .filter((r) => r.needsYou > 0)
        .map((r) => r.name)
        .slice(0, 3),
    });
  }

  return criteria.slice(0, 4);
}

export function whyLeaderLine(
  leader: FleetLocationRow,
  sort: FleetSort,
): string {
  const top = leader.drivers[0];
  const sortBit =
    sort === "contribution"
      ? `${leader.contribution.toLocaleString("de-DE")} € contribution`
      : sort === "margin"
        ? `${leader.marginPct.toFixed(1)}% margin (${leader.marginVsPlan >= 0 ? "+" : ""}${leader.marginVsPlan.toFixed(1)} pts)`
        : sort === "verified"
          ? `€${leader.verified.toLocaleString("de-DE")} verified`
          : sort === "pace"
            ? `${leader.paceVsExpectedPct >= 0 ? "+" : ""}${leader.paceVsExpectedPct.toFixed(1)}% pace`
            : leader.needsYou > 0
              ? `${leader.needsYou} open decisions`
              : "clear attention load";
  if (!top) return `${leader.name} leads on ${sortBit}. ${leader.why}`;
  return `${leader.name} leads (${sortBit}) because: ${top.practice} (${top.effect}).`;
}

export function composeFleetBrief(role: RoleView): FleetBrief {
  const regional = role === "regional";
  const ids = regional ? [...EU_IDS] : null;
  const rows = buildRows(ids);
  const sort = defaultFleetSort(role);
  const ranked = rankFleetRows(rows, sort);
  const byContribution = rankFleetRows(rows, "contribution");
  const byMarginGap = [...rows].sort(
    (a, b) => a.marginVsPlan - b.marginVsPlan,
  );
  const needsYouCount = rows.filter((r) => r.needsYou > 0).length;
  const best = byContribution[0]!;
  const worst = byMarginGap[0]!;
  const sortLeader = leaderForSort(rows, sort);
  const successCriteria = distillSuccessCriteria(rows);

  const scopeLabel = regional
    ? "Europe · your area"
    : "All locations · group";

  const headline =
    needsYouCount === 0
      ? `${best.name} leads - ${best.why}`
      : `${needsYouCount} need you · ${best.name} leads on contribution.`;

  return {
    scopeLabel,
    locationCount: rows.length,
    periodLabel: "Tonight · vs expected",
    defaultSort: sort,
    rows: ranked,
    headline,
    bestId: best.id,
    worstGapId: worst.id,
    needsYouCount,
    leaderWhy: whyLeaderLine(sortLeader, sort),
    successCriteria,
  };
}

/** Exported for tests - driver shape sanity. */
export function demoDriversFor(id: string): FleetDriver[] {
  return FLEET_SEED[id]?.drivers ?? [];
}
