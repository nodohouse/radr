/**
 * Deterministic DEMO live stream - illustrative only.
 * Playback advances by tick index (not wall-clock Date.now() for business day).
 */

import {
  DEMO_AS_OF_ISO,
  DEMO_BUSINESS_DATE,
  DEMO_LOCATION_ID,
  DEMO_LOCATION_NAME,
  DEMO_ORG_ID,
} from "@/lib/radr/demoClock";
import type { OperatingEvent, ShiftEconomicState } from "./types";
import { aggregateOperatingEvents } from "./aggregate";
import { buildLiveStreamSeries } from "./streamSeries";

const SERVICE = {
  serviceId: "svc_ber_dinner_2026_08_19",
  serviceLabel: "Dinner",
};

type ScriptBeat = {
  /** Seconds after demo stream origin (17:00). */
  atSec: number;
  eventType: OperatingEvent["eventType"];
  amount: number;
  label: string;
  channel?: OperatingEvent["channel"];
  reason?: string;
  settlementOfSaleId?: string;
  orderId?: string;
  /** Delivery aggregator id - aligns with channel catalog. */
  providerId?: string;
};

/** Origin: 17:00 Berlin on demo business day. */
const ORIGIN_MS = new Date("2026-08-19T17:00:00+02:00").getTime();

const SCRIPT: ScriptBeat[] = [
  { atSec: 0, eventType: "COVERS", amount: 24, label: "Early covers seated" },
  { atSec: 120, eventType: "SALE", amount: 86, label: "Table 4 closed", channel: "dine_in", orderId: "ord_004" },
  { atSec: 180, eventType: "PAYMENT", amount: 86, label: "Card payment · Table 4", settlementOfSaleId: "evt_sale_004", orderId: "ord_004" },
  { atSec: 240, eventType: "CHECK_OPENED", amount: 64, label: "Walk-in check opened", channel: "dine_in" },
  { atSec: 360, eventType: "DELIVERY_ORDER", amount: 41, label: "Deliveroo order", channel: "delivery", orderId: "ord_d01", providerId: "deliveroo" },
  { atSec: 380, eventType: "FEE", amount: 9, label: "Delivery platform fee", channel: "delivery" },
  { atSec: 480, eventType: "SALE", amount: 126, label: "Table 18 closed", channel: "dine_in", orderId: "ord_018" },
  { atSec: 500, eventType: "PAYMENT", amount: 126, label: "Card payment · Table 18", settlementOfSaleId: "evt_sale_018", orderId: "ord_018" },
  { atSec: 560, eventType: "COMP", amount: 12, label: "Manager comp · dessert", channel: "dine_in", reason: "Guest recovery" },
  { atSec: 620, eventType: "COVERS", amount: 8, label: "8 covers seated" },
  { atSec: 700, eventType: "SALE", amount: 94, label: "Table 9 closed", channel: "bar", orderId: "ord_009" },
  { atSec: 780, eventType: "DISCOUNT", amount: 18, label: "Staff discount", channel: "dine_in" },
  { atSec: 840, eventType: "DELIVERY_ORDER", amount: 52, label: "Uber Eats order", channel: "delivery", orderId: "ord_d02", providerId: "uber-eats" },
  { atSec: 900, eventType: "SALE", amount: 158, label: "Table 12 closed", channel: "terrace", orderId: "ord_012" },
  { atSec: 960, eventType: "REFUND", amount: 28, label: "Refund · wrong item", channel: "dine_in" },
  { atSec: 1020, eventType: "CHECK_OPENED", amount: 112, label: "Table 7 opened", channel: "dine_in" },
  { atSec: 1100, eventType: "SALE", amount: 74, label: "Bar tab closed", channel: "bar", orderId: "ord_b03" },
  { atSec: 1180, eventType: "COVERS", amount: 12, label: "12 covers seated" },
  { atSec: 1220, eventType: "DELIVERY_ORDER", amount: 47, label: "Wolt order", channel: "delivery", orderId: "ord_d03", providerId: "wolt" },
  { atSec: 1260, eventType: "SALE", amount: 142, label: "Table 21 closed", channel: "dine_in", orderId: "ord_021" },
  { atSec: 1320, eventType: "COMP", amount: 14, label: "Comp · amuse", reason: "Hospitality" },
  { atSec: 1400, eventType: "DELIVERY_ORDER", amount: 38, label: "Deliveroo order", channel: "delivery", providerId: "deliveroo" },
  { atSec: 1480, eventType: "SALE", amount: 118, label: "Table 3 closed", channel: "dine_in", orderId: "ord_003" },
  { atSec: 1520, eventType: "DELIVERY_ORDER", amount: 61, label: "Uber Eats order", channel: "delivery", providerId: "uber-eats" },
  { atSec: 1560, eventType: "DISCOUNT", amount: 22, label: "Promo code", channel: "delivery", providerId: "uber-eats" },
  { atSec: 1640, eventType: "SALE", amount: 96, label: "Table 15 closed", channel: "dine_in", orderId: "ord_015" },
  { atSec: 1680, eventType: "DELIVERY_ORDER", amount: 44, label: "Wolt order", channel: "delivery", providerId: "wolt" },
  { atSec: 1720, eventType: "CHECK_OPENED", amount: 88, label: "Walk-in opened", channel: "dine_in" },
  { atSec: 1760, eventType: "DELIVERY_ORDER", amount: 55, label: "Uber Eats order", channel: "delivery", providerId: "uber-eats" },
  { atSec: 1800, eventType: "SALE", amount: 134, label: "Table 11 closed", channel: "terrace", orderId: "ord_011" },
  // Continue denser into service - baseline path toward ~€6.8k by 17:30 demo clock
];

/** Seeded bulk history so mid-service totals match the product story (~€6.4-6.8k). */
function seedBaselineEvents(): OperatingEvent[] {
  const seed: OperatingEvent[] = [];
  // Compress earlier service into synthetic settled sales (deterministic).
  const bulk = [
    420, 380, 510, 290, 340, 460, 310, 280, 390, 440, 360, 275, 410, 330, 295,
  ];
  let t = 60;
  bulk.forEach((amount, i) => {
    const id = `evt_seed_sale_${i}`;
    seed.push(
      eventAt(t, {
        eventType: "SALE",
        amount,
        label: `Settled checks · block ${i + 1}`,
        channel: i % 4 === 0 ? "terrace" : "dine_in",
        orderId: `ord_seed_${i}`,
      }, id),
    );
    seed.push(
      eventAt(t + 15, {
        eventType: "PAYMENT",
        amount,
        label: `Payment · block ${i + 1}`,
        settlementOfSaleId: id,
        orderId: `ord_seed_${i}`,
      }, `evt_seed_pay_${i}`),
    );
    t += 90;
  });
  seed.push(
    eventAt(200, {
      eventType: "COVERS",
      amount: 86,
      label: "Covers to date",
    }, "evt_seed_covers"),
  );
  seed.push(
    eventAt(400, {
      eventType: "DISCOUNT",
      amount: 96,
      label: "Campaign discounts",
    }, "evt_seed_disc"),
  );
  seed.push(
    eventAt(500, {
      eventType: "COMP",
      amount: 48,
      label: "Guest recovery comps",
      reason: "Guest recovery",
    }, "evt_seed_comp"),
  );
  seed.push(
    eventAt(700, {
      eventType: "REFUND",
      amount: 34,
      label: "Earlier refunds",
    }, "evt_seed_ref"),
  );
  seed.push(
    eventAt(800, {
      eventType: "CHECK_OPENED",
      amount: 420,
      label: "Open floor checks",
    }, "evt_seed_open_a"),
  );
  seed.push(
    eventAt(820, {
      eventType: "CHECK_OPENED",
      amount: 286,
      label: "Open terrace checks",
    }, "evt_seed_open_b"),
  );
  seed.push(
    eventAt(850, {
      eventType: "CHECK_OPENED",
      amount: 420,
      label: "Open bar / late",
    }, "evt_seed_open_c"),
  );
  seed.push(
    eventAt(900, {
      eventType: "DEPOSIT",
      amount: 380,
      label: "Deposits held",
    }, "evt_seed_dep"),
  );
  seed.push(
    eventAt(950, {
      eventType: "DELIVERY_ORDER",
      amount: 186,
      label: "Uber Eats settled earlier",
      channel: "delivery",
      providerId: "uber-eats",
    }, "evt_seed_del_ue"),
  );
  seed.push(
    eventAt(980, {
      eventType: "DELIVERY_ORDER",
      amount: 142,
      label: "Deliveroo settled earlier",
      channel: "delivery",
      providerId: "deliveroo",
    }, "evt_seed_del_dr"),
  );
  seed.push(
    eventAt(1010, {
      eventType: "DELIVERY_ORDER",
      amount: 82,
      label: "Wolt settled earlier",
      channel: "delivery",
      providerId: "wolt",
    }, "evt_seed_del_wo"),
  );
  seed.push(
    eventAt(1040, {
      eventType: "FEE",
      amount: 88,
      label: "Delivery fees earlier",
      channel: "delivery",
    }, "evt_seed_fee"),
  );
  return seed;
}

function eventAt(
  atSec: number,
  beat: Omit<ScriptBeat, "atSec">,
  id: string,
): OperatingEvent {
  const ts = new Date(ORIGIN_MS + atSec * 1000).toISOString();
  return {
    id,
    organizationId: DEMO_ORG_ID,
    locationId: DEMO_LOCATION_ID,
    locationName: DEMO_LOCATION_NAME,
    timestamp: ts,
    source: "DEMO",
    eventType: beat.eventType,
    amount: beat.amount,
    currency: "EUR",
    serviceId: SERVICE.serviceId,
    serviceLabel: SERVICE.serviceLabel,
    orderId: beat.orderId,
    channel: beat.channel,
    reason: beat.reason,
    label: beat.label,
    settlementOfSaleId: beat.settlementOfSaleId,
    metadata: beat.providerId
      ? { providerId: beat.providerId }
      : undefined,
  };
}

function buildScriptEvents(): OperatingEvent[] {
  return SCRIPT.map((beat, i) => {
    const id =
      beat.eventType === "SALE" && beat.orderId === "ord_004"
        ? "evt_sale_004"
        : beat.eventType === "SALE" && beat.orderId === "ord_018"
          ? "evt_sale_018"
          : `evt_live_${String(i).padStart(3, "0")}`;
    return eventAt(beat.atSec + 1100, beat, id);
  });
}

/** Forecast curve - coherent with mid-service dinner (17:00 open). */
function expectedSeries(): { t: number; net: number }[] {
  return [
    { t: 0, net: 0 },
    { t: 30, net: 5520 },
    { t: 60, net: 6800 },
    { t: 90, net: 7800 },
    { t: 120, net: 8500 },
    { t: 150, net: 9000 },
    { t: 180, net: 9280 },
    { t: 210, net: 9480 },
  ];
}

function actualSeriesFrom(events: OperatingEvent[]): { t: number; net: number }[] {
  let net = 0;
  const points: { t: number; net: number }[] = [{ t: 0, net: 0 }];
  const recognized = new Set<string>();
  for (const e of events) {
    const minute = Math.round(
      (new Date(e.timestamp).getTime() - ORIGIN_MS) / 60_000,
    );
    if (e.eventType === "SALE" || e.eventType === "DELIVERY_ORDER") {
      if (!recognized.has(e.id)) {
        recognized.add(e.id);
        net += e.amount;
      }
    } else if (
      e.eventType === "REFUND" ||
      e.eventType === "DISCOUNT" ||
      e.eventType === "COMP" ||
      e.eventType === "VOID"
    ) {
      net -= Math.abs(e.amount);
    }
    points.push({ t: Math.max(0, minute), net: Math.max(0, Math.round(net)) });
  }
  return points;
}

/**
 * @param tickIndex - how many live script beats have played (0…SCRIPT.length)
 * Client increments tick on a calm interval (~3-4s).
 */
export function demoShiftStateAtTick(tickIndex: number): ShiftEconomicState {
  const liveCount = Math.max(0, Math.min(SCRIPT.length, tickIndex));
  const liveEvents = buildScriptEvents().slice(0, liveCount);
  const events = [...seedBaselineEvents(), ...liveEvents].sort(
    (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp),
  );

  // Pin to demo operating clock so pace vs expected stays coherent.
  const asOf = DEMO_AS_OF_ISO;
  const minutes = 30;

  // First pass - get net sales from events
  const provisional = aggregateOperatingEvents(events, {
    organizationId: DEMO_ORG_ID,
    locationId: DEMO_LOCATION_ID,
    locationName: DEMO_LOCATION_NAME,
    serviceId: SERVICE.serviceId,
    serviceLabel: SERVICE.serviceLabel,
    businessDate: DEMO_BUSINESS_DATE,
    asOf,
    illustrative: true,
    forecastClose: 9480,
    expectedByNow: 1,
  });

  // Credible hospitality band: ~+8% ahead, tiny tick wobble (±0.6pp)
  const wobble = ((tickIndex % 5) - 2) * 0.3;
  const aheadPct = Math.round((8.2 + wobble) * 10) / 10;
  const expectedByNow = Math.max(
    1,
    Math.round(provisional.netSales / (1 + aheadPct / 100)),
  );

  const exp = expectedSeries();
  // Align sparkline "now" expected to the same coherent level
  const expectedAligned = exp.map((p) =>
    p.t === minutes ? { ...p, net: expectedByNow } : p,
  );

  return aggregateOperatingEvents(events, {
    organizationId: DEMO_ORG_ID,
    locationId: DEMO_LOCATION_ID,
    locationName: DEMO_LOCATION_NAME,
    serviceId: SERVICE.serviceId,
    serviceLabel: SERVICE.serviceLabel,
    businessDate: DEMO_BUSINESS_DATE,
    asOf,
    illustrative: true,
    forecastClose: 9480,
    expectedByNow,
    expectedVelocityPerMinute: 18.5,
    contributionRate: 0.652,
    actualSeries: actualSeriesFrom(events),
    expectedSeries: expectedAligned,
    streamSeries: buildLiveStreamSeries(events),
    sources: [
      { source: "POS", status: "ILLUSTRATIVE", lastEventAt: asOf, ageSeconds: 0 },
      { source: "PAYMENTS", status: "ILLUSTRATIVE", lastEventAt: asOf, ageSeconds: 0 },
      {
        source: "DELIVERY",
        status: "ILLUSTRATIVE",
        lastEventAt: asOf,
        ageSeconds: 12,
      },
      {
        source: "RESERVATIONS",
        status: "ILLUSTRATIVE",
        lastEventAt: asOf,
        ageSeconds: 90,
      },
    ],
  });
}

export function demoStreamBeatCount(): number {
  return SCRIPT.length;
}

export function demoWhatChanged(
  state: ShiftEconomicState,
  minutes = 15,
): {
  minutes: number;
  sales: number;
  refunds: number;
  comps: number;
  discounts: number;
  covers: number;
  netMovement: number;
  lines: string[];
} {
  const cutoff = new Date(state.asOf).getTime() - minutes * 60_000;
  const window = state.recentEvents.filter(
    (e) => new Date(e.timestamp).getTime() >= cutoff,
  );
  let sales = 0;
  let refunds = 0;
  let comps = 0;
  let discounts = 0;
  let covers = 0;
  for (const e of window) {
    if (e.eventType === "SALE" || e.eventType === "DELIVERY_ORDER") sales += e.amount;
    if (e.eventType === "REFUND") refunds += Math.abs(e.amount);
    if (e.eventType === "COMP") comps += Math.abs(e.amount);
    if (e.eventType === "DISCOUNT") discounts += Math.abs(e.amount);
    if (e.eventType === "COVERS") covers += Math.round(e.amount);
  }
  const netMovement = sales - refunds - comps - discounts;
  const lines = [
    sales > 0 ? `+€${Math.round(sales)} sales` : null,
    refunds > 0 ? `−€${Math.round(refunds)} refund` : null,
    comps > 0 ? `−€${Math.round(comps)} comps` : null,
    discounts > 0 ? `−€${Math.round(discounts)} discounts` : null,
    covers > 0 ? `+${covers} covers` : null,
  ].filter(Boolean) as string[];
  return { minutes, sales, refunds, comps, discounts, covers, netMovement, lines };
}

export function demoRevenueBridge(state: ShiftEconomicState) {
  const expected = state.expectedByNow;
  const coverLift = Math.round(state.vsExpectedAbs * 0.55);
  const spendLift = Math.round(state.vsExpectedAbs * 0.25);
  const deliveryLift = Math.round(state.vsExpectedAbs * 0.2);
  const steps = [
    { label: "Covers", amount: coverLift },
    { label: "Average spend", amount: spendLift },
    { label: "Delivery", amount: deliveryLift },
    { label: "Discounts", amount: -Math.round(state.discounts * 0.15) },
    { label: "Refunds", amount: -Math.round(state.refunds * 0.35) },
  ];
  const actual =
    expected + steps.reduce((s, x) => s + x.amount, 0);
  return { expected, steps, actual: Math.round(actual) };
}
