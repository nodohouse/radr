"use client";

/**
 * EconomicValueTrace — clickable derivation for economically meaningful amounts.
 * Numbers stay fixture / deterministic — never generative.
 */

import { useId, useState } from "react";
import "@/app/radr-public.css";

type Props = {
  amountLabel: string;
  formula: string;
  sources: string[];
  grade?: string;
  verified?: boolean;
  className?: string;
};

export function EconomicValueTrace({
  amountLabel,
  formula,
  sources,
  grade = "DERIVED",
  verified = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={`rx-evt ${className}`.trim()}
      data-verified={verified ? "true" : undefined}
    >
      <button
        type="button"
        className="rx-evt-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <strong className="rx-evt-amount">{amountLabel}</strong>
        <span className="rx-evt-hint">
          {open ? "Hide derivation" : "Show derivation"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="rx-evt-panel">
          <p className="rx-evt-formula">{formula}</p>
          <p className="rx-evt-grade">{grade}</p>
          <p className="rx-evt-sources">
            Source evidence: {sources.join(" · ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
