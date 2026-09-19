"use client";

import { useEffect, useMemo, useState } from "react";
import { DEMO_TIMEZONE } from "@/lib/radr/demoClock";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";
import { useDemoServicePhase } from "./useDemoServicePhase";
import { useDemoVertical } from "./DemoVerticalSwitcher";
import { canalHouseArrivals } from "@/lib/radr/demo/canalHouseAmsterdam";
import { lisbonUnits } from "@/lib/radr/demo/lisbonResidences";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** HH:MM:SS or M:SS when under an hour. */
function formatRemain(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${m}:${pad(sec)}`;
}

function formatClock(ms: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: DEMO_TIMEZONE,
  }).format(new Date(ms));
}

/** Parse HH:MM on the same calendar day as `dayMs` in DEMO_TIMEZONE. */
function milestoneMs(dayMs: number, hhmm: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEMO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(dayMs));
  const y = parts.find((p) => p.type === "year")?.value;
  const mo = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return new Date(`${y}-${mo}-${d}T${hhmm}:00+02:00`).getTime();
}

function hotelSecondary(nowMs: number): string {
  const arrivals = canalHouseArrivals()
    .map((a) => ({ time: a.time, at: milestoneMs(nowMs, a.time), guest: a.guest }))
    .filter((a) => a.at >= nowMs - 60_000)
    .sort((a, b) => a.at - b.at);
  const nextArrival = arrivals[0];
  const checkoutAt = milestoneMs(nowMs, "11:00");
  if (nowMs < checkoutAt) {
    return nextArrival
      ? `Checkout 11:00 · Arrival ${nextArrival.time}`
      : "Next checkout 11:00";
  }
  if (nextArrival) {
    return `Next arrival ${nextArrival.time}`;
  }
  return "Open · 24h · checkouts from 11:00";
}

function residencesSecondary(nowMs: number): string {
  const units = lisbonUnits();
  const events = units.flatMap((u) => {
    const list: { kind: string; time: string; at: number }[] = [];
    if (u.checkOutAt) {
      list.push({
        kind: "checkout",
        time: u.checkOutAt,
        at: milestoneMs(nowMs, u.checkOutAt),
      });
    }
    if (u.checkInAt) {
      list.push({
        kind: "checkin",
        time: u.checkInAt,
        at: milestoneMs(nowMs, u.checkInAt),
      });
    }
    return list;
  });
  const upcoming = events
    .filter((e) => e.at >= nowMs - 60_000)
    .sort((a, b) => a.at - b.at);
  const next = upcoming[0];
  if (!next) return "Open · 24h · checkouts from 10:00";
  return next.kind === "checkout"
    ? `Next checkout ${next.time}`
    : `Next check-in ${next.time}`;
}

/**
 * Operating clock in the topbar gap.
 * Restaurant: live time + countdown to shift close.
 * Hotel / residences (24/7): live time + next checkout / arrival — no close timer.
 */
export function ShiftClock() {
  const synthetic = isSyntheticData(getRadrEnvironment());
  const { asOfIso, ctx, phase, ready } = useDemoServicePhase(synthetic);
  const vertical = useDemoVertical();
  const [nowMs, setNowMs] = useState(() => new Date(asOfIso).getTime());

  useEffect(() => {
    const base = new Date(asOfIso).getTime();
    const started = performance.now();
    setNowMs(base);
    // Accommodation: still tick the wall clock; no close countdown.
    const id = window.setInterval(() => {
      setNowMs(base + (performance.now() - started));
    }, 250);
    return () => window.clearInterval(id);
  }, [asOfIso]);

  const accommodationLabel = useMemo(() => {
    if (vertical === "boutique_hotel") return hotelSecondary(nowMs);
    if (vertical === "serviced_apartments") return residencesSecondary(nowMs);
    return null;
  }, [vertical, nowMs]);

  if (!ready) return null;

  const isAccommodation =
    vertical === "boutique_hotel" || vertical === "serviced_apartments";

  let remainLabel: string;
  let title: string;
  let done = false;

  if (isAccommodation) {
    remainLabel = accommodationLabel ?? "Open · 24h";
    title =
      vertical === "boutique_hotel"
        ? "Property runs 24/7 · next guest milestone"
        : "Portfolio runs 24/7 · next stay milestone";
  } else {
    const remainSec = (new Date(ctx.endIso).getTime() - nowMs) / 1000;
    done = phase === "POST_SHIFT" || remainSec <= 0;
    remainLabel = done
      ? "Shift complete"
      : `${formatRemain(remainSec)} until close`;
    title = `${ctx.serviceLabel} · closes ${formatClock(new Date(ctx.endIso).getTime())}`;
  }

  return (
    <div className="rp-shift-clock" aria-live="off" title={title}>
      <time
        className="rp-shift-clock-now"
        dateTime={new Date(nowMs).toISOString()}
      >
        {formatClock(nowMs)}
      </time>
      <span
        className="rp-shift-clock-remain"
        data-done={done ? "true" : "false"}
        data-mode={isAccommodation ? "milestone" : "close"}
      >
        {remainLabel}
      </span>
    </div>
  );
}
