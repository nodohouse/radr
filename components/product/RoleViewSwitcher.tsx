"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import {
  DEMO_PERSONAS,
  demoPersonaOrderForVertical,
  personaFromRoleView,
  type DemoPersonaId,
} from "@/lib/radr/product/personas";
import { controlCenterLensFor } from "@/lib/radr/product/controlCenterLens";
import { useDemoOrg } from "@/components/product/useDemoOrg";

/**
 * Demo persona switcher — lens changes scope, period, and Control Center composition.
 * Menu portals to document.body so it cannot be trapped in a lower stacking context.
 */
export function RoleViewSwitcher({ compact = false }: { compact?: boolean }) {
  const { roleView, setRoleView, setLocationScope, setPeriod } = useProduct();
  const { session } = useDemoOrg();
  const personaOrder = demoPersonaOrderForVertical(session.vertical);
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const personaId = personaFromRoleView(roleView, session.vertical);
  const persona = DEMO_PERSONAS[personaId];

  useLayoutEffect(() => {
    if (!open || !btnRef.current) {
      setMenuBox(null);
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const minWidth = Math.max(rect.width, 220);
    let left = rect.right - minWidth;
    if (left < 8) left = 8;
    if (left + minWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - minWidth - 8);
    }
    const top = rect.bottom + 6;
    setMenuBox({ top, left, minWidth });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onReposition() {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const minWidth = Math.max(rect.width, 220);
      let left = rect.right - minWidth;
      if (left < 8) left = 8;
      setMenuBox({
        top: rect.bottom + 6,
        left,
        minWidth,
      });
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  function pick(id: DemoPersonaId) {
    const p = DEMO_PERSONAS[id];
    const lens = controlCenterLensFor(
      p.role as RoleView,
      session.vertical === "hotel" ? "hotel" : "restaurant",
    );
    setRoleView(p.role as RoleView);
    setLocationScope(
      p.defaultLocationId === "all" ? "all" : p.defaultLocationId,
    );
    setPeriod(lens.periodDefault);
    setOpen(false);
  }

  const menu =
    open && menuBox && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            className="rp-role-switch-menu rp-float"
            data-float="true"
            role="listbox"
            aria-label="Demo persona"
            style={{
              position: "fixed",
              top: menuBox.top,
              left: menuBox.left,
              minWidth: menuBox.minWidth,
              zIndex: 120,
            }}
          >
            {personaOrder.map((id) => {
              const p = DEMO_PERSONAS[id];
              return (
                <li key={id} role="option" aria-selected={id === personaId}>
                  <button
                    type="button"
                    data-active={id === personaId ? "true" : undefined}
                    onClick={() => pick(id)}
                  >
                    <span>
                      <strong>{p.firstName}</strong> {p.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="rp-role-switch" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className="rp-role-switch-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {compact ? null : (
          <span className="rp-role-switch-kicker">Lens</span>
        )}
        <span className="rp-role-switch-name">
          {compact
            ? persona.shortLabel.split("·")[0]!.trim()
            : persona.shortLabel}
          <em aria-hidden="true">▾</em>
        </span>
      </button>
      {menu}
    </div>
  );
}
