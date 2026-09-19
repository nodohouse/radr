"use client";

import { useProduct } from "@/lib/product/store";
import {
  LENS_LABEL,
  OPERATING_LENSES,
  type OperatingLens,
} from "@/lib/radr/operatingCanvas";

type Props = {
  className?: string;
  /** Compact topbar variant */
  compact?: boolean;
};

/**
 * Universal Lens control - changes perspective, not location.
 * OPERATE | MONEY | RISK | SERVICE
 */
export function LensControl({ className = "", compact = true }: Props) {
  const { lens, setLens } = useProduct();

  return (
    <div
      className={`rp-lens ${compact ? "rp-lens-compact" : ""} ${className}`.trim()}
      role="radiogroup"
      aria-label="Operating lens"
    >
      {OPERATING_LENSES.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={lens === id}
          data-active={lens === id ? "true" : "false"}
          className="rp-lens-btn"
          onClick={() => setLens(id as OperatingLens)}
        >
          {LENS_LABEL[id]}
        </button>
      ))}
    </div>
  );
}
