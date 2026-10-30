"use client";

/**
 * RADR Operating Pulse — the only persistent moving data surface.
 * ONE semantic copy (sr-only). Visual marquee clones are aria-hidden.
 * Leading status words (DECISION / VERIFIED / ACTION / …) carry the weight.
 */

import { useId } from "react";
import {
  OPERATING_PULSE_ITEMS,
  OPERATING_PULSE_LABEL,
} from "@/lib/marketing/operatingPulse";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const STATUS_RE =
  /^(SOHO|MERCER HOUSE|TOKYO|DUBAI|SINGAPORE|LONDON|DECISION|VERIFIED|ACTION|MEMORY)\b/i;

function PulseText({ text }: { text: string }) {
  const match = text.match(STATUS_RE);
  if (!match) return <>{text}</>;
  const lead = match[1]!;
  const rest = text.slice(lead.length);
  return (
    <>
      <b className="rx-opulse-status">{lead}</b>
      {rest}
    </>
  );
}

export function OperatingPulse() {
  const reduced = usePrefersReducedMotion();
  const uid = useId();
  const items = OPERATING_PULSE_ITEMS;
  const semantic = items.map((item) => item.text).join(". ");

  if (reduced) {
    return (
      <div className="rx-opulse" role="note" data-reduced="true">
        <p className="rx-opulse-label" aria-hidden="true">
          {OPERATING_PULSE_LABEL}
        </p>
        <p className="rx-opulse-static" aria-hidden="true">
          {items.map((item, i) => (
            <span key={item.id}>
              {i > 0 ? (
                <span className="rx-opulse-sep" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <PulseText text={item.text} />
            </span>
          ))}
        </p>
        <p className="sr-only">
          {OPERATING_PULSE_LABEL}. {semantic}
        </p>
      </div>
    );
  }

  const loop = [...items, ...items];

  return (
    <div
      className="rx-opulse"
      role="note"
      aria-label={OPERATING_PULSE_LABEL}
    >
      <p className="rx-opulse-label" aria-hidden="true">
        {OPERATING_PULSE_LABEL}
      </p>
      <div className="rx-opulse-track" aria-hidden="true" inert>
        {loop.map((item, i) => (
          <span
            key={`${uid}-${item.id}-${i}`}
            className="rx-opulse-item"
            aria-hidden="true"
          >
            <PulseText text={item.text} />
            <span className="rx-opulse-sep" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </div>
      <p className="sr-only">{semantic}</p>
    </div>
  );
}
