"use client";

import type { ReactNode } from "react";
import type { FacilityTypeVisual } from "@/lib/radr/demo/facilityCatalog";

type Props = {
  facility: FacilityTypeVisual;
  expanded?: boolean;
  onToggle?: () => void;
  statusLabel?: string;
  roomLabel?: string;
  footer?: ReactNode;
  radarNote?: string;
};

/**
 * Visual facility identity — photo mockup + equipment + under-radar cues.
 */
export function FacilityCard({
  facility,
  expanded,
  onToggle,
  statusLabel,
  roomLabel,
  footer,
  radarNote,
}: Props) {
  const hasImage = Boolean(facility.imageSrc);

  return (
    <article
      className="rp-fac-card"
      data-expanded={expanded ? "true" : "false"}
      data-vertical={facility.vertical}
    >
      <button
        type="button"
        className="rp-fac-visual"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`${facility.label} details`}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={facility.imageSrc}
            alt={facility.imageAlt}
            className="rp-fac-img"
            loading="lazy"
          />
        ) : (
          <div className="rp-fac-fallback" data-zone={facility.id}>
            <span>{facility.shortLabel}</span>
          </div>
        )}
        <div className="rp-fac-visual-meta">
          {roomLabel ? <strong>{roomLabel}</strong> : null}
          <em>{facility.label}</em>
          {statusLabel ? <span>{statusLabel}</span> : null}
        </div>
      </button>

      <div className="rp-fac-body">
        <p className="rp-fac-diff">{facility.differentiator}</p>
        <p className="rp-fac-specs">
          {[facility.beds, facility.sizeHint, facility.viewHint]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <ul className="rp-fac-equip" aria-label="Equipment">
          {facility.equipment.slice(0, expanded ? 99 : 4).map((e) => (
            <li key={e.id} title={e.watch}>
              {e.label}
            </li>
          ))}
          {!expanded && facility.equipment.length > 4 ? (
            <li className="rp-fac-equip-more">
              +{facility.equipment.length - 4}
            </li>
          ) : null}
        </ul>
        {radarNote ? (
          <p className="rp-fac-radar" data-tone="watch">
            On the radar · {radarNote}
          </p>
        ) : null}
        {expanded ? (
          <div className="rp-fac-deep">
            <p className="rp-hotel-sec-label">Often under the radar</p>
            <ul className="rp-fac-under">
              {facility.underRadar.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {facility.equipment.some((e) => e.watch) ? (
              <>
                <p className="rp-hotel-sec-label">Equipment watches</p>
                <ul className="rp-fac-under">
                  {facility.equipment
                    .filter((e) => e.watch)
                    .map((e) => (
                      <li key={e.id}>
                        <strong>{e.label}</strong> — {e.watch}
                      </li>
                    ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}
        {footer}
        {onToggle ? (
          <button type="button" className="rp-fac-more" onClick={onToggle}>
            {expanded ? "Hide detail" : "Equipment & differences"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
