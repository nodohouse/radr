/**
 * Guest Intelligence — operating model for Overview / Floor / Segments / Profile.
 * Deterministic demo · fictional guests · no Math.random().
 */

import { DEMO_GUEST_TONIGHT_AGG } from "@/lib/radr/guest/demoTonight";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type GuestView = "overview" | "floor" | "segments" | "feedback";

export type GuestKpiId =
  | "satisfaction"
  | "covers"
  | "return"
  | "check"
  | "recoverable";

export type GuestSignalState =
  | "needs_attention"
  | "in_progress"
  | "handled"
  | "opportunity"
  | "positive";

export type GuestSegmentId =
  | "regulars"
  | "first_visit"
  | "corporate"
  | "tourist"
  | "occasion";

export type GuestKpi = {
  id: GuestKpiId;
  label: string;
  value: string;
  delta: string;
  tone: "pos" | "watch" | "neg" | "neutral";
};

export type GuestSegmentRow = {
  id: GuestSegmentId;
  name: string;
  share: string;
  satisfaction: string;
  avgSpend: string;
  repeatLikelihood: string;
  takeaway: string;
};

export type GuestSignal = {
  id: string;
  table: string;
  label: string;
  state: GuestSignalState;
  category: string;
  tableId?: string;
  guestId?: string;
};

export type HighValueTable = {
  id: string;
  table: string;
  tableId: string;
  guests: number;
  tags: string[];
  time: string;
  estEuro: number;
  guestName?: string;
  guestId?: string;
};

export type RecoveryOpp = {
  id: string;
  table: string;
  tableId: string;
  problem: string;
  suggested: string;
  valueEuro: number;
};

export type GuestOverviewModel = {
  title: string;
  subtitle: string;
  locationLabel: string;
  kpis: GuestKpi[];
  insight: {
    headline: string;
    body: string;
    windowLabel: string;
  };
  judgment: {
    title: string;
    body: string;
    expectedEuro: number;
    decisionId: string;
  };
  compare: {
    doNothing: { ticket: string; recoverable: string; repeat: string };
    radrAction: { ticket: string; recoverable: string; repeat: string };
  };
  segments: GuestSegmentRow[];
  signals: GuestSignal[];
  highValue: HighValueTable[];
  recovery: RecoveryOpp[];
};

const agg = DEMO_GUEST_TONIGHT_AGG;

export const GUEST_OVERVIEW: GuestOverviewModel = {
  title: "Guests",
  subtitle:
    "Live guest intelligence for tonight — who’s here, what they value, and where service can create more value.",
  locationLabel: "Soho · New York",
  kpis: [
    {
      id: "satisfaction",
      label: "Guest satisfaction",
      value: "4.6 / 5.0",
      delta: "+0.2 vs last 4 weeks",
      tone: "pos",
    },
    {
      id: "covers",
      label: "Covers tonight",
      value: String(agg.reservedCovers),
      delta: `${agg.returningGuests} returning · ${agg.firstTimeGuests} first visit`,
      tone: "neutral",
    },
    {
      id: "return",
      label: "Return on the books",
      value: "36%",
      delta: "+6pp vs last 4 weeks",
      tone: "pos",
    },
    {
      id: "check",
      label: "Expected check / cover",
      value: "€52",
      delta: `+${agg.returningRevenueSharePct}% from returners`,
      tone: "pos",
    },
    {
      id: "recoverable",
      label: "Recoverable guest value",
      value: "€460",
      delta: "from active recovery opportunities",
      tone: "watch",
    },
  ],
  insight: {
    headline: "Regulars and terrace covers are converging 20:10–20:40.",
    body: "Service pace is the constraint, not demand. Protect high-value tables before ticket time slips.",
    windowLabel: "20:10–20:40 Peak value window",
  },
  judgment: {
    title: "Prioritise terrace recovery for regulars arriving 20:10–20:40.",
    body: "Add one service runner. Pre-batch wine pairings. Protect slower high-value tables.",
    expectedEuro: 460,
    decisionId: DECISION_IDS.guestVoice,
  },
  compare: {
    doNothing: {
      ticket: "+12 min",
      recoverable: "€120",
      repeat: "−4pp",
    },
    radrAction: {
      ticket: "within target",
      recoverable: "€460",
      repeat: "+6pp",
    },
  },
  segments: [
    {
      id: "regulars",
      name: "Regulars & loyalty",
      share: "38%",
      satisfaction: "4.8 / 5",
      avgSpend: "€62",
      repeatLikelihood: "72%",
      takeaway:
        "Peak value 20:10–20:40. Protect terrace tables. Keep ticket time controlled.",
    },
    {
      id: "first_visit",
      name: "First visit",
      share: "14%",
      satisfaction: "4.2 / 5",
      avgSpend: "€41",
      repeatLikelihood: "28%",
      takeaway:
        "Ticket time drives satisfaction — kitchen load is the lever.",
    },
    {
      id: "corporate",
      name: "Corporate & groups",
      share: "21%",
      satisfaction: "4.6 / 5",
      avgSpend: "€78",
      repeatLikelihood: "56%",
      takeaway: "Allergy protocols must be confirmed before service.",
    },
    {
      id: "tourist",
      name: "Tourist & transient",
      share: "17%",
      satisfaction: "4.4 / 5",
      avgSpend: "€48",
      repeatLikelihood: "18%",
      takeaway: "Terrace + wine · weather-sensitive — hold recovery for regulars.",
    },
    {
      id: "occasion",
      name: "Occasion dining",
      share: "10%",
      satisfaction: "4.7 / 5",
      avgSpend: "€71",
      repeatLikelihood: "64%",
      takeaway: "Birthday / anniversary gestures convert when timing is calm.",
    },
  ],
  signals: [
    {
      id: "sig_12",
      table: "Table 12",
      tableId: "12",
      label: "Shellfish allergy",
      state: "needs_attention",
      category: "Safety / allergy",
      guestId: "guest_sofia_meyer",
    },
    {
      id: "sig_7",
      table: "Table 7",
      tableId: "7",
      label: "Service slower than expected",
      state: "in_progress",
      category: "Service delay",
    },
    {
      id: "sig_3",
      table: "Table 3",
      tableId: "3",
      label: "Terrace noise complaint",
      state: "handled",
      category: "Recovery",
    },
    {
      id: "sig_15",
      table: "Table 15",
      tableId: "15",
      label: "Wine recommendation",
      state: "handled",
      category: "Upsell",
    },
    {
      id: "sig_8",
      table: "Table 8",
      tableId: "8",
      label: "Birthday celebration",
      state: "handled",
      category: "Occasion",
    },
  ],
  highValue: [
    {
      id: "hv_6",
      table: "Table 6",
      tableId: "6",
      guests: 4,
      tags: ["Regulars", "VIP"],
      time: "20:15",
      estEuro: 340,
      guestName: "Elena Rossi",
      guestId: "gst_elena",
    },
    {
      id: "hv_12",
      table: "Table 12",
      tableId: "12",
      guests: 2,
      tags: ["Top spender", "VIP"],
      time: "20:20",
      estEuro: 220,
      guestName: "Sofia Meyer",
      guestId: "guest_sofia_meyer",
    },
    {
      id: "hv_18",
      table: "Table 18",
      tableId: "18",
      guests: 6,
      tags: ["Corporate"],
      time: "20:30",
      estEuro: 480,
      guestName: "Tom Berg",
      guestId: "gst_tom",
    },
  ],
  recovery: [
    {
      id: "rec_7",
      table: "Table 7",
      tableId: "7",
      problem: "Long ticket time",
      suggested: "Offer drink / manage expectation",
      valueEuro: 80,
    },
    {
      id: "rec_11",
      table: "Table 11",
      tableId: "11",
      problem: "First visit · high satisfaction",
      suggested: "Dessert / loyalty capture",
      valueEuro: 60,
    },
  ],
};

export function guestOverviewModel(): GuestOverviewModel {
  return GUEST_OVERVIEW;
}

/* ── Floor (REF 02) — same geometry as Service Command main dining ── */

export type GuestFloorTone =
  | "ok"
  | "watch"
  | "attention"
  | "vip"
  | "first"
  | "empty";

export type GuestFloorTable = {
  id: string;
  n: number;
  x: number;
  y: number;
  party: number;
  tone: GuestFloorTone;
  signal?: string;
  guestId?: string;
  segment?: string;
  spendPotential?: string;
  seatedLabel?: string;
  stage?: string;
  satisfaction?: string;
  visits?: number;
  allergy?: string;
  occasion?: string;
  notes?: string[];
  recommendation?: string;
  recValue?: string;
};

export type UpcomingArrival = {
  id: string;
  time: string;
  name: string;
  guests: number;
  tags: string[];
  guestId?: string;
};

/** Positions calibrated to `/public/service/berlin-mitte-floorplan` (main dining). */
export const GUEST_FLOOR_TABLES: GuestFloorTable[] = [
  { id: "1", n: 1, x: 18.7, y: 25.5, party: 4, tone: "ok", signal: "Seated", seatedLabel: "1h 40m", stage: "Dessert" },
  { id: "2", n: 2, x: 33.7, y: 25.4, party: 2, tone: "watch", signal: "Wait", seatedLabel: "28 min wait", stage: "Mains delay" },
  { id: "3", n: 3, x: 48.9, y: 24.8, party: 4, tone: "ok", signal: "Handled", seatedLabel: "1h 10m", stage: "Mains" },
  { id: "4", n: 4, x: 64.1, y: 22.9, party: 4, tone: "watch", signal: "Hold", seatedLabel: "22 min", stage: "Starters" },
  { id: "5", n: 5, x: 85.9, y: 33.4, party: 0, tone: "empty", signal: "Open" },
  {
    id: "6",
    n: 6,
    x: 18.5,
    y: 47.1,
    party: 4,
    tone: "vip",
    signal: "VIP",
    guestId: "gst_elena",
    segment: "Regulars & loyalty",
    spendPotential: "€300–€380",
    seatedLabel: "Turning",
    stage: "Pre-bus",
    satisfaction: "4.7 / 5",
    visits: 11,
  },
  {
    id: "7",
    n: 7,
    x: 34.0,
    y: 47.1,
    party: 2,
    tone: "watch",
    signal: "Pace",
    seatedLabel: "43 min",
    stage: "Starters",
    recommendation: "Offer drink / manage expectation",
    recValue: "€80",
  },
  { id: "8", n: 8, x: 49.2, y: 48.2, party: 4, tone: "ok", signal: "Birthday", seatedLabel: "68 min", stage: "Waiting mains", occasion: "Birthday" },
  { id: "9", n: 9, x: 67.8, y: 46.7, party: 4, tone: "watch", signal: "Wait", seatedLabel: "16 min", stage: "Waiting mains" },
  { id: "10", n: 10, x: 18.6, y: 67.7, party: 2, tone: "first", signal: "First visit", seatedLabel: "28 min", stage: "Drinks" },
  {
    id: "11",
    n: 11,
    x: 36.9,
    y: 68.4,
    party: 3,
    tone: "first",
    signal: "First visit",
    seatedLabel: "33 min",
    stage: "Starters",
    recommendation: "Dessert / loyalty capture",
    recValue: "€60",
  },
  {
    id: "12",
    n: 12,
    x: 67.9,
    y: 67.6,
    party: 6,
    tone: "attention",
    signal: "Allergy",
    guestId: "guest_sofia_meyer",
    segment: "Regulars & loyalty",
    spendPotential: "€300–€420",
    seatedLabel: "1h 10m",
    stage: "Course 2/5",
    satisfaction: "4.8 / 5",
    visits: 8,
    allergy: "Shellfish · severe",
    occasion: "Business dinner",
    notes: ["Prefers terrace", "Wine enthusiast", "Quiet service"],
    recommendation:
      "Offer Riesling pairing for next course — historically followed by +€60 on similar visits.",
    recValue: "€60",
  },
  { id: "13", n: 13, x: 86.5, y: 52.9, party: 2, tone: "ok", signal: "Seated", seatedLabel: "53 min", stage: "Mains" },
  { id: "14", n: 14, x: 50.8, y: 70.2, party: 4, tone: "attention", signal: "Wait 18m", seatedLabel: "18 min wait", stage: "VIP hold", recValue: "€180" },
];

export const GUEST_FLOOR_KPIS = [
  { id: "covers", label: "Covers in house", value: "118", delta: "42 returning · 31 first visit", tone: "neutral" as const },
  { id: "pace", label: "Avg ticket pace", value: "€52", delta: "+32% vs last 4 weeks", tone: "pos" as const },
  { id: "vips", label: "VIPs seated", value: "4", delta: "1 upcoming · 3 in house", tone: "pos" as const },
  { id: "recovery", label: "Recovery value", value: "€460", delta: "from 3 opportunities", tone: "watch" as const },
  { id: "sat", label: "Guest satisfaction", value: "4.6 / 5.0", delta: "+0.2 vs last 4 weeks", tone: "pos" as const },
];

export const GUEST_ARRIVALS: UpcomingArrival[] = [
  { id: "a1", time: "20:40", name: "Anna Richter", guests: 4, tags: ["VIP", "Terrace"], guestId: "gst_anna" },
  { id: "a2", time: "21:00", name: "Lukas Hoffmann", guests: 2, tags: ["Regulars"], guestId: "gst_luca" },
  { id: "a3", time: "21:15", name: "Emma Braun", guests: 3, tags: ["First visit"] },
  { id: "a4", time: "21:30", name: "Daniel Koch", guests: 4, tags: ["Celebrating"], guestId: "gst_daniel" },
];

export function guestFloorTable(id: string | null | undefined): GuestFloorTable | undefined {
  if (!id) return undefined;
  const raw = id.replace(/^t/, "");
  return GUEST_FLOOR_TABLES.find((t) => t.id === raw || String(t.n) === raw);
}

/* ── Profile (REF 03) — Sofia Meyer flagship ── */

export type GuestProfileModel = {
  id: string;
  displayName: string;
  statusLabel: string;
  meta: string;
  tags: string[];
  initials: string;
  metrics: { label: string; value: string; delta: string; tone: "pos" | "watch" | "neutral" }[];
  contact: { phone: string; email: string; location: string; guestType: string; vip: string; notes: string };
  preferences: { label: string; value: string; kind: "explicit" | "observed" | "inferred"; alert?: boolean }[];
  memories: { text: string; source: string; confidence: string }[];
  tonight: { text: string; why: string; value: string; confidence: string }[];
  visits: { date: string; guests: number; occasion: string; spend: string; experience: string }[];
  feedback: { date: string; score: string; quote: string }[];
  serviceNotes: { by: string; date: string; note: string }[];
  allergy: { label: string; severity: string; source: string; confirmed: string; kitchenInformed: boolean };
};

export const SOFIA_PROFILE: GuestProfileModel = {
  id: "guest_sofia_meyer",
  displayName: "Sofia Meyer",
  statusLabel: "Returning guest",
  meta: "Loyal guest · First visited 12 Jan 2023 · Last visit 2 weeks ago",
  tags: ["Regulars & loyalty", "Wine enthusiast", "Dinner guest", "Shellfish allergy"],
  initials: "SM",
  metrics: [
    { label: "Lifetime value", value: "€1,240", delta: "+28% vs last 6 months", tone: "pos" },
    { label: "Visit frequency", value: "8 visits", delta: "~1 every 6 weeks", tone: "neutral" },
    { label: "Average spend", value: "€155", delta: "+22% vs similar guests", tone: "pos" },
    { label: "Next visit likelihood", value: "87%", delta: "Likely in next 4 weeks", tone: "pos" },
    { label: "Predicted spend tonight", value: "€160–€190", delta: "Based on last 5 comparable visits", tone: "watch" },
  ],
  contact: {
    phone: "+49 · · · · 4421",
    email: "sofia····@example.com",
    location: "Berlin, Germany",
    guestType: "Returning guest",
    vip: "Loyal guest",
    notes: "Prefers quiet service and personalized wine recommendations. Do not rush courses.",
  },
  preferences: [
    { label: "Preferred seating", value: "Terrace evenings", kind: "observed" },
    { label: "Favourite dishes", value: "Truffle pasta · Tuna tataki", kind: "observed" },
    { label: "Favourite wines", value: "Riesling · Champagne", kind: "observed" },
    { label: "Dietary restrictions", value: "Shellfish allergy (severe)", kind: "explicit", alert: true },
    { label: "Companion patterns", value: "Often 2 · sometimes business 4–6", kind: "observed" },
    { label: "Occasion types", value: "Birthday · business dinner", kind: "observed" },
    { label: "Service style", value: "Quiet · unhurried", kind: "inferred" },
    { label: "Language", value: "German · English", kind: "explicit" },
  ],
  memories: [
    { text: "Prefers terrace seating and declined indoor tables three times.", source: "Observed", confidence: "High" },
    { text: "Celebrates special occasions with the restaurant.", source: "Observed", confidence: "High" },
    { text: "Often orders Champagne or white wine.", source: "Observed", confidence: "Medium" },
    { text: "Severe shellfish allergy — guest-reported.", source: "Confirmed fact", confidence: "High" },
  ],
  tonight: [
    { text: "Hold terrace table 20:10–20:40", why: "Observed seating preference", value: "Protect experience", confidence: "High" },
    { text: "Suggest Riesling pairing", why: "Wine affinity on last 5 visits", value: "+€40–€60", confidence: "72%" },
    { text: "Recommend truffle pasta", why: "Menu affinity", value: "Satisfaction", confidence: "Medium" },
    { text: "Acknowledge birthday with a small gesture", why: "Occasion history", value: "Repeat likelihood", confidence: "High" },
  ],
  visits: [
    { date: "26 Sep", guests: 2, occasion: "Dinner", spend: "€168", experience: "4.9" },
    { date: "12 Aug", guests: 4, occasion: "Birthday", spend: "€412", experience: "5.0" },
    { date: "03 Jul", guests: 2, occasion: "Business", spend: "€186", experience: "4.7" },
    { date: "18 May", guests: 2, occasion: "Dinner", spend: "€142", experience: "4.8" },
  ],
  feedback: [
    { date: "26 Sep", score: "4.9 / 5", quote: "Terrace felt perfect — wine pairing was thoughtful." },
    { date: "12 Aug", score: "5.0 / 5", quote: "Birthday gesture made the night." },
  ],
  serviceNotes: [
    { by: "Sommelier", date: "26 Sep", note: "Loved the Riesling pairing — offer again." },
    { by: "Host", date: "12 Aug", note: "Prefers non-alcoholic welcome drink when driving." },
    { by: "Floor manager", date: "03 Jul", note: "Business dinner — keep pace calm, no rush." },
  ],
  allergy: {
    label: "Shellfish allergy",
    severity: "Severe",
    source: "Guest-reported",
    confirmed: "Current reservation",
    kitchenInformed: true,
  },
};

const PROFILE_BY_ID: Record<string, GuestProfileModel> = {
  [SOFIA_PROFILE.id]: SOFIA_PROFILE,
  guest_sofia_meyer: SOFIA_PROFILE,
};

export function guestProfile(id: string): GuestProfileModel | undefined {
  return PROFILE_BY_ID[id];
}

/* ── Segments (REF 04) ── */

export const GUEST_SEGMENT_KPIS = [
  { id: "returner", label: "Returner share", value: "36%", delta: "+6pp vs last 4 weeks", tone: "pos" as const },
  { id: "loyalty", label: "Loyalty revenue", value: "€2,480", delta: "32% of tonight’s revenue", tone: "pos" as const },
  { id: "conversion", label: "First-visit conversion", value: "42%", delta: "+8pp vs last 4 weeks", tone: "pos" as const },
  { id: "repeat", label: "Repeat booking rate", value: "28%", delta: "+6pp vs last 4 weeks", tone: "pos" as const },
  { id: "sat", label: "Guest satisfaction", value: "4.6 / 5.0", delta: "Stable vs last 4 weeks", tone: "neutral" as const },
];

export const GUEST_RECOMMENDATIONS = [
  { id: "r1", title: "Prioritise terrace recovery for regulars", body: "20:10–20:40 window · add runner · pre-batch pairings", impact: "High impact", tone: "pos" as const },
  { id: "r2", title: "Brief allergy protocol for groups", body: "Corporate tables with confirmed allergens tonight", impact: "Important", tone: "watch" as const },
  { id: "r3", title: "Trigger birthday dessert moments", body: "Occasion dining · low risk · high delight", impact: "High value", tone: "pos" as const },
  { id: "r4", title: "Follow up with high-potential first timers", body: "Personal recovery + follow-up drives conversion", impact: "Medium", tone: "watch" as const },
];

export const GUEST_FEEDBACK_THEMES = [
  { id: "food", label: "Food quality", pct: 42 },
  { id: "service", label: "Service", pct: 24 },
  { id: "atmosphere", label: "Atmosphere", pct: 18 },
  { id: "value", label: "Value for money", pct: 9 },
];

export const GUEST_SENTIMENT = [4.3, 4.35, 4.4, 4.38, 4.45, 4.5, 4.55, 4.6];

