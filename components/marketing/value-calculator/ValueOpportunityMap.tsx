"use client";

import { motion, useReducedMotion } from "motion/react";
import { RadrMarkNode } from "@/components/brand/RadrMarkNode";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import {
  formatRangeIntl,
  type CategoryResult,
  type CurrencyCode,
  type VerticalId,
} from "@/lib/marketing/value-calculator";
import {
  categoryDisplayLabel,
  categoryTone,
} from "@/components/marketing/value-calculator/valueMapSemantics";

type Props = {
  categories: CategoryResult[];
  currency: CurrencyCode;
  vertical: VerticalId | null;
  activeId: string | null;
  onSelect: (id: string) => void;
};

/**
 * Orbit slots on a 3×3 CSS grid — zero absolute radial stacking.
 * Order: top · upper-right · lower-right · bottom · lower-left · upper-left
 */
const ORBIT_SLOTS = [
  "top",
  "ur",
  "lr",
  "bottom",
  "ll",
  "ul",
] as const;

/** Radial Value Map with collision-proof CSS grid orbit (not absolute polar cards). */
export function ValueOpportunityMap({
  categories,
  currency,
  vertical,
  activeId,
  onSelect,
}: Props) {
  const reduced = useReducedMotion();
  const nodes = categories.slice(0, 6);

  return (
    <div className="vc-omap" aria-label="RADR Value Map">
      <div className="vc-omap-orbit" role="presentation">
        <svg className="vc-omap-rings" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="vcOrbitGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 217, 120, 0.14)" />
              <stop offset="45%" stopColor="rgba(74, 122, 184, 0.07)" />
              <stop offset="100%" stopColor="rgba(74, 122, 184, 0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#vcOrbitGlow)" />
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="rgba(74, 122, 184, 0.14)"
            strokeWidth="0.35"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(0, 168, 90, 0.12)"
            strokeWidth="0.35"
          />
        </svg>

        <div className="vc-omap-hub" aria-label="RADR">
          <RadrMarkNode theme="dark" />
        </div>

        {nodes.map((c, i) => {
          const slot = ORBIT_SLOTS[i] ?? "top";
          const on = activeId === c.id;
          const tone = categoryTone(c.id);
          const label = categoryDisplayLabel(c, vertical);
          const range = formatRangeIntl(c.low, c.modeled, currency);
          return (
            <motion.button
              key={c.id}
              type="button"
              className="vc-omap-card"
              data-slot={slot}
              data-tone={tone}
              data-on={on ? "true" : undefined}
              onClick={() => onSelect(c.id)}
              aria-pressed={on}
              aria-label={`${label} modeled opportunity ${range} per year`}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: reduced ? 0 : 0.12 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <strong>{label}</strong>
              <span>
                {range}
                <em> / yr</em>
              </span>
            </motion.button>
          );
        })}
      </div>

      <ol className="vc-omap-rail" aria-label="Opportunity list">
        {nodes.map((c, i) => {
          const on = activeId === c.id;
          const tone = categoryTone(c.id);
          const label = categoryDisplayLabel(c, vertical);
          return (
            <li key={`rail-${c.id}`} data-tone={tone}>
              {i === 0 ? (
                <span className="vc-omap-rail-hub" aria-hidden>
                  <BrandLogo lockup="mark" variant="dark" size="sm" />
                </span>
              ) : null}
              <button
                type="button"
                data-on={on ? "true" : undefined}
                data-tone={tone}
                onClick={() => onSelect(c.id)}
                aria-label={`${label} modeled opportunity ${formatRangeIntl(c.low, c.modeled, currency)} per year`}
              >
                <strong>{label}</strong>
                <span>
                  {formatRangeIntl(c.low, c.modeled, currency)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export {
  categoryDisplayLabel,
  evidenceLabel,
  proveLabel,
} from "@/components/marketing/value-calculator/valueMapSemantics";
