"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServicePhase } from "@/lib/radr/servicePhase";
import { phaseHeadline } from "@/lib/radr/servicePhase";

const ORDER: ServicePhase[] = ["PRE_SHIFT", "LIVE", "CLOSING", "POST_SHIFT"];

type Props = {
  phase: ServicePhase;
  onChange: (phase: ServicePhase) => void;
};

/**
 * Demo-only: preview PLAN → OPERATE → VERIFY without waiting on the clock.
 */
export function ServicePhaseSwitcher({ phase, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="rp-role-switch rp-phase-switch" ref={rootRef}>
      <button
        type="button"
        className="rp-role-switch-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rp-role-switch-kicker">Service phase</span>
        <span className="rp-role-switch-name">
          {phaseHeadline(phase)}
          <em aria-hidden="true">▾</em>
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          className="rp-role-switch-menu"
          role="listbox"
          aria-label="Demo service phase"
        >
          {ORDER.map((id) => (
            <li key={id} role="option" aria-selected={id === phase}>
              <button
                type="button"
                data-active={id === phase ? "true" : undefined}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
              >
                <strong>{phaseHeadline(id)}</strong>
                <span>
                  {id === "PRE_SHIFT"
                    ? "Forecast · readiness"
                    : id === "LIVE"
                      ? "Live economics"
                      : id === "CLOSING"
                        ? "Wind-down"
                        : "Verify · learn"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
