"use client";

/**
 * RADR Live · Estate — game-grade night city world (PDF 04).
 * Photographic plate + glass HUD pins + selection beacon.
 */

import { useMemo, useState } from "react";
import type { LiveEntity, LiveSeverity } from "@/lib/radr/spatial-live/types";
import "./estate-world.css";

const SEV_TONE: Record<LiveSeverity, "pos" | "neg" | "watch"> = {
  healthy: "pos",
  watch: "watch",
  intervene: "neg",
  critical: "neg",
};

/** Restaurant pin positions as % of the city plate. */
const RESTAURANT_PIN_LAYOUT: Record<string, { x: number; y: number }> = {
  loc_hamburg_hafen: { x: 38, y: 22 },
  loc_dusseldorf_medienhafen: { x: 18, y: 36 },
  loc_koln_ehrenfeld: { x: 26, y: 48 },
  loc_frankfurt_westend: { x: 34, y: 40 },
  loc_berlin_mitte: { x: 52, y: 46 },
  loc_berlin_kreuzberg: { x: 58, y: 58 },
  loc_stuttgart_mitte: { x: 64, y: 50 },
  loc_munich_altstadt: { x: 74, y: 62 },
};

/** Hotel estate pins — Northstar portfolio on shared night plate. */
const HOTEL_PIN_LAYOUT: Record<string, { x: number; y: number }> = {
  loc_canal_house: { x: 42, y: 44 },
  loc_ams_harbour: { x: 48, y: 36 },
  loc_schiphol_gate: { x: 34, y: 52 },
  loc_lisbon_alfama: { x: 22, y: 68 },
  loc_berlin_mitte_hotel: { x: 58, y: 40 },
  loc_paris_opera: { x: 52, y: 58 },
  loc_london_clerkenwell: { x: 36, y: 28 },
  loc_munich_airport: { x: 68, y: 54 },
};

type Props = {
  entities: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Double-click / Enter Property when a site is selected. */
  onEnter?: (id: string) => void;
  lens: "financial" | "operations";
  title: string;
  subtitle: string;
  plate?: string;
};

type Overlay = "heatmap" | "flows" | "traffic" | null;
type Cam = "iso" | "top";

function sparkBars(seed: number) {
  return [5, 8, 6, 11, 7, 9, 12, 8].map(
    (h, i) => 35 + (h + ((seed + i) % 4)) * 5,
  );
}

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${4 + ((i * 37) % 92)}%`,
  top: `${10 + ((i * 53) % 75)}%`,
  delay: `${(i % 9) * 0.45}s`,
  dur: `${7 + (i % 5)}s`,
  size: i % 3 === 0 ? 3 : 2,
}));

function pinValue(e: LiveEntity, lens: "financial" | "operations") {
  if (lens === "operations") {
    const occ = e.metrics.find((m) => m.id === "occ" || m.id === "occupancy");
    if (occ) return { value: occ.value, delta: occ.delta ?? "" };
    return { value: e.status, delta: "" };
  }
  const rev =
    e.metrics.find((m) => m.id === "revenue" || m.id === "rev") ?? e.metrics[0];
  return {
    value: rev?.value ?? "—",
    delta: rev?.delta ?? "",
  };
}

export function VisionEstateWorld({
  entities,
  selectedId,
  onSelect,
  onEnter,
  lens,
  title,
  subtitle,
  plate = "/demo/live/estate-berlin-night.webp",
}: Props) {
  const [cam, setCam] = useState<Cam>("iso");
  const [labels, setLabels] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const isHotel = entities.some((e) => e.vertical === "hotel");
  const pinLayout = isHotel ? HOTEL_PIN_LAYOUT : RESTAURANT_PIN_LAYOUT;

  const sites = useMemo(
    () =>
      entities.map((e, i) => {
        const pin = pinLayout[e.id] ?? {
          x: 20 + e.position.x * 0.7,
          y: 20 + e.position.y * 0.65,
        };
        const { value, delta } = pinValue(e, lens);
        const tone =
          delta.trim().startsWith("−") || delta.trim().startsWith("-")
            ? ("neg" as const)
            : SEV_TONE[e.severity] === "neg"
              ? ("neg" as const)
              : SEV_TONE[e.severity] === "watch"
                ? ("watch" as const)
                : ("pos" as const);
        return {
          e,
          x: pin.x,
          y: pin.y,
          seed: i,
          value,
          delta,
          tone,
          bars: sparkBars(i),
        };
      }),
    [entities, lens, pinLayout],
  );

  const focusId = selectedId ?? hoverId;
  const focus = sites.find((s) => s.e.id === focusId) ?? null;
  const selected = sites.find((s) => s.e.id === selectedId) ?? null;

  const stageStyle =
    cam === "iso" && selected
      ? {
          transform: `scale(1.24) translate(${(50 - selected.x) * 0.55}%, ${(48 - selected.y) * 0.45}%)`,
        }
      : undefined;

  return (
    <div
      className="rv-estate-game"
      data-lens={lens}
      data-cam={cam}
      data-vertical={isHotel ? "hotel" : "restaurant"}
      data-focused={selectedId ? "true" : undefined}
    >
      <header className="rv-eg-head" data-compact={isHotel ? "true" : undefined}>
        {isHotel ? (
          <div />
        ) : (
          <div>
            <p className="rv-eg-eyebrow">RADR Live</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        )}
        <p className="rv-eg-live">
          <i />
          LIVE · Updated 1 min ago
        </p>
      </header>

      <div className="rv-eg-stage" style={stageStyle}>
        <div
          className="rv-eg-plate"
          style={{ backgroundImage: `url(${plate})` }}
          role="img"
          aria-label={isHotel ? "Hotel estate map" : "Night city estate map"}
        />
        <div className="rv-eg-fog" aria-hidden />
        <div className="rv-eg-particles" aria-hidden>
          {PARTICLES.map((p, i) => (
            <i
              key={i}
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
        </div>

        {overlay === "heatmap" || overlay === "traffic" ? (
          <div className="rv-eg-overlay-heat" aria-hidden>
            {sites.map((s) => (
              <span
                key={`hm-${s.e.id}`}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  background:
                    s.tone === "neg"
                      ? "rgba(224,112,96,0.35)"
                      : s.tone === "watch"
                        ? "rgba(201,160,90,0.32)"
                        : "rgba(0,217,120,0.28)",
                }}
              />
            ))}
          </div>
        ) : null}

        {overlay === "flows" ? (
          <svg
            className="rv-eg-flows"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {sites.slice(0, 5).map((a, i) => {
              const b = sites[(i + 2) % sites.length]!;
              return (
                <path
                  key={a.e.id}
                  d={`M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 8} ${b.x} ${b.y}`}
                  fill="none"
                  stroke="rgba(0,217,120,0.45)"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 1.4"
                />
              );
            })}
          </svg>
        ) : null}

        {selected ? (
          <div
            className="rv-eg-beacon"
            data-tone={selected.tone}
            style={{ left: `${selected.x}%`, top: `${selected.y}%` }}
            aria-hidden
          />
        ) : null}

        {labels
          ? sites.map((s) => {
              const active = s.e.id === selectedId;
              const dim = Boolean(selectedId && !active);
              return (
                <button
                  key={s.e.id}
                  type="button"
                  className="rv-eg-pin"
                  data-active={active ? "true" : undefined}
                  data-dim={dim ? "true" : undefined}
                  data-tone={s.tone}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  onMouseEnter={() => setHoverId(s.e.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(s.e.id)}
                  onDoubleClick={() => onEnter?.(s.e.id)}
                  aria-label={`${s.e.shortLabel ?? s.e.label} ${s.value} ${s.delta}`}
                  aria-pressed={active}
                >
                  <span className="rv-eg-pin-top">
                    <i />
                    <strong>{s.e.shortLabel ?? s.e.label}</strong>
                  </span>
                  <span className="rv-eg-pin-row">
                    <span>
                      <span className="rv-eg-pin-val">{s.value}</span>
                      {s.delta ? (
                        <span className="rv-eg-pin-delta">{s.delta}</span>
                      ) : null}
                    </span>
                    <span className="rv-eg-pin-bars" aria-hidden>
                      {s.bars.map((h, i) => (
                        <b key={i} style={{ height: `${h}%` }} />
                      ))}
                    </span>
                  </span>
                  <span className="rv-eg-pin-stem" aria-hidden />
                  <span className="rv-eg-pin-dot" aria-hidden />
                </button>
              );
            })
          : null}
      </div>

      {selected && onEnter ? (
        <div className="rv-eg-enter">
          <button
            type="button"
            className="rv-eg-enter-btn"
            onClick={() => onEnter(selected.e.id)}
          >
            Enter {isHotel ? "property" : "venue"}
          </button>
        </div>
      ) : null}

      <div className="rv-eg-compass" aria-hidden>
        N
      </div>

      <div className="rv-eg-tools" role="toolbar" aria-label="Map tools">
        <div className="rp-live3-seg" role="group" aria-label="Camera">
          <button
            type="button"
            data-active={cam === "iso" ? "true" : undefined}
            onClick={() => setCam("iso")}
          >
            2.5D
          </button>
          <button
            type="button"
            data-active={cam === "top" ? "true" : undefined}
            onClick={() => setCam("top")}
          >
            Top View
          </button>
        </div>
        <button
          type="button"
          className="rv-eg-tool"
          data-active={labels ? "true" : undefined}
          onClick={() => setLabels((v) => !v)}
        >
          Labels
        </button>
        <button
          type="button"
          className="rv-eg-tool"
          data-active={overlay === "traffic" ? "true" : undefined}
          onClick={() =>
            setOverlay((o) => (o === "traffic" ? null : "traffic"))
          }
        >
          Traffic
        </button>
        <button
          type="button"
          className="rv-eg-tool"
          data-active={overlay === "heatmap" ? "true" : undefined}
          onClick={() =>
            setOverlay((o) => (o === "heatmap" ? null : "heatmap"))
          }
        >
          Heatmap
        </button>
        <button
          type="button"
          className="rv-eg-tool"
          data-active={overlay === "flows" ? "true" : undefined}
          onClick={() => setOverlay((o) => (o === "flows" ? null : "flows"))}
        >
          Flows
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {focus
          ? `${focus.e.label} ${focus.value} ${focus.delta}`
          : "Estate map"}
      </span>
    </div>
  );
}
