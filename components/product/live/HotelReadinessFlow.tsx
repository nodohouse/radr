"use client";

import type { CSSProperties } from "react";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";

export function hotelReadinessCounts() {
  const s = HOTEL_LIVE_SCENARIO;
  const flow = canalHouseLive().flow;
  return {
    departed: s.roomsDeparted,
    cleaning: s.roomsCleaning,
    inspection: s.roomsInspection,
    ready: s.roomsReady,
    arriving: s.arrivalsToday,
    occupied: flow.occupied,
    atRisk: s.roomsAtRisk,
  };
}

type StageTone = "done" | "active" | "watch" | "ok" | "next";

const STAGES: {
  id: string;
  label: string;
  tone: StageTone;
  countKey: Exclude<keyof ReturnType<typeof hotelReadinessCounts>, "atRisk">;
}[] = [
  { id: "departed", label: "Departed", tone: "done", countKey: "departed" },
  { id: "cleaning", label: "Cleaning", tone: "active", countKey: "cleaning" },
  {
    id: "inspection",
    label: "Inspection",
    tone: "watch",
    countKey: "inspection",
  },
  { id: "ready", label: "Ready", tone: "ok", countKey: "ready" },
  { id: "arriving", label: "Arriving", tone: "next", countKey: "arriving" },
  { id: "occupied", label: "Occupied", tone: "done", countKey: "occupied" },
];

/** Spatial pipeline — DEPARTED → CLEANING → INSPECTION → READY → ARRIVING → OCCUPIED. */
export function HotelReadinessFlow({
  variant = "live",
}: {
  variant?: "live" | "cockpit";
}) {
  const counts = hotelReadinessCounts();
  const maxN = Math.max(...STAGES.map((s) => counts[s.countKey]), 1);

  return (
    <section
      className="rp-hotel-readiness"
      data-variant={variant}
      aria-label="Room readiness flow"
    >
      <header className="rp-hotel-readiness-head">
        <p className={variant === "cockpit" ? "rp-cock-k" : "rp-live-k"}>
          Readiness flow
        </p>
        {counts.atRisk > 0 ? (
          <span className="rp-hotel-readiness-risk">
            {counts.atRisk} at risk · wave {HOTEL_LIVE_SCENARIO.waveLabel}
          </span>
        ) : null}
      </header>

      <div className="rp-hotel-readiness-pipe" aria-hidden="true">
        {STAGES.map((s) => (
          <i
            key={s.id}
            data-tone={s.tone}
            style={
              {
                flex: Math.max(0.15, counts[s.countKey] / maxN),
              } as CSSProperties
            }
          />
        ))}
      </div>

      <ol className="rp-hotel-readiness-stages">
        {STAGES.map((s, i) => {
          const n = counts[s.countKey];
          const pct = Math.max(12, (n / maxN) * 100);
          return (
            <li key={s.id} className="rp-hotel-readiness-node" data-tone={s.tone}>
              {i > 0 ? (
                <span className="rp-hotel-readiness-link" aria-hidden="true" />
              ) : null}
              <div className="rp-hotel-readiness-col">
                <i
                  style={
                    { "--rp-readiness-h": `${pct}%` } as CSSProperties
                  }
                />
              </div>
              <strong>{n}</strong>
              <em>{s.label}</em>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
