"use client";

/** Add Intelligence module to a custom dashboard (not the same as ☆ pin). */

import { useEffect, useMemo, useState } from "react";
import {
  addModuleToDashboard,
  createEmptyDashboard,
  readDashboards,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import { defaultDims } from "@/lib/product/dashboardBuilder";

export function AddToDashboardButton({
  moduleId,
  moduleTitle,
}: {
  moduleId: string;
  moduleTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<RadrDashboard[]>([]);

  useEffect(() => {
    if (open) setList(readDashboards());
  }, [open]);

  const options = useMemo(() => list, [list]);

  return (
    <div className="rp-add-dash">
      <button
        type="button"
        className="rp-add-dash-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        + Add to dashboard
      </button>
      {open ? (
        <div className="rp-add-dash-menu" role="menu">
          <p className="rp-add-dash-hint">Add “{moduleTitle}” to…</p>
          {options.length === 0 ? (
            <p className="rp-cin-quiet">No dashboards yet.</p>
          ) : (
            options.map((d) => (
              <button
                key={d.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  addModuleToDashboard(d.id, moduleId, defaultDims(moduleId));
                  setOpen(false);
                  window.alert(`Added to “${d.name}”.`);
                }}
              >
                {d.name}
              </button>
            ))
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const name = window.prompt("New dashboard name", moduleTitle);
              if (!name?.trim()) return;
              const d = createEmptyDashboard(name.trim());
              addModuleToDashboard(d.id, moduleId, defaultDims(moduleId));
              setOpen(false);
              window.location.href = `/app/dashboards/${d.id}/edit`;
            }}
          >
            + New dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
