"use client";

/**
 * Hotel House Readiness — Daylight Operations command center.
 * Replaces broken SVG HotelServiceMapInstrument room grid.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  houseReadinessModel,
  roomStateLabel,
  roomTypeLabel,
  type HouseRoom,
} from "@/lib/radr/product/houseReadiness";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { FloorRow } from "./FloorRow";
import "./house-readiness.css";

type Tab = "readiness" | "arrivals" | "recovery";
type MapMode = "floors" | "list";

export function HouseReadinessShell() {
  const model = useMemo(() => houseReadinessModel(), []);
  const [tab, setTab] = useState<Tab>("readiness");
  const [mapMode, setMapMode] = useState<MapMode>("floors");
  const [typeFilter, setTypeFilter] = useState<"all" | HouseRoom["type"]>("all");
  const [selectedId, setSelectedId] = useState(model.selectedRoomId);
  const [applied, setApplied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  // Period for Operations is mapped by RoutePeriodSync — do not overwrite here.

  const rooms = useMemo(() => {
    if (typeFilter === "all") return model.rooms;
    return model.rooms.filter((r) => r.type === typeFilter);
  }, [model.rooms, typeFilter]);

  const selected =
    rooms.find((r) => r.id === selectedId) ??
    model.rooms.find((r) => r.id === selectedId) ??
    model.rooms.find((r) => r.id === model.selectedRoomId)!;

  const select = (id: string) => setSelectedId(id);

  return (
    <div className="hr-root" data-tab={tab} data-testid="house-readiness">
      <header className="hr-head">
        <div>
          <p className="hr-kicker">OPERATIONS</p>
          <h1>House readiness</h1>
          <p className="hr-head-sub">
            Empty room ≠ ready capacity. Departed → Cleaning → Inspection →
            Ready.
          </p>
        </div>
        <div className="hr-live-pill">
          <span>
            <i />
            LIVE · {model.clockLabel}
          </span>
          <em>
            {model.waveLabel} · Next arrivals {model.waveGuests} guests ·
            14:00–16:00
          </em>
        </div>
      </header>

      <div className="hr-tabs" role="tablist" aria-label="Operations views">
        {(
          [
            ["readiness", "READINESS"],
            ["arrivals", "ARRIVALS"],
            ["recovery", "RECOVERY"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            data-active={tab === id ? "true" : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="hr-kpis" aria-label="Readiness KPIs">
        {model.kpis.map((k) => (
          <div key={k.id} className="hr-kpi" data-tone={k.tone}>
            <span>{k.label}</span>
            <strong>{k.value}</strong>
            <em>{k.detail}</em>
            <i>{k.delta}</i>
          </div>
        ))}
      </section>

      {tab !== "readiness" ? (
        <div className="hr-empty-tab" role="status">
          {tab === "arrivals"
            ? "Arrivals view — next pass wires the 2-hour timeline, VIP, upgrades and front-office pressure on this same shell."
            : "Recovery view — next pass wires guest-experience protection, upgrades and Decision outcomes."}
        </div>
      ) : (
        <>
          <div className="hr-main">
            <section className="hr-map-card" aria-label="Floor readiness map">
              <div className="hr-map-head">
                <div>
                  <h2>Floor readiness map</h2>
                  <p>
                    Live room status across floors. Select a room to see details,
                    ETA and actions.
                  </p>
                </div>
                <div className="hr-map-controls">
                  <button
                    type="button"
                    data-active={mapMode === "floors" ? "true" : undefined}
                    onClick={() => setMapMode("floors")}
                  >
                    Floors
                  </button>
                  <button
                    type="button"
                    data-active={mapMode === "list" ? "true" : undefined}
                    onClick={() => setMapMode("list")}
                  >
                    List
                  </button>
                  <select
                    aria-label="Room type filter"
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as typeof typeFilter)
                    }
                  >
                    <option value="all">All room types</option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>

              {mapMode === "floors" ? (
                <div className="hr-floors">
                  {model.floors.map((floor) => (
                    <FloorRow
                      key={floor}
                      floor={floor}
                      rooms={rooms.filter((r) => r.floor === floor)}
                      selectedId={selectedId}
                      onSelect={select}
                      defaultOpen={floor <= 4}
                    />
                  ))}
                </div>
              ) : (
                <div className="hr-floor-grid" style={{ flexWrap: "wrap" }}>
                  {rooms
                    .filter((r) => r.state !== "occupied")
                    .map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        className="hr-room"
                        data-state={room.state}
                        data-selected={
                          selectedId === room.id ? "true" : undefined
                        }
                        data-room={room.number}
                        onClick={() => select(room.id)}
                      >
                        <span className="hr-room-num">{room.number}</span>
                        <span className="hr-room-dot" aria-hidden />
                      </button>
                    ))}
                </div>
              )}

              <ul className="hr-legend" aria-label="Room status legend">
                <li>
                  <i data-s="ready" /> Ready
                </li>
                <li>
                  <i data-s="cleaning" /> Cleaning
                </li>
                <li>
                  <i data-s="inspection" /> Inspection
                </li>
                <li>
                  <i data-s="dirty" /> Dirty
                </li>
                <li>
                  <i data-s="blocked" /> Blocked
                </li>
                <li>
                  <i data-s="vip">★</i> VIP Arrival
                </li>
              </ul>
            </section>

            <aside className="hr-rail" aria-label="Room and recommendation">
              <div className="hr-insp">
                <Image
                  src={selected.image}
                  alt=""
                  width={640}
                  height={240}
                  className="hr-insp-img"
                  priority
                />
                <div className="hr-insp-body">
                  <header>
                    <div>
                      <h2>Room {selected.number}</h2>
                      <p className="hr-insp-type">
                        {roomTypeLabel(selected.type)}
                        {selected.vip ? " · VIP" : ""}
                      </p>
                    </div>
                    <p
                      className="hr-insp-state"
                      data-state={selected.state}
                    >
                      {roomStateLabel(selected.state)}
                    </p>
                  </header>
                  <dl className="hr-insp-stats">
                    <div>
                      <dt>ETA to ready</dt>
                      <dd>
                        {selected.etaReadyMinutes != null
                          ? `${selected.etaReadyMinutes} min · ${selected.etaReady}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Assigned housekeeper</dt>
                      <dd>{selected.assignedHousekeeper ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Next arrival</dt>
                      <dd>
                        {selected.nextGuest
                          ? `${selected.nextGuest} · ${selected.nextArrivalAt}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Revenue impact</dt>
                      <dd>
                        {selected.revenueImpact
                          ? `€${selected.revenueImpact}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Source systems</dt>
                      <dd>PMS · Housekeeping</dd>
                    </div>
                  </dl>
                  <button type="button" className="hr-insp-cta">
                    View room details →
                  </button>
                </div>
              </div>

              <div className="hr-rec">
                <p className="hr-rec-k">RADR AI recommendation</p>
                <p className="hr-rec-conf">
                  Confidence {model.recommendation.confidence}%
                  <button
                    type="button"
                    style={{
                      marginLeft: 8,
                      border: 0,
                      background: "none",
                      color: "inherit",
                      font: "inherit",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => setWhyOpen((v) => !v)}
                  >
                    Why
                  </button>
                </p>
                <h3>{model.recommendation.body}</h3>
                {whyOpen ? (
                  <ul className="hr-rec-why">
                    {model.recommendation.why.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                    <li>
                      Evidence: {model.recommendation.evidence.join(" · ")}
                    </li>
                  </ul>
                ) : null}
                <div className="hr-rec-metrics">
                  <div>
                    <strong>{model.recommendation.roomsReady} rooms</strong>
                    <span>Expected ready</span>
                  </div>
                  <div>
                    <strong>
                      €{model.recommendation.valueProtected.toLocaleString("en-GB")}
                    </strong>
                    <span>Value protected</span>
                  </div>
                  <div>
                    <strong>−{model.recommendation.delayReductionMin} min</strong>
                    <span>Avg delay</span>
                  </div>
                </div>
                <p className="hr-rec-meta">
                  Prepared by {model.recommendation.preparedBy} ·{" "}
                  <Link
                    href={`/app/decisions/${model.recommendation.decisionId}`}
                  >
                    {displayDecisionId(model.recommendation.decisionId)}
                  </Link>
                </p>
                {confirmOpen && !applied ? (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ margin: "0 0 8px", fontSize: 12.5 }}>
                      Open existing Decision{" "}
                      {displayDecisionId(model.recommendation.decisionId)} —
                      Reassign 2 housekeepers · up to €1,840 · 81%?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="hr-insp-cta"
                        onClick={() => setConfirmOpen(false)}
                      >
                        Cancel
                      </button>
                      <Link
                        href={`/app/decisions?decision=${model.recommendation.decisionId}`}
                        className="hr-rec-apply"
                        onClick={() => {
                          setApplied(true);
                          setConfirmOpen(false);
                        }}
                      >
                        Open Decision
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="hr-rec-apply"
                    data-done={applied ? "true" : undefined}
                    onClick={() => {
                      if (applied) return;
                      setConfirmOpen(true);
                    }}
                  >
                    {applied
                      ? "Opened D-H-9201 · up to €1,840"
                      : "Apply suggestion →"}
                  </button>
                )}
              </div>

              <div className="hr-arrivals">
                <div className="hr-arrivals-h">
                  <h3>Next arrivals</h3>
                  <button type="button" onClick={() => setTab("arrivals")}>
                    View all ({model.arrivalsToday})
                  </button>
                </div>
                <ul>
                  {model.arrivals.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        data-active={
                          selectedId === a.roomId ? "true" : undefined
                        }
                        onClick={() => select(a.roomId)}
                      >
                        <time>{a.scheduledAt}</time>
                        <span>
                          <strong>{a.guestName}</strong>
                          <em>
                            {a.roomNumber} · {roomTypeLabel(a.roomType)}
                          </em>
                        </span>
                        {a.vip ? <span className="hr-vip">VIP</span> : <span />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          <div className="hr-bottom">
            <section className="hr-panel">
              <h3>Readiness by hour</h3>
              <p className="hr-panel-sub">Rooms ready vs due (cumulative)</p>
              <svg
                className="hr-chart"
                viewBox="0 0 360 120"
                role="img"
                aria-label="Readiness by hour chart"
              >
                {model.byHour.map((row, i) => {
                  const x = 16 + i * 26;
                  const dueH = (row.due / 42) * 88;
                  const readyH = (row.ready / 42) * 88;
                  const isNow = row.hour === "14:00";
                  return (
                    <g key={row.hour}>
                      <rect
                        x={x}
                        y={100 - dueH}
                        width="10"
                        height={dueH}
                        rx="2"
                        fill="#e4e8e5"
                      />
                      <rect
                        x={x}
                        y={100 - readyH}
                        width="10"
                        height={readyH}
                        rx="2"
                        fill="#00a85a"
                        opacity={0.85}
                      />
                      {isNow ? (
                        <line
                          x1={x + 5}
                          y1="8"
                          x2={x + 5}
                          y2="108"
                          stroke="#07533f"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      ) : null}
                      {i % 2 === 0 ? (
                        <text
                          x={x + 5}
                          y="116"
                          textAnchor="middle"
                          fontSize="7"
                          fill="#8a928d"
                        >
                          {row.hour.slice(0, 2)}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
                <text x="16" y="12" fontSize="8" fill="#07533f" fontWeight="600">
                  NOW {model.clockLabel}
                </text>
              </svg>
            </section>

            <section className="hr-panel">
              <h3>Rooms at risk</h3>
              <p className="hr-panel-sub">View all ({model.gap})</p>
              <ul className="hr-risk-list">
                {model.risks.map((r) => (
                  <li key={r.roomId}>
                    <button type="button" onClick={() => select(r.roomId)}>
                      <strong>{r.roomNumber}</strong>
                      <span>
                        {r.reason} · {r.delayMinutes} min
                        <br />
                        Arrival {r.arrivalAt}
                      </span>
                      <em>€{r.exposure}</em>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="hr-panel">
              <h3>Arrival readiness by room type</h3>
              <p className="hr-panel-sub">Ready / due</p>
              <ul className="hr-type-list">
                {model.byType.map((t) => {
                  const pct = Math.round((t.ready / t.due) * 100);
                  return (
                    <li key={t.type}>
                      <span>{t.label}</span>
                      <span className="hr-type-bar" aria-hidden>
                        <i style={{ width: `${pct}%` }} />
                      </span>
                      <strong>
                        {t.ready}/{t.due}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="hr-panel">
              <h3>Housekeeping &amp; inspection</h3>
              <p className="hr-panel-sub">Capacity · not surveillance</p>
              <ul className="hr-cap-list">
                <li>
                  <span>Housekeepers on shift</span>
                  <strong>
                    {model.capacity.housekeepersOn} /{" "}
                    {model.capacity.housekeepersShift}
                  </strong>
                </li>
                <li>
                  <span>Inspection staff</span>
                  <strong>
                    {model.capacity.inspectorsOn} /{" "}
                    {model.capacity.inspectorsShift}
                  </strong>
                </li>
                <li>
                  <span>Inspection backlog</span>
                  <strong>{model.capacity.inspectionBacklog} rooms</strong>
                </li>
                <li>
                  <span>Avg clean / inspect</span>
                  <strong>
                    {model.capacity.avgCleanMin}m / {model.capacity.avgInspectMin}
                    m
                  </strong>
                </li>
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
