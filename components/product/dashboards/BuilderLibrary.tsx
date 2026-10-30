"use client";

/** Left rail — categorized module library. Click Add, or drag onto the canvas. */

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { CatalogCategory, CatalogEntry } from "@/lib/product/dashboardBuilder";

export const LIB_DRAG_PREFIX = "lib:";

function LibraryItem({
  catId,
  entry,
  onAdd,
}: {
  catId: string;
  entry: CatalogEntry;
  onAdd: (moduleId: string) => void;
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: `${LIB_DRAG_PREFIX}${catId}:${entry.id}`,
    data: { kind: "module", moduleId: entry.id },
  });
  return (
    <li
      ref={setNodeRef}
      className="rp-dbx-lib-item"
      data-dragging={isDragging ? "true" : undefined}
      data-testid={`lib-item-${catId}-${entry.id}`}
      {...listeners}
    >
      <div>
        <strong>{entry.title}</strong>
        <span>{entry.description}</span>
      </div>
      <button
        type="button"
        aria-label={`Add ${entry.title}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onAdd(entry.id)}
      >
        + Add
      </button>
    </li>
  );
}

export function BuilderLibrary({
  catalog,
  onAdd,
  isHotel = false,
}: {
  catalog: CatalogCategory[];
  onAdd: (moduleId: string) => void;
  isHotel?: boolean;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(catalog.slice(0, 2).map((c) => c.id)),
  );

  const query = q.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!query) return catalog;
    return catalog
      .map((c) => ({
        ...c,
        entries: c.entries.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            c.label.toLowerCase().includes(query),
        ),
      }))
      .filter((c) => c.entries.length > 0);
  }, [catalog, query]);

  return (
    <aside
      className="rp-dbx-panel rp-dbx-library"
      aria-label="Widget library"
      data-vertical={isHotel ? "hotel" : "restaurant"}
    >
      <div className="rp-dbx-panel-head">
        <h2>Widgets</h2>
        <p>
          {isHotel
            ? "Hotel metrics first — drag onto the canvas."
            : "Drag onto the canvas, or add to the end."}
        </p>
      </div>
      <input
        type="search"
        className="rp-dbx-search"
        placeholder={
          isHotel
            ? "Search Occ, RevPAR, readiness…"
            : "Search widgets..."
        }
        aria-label="Search widgets"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="rp-dbx-cats">
        {visible.length === 0 ? (
          <p className="rp-dbx-quiet">No modules match “{q}”.</p>
        ) : null}
        {visible.map((c) => {
          const expanded = query ? true : open.has(c.id);
          return (
            <section key={c.id} className="rp-dbx-cat" data-open={expanded}>
              <button
                type="button"
                className="rp-dbx-cat-head"
                aria-expanded={expanded}
                onClick={() =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (next.has(c.id)) next.delete(c.id);
                    else next.add(c.id);
                    return next;
                  })
                }
              >
                <span>{c.label}</span>
                <em>{c.entries.length}</em>
              </button>
              {expanded ? (
                <ul>
                  {c.entries.map((e) => (
                    <LibraryItem
                      key={`${c.id}:${e.id}`}
                      catId={c.id}
                      entry={e}
                      onAdd={onAdd}
                    />
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
