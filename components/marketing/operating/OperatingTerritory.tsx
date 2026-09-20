"use client";

import { forwardRef, type FocusEvent, type MouseEvent } from "react";
import type { TerritorySurface } from "@/lib/radr/operatingHero";
import { TextSep } from "@/components/TextSep";

type Props = {
  territory: TerritorySurface;
  value: string;
  kind: string;
  lit: boolean;
  dimmed: boolean;
  showPreview: boolean;
  pulsed: boolean;
  ready: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
};

function staysInside(e: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) {
  const next = e.relatedTarget;
  if (!(next instanceof Node)) return false;
  return e.currentTarget.contains(next);
}

/**
 * Territory node: fixed footprint.
 * Hover: micro preview (opacity only). Pulse: temporary scan label.
 * Click: investigation drawer.
 */
export const OperatingTerritory = forwardRef<HTMLButtonElement, Props>(
  function OperatingTerritory(
    {
      territory,
      value,
      kind,
      lit,
      dimmed,
      showPreview,
      pulsed,
      ready,
      onEnter,
      onLeave,
      onClick,
    },
    ref,
  ) {
    const p = territory.preview;
    const kindLower = kind.toLowerCase();

    return (
      <div
        className="rx-om-terr"
        data-id={territory.id}
        data-lit={lit ? "true" : "false"}
        data-dim={dimmed ? "true" : "false"}
        data-pulse={pulsed ? "true" : "false"}
        data-ready={ready ? "true" : "false"}
        onMouseEnter={onEnter}
        onMouseLeave={(e) => {
          if (staysInside(e)) return;
          onLeave();
        }}
        onFocus={onEnter}
        onBlur={(e) => {
          if (staysInside(e)) return;
          onLeave();
        }}
      >
        <button
          ref={ref}
          type="button"
          className="rx-om-terr-hit"
          onClick={onClick}
          aria-pressed={lit}
        >
          <span className="rx-om-terr-name">{territory.name}</span>
          <TextSep srOnly />
          <span className="rx-om-terr-tag">{territory.tagline}</span>
          <strong className="rx-om-terr-val">
            {value}
            <TextSep srOnly>: </TextSep>
            <em>{kindLower}</em>
          </strong>
        </button>

        {/* Scan whisper: visual only, absolute, never shifts layout */}
        <span className="rx-om-whisper" aria-hidden="true">
          {p.title}
        </span>

        <div
          className="rx-om-micro"
          data-open={showPreview ? "true" : "false"}
          aria-hidden={!showPreview}
        >
          <span className="rx-om-micro-label">{p.label}</span>
          <TextSep srOnly />
          <strong className="rx-om-micro-title">{p.title}</strong>
          <TextSep srOnly />
          <em className="rx-om-micro-val">{p.value}</em>
          <TextSep srOnly />
          <span className="rx-om-micro-cta">Explore {territory.name} →</span>
        </div>
      </div>
    );
  },
);
