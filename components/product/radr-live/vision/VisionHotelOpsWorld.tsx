"use client";

/**
 * RADR Live · Hotel property — building stack + floor plan from fixtures.
 */

import { useEffect, useMemo, useState } from "react";
import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { hotelFloorRooms } from "@/lib/radr/spatial-live/fixtures";

const SEV: Record<LiveSeverity, string> = {
  healthy: "#00d978",
  watch: "#c9a05a",
  intervene: "#c86b5c",
  critical: "#c86b5c",
};

type HotelLens = "financial" | "operations" | "readiness" | "guest";
type Horizon = "now" | "30" | "60" | "120";

type Props = {
  propertyId: string;
  propertyLabel: string;
  floors: LiveEntity[];
  rooms: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  lens: HotelLens;
  horizon: Horizon;
};

function roomStroke(sev: LiveSeverity): string {
  return SEV[sev];
}

function floorY(index: number, total: number): number {
  const top = 48;
  const gap = 48;
  return top + (total - 1 - index) * gap;
}

/** Horizon shifts how many rooms look at-risk (deterministic). */
function horizonPressure(horizon: Horizon): number {
  if (horizon === "now") return 0;
  if (horizon === "30") return 1;
  if (horizon === "60") return 2;
  return 3;
}

export function VisionHotelOpsWorld({
  propertyId,
  propertyLabel,
  floors,
  rooms,
  selectedId,
  onSelect,
  lens,
  horizon,
}: Props) {
  const buildingFloors = useMemo(
    () => floors.filter((f) => f.type === "floor"),
    [floors],
  );
  const departments = useMemo(
    () => floors.filter((f) => f.type === "department"),
    [floors],
  );

  const defaultFloorId =
    buildingFloors.find((f) => f.severity === "intervene")?.id ??
    buildingFloors[0]?.id ??
    `${propertyId}__floor_7`;

  const selectedFloorId = useMemo(() => {
    if (selectedId?.includes("__floor_")) return selectedId;
    if (selectedId?.includes("__room_")) {
      const parent = rooms.find((r) => r.id === selectedId)?.parentId;
      if (parent) return parent;
    }
    return defaultFloorId;
  }, [selectedId, rooms, defaultFloorId]);

  const [mode, setMode] = useState<"building" | "plan">("building");
  const [activeFloorId, setActiveFloorId] = useState(selectedFloorId);

  useEffect(() => {
    setActiveFloorId(selectedFloorId);
  }, [selectedFloorId]);

  const activeFloor =
    buildingFloors.find((f) => f.id === activeFloorId) ?? buildingFloors[0];

  const floorRooms = useMemo(() => {
    const fromProp = rooms.filter((r) => r.parentId === activeFloorId);
    const base =
      fromProp.length > 0
        ? fromProp
        : activeFloorId
          ? hotelFloorRooms(activeFloorId)
          : [];
    const bump = horizonPressure(horizon);
    if (!bump) return base;
    return base.map((r, i) => {
      if (i >= base.length - bump) {
        return {
          ...r,
          severity: "intervene" as const,
          status: horizon === "120" ? "WAVE RISK" : "AT RISK",
        };
      }
      return r;
    });
  }, [rooms, activeFloorId, horizon]);

  const counts = useMemo(() => {
    const c = { ready: 0, risk: 0, inspect: 0, maintenance: 0 };
    for (const r of floorRooms) {
      if (r.severity === "healthy") c.ready += 1;
      else if (r.severity === "intervene" || r.severity === "critical")
        c.risk += 1;
      else if (r.status.toLowerCase().includes("inspect")) c.inspect += 1;
      else if (r.status.toLowerCase().includes("maint")) c.maintenance += 1;
      else c.inspect += 1;
    }
    return c;
  }, [floorRooms]);

  const decisionFloor =
    buildingFloors.find((f) => f.decisionIds[0]) ?? activeFloor;

  const selectFloor = (id: string, openPlan = false) => {
    setActiveFloorId(id);
    onSelect(id);
    if (openPlan) setMode("plan");
  };

  const lensLine =
    lens === "financial"
      ? "RevPAR · ADR · occupancy pressure"
      : lens === "readiness"
        ? "Room readiness · turn · inspect"
        : lens === "guest"
          ? "Arrival wave · VIP · desk queue"
          : "Housekeeping · floors · attendants";

  return (
    <div
      className="rv-live-svg-host rv-live-hotel"
      data-lens={lens}
      data-horizon={horizon}
      data-mode={mode}
    >
      <header className="rv-live-head">
        <div>
          <h1 className="rv-display">Hotel Operations</h1>
          <p>
            {lensLine} · {propertyLabel}
            {activeFloor ? ` · ${activeFloor.status}` : ""}
          </p>
        </div>
        <div
          className="rp-live3-seg rv-hotel-view-seg"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            data-active={mode === "building" ? "true" : undefined}
            onClick={() => setMode("building")}
          >
            Building
          </button>
          <button
            type="button"
            data-testid="hotel-floor-plan"
            data-active={mode === "plan" ? "true" : undefined}
            onClick={() => {
              setMode("plan");
              if (activeFloor) onSelect(activeFloor.id);
            }}
          >
            Floor plan
          </button>
        </div>
      </header>

      <div className="rv-hotel-layout">
        <aside className="rv-hotel-floors" aria-label="Floors">
          {buildingFloors.map((f) => (
            <button
              key={f.id}
              type="button"
              data-active={activeFloorId === f.id ? "true" : undefined}
              data-pressure={
                f.severity === "intervene" || f.severity === "critical"
                  ? "true"
                  : undefined
              }
              onClick={() => selectFloor(f.id, mode === "plan")}
            >
              {f.label}
            </button>
          ))}
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              data-active={selectedId === d.id ? "true" : undefined}
              data-pressure={
                d.severity === "watch" || d.severity === "intervene"
                  ? "true"
                  : undefined
              }
              onClick={() => onSelect(d.id)}
            >
              {d.label}
            </button>
          ))}
        </aside>

        <div className="rv-hotel-stage">
          <svg
            viewBox="0 0 640 600"
            role="img"
            aria-label={`${propertyLabel} building`}
          >
            <defs>
              <linearGradient id="rvHotelGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c211e" />
                <stop offset="100%" stopColor="#121512" />
              </linearGradient>
            </defs>
            <rect width="640" height="600" fill="#0c0d0c" />

            {mode === "building" ? (
              <g>
                {buildingFloors.map((f, i) => {
                  const active = f.id === activeFloorId;
                  const pull = active ? 36 : 0;
                  const pressure =
                    f.severity === "intervene" || f.severity === "critical";
                  const y = floorY(i, buildingFloors.length);
                  return (
                    <g
                      key={f.id}
                      transform={`translate(${120 + pull}, ${y})`}
                      style={{
                        transition:
                          "transform var(--rv-dur-panel, 320ms) var(--rv-ease, ease)",
                        cursor: "pointer",
                      }}
                      onClick={() => selectFloor(f.id, true)}
                    >
                      <path
                        d="M0 0 L280 0 L300 36 L20 36 Z"
                        fill={active ? "#1e2420" : "url(#rvHotelGlass)"}
                        stroke={
                          pressure
                            ? SEV.intervene
                            : active
                              ? SEV.healthy
                              : "rgba(255,255,255,0.1)"
                        }
                        strokeWidth={active ? 1.8 : 1}
                      />
                      <text
                        x="12"
                        y="22"
                        fill={active ? "#f2f0e8" : "rgba(242,240,232,0.45)"}
                        fontSize="11"
                      >
                        {f.label}
                      </text>
                      {pressure ? (
                        <circle cx="260" cy="18" r="4" fill={SEV.intervene} />
                      ) : null}
                      {Array.from({ length: 8 }).map((_, w) => (
                        <rect
                          key={w}
                          x={40 + w * 28}
                          y={10}
                          width="10"
                          height="12"
                          rx="1"
                          fill={
                            pressure && w % 3 === 0
                              ? "rgba(200,107,92,0.45)"
                              : "rgba(0,217,120,0.18)"
                          }
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            ) : (
              <g transform="translate(80, 80)">
                <rect
                  width="460"
                  height="420"
                  rx="8"
                  fill="#151916"
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x="16"
                  y="28"
                  fill="#f2f0e8"
                  fontSize="14"
                  fontWeight="560"
                >
                  {activeFloor?.label ?? "Floor"} · Rooms
                  {horizon !== "now" ? ` · ${horizon === "30" ? "+30m" : horizon === "60" ? "+60m" : "+120m"}` : ""}
                </text>
                {floorRooms.map((room, i) => {
                  const col = i % 5;
                  const row = Math.floor(i / 5);
                  const active = room.id === selectedId;
                  return (
                    <g
                      key={room.id}
                      transform={`translate(${30 + col * 84}, ${60 + row * 100})`}
                      style={{ cursor: "pointer" }}
                      onClick={() => onSelect(room.id)}
                    >
                      <rect
                        width="72"
                        height="72"
                        rx="6"
                        fill={active ? "#1e2420" : "#1a1e1b"}
                        stroke={roomStroke(room.severity)}
                        strokeWidth={active ? 2 : 1.4}
                      />
                      <text x="10" y="22" fill="#f2f0e8" fontSize="12">
                        {room.shortLabel ?? room.label}
                      </text>
                      <circle
                        cx="58"
                        cy="18"
                        r="4"
                        fill={roomStroke(room.severity)}
                      />
                      <text
                        x="10"
                        y="48"
                        fill="rgba(242,240,232,0.5)"
                        fontSize="9"
                      >
                        {room.status}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        <aside className="rv-hotel-rail rv-rail">
          <div className="rv-rail-block">
            <p className="rv-label">Floor readiness</p>
            <ul className="rv-hotel-counts">
              <li data-tone="pos">
                <strong>{counts.ready}</strong>
                <span>Ready</span>
              </li>
              <li data-tone="neg">
                <strong>{counts.risk}</strong>
                <span>At risk</span>
              </li>
              <li data-tone="watch">
                <strong>{counts.inspect}</strong>
                <span>Inspect</span>
              </li>
              <li>
                <strong>{counts.maintenance}</strong>
                <span>Maintenance</span>
              </li>
            </ul>
          </div>
          <div className="rv-rail-block">
            <p className="rv-label">Throughput</p>
            <p className="rv-hotel-stat">
              <strong className="rv-num">14</strong>
              <span>rooms / hour</span>
            </p>
            <p className="rv-hotel-stat">
              <strong className="rv-num">
                {HOTEL_LIVE_SCENARIO.roomsAtRisk}
              </strong>
              <span>arrival urgency</span>
            </p>
          </div>
          {decisionFloor?.decisionIds?.[0] ? (
            <div className="rv-decision-card">
              <p className="rv-label">Active decision</p>
              <h3>{decisionFloor.radrSees}</h3>
              <p>{decisionFloor.driver}</p>
              <div className="rv-decision-actions">
                <a
                  className="rv-btn"
                  data-primary="true"
                  href={`/app/decisions/${decisionFloor.decisionIds[0]}`}
                >
                  Approve &amp; Reassign
                </a>
                <a
                  className="rv-btn"
                  href={`/app/decisions/${decisionFloor.decisionIds[0]}`}
                >
                  View Simulation
                </a>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="rv-live-bottom rv-hotel-strip">
        <div className="rv-metric">
          <span className="rv-label">Property ready</span>
          <strong className="rv-num">
            {Math.round(
              (HOTEL_LIVE_SCENARIO.roomsReady /
                (HOTEL_LIVE_SCENARIO.roomsReady +
                  HOTEL_LIVE_SCENARIO.roomsAtRisk +
                  HOTEL_LIVE_SCENARIO.roomsCleaning)) *
                100,
            )}
            %
          </strong>
        </div>
        <div className="rv-metric">
          <span className="rv-label">At risk before check-in</span>
          <strong className="rv-num">{HOTEL_LIVE_SCENARIO.roomsAtRisk}</strong>
        </div>
        <div className="rv-metric">
          <span className="rv-label">Arrivals today</span>
          <strong className="rv-num">{HOTEL_LIVE_SCENARIO.arrivalsToday}</strong>
        </div>
        <div className="rv-metric">
          <span className="rv-label">Wave</span>
          <strong className="rv-num">{HOTEL_LIVE_SCENARIO.waveLabel}</strong>
        </div>
      </div>
    </div>
  );
}
