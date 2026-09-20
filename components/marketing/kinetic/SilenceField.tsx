"use client";

/**
 * SilenceField — compression into attention. No decorative signal ticker.
 * Suppressed count belongs once, next to the brief — not here.
 */

export function SilenceField({
  needsYou = 2,
}: {
  needsYou?: number;
  /** @deprecated unused — suppressed line lives once beside the brief */
  signalsLabel?: string;
}) {
  return (
    <div className="rx-silence" data-phase="silence">
      <div className="rx-silence-final">
        <p className="rx-silence-need" data-on="true">
          <strong>{needsYou}</strong>
          <span>
            {needsYou === 1 ? "thing needs you" : "things need you"} · everything
            else within expectations
          </span>
        </p>
      </div>
    </div>
  );
}
