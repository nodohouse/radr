/**
 * House (BOH) attention — standards vs reported stock.
 *
 * Not an inventory ledger. Gaps become Findings → Decisions.
 * Captures are demo stubs for future phone camera + voice intake.
 *
 * Temporal law: never show unresolved gap + verified restore for the
 * same item+location. D-8204 caster sugar is UNRESOLVED current —
 * verified outcomes here are HISTORICAL and a different item/date.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import type { DecisionLifecycleStatus } from "@/lib/radr/decision/lifecycle";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  findTemporalContradictions,
  temporalItemLocationKey,
  type TemporalObservation,
} from "@/lib/radr/product/temporalInvariant";

export type HouseAttentionState =
  | "needs_you"
  | "handling"
  | "verifying"
  | "verified"
  | "watching"
  | "ok";

export type HouseFuture = {
  id: string;
  title: string;
  costLabel: string;
  timeLabel: string;
  serviceRisk: "low" | "medium" | "high";
  confidence: number;
  note: string;
  isNoAction?: boolean;
  recommended?: boolean;
  /** Where Review / approve lands — Decision deep link, never ledger filter. */
  approveHref?: string;
};

export type HouseGap = {
  id: string;
  item: string;
  area: string;
  /** House standard (par). */
  standard: string;
  /** Numeric standard for detail UI. */
  standardQty: string;
  /** Observed / staff-reported. */
  observed: string;
  observedQty: string;
  gap: string;
  gapQty: string;
  expectedUsageTonight?: string;
  timeToStockout?: string;
  exposureEuro?: number;
  exposureNote?: string;
  attention: HouseAttentionState;
  /** What RADR already did — progressive, not a task list. */
  radrDid: string;
  humanNeed?: string;
  futures?: HouseFuture[];
  /** Optional Decision deep link when a gap already has a Decision object. */
  decisionId?: string;
  decisionLabel?: string;
  /** Prepared action id when handling without a full Decision yet. */
  preparedActionLabel?: string;
  /** Item key for temporal invariant (defaults from item). */
  temporalItemKey?: string;
  temporalLocationKey?: string;
};

export type HouseCapture = {
  id: string;
  when: string;
  channel: "voice" | "camera" | "note" | "document" | "manual";
  by: string;
  transcript: string;
  /** Structured interpretation after parse. */
  interpreted?: string;
  confidence?: number;
  confirmation?: "confirmed" | "pending" | "stub";
  modalityDetail?: string;
  /** Linked gap if parsed into a standard check. */
  gapId?: string;
  status: "parsed" | "inbox" | "stub";
};

/** Deterministic fictional supplier contact — demo data only. */
export type HouseSupplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
};

export type HouseStockRisk = "critical" | "risk" | "watch" | "ok";

export type HouseStockRow = {
  id: string;
  item: string;
  /** Matches area filter chips (e.g. "Dry store", "Hot line"). */
  area: string;
  unit: string;
  current: number;
  par: number;
  /** Units per hour at current service pace. */
  burnPerHour: number;
  /** Clock label or relative — when current stock hits zero. */
  runOut: string;
  risk: HouseStockRisk;
  nextDelivery: {
    when: string;
    qty: number;
    /** Links to HouseDelivery when one exists. */
    deliveryId?: string;
  };
  supplierId: string;
  /** Links to a judgment/handling gap when one exists. */
  gapId?: string;
};

export type HousePrep = {
  title: string;
  where: string;
  required: number;
  prepared: number;
  /** Portions per hour. */
  throughput: number;
  windowLeftMin: number;
  forecastShort: number;
  forecastNote: string;
};

export type HouseReadiness = {
  /** Heading for the first-viewport strip. */
  title: string;
  readinessLabel: string;
  readinessPct: number;
  readinessNote: string;
  loadLabel: string;
  loadValue: string;
  loadNote: string;
};

export type HouseSummary = {
  vertical: DemoVerticalFamily;
  readiness: HouseReadiness;
  stock: HouseStockRow[];
  suppliers: HouseSupplier[];
  prep: HousePrep | null;
  title: string;
  kicker: string;
  quiet: string;
  needsYou: number;
  handling: number;
  watching: number;
  onStandard: number;
  gaps: HouseGap[];
  captures: HouseCapture[];
  captureStub: string;
  deliveries: HouseDelivery[];
  waste: HouseWaste[];
  verifications: HouseVerification[];
};

export type HouseDelivery = {
  id: string;
  supplier: string;
  expected: string;
  arrived?: string;
  status: "expected" | "arrived" | "late" | "short" | "damaged" | "unverified";
  note: string;
};

export type HouseWaste = {
  id: string;
  item: string;
  qty: string;
  reason: string;
  valueEuro: number;
  pattern: "one-off" | "recurring" | "prep" | "forecast" | "supplier";
};

export type HouseVerification = {
  id: string;
  title: string;
  requested: string;
  arrived: string;
  restored: string;
  disruption: string;
  expectedEuro: number;
  observedEuro: number;
  verifiedEuro: number;
  /** Always set for BOH — distinguishes live vs past outcomes. */
  historicalLabel?: string;
  itemKey?: string;
  locationKey?: string;
};

const CASTER_DECISION_HREF = `/app/decisions/${DECISION_IDS.casterSugar}`;

const RESTAURANT: HouseSummary = {
  vertical: "restaurant",
  title: "Kitchen & house standards",
  kicker: "Back of house · Line & prep",
  quiet:
    "Grill capacity · portions · prep shortfalls — par vs reported, not a stock ledger.",
  needsYou: 1,
  handling: 1,
  watching: 1,
  onStandard: 11,
  readiness: {
    title: "Kitchen readiness",
    readinessLabel: "Prep readiness",
    readinessPct: 74,
    readinessNote: "62 of 84 portions · cold line behind",
    loadLabel: "Kitchen load forecast",
    loadValue: "94%",
    loadNote: "Peak 20:15 · Friday dinner",
  },
  prep: {
    title: "Tuna · cold line",
    where: "Berlin · dinner service",
    required: 84,
    prepared: 62,
    throughput: 29,
    windowLeftMin: 41,
    forecastShort: 7,
    forecastNote: "when grill and pass peak overlap",
  },
  suppliers: [
    { id: "sup_metro", name: "Metro Cash & Carry", contact: "Katrin Vogel", phone: "+49 30 5550 1142", email: "orders@metro-demo.example" },
    { id: "sup_fryeroil", name: "FryerOil Co", contact: "Jonas Brandt", phone: "+49 30 5550 2287", email: "dispatch@fryeroil-demo.example" },
    { id: "sup_nordsee", name: "Nordsee Fisch Handel", contact: "Lena Hoffmann", phone: "+49 30 5550 3319", email: "bestellung@nordsee-demo.example" },
    { id: "sup_havel", name: "Molkerei Havel", contact: "Tobias Krüger", phone: "+49 30 5550 4406", email: "kunden@havel-demo.example" },
    { id: "sup_muehle", name: "Mühle Brandenburg", contact: "Sabine Lang", phone: "+49 30 5550 5573", email: "vertrieb@muehle-demo.example" },
    { id: "sup_citrus", name: "Citrus Direct", contact: "Marco Rossi", phone: "+49 30 5550 6628", email: "orders@citrus-demo.example" },
  ],
  stock: [
    { id: "stk_sugar", item: "Caster sugar", area: "Dry store", unit: "kg", current: 2, par: 5, burnPerHour: 0.37, runOut: "19:40", risk: "critical", nextDelivery: { when: "Tomorrow 07:30", qty: 6 }, supplierId: "sup_metro", gapId: "gap_sugar_berlin" },
    { id: "stk_oil", item: "Fryer oil buckets", area: "Hot line", unit: "bkt", current: 4, par: 6, burnPerHour: 0.55, runOut: "21:10", risk: "risk", nextDelivery: { when: "Today 17:30", qty: 2, deliveryId: "del_oil_1" }, supplierId: "sup_fryeroil", gapId: "gap_oil_berlin" },
    { id: "stk_tuna", item: "Tuna loin", area: "Prep", unit: "kg", current: 6.2, par: 8, burnPerHour: 0.9, runOut: "21:45", risk: "risk", nextDelivery: { when: "Today 16:30", qty: 4, deliveryId: "del_tuna_1" }, supplierId: "sup_nordsee" },
    { id: "stk_gloves", item: "Nitrile gloves M", area: "Pass", unit: "box", current: 3, par: 4, burnPerHour: 0.2, runOut: "Tomorrow 05:00", risk: "watch", nextDelivery: { when: "Thu 09:00", qty: 4 }, supplierId: "sup_metro", gapId: "gap_gloves_berlin" },
    { id: "stk_lemons", item: "Lemons", area: "Bar", unit: "kg", current: 5, par: 6, burnPerHour: 0.6, runOut: "22:20", risk: "watch", nextDelivery: { when: "Thu 08:00", qty: 8 }, supplierId: "sup_citrus" },
    { id: "stk_cream", item: "Cream 1L", area: "Prep", unit: "L", current: 14, par: 12, burnPerHour: 1.1, runOut: "Tomorrow 02:30", risk: "ok", nextDelivery: { when: "Thu 07:00", qty: 12 }, supplierId: "sup_havel" },
    { id: "stk_flour", item: "Flour T550", area: "Dry store", unit: "kg", current: 38, par: 30, burnPerHour: 1.8, runOut: "Fri 14:00", risk: "ok", nextDelivery: { when: "Fri 06:30", qty: 50 }, supplierId: "sup_muehle" },
  ],
  gaps: [
    {
      id: "gap_sugar_berlin",
      item: "Caster sugar",
      area: "Dry store · Berlin",
      standard: "5 kg on hand",
      standardQty: "5 kg",
      observed: "2 kg reported",
      observedQty: "2 kg",
      gap: "3 kg below house standard",
      gapQty: "3 kg",
      expectedUsageTonight: "2.4 kg (dessert + pastry)",
      timeToStockout: "19:40",
      exposureEuro: 186,
      exposureNote: "Dessert 86 risk · pastry hold · guest complaint exposure",
      attention: "needs_you",
      radrDid: "Compared voice report to house par · flagged before dinner prep.",
      humanNeed: "Approve restore or accept risk for tonight.",
      decisionId: DECISION_IDS.casterSugar,
      decisionLabel: displayDecisionId(DECISION_IDS.casterSugar),
      temporalItemKey: "caster_sugar",
      temporalLocationKey: "berlin_mitte",
      futures: [
        {
          id: "transfer",
          title: "Redistribute from Kreuzberg",
          costLabel: "€0 cash · 25 min",
          timeLabel: "25 min runner",
          serviceRisk: "medium",
          confidence: 72,
          note: "Kreuzberg has +2 kg above par",
          recommended: true,
          approveHref: CASTER_DECISION_HREF,
        },
        {
          id: "adjust",
          title: "Adjust prep / menu exposure",
          costLabel: "€0",
          timeLabel: "Immediate",
          serviceRisk: "medium",
          confidence: 64,
          note: "Hold two dessert SKUs · protect pastry",
        },
        {
          id: "accept",
          title: "Accept risk",
          costLabel: "€186 exposed",
          timeLabel: "—",
          serviceRisk: "high",
          confidence: 91,
          note: "Stockout likely mid-service",
          isNoAction: true,
        },
      ],
    },
    {
      id: "gap_oil_berlin",
      item: "Fryer oil buckets",
      area: "Hot line · Berlin",
      standard: "6 buckets",
      standardQty: "6 buckets",
      observed: "4 buckets reported",
      observedQty: "4 buckets",
      gap: "2 buckets below par",
      gapQty: "2 buckets",
      expectedUsageTonight: "1.5 buckets",
      timeToStockout: "21:10",
      exposureEuro: 94,
      exposureNote: "Fry station slowdown if change-out delayed",
      attention: "handling",
      radrDid:
        "Prepared fryer-oil top-up PO · waiting on delivery window — not an AP dispute.",
      preparedActionLabel: "Prep · fryer oil top-up",
      temporalItemKey: "fryer_oil",
      temporalLocationKey: "berlin_mitte",
      // Intentionally NOT D-4102 (supplier invoice variance).
    },
    {
      id: "gap_gloves_berlin",
      item: "Nitrile gloves M",
      area: "Pass · Berlin",
      standard: "4 boxes",
      standardQty: "4 boxes",
      observed: "3 boxes",
      observedQty: "3 boxes",
      gap: "1 box soft short",
      gapQty: "1 box",
      attention: "watching",
      radrDid: "Watching burn rate vs next delivery · no action required yet.",
      temporalItemKey: "nitrile_gloves_m",
      temporalLocationKey: "berlin_mitte",
    },
  ],
  captures: [
    {
      id: "cap_voice_1",
      when: "14:12",
      channel: "voice",
      by: "Kitchen · Mira",
      transcript: "We have four buckets, two kg sugar — this is missing.",
      interpreted: "Caster sugar = 2 kg · Fryer oil = 4 buckets",
      confidence: 0.86,
      confirmation: "confirmed",
      modalityDetail: "Voice · phone",
      gapId: "gap_sugar_berlin",
      status: "parsed",
    },
    {
      id: "cap_cam_1",
      when: "13:48",
      channel: "camera",
      by: "Prep · Jonas",
      transcript: "Shelf B · empty sugar bin photo.",
      interpreted: "Sugar bin empty / below expected fill",
      confidence: 0.79,
      confirmation: "pending",
      modalityDetail: "Camera · shelf B",
      gapId: "gap_sugar_berlin",
      status: "parsed",
    },
    {
      id: "cap_doc_1",
      when: "11:03",
      channel: "document",
      by: "Metro Cash & Carry",
      transcript: "Delivery note #7834921 · Caster sugar 2 kg · Ordered 4 kg",
      interpreted: "Delivered 2 kg vs ordered 4 kg · possible short delivery",
      confidence: 0.92,
      confirmation: "pending",
      modalityDetail: "Document · delivery note",
      gapId: "gap_sugar_berlin",
      status: "parsed",
    },
    {
      id: "cap_manual_1",
      when: "09:21",
      channel: "manual",
      by: "Manager · Alex",
      transcript: "Counted 3 fryer oil buckets in store.",
      interpreted: "Fryer oil = 3 buckets",
      confidence: 1,
      confirmation: "confirmed",
      modalityDetail: "Manual count",
      gapId: "gap_oil_berlin",
      status: "parsed",
    },
    {
      id: "cap_stub_1",
      when: "—",
      channel: "voice",
      by: "Phone app",
      transcript: "Live camera + voice intake",
      confirmation: "stub",
      status: "stub",
    },
  ],
  captureStub: "Capture from phone · coming online",
  deliveries: [
    {
      id: "del_sugar_1",
      supplier: "Metro Cash & Carry",
      expected: "16:00",
      arrived: "16:22",
      status: "short",
      note: "2 cases caster sugar missing vs PO · evidence captured",
    },
    {
      id: "del_oil_1",
      supplier: "FryerOil Co",
      expected: "17:30",
      status: "expected",
      note: "Prepared top-up · 2 buckets · awaiting dock",
    },
    {
      id: "del_tuna_1",
      supplier: "Nordsee Fisch Handel",
      expected: "16:30",
      arrived: "16:30",
      status: "arrived",
      note: "Tuna loin · 4 kg · closes prep gap before first wave",
    },
  ],
  waste: [
    {
      id: "w_tuna_1",
      item: "Tuna trim",
      qty: "1.2 kg",
      reason: "Over-prep · Friday delivery wave",
      valueEuro: 38,
      pattern: "prep",
    },
    {
      id: "w_dairy_1",
      item: "Cream 1L",
      qty: "2 L",
      reason: "Date short · fridge door left ajar",
      valueEuro: 9,
      pattern: "one-off",
    },
    {
      id: "w_cuke_1",
      item: "Cucumber peel",
      qty: "0.8 kg",
      reason: "Trimming variance · new supplier",
      valueEuro: 4,
      pattern: "prep",
    },
  ],
  verifications: [
    {
      id: "v_flour_kreuzberg_fri",
      title: "Flour transfer · Kreuzberg",
      requested: "Fri 16:40",
      arrived: "Fri 17:05",
      restored: "12 kg flour on hand",
      disruption: "0 service hits",
      expectedEuro: 220,
      observedEuro: 205,
      verifiedEuro: 198,
      historicalLabel: "HISTORICAL VERIFIED OUTCOME · Friday · Kreuzberg · flour",
      itemKey: "flour",
      locationKey: "berlin_kreuzberg",
    },
  ],
};

const HOTEL: HouseSummary = {
  vertical: "hotel",
  title: "House standards",
  kicker: "Back of house",
  quiet:
    "Room amenity pars vs housekeeping reports · gaps before the arrival wave — not a linen ledger.",
  needsYou: 1,
  handling: 1,
  watching: 1,
  onStandard: 18,
  readiness: {
    title: "House readiness",
    readinessLabel: "Cart readiness",
    readinessPct: 55,
    readinessNote: "22 of 40 soap sets on cart",
    loadLabel: "Arrival wave forecast",
    loadValue: "28 sets",
    loadNote: "Check-in 15:00 · expected draw",
  },
  prep: null,
  suppliers: [
    { id: "sup_amenity", name: "AmenityCo", contact: "Ines Duarte", phone: "+31 20 555 0143", email: "orders@amenityco-demo.example" },
    { id: "sup_laundry", name: "Laundry partner", contact: "Pieter de Vries", phone: "+31 20 555 0288", email: "planning@laundry-demo.example" },
    { id: "sup_water", name: "Waterbron NL", contact: "Eva Smit", phone: "+31 20 555 0361", email: "bestel@waterbron-demo.example" },
    { id: "sup_tissue", name: "Hygiene Direct", contact: "Daan Bakker", phone: "+31 20 555 0477", email: "sales@hygiene-demo.example" },
  ],
  stock: [
    { id: "stk_soap", item: "Guest soap set", area: "Housekeeping", unit: "sets", current: 22, par: 40, burnPerHour: 4.7, runOut: "15:00", risk: "critical", nextDelivery: { when: "Tomorrow 09:00", qty: 60 }, supplierId: "sup_amenity", gapId: "gap_soap_canal" },
    { id: "stk_duvet", item: "King duvet covers", area: "Linen", unit: "pcs", current: 28, par: 36, burnPerHour: 2.4, runOut: "Tomorrow 03:00", risk: "risk", nextDelivery: { when: "Today 14:00", qty: 8, deliveryId: "del_linen_1" }, supplierId: "sup_laundry", gapId: "gap_linen_canal" },
    { id: "stk_tissue", item: "Toilet tissue · floor 3", area: "Housekeeping", unit: "rolls", current: 30, par: 48, burnPerHour: 3.1, runOut: "Tomorrow 04:00", risk: "watch", nextDelivery: { when: "Tomorrow 09:00", qty: 72 }, supplierId: "sup_tissue" },
    { id: "stk_water", item: "Still water 0.5L", area: "Breakfast", unit: "btl", current: 52, par: 60, burnPerHour: 2.2, runOut: "Tomorrow 10:00", risk: "watch", nextDelivery: { when: "Thu 08:00", qty: 120 }, supplierId: "sup_water", gapId: "gap_minibar_canal" },
  ],
  gaps: [
    {
      id: "gap_soap_canal",
      item: "Guest soap set",
      area: "Housekeeping · Canal House",
      standard: "40 sets on cart",
      standardQty: "40 sets",
      observed: "22 sets reported",
      observedQty: "22 sets",
      gap: "18 sets below house standard",
      gapQty: "18 sets",
      expectedUsageTonight: "28 sets · arrival wave",
      timeToStockout: "15:00 check-in",
      exposureEuro: 420,
      exposureNote: "Uneven rooms · guest amenity complaints",
      attention: "needs_you",
      radrDid:
        "Matched cart report to arrival wave · shortfall before 15:00 check-in.",
      humanNeed: "Approve amenity transfer from reserve or accept uneven rooms.",
      futures: [
        {
          id: "transfer",
          title: "Transfer from reserve",
          costLabel: "€0 cash · 12 min",
          timeLabel: "12 min",
          serviceRisk: "low",
          confidence: 90,
          note: "Restores cart before wave",
          recommended: true,
          approveHref: `/app/decisions/${DECISION_IDS.hotelReadiness}`,
        },
        {
          id: "partial",
          title: "Partial restock · priority rooms first",
          costLabel: "€0",
          timeLabel: "8 min",
          serviceRisk: "medium",
          confidence: 74,
          note: "VIP + early arrivals covered",
        },
        {
          id: "accept",
          title: "Accept uneven rooms",
          costLabel: "€420 exposed",
          timeLabel: "—",
          serviceRisk: "high",
          confidence: 85,
          note: "Amenity gaps on late arrivals",
          isNoAction: true,
        },
      ],
      decisionId: DECISION_IDS.hotelReadiness,
      decisionLabel: "D-H-9201",
      temporalItemKey: "guest_soap_set",
      temporalLocationKey: "canal_house",
    },
    {
      id: "gap_linen_canal",
      item: "King duvet covers",
      area: "Linen · Canal House",
      standard: "36 on floor par",
      standardQty: "36",
      observed: "28 counted",
      observedQty: "28",
      gap: "8 below par",
      gapQty: "8",
      attention: "handling",
      radrDid: "Prepared laundry pull · waiting on HK lead confirm.",
      preparedActionLabel: "Prep · linen pull",
      temporalItemKey: "king_duvet",
      temporalLocationKey: "canal_house",
    },
    {
      id: "gap_minibar_canal",
      item: "Still water 0.5L",
      area: "Minibar staging",
      standard: "60 bottles",
      standardQty: "60",
      observed: "52 bottles",
      observedQty: "52",
      gap: "Soft short · within watch band",
      gapQty: "8",
      attention: "watching",
      radrDid: "Watching vs remaining arrivals · no action required yet.",
      temporalItemKey: "still_water",
      temporalLocationKey: "canal_house",
    },
  ],
  captures: [
    {
      id: "cap_hk_voice_1",
      when: "11:06",
      channel: "voice",
      by: "HK · Ana",
      transcript: "Cart three — soap almost gone, tissue low on three.",
      interpreted: "Guest soap = 22 sets · Toilet tissue floor 3 low",
      confidence: 0.84,
      confirmation: "confirmed",
      modalityDetail: "Voice · phone",
      gapId: "gap_soap_canal",
      status: "parsed",
    },
    {
      id: "cap_hk_cam_1",
      when: "10:51",
      channel: "camera",
      by: "HK · Ana",
      transcript: "Amenity shelf photo · empty soap row.",
      interpreted: "Soap row empty / below cart standard",
      confidence: 0.81,
      confirmation: "pending",
      modalityDetail: "Camera · amenity shelf",
      gapId: "gap_soap_canal",
      status: "parsed",
    },
    {
      id: "cap_stub_1",
      when: "—",
      channel: "voice",
      by: "Phone app",
      transcript: "Live camera + voice intake",
      confirmation: "stub",
      status: "stub",
    },
  ],
  captureStub: "Capture from phone · coming online",
  deliveries: [
    {
      id: "del_amenity_1",
      supplier: "AmenityCo",
      expected: "09:00",
      arrived: "09:40",
      status: "late",
      note: "Soap sets late · arrival wave still covered from reserve",
    },
    {
      id: "del_linen_1",
      supplier: "Laundry partner",
      expected: "14:00",
      status: "expected",
      note: "King duvet pull · prepared",
    },
  ],
  waste: [
    {
      id: "w_minibar_1",
      item: "Still water 0.5L",
      qty: "6 bottles",
      reason: "Expired staging · fridge reset",
      valueEuro: 7,
      pattern: "one-off",
    },
  ],
  verifications: [
    {
      id: "v_soap_1",
      title: "Amenity reserve transfer",
      requested: "11:12",
      arrived: "11:24",
      restored: "40 soap sets on cart",
      disruption: "0 uneven rooms",
      expectedEuro: 420,
      observedEuro: 390,
      verifiedEuro: 360,
      historicalLabel: "HISTORICAL VERIFIED OUTCOME · yesterday · Canal House",
      itemKey: "guest_soap_set",
      locationKey: "canal_house_reserve",
    },
  ],
};

/** Map DecisionRecord status → House attention for linked gaps. */
export function houseAttentionFromDecisionStatus(
  status: DecisionLifecycleStatus,
): HouseAttentionState {
  if (status === "OBSERVING") return "verifying";
  const band = attentionBandOf(status);
  switch (band) {
    case "needs_you":
      return "needs_you";
    case "handling":
      return "handling";
    case "verified":
      return "verified";
    case "learned":
      return "verified";
    default:
      return "watching";
  }
}

/**
 * Overlay live DecisionRecord statuses onto static house gaps.
 * Counts recompute from resulting attention.
 */
export function applyDecisionStatusToHouse(
  house: HouseSummary,
  statusByDecisionId: Record<string, DecisionLifecycleStatus | undefined>,
): HouseSummary {
  const gaps = house.gaps.map((g) => {
    if (!g.decisionId) return g;
    const st = statusByDecisionId[g.decisionId];
    if (!st) return g;
    const attention = houseAttentionFromDecisionStatus(st);
    const humanNeed =
      attention === "needs_you"
        ? g.humanNeed
        : attention === "handling"
          ? "RADR is executing the approved restore."
          : attention === "verifying"
            ? "Waiting on proof that stock restored."
            : attention === "verified"
              ? undefined
              : g.humanNeed;
    return { ...g, attention, humanNeed };
  });

  return {
    ...house,
    gaps,
    needsYou: gaps.filter((g) => g.attention === "needs_you").length,
    handling: gaps.filter(
      (g) => g.attention === "handling" || g.attention === "verifying",
    ).length,
    watching: gaps.filter((g) => g.attention === "watching").length,
  };
}

/** Build temporal observations from a house summary for invariant checks. */
export function houseTemporalObservations(
  house: HouseSummary,
): TemporalObservation[] {
  const obs: TemporalObservation[] = [];
  for (const g of house.gaps) {
    const keys = temporalItemLocationKey(
      g.temporalItemKey ?? g.item,
      g.temporalLocationKey ?? g.area,
    );
    const unresolved =
      g.attention === "needs_you" ||
      g.attention === "handling" ||
      g.attention === "verifying" ||
      g.attention === "watching";
    obs.push({
      itemKey: keys.itemKey,
      locationKey: keys.locationKey,
      at: "current",
      kind: "gap",
      unresolved:
        unresolved &&
        g.attention !== "watching" &&
        g.attention !== "verified" &&
        g.attention !== "ok",
      sourceId: g.id,
    });
  }
  for (const v of house.verifications) {
    const keys = temporalItemLocationKey(
      v.itemKey ?? v.title,
      v.locationKey ?? "unknown",
    );
    obs.push({
      itemKey: keys.itemKey,
      locationKey: keys.locationKey,
      at: "historical",
      kind: "verified_restore",
      sourceId: v.id,
    });
  }
  return obs;
}

export function assertHouseTemporalIntegrity(house: HouseSummary): string[] {
  return findTemporalContradictions(houseTemporalObservations(house)).map(
    (v) => v.message,
  );
}

export function houseAttentionFor(vertical: DemoVerticalFamily): HouseSummary {
  return vertical === "hotel" ? HOTEL : RESTAURANT;
}

export function houseNeedsYouCount(vertical: DemoVerticalFamily): number {
  return houseAttentionFor(vertical).needsYou;
}

export function attentionLabel(state: HouseAttentionState): string {
  switch (state) {
    case "needs_you":
      return "Needs you";
    case "handling":
      return "RADR handling";
    case "verifying":
      return "Verifying";
    case "verified":
      return "Verified";
    case "watching":
      return "Watching";
    default:
      return "On standard";
  }
}

export function getHouseGap(id: string, vertical: DemoVerticalFamily): HouseGap | undefined {
  return houseAttentionFor(vertical).gaps.find((g) => g.id === id);
}
