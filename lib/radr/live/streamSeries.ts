/**
 * Cumulative income-stream series for the live pace chart.
 * Total + channel + delivery provider lines - compare who pulls ahead.
 */

import { deliveryProviderById } from "@/lib/radr/channels/providers";
import type { OperatingEvent } from "./types";

export type LiveStreamSeriesKind = "total" | "channel" | "provider";

export type LiveStreamSeries = {
  id: string;
  label: string;
  kind: LiveStreamSeriesKind;
  /** CSS token key for stroke color */
  tone: "total" | "dine_in" | "delivery" | "uber-eats" | "deliveroo" | "wolt" | "other";
  points: { t: number; net: number }[];
};

const ORIGIN_MS = new Date("2026-08-19T17:00:00+02:00").getTime();

function providerFromEvent(e: OperatingEvent): string | null {
  const meta = e.metadata?.providerId;
  if (typeof meta === "string" && meta) return meta;
  const label = e.label.toLowerCase();
  if (label.includes("uber")) return "uber-eats";
  if (label.includes("deliveroo")) return "deliveroo";
  if (label.includes("wolt")) return "wolt";
  if (e.eventType === "DELIVERY_ORDER" || e.channel === "delivery") return "other";
  return null;
}

function isSalesIn(e: OperatingEvent): boolean {
  return e.eventType === "SALE" || e.eventType === "DELIVERY_ORDER";
}

function isLeakage(e: OperatingEvent): boolean {
  return (
    e.eventType === "REFUND" ||
    e.eventType === "DISCOUNT" ||
    e.eventType === "COMP" ||
    e.eventType === "VOID"
  );
}

function minuteOf(e: OperatingEvent): number {
  return Math.max(
    0,
    Math.round((new Date(e.timestamp).getTime() - ORIGIN_MS) / 60_000),
  );
}

function pushPoint(
  points: { t: number; net: number }[],
  t: number,
  net: number,
) {
  const last = points[points.length - 1];
  const rounded = Math.max(0, Math.round(net * 100) / 100);
  if (last && last.t === t) {
    last.net = rounded;
    return;
  }
  points.push({ t, net: rounded });
}

/**
 * Build cumulative series from chronological events.
 * Provider lines only accumulate delivery orders attributed to that provider.
 */
export function buildLiveStreamSeries(
  events: OperatingEvent[],
): LiveStreamSeries[] {
  const sorted = [...events].sort(
    (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp),
  );

  let total = 0;
  let dineIn = 0;
  let delivery = 0;
  const byProvider: Record<string, number> = {
    "uber-eats": 0,
    deliveroo: 0,
    wolt: 0,
    other: 0,
  };

  const totalPts: { t: number; net: number }[] = [{ t: 0, net: 0 }];
  const dinePts: { t: number; net: number }[] = [{ t: 0, net: 0 }];
  const delPts: { t: number; net: number }[] = [{ t: 0, net: 0 }];
  const providerPts: Record<string, { t: number; net: number }[]> = {
    "uber-eats": [{ t: 0, net: 0 }],
    deliveroo: [{ t: 0, net: 0 }],
    wolt: [{ t: 0, net: 0 }],
    other: [{ t: 0, net: 0 }],
  };

  const recognized = new Set<string>();

  for (const e of sorted) {
    const t = minuteOf(e);
    let touchedProvider: string | null = null;

    if (isSalesIn(e) && !recognized.has(e.id)) {
      recognized.add(e.id);
      total += e.amount;
      const isDelivery =
        e.eventType === "DELIVERY_ORDER" || e.channel === "delivery";
      if (isDelivery) {
        delivery += e.amount;
        const pid = providerFromEvent(e) ?? "other";
        byProvider[pid] = (byProvider[pid] ?? 0) + e.amount;
        touchedProvider = pid;
      } else {
        dineIn += e.amount;
      }
    } else if (isLeakage(e)) {
      const amt = Math.abs(e.amount);
      total -= amt;
      if (e.channel === "delivery") {
        delivery -= amt;
        const pid = providerFromEvent(e) ?? "other";
        byProvider[pid] = (byProvider[pid] ?? 0) - amt;
        touchedProvider = pid;
      } else {
        dineIn -= amt;
      }
    } else {
      continue;
    }

    pushPoint(totalPts, t, total);
    pushPoint(dinePts, t, dineIn);
    pushPoint(delPts, t, delivery);
    if (touchedProvider && providerPts[touchedProvider]) {
      pushPoint(providerPts[touchedProvider]!, t, byProvider[touchedProvider]!);
    }
    // Keep other provider curves flat-forward in time for continuous lines
    for (const id of Object.keys(providerPts)) {
      if (id === touchedProvider) continue;
      const pts = providerPts[id]!;
      const last = pts[pts.length - 1]!;
      if (last.t < t) pushPoint(pts, t, last.net);
    }
  }

  const series: LiveStreamSeries[] = [
    {
      id: "total",
      label: "Total",
      kind: "total",
      tone: "total",
      points: totalPts,
    },
    {
      id: "dine_in",
      label: "Dine-in",
      kind: "channel",
      tone: "dine_in",
      points: dinePts,
    },
    {
      id: "delivery",
      label: "Delivery",
      kind: "channel",
      tone: "delivery",
      points: delPts,
    },
  ];

  for (const id of ["uber-eats", "deliveroo", "wolt"] as const) {
    const last = byProvider[id] ?? 0;
    if (last <= 0 && (providerPts[id]?.length ?? 0) <= 1) continue;
    const catalog = deliveryProviderById(id);
    series.push({
      id,
      label: catalog?.name ?? id,
      kind: "provider",
      tone: id,
      points: providerPts[id]!,
    });
  }

  return series;
}
