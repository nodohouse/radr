"use client";

import type {
  FloorOverlay,
  FloorSection,
  FloorTable,
  ServiceTimeKey,
  TableMoment,
  TableState,
} from "@/lib/radr/floorModel";
import {
  SECTION_HEADER_HEIGHT,
  sectionCanvasTop,
  sectionHeaderBottom,
  validateFloorGeometry,
} from "@/lib/radr/floorModel";
import { formatLocationMoney } from "@/lib/radr/currency";
import { BERLIN_TONIGHT_OPS } from "@/lib/radr/venueProfiles";
import {
  LABOR_COLOR,
  RADR_GREEN,
} from "@/lib/radr/brandTokens";
import { TextSep } from "@/components/TextSep";
import { RestaurantZoneStrip } from "@/components/product/RestaurantZoneStrip";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BERLIN_FLOOR,
  BERLIN_FLOOR_MOMENTS,
} from "@/lib/radr/berlinFloor";
import {
  applyBerlinDayRoster,
  berlinDayRoster,
  berlinWeekDates,
  BERLIN_DEMO_TONIGHT,
  shiftDay,
} from "@/lib/radr/berlinWeekRoster";
import { berlinWeatherForDate, berlinWeekWeatherMark, berlinWeekWeatherTitle } from "@/lib/radr/weather/berlinWeekWeather";
import {
  formatFindingEuro,
  priorityFindingsForScope,
  unresolvedFindings,
  type PriorityFinding,
  type TerritoryCode,
} from "@/lib/radr/priorityFindings";
import { useProduct } from "@/lib/product/store";
import { toFloorServiceTime } from "@/lib/radr/operatingCanvas";
import { TimeScrubber } from "@/components/product/TimeScrubber";
import { ServiceShiftBoard } from "@/components/product/ServiceShiftBoard";
import { WeatherOperatingStrip } from "@/components/product/WeatherOperatingStrip";
import {
  chairPosesForTable,
  tableSurfaceRect,
} from "@/components/product/floorTableGeometry";
import { floorGuestByReservationId } from "@/lib/radr/guest";
import { composeSocialPreview } from "@/lib/radr/activeRevenue";
import {
  InstagramStoryMockup,
  draftFromCopy,
} from "@/components/product/activeRevenue/InstagramStoryMockup";

/** Material cancel / leakage - not amber watch */
const CANCEL_RED = "#C23B32";
const CANCEL_RED_SOFT = "rgba(194, 59, 50, 0.16)";
const CANCEL_RED_STROKE = "rgba(194, 59, 50, 0.88)";

/** Frequent / high-value guest signal */
const VIP_GOLD = "#C4A035";
const VIP_GOLD_SOFT = "rgba(212, 175, 55, 0.28)";
const VIP_GOLD_STROKE = "rgba(168, 130, 42, 0.92)";

const OVERLAYS: { key: FloorOverlay; label: string; hint: string }[] = [
  {
    key: "occupancy",
    label: "Occupancy",
    hint: "Shows expected table usage at the selected time.",
  },
  {
    key: "revenue",
    label: "Revenue",
    hint: "Shows expected table and section value intensity.",
  },
  {
    key: "pressure",
    label: "Service pressure",
    hint: "Shows where expected demand exceeds service capacity.",
  },
  {
    key: "turns",
    label: "Turns",
    hint: "Shows expected table turns across the floor.",
  },
];

const LOC = "loc_ber";

const CANCEL_BOOKING = 4 * BERLIN_TONIGHT_OPS.expectedSpendPerCover;
const CANCEL_REBOOK = 90;
const CANCEL_AT_RISK = CANCEL_BOOKING - CANCEL_REBOOK;



function momentMap(time: ServiceTimeKey): Map<string, TableMoment> {
  return new Map(BERLIN_FLOOR_MOMENTS[time].map((m) => [m.tableId, m]));
}

function resolveState(m: TableMoment | undefined): TableState {
  return m?.state ?? "AVAILABLE";
}

function occupancyPaint(state: TableState): { fill: string; stroke: string } {
  switch (state) {
    case "RESERVED":
      return {
        fill: "rgba(0, 185, 107, 0.12)",
        stroke: "rgba(0, 185, 107, 0.45)",
      };
    case "SEATED":
      return {
        fill: "rgba(0, 185, 107, 0.28)",
        stroke: "rgba(0, 166, 95, 0.82)",
      };
    case "TURNING":
      return {
        fill: "rgba(42, 122, 140, 0.14)",
        stroke: "rgba(42, 122, 140, 0.55)",
      };
    case "CANCELLED":
      return {
        fill: CANCEL_RED_SOFT,
        stroke: CANCEL_RED_STROKE,
      };
    case "BLOCKED":
      return {
        fill: "rgba(16, 20, 17, 0.04)",
        stroke: "rgba(16, 20, 17, 0.18)",
      };
    default:
      /* AVAILABLE: neutral outline on pale floor */
      return {
        fill: "rgba(250, 249, 245, 0.95)",
        stroke: "rgba(16, 20, 17, 0.22)",
      };
  }
}

function revenueBand(spend: number | undefined): { fill: string; stroke: string } {
  const v = spend ?? 0;
  if (v >= 500)
    return { fill: "rgba(0, 168, 90, 0.42)", stroke: "rgba(0, 120, 70, 0.95)" };
  if (v >= 250)
    return { fill: "rgba(0, 168, 90, 0.26)", stroke: "rgba(0, 150, 85, 0.8)" };
  if (v >= 100)
    return { fill: "rgba(0, 168, 90, 0.14)", stroke: "rgba(0, 150, 85, 0.55)" };
  return { fill: "rgba(16,20,17,0.04)", stroke: "rgba(16,20,17,0.2)" };
}

function turnsBand(state: TableState): { fill: string; stroke: string } {
  if (state === "TURNING")
    return { fill: "rgba(42,122,140,0.28)", stroke: "rgba(42,122,140,0.85)" };
  if (state === "SEATED")
    return { fill: "rgba(0, 168, 90, 0.22)", stroke: "rgba(0, 140, 80, 0.75)" };
  if (state === "RESERVED")
    return { fill: "rgba(42,122,140,0.12)", stroke: "rgba(42,122,140,0.55)" };
  if (state === "CANCELLED") return occupancyPaint(state);
  return { fill: "rgba(16,20,17,0.04)", stroke: "rgba(16,20,17,0.22)" };
}

function tablePaint(
  state: TableState,
  overlay: FloorOverlay,
  spend: number | undefined,
  sectionPressured: boolean,
  seats: number,
  opts?: { vip?: boolean; signalQuiet?: boolean },
): { fill: string; stroke: string } {
  if (state === "CANCELLED") return occupancyPaint(state);
  if (opts?.vip) {
    return { fill: VIP_GOLD_SOFT, stroke: VIP_GOLD_STROKE };
  }
  if (overlay === "revenue") {
    const implied =
      spend ??
      (state === "AVAILABLE" || state === "BLOCKED"
        ? 0
        : seats * BERLIN_TONIGHT_OPS.expectedSpendPerCover);
    return revenueBand(implied);
  }
  if (overlay === "turns") return turnsBand(state);
  if (overlay === "pressure") {
    if (sectionPressured) {
      if (state === "SEATED" || state === "RESERVED") {
        return {
          fill: "rgba(111, 98, 148, 0.32)",
          stroke: "rgba(90, 75, 130, 0.9)",
        };
      }
      return {
        fill: "rgba(111, 98, 148, 0.12)",
        stroke: "rgba(111, 98, 148, 0.55)",
      };
    }
    return occupancyPaint(state);
  }
  /* Occupancy: quiet mineral for non-signal tables */
  if (opts?.signalQuiet) {
    if (state === "AVAILABLE" || state === "BLOCKED") {
      return occupancyPaint(state);
    }
    if (state === "TURNING") {
      return {
        fill: "rgba(42, 122, 140, 0.1)",
        stroke: "rgba(42, 122, 140, 0.4)",
      };
    }
    return {
      fill: "rgba(0, 158, 86, 0.08)",
      stroke: "rgba(16, 20, 17, 0.28)",
    };
  }
  return occupancyPaint(state);
}

function overlayCaption(overlay: FloorOverlay): string {
  switch (overlay) {
    case "revenue":
      return "Darker green = higher expected value";
    case "pressure":
      return "Purple = demand above FOH capacity";
    case "turns":
      return "Blue-green = turn pace tonight";
    default:
      return "Quiet floor · Gold = regular · Amber A = allergy · Red = cancelled";
  }
}

function selectionAccent(state: TableState): string {
  return state === "CANCELLED" ? CANCEL_RED : RADR_GREEN;
}

function serverForTable(
  table: FloorTable,
  section: FloorSection | undefined,
) {
  const list = section?.servers ?? [];
  if (!list.length) return null;
  if (list.length === 1) return list[0]!;
  // Split main dining: left half Lena, right half Marco
  const mid = (section?.x ?? 0) + (section?.width ?? 0) / 2;
  return table.x + table.width / 2 < mid ? list[0]! : list[1]!;
}

/** Sorted table labels covered by a server tonight. */
function tablesForServer(
  serverId: string,
  section: FloorSection,
  tables: FloorTable[],
): string[] {
  return tables
    .filter((t) => {
      if (t.sectionId !== section.id) return false;
      return serverForTable(t, section)?.id === serverId;
    })
    .map((t) => t.label)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function formatTableRun(labels: string[]): string {
  if (labels.length === 0) return "—";
  return labels.join(" · ");
}

function sectionOccupancyPct(
  section: FloorSection,
  tables: FloorTable[],
  moments: Map<string, TableMoment>,
): number {
  let covers = 0;
  for (const t of tables) {
    if (t.sectionId !== section.id) continue;
    const m = moments.get(t.id);
    const st = resolveState(m);
    if (st === "SEATED" || st === "RESERVED") covers += m?.covers ?? 0;
  }
  return section.capacity > 0
    ? Math.round((covers / section.capacity) * 100)
    : 0;
}

function secondaryLabel(state: TableState): string | null {
  if (state === "CANCELLED") return "CANCELLED";
  return null;
}

function sectionMood(
  pct: number,
  pressured: boolean,
): { label: string; tone: "calm" | "busy" | "pressure" } {
  if (pressured) return { label: "Under pressure", tone: "pressure" };
  if (pct >= 70) return { label: "Busy", tone: "busy" };
  if (pct >= 35) return { label: "Steady", tone: "busy" };
  return { label: "Open", tone: "calm" };
}

function expectedTurnsLabel(state: TableState): string {
  if (state === "TURNING") return "2.0×";
  if (state === "SEATED") return "1.6×";
  if (state === "RESERVED") return "1.8×";
  return "1.2×";
}

function useFloorDebug(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setOn(params.get("floorDebug") === "1");
  }, []);
  return on;
}

function ServiceProblemBanner({ finding }: { finding: PriorityFinding }) {
  return (
    <section
      className="rp-service-problem"
      data-terr={finding.territory}
      aria-label="Open finding on this floor"
    >
      <div>
        <p className="rp-service-problem-kicker">
          <em data-terr={finding.territory}>{finding.territory}</em>
          <TextSep />
          <b data-band={finding.priorityBand}>{finding.priorityBand}</b>
          <TextSep />
          <span>{finding.timeframe}</span>
        </p>
        <h2>{finding.headline}</h2>
        <p>{finding.what}</p>
      </div>
      <div className="rp-service-problem-money">
        <strong>{formatFindingEuro(finding.impactEuro)}</strong>
        <TextSep srOnly>: </TextSep>
        <em>{finding.impactLabel}</em>
        <TextSep />
        <span>{finding.recommendShort}</span>
      </div>
    </section>
  );
}

/**
 * Service map: operational floor intelligence (SVG).
 * Section header safe zones; tables live only in the canvas below.
 */
export function ServiceMap() {
  const baseFloor = BERLIN_FLOOR;
  const floorDebug = useFloorDebug();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const focus = searchParams.get("focus");
  const { locationScope, serviceTime, setServiceTime, lens } = useProduct();
  const week = useMemo(() => berlinWeekDates(BERLIN_DEMO_TONIGHT), []);
  const dayFromUrl = searchParams.get("day");
  const dayIso =
    dayFromUrl && week.includes(dayFromUrl)
      ? dayFromUrl
      : BERLIN_DEMO_TONIGHT;

  function setDayIso(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === BERLIN_DEMO_TONIGHT) params.delete("day");
    else params.set("day", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const roster = useMemo(() => berlinDayRoster(dayIso), [dayIso]);
  const floor = useMemo(
    () => applyBerlinDayRoster(baseFloor, roster),
    [baseFloor, roster],
  );
  const isTonight = dayIso === BERLIN_DEMO_TONIGHT;
  const dayIdx = week.indexOf(dayIso);
  const canPrev = dayIdx > 0;
  const canNext = dayIdx >= 0 && dayIdx < week.length - 1;
  const focusFinding = useMemo(() => {
    const code: TerritoryCode | null =
      focus === "labor" ? "LABOR" : focus === "sell" ? "SELL" : null;
    if (!code) return null;
    return (
      unresolvedFindings(priorityFindingsForScope(locationScope)).find(
        (f) => f.territory === code,
      ) ?? null
    );
  }, [focus, locationScope]);

  const floorTime = toFloorServiceTime(serviceTime);
  const time = floorTime;

  const [overlay, setOverlay] = useState<FloorOverlay>(() =>
    focus === "labor"
      ? "pressure"
      : lens === "money"
        ? "revenue"
        : lens === "risk"
          ? "pressure"
          : "occupancy",
  );
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    focus === "sell" ? "t14" : focus === "labor" ? "t12" : null,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [releasedIds, setReleasedIds] = useState<Set<string>>(() => new Set());
  const [walkInIds, setWalkInIds] = useState<Set<string>>(() => new Set());
  const [storyReadyFor, setStoryReadyFor] = useState<string | null>(null);
  const [storyOpenFor, setStoryOpenFor] = useState<string | null>(null);
  const [storyPostedFor, setStoryPostedFor] = useState<Set<string>>(
    () => new Set(),
  );
  const [igConnected, setIgConnected] = useState(false);

  useEffect(() => {
    try {
      setIgConnected(sessionStorage.getItem("radr.demo.ig.berlin") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function connectInstagram() {
    try {
      sessionStorage.setItem("radr.demo.ig.berlin", "1");
    } catch {
      /* ignore */
    }
    setIgConnected(true);
  }

  useEffect(() => {
    if (focus === "labor") {
      setServiceTime("19:00");
      setOverlay("pressure");
      setSelectedId("t12");
    } else if (focus === "sell") {
      setServiceTime("20:00");
      setOverlay("occupancy");
      setSelectedId("t14");
    }
  }, [focus, setServiceTime]);

  // View mode is independent of Lens - Lens only changes the detail panel.

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !floorDebug) return;
    const issues = validateFloorGeometry(floor);
    if (issues.length) {
      console.warn("[RADR floor geometry]", issues);
    }
  }, [floor, floorDebug]);

  const weatherOps = useMemo(() => berlinWeatherForDate(dayIso), [dayIso]);
  const terraceClosed = weatherOps.terrace === "CLOSED";
  const terraceLimited = weatherOps.terrace === "LIMITED";

  const moments = useMemo(() => {
    const base = momentMap(time);
    const next = new Map(base);

    if (terraceClosed || terraceLimited) {
      for (const t of floor.tables) {
        if (t.sectionId !== "terrace") continue;
        if (terraceClosed) {
          next.set(t.id, {
            tableId: t.id,
            state: "BLOCKED",
            note: "Terrace closed · weather",
            covers: undefined,
            expectedSpend: undefined,
          });
          continue;
        }
        const idx = Number(String(t.id).replace(/\D/g, "")) || 0;
        if (idx % 2 === 0) {
          next.set(t.id, {
            tableId: t.id,
            state: "BLOCKED",
            note: "Terrace limited · wet weather",
            covers: undefined,
            expectedSpend: undefined,
          });
        }
      }
    }

    for (const id of releasedIds) {
      const prev = next.get(id);
      next.set(id, {
        tableId: id,
        state: "AVAILABLE",
        note: "Released · open on booking channels",
        covers: undefined,
        expectedSpend: undefined,
        reservationId: prev?.reservationId,
      });
    }
    for (const id of walkInIds) {
      const prev = next.get(id);
      next.set(id, {
        tableId: id,
        state: "AVAILABLE",
        note: "Held for walk-in · host can seat now",
        covers: undefined,
        expectedSpend: undefined,
        reservationId: prev?.reservationId,
      });
    }
    return next;
  }, [time, floor.tables, terraceClosed, terraceLimited, releasedIds, walkInIds]);
  const selected = floor.tables.find((t) => t.id === selectedId) ?? null;
  const selectedMoment = selectedId ? moments.get(selectedId) : undefined;
  const selectedState = resolveState(selectedMoment);
  const selectedGuest = floorGuestByReservationId(
    selectedMoment?.reservationId,
  );
  const selectedVip =
    selectedGuest?.isVip === true && selectedState !== "CANCELLED";
  const hovered = floor.tables.find((t) => t.id === hoveredId) ?? null;
  const hoveredMoment = hoveredId ? moments.get(hoveredId) : undefined;
  const hoveredGuest = floorGuestByReservationId(hoveredMoment?.reservationId);

  const occupiedCovers = useMemo(() => {
    let n = 0;
    for (const m of moments.values()) {
      if (m.state === "SEATED" || m.state === "RESERVED") n += m.covers ?? 0;
    }
    return n;
  }, [moments]);

  const mainPressured =
    overlay === "pressure" ||
    time === "19:00" ||
    time === "20:00" ||
    time === "now";

  const cancelledOpen = useMemo(() => {
    if (!isTonight) return 0;
    let n = 0;
    for (const m of moments.values()) {
      if (m.state === "CANCELLED") n += 1;
    }
    return n;
  }, [moments, isTonight]);

  const attentionTableIds = useMemo(() => {
    if (!isTonight) return [] as string[];
    const ids: string[] = [];
    for (const [id, m] of moments.entries()) {
      if (
        m.state === "CANCELLED" &&
        !releasedIds.has(id) &&
        !walkInIds.has(id)
      ) {
        ids.push(id);
      }
    }
    return ids;
  }, [moments, isTonight, releasedIds, walkInIds]);

  function focusFloorAttention() {
    const id = attentionTableIds[0];
    if (!id) return;
    if (dayIso !== BERLIN_DEMO_TONIGHT) setDayIso(BERLIN_DEMO_TONIGHT);
    setSelectedId(id);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        document
          .querySelector(".rp-service-detail")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  const scrubInsight = useMemo(() => {
    if (!isTonight) {
      return roster.note
        ? `${roster.weekday} set · ${roster.note}`
        : `${roster.weekday} · click through the week to see who’s on`;
    }
    if (cancelledOpen > 0 && (time === "now" || time === "20:00" || time === "19:00")) {
      return cancelledOpen === 1
        ? "1 cancelled table still open - recover before the window closes"
        : `${cancelledOpen} cancelled tables still need a decision`;
    }
    if (mainPressured) {
      return "Main dining is the pressure pocket - coverage holds if peak stays on plan";
    }
    if (time === "18:00") {
      return terraceClosed
        ? "Terrace closed for weather - bar absorbs walk-ins"
        : "Early covers settling in - terrace and bar still open for walk-ins";
    }
    if (time === "21:00") {
      return "Wind-down - protect last turns, do not overstaff soft zones";
    }
    return "Floor tracking the evening plan - scrub to replay coverage";
  }, [cancelledOpen, mainPressured, time, isTonight, roster.note, roster.weekday, terraceClosed]);

  const scrubNeedsAct =
    isTonight &&
    attentionTableIds.length > 0 &&
    cancelledOpen > 0 &&
    (time === "now" || time === "20:00" || time === "19:00");

  const floorStory = useMemo(() => {
    if (cancelledOpen > 0) {
      return `${occupiedCovers} guests on floor · ${cancelledOpen} cancel needs attention`;
    }
    if (!isTonight) {
      if (terraceClosed) {
        return `${roster.weekday} · terrace closed · ${weatherOps.opsCue}`;
      }
      if (terraceLimited) {
        return `${roster.weekday} · terrace limited · ${weatherOps.terraceExpectedCovers} outdoor covers`;
      }
      return `${roster.weekday} coverage · who owns each section`;
    }
    if (terraceClosed) {
      return `${occupiedCovers} guests indoor · terrace closed for weather`;
    }
    if (mainPressured) {
      return `${occupiedCovers} guests on floor · Main dining in peak`;
    }
    return `${occupiedCovers} guests on floor · ${floor.seats} seats total`;
  }, [
    cancelledOpen,
    occupiedCovers,
    isTonight,
    roster.weekday,
    terraceClosed,
    terraceLimited,
    weatherOps.opsCue,
    weatherOps.terraceExpectedCovers,
    mainPressured,
    floor.seats,
  ]);

  const mealLine = roster.mealLine;

  const activeOverlay = OVERLAYS.find((o) => o.key === overlay)!;
  const accent =
    selectedState === "CANCELLED"
      ? CANCEL_RED
      : selectedVip
        ? VIP_GOLD
        : selectionAccent(selectedState);
  const sectionName =
    selected != null
      ? floor.sections.find((s) => s.id === selected.sectionId)?.name
      : null;
  const avgSpend = BERLIN_TONIGHT_OPS.expectedSpendPerCover;
  const expectedValue =
    selectedMoment?.expectedSpend ??
    (selectedMoment?.covers != null
      ? selectedMoment.covers * avgSpend
      : null);

  const cancelStoryPreview = useMemo(() => {
    return composeSocialPreview({
      time: "Tonight · soon",
      partySize: 4,
      locationName: floor.name,
    });
  }, [floor.name]);
  const cancelStoryDraft = useMemo(
    () =>
      draftFromCopy(cancelStoryPreview.copy, {
        time: "Tonight · soon",
        partySize: 4,
        locationName: floor.name,
        cta: cancelStoryPreview.bookingLinkLabel,
      }),
    [cancelStoryPreview, floor.name],
  );

  return (
    <div className="rp-service" data-map-first="true" data-overlay={overlay}>
      <header
        className="rp-service-head"
        data-attn={cancelledOpen > 0 ? "true" : undefined}
      >
        <div className="rp-service-hero">
          <div className="rp-service-hero-top">
            <p className="rp-service-eyebrow">Service</p>
            <p className="rp-service-when">{mealLine}</p>
          </div>
          <h1>{floor.name}</h1>
          <ul className="rp-service-stats" aria-label={floorStory}>
            <li>
              <strong>
                {isTonight
                  ? occupiedCovers
                  : terraceClosed
                    ? "0"
                    : weatherOps.terraceExpectedCovers}
              </strong>
              <span>
                {isTonight
                  ? "on floor"
                  : terraceClosed
                    ? "terrace off"
                    : "terrace covers"}
              </span>
            </li>
            {cancelledOpen > 0 ? (
              <li data-attn="true">
                <button
                  type="button"
                  className="rp-service-stat-act"
                  onClick={focusFloorAttention}
                  aria-label={`${cancelledOpen} ${cancelledOpen === 1 ? "thing needs you" : "things need you"}. Open on the floor.`}
                >
                  <strong>{cancelledOpen}</strong>
                  <span>
                    {cancelledOpen === 1 ? "needs you" : "need you"}
                  </span>
                </button>
              </li>
            ) : (
              <li>
                <strong>
                  {floor.sections.reduce(
                    (n, s) => n + (s.servers?.length ?? 0),
                    0,
                  )}
                </strong>
                <span>on shift</span>
              </li>
            )}
            <li className="rp-service-day">
              <div className="rp-service-day-step">
                <button
                  type="button"
                  className="rp-service-day-btn"
                  aria-label="Previous day"
                  disabled={!canPrev}
                  onClick={() => setDayIso(shiftDay(dayIso, -1, week))}
                >
                  ‹
                </button>
                <div className="rp-service-day-lockup">
                  <strong>{roster.weekday}</strong>
                  <span>{roster.dateLabel}</span>
                </div>
                <button
                  type="button"
                  className="rp-service-day-btn"
                  aria-label="Next day"
                  disabled={!canNext}
                  onClick={() => setDayIso(shiftDay(dayIso, 1, week))}
                >
                  ›
                </button>
              </div>
            </li>
          </ul>
          <div
            className="rp-service-week"
            role="tablist"
            aria-label="Service week"
          >
            {week.map((iso) => {
              const r = berlinDayRoster(iso);
              const on = iso === dayIso;
              const tonight = iso === BERLIN_DEMO_TONIGHT;
              const wxMark = berlinWeekWeatherMark(iso);
              const wxTitle = berlinWeekWeatherTitle(iso);
              const wxOps = berlinWeatherForDate(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-active={on ? "true" : undefined}
                  data-tonight={tonight ? "true" : undefined}
                  data-wx={wxMark}
                  data-terrace={wxOps.terrace.toLowerCase()}
                  className="rp-service-week-day"
                  title={`${r.weekday} · ${r.dateLabel} · ${wxTitle}`}
                  aria-label={`${r.weekday}, ${wxTitle}`}
                  onClick={() => setDayIso(iso)}
                >
                  <span className="rp-service-week-day-lab">
                    {r.weekday.slice(0, 3)}
                  </span>
                  {wxMark === "heavy_rain" || wxMark === "rain" ? (
                    <span
                      className="rp-service-week-wx"
                      aria-hidden="true"
                      data-wx={wxMark}
                    >
                      <svg
                        viewBox="0 0 16 14"
                        width="12"
                        height="10"
                        fill="none"
                      >
                        <path
                          d="M4.2 6.2c0-1.9 1.5-3.4 3.4-3.4 1.4 0 2.6.8 3.1 2 .3-.1.6-.2.9-.2 1.2 0 2.2 1 2.2 2.2S13 9 11.8 9H4.5C3.1 9 2 7.9 2 6.5c0-1.2.9-2.2 2-2.4.1.7.4 1.4.9 1.9.1.1.2.2.3.2z"
                          fill="currentColor"
                          opacity="0.9"
                        />
                        <path
                          d="M5 10.2l-.6 2M8 10.4l-.5 2M11 10.2l-.6 2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          opacity={wxMark === "heavy_rain" ? 1 : 0.75}
                        />
                        {wxMark === "heavy_rain" ? (
                          <path
                            d="M6.5 10.1l-.5 1.6M9.5 10.3l-.5 1.6"
                            stroke="currentColor"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                          />
                        ) : null}
                      </svg>
                    </span>
                  ) : wxMark === "warm" ? (
                    <span
                      className="rp-service-week-wx"
                      aria-hidden="true"
                      data-wx="warm"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        width="10"
                        height="10"
                        fill="none"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="2.2"
                          fill="currentColor"
                        />
                        <path
                          d="M6 1v1.4M6 9.6V11M1 6h1.4M9.6 6H11M2.4 2.4l1 1M8.6 8.6l1 1M8.6 3.4l1-1M2.4 9.6l1-1"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="rp-service-week-wx" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
          {roster.note ? (
            <p className="rp-service-roster-note">{roster.note}</p>
          ) : null}
          <WeatherOperatingStrip compact dateIso={dayIso} />
        </div>
        <Link href="/app" className="rp-service-back">
          Control Center
        </Link>
      </header>

      {focusFinding ? <ServiceProblemBanner finding={focusFinding} /> : null}

      <RestaurantZoneStrip dateIso={dayIso} />

      <div className="rp-service-rail" aria-label="Service evening">
        <ServiceShiftBoard
          floor={floor}
          roster={roster}
          mealLine={mealLine}
          tablesForServer={tablesForServer}
          formatTableRun={formatTableRun}
        />
        {isTonight ? (
          <TimeScrubber
            insight={scrubInsight}
            onInsightAct={scrubNeedsAct ? focusFloorAttention : undefined}
            insightActLabel={scrubNeedsAct ? "Open table" : undefined}
          />
        ) : null}
      </div>

      <div className="rp-service-local" aria-label="Service Map controls">
        <div className="rp-service-local-views">
          <p className="rp-service-local-label">Floor view</p>
          <div
            className="rp-view-seg"
            role="tablist"
            aria-label="Floor view mode"
          >
            {OVERLAYS.map((o) => (
              <button
                key={o.key}
                type="button"
                role="tab"
                aria-selected={overlay === o.key}
                data-active={overlay === o.key ? "true" : undefined}
                title={o.hint}
                onClick={() => setOverlay(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="rp-service-view-hint">{overlayCaption(overlay)}</p>
        </div>
      </div>

      <div className="rp-service-stage">
        <div
          className="rp-service-map-wrap"
          onClick={() => setSelectedId(null)}
        >
          <svg
            className="rp-service-svg"
            viewBox={`0 0 ${floor.width} ${floor.height}`}
            role="img"
            aria-label="Berlin Mitte floor plan"
          >
            <defs>
              <filter
                id="rp-sel-glow"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.4"
                  floodColor={accent}
                  floodOpacity="0.55"
                />
              </filter>
              <filter
                id="rp-table-lift"
                x="-20%"
                y="-20%"
                width="140%"
                height="150%"
              >
                <feDropShadow
                  dx="0"
                  dy="1.4"
                  stdDeviation="1.6"
                  floodColor="#1A1510"
                  floodOpacity="0.14"
                />
              </filter>

              {/* Main dining - warm oak running boards */}
              <pattern
                id="rp-floor-wood"
                patternUnits="userSpaceOnUse"
                width="96"
                height="18"
              >
                <rect width="96" height="18" fill="#E8DCC8" />
                <rect width="96" height="8.5" fill="#EEE4D4" />
                <rect y="9" width="96" height="9" fill="#E3D5BF" />
                <line
                  x1="0"
                  y1="8.5"
                  x2="96"
                  y2="8.5"
                  stroke="rgba(110, 82, 52, 0.1)"
                  strokeWidth="0.9"
                />
                <line
                  x1="0"
                  y1="17.5"
                  x2="96"
                  y2="17.5"
                  stroke="rgba(110, 82, 52, 0.09)"
                  strokeWidth="0.9"
                />
                <line
                  x1="32"
                  y1="0"
                  x2="32"
                  y2="8.5"
                  stroke="rgba(110, 82, 52, 0.06)"
                  strokeWidth="0.7"
                />
                <line
                  x1="68"
                  y1="9"
                  x2="68"
                  y2="18"
                  stroke="rgba(110, 82, 52, 0.06)"
                  strokeWidth="0.7"
                />
              </pattern>

              {/* Bar - continuous cool stone */}
              <pattern
                id="rp-floor-bar"
                patternUnits="userSpaceOnUse"
                width="80"
                height="48"
              >
                <rect width="80" height="48" fill="#DBE2DD" />
                <rect
                  x="2"
                  y="2"
                  width="37"
                  height="21"
                  rx="2"
                  fill="#E5EBE6"
                  stroke="rgba(55, 68, 60, 0.06)"
                  strokeWidth="1"
                />
                <rect
                  x="41"
                  y="2"
                  width="37"
                  height="21"
                  rx="2"
                  fill="#D8DFDA"
                  stroke="rgba(55, 68, 60, 0.05)"
                  strokeWidth="1"
                />
                <rect
                  x="2"
                  y="25"
                  width="37"
                  height="21"
                  rx="2"
                  fill="#D5DDD7"
                  stroke="rgba(55, 68, 60, 0.05)"
                  strokeWidth="1"
                />
                <rect
                  x="41"
                  y="25"
                  width="37"
                  height="21"
                  rx="2"
                  fill="#E2E8E3"
                  stroke="rgba(55, 68, 60, 0.06)"
                  strokeWidth="1"
                />
              </pattern>

              {/* Terrace - outdoor pavers */}
              <pattern
                id="rp-floor-terrace"
                patternUnits="userSpaceOnUse"
                width="44"
                height="28"
              >
                <rect width="44" height="28" fill="#CFE0D4" />
                <rect
                  x="2"
                  y="2"
                  width="19"
                  height="11"
                  rx="2"
                  fill="#E7F1EA"
                  stroke="rgba(55, 90, 68, 0.08)"
                  strokeWidth="1"
                />
                <rect
                  x="23"
                  y="2"
                  width="19"
                  height="11"
                  rx="2"
                  fill="#DEEAE2"
                  stroke="rgba(55, 90, 68, 0.07)"
                  strokeWidth="1"
                />
                <rect
                  x="2"
                  y="15"
                  width="19"
                  height="11"
                  rx="2"
                  fill="#E1ECE4"
                  stroke="rgba(55, 90, 68, 0.07)"
                  strokeWidth="1"
                />
                <rect
                  x="23"
                  y="15"
                  width="19"
                  height="11"
                  rx="2"
                  fill="#EAF4ED"
                  stroke="rgba(55, 90, 68, 0.08)"
                  strokeWidth="1"
                />
              </pattern>

              <linearGradient id="rp-floor-light-main" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF8EF" stopOpacity="0.55" />
                <stop offset="45%" stopColor="#F3E6D4" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#C9B59A" stopOpacity="0.22" />
              </linearGradient>
              <linearGradient id="rp-floor-light-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4F7F5" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#9AABA2" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient
                id="rp-floor-light-terrace"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#F3FBF5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#9EC2A8" stopOpacity="0.18" />
              </linearGradient>
            </defs>

            {floor.sections.map((s) => {
              const pressured = s.id === "main" && mainPressured;
              const pct = sectionOccupancyPct(s, floor.tables, moments);
              const floorFill =
                overlay === "pressure" && pressured
                  ? "rgba(111, 98, 148, 0.14)"
                  : s.id === "main"
                    ? "url(#rp-floor-wood)"
                    : s.id === "bar"
                      ? "url(#rp-floor-bar)"
                      : "url(#rp-floor-terrace)";
              const lightFill =
                s.id === "main"
                  ? "url(#rp-floor-light-main)"
                  : s.id === "bar"
                    ? "url(#rp-floor-light-bar)"
                    : "url(#rp-floor-light-terrace)";
              const wallFill =
                s.id === "main"
                  ? "#F7F1E8"
                  : s.id === "bar"
                    ? "#EEF2EF"
                    : "#F1F7F2";
              const headerBottom = sectionHeaderBottom(s);
              const canvasTop = sectionCanvasTop(s);
              const floorH = Math.max(0, s.y + s.height - canvasTop);
              const mood = sectionMood(
                pct,
                pressured && (overlay === "pressure" || mainPressured),
              );
              const serverLine =
                (s.servers ?? [])
                  .map((p) => {
                    const run = formatTableRun(
                      tablesForServer(p.id, s, floor.tables),
                    );
                    return `${p.short} ${run}`;
                  })
                  .join(" · ") || "Unassigned";

              return (
                <g key={s.id} className="rp-service-section" data-zone={s.id}>
                  {/* Room shell / plaster */}
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.width}
                    height={s.height}
                    rx={8}
                    fill={wallFill}
                    stroke={
                      pressured && overlay === "pressure"
                        ? "rgba(111, 98, 148, 0.4)"
                        : "rgba(55, 48, 38, 0.14)"
                    }
                    strokeWidth={1.25}
                  />

                  {/* Material floor plane */}
                  <rect
                    x={s.x + 1}
                    y={canvasTop}
                    width={s.width - 2}
                    height={floorH - 1}
                    fill={floorFill}
                    pointerEvents="none"
                  />
                  <rect
                    x={s.x + 1}
                    y={canvasTop}
                    width={s.width - 2}
                    height={floorH - 1}
                    fill={lightFill}
                    opacity={0.85}
                    pointerEvents="none"
                  />

                  {/* Main dining · Lena left / Marco right stations */}
                  {s.id === "main" && (s.servers?.length ?? 0) >= 2 ? (
                    <g pointerEvents="none" aria-hidden="true">
                      <rect
                        x={s.x + 1}
                        y={canvasTop}
                        width={s.width / 2 - 1}
                        height={floorH - 1}
                        fill="rgba(47, 115, 128, 0.06)"
                      />
                      <rect
                        x={s.x + s.width / 2}
                        y={canvasTop}
                        width={s.width / 2 - 1}
                        height={floorH - 1}
                        fill="rgba(154, 107, 24, 0.05)"
                      />
                      <line
                        x1={s.x + s.width / 2}
                        y1={canvasTop + 8}
                        x2={s.x + s.width / 2}
                        y2={s.y + s.height - 12}
                        stroke="rgba(10, 13, 11, 0.12)"
                        strokeWidth={1}
                        strokeDasharray="3 4"
                      />
                      <text
                        x={s.x + s.width / 4}
                        y={s.y + s.height - 14}
                        textAnchor="middle"
                        fill="rgba(47, 115, 128, 0.55)"
                        fontSize={9}
                        fontWeight={700}
                        letterSpacing={0.8}
                        fontFamily="inherit"
                      >
                        {s.servers![0]!.short}
                      </text>
                      <text
                        x={s.x + (s.width * 3) / 4}
                        y={s.y + s.height - 14}
                        textAnchor="middle"
                        fill="rgba(154, 107, 24, 0.55)"
                        fontSize={9}
                        fontWeight={700}
                        letterSpacing={0.8}
                        fontFamily="inherit"
                      >
                        {s.servers![1]!.short}
                      </text>
                    </g>
                  ) : null}

                  {/* Soft wall / skirting */}
                  <rect
                    x={s.x + 5}
                    y={canvasTop + 3}
                    width={s.width - 10}
                    height={Math.max(0, floorH - 8)}
                    rx={4}
                    fill="none"
                    stroke="rgba(40, 36, 28, 0.07)"
                    strokeWidth={1}
                    pointerEvents="none"
                  />

                  {/* Zone cues */}
                  {s.id === "bar" ? (
                    <rect
                      x={s.x + 18}
                      y={canvasTop + 14}
                      width={s.width - 36}
                      height={10}
                      rx={2}
                      fill="rgba(42, 52, 48, 0.14)"
                      pointerEvents="none"
                    />
                  ) : null}
                  {s.id === "terrace" ? (
                    <>
                      <line
                        x1={s.x + 16}
                        y1={canvasTop + 10}
                        x2={s.x + s.width - 16}
                        y2={canvasTop + 10}
                        stroke="rgba(55, 110, 75, 0.18)"
                        strokeWidth={2}
                        strokeDasharray="3 5"
                        pointerEvents="none"
                      />
                      <circle
                        cx={s.x + s.width - 28}
                        cy={canvasTop + 28}
                        r={7}
                        fill="rgba(80, 140, 95, 0.12)"
                        pointerEvents="none"
                      />
                      {terraceClosed || terraceLimited ? (
                        <rect
                          x={s.x + 6}
                          y={canvasTop + 4}
                          width={s.width - 12}
                          height={Math.max(0, floorH - 12)}
                          rx={6}
                          fill={
                            terraceClosed
                              ? "rgba(42, 52, 48, 0.18)"
                              : "rgba(138, 90, 0, 0.08)"
                          }
                          stroke={
                            terraceClosed
                              ? "rgba(42, 52, 48, 0.28)"
                              : "rgba(138, 90, 0, 0.28)"
                          }
                          strokeWidth={1}
                          strokeDasharray="4 4"
                          pointerEvents="none"
                        />
                      ) : null}
                    </>
                  ) : null}

                  {/* Reserved header band: tables never enter this zone */}
                  <g className="rp-service-section-header">
                    <rect
                      x={s.x + 1}
                      y={s.y + 1}
                      width={s.width - 2}
                      height={SECTION_HEADER_HEIGHT - 2}
                      rx={7}
                      fill="rgba(255, 255, 255, 0.78)"
                      pointerEvents="none"
                    />
                    {floorDebug ? (
                      <rect
                        x={s.x}
                        y={s.y}
                        width={s.width}
                        height={SECTION_HEADER_HEIGHT}
                        fill="rgba(255, 80, 80, 0.12)"
                        stroke="rgba(255, 80, 80, 0.35)"
                        strokeWidth={1}
                        strokeDasharray="4 3"
                        pointerEvents="none"
                      />
                    ) : null}
                    <text
                      x={s.x + 14}
                      y={s.y + 24}
                      fill="#0A0D0B"
                      fontSize={14}
                      fontWeight={650}
                      fontFamily="inherit"
                    >
                      {s.name}
                      {s.id === "terrace" && terraceClosed
                        ? " · CLOSED"
                        : s.id === "terrace" && terraceLimited
                          ? " · LIMITED"
                          : ""}
                    </text>
                    <text
                      x={s.x + s.width - 14}
                      y={s.y + 24}
                      textAnchor="end"
                      fill={
                        mood.tone === "pressure"
                          ? LABOR_COLOR
                          : mood.tone === "busy"
                            ? "#067a42"
                            : "#3F4843"
                      }
                      fontSize={11}
                      fontWeight={650}
                      fontFamily="inherit"
                    >
                      {mood.label}
                    </text>
                    <text
                      x={s.x + 14}
                      y={s.y + 44}
                      fill="#1A211D"
                      fontSize={12}
                      fontWeight={560}
                      fontFamily="inherit"
                    >
                      {serverLine}
                    </text>
                    {/* Soft occupancy bar - no raw % spam */}
                    <rect
                      x={s.x + 14}
                      y={s.y + 52}
                      width={Math.max(40, s.width - 28)}
                      height={4}
                      rx={2}
                      fill="rgba(10,13,11,0.08)"
                    />
                    <rect
                      x={s.x + 14}
                      y={s.y + 52}
                      width={Math.max(
                        4,
                        ((s.width - 28) * Math.min(100, pct)) / 100,
                      )}
                      height={4}
                      rx={2}
                      fill={
                        mood.tone === "pressure"
                          ? LABOR_COLOR
                          : mood.tone === "busy"
                            ? "#00a85a"
                            : "rgba(10,13,11,0.28)"
                      }
                    />
                    <line
                      x1={s.x + 10}
                      x2={s.x + s.width - 10}
                      y1={headerBottom}
                      y2={headerBottom}
                      stroke="rgba(55, 48, 38, 0.1)"
                      strokeWidth={1}
                    />
                    {floorDebug ? (
                      <line
                        x1={s.x}
                        x2={s.x + s.width}
                        y1={canvasTop}
                        y2={canvasTop}
                        stroke="rgba(0, 245, 122, 0.45)"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                      />
                    ) : null}
                  </g>
                </g>
              );
            })}

            {floor.tables.map((t) => {
              const m = moments.get(t.id);
              const state = resolveState(m);
              const guestMem = floorGuestByReservationId(m?.reservationId);
              const isVip =
                guestMem?.isVip === true && state !== "CANCELLED";
              const hasAllergy =
                (guestMem?.allergies.length ?? 0) > 0 &&
                state !== "CANCELLED" &&
                state !== "AVAILABLE";
              const pressured = t.sectionId === "main" && mainPressured;
              const paint = tablePaint(
                state,
                overlay,
                m?.expectedSpend,
                pressured,
                t.seats,
                {
                  vip: isVip,
                  signalQuiet: overlay === "occupancy",
                },
              );
              const active = selectedId === t.id;
              const hovering = hoveredId === t.id;
              const ring = active
                ? state === "CANCELLED"
                  ? CANCEL_RED
                  : isVip
                    ? VIP_GOLD
                    : selectionAccent(state)
                : paint.stroke;
              let label: string | null = secondaryLabel(state);
              if (!label && hasAllergy) {
                label = "ALLERGY";
              } else if (!label && isVip) {
                label = "VIP";
              } else if (!label && overlay === "turns" && state !== "AVAILABLE") {
                label = expectedTurnsLabel(state);
              } else if (
                !label &&
                overlay === "revenue" &&
                (m?.expectedSpend ?? 0) >= 250
              ) {
                label = formatLocationMoney(m!.expectedSpend!, LOC, {
                  compact: true,
                });
              } else if (
                !label &&
                overlay === "pressure" &&
                pressured &&
                (state === "SEATED" || state === "RESERVED")
              ) {
                label = "PEAK";
              }
              const showSeatBadge = active || hovering;
              const hasFinding = t.id === "t14" && state === "CANCELLED";
              const scale = active ? 1.02 : hovering ? 1.01 : 1;
              const cx = t.x + t.width / 2;
              const cy = t.y + t.height / 2;
              const surface = tableSurfaceRect(t);
              const chairs = chairPosesForTable(t);
              const section = floor.sections.find((s) => s.id === t.sectionId);
              const server = serverForTable(t, section);
              const idFont = t.width < 40 ? 10 : 12;
              const filled =
                state === "CANCELLED" ||
                isVip ||
                state === "SEATED" ||
                state === "RESERVED" ||
                state === "TURNING" ||
                (overlay === "pressure" && pressured) ||
                (overlay === "revenue" && (m?.expectedSpend ?? 0) >= 100);
              const ink =
                state === "CANCELLED"
                  ? CANCEL_RED
                  : isVip
                    ? "#5C4A14"
                    : filled && !isVip && state !== "AVAILABLE"
                      ? state === "SEATED" ||
                          state === "RESERVED" ||
                          (overlay !== "occupancy" &&
                            (m?.expectedSpend ?? 0) >= 100)
                        ? "rgba(255,255,255,0.96)"
                        : "#0A0D0B"
                      : "#0A0D0B";
              const chairFill =
                state === "CANCELLED"
                  ? "rgba(194, 59, 50, 0.7)"
                  : isVip
                    ? "rgba(168, 130, 42, 0.75)"
                    : filled
                      ? "rgba(10, 13, 11, 0.55)"
                      : "rgba(10, 13, 11, 0.4)";

              return (
                <g
                  key={t.id}
                  className="rp-service-table"
                  data-state={state}
                  data-vip={isVip ? "true" : undefined}
                  data-allergy={hasAllergy ? "true" : undefined}
                  data-overlay={overlay}
                  data-active={active ? "true" : undefined}
                  transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}
                  style={{ transition: "transform 200ms ease" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(t.id);
                  }}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {floorDebug ? (
                    <rect
                      x={t.x - 2}
                      y={t.y - 2}
                      width={t.width + 4}
                      height={t.height + 4}
                      fill="none"
                      stroke="rgba(0, 180, 255, 0.45)"
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  ) : null}

                  {chairs.map((c, i) => (
                    <rect
                      key={`${t.id}-c${i}`}
                      x={c.x}
                      y={c.y}
                      width={c.w}
                      height={c.h}
                      rx={1.8}
                      fill={chairFill}
                      stroke="rgba(255,255,255,0.65)"
                      strokeWidth={0.7}
                      pointerEvents="none"
                    />
                  ))}

                  <rect
                    x={surface.x}
                    y={surface.y}
                    width={surface.w}
                    height={surface.h}
                    rx={surface.rx}
                    fill={paint.fill}
                    stroke={ring}
                    strokeWidth={active ? 2.4 : hovering ? 1.8 : 1.4}
                    filter={
                      active && hasFinding
                        ? "url(#rp-sel-glow)"
                        : "url(#rp-table-lift)"
                    }
                    style={{
                      cursor: "pointer",
                      transition:
                        "fill 220ms ease, stroke 220ms ease, stroke-width 180ms ease",
                    }}
                  />

                  <text
                    x={cx}
                    y={cy + (label ? -4 : 4)}
                    textAnchor="middle"
                    fill={ink}
                    fontSize={idFont}
                    fontWeight={700}
                    fontFamily="inherit"
                    pointerEvents="none"
                  >
                    {t.label}
                  </text>
                  {label ? (
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      fill={
                        state === "CANCELLED"
                          ? CANCEL_RED
                          : hasAllergy
                            ? "#8A4B12"
                            : isVip
                              ? "#5C4A14"
                              : filled &&
                                  (state === "SEATED" ||
                                    state === "RESERVED" ||
                                    overlay !== "occupancy")
                                ? "rgba(255,255,255,0.9)"
                                : "#1A211D"
                      }
                      fontSize={7.5}
                      fontWeight={700}
                      letterSpacing={0.4}
                      fontFamily="inherit"
                      pointerEvents="none"
                    >
                      {label}
                    </text>
                  ) : null}

                  {hasAllergy ? (
                    <g pointerEvents="none" aria-hidden="true">
                      <circle
                        cx={t.x + 8}
                        cy={t.y + 8}
                        r={7}
                        fill="#C47A22"
                        stroke="#fff"
                        strokeWidth={1.2}
                      />
                      <text
                        x={t.x + 8}
                        y={t.y + 11.5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={8}
                        fontWeight={800}
                        fontFamily="inherit"
                      >
                        A
                      </text>
                    </g>
                  ) : null}

                  {showSeatBadge ? (
                    <g pointerEvents="none">
                      <rect
                        x={t.x + t.width - 16}
                        y={t.y - 2}
                        width={14}
                        height={12}
                        rx={3}
                        fill={
                          state === "CANCELLED"
                            ? CANCEL_RED
                            : "rgba(10, 13, 11, 0.82)"
                        }
                      />
                      <text
                        x={t.x + t.width - 9}
                        y={t.y + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={8}
                        fontWeight={700}
                        fontFamily="inherit"
                      >
                        {t.seats}
                      </text>
                    </g>
                  ) : null}

                  {server ? (
                    <text
                      x={cx}
                      y={t.y + t.height + 11}
                      textAnchor="middle"
                      fill={
                        active || hovering
                          ? "#0A0D0B"
                          : "rgba(26, 33, 29, 0.55)"
                      }
                      fontSize={7.5}
                      fontWeight={active || hovering ? 700 : 650}
                      letterSpacing={0.4}
                      fontFamily="inherit"
                      pointerEvents="none"
                    >
                      {server.short}
                    </text>
                  ) : null}

                  {hasFinding ? (
                    <circle
                      cx={t.x + 5}
                      cy={t.y + 4}
                      r={3.4}
                      fill={CANCEL_RED}
                      stroke="#fff"
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>

          {hovered ? (
            <div
              className="rp-service-tip"
              role="tooltip"
              data-vip={
                hoveredGuest?.isVip &&
                resolveState(hoveredMoment) !== "CANCELLED"
                  ? "true"
                  : undefined
              }
            >
              <strong>
                Table {hovered.label}
                {hovered.id === "t14" &&
                resolveState(hoveredMoment) === "CANCELLED"
                  ? " · Cancelled"
                  : hoveredGuest?.isVip &&
                      resolveState(hoveredMoment) !== "CANCELLED"
                    ? " · Regular"
                    : ""}
              </strong>
              {hoveredGuest?.isVip &&
              resolveState(hoveredMoment) !== "CANCELLED" ? (
                <em>{hoveredGuest.memoryLine}</em>
              ) : null}
              <span>
                {hovered.seats}-top ·{" "}
                {resolveState(hoveredMoment) === "CANCELLED"
                  ? "Cancelled"
                  : resolveState(hoveredMoment) === "SEATED"
                    ? "Seated"
                    : resolveState(hoveredMoment) === "RESERVED"
                      ? "Reserved"
                      : "Open"}
                {hoveredMoment?.covers != null
                  ? ` · ${hoveredMoment.covers} guests`
                  : ""}
              </span>
              {(() => {
                const sec = floor.sections.find(
                  (s) => s.id === hovered.sectionId,
                );
                const srv = serverForTable(hovered, sec);
                return srv ? <span>{srv.name} covering</span> : null;
              })()}
              {hoveredMoment?.expectedSpend != null ? (
                <span>
                  {formatLocationMoney(hoveredMoment.expectedSpend, LOC)}{" "}
                  expected
                </span>
              ) : null}
              {hovered.id === "t14" &&
              resolveState(hoveredMoment) === "CANCELLED" ? (
                <em style={{ color: CANCEL_RED }}>
                  Late cancellation ·{" "}
                  {formatLocationMoney(CANCEL_AT_RISK, LOC)} at risk
                </em>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside
          className="rp-service-detail"
          aria-live="polite"
          data-empty={selected ? undefined : "true"}
          data-accent={
            selectedState === "CANCELLED"
              ? "cancel"
              : selectedVip
                ? "vip"
                : selectedState === "SEATED" || selectedState === "RESERVED"
                  ? "live"
                  : undefined
          }
        >
          {selected ? (
            <>
              <p className="rp-service-detail-kicker">
                Table {selected.label}
                {selectedVip ? " · Regular" : ""}
              </p>
              <h2>
                {selected.seats} seats · {sectionName}
              </h2>

              <div className="rp-service-detail-status">
                <em>Status</em>
                <strong
                  data-state={selectedState}
                  data-vip={selectedVip ? "true" : undefined}
                >
                  {selectedState === "CANCELLED"
                    ? "Cancelled"
                    : selectedState === "AVAILABLE" &&
                        releasedIds.has(selected.id)
                      ? "Released"
                      : selectedState.charAt(0) +
                        selectedState.slice(1).toLowerCase()}
                </strong>
              </div>

              {(() => {
                const srv = serverForTable(
                  selected,
                  floor.sections.find((s) => s.id === selected.sectionId),
                );
                return srv ? (
                  <p className="rp-service-detail-cover">
                    <em>Covered by</em>
                    <strong>{srv.name}</strong>
                  </p>
                ) : null;
              })()}

              {selectedGuest && selectedVip ? (
                <div className="rp-service-attn-memory">
                  <strong>{selectedGuest.guest.identity.displayName}</strong>
                  {selectedGuest.memoryLine}
                  <span style={{ display: "block", marginTop: "0.25rem" }}>
                    {selectedGuest.guest.value.visitCount} visits ·{" "}
                    {formatLocationMoney(
                      selectedGuest.guest.value.avgSpendPerVisit,
                      LOC,
                    )}{" "}
                    avg
                  </span>
                </div>
              ) : null}

              {selectedGuest && selectedGuest.allergies.length > 0 ? (
                <div className="rp-service-allergy" role="status">
                  <em>Allergy · guest stated</em>
                  {selectedGuest.allergies.map((a) => (
                    <div key={a.label}>
                      <strong>{a.label}</strong>
                      <p>{a.protocol}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedMoment?.note &&
              !selectedVip &&
              !releasedIds.has(selected.id) &&
              !(selectedGuest?.allergies.length ?? 0) ? (
                <p className="rp-service-detail-note">{selectedMoment.note}</p>
              ) : null}

              {selectedState === "CANCELLED" ? (
                <div className="rp-service-attn">
                  <div className="rp-service-attn-block">
                    <em>Value</em>
                    <p>
                      {formatLocationMoney(CANCEL_AT_RISK, LOC)} at risk · late
                      cancel
                    </p>
                  </div>
                  <div className="rp-service-attn-block">
                    <em>What RADR already did</em>
                    <p>
                      Prepared release · Story draft for{" "}
                      {igConnected ? "@northstar.berlin" : "this location"}
                    </p>
                  </div>
                  <div className="rp-service-attn-block">
                    <em>What RADR needs from you</em>
                    <p>
                      One path: release to booking, hold for walk-in, or post
                      the Story.
                    </p>
                  </div>
                  <div className="rp-service-attn-actions">
                    <button
                      type="button"
                      data-primary="true"
                      disabled={
                        releasedIds.has(selected.id) ||
                        walkInIds.has(selected.id)
                      }
                      onClick={() => {
                        setWalkInIds((prev) => {
                          const next = new Set(prev);
                          next.delete(selected.id);
                          return next;
                        });
                        setReleasedIds((prev) => {
                          const next = new Set(prev);
                          next.add(selected.id);
                          return next;
                        });
                      }}
                    >
                      {releasedIds.has(selected.id)
                        ? "Released · booking channels"
                        : "Release to booking"}
                    </button>
                    <button
                      type="button"
                      disabled={
                        releasedIds.has(selected.id) ||
                        walkInIds.has(selected.id)
                      }
                      onClick={() => {
                        setReleasedIds((prev) => {
                          const next = new Set(prev);
                          next.delete(selected.id);
                          return next;
                        });
                        setWalkInIds((prev) => {
                          const next = new Set(prev);
                          next.add(selected.id);
                          return next;
                        });
                      }}
                    >
                      {walkInIds.has(selected.id)
                        ? "Held · open for walk-in"
                        : "Hold for walk-in"}
                    </button>
                    {!igConnected ? (
                      <button type="button" onClick={connectInstagram}>
                        Connect Instagram
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setStoryOpenFor(selected.id);
                          setStoryReadyFor(selected.id);
                        }}
                      >
                        {storyPostedFor.has(selected.id)
                          ? "Posted · @northstar.berlin"
                          : storyReadyFor === selected.id
                            ? "Review Story"
                            : "Post Instagram Story"}
                      </button>
                    )}
                  </div>
                  {igConnected && storyOpenFor === selected.id ? (
                    <div className="rp-service-story-inline">
                      <p className="rp-service-ig-account">
                        Posting as <strong>@northstar.berlin</strong>
                        <span>Berlin Mitte · connected</span>
                      </p>
                      <InstagramStoryMockup
                        preview={cancelStoryPreview}
                        visual={cancelStoryPreview.storyVisual}
                        draft={cancelStoryDraft}
                      />
                      <div className="rp-service-attn-actions">
                        <button
                          type="button"
                          data-primary="true"
                          disabled={storyPostedFor.has(selected.id)}
                          onClick={() => {
                            setStoryPostedFor((prev) => {
                              const next = new Set(prev);
                              next.add(selected.id);
                              return next;
                            });
                          }}
                        >
                          {storyPostedFor.has(selected.id)
                            ? "Posted"
                            : "Post now"}
                        </button>
                        <button
                          type="button"
                          className="rp-btn rp-btn-ghost"
                          onClick={() => setStoryOpenFor(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : selectedVip || (selectedGuest?.allergies.length ?? 0) > 0 ? (
                <div className="rp-service-attn">
                  {selectedVip ? (
                    <div className="rp-service-attn-block">
                      <em>Serve cue</em>
                      <p>{selectedGuest!.serveCue}</p>
                    </div>
                  ) : null}
                  <p className="rp-service-attn-done">
                    {(selectedGuest?.allergies.length ?? 0) > 0
                      ? "Allergy marked on floor · kitchen protocol above"
                      : "No action required · floor knows the preferences"}
                  </p>
                </div>
              ) : releasedIds.has(selected.id) ? (
                <div className="rp-service-attn">
                  <p className="rp-service-attn-done">
                    Released · open on booking channels
                  </p>
                </div>
              ) : walkInIds.has(selected.id) ? (
                <div className="rp-service-attn">
                  <p className="rp-service-attn-done">
                    Held for walk-in · host can seat now
                  </p>
                </div>
              ) : (
                <div className="rp-service-attn">
                  <div className="rp-service-attn-block">
                    <em>Next</em>
                    <p>
                      {selectedState === "AVAILABLE"
                        ? "Open for walk-in"
                        : selectedMoment?.covers != null
                          ? `${selectedMoment.covers} covers · ${expectedTurnsLabel(selectedState)}`
                          : expectedTurnsLabel(selectedState)}
                    </p>
                  </div>
                  {expectedValue != null ? (
                    <div className="rp-service-attn-block">
                      <em>Expected</em>
                      <p>{formatLocationMoney(expectedValue, LOC)}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <p className="rp-service-empty sr-only">
              Select a table for detail. {activeOverlay.label} ·{" "}
              {occupiedCovers} guests on floor · chairs show seat count
            </p>
          )}
        </aside>
      </div>

      <p className="rp-service-demo">
        Demo floor · cancel and regulars carry the signal
      </p>
    </div>
  );
}
