"use client";

import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { OpTerritory } from "@/lib/radr/operatingHero";

/** Editorial angles: implied ellipse, not a crosshair */
export const TERRITORY_ANGLE: Record<OpTerritory, number> = {
  buy: 325,
  sell: 55,
  recover: 145,
  labor: 235,
};

const WINDOW_DEG = 14;
const ROTATION_MS = 12_000;

function angularDistance(a: number, b: number) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

export function territoryAtAngle(deg: number): OpTerritory | null {
  let best: OpTerritory | null = null;
  let bestD = WINDOW_DEG + 1;
  (Object.keys(TERRITORY_ANGLE) as OpTerritory[]).forEach((id) => {
    const d = angularDistance(deg, TERRITORY_ANGLE[id]);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  });
  return bestD <= WINDOW_DEG ? best : null;
}

type Props = {
  /** Visual-only pulse callback: never drives information state */
  onPulse: (t: OpTerritory | null) => void;
};

/** Quiet radar: background sweep. Hits are visual only. */
export function RadarField({ onPulse }: Props) {
  const reduced = useReducedMotion();
  const beamRef = useRef<HTMLDivElement>(null);
  const lastHit = useRef<OpTerritory | null | undefined>(undefined);
  const onPulseRef = useRef(onPulse);

  useEffect(() => {
    onPulseRef.current = onPulse;
  }, [onPulse]);

  useAnimationFrame((time) => {
    if (reduced) return;
    const deg = ((time % ROTATION_MS) / ROTATION_MS) * 360;
    if (beamRef.current) {
      beamRef.current.style.transform = `rotate(${deg - 90}deg)`;
    }
    const hit = territoryAtAngle(deg);
    if (hit !== lastHit.current) {
      lastHit.current = hit;
      onPulseRef.current(hit);
    }
  });

  return (
    <div className="rx-om-radar" aria-hidden="true">
      <svg className="rx-om-radar-rings" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="44" ry="34" className="rx-om-radar-ring" data-ring="outer" />
        <ellipse cx="50" cy="50" rx="26" ry="20" className="rx-om-radar-ring" data-ring="inner" />
      </svg>
      {!reduced ? (
        <div className="rx-om-radar-beam" ref={beamRef}>
          <div className="rx-om-radar-beam-trail" />
          <div className="rx-om-radar-beam-edge" />
        </div>
      ) : null}
    </div>
  );
}
