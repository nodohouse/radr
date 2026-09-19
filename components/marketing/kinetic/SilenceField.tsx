"use client";

/**
 * SilenceField — compression into attention. No decorative signal ticker.
 */

export function SilenceField({
  signalsLabel = "Routine signals suppressed",
  needsYou = 2,
}: {
  signalsLabel?: string;
  needsYou?: number;
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
        <p className="rx-silence-suppressed" data-on="true">
          {signalsLabel}
        </p>
      </div>
    </div>
  );
}
