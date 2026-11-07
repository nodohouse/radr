"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { signalDescription } from "@/lib/product/guestSignals";
import type {
  HospitalityWorldProps,
  SpatialCamera,
  SpatialEntity,
} from "./types";
import { toneColor } from "./types";
import "./hospitality-world.css";

const Scene = dynamic(() => import("./HospitalityScene"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function EntityMarker({
  entity,
  selected,
  onSelect,
  onHover,
}: {
  entity: SpatialEntity;
  selected: boolean;
  onSelect: () => void;
  onHover: (value: boolean) => void;
}) {
  const start = useRef({ x: 0, y: 0 });
  const allergy = entity.signals.some((s) => s.kind === "allergy");
  const occasion = entity.signals.some((s) => s.kind === "occasion");
  const remark = entity.signals.some((s) => s.kind === "remark");
  return (
    <button
      type="button"
      className="hw-marker"
      data-selected={selected || undefined}
      data-layout-item={entity.id}
      data-testid={`spatial-entity-${entity.id}`}
      style={{ "--entity-tone": toneColor(entity.tone) } as React.CSSProperties}
      aria-label={`${entity.label}, ${entity.status}. ${entity.detail}. ${signalDescription(entity.signals)}`}
      aria-pressed={selected}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={(e) => {
        if (
          e.detail === 0 ||
          Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) <
            6
        )
          onSelect();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <i />
      <strong>{entity.number}</strong>
      {allergy ? (
        <span
          className="hw-marker-alert"
          data-guest-signal="allergy"
          aria-hidden="true"
        >
          !
        </span>
      ) : null}
      {occasion ? (
        <span
          className="hw-marker-occasion"
          data-guest-signal="occasion"
          aria-hidden="true"
        >
          ★
        </span>
      ) : null}
      {remark ? (
        <span
          className="hw-marker-note"
          data-guest-signal="remark"
          aria-hidden="true"
        >
          ≡
        </span>
      ) : null}
    </button>
  );
}
/** A hardware-independent, interactive isometric view is retained if WebGL is unavailable. */
function IsometricFallback(
  props: HospitalityWorldProps & {
    onHover: (id: string | null) => void;
    onCamera: (state: string) => void;
    bridge: React.MutableRefObject<SpatialCamera | null>;
  },
) {
  const [view, setView] = useState({
    angle: -24,
    tilt: 48,
    zoom: 1,
    x: 0,
    y: 0,
  });
  const root = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; view: typeof view } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const { bridge, onCamera } = props;
  useEffect(() => {
    bridge.current = {
      reset: () => setView({ angle: -24, tilt: 48, zoom: 1, x: 0, y: 0 }),
      zoom: (f) =>
        setView((v) => ({
          ...v,
          zoom: Math.max(0.65, Math.min(3, v.zoom / f)),
        })),
      top: () => setView((v) => ({ ...v, tilt: 0, angle: 0 })),
      pan: (x, y) => setView((v) => ({ ...v, x: v.x + x, y: v.y + y })),
    };
    return () => {
      bridge.current = null;
    };
  }, [bridge]);
  useEffect(() => {
    onCamera(JSON.stringify(view));
  }, [view, onCamera]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => ({
        ...v,
        zoom: Math.max(
          0.65,
          Math.min(
            3,
            v.zoom * Math.exp(-Math.max(-200, Math.min(200, e.deltaY)) * 0.002),
          ),
        ),
      }));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);
  return (
    <div
      ref={root}
      className="hw-fallback"
      data-testid="spatial-fallback"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size === 2) {
          pinch.current = { distance: distance(), zoom: view.zoom };
          drag.current = null;
          e.currentTarget.setPointerCapture(e.pointerId);
        } else drag.current = { x: e.clientX, y: e.clientY, view };
      }}
      onPointerMove={(e) => {
        if (pointers.current.has(e.pointerId))
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch.current && pointers.current.size === 2) {
          const zoom =
            (pinch.current.zoom * distance()) /
            Math.max(1, pinch.current.distance);
          setView((v) => ({ ...v, zoom: Math.max(0.65, Math.min(3, zoom)) }));
          return;
        }
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x,
          dy = e.clientY - drag.current.y;
        if (Math.hypot(dx, dy) > 5) {
          e.currentTarget.setPointerCapture(e.pointerId);
          setView({
            ...drag.current.view,
            angle: drag.current.view.angle + dx * 0.22,
            tilt: Math.max(
              10,
              Math.min(62, drag.current.view.tilt + dy * 0.15),
            ),
          });
        }
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div
        className="hw-fallback-floor"
        data-kind={props.kind}
        style={{
          aspectRatio: `${props.width}/${props.depth}`,
          transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom}) rotateX(${view.tilt}deg) rotateZ(${view.angle}deg)`,
        }}
      >
        {props.entities.map((e) => (
          <div
            className="hw-fallback-object"
            data-kind={props.kind}
            key={e.id}
            style={{
              left: `${(e.x / props.width + 0.5) * 100}%`,
              top: `${(e.z / props.depth + 0.5) * 100}%`,
              width: `${(e.width / props.width) * 100}%`,
              height: `${(e.depth / props.depth) * 100}%`,
            }}
          >
            <div className="hw-fallback-furniture" />
            <EntityMarker
              entity={e}
              selected={props.selected === e.id}
              onSelect={() => props.onSelect(e.id)}
              onHover={(v) => props.onHover(v ? e.id : null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export function HospitalityWorld(props: HospitalityWorldProps) {
  const [capable, setCapable] = useState<boolean | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [camera, setCamera] = useState("");
  const bridge = useRef<SpatialCamera | null>(null);
  const { cameraRef } = props;
  useEffect(() => {
    if (cameraRef)
      cameraRef.current = {
        reset: () => bridge.current?.reset(),
        zoom: (f) => bridge.current?.zoom(f),
        top: () => bridge.current?.top(),
        pan: (x, z) => bridge.current?.pan(x, z),
      };
    return () => {
      if (cameraRef) cameraRef.current = null;
    };
  }, [cameraRef]);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setCapable(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);
  const focus = props.entities.find((e) => e.id === (hover || props.selected));
  const fallback = (
    <IsometricFallback
      {...props}
      bridge={bridge}
      onHover={setHover}
      onCamera={setCamera}
    />
  );
  return (
    <section
      className="hw-root"
      data-kind={props.kind}
      data-renderer={
        capable === null ? "loading" : capable ? "webgl" : "isometric"
      }
      data-camera={camera}
      aria-label={`${props.label} spatial operation`}
    >
      <div
        className="hw-stage"
        tabIndex={0}
        role="region"
        aria-label={`${props.label}. Drag to rotate, shift-drag to pan, scroll or pinch to zoom. Select a ${props.kind === "hotel" ? "room" : "table"} for details.`}
        onDoubleClick={(e) => {
          if (!(e.target as Element).closest("button")) bridge.current?.reset();
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          };
          if (moves[e.key]) {
            e.preventDefault();
            bridge.current?.pan(...moves[e.key]);
          } else if (["+", "=", "-", "0", "Home"].includes(e.key)) {
            e.preventDefault();
            if (e.key === "0" || e.key === "Home") bridge.current?.reset();
            else bridge.current?.zoom(e.key === "-" ? 1.15 : 0.87);
          }
        }}
      >
        {capable === null ? (
          <div className="hw-loading">
            <span />
            <p>Opening your operation</p>
          </div>
        ) : capable ? (
          <SceneBoundary
            fallback={fallback}
            onFailure={() => setCapable(false)}
          >
            <Scene
              {...props}
              bridge={bridge}
              onHover={setHover}
              onCamera={setCamera}
            />
          </SceneBoundary>
        ) : (
          fallback
        )}
      </div>
      <div className="hw-heading">
        <span className="hw-kicker">
          {props.kind === "hotel" ? "PROPERTY CUTAWAY" : "SERVICE WORLD"}
        </span>
        <h3>{props.label}</h3>
        <p>
          {props.entities.length} {props.kind === "hotel" ? "rooms" : "tables"}{" "}
          · spatial operating model
        </p>
      </div>
      <div className="hw-camera-tools">
        <button
          type="button"
          onClick={() => bridge.current?.top()}
          aria-label="View from above"
          title="View from above"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => bridge.current?.reset()}
          aria-label="Reset spatial view"
          title="Reset view"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 9a8 8 0 1 1-1 6M5 4v5h5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {focus ? (
        <div className="hw-context" aria-live="polite">
          <div>
            <i style={{ background: toneColor(focus.tone) }} />
            <strong>{focus.label}</strong>
            <span>{focus.status}</span>
          </div>
          <p>{focus.detail}</p>
          {focus.signals
            .filter((s) => s.kind !== "remark")
            .map((s, i) => (
              <small
                className={
                  s.kind === "allergy" ? "hw-context-alert" : undefined
                }
                key={`${s.scope}-${s.kind}-${i}`}
              >
                <b>
                  {s.scope === "incoming" ? "Next booking" : "Current guest"}:
                </b>{" "}
                {s.detail}
              </small>
            ))}
        </div>
      ) : null}
      <div className="hw-hint">
        <span>Drag to orbit</span>
        <span>Shift + drag to pan</span>
        <span>Scroll / pinch to zoom</span>
      </div>
      <details className="hw-access-list">
        <summary>
          {props.kind === "hotel" ? "Find a room" : "Find a table"}
        </summary>
        <div>
          {props.entities.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => props.onSelect(e.id)}
            >
              <i style={{ background: toneColor(e.tone) }} />
              {e.label}
              <small>
                {e.status}
                {e.signals.some((s) => s.kind === "allergy")
                  ? " · Allergy alert"
                  : ""}
              </small>
            </button>
          ))}
        </div>
      </details>
    </section>
  );
}
