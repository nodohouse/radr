"use client";

/**
 * Hotel Live — Daylight property digital twin.
 * PASS 3: URL · PASS 4: actions · PASS 5: time scrub · PASS 6: HK mode
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  floorStatusCounts,
  formatClock,
  HOTEL_LIVE_NOW_MINUTES,
  HOTEL_LIVE_PROPERTY_SLUG,
  hotelLiveEstateModel,
  hotelLiveGuestCards,
  hotelLiveIncidents,
  hotelLivePropertyModel,
  parseLevel,
  parseMode,
  parseTimeOffset,
  roomAtOffset,
  roomStateLabel,
  waveReadyAtOffset,
  type HotelEstateProperty,
  type HotelLiveLevel,
  type HotelLiveMode,
  type HotelLiveRoom,
  type HotelLiveTimeOffset,
  type LiveRoomState,
} from "@/lib/radr/product/hotelLive";
import {
  clampLiveZoom,
  validateSpatialAnchors,
  type SpatialAnchor,
} from "@/lib/radr/live/spatialCamera";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import "./hotel-live.css";
import { guestSignals, signalDescription } from "@/lib/product/guestSignals";
import { hotelGuestNeeds } from "@/lib/product/hotelGuestNeeds";
import { RoomGuestBrief } from "./RoomGuestBrief";

type StatusFilter = "all" | LiveRoomState;
type ViewLens = "operational" | "financial" | "readiness" | "guest";

const MODES: { id: HotelLiveMode; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "housekeeping", label: "Housekeeping" },
  { id: "arrivals", label: "Arrivals" },
  { id: "guests", label: "Guests" },
  { id: "staff", label: "Staff" },
  { id: "incidents", label: "Incidents" },
];

const TIME_SCRUBS: { id: HotelLiveTimeOffset; label: string }[] = [
  { id: 0, label: "NOW" },
  { id: 30, label: "+30" },
  { id: 60, label: "+60" },
  { id: 120, label: "+120" },
];

export function HotelLiveShell() {
  const model = useMemo(() => hotelLivePropertyModel(), []);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const estate = useMemo(() => hotelLiveEstateModel(), []);
  const urlFloor = Number(search.get("floor") || model.selectedFloor);
  const urlRoom = search.get("room");
  const urlMode = parseMode(search.get("mode"));
  const urlTime = parseTimeOffset(search.get("time"));
  const urlLevel = parseLevel(search.get("level"));

  const [level, setLevel] = useState<HotelLiveLevel>(urlLevel);
  const [estateSelectedId, setEstateSelectedId] = useState<string>(
    "loc_canal_house",
  );
  const [mode, setMode] = useState<HotelLiveMode>(urlMode);
  const [floor, setFloor] = useState(
    Number.isFinite(urlFloor) && urlFloor >= 1 && urlFloor <= 8
      ? urlFloor
      : model.selectedFloor,
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (urlRoom) return `room_${urlRoom}`;
    return model.selectedRoomId;
  });
  const [waveHorizon, setWaveHorizon] = useState<"today" | "tomorrow" | "7d">(
    "today",
  );
  const [timeOffset, setTimeOffset] = useState<HotelLiveTimeOffset>(urlTime);
  const [viewLens, setViewLens] = useState<ViewLens>("operational");
  const [zoom, setZoom] = useState(1);
  const [prioritized, setPrioritized] = useState<Record<string, boolean>>({});
  const [confirmPrioritize, setConfirmPrioritize] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const planRef = useRef<HTMLDivElement | null>(null);
  const debugGeometry = search.get("debugGeometry") === "1";

  const writeUrl = useCallback(
    (next: {
      level?: HotelLiveLevel;
      floor?: number;
      room?: string | null;
      mode?: HotelLiveMode;
      time?: HotelLiveTimeOffset;
      property?: string;
    }) => {
      const params = new URLSearchParams(search.toString());
      const lv = next.level ?? level;
      params.set("level", lv);
      params.set(
        "property",
        next.property ??
          (lv === "estate" ? "northstar" : HOTEL_LIVE_PROPERTY_SLUG),
      );
      if (lv === "estate") {
        params.delete("floor");
        params.delete("room");
        params.delete("mode");
        params.delete("time");
      } else {
        const f = next.floor ?? floor;
        params.set("floor", String(f));
        const m = next.mode ?? mode;
        if (m === "rooms") params.delete("mode");
        else params.set("mode", m);
        const t = next.time ?? timeOffset;
        if (t === 0) params.delete("time");
        else params.set("time", `+${t}`);
        if (next.room === null) params.delete("room");
        else if (next.room !== undefined) params.set("room", next.room);
        else if (selectedId) {
          params.set("room", selectedId.replace(/^room_/, ""));
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [floor, level, mode, pathname, router, search, selectedId, timeOffset],
  );

  // Seed canonical URL once on mount.
  useEffect(() => {
    const params = new URLSearchParams(search.toString());
    if (params.get("level")) return;
    params.set("level", "property");
    params.set("property", HOTEL_LIVE_PROPERTY_SLUG);
    params.set("floor", String(model.selectedFloor));
    params.set("room", "310");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount seed only
  }, []);

  useEffect(() => {
    const el = planRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      /* Chrome width changed — keep zoom; stage % layout reflows without mutating world. */
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [level]);

  // Follow browser back/forward.
  useEffect(() => {
    if (!search.get("level")) return;
    setLevel(parseLevel(search.get("level")));
    const f = Number(search.get("floor") || model.selectedFloor);
    if (Number.isFinite(f) && f >= 1 && f <= 8) setFloor(f);
    setMode(parseMode(search.get("mode")));
    setTimeOffset(parseTimeOffset(search.get("time")));
    const r = search.get("room");
    setSelectedId(r ? `room_${r}` : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL sync
  }, [search]);

  const liveRooms = useMemo(
    () =>
      model.rooms.map((r) => {
        let forecast = roomAtOffset(r, timeOffset);
        if (simulating && (r.state === "dirty" || r.state === "cleaning")) {
          forecast = {
            ...forecast,
            state: "ready",
            priority: "normal",
            cleaningMinutes: null,
          };
        }
        if (prioritized[r.id] && forecast.state !== "ready") {
          return {
            ...forecast,
            priority: "high" as const,
            expectedReadyAt: forecast.expectedReadyAt ?? "14:58",
          };
        }
        return forecast;
      }),
    [model.rooms, prioritized, simulating, timeOffset],
  );

  const waveSnap = useMemo(
    () => waveReadyAtOffset(model.wave, timeOffset),
    [model.wave, timeOffset],
  );

  const floorRooms = useMemo(
    () => liveRooms.filter((r) => r.floor === floor),
    [liveRooms, floor],
  );
  const counts = useMemo(() => floorStatusCounts(floorRooms), [floorRooms]);
  const visible = useMemo(() => {
    let list =
      statusFilter === "all"
        ? floorRooms
        : floorRooms.filter((r) => r.state === statusFilter);
    if (mode === "arrivals") {
      list = list.filter((r) => r.arrivalAt || r.priority === "high");
    }
    if (mode === "incidents") {
      list = list.filter(
        (r) => r.state === "ooo" || r.priority === "high" || r.state === "dirty",
      );
    }
    if (mode === "guests") {
      list = list.filter((r) => r.vip || r.guestName);
    }
    return list;
  }, [floorRooms, statusFilter, mode]);

  const selected =
    visible.find((r) => r.id === selectedId) ??
    floorRooms.find((r) => r.id === selectedId) ??
    null;
  const floorMeta = model.floors.find((f) => f.id === floor);
  const isForecast = timeOffset > 0;
  const clockLabel = isForecast
    ? formatClock(HOTEL_LIVE_NOW_MINUTES + timeOffset)
    : model.clockLabel;

  const selectFloor = (f: number) => {
    setFloor(f);
    const still = selectedId
      ? liveRooms.find((r) => r.id === selectedId && r.floor === f)
      : null;
    if (!still) {
      setSelectedId(null);
      writeUrl({ floor: f, room: null });
    } else {
      writeUrl({ floor: f });
    }
  };

  useEffect(() => {
    const active = document.querySelector<HTMLElement>(
      ".hl-floor-rail button.is-active",
    );
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [floor]);

  const selectRoom = (id: string) => {
    const room = liveRooms.find((r) => r.id === id);
    if (!room) return;
    setSelectedId(id);
    setFloor(room.floor);
    writeUrl({ floor: room.floor, room: room.number });
  };

  const clearRoom = () => {
    setSelectedId(null);
    writeUrl({ room: null });
  };

  const changeMode = (m: HotelLiveMode) => {
    setMode(m);
    if (m === "housekeeping" || m === "arrivals" || m === "guests" || m === "incidents") {
      setStatusFilter("all");
    }
    if (m === "guests" || m === "incidents" || m === "staff") {
      setSelectedId(null);
      writeUrl({ mode: m, room: null });
      return;
    }
    writeUrl({ mode: m });
  };

  const changeTime = (t: HotelLiveTimeOffset) => {
    setTimeOffset(t);
    writeUrl({ time: t });
  };

  const enterProperty = (prop: HotelEstateProperty) => {
    setLevel("property");
    setEstateSelectedId(prop.id);
    const isHero =
      prop.slug === HOTEL_LIVE_PROPERTY_SLUG ||
      prop.slug === "mercer-house" ||
      prop.slug === "canal-house";
    setFloor(isHero ? 3 : 1);
    setSelectedId(isHero ? "room_310" : null);
    writeUrl({
      level: "property",
      property: prop.slug,
      floor: isHero ? 3 : 1,
      room: isHero ? "310" : null,
    });
  };

  const goEstate = () => {
    setLevel("estate");
    writeUrl({ level: "estate" });
  };

  const guestCards = useMemo(
    () => hotelLiveGuestCards(floorRooms),
    [floorRooms],
  );
  const incidents = useMemo(
    () => hotelLiveIncidents(floorRooms),
    [floorRooms],
  );
  const estateProp =
    estate.properties.find((p) => p.id === estateSelectedId) ??
    estate.properties[0]!;

  return (
    <div
      className="hl-root"
      data-page="hotel-live"
      data-level={level}
      data-mode={mode}
      data-forecast={isForecast ? "true" : undefined}
    >
      <header className="hl-top">
        <div>
          <div className="hl-live-row">
            <Link href="/app/live/plan" className="lp-hotel-entry">Build your property</Link>
            <div
              className="hl-live-pill"
              data-forecast={isForecast ? "true" : undefined}
            >
              <i />
              {isForecast ? `FORECAST · ${clockLabel}` : `LIVE · ${clockLabel}`}
            </div>
            <div
              className="hl-level-quiet"
              role="tablist"
              aria-label="Live level"
            >
              <button
                type="button"
                role="tab"
                aria-selected={level === "estate"}
                className={level === "estate" ? "is-active" : undefined}
                onClick={goEstate}
              >
                Estate
              </button>
              <span aria-hidden>/</span>
              <button
                type="button"
                role="tab"
                aria-selected={level === "property"}
                className={level === "property" ? "is-active" : undefined}
                onClick={() => {
                  setLevel("property");
                  writeUrl({
                    level: "property",
                    property: HOTEL_LIVE_PROPERTY_SLUG,
                  });
                }}
              >
                Property
              </button>
            </div>
          </div>
          <h1 className="hl-title">
            {level === "estate" ? estate.orgLabel : "Property live"}
          </h1>
          <p className="hl-sub">
            {level === "estate"
              ? "Where pressure is building across the portfolio."
              : "Live hotel operations. Rooms. People. Readiness."}
          </p>
          {level === "property"?<div className="guest-signal-legend"><span>! Allergy</span><span>★ Occasion</span><span>≡ Booking notes</span><span>Dashed = next stay</span></div>:null}
        </div>
        <div className="hl-kpis" aria-label="Live metrics">
          {level === "estate" ? (
            <>
              <button type="button" className="hl-kpi">
                <em>Properties</em>
                <strong>{estate.properties.length}</strong>
                <span>live</span>
              </button>
              <button type="button" className="hl-kpi" data-tone="neg">
                <em>At risk</em>
                <strong>{estate.atRisk}</strong>
                <span>arrivals</span>
              </button>
              <button type="button" className="hl-kpi" data-tone="neg">
                <em>Exposure</em>
                <strong>€{estate.exposureEuro.toLocaleString("en-GB")}</strong>
                <span>portfolio</span>
              </button>
              <button type="button" className="hl-kpi">
                <em>Needs you</em>
                <strong>4</strong>
                <span>decisions</span>
              </button>
              <button type="button" className="hl-kpi">
                <em>Handling</em>
                <strong>3</strong>
                <span>in motion</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" className="hl-kpi">
                <em>Occupancy</em>
                <strong>{model.occupancyPct}%</strong>
                <span>
                  {model.occupied} / {model.totalRooms} rooms
                </span>
              </button>
              <button
                type="button"
                className="hl-kpi"
                data-tone="neg"
                onClick={() => {
                  changeMode("rooms");
                  setStatusFilter("all");
                }}
              >
                <em>Ready now</em>
                <strong>
                  {simulating
                    ? 35
                    : isForecast
                      ? waveSnap.ready
                      : model.ready}{" "}
                  / {model.due}
                </strong>
                <span className="hl-risk">
                  {simulating
                    ? "3 at risk"
                    : isForecast
                      ? `${Math.max(0, model.due - waveSnap.ready)} gap`
                      : `${model.atRisk} at risk`}
                </span>
              </button>
              <button
                type="button"
                className="hl-kpi"
                onClick={() => changeMode("arrivals")}
              >
                <em>Arrivals today</em>
                <strong>{model.arrivalsToday}</strong>
                <span>15:00 wave</span>
              </button>
              <button
                type="button"
                className="hl-kpi"
                onClick={() => changeMode("guests")}
              >
                <em>In house</em>
                <strong>{model.inHouse}</strong>
                <span>guests</span>
              </button>
              <Link
                href="/app/intelligence?module=room_readiness&stay=1"
                className="hl-kpi"
                data-tone="neg"
              >
                <em>Exposure</em>
                <strong>
                  €
                  {(simulating ? 360 : model.exposureEuro).toLocaleString(
                    "en-GB",
                  )}
                </strong>
                <span>{simulating ? "SIMULATION" : "if unchanged"}</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {level === "property" ? (
        <div className="hl-modes" role="tablist" aria-label="Live modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? "is-active" : undefined}
              onClick={() => changeMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}

      {level === "estate" ? (
        <div className="hl-body" data-inspector="true">
          <section className="hl-map-card" aria-label="Estate map">
            <div className="hl-map-head">
              <h2>
                ESTATE{" "}
                <span>({estate.properties.length} properties)</span>
              </h2>
              <span>Pressure · exposure · active Decisions</span>
            </div>
            <EstateMap
              properties={estate.properties}
              selectedId={estateSelectedId}
              onSelect={setEstateSelectedId}
              onEnter={enterProperty}
            />
          </section>
          <EstateInspector
            property={estateProp}
            onEnter={() => enterProperty(estateProp)}
          />
        </div>
      ) : (
      <>
      <div className="hl-toolbar">
        <div className="hl-floor-nav">
          <button
            type="button"
            aria-label="Higher floor"
            onClick={() => selectFloor(Math.min(8, floor + 1))}
          >
            ←
          </button>
          <strong>Floor {floor}</strong>
          <button
            type="button"
            aria-label="Lower floor"
            onClick={() => selectFloor(Math.max(1, floor - 1))}
          >
            →
          </button>
        </div>
        <div className="hl-filters" aria-label="Room status filters">
          {(
            [
              ["all", `All rooms ${counts.all}`, undefined],
              ["dirty", `Dirty ${counts.dirty}`, "dirty"],
              ["cleaning", `In cleaning ${counts.cleaning}`, "cleaning"],
              ["ready", `Ready ${counts.ready}`, "ready"],
              ["ooo", `Out of order ${counts.ooo}`, undefined],
            ] as const
          ).map(([id, label, tone]) => (
            <button
              key={id}
              type="button"
              data-tone={tone}
              className={statusFilter === id ? "is-active" : undefined}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hl-toolbar-tools">
          <label className="hl-view-select">
            <span>View</span>
            <select
              value={viewLens}
              aria-label="View lens"
              onChange={(e) => setViewLens(e.target.value as ViewLens)}
            >
              <option value="operational">Operational</option>
              <option value="financial">Financial</option>
              <option value="readiness">Readiness</option>
              <option value="guest">Guest</option>
            </select>
          </label>
          <button
            type="button"
            className="hl-icon-btn"
            aria-label="Zoom in"
            onClick={() =>
              setZoom((z) => clampLiveZoom(+(z + 0.12).toFixed(2)))
            }
          >
            +
          </button>
          <button
            type="button"
            className="hl-icon-btn"
            aria-label="Zoom out"
            onClick={() =>
              setZoom((z) => clampLiveZoom(+(z - 0.12).toFixed(2)))
            }
          >
            −
          </button>
          <button
            type="button"
            className="hl-icon-btn"
            aria-label="Fit floor"
            onClick={() => setZoom(1)}
          >
            Fit
          </button>
        </div>
      </div>

      {actionNote ? (
        <div className="hl-toast" role="status">
          {actionNote}
        </div>
      ) : null}

      <div className="hl-body" data-inspector={selected ? "true" : "false"}>
        <section className="hl-map-card" aria-label="Floor plan">
          <div className="hl-map-head">
            <h2>
              FLOOR {floor}{" "}
              <span>
                ({floorRooms.length} rooms
                {floorMeta
                  ? mode === "housekeeping"
                    ? ` · ${floorMeta.behind} behind · ${floorMeta.cleaning} cleaning`
                    : ` · ${floorMeta.behind} behind`
                  : ""}
                )
              </span>
            </h2>
            <span>
              {mode === "rooms"
                ? viewLens === "operational"
                  ? "Operational view"
                  : `${viewLens[0]!.toUpperCase()}${viewLens.slice(1)} lens`
                : mode === "housekeeping"
                  ? "Housekeeping load"
                  : mode === "arrivals"
                    ? "Arrival readiness"
                    : mode === "staff"
                      ? "Capacity by function"
                      : mode === "incidents"
                        ? "Exceptions"
                        : "Guest impact"}
            </span>
          </div>
          <div
            className="hl-plan"
            ref={planRef}
            data-mode={mode}
            data-lens={viewLens}
            data-debug-geometry={debugGeometry ? "1" : undefined}
            style={{ ["--hl-zoom" as string]: String(zoom) }}
          >
            {mode === "staff" ? (
              <StaffCapacity />
            ) : (
              <FloorPlan
                rooms={visible}
                selectedId={selected?.id ?? null}
                onSelect={selectRoom}
                mode={mode}
                viewLens={viewLens}
                zoom={zoom}
                debugGeometry={debugGeometry}
              />
            )}
          </div>
          <nav className="hl-floor-rail" aria-label="Floors">
            {model.floors.map((f) => (
              <button
                key={f.id}
                type="button"
                className={floor === f.id ? "is-active" : undefined}
                onClick={() => selectFloor(f.id)}
              >
                {f.short}
                <em>{f.roomCount}</em>
              </button>
            ))}
          </nav>
        </section>

        {selected ? (
          <RoomInspector
            room={selected}
            decisionId={model.activeDecisionId}
            prioritized={Boolean(prioritized[selected.id])}
            simulating={simulating}
            onClose={clearRoom}
            onPrioritize={() => setConfirmPrioritize(true)}
            onReassign={() => setReassignOpen(true)}
            onPreviewImpact={() => setSimulating((s) => !s)}
          />
        ) : mode === "guests" ? (
          <GuestsPanel
            guests={guestCards}
            onSelectRoom={(num) => selectRoom(`room_${num}`)}
          />
        ) : mode === "incidents" ? (
          <IncidentsPanel
            incidents={incidents}
            onSelectRoom={(num) => selectRoom(`room_${num}`)}
          />
        ) : null}
      </div>

      <ArrivalWave
        model={model}
        horizon={waveHorizon}
        onHorizon={setWaveHorizon}
        timeOffset={timeOffset}
        onScrub={changeTime}
        waveSnap={waveSnap}
      />
      </>
      )}

      {confirmPrioritize && selected ? (
        <div className="hl-modal" role="dialog" aria-modal="true">
          <div className="hl-modal-card">
            <h3>Prioritize Room {selected.number}?</h3>
            <p>
              This will move Room {selected.number} ahead of lower-priority
              housekeeping work.
            </p>
            <ul>
              <li>
                Ready by {selected.expectedReadyAt ?? "14:58"}
              </li>
              <li>22 min buffer before arrival</li>
              <li>€{selected.exposureEuro || 280} exposure protected</li>
            </ul>
            <div className="hl-modal-actions">
              <button
                type="button"
                className="hl-btn-secondary"
                onClick={() => setConfirmPrioritize(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hl-btn-primary"
                onClick={() => {
                  setPrioritized((p) => ({ ...p, [selected.id]: true }));
                  setConfirmPrioritize(false);
                  setActionNote(
                    `Room ${selected.number} prioritized — still ${roomStateLabel(selected.state).toLowerCase()}, not marked Ready.`,
                  );
                  window.setTimeout(() => setActionNote(null), 3200);
                }}
              >
                Prioritize
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reassignOpen && selected ? (
        <div className="hl-sheet" role="dialog" aria-modal="true">
          <div className="hl-sheet-card">
            <header>
              <h3>Reassign staff</h3>
              <button
                type="button"
                className="hl-insp-close"
                aria-label="Close"
                onClick={() => setReassignOpen(false)}
              >
                ×
              </button>
            </header>
            <p>
              Move one housekeeper from Floor 2 → Floor {selected.floor}
            </p>
            <ul>
              <li>Room {selected.number} ready 17m earlier</li>
              <li>2 other arrival rooms improved</li>
              <li>Confidence: 84%</li>
            </ul>
            <p className="hl-sheet-note">
              Links to {displayDecisionId(model.activeDecisionId)} · approval
              required by policy.
            </p>
            <div className="hl-modal-actions">
              <button
                type="button"
                className="hl-btn-secondary"
                onClick={() => setReassignOpen(false)}
              >
                Cancel
              </button>
              <Link
                href={`/app/decisions?decision=${model.activeDecisionId}`}
                className="hl-btn-primary"
              >
                Request approval
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StaffCapacity() {
  const rows = [
    {
      fn: "Housekeeping",
      scheduled: 12,
      available: 3,
      busy: 8,
      tone: "watch" as const,
      note: "Under-capacity · Floor 3",
    },
    {
      fn: "Front Office",
      scheduled: 4,
      available: 1,
      busy: 3,
      tone: "ok" as const,
      note: "Check-in wave covered",
    },
    {
      fn: "Maintenance",
      scheduled: 2,
      available: 0,
      busy: 2,
      tone: "neg" as const,
      note: "Under-capacity · AC ticket open",
    },
    {
      fn: "Porter / Bell",
      scheduled: 3,
      available: 2,
      busy: 1,
      tone: "ok" as const,
      note: "Available",
    },
    {
      fn: "Guest Services",
      scheduled: 2,
      available: 1,
      busy: 1,
      tone: "ok" as const,
      note: "Available",
    },
  ];
  return (
    <div className="hl-staff" aria-label="Staff capacity">
      <p className="hl-staff-lead">
        Capacity by function · no personal location tracking
      </p>
      {rows.map((r) => (
        <article key={r.fn} data-tone={r.tone}>
          <strong>{r.fn}</strong>
          <span>
            {r.scheduled} scheduled · {r.available} available · {r.busy} busy
          </span>
          <em>{r.note}</em>
        </article>
      ))}
    </div>
  );
}

function GuestsPanel({
  guests,
  onSelectRoom,
}: {
  guests: ReturnType<typeof hotelLiveGuestCards>;
  onSelectRoom: (room: string) => void;
}) {
  return (
    <aside className="hl-inspector hl-mode-panel" aria-label="Guests">
      <div className="hl-insp-body">
        <h2>Guests</h2>
        <p className="hl-insp-meta">
          VIP · recovery · special requests · operational only
        </p>
        <ul className="hl-list">
          {guests.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => onSelectRoom(g.room)}>
                <strong>
                  {g.name}
                  {g.vip ? " · VIP" : ""}
                </strong>
                <span>
                  Room {g.room}
                  {g.arrivalAt ? ` · ${g.arrivalAt}` : ""}
                </span>
                <em>{g.note}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function IncidentsPanel({
  incidents,
  onSelectRoom,
}: {
  incidents: ReturnType<typeof hotelLiveIncidents>;
  onSelectRoom: (room: string) => void;
}) {
  return (
    <aside className="hl-inspector hl-mode-panel" aria-label="Incidents">
      <div className="hl-insp-body">
        <h2>Incidents</h2>
        <p className="hl-insp-meta">
          Maintenance · recovery · readiness exceptions
        </p>
        <ul className="hl-list">
          {incidents.map((inc) => (
            <li key={inc.id} data-tone={inc.tone}>
              <button type="button" onClick={() => onSelectRoom(inc.room)}>
                <strong>
                  Room {inc.room} · {inc.title}
                </strong>
                <span>{inc.detail}</span>
                <em>
                  {inc.nextArrival ? `Next arrival ${inc.nextArrival} · ` : ""}€
                  {inc.exposureEuro} · {inc.action}
                </em>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function EstateMap({
  properties,
  selectedId,
  onSelect,
  onEnter,
}: {
  properties: HotelEstateProperty[];
  selectedId: string;
  onSelect: (id: string) => void;
  onEnter: (p: HotelEstateProperty) => void;
}) {
  return (
    <div className="hl-estate">
      <svg
        className="hl-estate-svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Hotel estate map"
      >
        <defs>
          <radialGradient id="hlEstGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(0,168,90,0.12)" />
            <stop offset="100%" stopColor="rgba(247,250,248,0)" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#hlEstGlow)" />
        <path
          d="M8 70 C22 55, 38 58, 50 48 S78 30, 92 38"
          fill="none"
          stroke="rgba(10,13,11,0.08)"
          strokeWidth="1.2"
        />
        <path
          d="M10 40 C28 28, 45 34, 60 26 S85 22, 94 30"
          fill="none"
          stroke="rgba(10,13,11,0.06)"
          strokeWidth="1"
        />
        {properties.map((p) => {
          const selected = p.id === selectedId;
          return (
            <g
              key={p.id}
              className="hl-estate-node"
              data-tone={p.tone}
              data-selected={selected ? "true" : undefined}
              tabIndex={0}
              role="button"
              aria-label={`${p.name}, ${p.city}, ${p.status}, €${p.exposureEuro} exposure`}
              onClick={() => onSelect(p.id)}
              onDoubleClick={() => onEnter(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onEnter(p);
              }}
            >
              <circle className="hl-estate-dot" cx={p.x} cy={p.y} r={selected ? 3.2 : 2.4} />
              <text x={p.x + 4} y={p.y - 1} className="hl-estate-label">
                {p.name}
              </text>
              <text x={p.x + 4} y={p.y + 3.5} className="hl-estate-meta">
                {p.occupancyPct}% · €{p.exposureEuro}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EstateInspector({
  property,
  onEnter,
}: {
  property: HotelEstateProperty;
  onEnter: () => void;
}) {
  return (
    <aside className="hl-inspector" aria-label={property.name}>
      <div className="hl-insp-body">
        <div className="hl-insp-title-row">
          <h2>{property.name}</h2>
          <span className="hl-badge" data-tone={property.tone === "neg" ? "dirty" : property.tone === "watch" ? "cleaning" : "ready"}>
            {property.status}
          </span>
        </div>
        <p className="hl-insp-meta">{property.city}</p>
        <div className="hl-metric-grid">
          <article>
            <em>Occupancy</em>
            <strong>{property.occupancyPct}%</strong>
          </article>
          <article>
            <em>Ready</em>
            <strong>
              {property.ready}/{property.due}
            </strong>
          </article>
          <article data-tone={property.atRisk > 2 ? "high" : undefined}>
            <em>At risk</em>
            <strong>{property.atRisk}</strong>
          </article>
        </div>
        <div className="hl-guest-card">
          <em>Constraint</em>
          <strong>{property.driver}</strong>
          <span>Exposure €{property.exposureEuro.toLocaleString("en-GB")}</span>
        </div>
        {property.decisionId ? (
          <Link
            href={`/app/decisions?decision=${property.decisionId}`}
            className="hl-decision-link"
          >
            <em>Active Decision</em>
            <strong>
              {displayDecisionId(property.decisionId)} · Reassign 2 HK
            </strong>
          </Link>
        ) : null}
        <div className="hl-actions">
          <button type="button" className="hl-btn-primary" onClick={onEnter}>
            Enter Property
          </button>
        </div>
      </div>
    </aside>
  );
}

function roomIcon(room: HotelLiveRoom, mode: HotelLiveMode, viewLens: ViewLens) {
  if (viewLens === "financial" && room.exposureEuro > 0) return "€";
  if (mode === "housekeeping" && room.assigned) return "HK";
  switch (room.state) {
    case "dirty":
      return "!";
    case "cleaning":
      return "◇";
    case "inspection":
      return "◎";
    case "ooo":
      return "⊘";
    case "ready":
      return "▣";
    default:
      return "·";
  }
}

function FloorPlan({
  rooms,
  selectedId,
  onSelect,
  mode,
  viewLens,
  zoom,
  debugGeometry = false,
}: {
  rooms: HotelLiveRoom[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mode: HotelLiveMode;
  viewLens: ViewLens;
  zoom: number;
  debugGeometry?: boolean;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const anchors: SpatialAnchor[] = rooms.map((room) => ({
      entityId: room.id,
      space: "planPct",
      bounds: { x: room.x, y: room.y, w: room.w, h: room.h },
      centroid: {
        x: room.x + room.w / 2,
        y: room.y + room.h / 2,
      },
      labelAnchor: {
        x: room.x + room.w / 2,
        y: room.y + room.h / 2,
      },
    }));
    validateSpatialAnchors(anchors);
  }, [rooms]);

  const showLabels = zoom >= 0.95 || Boolean(selectedId);

  return (
    <div
      className="hl-plan-stage"
      style={{
        transform: `scale(${zoom})`,
        ["--hl-zoom" as string]: String(zoom),
      }}
    >
      <div className="hl-arch" aria-hidden>
        <div className="hl-arch-frame" />
        <div className="hl-arch-corridor" />
        <div className="hl-arch-lift">LIFT</div>
        <div className="hl-arch-service">SERVICE</div>
        <div className="hl-arch-stair" />
      </div>
      {rooms.map((room) => {
        const selected = room.id === selectedId;
        const signals=guestSignals(hotelGuestNeeds(room),"incoming");
        const tip = [
          `Room ${room.number}`,
          roomStateLabel(room.state),
          signalDescription(signals),
          room.arrivalAt ? `Arrival ${room.arrivalAt}` : null,
          room.priority === "high" ? "Priority High" : null,
          room.expectedReadyAt ? `Expected ${room.expectedReadyAt}` : null,
          room.exposureEuro ? `$${room.exposureEuro} exposure` : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const showNum = showLabels || selected;
        return (
          <button
            key={room.id}
            type="button"
            className="hl-tile"
            data-state={room.state}
            data-selected={selected ? "true" : undefined}
            data-arrival={
              mode === "arrivals" && room.arrivalAt ? "true" : undefined
            }
            data-vip={room.vip ? "true" : undefined}
            style={{
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
            }}
            title={tip}
            aria-label={`Room ${room.number}, ${roomStateLabel(room.state)}. ${signalDescription(signals)}${
              room.arrivalAt ? `, arrival ${room.arrivalAt}` : ""
            }${room.exposureEuro ? `, $${room.exposureEuro} exposure` : ""}`}
            onClick={() => onSelect(room.id)}
          >
            {showNum ? (
              <span className="hl-tile-num">{room.number}</span>
            ) : (
              <span className="hl-tile-num" data-dot="true" aria-hidden>
                ·
              </span>
            )}
            <span className="hl-tile-icon" aria-hidden>
              {roomIcon(room, mode, viewLens)}
            </span>
            {mode === "housekeeping" && room.assigned ? (
              <span className="hl-tile-meta">{room.assigned.split(" ")[0]}</span>
            ) : null}
            {signals.length?<span className="hl-guest-signals" data-testid="room-guest-signals">{signals.map(signal=><span key={signal.kind} data-guest-signal={signal.kind} data-scope={signal.scope} title={`Next booking: ${signal.detail}`} aria-hidden="true">{signal.kind==="allergy"?"!":signal.kind==="occasion"?"★":"≡"}</span>)}</span>:null}
            {debugGeometry ? (
              <span className="hl-debug-cross" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function RoomInspector({
  room,
  decisionId,
  prioritized,
  simulating,
  onClose,
  onPrioritize,
  onReassign,
  onPreviewImpact,
}: {
  room: HotelLiveRoom;
  decisionId: string;
  prioritized: boolean;
  simulating: boolean;
  onClose: () => void;
  onPrioritize: () => void;
  onReassign: () => void;
  onPreviewImpact: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "tasks" | "guests" | "history">(
    "overview",
  );

  return (
    <aside className="hl-inspector" aria-label={`Room ${room.number}`}>
      <div className="hl-insp-media">
        <Image
          src={room.image}
          alt=""
          fill
          sizes="340px"
          style={{ objectFit: "cover" }}
          priority
        />
        <button
          type="button"
          className="hl-insp-close"
          aria-label="Close inspector"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="hl-insp-body">
        <div className="hl-insp-title-row">
          <h2>Room {room.number}</h2>
          <span
            className="hl-badge"
            data-tone={
              room.state === "dirty"
                ? "dirty"
                : room.state === "cleaning"
                  ? "cleaning"
                  : room.state === "ready"
                    ? "ready"
                    : room.state === "inspection"
                      ? "inspection"
                      : undefined
            }
          >
            {roomStateLabel(room.state)}
            {prioritized ? " · P" : ""}
          </span>
        </div>
        <p className="hl-insp-meta">
          {room.type} · Floor {room.floor}
        </p>

        <div className="hl-insp-tabs" role="tablist">
          {(
            [
              ["overview", "Overview"],
              ["tasks", "Tasks"],
              ["guests", "Guests"],
              ["history", "History"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={tab === id ? "is-active" : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <>
            <RoomGuestBrief room={room}/>
            <div className="hl-metric-grid">
              <article>
                <em>Cleaning time</em>
                <strong>
                  {room.cleaningMinutes != null
                    ? `${room.cleaningMinutes} min`
                    : "—"}
                </strong>
                <span>
                  {room.cleaningStartedAt
                    ? `Started ${room.cleaningStartedAt}`
                    : "Not started"}
                </span>
              </article>
              <article>
                <em>Assigned to</em>
                <strong>{room.assigned ?? "—"}</strong>
                <span>Housekeeping</span>
              </article>
              <article
                data-tone={
                  room.priority === "high" || prioritized ? "high" : undefined
                }
              >
                <em>Priority</em>
                <strong>
                  {room.priority === "high" || prioritized
                    ? "↑ High"
                    : "Normal"}
                </strong>
                <span>
                  {room.arrivalAt ? `Arrival ${room.arrivalAt}` : "No linked arrival"}
                </span>
              </article>
            </div>

            {room.dependencies.length ? (
              <ul className="hl-deps">
                {room.dependencies.map((d) => (
                  <li key={d.id} data-done={d.done ? "true" : undefined}>
                    <i aria-hidden>{d.done ? "✓" : ""}</i>
                    {d.label}
                  </li>
                ))}
              </ul>
            ) : null}

            {room.decisionIds.includes(decisionId) ? (
              <div className="hl-decision-block">
                <Link
                  href={`/app/decisions?decision=${decisionId}`}
                  className="hl-decision-link"
                >
                  <em>Related Decision</em>
                  <strong>
                    {displayDecisionId(decisionId)} · Reassign 2 HK
                  </strong>
                </Link>
                <button
                  type="button"
                  className="hl-btn-ghost"
                  onClick={onPreviewImpact}
                >
                  {simulating ? "Exit simulation" : "Preview Impact"}
                </button>
              </div>
            ) : null}
          </>
        ) : tab === "guests" || tab === "history" ? (
          <RoomGuestBrief room={room} history={tab === "history"}/>
        ) : (
          <div className="room-guest-brief"><h4>Room preparation</h4>{room.dependencies.length?<ul className="hl-deps">{room.dependencies.map(d=><li key={d.id} data-done={d.done?"true":undefined}><i aria-hidden>{d.done?"✓":""}</i>{d.label}</li>)}</ul>:<p>No linked preparation tasks.</p>}<p className="guest-needs-source">{room.assigned?`Assigned to ${room.assigned}`:"No housekeeping owner recorded"} · demo snapshot</p></div>
        )}

        <div className="hl-actions">
          <button
            type="button"
            className="hl-btn-primary"
            onClick={onPrioritize}
            disabled={room.state === "ready" || prioritized}
          >
            {prioritized ? "Prioritized" : "Prioritize Room"}
          </button>
          <button
            type="button"
            className="hl-btn-secondary"
            onClick={onReassign}
          >
            Reassign Staff
          </button>
          <Link
            href={`/app/service?floor=${room.floor}&room=${room.number}`}
            className="hl-btn-more"
            aria-label="View in Operations"
          >
            ···
          </Link>
        </div>
      </div>
    </aside>
  );
}

function ArrivalWave({
  model,
  horizon,
  onHorizon,
  timeOffset,
  onScrub,
  waveSnap,
}: {
  model: ReturnType<typeof hotelLivePropertyModel>;
  horizon: "today" | "tomorrow" | "7d";
  onHorizon: (h: "today" | "tomorrow" | "7d") => void;
  timeOffset: HotelLiveTimeOffset;
  onScrub: (t: HotelLiveTimeOffset) => void;
  waveSnap: ReturnType<typeof waveReadyAtOffset>;
}) {
  const w = 720;
  const h = 84;
  const padL = 24;
  const padR = 16;
  const padT = 6;
  const padB = 16;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxY = 45;

  const toX = (t: number) => padL + t * innerW;
  const toY = (v: number) => padT + innerH - (v / maxY) * innerH;
  const actual = model.wave
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.t)},${toY(p.ready)}`)
    .join(" ");
  const expected = model.wave
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.t)},${toY(p.expected)}`)
    .join(" ");
  const area = `${actual} L${toX(1)},${padT + innerH} L${toX(0)},${padT + innerH} Z`;
  const now = model.waveEvents.find((e) => e.id === "now");
  const scrubT = waveSnap.t;

  const onChartClick = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const t = Math.min(1, Math.max(0, (x - padL) / innerW));
    const nowT = 0.48;
    if (t <= nowT + 0.04) onScrub(0);
    else if (t < 0.58) onScrub(30);
    else if (t < 0.72) onScrub(60);
    else onScrub(120);
  };

  const chipLabel = (e: (typeof model.waveEvents)[number]) => {
    if (e.id === "dep") return `${e.time} · ${e.title}`;
    if (e.id === "hk") return `${e.time} · ${e.title}`;
    if (e.id === "now") return `NOW · ${e.detail}`;
    if (e.id === "wave") return `${e.time} · 7 at risk`;
    return `${e.time} · ${e.title}`;
  };

  return (
    <section className="hl-wave" aria-label="Arrival wave">
      <div className="hl-wave-head">
        <div>
          <h3>Arrival wave</h3>
          <p>
            {timeOffset > 0
              ? `FORECAST · ${waveSnap.hour} · ${waveSnap.ready}/42 ready`
              : "Housekeeping progress vs arrivals"}
          </p>
        </div>
        <div className="hl-wave-controls">
          <div className="hl-scrub" aria-label="Time scrub">
            {TIME_SCRUBS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={timeOffset === t.id ? "is-active" : undefined}
                onClick={() => onScrub(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="hl-wave-tabs">
            {(
              [
                ["today", "Today"],
                ["tomorrow", "Tomorrow"],
                ["7d", "7 days"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={horizon === id ? "is-active" : undefined}
                onClick={() => onHorizon(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spread row above the plot — chronological, never overlapping */}
      <div className="hl-wave-callouts" aria-label="Wave markers">
        {model.waveEvents.map((e) => (
          <div key={e.id} className={`hl-wave-chip tone-${e.tone}`}>
            {chipLabel(e)}
          </div>
        ))}
      </div>

      <svg
        className="hl-wave-svg"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        onClick={onChartClick}
        style={{ cursor: "pointer" }}
      >
        <path d={area} fill="rgba(0, 168, 90, 0.12)" />
        <path
          d={expected}
          fill="none"
          stroke="rgba(11, 92, 56, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d={actual}
          fill="none"
          stroke="#00a85a"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {now ? (
          <line
            x1={toX(now.t)}
            x2={toX(now.t)}
            y1={padT}
            y2={padT + innerH}
            stroke="#07533f"
            strokeWidth="1.5"
          />
        ) : null}
        {timeOffset > 0 ? (
          <line
            x1={toX(scrubT)}
            x2={toX(scrubT)}
            y1={padT}
            y2={padT + innerH}
            stroke="#c4882a"
            strokeWidth="1.75"
            strokeDasharray="3 2"
          />
        ) : null}

        {["08:00", "12:00", "14:20", "16:00", "20:00", "22:00"].map(
          (label, i) => {
            const t = [0, 0.28, 0.48, 0.64, 0.9, 1][i]!;
            return (
              <text
                key={label}
                className="hl-wave-label"
                x={toX(t)}
                y={h - 2}
                textAnchor="middle"
              >
                {label}
              </text>
            );
          },
        )}
      </svg>
    </section>
  );
}
