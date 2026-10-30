"use client";

/**
 * RADR Live Spatial — mockup-faithful estate / venue operating model.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { useProduct } from "@/lib/product/store";
import { viewBoxScale } from "@/lib/radr/live/spatialCamera";
import { EstateWorld } from "./EstateWorld";
import { LiveInspector } from "./LiveInspector";
import { VenueWorld } from "./VenueWorld";
import {
  CLOCK_LABEL,
  EVENTS,
  FRESHNESS,
  LOCATION_ID,
  LOCATION_SLUG,
  OVERVIEW_CAMERA,
  ZONE_CAMERA,
  ZONE_ORDER,
  briefingFor,
  horizonSnap,
  zonesFor,
  type LiveHorizon,
  type LiveLens,
  type LiveLevel,
  type LiveStationId,
  type LiveZoneId,
} from "./liveSpatialData";
import {
  ESTATE_SITES,
  siteBySlug,
  type EstateSite,
} from "./estateSites";
import "./live-spatial.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const HINTS_KEY = "radr.live.spatial.hints.v1";
const ZONE_SET = new Set<string>(ZONE_ORDER);
const STATION_SET = new Set(["hot", "cold", "prep", "pass", "dish"]);

function defaultLevel(role: string): LiveLevel {
  if (role === "cfo" || role === "finance" || role === "coo") return "estate";
  return "venue";
}

function defaultLens(role: string): LiveLens {
  if (role === "cfo" || role === "finance") return "financial";
  return "operations";
}

function parseZone(v: string | null): LiveZoneId | null {
  return v && ZONE_SET.has(v) ? (v as LiveZoneId) : null;
}

function parseStation(v: string | null): LiveStationId | null {
  return v && STATION_SET.has(v) ? (v as LiveStationId) : null;
}

function parseHorizon(v: string | null): LiveHorizon {
  if (v === "30" || v === "60" || v === "120") return v;
  return "now";
}

export function LiveSpatialShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/live";
  const searchParams = useSearchParams();
  const { roleView, setRoleView } = useProduct();
  const [, startTransition] = useTransition();

  const [level, setLevel] = useState<LiveLevel>(() => {
    const lvl = searchParams.get("level");
    if (lvl === "estate" || lvl === "venue") return lvl;
    return defaultLevel(roleView);
  });
  const [lens, setLens] = useState<LiveLens>(() => {
    const ln = searchParams.get("lens");
    if (ln === "financial" || ln === "operations") return ln;
    const lvl = searchParams.get("level");
    if (lvl === "estate") return "financial";
    if (lvl === "venue") return "operations";
    return defaultLens(roleView);
  });
  const [horizon, setHorizon] = useState<LiveHorizon>(() =>
    parseHorizon(searchParams.get("horizon")),
  );
  const [hoverZone, setHoverZone] = useState<LiveZoneId | null>(null);
  const [selectedZone, setSelectedZone] = useState<LiveZoneId | null>(() =>
    parseZone(searchParams.get("zone")),
  );
  const [selectedStation, setSelectedStation] = useState<LiveStationId | null>(
    () => parseStation(searchParams.get("station")),
  );
  const [selectedTable, setSelectedTable] = useState<string | null>(() =>
    searchParams.get("table"),
  );
  const [estateSelected, setEstateSelected] = useState<string | null>(() => {
    const loc = searchParams.get("location");
    if (loc) {
      const site = siteBySlug(loc);
      if (site) return site.id;
    }
    return null;
  });
  const [simulating, setSimulating] = useState(false);
  const [simCalm, setSimCalm] = useState(false);
  const [compare, setCompare] = useState(false);
  const [pulseZone, setPulseZone] = useState<LiveZoneId | null>(null);
  const [scrub, setScrub] = useState(48);
  const [hints, setHints] = useState({ show: false, step: 1 as 1 | 2 | 3 });
  const [freshOpen, setFreshOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const hydrated = useRef(false);
  /** Ignore stale searchParams until the URL catches up to our intended level. */
  const pendingLevel = useRef<LiveLevel | null>(null);

  const zones = useMemo(
    () => zonesFor(lens, horizon, simCalm),
    [lens, horizon, simCalm],
  );
  const brief = briefingFor(lens, horizon);
  const snap = horizonSnap(horizon, simCalm);
  const showCausal =
    selectedZone === "kitchen" || selectedZone === "delivery";

  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const camX = useMotionValue(OVERVIEW_CAMERA.x);
  const camY = useMotionValue(OVERVIEW_CAMERA.y);
  const camW = useMotionValue(OVERVIEW_CAMERA.w);
  const camH = useMotionValue(OVERVIEW_CAMERA.h);
  const [labelScale, setLabelScale] = useState(1);
  const debugGeometry = searchParams.get("debugGeometry") === "1";

  useEffect(() => {
    const apply = () => {
      const el = svgRef.current;
      if (!el) return;
      el.setAttribute(
        "viewBox",
        `${camX.get()} ${camY.get()} ${camW.get()} ${camH.get()}`,
      );
    };
    apply();
    const unsubs = [camX, camY, camW, camH].map((mv) => mv.on("change", apply));
    return () => unsubs.forEach((u) => u());
  }, [camX, camY, camW, camH]);

  useMotionValueEvent(camW, "change", (w) => {
    const zoom = viewBoxScale(
      { x: camX.get(), y: camY.get(), w, h: camH.get() },
      OVERVIEW_CAMERA,
    );
    // Counter-scale labels: when scene zooms in (zoom>1), shrink label local scale
    setLabelScale(1 / Math.max(0.55, Math.min(zoom, 3.5)));
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      /* Viewport chrome changed — keep current camera; viewBox is relative. */
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const focusCamera = useCallback(
    (zone: LiveZoneId | null) => {
      const target = zone ? ZONE_CAMERA[zone] : OVERVIEW_CAMERA;
      const opts = { duration: zone ? 0.58 : 0.52, ease: EASE };
      void Promise.all([
        animate(camX, target.x, opts),
        animate(camY, target.y, opts),
        animate(camW, target.w, opts),
        animate(camH, target.h, opts),
      ]);
    },
    [camX, camY, camW, camH],
  );

  const writeUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(
        typeof window !== "undefined"
          ? window.location.search
          : searchParams.toString(),
      );
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") params.delete(k);
        else params.set(k, v);
      }
      if (patch.level === "estate" || patch.level === "venue") {
        pendingLevel.current = patch.level;
      }
      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      // push so browser back/forward walks spatial history
      router.push(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const dismissHints = useCallback(() => {
    try {
      window.localStorage.setItem(HINTS_KEY, "1");
    } catch {
      /* ignore */
    }
    setHints({ show: false, step: 1 });
  }, []);

  const advanceHint = useCallback(
    (to: 1 | 2 | 3 | "done") => {
      if (!hints.show) return;
      if (to === "done") {
        dismissHints();
        return;
      }
      setHints((h) => ({ ...h, step: to }));
    },
    [dismissHints, hints.show],
  );

  const clearDeep = useCallback(() => {
    setSelectedStation(null);
    setSelectedTable(null);
    setCompare(false);
  }, []);

  const onSelectEstate = useCallback(
    (id: string) => {
      setEstateSelected(id);
      const site = ESTATE_SITES.find((s) => s.id === id);
      writeUrl({
        level: "estate",
        location: site?.slug ?? null,
        zone: null,
        station: null,
        table: null,
      });
    },
    [writeUrl],
  );

  const onCloseEstate = useCallback(() => {
    setEstateSelected(null);
    writeUrl({
      level: "estate",
      location: null,
      zone: null,
      station: null,
      table: null,
    });
  }, [writeUrl]);

  const onSelectZone = useCallback(
    (id: LiveZoneId) => {
      clearDeep();
      setSimulating(false);
      setSimCalm(false);
      setSelectedZone(id);
      setLevel("venue");
      focusCamera(id);
      writeUrl({
        level: "venue",
        location: LOCATION_SLUG,
        zone: id,
        station: null,
        table: null,
        sim: null,
      });
      // Spatial focus first; hint advances after explore click
      if (hints.show && hints.step === 1) advanceHint(2);
    },
    [advanceHint, clearDeep, focusCamera, hints.show, hints.step, writeUrl],
  );

  const onSelectStation = useCallback(
    (id: LiveStationId) => {
      setSelectedTable(null);
      setSelectedStation(id);
      setSelectedZone("kitchen");
      focusCamera("kitchen");
      writeUrl({
        level: "venue",
        zone: "kitchen",
        station: id,
        table: null,
      });
    },
    [focusCamera, writeUrl],
  );

  const onSelectTable = useCallback(
    (id: string) => {
      if (id.startsWith("t-decor")) return;
      setSelectedStation(null);
      setSelectedTable(id);
      const zone: LiveZoneId = id.startsWith("tt") ? "terrace" : "main";
      setSelectedZone(zone);
      focusCamera(zone);
      writeUrl({
        level: "venue",
        zone,
        table: id,
        station: null,
      });
    },
    [focusCamera, writeUrl],
  );

  const onCloseInspector = useCallback(() => {
    if (selectedTable || selectedStation) {
      clearDeep();
      writeUrl({ table: null, station: null });
      return;
    }
    setSelectedZone(null);
    setSimulating(false);
    setSimCalm(false);
    setCompare(false);
    focusCamera(null);
    writeUrl({ zone: null, station: null, table: null, sim: null });
  }, [
    clearDeep,
    focusCamera,
    selectedStation,
    selectedTable,
    writeUrl,
  ]);

  const onPreview = useCallback(() => {
    setSimulating(true);
    setSimCalm(false);
    writeUrl({ sim: "1" });
    window.setTimeout(() => setSimCalm(true), 400);
    window.setTimeout(() => setSimulating(false), 1200);
    advanceHint("done");
  }, [advanceHint, writeUrl]);

  const enterVenue = useCallback(
    (_site?: EstateSite) => {
      setTransitioning(true);
      // Start spatial transition immediately; settle URL after motion
      setLevel("venue");
      setEstateSelected(LOCATION_ID);
      setSelectedZone(null);
      clearDeep();
      focusCamera(null);
      // Local Live level only — do not overwrite global GM/scope context.
      setLens("operations");
      writeUrl({
        level: "venue",
        location: LOCATION_SLUG,
        zone: null,
        station: null,
        table: null,
        lens: "operations",
      });
      window.setTimeout(() => setTransitioning(false), 700);
    },
    [clearDeep, focusCamera, writeUrl],
  );

  const goEstate = useCallback(() => {
    setLevel("estate");
    setSelectedZone(null);
    clearDeep();
    setSimCalm(false);
    // Estate is a Live view level — never force global CFO / All locations.
    setLens("financial");
    writeUrl({
      level: "estate",
      location: estateSelected
        ? (ESTATE_SITES.find((s) => s.id === estateSelected)?.slug ?? null)
        : null,
      zone: null,
      station: null,
      table: null,
      sim: null,
      lens: "financial",
    });
  }, [clearDeep, estateSelected, writeUrl]);

  const onPersona = useCallback(
    (next: "gm" | "cfo") => {
      startTransition(() => {
        setRoleView(next === "cfo" ? "cfo" : "gm");
        setLens(next === "cfo" ? "financial" : "operations");
        if (next === "cfo" && level === "venue") {
          // Stay on venue — only overlays change (GM↔CFO)
          writeUrl({
            lens: "financial",
            level: "venue",
            location: LOCATION_SLUG,
          });
          return;
        }
        if (next === "gm" && level === "estate") {
          setLevel("venue");
          setSelectedZone(null);
          clearDeep();
          focusCamera(null);
          writeUrl({
            level: "venue",
            location: LOCATION_SLUG,
            lens: "operations",
            zone: null,
            station: null,
            table: null,
            sim: null,
          });
          return;
        }
        writeUrl({
          lens: next === "cfo" ? "financial" : "operations",
        });
      });
    },
    [clearDeep, focusCamera, level, setRoleView, writeUrl],
  );

  const onLens = useCallback(
    (next: LiveLens) => {
      setLens(next);
      writeUrl({ lens: next });
    },
    [writeUrl],
  );

  const onHorizon = useCallback(
    (h: LiveHorizon) => {
      setHorizon(h);
      setSimCalm(false);
      writeUrl({ horizon: h === "now" ? null : h, sim: null });
      if (h === "now") setScrub(48);
      else if (h === "30") setScrub(78);
      else if (h === "60") setScrub(108);
      else setScrub(168);
    },
    [writeUrl],
  );

  const onEvent = useCallback(
    (zone: LiveZoneId) => {
      setPulseZone(zone);
      onSelectZone(zone);
      window.setTimeout(() => setPulseZone(null), 900);
    },
    [onSelectZone],
  );

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HINTS_KEY) !== "1") {
        setHints({ show: true, step: 1 });
      }
    } catch {
      setHints({ show: true, step: 1 });
    }
  }, []);

  // Camera + persona chrome from deep link; state already initialized from URL
  useLayoutEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const z = parseZone(searchParams.get("zone"));
    const st = parseStation(searchParams.get("station"));
    const sim = searchParams.get("sim") === "1";
    if (st) focusCamera("kitchen");
    else if (z) focusCamera(z);
    if (sim) setSimCalm(true);
    const lvl = searchParams.get("level");
    if (lvl === "estate" || (!lvl && defaultLevel(roleView) === "estate")) {
      if (!searchParams.get("lens")) setLens("financial");
      // Panel 1 default: no location selected — world uses full space
      if (!searchParams.get("location")) {
        setEstateSelected(null);
      }
    } else if (lvl === "venue" || z) {
      if (!searchParams.get("lens")) setLens("operations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Estate lens default (local Live view only — never mutate global persona/scope)
  useEffect(() => {
    if (level !== "estate") return;
    if (lens !== "financial") setLens("financial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Back / forward
  useEffect(() => {
    if (!hydrated.current) return;
    const lvl = searchParams.get("level") as LiveLevel | null;
    const loc = searchParams.get("location");
    const z = parseZone(searchParams.get("zone"));
    const st = parseStation(searchParams.get("station"));
    const table = searchParams.get("table");
    const ln = searchParams.get("lens");
    const hz = parseHorizon(searchParams.get("horizon"));
    const sim = searchParams.get("sim") === "1";

    if (pendingLevel.current) {
      if (lvl === pendingLevel.current) {
        pendingLevel.current = null;
      } else if (lvl === "estate" || lvl === "venue") {
        // Stale level while our navigation is in flight — still apply lens/horizon.
        if (ln === "financial" || ln === "operations") {
          if (ln !== lens) setLens(ln);
        }
        if (hz !== horizon) setHorizon(hz);
        return;
      }
    }

    if (lvl === "estate" || lvl === "venue") {
      if (lvl !== level) setLevel(lvl);
    }
    if (ln === "financial" || ln === "operations") {
      if (ln !== lens) setLens(ln);
    }
    if (hz !== horizon) setHorizon(hz);
    if (loc) {
      const site = siteBySlug(loc);
      if (site && site.id !== estateSelected) setEstateSelected(site.id);
    } else if (lvl === "estate" && estateSelected) {
      setEstateSelected(null);
    }
    if (z !== selectedZone) {
      setSelectedZone(z);
      focusCamera(z);
    }
    if (st !== selectedStation) setSelectedStation(st);
    if (table !== selectedTable) setSelectedTable(table);
    if (sim !== simCalm) setSimCalm(sim);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (selectedTable || selectedStation) {
        onCloseInspector();
        return;
      }
      if (selectedZone) {
        onCloseInspector();
        return;
      }
      if (level === "estate" && estateSelected) {
        onCloseEstate();
        return;
      }
      if (level === "venue") {
        goEstate();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    estateSelected,
    goEstate,
    level,
    onCloseEstate,
    onCloseInspector,
    selectedStation,
    selectedTable,
    selectedZone,
  ]);

  const persona = roleView === "cfo" || roleView === "finance" ? "cfo" : "gm";
  const venueOpen = level === "venue" && Boolean(selectedZone || selectedTable || selectedStation);

  return (
    <div
      className="ls-root ls-in-shell"
      data-level={level}
      data-lens={lens}
      data-horizon={horizon}
      data-sim={simCalm ? "calm" : simulating ? "preview" : undefined}
      data-testid="ls-root"
    >
      <div className="ls-stage" ref={stageRef} data-debug-geometry={debugGeometry ? "1" : undefined}>
        <AnimatePresence mode="wait">
          {level === "estate" ? (
            <motion.div
              key="estate"
              className="ls-level-layer"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: transitioning ? 0.4 : 1, scale: transitioning ? 0.96 : 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              <EstateWorld
                selectedId={estateSelected}
                onSelect={onSelectEstate}
                onClose={onCloseEstate}
                onEnterVenue={enterVenue}
              />
            </motion.div>
          ) : (
            <motion.div
              key="venue"
              className="ls-level-layer"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <svg
                ref={svgRef}
                className="ls-canvas"
                viewBox={`${OVERVIEW_CAMERA.x} ${OVERVIEW_CAMERA.y} ${OVERVIEW_CAMERA.w} ${OVERVIEW_CAMERA.h}`}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label="Soho · New York restaurant"
                data-testid="ls-venue-canvas"
              >
                <rect
                  x={OVERVIEW_CAMERA.x}
                  y={OVERVIEW_CAMERA.y}
                  width={OVERVIEW_CAMERA.w}
                  height={OVERVIEW_CAMERA.h}
                  fill="transparent"
                  onClick={() => {
                    if (selectedZone || selectedTable || selectedStation) {
                      onCloseInspector();
                    }
                  }}
                />
                <VenueWorld
                  lens={lens}
                  hoverZone={hoverZone}
                  selectedZone={selectedZone}
                  selectedStation={selectedStation}
                  selectedTable={selectedTable}
                  zones={zones}
                  simCalm={simCalm}
                  showCausal={showCausal}
                  pulseZone={pulseZone}
                  labelScale={labelScale}
                  debugGeometry={debugGeometry}
                  onHoverZone={(id) => {
                    setHoverZone(id);
                    if (id) advanceHint(2);
                  }}
                  onSelectZone={onSelectZone}
                  onSelectStation={onSelectStation}
                  onSelectTable={onSelectTable}
                />
              </svg>

              <div className="ls-venue-chrome">
                <div className="ls-venue-head">
                  <button
                    type="button"
                    className="ls-back-estate"
                    data-testid="ls-back-estate"
                    onClick={goEstate}
                  >
                    ← Estate
                  </button>
                  <span className="ls-live-pill">
                    <i />
                    {horizon === "now"
                      ? `LIVE · ${CLOCK_LABEL}`
                      : `FORECAST +${horizon}`}
                  </span>
                  {simCalm ? (
                    <span className="ls-sim-pill">SIMULATED</span>
                  ) : null}
                </div>
                <p className="ls-brief" data-testid="ls-brief">
                  <span className="ls-brief-k">{brief.kicker}</span>
                  {brief.line}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estate (panel 1): world-first · Venue: fuller operating chrome */}
        {level === "venue" ? (
          <div className="ls-controls" data-testid="ls-controls">
            <div className="ls-seg" role="tablist" aria-label="Spatial level">
              <button
                type="button"
                role="tab"
                data-testid="ls-level-estate"
                onClick={goEstate}
              >
                Estate
              </button>
              <button
                type="button"
                role="tab"
                data-active="true"
                data-testid="ls-level-venue"
                onClick={() => enterVenue()}
              >
                Venue
              </button>
            </div>
            <div className="ls-seg" role="tablist" aria-label="Persona">
              <button
                type="button"
                role="tab"
                data-active={persona === "gm" ? "true" : undefined}
                data-testid="ls-persona-gm"
                onClick={() => onPersona("gm")}
              >
                GM
              </button>
              <button
                type="button"
                role="tab"
                data-active={persona === "cfo" ? "true" : undefined}
                data-testid="ls-persona-cfo"
                onClick={() => onPersona("cfo")}
              >
                CFO
              </button>
            </div>
            <div className="ls-seg" role="tablist" aria-label="Lens">
              <button
                type="button"
                role="tab"
                data-active={lens === "operations" ? "true" : undefined}
                data-testid="ls-lens-ops"
                onClick={() => onLens("operations")}
              >
                Operations
              </button>
              <button
                type="button"
                role="tab"
                data-active={lens === "financial" ? "true" : undefined}
                data-testid="ls-lens-fin"
                onClick={() => onLens("financial")}
              >
                Financial
              </button>
            </div>
            <div className="ls-seg" role="tablist" aria-label="Horizon">
              {(
                [
                  ["now", "NOW"],
                  ["30", "+30"],
                  ["60", "+60"],
                  ["120", "+120"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  data-active={horizon === id ? "true" : undefined}
                  data-testid={`ls-horizon-${id}`}
                  onClick={() => onHorizon(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ls-controls ls-controls-estate" data-testid="ls-controls">
            <div className="ls-estate-lens-quiet" aria-label="Persona lens">
              <span data-testid="ls-persona-cfo">CFO</span>
              <i aria-hidden>·</i>
              <span data-testid="ls-lens-fin">Financial</span>
            </div>
            {/* One Enter Venue only — in inspector when a site is selected */}
            {!estateSelected ? (
              <button
                type="button"
                className="ls-estate-enter-quiet"
                data-testid="ls-level-venue"
                onClick={() => enterVenue()}
              >
                Enter a venue →
              </button>
            ) : (
              <button
                type="button"
                className="ls-visually-hidden"
                data-testid="ls-level-venue"
                onClick={() => enterVenue()}
              >
                Enter a venue →
              </button>
            )}
            <button
              type="button"
              className="ls-visually-hidden"
              data-testid="ls-level-estate"
              data-active="true"
              onClick={goEstate}
            >
              Estate
            </button>
          </div>
        )}

        {/* Bottom dock — venue operating instruments only on venue */}
        {level === "venue" ? (
          <div className="ls-dock ls-dock-rail">
            <aside className="ls-changed ls-changed-rail" data-testid="ls-changed">
              <span className="ls-k">What changed</span>
              <ul>
                {EVENTS.map((ev) => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      data-testid={`ls-event-${ev.id}`}
                      onClick={() => onEvent(ev.zone)}
                    >
                      <em>{ev.at}</em>
                      <span>{ev.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="ls-timeline" data-testid="ls-timeline">
              <span>18:00</span>
              <input
                type="range"
                min={0}
                max={270}
                value={scrub}
                aria-label="Service timeline"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setScrub(v);
                  if (v < 48) {
                    /* past observed — still maps to NOW intelligence for demo */
                    onHorizon("now");
                  } else if (v <= 55) onHorizon("now");
                  else if (v <= 95) onHorizon("30");
                  else if (v <= 140) onHorizon("60");
                  else onHorizon("120");
                  if (hints.show && hints.step === 2) advanceHint(3);
                }}
              />
              <span>22:30</span>
              <em data-mode={horizon === "now" ? "live" : "forecast"}>
                {horizon === "now"
                  ? `${CLOCK_LABEL} LIVE`
                  : `FORECAST +${horizon}`}
              </em>
            </div>

            <div className="ls-fresh" data-testid="ls-fresh">
              <button
                type="button"
                className="ls-fresh-toggle"
                aria-expanded={freshOpen}
                onClick={() => setFreshOpen((v) => !v)}
                onMouseEnter={() => setFreshOpen(true)}
                onMouseLeave={() => setFreshOpen(false)}
              >
                <i /> Live data
              </button>
              {freshOpen ? (
                <ul>
                  {FRESHNESS.map((f) => (
                    <li key={f.id}>
                      <span>{f.label}</span>
                      <em>{f.ago}</em>
                    </li>
                  ))}
                  <li data-demo="true">
                    <span>DEMO DATA</span>
                    <em>secondary</em>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="ls-estate-fresh" data-testid="ls-fresh">
            <i /> Live data
            <em>DEMO</em>
          </div>
        )}

        {level === "venue" && horizon !== "now" ? (
          <div className="ls-forecast-badge" role="status">
            FORECAST +{horizon} · 84% confidence
          </div>
        ) : null}

        {hints.show && level === "venue" ? (
          <div
            className="ls-hint-anchor"
            data-step={hints.step}
            role="status"
            data-testid="ls-hint"
          >
            <p>
              {hints.step === 1
                ? "Click any area to explore"
                : hints.step === 2
                  ? "Travel through time"
                  : "Preview the expected impact"}
            </p>
            <button type="button" onClick={dismissHints} aria-label="Dismiss tip">
              ✕
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {level === "venue" &&
          (selectedZone || selectedTable || selectedStation) ? (
            <motion.div
              key="ls-inspector-shell"
              className="ls-inspector-motion"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <LiveInspector
                lens={lens}
                zone={selectedZone}
                station={selectedStation}
                tableId={selectedTable}
                simulating={simulating}
                simCalm={simCalm}
                compare={compare}
                onClose={onCloseInspector}
                onPreview={() => {
                  onPreview();
                  if (hints.show) advanceHint("done");
                }}
                onToggleCompare={() => setCompare((v) => !v)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {venueOpen ? (
          <div className="ls-canvas-pad" aria-hidden data-inspector="open" />
        ) : null}

        {/* unused snap kept for future dock density */}
        <span className="sr-only" aria-hidden>
          {snap.kitchen}
        </span>
      </div>
    </div>
  );
}
