/**
 * Location operating memory — evidence-backed learnings per property.
 */

export type LocationLesson = {
  id: string;
  locationId: string;
  summary: string;
  evidence: string;
  horizon: string;
  relatedDecisionId: string | null;
  transferable: boolean;
};

const LESSONS: LocationLesson[] = [
  {
    id: "mem_berlin_delivery",
    locationId: "loc_berlin_mitte",
    summary: "Friday delivery throttle works when kitchen forecast exceeds 94%",
    evidence:
      "Throttle 19:30–20:30 under kitchen pressure · refund rate −0.6pp on comparable Fridays",
    horizon: "Recurring Fri",
    relatedDecisionId: "dec_peak_berlin",
    transferable: true,
  },
  {
    id: "mem_berlin_upsell",
    locationId: "loc_berlin_mitte",
    summary: "Wine upsell works without slowing service before 19:30",
    evidence: "+attach without ticket-time penalty · 18 dinner services",
    horizon: "Dinner service",
    relatedDecisionId: null,
    transferable: true,
  },
  {
    id: "mem_kreuz_refund",
    locationId: "loc_berlin_kreuzberg",
    summary: "61% of refund lift sits in Fri 19:00–21:00 delivery lateness",
    evidence: "POS refund codes × delivery ETA · 8 Friday peaks",
    horizon: "Fri peak",
    relatedDecisionId: null,
    transferable: true,
  },
  {
    id: "mem_hamburg_wine",
    locationId: "loc_hamburg_hafen",
    summary: "Wine attach +9.4pp without service penalty",
    evidence: "Beverage attach vs ticket time still in band · learning candidate",
    horizon: "Dinner",
    relatedDecisionId: null,
    transferable: true,
  },
  {
    id: "mem_frankfurt_tuna",
    locationId: "loc_frankfurt_westend",
    summary: "Tuna stockout risk accelerates after 20:00 on high-delivery Fridays",
    evidence: "4 of last 8 Fridays · vendor +19%/90D compounds exposure",
    horizon: "Fri dinner",
    relatedDecisionId: "dec_tuna_berlin",
    transferable: false,
  },
  {
    id: "mem_munich_labor",
    locationId: "loc_munich_altstadt",
    summary: "Tuesday 15:00–17:00 consistently overstaffed",
    evidence: "Labor hours vs covers · 12-week pattern",
    horizon: "Tue afternoon",
    relatedDecisionId: null,
    transferable: true,
  },
  {
    id: "mem_koln_discount",
    locationId: "loc_koln_ehrenfeld",
    summary: "Promo mix softens avg spend without lifting covers enough",
    evidence: "Discount € vs cover elasticity · within watch band",
    horizon: "Ongoing",
    relatedDecisionId: null,
    transferable: false,
  },
  {
    id: "mem_dusseldorf_events",
    locationId: "loc_dusseldorf_medienhafen",
    summary: "Private events lift contribution without discount dependency",
    evidence: "Events share +4pp · margin hold",
    horizon: "Corporate weeks",
    relatedDecisionId: null,
    transferable: true,
  },
  {
    id: "mem_stuttgart_stable",
    locationId: "loc_stuttgart_mitte",
    summary: "Quiet operating week is the baseline — RADR stays silent",
    evidence: "No material outlier across 6 consecutive weeks",
    horizon: "Steady state",
    relatedDecisionId: null,
    transferable: false,
  },
  {
    id: "mem_canal_direct",
    locationId: "loc_canal_house",
    summary: "Direct inventory hold window on city-event weeks",
    evidence: "+€22 net ADR without occupancy loss across 8 comparable windows",
    horizon: "Event weeks",
    relatedDecisionId: "dec_hotel_ota",
    transferable: true,
  },
  {
    id: "mem_canal_hk",
    locationId: "loc_canal_house",
    summary: "Housekeeping reassignment before clustered arrivals",
    evidence: "Readiness misses reduced after wave-shaped reassignment",
    horizon: "High-arrival days",
    relatedDecisionId: "dec_hotel_readiness_canal",
    transferable: true,
  },
];

export function lessonsForLocation(locationId: string): LocationLesson[] {
  const hit = LESSONS.filter((l) => l.locationId === locationId);
  if (hit.length) return hit;
  return [
    {
      id: `mem_${locationId}_generic`,
      locationId,
      summary: "Operating patterns still forming",
      evidence: "Connect more service weeks to strengthen location memory",
      horizon: "Ongoing",
      relatedDecisionId: null,
      transferable: false,
    },
  ];
}

export function performanceExplain(input: {
  contribution: number;
  contributionPlan: number;
  drivers: { label: string; amount: number }[];
  needsYou: number;
}): { headline: string; drivers: string; action: string } {
  const delta = input.contribution - input.contributionPlan;
  const sorted = [...input.drivers].sort(
    (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
  );
  const top = sorted.slice(0, 3);
  const driverLine = top
    .map(
      (d) =>
        `${d.amount >= 0 ? "+" : "−"}${d.label.toLowerCase()}`,
    )
    .join(" · ");
  const headline =
    delta >= 0
      ? `Contribution +€${Math.round(Math.abs(delta)).toLocaleString("en-EU")}`
      : `Contribution −€${Math.round(Math.abs(delta)).toLocaleString("en-EU")}`;
  const action =
    input.needsYou > 0
      ? `${input.needsYou} need judgment`
      : delta >= 0
        ? "No action required"
        : "Watch · no Decision formed";
  return { headline, drivers: driverLine || "Mix stable", action };
}
