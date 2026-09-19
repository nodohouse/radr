"use client";

/**
 * SVG architectural Service Map — zones + tables + future ghosts + arrival wave.
 * Connected to Futures peakPath via connectedState.
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  berlinServiceSnapshots,
  type ServiceMapMode,
  type ServiceMapUnit,
} from "@/data/demo/serviceMap";
import {
  getConnectedScenario,
  setPeakPath,
  setServiceTime,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { IntelligenceCanvas } from "@/components/product/canvas/IntelligenceCanvas";

const TIMES = ["18:00", "18:42", "19:00", "20:00"] as const;
const MODES: { id: ServiceMapMode; label: string }[] = [
  { id: "pressure", label: "Pressure" },
  { id: "occupancy", label: "Occupancy" },
  { id: "revenue", label: "Revenue" },
  { id: "turns", label: "Turns" },
];

function useConnected() {
  return useSyncExternalStore(
    subscribeConnected,
    getConnectedScenario,
    getConnectedScenario,
  );
}

function tone(u: ServiceMapUnit, mode: ServiceMapMode, path: string) {
  if (mode === "pressure") {
    const p = u.pressure ?? 0;
    if (path === "seat" && p >= 55) return p >= 75 ? "risk" : "watch";
    if (p >= 80) return "risk";
    if (p >= 55) return "watch";
    return "ok";
  }
  if (u.state === "turn_risk") return "risk";
  if (u.state === "held" || u.state === "inbound") return "watch";
  if (u.state === "available") return "open";
  if (u.state === "cancelled") return "muted";
  return "occ";
}

export function ServiceFloorCanvas() {
  const connected = useConnected();
  const path = connected.peakPath === "seat" ? "seat" : "wait";
  const time = (
    TIMES.includes(connected.serviceTime as (typeof TIMES)[number])
      ? connected.serviceTime
      : "18:42"
  ) as (typeof TIMES)[number];
  const [mode, setMode] = useState<ServiceMapMode>("pressure");
  const [inspectId, setInspectId] = useState<string | null>("t6");

  const snap = useMemo(() => {
    const shots = berlinServiceSnapshots();
    if (time === "19:00" && path === "seat") return shots["19:00_seat"]!;
    return shots[time] ?? shots["18:42"]!;
  }, [time, path]);

  const inspected = snap.units.find((u) => u.id === inspectId);

  // Ghost inbound for 19:00 while viewing 18:42
  const ghosts =
    time === "18:42"
      ? (berlinServiceSnapshots()["19:00"]?.units.filter(
          (u) => u.state === "inbound" || u.state === "held",
        ) ?? [])
      : [];

  return (
    <IntelligenceCanvas
      kicker={`${snap.at} · ${path === "wait" ? "WAIT 12M" : "SEAT NOW"} · DEMO`}
      title="Architectural capacity — empty tables are not free capacity"
      inspector={
        inspected ? (
          <div>
            <p className="rp-icanvas-kicker">Table {inspected.label}</p>
            <strong>{inspected.zone}</strong>
            <dl className="rp-svc-inspect">
              <div>
                <dt>State</dt>
                <dd>{inspected.state}</dd>
              </div>
              {inspected.pressure != null ? (
                <div>
                  <dt>Pressure</dt>
                  <dd>{inspected.pressure}</dd>
                </div>
              ) : null}
              {inspected.contributionEuro != null ? (
                <div>
                  <dt>Contribution</dt>
                  <dd>{formatDecisionMoney(inspected.contributionEuro)}</dd>
                </div>
              ) : null}
              {inspected.turnMinutes != null ? (
                <div>
                  <dt>Turn</dt>
                  <dd>{inspected.turnMinutes}m</dd>
                </div>
              ) : null}
              {inspected.note ? (
                <div>
                  <dt>Note</dt>
                  <dd>{inspected.note}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className="rp-drec-quiet">Select a table. Futures path updates this map.</p>
        )
      }
    >
      <div className="rp-svc-toolbar">
        <div className="rp-menu-mode" role="tablist" aria-label="Time">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              data-active={time === t ? "true" : undefined}
              onClick={() => setServiceTime(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="rp-menu-mode" role="tablist" aria-label="Path">
          <button
            type="button"
            data-active={path === "wait" ? "true" : undefined}
            onClick={() => setPeakPath("wait")}
          >
            Wait 12m
          </button>
          <button
            type="button"
            data-active={path === "seat" ? "true" : undefined}
            onClick={() => setPeakPath("seat")}
          >
            Seat now
          </button>
        </div>
        <div className="rp-menu-mode" role="tablist" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              data-active={mode === m.id ? "true" : undefined}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rp-svc-meta">
        <span>{snap.occupancyPct}% occupied</span>
        {snap.kitchenLoadPct != null ? (
          <strong data-tone="risk">{snap.kitchenLoadPct}% kitchen</strong>
        ) : null}
        <span data-path={path}>{path === "wait" ? "Protected turns" : "Pressure elevated"}</span>
      </div>

      <svg
        className="rp-svc-svg"
        viewBox="0 0 100 72"
        role="img"
        aria-label="Berlin floor plan"
        data-path={path}
        data-time={time}
      >
        {/* Zones */}
        <rect className="rp-svc-zone" x="2" y="2" width="62" height="48" rx="0.5" data-zone="MAIN" />
        <text className="rp-svc-zone-t" x="4" y="6">
          MAIN DINING
        </text>
        <rect className="rp-svc-zone" x="2" y="52" width="40" height="18" rx="0.5" data-zone="BAR" />
        <text className="rp-svc-zone-t" x="4" y="56">
          BAR
        </text>
        <rect className="rp-svc-zone" x="66" y="2" width="32" height="68" rx="0.5" data-zone="TERRACE" />
        <text className="rp-svc-zone-t" x="68" y="6">
          TERRACE
        </text>

        {/* Arrival wave — future pressure */}
        {time === "18:42" ? (
          <g className="rp-svc-wave" aria-hidden="true">
            <path
              d="M8 68 Q30 58 50 62 T92 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              strokeDasharray="1.2 1"
            />
            <text className="rp-svc-wave-t" x="52" y="70">
              Arrival 19:10–19:35 · 42 covers
            </text>
          </g>
        ) : null}

        {/* Future ghosts */}
        {ghosts.map((g) => (
          <rect
            key={`g-${g.id}`}
            className="rp-svc-ghost"
            x={g.x * 0.96}
            y={g.y * 0.68}
            width={Math.max(4, (g.w ?? 8) * 0.55)}
            height={Math.max(3.5, (g.h ?? 8) * 0.45)}
            rx="0.4"
          />
        ))}

        {/* Live tables */}
        {snap.units.map((u) => {
          const t = tone(u, mode, path);
          const w = Math.max(4, (u.w ?? 8) * 0.55);
          const h = Math.max(3.5, (u.h ?? 8) * 0.45);
          return (
            <g
              key={u.id}
              className="rp-svc-table"
              data-tone={t}
              data-on={inspectId === u.id ? "true" : undefined}
              transform={`translate(${u.x * 0.96} ${u.y * 0.68})`}
              onClick={() => setInspectId(u.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setInspectId(u.id);
              }}
            >
              <rect width={w} height={h} rx="0.4" />
              <text x={w / 2} y={h / 2 + 0.8} textAnchor="middle">
                {u.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="rp-svc-legend">
        Solid · now · Ghost · 19:00 inbound · Wave · arrival compression
      </p>
      <p className="rp-drec-quiet">
        Linked ·{" "}
        <Link href={`/app/decisions/${DECISION_IDS.peak}`}>
          {displayDecisionId(DECISION_IDS.peak)}
        </Link>
      </p>
    </IntelligenceCanvas>
  );
}
