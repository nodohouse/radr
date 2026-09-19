"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import {
  DEMO_PERSONA_ORDER,
  DEMO_PERSONAS,
  personaFromRoleView,
  type DemoPersonaId,
} from "@/lib/radr/product/personas";

/**
 * Four canonical demo personas — updates role + scope filters everywhere.
 */
export function RoleViewSwitcher() {
  const { roleView, setRoleView } = useProduct();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const personaId = personaFromRoleView(roleView);
  const persona = DEMO_PERSONAS[personaId];

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

  function pick(id: DemoPersonaId) {
    setRoleView(DEMO_PERSONAS[id].role as RoleView);
    setOpen(false);
  }

  return (
    <div className="rp-role-switch" ref={rootRef}>
      <button
        type="button"
        className="rp-role-switch-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rp-role-switch-kicker">Viewing as</span>
        <span className="rp-role-switch-name">
          {persona.label}
          <em aria-hidden="true">▾</em>
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          className="rp-role-switch-menu"
          role="listbox"
          aria-label="Demo persona"
        >
          {DEMO_PERSONA_ORDER.map((id) => {
            const p = DEMO_PERSONAS[id];
            return (
              <li key={id} role="option" aria-selected={id === personaId}>
                <button
                  type="button"
                  data-active={id === personaId ? "true" : undefined}
                  onClick={() => pick(id)}
                >
                  <strong>{p.firstName}</strong>
                  <span>{p.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
