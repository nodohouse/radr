"use client";

/**
 * Memoized Soho · New York 2.5D restaurant geometry.
 * Static architectural model — overlays handle intelligence.
 */

import { memo } from "react";
import {
  ZONE_LABEL_AT,
  ZONE_ORDER,
  type LiveV2Severity,
  type LiveV2ZoneId,
  type LiveV2ZoneLens,
} from "./liveV2Data";

type Props = {
  hoverId: LiveV2ZoneId | null;
  selectedId: LiveV2ZoneId | null;
  zoneSeverity: Record<LiveV2ZoneId, LiveV2Severity>;
  zones: Record<LiveV2ZoneId, LiveV2ZoneLens>;
  personaKey: string;
  simCalm: boolean;
  onHover: (id: LiveV2ZoneId | null) => void;
  onSelect: (id: LiveV2ZoneId) => void;
};

const SEV_STROKE: Record<LiveV2Severity, string> = {
  healthy: "rgba(0, 168, 90, 0.55)",
  watch: "rgba(181, 71, 8, 0.55)",
  pressure: "rgba(180, 35, 24, 0.55)",
  intervene: "rgba(180, 35, 24, 0.7)",
};

const SEV_FILL: Record<LiveV2Severity, string> = {
  healthy: "rgba(0, 217, 120, 0.14)",
  watch: "rgba(181, 71, 8, 0.1)",
  pressure: "rgba(180, 35, 24, 0.12)",
  intervene: "rgba(180, 35, 24, 0.16)",
};

function Table({
  x,
  y,
  seats = 4,
  state = "occ",
}: {
  x: number;
  y: number;
  seats?: 2 | 4;
  state?: "occ" | "open" | "turn";
}) {
  const top =
    state === "occ"
      ? "#dfe8e1"
      : state === "turn"
        ? "#ebe0d0"
        : "#e8ece7";
  return (
    <g transform={`translate(${x} ${y})`} className="lv2-table">
      <ellipse cx="0" cy="5" rx="16" ry="9" fill="rgba(20, 24, 20, 0.08)" />
      <ellipse
        cx="0"
        cy="0"
        rx="15"
        ry="8.5"
        fill={top}
        stroke="rgba(20, 24, 20, 0.12)"
        strokeWidth="0.8"
      />
      <ellipse cx="0" cy="-1" rx="10" ry="5" fill="rgba(255,255,255,0.45)" />
      {(seats === 4
        ? [
            [-12, -8],
            [12, -8],
            [-12, 8],
            [12, 8],
          ]
        : [
            [-11, 0],
            [11, 0],
          ]
      ).map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="3.2"
          ry="2.4"
          fill="#d4dbd4"
          stroke="rgba(20, 24, 20, 0.1)"
          strokeWidth="0.5"
        />
      ))}
      {state === "occ" ? (
        <circle cx="0" cy="0" r="1.6" fill="rgba(0,217,120,0.45)" />
      ) : null}
    </g>
  );
}

function ZoneHit({
  id,
  d,
  severity,
  active,
  dim,
  lift,
  onHover,
  onSelect,
}: {
  id: LiveV2ZoneId;
  d: string;
  severity: LiveV2Severity;
  active: boolean;
  dim: boolean;
  lift: boolean;
  onHover: (id: LiveV2ZoneId | null) => void;
  onSelect: (id: LiveV2ZoneId) => void;
}) {
  return (
    <g
      className="lv2-zone"
      data-zone={id}
      data-active={active ? "true" : undefined}
      data-dim={dim ? "true" : undefined}
      data-lift={lift ? "true" : undefined}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      aria-label={id}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <path
        d={d}
        fill={SEV_FILL[severity]}
        stroke={active || lift ? SEV_STROKE[severity] : "rgba(20, 24, 20, 0.12)"}
        strokeWidth={active ? 2.2 : lift ? 1.6 : 1}
        className="lv2-zone-floor"
      />
    </g>
  );
}

function expandMetrics(lens: LiveV2ZoneLens) {
  const ticket =
    /ticket|avg/i.test(lens.secondary) ? lens.secondary : "—";
  return {
    load: lens.primary,
    ticket,
    pressure: lens.severityLabel,
  };
}

function ZoneLabel({
  id,
  lens,
  expand,
  active,
  dim,
  lift,
}: {
  id: LiveV2ZoneId;
  lens: LiveV2ZoneLens;
  expand: boolean;
  active: boolean;
  dim: boolean;
  lift: boolean;
}) {
  const { x, y } = ZONE_LABEL_AT[id];
  const facts = expandMetrics(lens);
  const h = expand ? 82 : 48;
  const stroke =
    lens.severity === "pressure" || lens.severity === "intervene"
      ? "rgba(180,35,24,0.45)"
      : lens.severity === "watch"
        ? "rgba(181,71,8,0.4)"
        : active || lift
          ? "rgba(0,168,90,0.45)"
          : "rgba(20, 24, 20, 0.1)";
  const dot =
    lens.severity === "pressure" || lens.severity === "intervene"
      ? "#b42318"
      : lens.severity === "watch"
        ? "#b54708"
        : "#00d978";

  return (
    <g
      className="lv2-svg-label"
      transform={`translate(${x} ${y - (lift || active ? 6 : 0)})`}
      opacity={dim ? 0.32 : 1}
      style={{ transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1)" }}
      pointerEvents="none"
    >
      <rect
        x={-4}
        y={-14}
        width={148}
        height={h}
        rx={8}
        fill="rgba(255,255,255,0.96)"
        stroke={stroke}
        strokeWidth={active ? 1.6 : 1}
      />
      <circle cx={10} cy={0} r={3.2} fill={dot} />
      <text
        x={20}
        y={3}
        fill="#616962"
        fontSize={9}
        fontWeight={650}
        letterSpacing={0.8}
        style={{ textTransform: "uppercase" }}
      >
        {lens.title}
      </text>
      <text x={10} y={20} fill="#141814" fontSize={13} fontWeight={650}>
        {lens.primary}
      </text>
      {expand ? (
        <>
          <text x={10} y={36} fill="#616962" fontSize={9}>
            Load · {facts.load}
          </text>
          <text x={10} y={50} fill="#616962" fontSize={9}>
            Ticket · {facts.ticket}
          </text>
          <text x={10} y={64} fill="#8a918b" fontSize={9}>
            Pressure · {facts.pressure}
          </text>
        </>
      ) : (
        <text x={10} y={36} fill="#616962" fontSize={9.5}>
          {lens.severityLabel}
        </text>
      )}
    </g>
  );
}

function VenueSceneInner({
  hoverId,
  selectedId,
  zoneSeverity,
  zones,
  personaKey,
  simCalm,
  onHover,
  onSelect,
}: Props) {
  const focus = selectedId ?? hoverId;
  const calm = simCalm;
  const expandedId = selectedId ?? hoverId;
  const kitchenSev: LiveV2Severity =
    calm && (selectedId === "kitchen" || selectedId === "delivery")
      ? "watch"
      : zoneSeverity.kitchen;
  const deliverySev: LiveV2Severity =
    calm && selectedId === "delivery" ? "watch" : zoneSeverity.delivery;

  return (
    <g className="lv2-venue-root">
      <defs>
        <linearGradient id="lv2Floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f6f1" />
          <stop offset="100%" stopColor="#e8ede8" />
        </linearGradient>
        <linearGradient id="lv2Wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8e2" />
          <stop offset="100%" stopColor="#d4dbd4" />
        </linearGradient>
        <linearGradient id="lv2Timber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c4ae" />
          <stop offset="100%" stopColor="#c2b094" />
        </linearGradient>
        <radialGradient id="lv2Ambient" cx="48%" cy="42%" r="55%">
          <stop offset="0%" stopColor="rgba(255,210,160,0.16)" />
          <stop offset="55%" stopColor="rgba(0,217,120,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Room slab — solid architectural mass */}
      <path
        d="M80 200 L480 80 L880 220 L480 360 Z"
        fill="url(#lv2Floor)"
        stroke="rgba(20, 24, 20, 0.1)"
        strokeWidth={1.2}
      />
      <path
        d="M80 200 L80 420 L480 560 L480 360 Z"
        fill="#dce3dc"
        stroke="rgba(20, 24, 20, 0.08)"
      />
      <path
        d="M880 220 L880 440 L480 560 L480 360 Z"
        fill="#d4dbd4"
        stroke="rgba(20, 24, 20, 0.08)"
      />
      {/* stone edge band */}
      <path
        d="M80 200 L480 80 L880 220"
        fill="none"
        stroke="rgba(20, 24, 20, 0.14)"
        strokeWidth={2.5}
      />
      <ellipse cx="480" cy="320" rx="340" ry="160" fill="url(#lv2Ambient)" />

      {/* Zone floors (hit targets) */}
      <ZoneHit
        id="main"
        d="M220 240 L460 160 L620 240 L560 360 L280 400 Z"
        severity={zoneSeverity.main}
        active={selectedId === "main"}
        dim={Boolean(selectedId && selectedId !== "main")}
        lift={hoverId === "main"}
        onHover={onHover}
        onSelect={onSelect}
      />
      <ZoneHit
        id="kitchen"
        d="M100 340 L260 300 L320 440 L140 480 Z"
        severity={kitchenSev}
        active={selectedId === "kitchen"}
        dim={Boolean(selectedId && selectedId !== "kitchen")}
        lift={hoverId === "kitchen"}
        onHover={onHover}
        onSelect={onSelect}
      />
      <ZoneHit
        id="bar"
        d="M560 140 L740 120 L780 220 L600 250 Z"
        severity={zoneSeverity.bar}
        active={selectedId === "bar"}
        dim={Boolean(selectedId && selectedId !== "bar")}
        lift={hoverId === "bar"}
        onHover={onHover}
        onSelect={onSelect}
      />
      <ZoneHit
        id="terrace"
        d="M600 340 L820 310 L860 440 L640 480 Z"
        severity={zoneSeverity.terrace}
        active={selectedId === "terrace"}
        dim={Boolean(selectedId && selectedId !== "terrace")}
        lift={hoverId === "terrace"}
        onHover={onHover}
        onSelect={onSelect}
      />
      <ZoneHit
        id="delivery"
        d="M300 450 L460 420 L500 520 L340 550 Z"
        severity={deliverySev}
        active={selectedId === "delivery"}
        dim={Boolean(selectedId && selectedId !== "delivery")}
        lift={hoverId === "delivery"}
        onHover={onHover}
        onSelect={onSelect}
      />

      {/* Partition walls / columns */}
      <g opacity="0.7" pointerEvents="none">
        <path
          d="M260 300 L275 292 L278 340 L263 348 Z"
          fill="#c9d2c9"
          stroke="rgba(20, 24, 20, 0.1)"
        />
        <path
          d="M540 220 L555 212 L558 255 L543 263 Z"
          fill="#c9d2c9"
          stroke="rgba(20, 24, 20, 0.1)"
        />
        <path
          d="M300 420 L318 412 L322 455 L304 463 Z"
          fill="#bcc6bc"
        />
      </g>

      {/* Architectural cues — Main Dining */}
      <g
        className="lv2-arch"
        data-dim={selectedId && selectedId !== "main" ? "true" : undefined}
      >
        <Table x={320} y={250} state="occ" />
        <Table x={380} y={280} state="turn" />
        <Table x={440} y={230} state="occ" />
        <Table x={490} y={290} state="occ" />
        <Table x={360} y={330} state="open" seats={2} />
        <Table x={520} y={330} state="turn" />
        <Table x={420} y={350} seats={2} state="occ" />
        <Table x={470} y={250} seats={2} state="occ" />
        {/* banquettes */}
        <path
          d="M250 300 L310 275 L320 295 L260 320 Z"
          fill="url(#lv2Timber)"
          opacity="0.85"
        />
        <path
          d="M540 200 L600 175 L610 200 L550 225 Z"
          fill="url(#lv2Timber)"
          opacity="0.75"
        />
        {/* service station */}
        <path
          d="M300 360 L340 345 L348 365 L308 380 Z"
          fill="#d0d8d0"
          stroke="rgba(20, 24, 20, 0.1)"
        />
      </g>

      {/* Kitchen stations */}
      <g
        className="lv2-arch"
        data-dim={selectedId && selectedId !== "kitchen" ? "true" : undefined}
      >
        <path
          d="M120 355 L230 320 L245 355 L135 390 Z"
          fill="#e6ebe6"
          stroke="rgba(20, 24, 20, 0.12)"
        />
        <path
          d="M135 390 L245 355 L245 375 L135 410 Z"
          fill="#d4dbd4"
        />
        <path
          d="M150 400 L230 375 L240 405 L160 430 Z"
          fill="#cfd6cf"
          stroke="rgba(20, 24, 20, 0.1)"
        />
        {/* pass */}
        <path
          d="M200 430 L270 410 L275 425 L205 445 Z"
          fill={calm ? "rgba(0,217,120,0.35)" : "rgba(180,35,24,0.35)"}
          stroke="rgba(20, 24, 20, 0.12)"
        />
        {/* heat lamps */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx={145 + i * 22}
            cy={348 + i * -6}
            rx="4"
            ry="2.5"
            fill={calm ? "rgba(255,180,80,0.4)" : "rgba(255,140,60,0.75)"}
            className="lv2-heat"
          />
        ))}
      </g>

      {/* Bar counter */}
      <g
        className="lv2-arch"
        data-dim={selectedId && selectedId !== "bar" ? "true" : undefined}
      >
        <path
          d="M580 160 L740 145 L750 195 L590 215 Z"
          fill="url(#lv2Timber)"
          stroke="rgba(20, 24, 20, 0.12)"
        />
        <path
          d="M590 215 L750 195 L750 215 L590 235 Z"
          fill="#b5a48c"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={610 + i * 28}
            cy={175}
            rx="4"
            ry="2.5"
            fill="#ebe4da"
            stroke="rgba(20, 24, 20, 0.1)"
          />
        ))}
        <rect
          x="700"
          y="150"
          width="18"
          height="40"
          rx="2"
          fill="#c9d2c9"
          opacity="0.9"
        />
      </g>

      {/* Terrace furniture */}
      <g
        className="lv2-arch"
        data-dim={selectedId && selectedId !== "terrace" ? "true" : undefined}
      >
        <Table x={680} y={380} seats={2} state="open" />
        <Table x={740} y={360} state="occ" />
        <Table x={780} y={410} seats={2} state="open" />
        <Table x={700} y={430} state="open" />
        {/* planter */}
        <ellipse cx="820" cy="350" rx="18" ry="10" fill="#c5d4c8" />
        <ellipse cx="820" cy="345" rx="12" ry="7" fill="#9eb8a4" />
      </g>

      {/* Delivery / Pass staging */}
      <g
        className="lv2-arch"
        data-dim={selectedId && selectedId !== "delivery" ? "true" : undefined}
      >
        <rect
          x="340"
          y="470"
          width="70"
          height="36"
          rx="3"
          transform="skewX(-10)"
          fill="#e6ebe6"
          stroke={
            deliverySev === "intervene"
              ? "rgba(180,35,24,0.5)"
              : "rgba(20, 24, 20, 0.12)"
          }
        />
        <rect
          x="355"
          y="478"
          width="22"
          height="14"
          rx="1"
          fill="rgba(20, 24, 20, 0.06)"
        />
        <rect
          x="385"
          y="478"
          width="22"
          height="14"
          rx="1"
          fill="rgba(20, 24, 20, 0.06)"
        />
      </g>

      {/* Entrance / circulation */}
      <g opacity="0.7">
        <path
          d="M470 120 L510 108 L520 140 L480 155 Z"
          fill="#d4dbd4"
          stroke="rgba(20, 24, 20, 0.12)"
        />
        <path
          d="M400 200 Q480 170 560 200"
          fill="none"
          stroke="rgba(20, 24, 20, 0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Operating flows — Dining → Kitchen → Pass · Delivery → Kitchen */}
      <g className="lv2-flows" data-calm={calm ? "true" : undefined} aria-hidden>
        <path
          className="lv2-flow"
          data-route="dine-kitchen"
          data-active={
            focus === "main" || focus === "kitchen" || !selectedId
              ? "true"
              : undefined
          }
          data-calm={calm ? "true" : undefined}
          d="M440 290 Q360 320 260 360"
          fill="none"
          stroke="rgba(0,168,90,0.42)"
          strokeWidth="1.5"
          strokeDasharray="5 9"
        />
        <path
          className="lv2-flow"
          data-route="kitchen-pass"
          data-active={
            focus === "kitchen" || focus === "main" || !selectedId
              ? "true"
              : undefined
          }
          data-calm={calm ? "true" : undefined}
          d="M250 375 Q235 405 240 432"
          fill="none"
          stroke="rgba(0,168,90,0.38)"
          strokeWidth="1.4"
          strokeDasharray="4 8"
        />
        <path
          className="lv2-flow"
          data-route="delivery-kitchen"
          data-active={
            focus === "delivery" || focus === "kitchen" || !selectedId
              ? "true"
              : undefined
          }
          data-calm={calm ? "true" : undefined}
          d="M400 490 Q320 440 230 395"
          fill="none"
          stroke={
            calm ? "rgba(0,168,90,0.35)" : "rgba(180,35,24,0.42)"
          }
          strokeWidth="1.5"
          strokeDasharray="4 7"
        />
      </g>

      {/* Intelligence labels — inside SVG so they track the camera */}
      <g key={personaKey} className="lv2-svg-labels">
        {ZONE_ORDER.map((id) => {
          const active = selectedId === id;
          return (
            <ZoneLabel
              key={`${personaKey}-${id}`}
              id={id}
              lens={zones[id]}
              expand={expandedId === id}
              active={active}
              dim={Boolean(selectedId && !active)}
              lift={hoverId === id}
            />
          );
        })}
      </g>
    </g>
  );
}

export const VenueScene = memo(VenueSceneInner);
