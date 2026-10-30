"use client";

import { useEffect } from "react";
import type { RadrDashboard } from "@/lib/product/dashboards";
import { MAX_PINNED, PIN_SOFT_LIMIT } from "@/lib/product/dashboards";

type Props = {
  pinned: RadrDashboard[];
  onClose: () => void;
  onReorder: (orderedIds: string[]) => void;
  onUnpin: (id: string) => void;
  onOpen: (id: string) => void;
};

export function ManagePinnedPanel({
  pinned,
  onClose,
  onReorder,
  onUnpin,
  onOpen,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const move = (id: string, dir: -1 | 1) => {
    const ids = pinned.map((d) => d.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item!);
    onReorder(next);
  };

  return (
    <div
      className="db-manage"
      role="dialog"
      aria-modal="true"
      aria-label="Manage pinned dashboards"
      data-manage-pinned="true"
    >
      <div className="db-manage-backdrop" onClick={onClose} />
      <div className="db-manage-panel">
        <header className="db-manage-head">
          <div>
            <h3>Manage pinned</h3>
            <p>
              {pinned.length} of {MAX_PINNED} · reorder or unpin
            </p>
          </div>
          <button type="button" className="db-link" onClick={onClose}>
            ×
          </button>
        </header>

        {pinned.length >= PIN_SOFT_LIMIT ? (
          <p className="db-pin-warn" data-pin-warn="true">
            Too many pinned views reduces navigation clarity.
          </p>
        ) : null}

        {pinned.length === 0 ? (
          <p className="db-empty" style={{ padding: 16 }}>
            No pinned dashboards.
          </p>
        ) : (
          <ul className="db-manage-list">
            {pinned.map((d, i) => (
              <li key={d.id} data-pinned-manage-row={d.id}>
                <span className="db-manage-handle" aria-hidden>
                  ⋮⋮
                </span>
                <div>
                  <strong>{d.name}</strong>
                  <span>{d.widgets.length} widgets</span>
                </div>
                <div className="db-manage-actions">
                  <button
                    type="button"
                    className="db-btn-ghost"
                    disabled={i === 0}
                    onClick={() => move(d.id, -1)}
                    aria-label={`Move ${d.name} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="db-btn-ghost"
                    disabled={i === pinned.length - 1}
                    onClick={() => move(d.id, 1)}
                    aria-label={`Move ${d.name} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="db-btn-ghost"
                    onClick={() => onOpen(d.id)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="db-btn-secondary"
                    onClick={() => onUnpin(d.id)}
                    data-unpin={d.id}
                  >
                    Unpin
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
