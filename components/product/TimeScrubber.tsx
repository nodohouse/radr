"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useProduct } from "@/lib/product/store";
import {
  OPERATING_SERVICE_TIMES,
  formatServiceTimeLabel,
  isMajorServiceTime,
  type OperatingServiceTime,
} from "@/lib/radr/operatingCanvas";

type Props = {
  className?: string;
  compact?: boolean;
  /** One line that changes with the scrubbed moment */
  insight?: string;
  /** When set, insight is an attention act control */
  onInsightAct?: () => void;
  insightActLabel?: string;
};

const STOPS = OPERATING_SERVICE_TIMES;
const LAST = STOPS.length - 1;
const HOUR_MARKS = STOPS.filter(isMajorServiceTime);

/** Relative service pressure across the evening - shapes the demand wave. */
const PRESSURE: Record<string, number> = {
  now: 0.58,
  "18:00": 0.32,
  "18:15": 0.38,
  "18:30": 0.45,
  "18:45": 0.55,
  "19:00": 0.72,
  "19:15": 0.84,
  "19:30": 0.94,
  "19:45": 0.98,
  "20:00": 1,
  "20:15": 0.92,
  "20:30": 0.78,
  "20:45": 0.55,
  "21:00": 0.38,
  close: 0.12,
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function indexOfTime(t: OperatingServiceTime): number {
  const i = STOPS.indexOf(t);
  return i < 0 ? 0 : i;
}

function timeFromRatio(ratio: number): OperatingServiceTime {
  const idx = Math.round(clamp01(ratio) * LAST);
  return STOPS[idx] ?? "now";
}

function phaseFor(t: OperatingServiceTime): { id: string; label: string } {
  if (t === "now") return { id: "live", label: "Live now" };
  if (t === "close") return { id: "close", label: "Service closed" };
  if (t <= "18:45") return { id: "open", label: "Dinner opening" };
  if (t <= "20:30") return { id: "peak", label: "Peak service" };
  return { id: "wind", label: "Wind-down" };
}

/**
 * Service evening timeline - drag to replay the floor.
 * Demand wave + phase + insight, not a naked slider.
 */
export function TimeScrubber({
  className = "",
  compact = false,
  insight,
  onInsightAct,
  insightActLabel,
}: Props) {
  const { serviceTime, setServiceTime, timeFormat } = useProduct();
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const labelId = useId();

  const index = indexOfTime(serviceTime);
  const snappedRatio = LAST === 0 ? 0 : index / LAST;
  const ratio = dragRatio ?? snappedRatio;
  const active =
    dragRatio != null ? timeFromRatio(dragRatio) : serviceTime;
  const label = formatServiceTimeLabel(active, timeFormat);
  const phase = phaseFor(active);
  const pressure = PRESSURE[active] ?? 0.5;

  const wave = useMemo(() => {
    const w = 320;
    const h = 36;
    const pad = 2;
    const pts = STOPS.map((t, i) => {
      const x = pad + (i / LAST) * (w - pad * 2);
      const p = PRESSURE[t] ?? 0.4;
      const y = h - pad - p * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const first = pts[0]!.split(",")[0];
    const last = pts[pts.length - 1]!.split(",")[0];
    return {
      w,
      h,
      area: `M ${first},${h} L ${pts.join(" L ")} L ${last},${h} Z`,
      line: `M ${pts.join(" L ")}`,
    };
  }, []);

  const ratioFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return clamp01((clientX - rect.left) / rect.width);
  }, []);

  const applyRatio = useCallback(
    (nextRatio: number, commit: boolean) => {
      setDragRatio(nextRatio);
      if (commit) setServiceTime(timeFromRatio(nextRatio));
    },
    [setServiceTime],
  );

  const endDrag = useCallback(() => {
    setDragRatio((r) => {
      if (r != null) setServiceTime(timeFromRatio(r));
      return null;
    });
    setDragging(false);
    pointerIdRef.current = null;
  }, [setServiceTime]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: PointerEvent) => {
      if (
        pointerIdRef.current != null &&
        e.pointerId !== pointerIdRef.current
      ) {
        return;
      }
      e.preventDefault();
      applyRatio(ratioFromClientX(e.clientX), true);
    };

    const onUp = (e: PointerEvent) => {
      if (
        pointerIdRef.current != null &&
        e.pointerId !== pointerIdRef.current
      ) {
        return;
      }
      const el = trackRef.current;
      if (el && pointerIdRef.current != null) {
        try {
          el.releasePointerCapture(pointerIdRef.current);
        } catch {
          /* already released */
        }
      }
      endDrag();
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, applyRatio, ratioFromClientX, endDrag]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    applyRatio(ratioFromClientX(e.clientX), true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = STOPS[Math.min(LAST, index + 1)];
      if (next) setServiceTime(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = STOPS[Math.max(0, index - 1)];
      if (next) setServiceTime(next);
    } else if (e.key === "Home") {
      e.preventDefault();
      setServiceTime(STOPS[0]!);
    } else if (e.key === "End") {
      e.preventDefault();
      setServiceTime(STOPS[LAST]!);
    }
  };

  return (
    <div
      className={`rp-scrub rp-scrub-service ${compact ? "rp-scrub-compact" : ""} ${className}`.trim()}
      data-dragging={dragging ? "true" : "false"}
      data-phase={phase.id}
    >
      <div className="rp-scrub-meta">
        <span className="rp-scrub-live" id={labelId} aria-live="polite">
          {label}
        </span>
        <span className="rp-scrub-phase">{phase.label}</span>
      </div>

      <div
        ref={trackRef}
        className="rp-scrub-track"
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={LAST}
        aria-valuenow={index}
        aria-valuetext={`${label} · ${phase.label}`}
        aria-labelledby={labelId}
        aria-label="Service time"
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        <svg
          className="rp-scrub-wave"
          viewBox={`0 0 ${wave.w} ${wave.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rp-scrub-wave-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,168,90,0.35)" />
              <stop offset="100%" stopColor="rgba(0,168,90,0.02)" />
            </linearGradient>
          </defs>
          <path d={wave.area} fill="url(#rp-scrub-wave-fill)" />
          <path
            d={wave.line}
            fill="none"
            stroke="rgba(0,168,90,0.55)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="rp-scrub-rail" aria-hidden="true" />
        <div
          className="rp-scrub-fill"
          style={{ width: `calc((100% - 1.5rem) * ${ratio})` }}
          aria-hidden="true"
        />

        <div className="rp-scrub-ticks" aria-hidden="true">
          {HOUR_MARKS.map((id) => {
            const i = indexOfTime(id);
            const mark =
              id === "now"
                ? "Now"
                : id === "close"
                  ? "Close"
                  : formatServiceTimeLabel(id, timeFormat).replace(
                      /:00\s*(AM|PM)?/i,
                      (_, ampm) => (ampm ? ` ${ampm}` : ""),
                    );
            return (
              <span
                key={id}
                className="rp-scrub-tick"
                data-active={
                  !dragging && serviceTime === id ? "true" : "false"
                }
                data-major="true"
                style={{ left: `${(i / LAST) * 100}%` }}
              >
                <i />
                <em>{mark}</em>
              </span>
            );
          })}
        </div>

        <div
          className="rp-scrub-thumb"
          style={{
            left: `calc(0.75rem + (100% - 1.5rem) * ${ratio})`,
          }}
          data-pressure={
            pressure >= 0.85 ? "peak" : pressure >= 0.55 ? "busy" : "calm"
          }
          aria-hidden="true"
        />
      </div>

      {insight ? (
        onInsightAct ? (
          <button
            type="button"
            className="rp-scrub-insight rp-scrub-insight--act"
            data-phase={phase.id}
            onClick={onInsightAct}
          >
            <span>{insight}</span>
            <em>{insightActLabel ?? "Act"}</em>
          </button>
        ) : (
          <p className="rp-scrub-insight" data-phase={phase.id}>
            {insight}
          </p>
        )
      ) : null}
    </div>
  );
}
