"use client";

/**
 * Hotel Service Map — empty room ≠ ready capacity.
 * Same instrument language as restaurant floor.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { canalRoomSnapshot, type ServiceMapUnit } from "@/data/demo/serviceMap";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";

/** Peer to restaurant FLOOR / TIMELINE / RECOVERY */
const MODES = [
  { id: "readiness", label: "READINESS" },
  { id: "arrivals", label: "ARRIVALS" },
  { id: "recovery", label: "RECOVERY" },
] as const;

type Mode = (typeof MODES)[number]["id"];

const STATE_LABEL: Record<string, string> = {
  available: "VACANT · NOT READY?",
  occupied: "OCCUPIED",
  dirty: "DIRTY",
  ready: "READY",
  ooo: "OUT OF ORDER",
  held: "HELD",
  inbound: "ARRIVING",
  turn_risk: "AT RISK",
  cancelled: "BLOCKED",
};

function tone(u: ServiceMapUnit, mode: Mode) {
  if (mode === "recovery") {
    const c = u.contributionEuro ?? 0;
    if (u.state === "ooo" || u.state === "dirty") return "risk";
    if (u.state === "available") return "watch";
    if (c >= 400) return "ok";
    if (c >= 250) return "watch";
    return "occ";
  }
  if (mode === "arrivals") {
    if (u.state === "inbound" || u.state === "held") return "watch";
    if (u.state === "ready") return "ok";
    if (u.state === "dirty" || u.state === "turn_risk") return "risk";
    if (u.state === "ooo") return "muted";
    if (u.state === "occupied") return "occ";
    return "open";
  }
  // readiness — vacant ≠ ready
  if (u.state === "ready") return "ok";
  if (u.state === "available") return "watch";
  if (u.state === "dirty" || u.state === "turn_risk") return "risk";
  if (u.state === "ooo") return "muted";
  return "occ";
}

const HK_PRESSURE = [
  { id: "departures", label: "Departures due", pct: 78 },
  { id: "hk", label: "Housekeeping", pct: 91, links: true },
  { id: "inspect", label: "Inspection", pct: 64 },
  { id: "arrivals", label: "Arrivals 2h", pct: 86 },
  { id: "ooo", label: "OOO / maint", pct: 22 },
];

const ARRIVAL_HORIZONS = [
  { when: "NOW", label: "2 early · Floor 3 not ready" },
  { when: "+30", label: "4 arrivals · VIP suite" },
  { when: "+60", label: "7 arrivals · gap widening" },
  { when: "+120", label: "11 arrivals · readiness gap 6" },
];

const RECOVERY_OPS = [
  { when: "Tonight", label: "Late cancel · 1 premium night" },
  { when: "Upgrade", label: "3 eligible · +€180 contribution" },
  { when: "Early CI", label: "2 requests · rooms not ready" },
  { when: "Channel", label: "Soft-cap OTA · hold direct" },
];

export function HotelServiceMapInstrument() {
  const live = canalHouseLive();
  const snap = useMemo(() => canalRoomSnapshot(), []);
  const [mode, setMode] = useState<Mode>("readiness");
  const [inspectId, setInspectId] = useState<string | null>("r15");
  const [drawerOpen, setDrawerOpen] = useState(true);

  const inspected = snap.units.find((u) => u.id === inspectId);
  const floors = [1, 2, 3];

  // Mark one vacant premium as the readiness Decision room
  const decisionRoom =
    snap.units.find((u) => u.state === "available" && u.zone === "PREMIUM") ??
    snap.units.find((u) => u.state === "dirty");

  const select = (id: string) => {
    setInspectId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="rp-smap" data-vertical="hotel" data-mode={mode}>
      <header className="rp-smap-head">
        <div>
          <p className="rp-cin-kicker">OPERATIONS · {live.locationName}</p>
          <h1 className="rp-cin-headline" data-type="editorial">
            {mode === "recovery"
              ? "Recoverable tonight"
              : mode === "arrivals"
                ? "Arrivals vs readiness"
                : "House readiness"}
          </h1>
          <p className="rp-cin-quiet">
            {mode === "recovery"
              ? "Late cancel · upgrade · early check-in · channel release — each becomes a Decision"
              : mode === "arrivals"
                ? "NOW · +30 · +60 · +120 — temporal collisions with rooms not yet ready"
                : "Empty room ≠ ready capacity · DEPARTED → CLEANING → INSPECTION → READY"}
          </p>
        </div>
        <p className="rp-smap-phase">
          <strong>{live.clockLabel}</strong>
          <span>{live.phase}</span>
        </p>
      </header>

      <div className="rp-smap-toolbar">
        <div className="rp-smap-seg" role="tablist" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              data-active={mode === m.id ? "true" : undefined}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rp-smap-inbound"
        aria-label={
          mode === "recovery"
            ? "Recovery opportunities"
            : mode === "arrivals"
              ? "Arrival horizons"
              : "Readiness pressure window"
        }
        data-mode={mode}
      >
        {(mode === "recovery"
          ? RECOVERY_OPS
          : mode === "arrivals"
            ? ARRIVAL_HORIZONS
            : [
                { when: "12:00", label: "Departures peak" },
                { when: "14:00", label: "Cleaning peak" },
                { when: "15:00", label: "Inspection pressure" },
                { when: "16:00", label: "Check-in wave" },
              ]
        ).map((row) => (
          <div key={row.when}>
            <em>{row.when}</em>
            <span>{row.label}</span>
          </div>
        ))}
      </div>

      {mode === "recovery" ? (
        <div className="rp-smap-recovery-hero" data-type="numeric">
          <strong>{formatDecisionMoney(live.exposureEuro)}</strong>
          <span>RECOVERABLE / EXPOSED TONIGHT</span>
          <Link href={`/app/decisions/${DECISION_IDS.hotelReadiness}`}>
            Open {displayDecisionId(DECISION_IDS.hotelReadiness)} →
          </Link>
        </div>
      ) : null}

      <div
        className="rp-smap-layout"
        data-drawer={drawerOpen ? "open" : "closed"}
      >
        <div className="rp-smap-stage">
          <div className="rp-smap-meta">
            <span>
              <strong>{live.occupancyPct}%</strong> occupied
            </span>
            <span>
              <strong>
                {live.ready}/{live.departuresDue}
              </strong>{" "}
              ready / due
            </span>
            <span data-tone={live.readinessGap > 0 ? "risk" : undefined}>
              <strong>{live.readinessGap}</strong> readiness gap
            </span>
            <span>
              <strong>{live.arrivals}</strong> arrivals
            </span>
          </div>

          <svg
            className="rp-smap-svg"
            viewBox="0 0 100 90"
            role="img"
            aria-label="Mercer House floor readiness"
          >
            {floors.map((floor) => (
              <g key={floor}>
                <rect
                  className="rp-smap-zone"
                  x="2"
                  y={(floor - 1) * 28 + 2}
                  width="96"
                  height="26"
                  rx="0.5"
                />
                <text
                  className="rp-smap-zone-t"
                  x="4"
                  y={(floor - 1) * 28 + 6}
                >
                  FLOOR {floor}
                </text>
              </g>
            ))}

            {snap.units.map((u) => {
              const t = tone(u, mode);
              const w = Math.max(5, (u.w ?? 10) * 0.7);
              const h = Math.max(5, (u.h ?? 10) * 0.55);
              const isDecision = decisionRoom?.id === u.id;
              return (
                <g
                  key={u.id}
                  className="rp-smap-table"
                  data-tone={t}
                  data-decision={isDecision ? "true" : undefined}
                  data-on={inspectId === u.id ? "true" : undefined}
                  transform={`translate(${u.x} ${u.y})`}
                  onClick={() => select(u.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Room ${u.label}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") select(u.id);
                  }}
                >
                  <rect width={w} height={h} rx="0.4" />
                  <text x={w / 2} y={h / 2 + 0.9} textAnchor="middle">
                    {u.label}
                  </text>
                  {isDecision ? (
                    <circle
                      className="rp-smap-dec-dot"
                      cx={w - 0.8}
                      cy={0.8}
                      r="0.9"
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          <ul className="rp-smap-pressure" aria-label="Housekeeping pressure">
            {HK_PRESSURE.map((p) => (
              <li
                key={p.id}
                data-risk={p.pct >= 90 ? "true" : undefined}
                data-link={p.links ? "true" : undefined}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (p.links && decisionRoom) select(decisionRoom.id);
                  }}
                >
                  <span>{p.label}</span>
                  <strong>{p.pct}%</strong>
                  <i style={{ width: `${p.pct}%` }} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <p className="rp-smap-legend">
            Green mark · readiness Decision · Vacant without ready = risk
          </p>
        </div>

        {drawerOpen && inspected ? (
          <aside className="rp-smap-drawer" aria-label="Room detail">
            <header className="rp-smap-drawer-h">
              <div>
                <p className="rp-cin-kicker">Room {inspected.label}</p>
                <h2>{inspected.zone}</h2>
              </div>
              <button
                type="button"
                className="rp-smap-drawer-close"
                aria-label="Close detail"
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </header>

            <dl className="rp-smap-drawer-stats">
              <div>
                <dt>State</dt>
                <dd>{STATE_LABEL[inspected.state] ?? inspected.state}</dd>
              </div>
              <div>
                <dt>Contribution</dt>
                <dd>
                  {inspected.contributionEuro != null
                    ? formatDecisionMoney(inspected.contributionEuro)
                    : "—"}
                </dd>
              </div>
            </dl>

            {decisionRoom?.id === inspected.id ? (
              <div className="rp-smap-why">
                <h3>Why empty ≠ ready</h3>
                <ul>
                  <li>2 towels missing · amenity short</li>
                  <li>Housekeeping load 91%</li>
                  <li>Arrival in 48 min</li>
                  <li>VIP / direct hold candidate</li>
                </ul>
                <h3>Options</h3>
                <ul className="rp-smap-futures">
                  <li data-rec="true">
                    <button type="button">
                      <strong>PRIORITIZE ROOM</strong>
                      <em>Protect arrival</em>
                      <span>Prepared for HK lead approval</span>
                    </button>
                  </li>
                  <li>
                    <button type="button">
                      <strong>RESTOCK FROM RESERVE</strong>
                      <em>12 min</em>
                      <span>Soap + towels · cart 3</span>
                    </button>
                  </li>
                  <li>
                    <button type="button">
                      <strong>REASSIGN ARRIVAL</strong>
                      <em>Same type · floor 2</em>
                      <span>Guest impact medium</span>
                    </button>
                  </li>
                </ul>
                <p className="rp-smap-actions">
                  <span>Prepared for approval</span>
                  <Link href={`/app/decisions/${DECISION_IDS.hotelReadiness}`}>
                    Open {displayDecisionId(DECISION_IDS.hotelReadiness)} →
                  </Link>
                </p>
              </div>
            ) : (
              <div className="rp-smap-why">
                {inspected.note ? <p>{inspected.note}</p> : null}
                <p className="rp-cin-quiet">
                  {inspected.channel ?? "Channel · PMS"}
                </p>
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
