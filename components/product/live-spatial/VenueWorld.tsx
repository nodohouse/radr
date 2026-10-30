"use client";

import { memo, useState } from "react";
import {
  STATION_HITS,
  TABLE_POSITIONS,
  TABLES,
  ZONE_CAMERA,
  ZONE_LABEL_AT,
  ZONE_ORDER,
  type LiveLens,
  type LiveSeverity,
  type LiveStationId,
  type LiveZoneId,
  type ZoneLens,
} from "./liveSpatialData";

const VENUE_ART = {
  master: "/live/venue/venue-berlin-master.jpg?v=4k4",
};

const ZONE_DETAIL: Partial<Record<LiveZoneId, string>> = {
  main: "/live/venue/detail-dining.jpg?v=4k4",
  kitchen: "/live/venue/detail-kitchen.jpg?v=4k4",
  terrace: "/live/venue/detail-terrace.jpg?v=4k4",
  bar: "/live/venue/detail-terrace.jpg?v=4k4",
};

type Props = {
  lens: LiveLens;
  hoverZone: LiveZoneId | null;
  selectedZone: LiveZoneId | null;
  selectedStation: LiveStationId | null;
  selectedTable: string | null;
  zones: Record<LiveZoneId, ZoneLens>;
  simCalm: boolean;
  showCausal: boolean;
  pulseZone: LiveZoneId | null;
  /** Counter-scale for screen-stable labels (1 at overview; &lt;1 when zoomed in). */
  labelScale?: number;
  debugGeometry?: boolean;
  onHoverZone: (id: LiveZoneId | null) => void;
  onSelectZone: (id: LiveZoneId) => void;
  onSelectStation: (id: LiveStationId) => void;
  onSelectTable: (id: string) => void;
};

/**
 * Invisible hit regions — composed to venue master architecture.
 * Never stroke these; visual response is separate overlays.
 */
const ZONE_PATH: Record<LiveZoneId, string> = {
  terrace: "M30 240 L240 180 L310 340 L270 520 L60 530 Z",
  main: "M250 210 L540 160 L630 280 L570 440 L290 460 Z",
  kitchen: "M600 200 L860 170 L920 340 L840 470 L620 450 Z",
  bar: "M400 85 L660 65 L710 175 L540 210 L420 185 Z",
  delivery: "M660 390 L900 350 L940 500 L780 560 L640 510 Z",
  entrance: "M180 65 L370 45 L410 145 L270 175 L170 140 Z",
};

/** Soft world-response centers (architecture emphasis, not hitboxes) */
const ZONE_WARMTH: Record<LiveZoneId, { cx: number; cy: number; rx: number; ry: number }> = {
  terrace: { cx: 160, cy: 360, rx: 90, ry: 70 },
  main: { cx: 420, cy: 300, rx: 130, ry: 85 },
  kitchen: { cx: 740, cy: 310, rx: 110, ry: 80 },
  bar: { cx: 550, cy: 135, rx: 85, ry: 50 },
  delivery: { cx: 780, cy: 450, rx: 90, ry: 60 },
  entrance: { cx: 280, cy: 105, rx: 70, ry: 40 },
};

function TableHit({
  id,
  x,
  y,
  seats,
  selected,
  zoneEmphasize,
  onSelect,
}: {
  id: string;
  x: number;
  y: number;
  seats: 2 | 4;
  selected: boolean;
  zoneEmphasize: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const meta = TABLES.find((t) => t.id === id);
  const stage = meta?.stage ?? "Open";
  const state =
    stage === "Payment"
      ? "paying"
      : stage === "Open"
        ? "open"
        : stage === "Mains" || stage === "Dessert"
          ? "seated"
          : "occ";
  const wood =
    state === "paying" ? "#c4a882" : state === "open" ? "#d4c4ae" : "#b8956a";
  const seat = "#e8e2d6";
  const risk = meta?.turnRisk === "HIGH";
  const chairs =
    seats === 4
      ? [
          [0, -22],
          [0, 22],
          [-24, 0],
          [24, 0],
        ]
      : [
          [-22, 0],
          [22, 0],
        ];
  const label = `Table ${id.replace(/^t/i, "").toUpperCase()}`;
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="ls-table"
      data-selected={selected ? "true" : undefined}
      data-stage={state}
      data-risk={risk ? "high" : undefined}
      data-emphasize={zoneEmphasize || hover ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <ellipse
        cx="0"
        cy="10"
        rx="22"
        ry="10"
        fill="rgba(20, 24, 20, 0.1)"
        opacity={zoneEmphasize || hover ? 0.85 : 0.55}
      />
      {chairs.map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <rect
            x="-7"
            y="-6"
            width="14"
            height="11"
            rx="2.5"
            fill={seat}
            stroke="rgba(40, 35, 28, 0.22)"
            strokeWidth="0.7"
            opacity={zoneEmphasize || hover || selected ? 1 : 0.82}
          />
          <rect x="-5.5" y="4" width="2" height="5" rx="0.6" fill="#8a7358" />
          <rect x="3.5" y="4" width="2" height="5" rx="0.6" fill="#8a7358" />
        </g>
      ))}
      <ellipse
        cx="0"
        cy="0"
        rx="16"
        ry="10"
        fill={wood}
        stroke={
          selected
            ? "rgba(0,168,90,0.85)"
            : risk
              ? "rgba(180,35,24,0.65)"
              : "rgba(60, 45, 30, 0.35)"
        }
        strokeWidth={selected || risk ? 1.8 : 1}
        vectorEffect="non-scaling-stroke"
      />
      {risk ? (
        <circle cx="12" cy="-8" r="3.2" fill="rgba(180,35,24,0.85)" />
      ) : state === "seated" ? (
        <circle cx="0" cy="0" r="2" fill="rgba(0,217,120,0.5)" />
      ) : null}
      {hover && !selected && meta ? (
        <g transform="translate(0 -38)" style={{ pointerEvents: "none" }}>
          <rect
            x="-52"
            y="-28"
            width="104"
            height="52"
            rx="7"
            fill="rgba(255,255,255,0.96)"
            stroke="rgba(20,40,25,0.1)"
          />
          <text
            x="-44"
            y="-10"
            fontSize="9"
            fontWeight="700"
            fill="#141814"
            fontFamily="var(--font-body), Geist, sans-serif"
          >
            {label}
          </text>
          <text
            x="-44"
            y="4"
            fontSize="8"
            fill="#616962"
            fontFamily="var(--font-body), Geist, sans-serif"
          >
            {meta.covers} covers · {meta.stage}
          </text>
          <text
            x="-44"
            y="16"
            fontSize="8"
            fill="#616962"
            fontFamily="var(--font-body), Geist, sans-serif"
          >
            Finish {meta.expectedFinish}
          </text>
        </g>
      ) : null}
    </g>
  );
}

function VenueWorldInner({
  lens,
  hoverZone,
  selectedZone,
  selectedStation,
  selectedTable,
  zones,
  simCalm,
  showCausal,
  pulseZone,
  labelScale = 1,
  debugGeometry = false,
  onHoverZone,
  onSelectZone,
  onSelectStation,
  onSelectTable,
}: Props) {
  const focus = selectedZone ?? hoverZone;
  const ls = Number.isFinite(labelScale) && labelScale > 0 ? labelScale : 1;
  const kitchenSev: LiveSeverity =
    simCalm && (selectedZone === "kitchen" || selectedZone === "delivery")
      ? "watch"
      : zones.kitchen.severity;
  const deliverySev: LiveSeverity =
    simCalm && selectedZone === "delivery" ? "watch" : zones.delivery.severity;
  const expandedId = selectedZone ?? hoverZone;
  const kitchenFocused = selectedZone === "kitchen";
  const detailHref = selectedZone ? ZONE_DETAIL[selectedZone] : undefined;
  const detailCam = selectedZone ? ZONE_CAMERA[selectedZone] : null;

  return (
    <g className="ls-venue-root" data-lens={lens} data-pass="4">
      <defs>
        <radialGradient id="lsKitchenHeat" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(196,48,36,0.28)" />
          <stop offset="70%" stopColor="rgba(196,48,36,0.08)" />
          <stop offset="100%" stopColor="rgba(196,48,36,0)" />
        </radialGradient>
        <filter id="lsSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 4K master — never stretch a 1280 source across Retina + zoom */}
      <image
        href={VENUE_ART.master}
        x={0}
        y={20}
        width={960}
        height={640}
        preserveAspectRatio="xMidYMid slice"
        className="ls-venue-art"
        style={{ pointerEvents: "none" }}
      />

      {/* Zone detail plate — native tile fills camera so focus stays sharp */}
      {detailHref && detailCam ? (
        <image
          href={detailHref}
          x={detailCam.x}
          y={detailCam.y}
          width={detailCam.w}
          height={detailCam.h}
          preserveAspectRatio="xMidYMid slice"
          className="ls-venue-detail"
          opacity={selectedZone ? 1 : 0.92}
          style={{ pointerEvents: "none" }}
        />
      ) : null}

      {/* Spatial pressure — kitchen Hot/Pass (not a red polygon) */}
      {(kitchenSev === "pressure" || kitchenSev === "intervene") && !simCalm ? (
        <g className="ls-pressure-spatial" aria-hidden style={{ pointerEvents: "none" }}>
          <ellipse
            cx="780"
            cy="280"
            rx="55"
            ry="38"
            fill="rgba(196,48,36,0.16)"
            className="ls-heat-hot"
          />
          <ellipse
            cx="720"
            cy="330"
            rx="42"
            ry="28"
            fill="rgba(181,71,8,0.12)"
            className="ls-heat-pass"
          />
          <ellipse
            cx="660"
            cy="255"
            rx="36"
            ry="24"
            fill="rgba(0,217,120,0.06)"
          />
        </g>
      ) : null}

      {ZONE_ORDER.map((id) => {
        const sev =
          id === "kitchen"
            ? kitchenSev
            : id === "delivery"
              ? deliverySev
              : zones[id].severity;
        const active = selectedZone === id;
        const lift = hoverZone === id;
        const dim = Boolean(selectedZone && selectedZone !== id);
        const pulse = pulseZone === id;
        const warm = ZONE_WARMTH[id];
        return (
          <g
            key={id}
            className="ls-zone"
            data-zone={id}
            data-sev={sev}
            data-active={active ? "true" : undefined}
            data-dim={dim ? "true" : undefined}
            data-lift={lift ? "true" : undefined}
            data-pulse={pulse ? "true" : undefined}
            onMouseEnter={() => onHoverZone(id)}
            onMouseLeave={() => onHoverZone(null)}
            onClick={() => onSelectZone(id)}
            role="button"
            tabIndex={0}
            aria-label={zones[id].title}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectZone(id);
              }
            }}
          >
            {/* World response — soft warmth, not a drawn hitbox */}
            <ellipse
              cx={warm.cx}
              cy={warm.cy}
              rx={warm.rx}
              ry={warm.ry}
              className="ls-zone-warmth"
              fill={
                lift || active
                  ? sev === "intervene" || sev === "pressure"
                    ? "rgba(196,48,36,0.1)"
                    : sev === "watch"
                      ? "rgba(181,71,8,0.08)"
                      : "rgba(0,217,120,0.08)"
                  : "transparent"
              }
              style={{
                pointerEvents: "none",
                transition: "fill 140ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            {/* Selection focus — green ring, separate from severity */}
            {active ? (
              <ellipse
                cx={warm.cx}
                cy={warm.cy}
                rx={warm.rx * 0.92}
                ry={warm.ry * 0.92}
                fill="none"
                stroke="rgba(0,217,120,0.45)"
                strokeWidth="1.6"
                className="ls-zone-focus"
                style={{ pointerEvents: "none" }}
              />
            ) : null}
            {/* Invisible generous hit region — never stroked */}
            <path
              d={ZONE_PATH[id]}
              fill="rgba(0,0,0,0.001)"
              stroke="none"
              className="ls-zone-hit"
              style={
                id === "kitchen" && kitchenFocused
                  ? { pointerEvents: "none" }
                  : undefined
              }
            />
          </g>
        );
      })}

      {/* Kitchen stations — visible when kitchen focused */}
      <g
        className="ls-arch"
        data-dim={selectedZone && selectedZone !== "kitchen" ? "true" : undefined}
      >
        {kitchenFocused
          ? (Object.keys(STATION_HITS) as LiveStationId[]).map((sid) => {
              const hit = STATION_HITS[sid];
              return (
                <g
                  key={sid}
                  className="ls-station"
                  data-testid={`ls-station-${sid}`}
                  data-active={selectedStation === sid ? "true" : undefined}
                  transform={`translate(${hit.x} ${hit.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={hit.label}
                  style={{ cursor: "pointer", pointerEvents: "all" }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onSelectStation(sid);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStation(sid);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectStation(sid);
                    }
                  }}
                >
                  <rect
                    width={hit.w}
                    height={hit.h}
                    rx="3"
                    fill={
                      selectedStation === sid
                        ? "rgba(0,217,120,0.22)"
                        : "rgba(255,255,255,0.88)"
                    }
                    stroke={
                      selectedStation === sid
                        ? "rgba(0,168,90,0.7)"
                        : "rgba(20,24,20,0.16)"
                    }
                    strokeWidth="1.2"
                    style={{ pointerEvents: "all" }}
                  />
                  <text
                    x={hit.w / 2}
                    y={hit.h / 2 + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="650"
                    fill="#141814"
                    fontFamily="var(--font-body), Geist, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {hit.label}
                  </text>
                </g>
              );
            })
          : null}
      </g>

      {/* Tables — restrained states; hover reveals detail */}
      <g
        className="ls-arch"
        data-dim={
          selectedZone && selectedZone !== "main" && selectedZone !== "terrace"
            ? "true"
            : undefined
        }
      >
        {Object.entries(TABLE_POSITIONS).map(([id, pos]) => (
          <TableHit
            key={id}
            id={id}
            x={pos.x}
            y={pos.y}
            seats={pos.seats}
            selected={selectedTable === id}
            zoneEmphasize={
              hoverZone === "main" ||
              hoverZone === "terrace" ||
              selectedZone === "main" ||
              selectedZone === "terrace"
            }
            onSelect={() => onSelectTable(id)}
          />
        ))}
      </g>

      {/* Causal graph — kitchen selected */}
      {selectedZone === "kitchen" ? (
        <g className="ls-causal" aria-hidden style={{ pointerEvents: "none" }}>
          <path
            d="M780 450 Q760 380 780 290"
            fill="none"
            stroke="rgba(180,35,24,0.45)"
            strokeWidth="2"
            strokeDasharray="4 6"
            className="ls-flow"
            data-active="true"
          />
          <path
            d="M780 290 Q750 320 720 340"
            fill="none"
            stroke="rgba(181,71,8,0.4)"
            strokeWidth="1.8"
            strokeDasharray="3 5"
            className="ls-flow"
            data-active="true"
          />
          <path
            d="M720 340 Q560 320 420 300"
            fill="none"
            stroke="rgba(180,35,24,0.28)"
            strokeWidth="1.5"
            strokeDasharray="3 6"
            className="ls-flow"
            data-active="true"
          />
          <g transform="translate(520 250)">
            <rect
              x="-90"
              y="-28"
              width="180"
              height="56"
              rx="8"
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(20,40,25,0.08)"
            />
            <text
              x="-78"
              y="-8"
              fontSize="8"
              fontWeight="700"
              fill="#0f6b3c"
              fontFamily="var(--font-body), Geist, sans-serif"
            >
              RADR SEES
            </text>
            <text
              x="-78"
              y="8"
              fontSize="8.5"
              fill="#141814"
              fontFamily="var(--font-body), Geist, sans-serif"
            >
              Delivery → Hot → Pass → Dining
            </text>
            <text
              x="-78"
              y="20"
              fontSize="8"
              fill="#616962"
              fontFamily="var(--font-body), Geist, sans-serif"
            >
              +18% hot-line · €420 exposed
            </text>
          </g>
        </g>
      ) : null}

      {/* Flows — demand paths across the venue art */}
      <g className="ls-flows" data-calm={simCalm ? "true" : undefined} aria-hidden>
        <path
          className="ls-flow"
          data-route="dine-kitchen"
          data-active={
            focus === "main" || focus === "kitchen" || !selectedZone
              ? "true"
              : undefined
          }
          d="M420 300 Q560 280 700 300"
          fill="none"
          stroke="rgba(0,168,90,0.42)"
          strokeWidth="1.5"
          strokeDasharray="5 9"
        />
        <path
          className="ls-flow"
          data-route="kitchen-pass"
          data-active={focus === "kitchen" || !selectedZone ? "true" : undefined}
          d="M760 270 Q740 300 730 330"
          fill="none"
          stroke="rgba(0,168,90,0.38)"
          strokeWidth="1.4"
          strokeDasharray="4 8"
        />
        <path
          className="ls-flow"
          data-route="delivery-kitchen"
          data-active={
            focus === "delivery" || focus === "kitchen" || showCausal || !selectedZone
              ? "true"
              : undefined
          }
          data-causal={showCausal ? "true" : undefined}
          d="M780 460 Q760 390 740 320"
          fill="none"
          stroke={
            simCalm ? "rgba(0,168,90,0.35)" : "rgba(180,35,24,0.5)"
          }
          strokeWidth={showCausal ? 2.2 : 1.5}
          strokeDasharray="4 7"
        />
        {showCausal ? (
          <>
            <path
              className="ls-flow"
              data-causal="true"
              data-active="true"
              d="M740 320 Q720 340 730 330"
              fill="none"
              stroke="rgba(180,35,24,0.55)"
              strokeWidth="2"
              strokeDasharray="3 5"
              markerEnd="url(#lsCausalArrow)"
            />
            <path
              className="ls-flow"
              data-causal="true"
              data-active="true"
              d="M730 330 Q560 320 420 300"
              fill="none"
              stroke="rgba(180,35,24,0.35)"
              strokeWidth="1.6"
              strokeDasharray="3 6"
            />
          </>
        ) : null}
        <defs>
          <marker
            id="lsCausalArrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="rgba(180,35,24,0.7)" />
          </marker>
        </defs>
      </g>

      {/* Zone labels — counter-scaled so type stays screen-stable under viewBox zoom */}
      <g className="ls-svg-labels">
        {ZONE_ORDER.map((id) => {
          const lensZ = zones[id];
          const { x, y } = ZONE_LABEL_AT[id];
          const expand = expandedId === id;
          const active = selectedZone === id;
          const lift = hoverZone === id;
          const dim = Boolean(selectedZone && !active && selectedZone !== id);
          const h = expand ? 78 : 46;
          const dot =
            lensZ.severity === "pressure" || lensZ.severity === "intervene"
              ? "#b42318"
              : lensZ.severity === "watch"
                ? "#b54708"
                : "#00d978";
          // Selected always wins: never hide via dim when active
          const hideForLod = !active && ls < 0.55 && !lift;
          if (hideForLod) return null;
          return (
            <g
              key={id}
              className="ls-svg-label"
              transform={`translate(${x} ${y - (lift || active ? 6 : 0)}) scale(${ls})`}
              opacity={dim ? 0.35 : 1}
              style={{ pointerEvents: "none" }}
            >
              <rect
                x="-58"
                y="-18"
                width="116"
                height={h}
                rx="8"
                fill="rgba(255,255,255,0.94)"
                stroke={
                  active || lift
                    ? "rgba(0,168,90,0.45)"
                    : "rgba(20,24,20,0.1)"
                }
                strokeWidth="1"
                filter="drop-shadow(0 4px 12px rgba(20,40,25,0.08))"
              />
              <circle cx="-44" cy="-4" r="3.5" fill={dot} />
              <text
                x="-34"
                y="0"
                fontSize="10"
                fontWeight="700"
                fill="#141814"
                fontFamily="var(--font-body), Geist, sans-serif"
              >
                {lensZ.title}
              </text>
              <text
                x="-44"
                y="16"
                fontSize="9"
                fontWeight="560"
                fill="#616962"
                fontFamily="var(--font-body), Geist, sans-serif"
              >
                {lensZ.primary}
              </text>
              {expand ? (
                <>
                  <text
                    x="-44"
                    y="32"
                    fontSize="9"
                    fill="#616962"
                    fontFamily="var(--font-body), Geist, sans-serif"
                  >
                    {lensZ.secondary}
                  </text>
                  <text
                    x="-44"
                    y="48"
                    fontSize="9"
                    fontWeight="650"
                    fill={dot}
                    fontFamily="var(--font-body), Geist, sans-serif"
                  >
                    {lensZ.severityLabel}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
      </g>

      {debugGeometry ? (
        <g className="ls-debug-geometry" aria-hidden>
          {Object.entries(TABLE_POSITIONS).map(([id, pos]) => (
            <g key={`dbg-t-${id}`} transform={`translate(${pos.x} ${pos.y})`}>
              <circle r="3" fill="#ff00aa" />
              <rect
                x="-18"
                y="-12"
                width="36"
                height="24"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                y="-16"
                textAnchor="middle"
                fontSize="8"
                fill="#ff00aa"
                transform={`scale(${ls})`}
              >
                {id}
              </text>
            </g>
          ))}
          {ZONE_ORDER.map((id) => {
            const { x, y } = ZONE_LABEL_AT[id];
            return (
              <g key={`dbg-z-${id}`}>
                <circle cx={x} cy={y} r="4" fill="#7c3aed" />
                <path
                  d={ZONE_PATH[id]}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.7"
                />
              </g>
            );
          })}
        </g>
      ) : null}
    </g>
  );
}

export const VenueWorld = memo(VenueWorldInner);
