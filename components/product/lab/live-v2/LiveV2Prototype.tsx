"use client";

/**
 * Live V2 — interactive SVG spatial operating world.
 * Zone focus · GM/CFO lens · timeline · Decision simulation · estate strip.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { VenueScene } from "./VenueScene";
import { LiveV2Inspector } from "./LiveV2Inspector";
import { PerfHud } from "./PerfHud";
import {
  OVERVIEW_CAMERA,
  ZONE_CAMERA,
  ZONE_ORDER,
  packFor,
  type LiveV2Persona,
  type LiveV2ZoneId,
} from "./liveV2Data";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import "./live-v2.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const HINTS_KEY = "radr.live.hints.v1";
const ZONE_PARAM = new Set<LiveV2ZoneId>(ZONE_ORDER);
type Horizon = "now" | "30" | "60" | "120";

const LAST_5: { line: string; zone: LiveV2ZoneId }[] = [
  { line: "+8 walk-in covers", zone: "main" },
  { line: "Kitchen +6pp load", zone: "kitchen" },
  { line: "2 tables entered payment", zone: "main" },
  { line: "Delivery share +3pp", zone: "delivery" },
];

const ESTATE_SITES = [
  { id: "loc_berlin_mitte", label: "Soho · New York", tone: "intervene" as const },
  { id: "loc_berlin_kreuzberg", label: "West Hollywood · LA", tone: "watch" as const },
  { id: "loc_munich_altstadt", label: "Soho · London", tone: "healthy" as const },
  { id: "loc_hamburg_hafen", label: "Roma Norte · Mexico City", tone: "healthy" as const },
  { id: "loc_koln_ehrenfeld", label: "DIFC · Dubai", tone: "watch" as const },
  { id: "loc_frankfurt_westend", label: "Jardins · São Paulo", tone: "healthy" as const },
  { id: "loc_dusseldorf_medienhafen", label: "Tanjong Pagar · Singapore", tone: "healthy" as const },
  { id: "loc_stuttgart_mitte", label: "Shibuya · Tokyo", tone: "intervene" as const },
];

const HORIZON_DELTA: Record<
  Horizon,
  { occupancy: string; kitchen: string; delivery: string; waitlist: string }
> = {
  now: {
    occupancy: "78%",
    kitchen: "91%",
    delivery: "34%",
    waitlist: "6 parties",
  },
  "30": {
    occupancy: "86%",
    kitchen: "94%",
    delivery: "38%",
    waitlist: "9 parties",
  },
  "60": {
    occupancy: "91%",
    kitchen: "88%",
    delivery: "29%",
    waitlist: "4 parties",
  },
  "120": {
    occupancy: "62%",
    kitchen: "54%",
    delivery: "18%",
    waitlist: "1 party",
  },
};

function personaFromRole(roleView: string): LiveV2Persona {
  return roleView === "cfo" || roleView === "finance" ? "cfo" : "gm";
}

function parseZone(raw: string | null): LiveV2ZoneId | null {
  if (!raw) return null;
  return ZONE_PARAM.has(raw as LiveV2ZoneId) ? (raw as LiveV2ZoneId) : null;
}

function HotelLiveComingSoon() {
  return (
    <div className="lv2-hotel-gate">
      <p className="lv2-hotel-k">Hotel · Live</p>
      <h2>Hotel Live uses the property world</h2>
      <p>
        Restaurant Live proves the spatial engine here. Hotel Live opens the
        estate / property vision shell.
      </p>
      <div className="lv2-hotel-actions">
        <Link href="/app" className="lv2-btn" data-primary="true">
          Back to Center
        </Link>
      </div>
    </div>
  );
}

export function LiveV2Prototype() {
  const router = useRouter();
  const pathname = usePathname() || "/app/live";
  const searchParams = useSearchParams();
  const { roleView, setRoleView, setPeriod, locationScope, openLocationSwitcher } =
    useProduct();
  const { org, isHotel } = useDemoOrg();
  const persona = personaFromRole(roleView);

  const [hoverId, setHoverId] = useState<LiveV2ZoneId | null>(null);
  const [selectedId, setSelectedId] = useState<LiveV2ZoneId | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simCalm, setSimCalm] = useState(false);
  const [animState, setAnimState] = useState("idle");
  const [horizon, setHorizon] = useState<Horizon>("now");
  const [estateMode, setEstateMode] = useState(false);
  const [hints, setHints] = useState({
    show: false,
    step: 1 as 1 | 2 | 3,
  });
  const [, startTransition] = useTransition();
  const urlSync = useRef(false);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const pack = packFor(persona);
  const zoneSeverity = useMemo(() => {
    const map = {} as Record<
      LiveV2ZoneId,
      (typeof pack.zones)[LiveV2ZoneId]["severity"]
    >;
    for (const id of ZONE_ORDER) map[id] = pack.zones[id].severity;
    return map;
  }, [pack]);

  const inspector = selectedId ? pack.inspectors[selectedId] ?? null : null;
  const horizonSnap = HORIZON_DELTA[horizon];

  const scopeName = useMemo(() => {
    if (locationScope === "all" || locationScope.startsWith("region_")) {
      return "Soho · New York";
    }
    const fromOrg = org.locations.find((l) => l.id === locationScope);
    return (
      fromOrg?.displayName ??
      fromOrg?.name ??
      locationDisplayName(locationScope) ??
      "Soho · New York"
    );
  }, [locationScope, org.locations]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const camX = useMotionValue(OVERVIEW_CAMERA.x);
  const camY = useMotionValue(OVERVIEW_CAMERA.y);
  const camW = useMotionValue(OVERVIEW_CAMERA.w);
  const camH = useMotionValue(OVERVIEW_CAMERA.h);

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

  const focusCamera = useCallback(
    (zone: LiveV2ZoneId | null) => {
      const target = zone ? ZONE_CAMERA[zone] : OVERVIEW_CAMERA;
      setAnimState(zone ? "zone-focus" : "overview");
      const opts = { duration: zone ? 0.6 : 0.55, ease: EASE };
      void Promise.all([
        animate(camX, target.x, opts),
        animate(camY, target.y, opts),
        animate(camW, target.w, opts),
        animate(camH, target.h, opts),
      ]).then(() => setAnimState("idle"));
    },
    [camX, camY, camW, camH],
  );

  const writeZoneUrl = useCallback(
    (zone: LiveV2ZoneId | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (zone) params.set("zone", zone);
      else params.delete("zone");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
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

  const onSelect = useCallback(
    (id: LiveV2ZoneId) => {
      setEstateMode(false);
      setSimulating(false);
      setSimCalm(false);
      setSelectedId(id);
      focusCamera(id);
      writeZoneUrl(id);
      advanceHint(3);
    },
    [advanceHint, focusCamera, writeZoneUrl],
  );

  const onClose = useCallback(() => {
    setSelectedId(null);
    setSimulating(false);
    setSimCalm(false);
    focusCamera(null);
    writeZoneUrl(null);
  }, [focusCamera, writeZoneUrl]);

  const onPersona = useCallback(
    (next: LiveV2Persona) => {
      if (next === persona) return;
      setAnimState("persona-switch");
      startTransition(() => {
        setRoleView(next === "cfo" ? "cfo" : "gm");
        setPeriod("today");
        setSimulating(false);
        setSimCalm(false);
        if (next === "cfo") setEstateMode(true);
        else setEstateMode(false);
      });
      window.setTimeout(() => setAnimState("idle"), 400);
    },
    [persona, setRoleView, setPeriod],
  );

  const onPreview = useCallback(() => {
    setSimulating(true);
    setAnimState("simulate");
    setSimCalm(false);
    window.setTimeout(() => setSimCalm(true), 380);
    window.setTimeout(() => setAnimState("idle"), 1400);
    advanceHint("done");
  }, [advanceHint]);

  const onHover = useCallback(
    (id: LiveV2ZoneId | null) => {
      setHoverId(id);
      if (id) advanceHint(2);
    },
    [advanceHint],
  );

  // First-time hints
  useEffect(() => {
    try {
      if (window.localStorage.getItem(HINTS_KEY) !== "1") {
        setHints({ show: true, step: 1 });
      }
    } catch {
      setHints({ show: true, step: 1 });
    }
  }, []);

  // Hydrate zone from URL once
  useEffect(() => {
    if (urlSync.current) return;
    urlSync.current = true;
    const z = parseZone(searchParams.get("zone"));
    if (z) {
      setSelectedId(z);
      focusCamera(z);
    }
    // CFO defaults estate overview
    if (persona === "cfo" && !z) setEstateMode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount hydrate
  }, []);

  // Browser back/forward
  useEffect(() => {
    const z = parseZone(searchParams.get("zone"));
    if (z === selectedId) return;
    if (z) {
      setSelectedId(z);
      focusCamera(z);
      setEstateMode(false);
    } else if (selectedId) {
      setSelectedId(null);
      focusCamera(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL is source
  }, [searchParams]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedId) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, onClose]);

  if (isHotel) {
    return (
      <div className="lv2-root lv2-in-shell" data-persona="gm">
        <HotelLiveComingSoon />
      </div>
    );
  }

  return (
    <div
      className="lv2-root lv2-in-shell"
      data-persona={persona}
      data-horizon={horizon}
      data-estate={estateMode ? "true" : undefined}
      data-sim={simCalm ? "calm" : simulating ? "preview" : undefined}
    >
      <div className="lv2-stage">
        {estateMode ? (
          <div className="lv2-estate" aria-label="Estate portfolio">
            <header className="lv2-estate-head">
              <p className="lv2-estate-k">Estate · {org.shortName}</p>
              <h2>8 sites · operating signal</h2>
              <p>Same physical world. Portfolio attention.</p>
            </header>
            <ul className="lv2-estate-grid">
              {ESTATE_SITES.map((site) => (
                <li key={site.id} data-tone={site.tone}>
                  <button
                    type="button"
                    onClick={() => {
                      setEstateMode(false);
                      if (site.id === "loc_berlin_mitte") {
                        onSelect("kitchen");
                      }
                    }}
                  >
                    <span className="lv2-estate-pin" aria-hidden="true" />
                    <strong>{site.label}</strong>
                    <em>
                      {site.tone === "intervene"
                        ? "Intervene"
                        : site.tone === "watch"
                          ? "Watch"
                          : "Healthy"}
                    </em>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="lv2-btn"
              data-primary="true"
              onClick={() => setEstateMode(false)}
            >
              Enter venue · {scopeName}
            </button>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="lv2-canvas"
            viewBox={`${OVERVIEW_CAMERA.x} ${OVERVIEW_CAMERA.y} ${OVERVIEW_CAMERA.w} ${OVERVIEW_CAMERA.h}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${scopeName} restaurant`}
          >
            <rect
              x={OVERVIEW_CAMERA.x}
              y={OVERVIEW_CAMERA.y}
              width={OVERVIEW_CAMERA.w}
              height={OVERVIEW_CAMERA.h}
              fill="transparent"
              onClick={() => {
                if (selectedId) onClose();
              }}
            />
            <VenueScene
              hoverId={hoverId}
              selectedId={selectedId}
              zoneSeverity={zoneSeverity}
              zones={pack.zones}
              personaKey={persona}
              simCalm={simCalm}
              onHover={onHover}
              onSelect={onSelect}
            />
          </svg>
        )}

        <div className="lv2-hud-top">
          <div className="lv2-crumb">
            <nav className="lv2-crumb-row" aria-label="Breadcrumb">
              <Link href="/app">RADR</Link>
              <span>/</span>
              <Link href="/app/live">Live</Link>
              <span>/</span>
              <button type="button" onClick={() => openLocationSwitcher()}>
                {scopeName}
              </button>
              <span>/</span>
              <strong>{estateMode ? "Estate" : "Venue"}</strong>
              {persona === "cfo" ? (
                <span className="lv2-estate-note">3 of 8 need attention</span>
              ) : null}
            </nav>
            <div className="lv2-place-line">
              <strong>{scopeName}</strong>
              <span className="lv2-live-pill">
                <i />
                {persona === "cfo" ? "TODAY" : "LIVE · 19:48"}
              </span>
              {simCalm ? (
                <span className="lv2-sim-pill" aria-live="polite">
                  SIMULATED
                </span>
              ) : null}
            </div>
            <motion.div
              key={`${persona}-${horizon}`}
              className="lv2-hero"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p>{pack.hero.line1}</p>
              <p>{pack.hero.line2}</p>
              <em>{pack.hero.attention}</em>
            </motion.div>
          </div>

          <div className="lv2-switches">
            <div className="lv2-seg" role="tablist" aria-label="Role lens">
              <button
                type="button"
                role="tab"
                aria-selected={persona === "gm"}
                data-active={persona === "gm" ? "true" : undefined}
                onClick={() => onPersona("gm")}
                title="General Manager · operations and service"
              >
                GM · Operations
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={persona === "cfo"}
                data-active={persona === "cfo" ? "true" : undefined}
                onClick={() => onPersona("cfo")}
                title="Chief Financial Officer · contribution and exposure"
              >
                CFO · Financial
              </button>
            </div>
            <div className="lv2-seg" role="tablist" aria-label="Service horizon">
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
                  aria-selected={horizon === id}
                  data-active={horizon === id ? "true" : undefined}
                  onClick={() => setHorizon(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {persona === "cfo" ? (
              <button
                type="button"
                className="lv2-estate-toggle"
                data-active={estateMode ? "true" : undefined}
                onClick={() => {
                  setEstateMode((v) => !v);
                  if (selectedId) onClose();
                }}
              >
                {estateMode ? "Enter venue" : "View estate"}
              </button>
            ) : null}
            <p className="lv2-context-quiet">{pack.question}</p>
          </div>
        </div>

        {!estateMode ? (
          <aside className="lv2-pulse-feed" aria-label="Last 5 minutes">
            <p className="lv2-pulse-k">Last 5 minutes</p>
            <ul>
              {LAST_5.map(({ line, zone }) => (
                <li key={line}>
                  <button
                    type="button"
                    className="lv2-pulse-item"
                    onClick={() => onSelect(zone)}
                  >
                    {line}
                  </button>
                </li>
              ))}
            </ul>
            <dl className="lv2-horizon-snap">
              <div>
                <dt>Occupancy</dt>
                <dd>{horizonSnap.occupancy}</dd>
              </div>
              <div>
                <dt>Kitchen</dt>
                <dd>{horizonSnap.kitchen}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{horizonSnap.delivery}</dd>
              </div>
              <div>
                <dt>Waitlist</dt>
                <dd>{horizonSnap.waitlist}</dd>
              </div>
            </dl>
          </aside>
        ) : null}

        {hints.show ? (
          <div className="lv2-hint" data-step={hints.step} role="status">
            <p>
              {hints.step === 1
                ? "Hover a zone to inspect it."
                : hints.step === 2
                  ? "Click to focus the camera."
                  : "Preview a RADR Decision to see expected impact."}
            </p>
            <button type="button" onClick={dismissHints}>
              Got it
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {inspector && !estateMode ? (
            <LiveV2Inspector
              key={`${persona}-${selectedId}`}
              data={inspector}
              simulating={simulating}
              onClose={onClose}
              onPreview={onPreview}
            />
          ) : null}
        </AnimatePresence>

        <PerfHud
          persona={persona}
          selectedId={selectedId}
          animState={animState}
          renderCount={renderCount.current}
        />
      </div>
    </div>
  );
}
