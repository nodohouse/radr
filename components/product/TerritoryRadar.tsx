"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { useReducedMotion } from "./PerformanceChart";
import { TextSep } from "@/components/TextSep";

type Territory = {
  area: string;
  href: string;
  value: number;
  kind: string;
  findings: number;
  driver: string;
  active: boolean;
};

type Props = {
  territories: Territory[];
};

const ORDER = ["buy", "labor", "sell", "recover"] as const;
const ANGLES: Record<string, number> = {
  buy: -45,
  labor: 45,
  sell: 135,
  recover: -135,
};

/**
 * Subtle four-territory status instrument: soft sweep only.
 * No panels or callouts on beam pass.
 */
export function TerritoryRadar({ territories }: Props) {
  const reduced = useReducedMotion();
  const [angle, setAngle] = useState(0);
  const [hot, setHot] = useState<string | null>(null);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setAngle((a) => (a + 1.2) % 360);
    }, 80);
    return () => window.clearInterval(id);
  }, [reduced]);

  // Soft illumination when beam crosses an active territory
  useEffect(() => {
    if (reduced) return;
    for (const t of territories) {
      const target = ((ANGLES[t.area] ?? 0) + 360) % 360;
      const sweep = angle;
      const diff = Math.abs(((sweep - target + 540) % 360) - 180);
      if (diff < 6 && t.active) {
        setHot(t.area);
        const tmr = window.setTimeout(() => setHot(null), 700);
        return () => window.clearTimeout(tmr);
      }
    }
  }, [angle, territories, reduced]);

  const byArea = Object.fromEntries(territories.map((t) => [t.area, t]));

  return (
    <div className="rp-radar-wrap">
      <div className="rp-radar" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="rp-radar-svg">
          <circle cx="100" cy="100" r="88" className="rp-radar-ring" />
          <circle cx="100" cy="100" r="58" className="rp-radar-ring" />
          <circle cx="100" cy="100" r="28" className="rp-radar-ring" />
          <line x1="100" y1="12" x2="100" y2="188" className="rp-radar-axis" />
          <line x1="12" y1="100" x2="188" y2="100" className="rp-radar-axis" />
          {!reduced ? (
            <g transform={`rotate(${angle} 100 100)`}>
              <path
                d="M100 100 L100 14 A86 86 0 0 1 112 15 Z"
                className="rp-radar-sweep"
              />
            </g>
          ) : null}
          {ORDER.map((area) => {
            const t = byArea[area];
            if (!t) return null;
            const rad = ((ANGLES[area] ?? 0) * Math.PI) / 180;
            const cx = 100 + Math.cos(rad) * 68;
            const cy = 100 + Math.sin(rad) * 68;
            const on = hot === area || t.active;
            return (
              <g key={area} className={on ? "rp-radar-dot-on" : undefined}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={on ? 4.5 : 3}
                  className="rp-radar-dot"
                  data-active={t.active ? "true" : "false"}
                />
              </g>
            );
          })}
        </svg>
        <ul className="rp-radar-labels">
          {ORDER.map((area) => {
            const t = byArea[area];
            if (!t) return null;
            return (
              <li key={area} data-area={area} data-hot={hot === area ? "true" : "false"}>
                <Link
                  href={t.href}
                  title={`${t.kind} · ${t.findings} findings`}
                >
                  <strong>{area.toUpperCase()}</strong>
                  <TextSep srOnly>: </TextSep>
                  <span>{formatCompactEuro(t.value)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="rp-terr-compact">
        {territories.map((t) => (
          <li key={t.area}>
            <Link href={t.href}>
              <em>{t.area.toUpperCase()}</em>
              <TextSep srOnly />
              <strong>{formatCompactEuro(t.value)}</strong>
              <TextSep srOnly />
              <span>{t.kind}</span>
              <p>
                {t.driver}
                <br />
                {t.findings} findings
                <TextSep />
                Open {t.area.toUpperCase()} →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
