"use client";

/**
 * EconomicRail — elegant moving data strip.
 * Explains where value is moving. Pause on hover. Click opens detail.
 */

import { useCallback, useId, useState, type CSSProperties } from "react";
import type { EconomicRailItem } from "@/lib/marketing/economicRail";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

type Props = {
  items: EconomicRailItem[];
  /** CSS duration for one loop; higher = slower */
  durationSec?: number;
  direction?: "ltr" | "rtl";
  variant?: "editorial" | "compact" | "proof";
  ariaLabel?: string;
  className?: string;
};

export function EconomicRail({
  items,
  durationSec = 48,
  direction = "rtl",
  variant = "editorial",
  ariaLabel = "Economic signals",
  className = "",
}: Props) {
  const reduced = usePrefersReducedMotion();
  const uid = useId();
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState<EconomicRailItem | null>(null);

  const onSelect = useCallback((item: EconomicRailItem) => {
    setActive((prev) => (prev?.id === item.id ? null : item));
  }, []);

  // Duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <div
      className={`rx-erail ${className}`.trim()}
      data-variant={variant}
      data-dir={direction}
      data-paused={paused || reduced || active ? "true" : undefined}
      data-reduced={reduced ? "true" : undefined}
      aria-label={ariaLabel}
    >
      <div
        className="rx-erail-track"
        style={
          reduced
            ? undefined
            : ({
                ["--erail-duration" as string]: `${durationSec}s`,
              } as CSSProperties)
        }
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          if (!active) setActive(null);
        }}
      >
        {loop.map((item, i) => (
          <button
            key={`${uid}-${item.id}-${i}`}
            type="button"
            className="rx-erail-item"
            data-tone={item.tone ?? "neutral"}
            data-on={active?.id === item.id ? "true" : undefined}
            aria-pressed={active?.id === item.id}
            onClick={() => onSelect(item)}
            onFocus={() => setPaused(true)}
          >
            <strong className="rx-erail-euro">{item.euro}</strong>
            <span className="rx-erail-label">{item.label}</span>
            {item.meta ? <em className="rx-erail-meta">{item.meta}</em> : null}
            <span className="rx-erail-dot" aria-hidden="true">
              ·
            </span>
          </button>
        ))}
      </div>

      {active?.detail ? (
        <div className="rx-erail-preview" role="status">
          <p>
            <strong>{active.euro}</strong> {active.label}
          </p>
          <p>{active.detail}</p>
          <button
            type="button"
            className="rx-erail-dismiss"
            onClick={() => setActive(null)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
