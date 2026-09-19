"use client";

/**
 * HospitalityContextSwitch — elegant vertical controller.
 * Not a marketing tab row. Changes product scene / Decision context.
 */

import {
  HOSPITALITY_VERTICALS,
  type HospitalityVertical,
} from "@/lib/marketing/hospitalityContext";

type Props = {
  value: HospitalityVertical;
  onChange: (v: HospitalityVertical) => void;
  ariaLabel?: string;
  size?: "hero" | "compact";
};

export function HospitalityContextSwitch({
  value,
  onChange,
  ariaLabel = "Example operating environments",
  size = "hero",
}: Props) {
  return (
    <div className="rx-hcx-wrap">
      {size === "hero" ? (
        <p className="rx-hcx-examples">Example operating environments</p>
      ) : null}
      <div
        className="rx-hcx"
        data-size={size}
        role="tablist"
        aria-label={ariaLabel}
      >
        {HOSPITALITY_VERTICALS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={value === v.id}
            data-on={value === v.id ? "true" : undefined}
            onClick={() => onChange(v.id)}
          >
            {size === "compact" ? v.short : v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HospitalityEyebrow({ className = "" }: { className?: string }) {
  return (
    <p className={`rx-hcx-eyebrow ${className}`.trim()}>
      Built across hospitality
    </p>
  );
}
