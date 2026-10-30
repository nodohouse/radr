"use client";

/**
 * Dashboard Builder — library · canvas · properties.
 *
 * Layout is real grid placement (x, y, w, h on a 12-col grid). Drag moves,
 * edge/corner handles resize, the library drops new modules at a cell.
 * Everything funnels through `commit` so Undo / Redo cover every change.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  duplicateDashboard,
  getDashboard,
  layoutWidgets,
  moduleTitle,
  newWidget,
  readDefaultLanding,
  saveDashboard,
  togglePinDashboard,
  writeDefaultLanding,
  type DashboardWidget,
  type RadrDashboard,
} from "@/lib/product/dashboards";
import {
  builderCatalog,
  personaModulePriority,
  constraintsForModule,
  defaultDims,
} from "@/lib/product/dashboardBuilder";
import type { WidgetConfigFields } from "@/lib/product/dashboardWidgetConfig";
import {
  effectiveVisualization,
  visualizationLabel,
} from "@/lib/product/dashboardWidgetConfig";
import {
  GRID_ROW_PX,
  GRID_GAP_PX,
  appendItem,
  autoArrange,
  insertItem,
  layoutBottom,
  moveItem,
  pointToCell,
  pxToCellDelta,
  removeItem,
  resizeItem,
  sizeFromWidth,
} from "@/lib/product/dashboardLayout";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { useProduct } from "@/lib/product/store";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { BuilderLibrary } from "@/components/product/dashboards/BuilderLibrary";
import { BuilderProperties } from "@/components/product/dashboards/BuilderProperties";
import {
  BuilderTopBar,
  type SaveStatus,
} from "@/components/product/dashboards/BuilderTopBar";
import { DashboardShareModal } from "@/components/product/dashboards/DashboardShareModal";
import { DashboardModuleBody } from "@/components/product/dashboards/DashboardModule";
import {
  DashboardWidgetGrid,
  placementStyle,
  widgetDisplayTitle,
} from "@/components/product/dashboards/DashboardWidgetGrid";
import "@/components/product/dashboards/dashboard-builder.css";

/* ─── history ─────────────────────────────────────────────────────────── */

type Hist = {
  past: RadrDashboard[];
  present: RadrDashboard;
  future: RadrDashboard[];
  co: { key: string; t: number } | null;
};

const HISTORY_LIMIT = 100;
const COALESCE_MS = 900;
const NEW_ID = "__new__";

function withSizes(widgets: DashboardWidget[]): DashboardWidget[] {
  return widgets.map((w) => ({ ...w, size: sizeFromWidth(w.w) }));
}

function signature(d: RadrDashboard): string {
  return JSON.stringify({
    n: d.name,
    d: d.description,
    v: d.visibility,
    s: d.sharedWith ?? [],
    w: d.widgets.map((w) => [
      w.id,
      w.intelligenceModuleId,
      w.x,
      w.y,
      w.w,
      w.h,
      w.config ?? null,
    ]),
  });
}

function sameGeometry(a: DashboardWidget[], b: DashboardWidget[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(a.map((w) => [w.id, w]));
  return b.every((w) => {
    const o = byId.get(w.id);
    return o && o.x === w.x && o.y === w.y && o.w === w.w && o.h === w.h;
  });
}

function uid(): string {
  return `w_${Math.random().toString(36).slice(2, 9)}`;
}

type ActiveDrag =
  | { kind: "widget"; id: string; width: number; height: number }
  | { kind: "module"; moduleId: string }
  | null;

/* ─── canvas widget ───────────────────────────────────────────────────── */

type Axis = "e" | "s" | "se";

const CanvasWidget = memo(function CanvasWidget({
  widget,
  selected,
  ghost,
  onSelect,
  onRemove,
  onKey,
  onResizeStart,
}: {
  widget: DashboardWidget;
  selected: boolean;
  ghost: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onKey: (e: ReactKeyboardEvent, w: DashboardWidget) => void;
  onResizeStart: (
    e: ReactPointerEvent,
    w: DashboardWidget,
    axis: Axis,
  ) => void;
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: widget.id,
    data: { kind: "widget" },
    disabled: widget.id === NEW_ID,
  });
  const title = widgetDisplayTitle(widget);
  const isNew = widget.id === NEW_ID;

  return (
    <article
      ref={setNodeRef}
      className="rp-dash-widget rp-dgrid-item rp-dbx-item"
      data-size={widget.size}
      data-wid={widget.id}
      data-selected={selected ? "true" : undefined}
      data-ghost={ghost || isDragging || isNew ? "true" : undefined}
      tabIndex={isNew ? -1 : 0}
      aria-label={`${title}, column ${widget.x + 1}, row ${widget.y + 1}, ${widget.w} by ${widget.h}`}
      style={placementStyle(widget)}
      onPointerDown={() => !isNew && onSelect(widget.id)}
      onKeyDown={(e) => onKey(e, widget)}
    >
      <header className="rp-dbx-item-head" {...listeners}>
        <span className="rp-dash-drag" aria-hidden>
          ⋮⋮
        </span>
        <strong>{title}</strong>
        <span className="rp-dbx-widget-meta">
          {widget.config?.showLive ? (
            <em className="rp-dbx-live-pill" data-live="true">
              Live
            </em>
          ) : null}
          <em data-viz-pill="true">
            {visualizationLabel(
              effectiveVisualization(
                widget.intelligenceModuleId,
                widget.config,
              ),
            )}
          </em>
        </span>
        <button
          type="button"
          className="rp-dbx-x"
          aria-label={`Remove ${title}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(widget.id)}
        >
          ×
        </button>
      </header>
      <div
        className="rp-dash-widget-live rp-dbx-live"
        data-viz={effectiveVisualization(
          widget.intelligenceModuleId,
          widget.config,
        )}
        data-compact={widget.config?.compact ? "true" : undefined}
        inert
      >
        <DashboardModuleBody widget={widget} />
      </div>
      {!isNew ? (
        <>
          <span
            className="rp-dbx-handle"
            data-axis="e"
            onPointerDown={(e) => onResizeStart(e, widget, "e")}
          />
          <span
            className="rp-dbx-handle"
            data-axis="s"
            onPointerDown={(e) => onResizeStart(e, widget, "s")}
          />
          <span
            className="rp-dbx-handle"
            data-axis="se"
            data-testid={`resize-${widget.id}`}
            onPointerDown={(e) => onResizeStart(e, widget, "se")}
          />
        </>
      ) : null}
    </article>
  );
});

/* ─── builder ─────────────────────────────────────────────────────────── */

export function DashboardBuilder({ dashboardId }: { dashboardId: string }) {
  const router = useRouter();
  const { isHotel } = useDemoOrg();
  const { locationScope, period, setPeriod } = useProduct();
  const catalog = useMemo(
    () => builderCatalog(isHotel ? "hotel" : "restaurant"),
    [isHotel],
  );

  const scopeLabel = useMemo(() => {
    if (locationScope === "all") {
      return isHotel ? "All properties" : "All locations";
    }
    return locationDisplayName(locationScope);
  }, [isHotel, locationScope]);

  const [hist, setHist] = useState<Hist | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [savedSig, setSavedSig] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [liveLayout, setLiveLayout] = useState<DashboardWidget[] | null>(null);
  const [active, setActive] = useState<ActiveDrag>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [scrollTo, setScrollTo] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [dropHint, setDropHint] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const presentRef = useRef<RadrDashboard | null>(null);
  const liveRef = useRef<DashboardWidget[] | null>(null);
  const lastCell = useRef("");

  const present = hist?.present ?? null;
  presentRef.current = present;
  liveRef.current = liveLayout;

  /* load */
  useEffect(() => {
    const found = getDashboard(dashboardId);
    if (found) {
      const draft: RadrDashboard = {
        ...structuredClone(found),
        widgets: layoutWidgets(found.widgets),
      };
      setHist({ past: [], present: draft, future: [], co: null });
      setSavedSig(signature(draft));
    }
    setLoaded(true);
  }, [dashboardId]);

  /* default-landing state */
  useEffect(() => {
    const read = () =>
      setIsDefault(readDefaultLanding() === `dashboard:${dashboardId}`);
    read();
    window.addEventListener("radr-dashboards-changed", read);
    return () => window.removeEventListener("radr-dashboards-changed", read);
  }, [dashboardId]);

  const dirty = present ? signature(present) !== savedSig : false;

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!present) return;
    if (offline) {
      setSaveStatus("offline");
      return;
    }
    setSaveStatus(dirty ? "unsaved" : "saved");
  }, [dirty, present, offline]);

  useEffect(() => {
    if (!dirty) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [dirty]);

  /* commit / undo / redo */
  const commit = useCallback(
    (fn: (d: RadrDashboard) => RadrDashboard, key?: string) => {
      const now = Date.now();
      setHist((h) => {
        if (!h) return h;
        const next = fn(h.present);
        if (next === h.present) return h;
        const merge = !!key && h.co?.key === key && now - h.co.t < COALESCE_MS;
        return {
          past: merge
            ? h.past
            : [...h.past, h.present].slice(-HISTORY_LIMIT),
          present: next,
          future: [],
          co: key ? { key, t: now } : null,
        };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHist((h) => {
      if (!h || h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1]!;
      return {
        past: h.past.slice(0, -1),
        present: prev,
        future: [h.present, ...h.future],
        co: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHist((h) => {
      if (!h || h.future.length === 0) return h;
      const [next, ...rest] = h.future;
      return { past: [...h.past, h.present], present: next!, future: rest, co: null };
    });
  }, []);

  /* keep selection valid after undo/redo/remove */
  useEffect(() => {
    if (selectedId && present && !present.widgets.some((w) => w.id === selectedId)) {
      setSelectedId(null);
    }
  }, [present, selectedId]);

  const save = useCallback(() => {
    const d = presentRef.current;
    if (!d) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSaveStatus("offline");
      return;
    }
    setSaveStatus("saving");
    try {
      const toSave: RadrDashboard = {
        ...d,
        name: d.name.trim() || "Untitled dashboard",
        widgets: withSizes(d.widgets),
        sharedWith: d.sharedWith ?? [],
      };
      saveDashboard(toSave);
      if (toSave.name !== d.name) {
        commit((x) => ({ ...x, name: toSave.name }));
      }
      setSavedSig(signature(toSave));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [commit]);

  /* Autosave drafts while dirty — retry when back online */
  useEffect(() => {
    if (!dirty || previewing || offline) return;
    const t = window.setTimeout(() => save(), 1200);
    return () => window.clearTimeout(t);
  }, [dirty, previewing, present, save, offline]);

  /* operations */
  const setWidgets = useCallback(
    (fn: (w: DashboardWidget[]) => DashboardWidget[], key?: string) =>
      commit((d) => {
        const next = { ...d, widgets: withSizes(fn(d.widgets)) };
        return signature(next) === signature(d) ? d : next;
      }, key),
    [commit],
  );

  const addModule = useCallback(
    (moduleId: string, at?: { x: number; y: number }) => {
      const widget = newWidget(moduleId, defaultDims(moduleId));
      setWidgets((ws) =>
        at ? insertItem(ws, widget, at.x, at.y) : appendItem(ws, widget),
      );
      setSelectedId(widget.id);
      setScrollTo(widget.id);
    },
    [setWidgets],
  );

  const removeWidget = useCallback(
    (id: string) => {
      setWidgets((ws) => removeItem(ws, id));
      setSelectedId((s) => (s === id ? null : s));
    },
    [setWidgets],
  );

  const duplicateWidget = useCallback(
    (id: string) => {
      const src = presentRef.current?.widgets.find((w) => w.id === id);
      if (!src) return;
      const copy: DashboardWidget = {
        ...structuredClone(src),
        id: uid(),
      };
      setWidgets((ws) => insertItem(ws, copy, src.x, src.y + src.h));
      setSelectedId(copy.id);
      setScrollTo(copy.id);
    },
    [setWidgets],
  );

  const resizeTo = useCallback(
    (id: string, w: number, h: number, key?: string) =>
      setWidgets((ws) => {
        const target = ws.find((x) => x.id === id);
        const c = target
          ? constraintsForModule(target.intelligenceModuleId)
          : undefined;
        return resizeItem(ws, id, w, h, c);
      }, key),
    [setWidgets],
  );

  const arrangeAuto = useCallback(() => {
    const vertical = isHotel ? "hotel" : "restaurant";
    const priority = personaModulePriority(
      vertical,
      presentRef.current?.roleTemplate,
    );
    setWidgets((ws) =>
      autoArrange(ws, {
        modulePriority: priority,
        moduleIdOf: (w) => w.intelligenceModuleId,
      }),
    );
    setSelectedId(null);
  }, [setWidgets, isHotel]);

  const moveTo = useCallback(
    (id: string, x: number, y: number, key?: string) =>
      setWidgets((ws) => moveItem(ws, id, x, y), key),
    [setWidgets],
  );

  const patchConfig = useCallback(
    (id: string, patch: WidgetConfigFields, key: string) =>
      setWidgets(
        (ws) =>
          ws.map((w) => {
            if (w.id !== id) return w;
            const config: NonNullable<DashboardWidget["config"]> = {
              ...w.config,
              ...patch,
            };
            for (const k of Object.keys(config) as (keyof typeof config)[]) {
              if (config[k] === undefined || config[k] === "") {
                delete config[k];
              }
            }
            return {
              ...w,
              config: Object.keys(config).length ? config : undefined,
            };
          }),
        key,
      ),
    [setWidgets],
  );

  /* scroll newly added widget into view */
  useEffect(() => {
    if (!scrollTo) return;
    const el = canvasRef.current?.querySelector(`[data-wid="${scrollTo}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setScrollTo(null);
  }, [scrollTo, present]);

  /* keyboard on a focused widget */
  const onWidgetKey = useCallback(
    (e: ReactKeyboardEvent, w: DashboardWidget) => {
      if (e.target !== e.currentTarget) return;
      const k = e.key;
      if (k === "Delete" || k === "Backspace") {
        e.preventDefault();
        removeWidget(w.id);
        return;
      }
      if (k === "Escape") {
        setSelectedId(null);
        return;
      }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        setSelectedId(w.id);
        return;
      }
      const dir =
        k === "ArrowLeft"
          ? [-1, 0]
          : k === "ArrowRight"
            ? [1, 0]
            : k === "ArrowUp"
              ? [0, -1]
              : k === "ArrowDown"
                ? [0, 1]
                : null;
      if (!dir) return;
      e.preventDefault();
      setSelectedId(w.id);
      if (e.shiftKey) {
        resizeTo(w.id, w.w + dir[0]!, w.h + dir[1]!, `kbd-r:${w.id}`);
      } else {
        moveTo(w.id, w.x + dir[0]!, w.y + dir[1]!, `kbd-m:${w.id}`);
      }
    },
    [moveTo, removeWidget, resizeTo],
  );

  /* resize by pointer */
  const startResize = useCallback(
    (e: ReactPointerEvent, w: DashboardWidget, axis: Axis) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      const base = presentRef.current?.widgets;
      if (!canvas || !base) return;
      const width = canvas.getBoundingClientRect().width;
      const sx = e.clientX;
      const sy = e.clientY;
      let latest: DashboardWidget[] | null = null;
      setSelectedId(w.id);
      setResizingId(w.id);

      const constraints = constraintsForModule(w.intelligenceModuleId);
      const onMove = (ev: PointerEvent) => {
        const { dx, dy } = pxToCellDelta(ev.clientX - sx, ev.clientY - sy, width);
        const next = resizeItem(
          base,
          w.id,
          axis === "s" ? w.w : w.w + dx,
          axis === "e" ? w.h : w.h + dy,
          constraints,
        );
        latest = next;
        const placed = next.find((x) => x.id === w.id);
        if (placed) {
          setDropHint({ x: placed.x, y: placed.y, w: placed.w, h: placed.h });
        }
        setLiveLayout(next);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        setResizingId(null);
        setLiveLayout(null);
        setDropHint(null);
        if (latest && !sameGeometry(latest, base)) {
          const final = latest;
          setWidgets(() => final);
        }
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [setWidgets],
  );

  /* drag & drop (move existing · drop from library) */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const targetCell = useCallback(
    (e: DragMoveEvent | DragEndEvent): { x: number; y: number; inside: boolean } | null => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const data = e.active.data.current as { kind?: string } | undefined;
      if (data?.kind === "module") {
        const ae = e.activatorEvent as PointerEvent;
        const px = ae.clientX + e.delta.x;
        const py = ae.clientY + e.delta.y;
        const inside =
          px >= rect.left - 8 &&
          px <= rect.right + 8 &&
          py >= rect.top - 8 &&
          py <= rect.bottom + 8;
        const c = pointToCell(px - rect.left, py - rect.top, rect.width, "floor");
        return { ...c, inside };
      }
      // The overlay follows the pointer, so initial + delta is its viewport position.
      const r = e.active.rect.current.initial;
      if (!r) return null;
      const c = pointToCell(
        r.left + e.delta.x - rect.left,
        r.top + e.delta.y - rect.top,
        rect.width,
      );
      return { ...c, inside: true };
    },
    [],
  );

  const onDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      | { kind: "widget" }
      | { kind: "module"; moduleId: string }
      | undefined;
    lastCell.current = "";
    if (data?.kind === "module") {
      setActive({ kind: "module", moduleId: data.moduleId });
    } else {
      const id = String(e.active.id);
      const r = e.active.rect.current.initial;
      setSelectedId(id);
      setActive({
        kind: "widget",
        id,
        width: r?.width ?? 320,
        height: r?.height ?? 200,
      });
    }
  };

  const onDragMove = (e: DragMoveEvent) => {
    const cell = targetCell(e);
    const base = presentRef.current?.widgets;
    if (!cell || !base) return;
    const key = `${cell.x},${cell.y},${cell.inside}`;
    if (key === lastCell.current) return;
    lastCell.current = key;
    const data = e.active.data.current as
      | { kind: "widget" }
      | { kind: "module"; moduleId: string }
      | undefined;
    if (data?.kind === "module") {
      if (!cell.inside) {
        setLiveLayout(null);
        setDropHint(null);
        return;
      }
      const dims = defaultDims(data.moduleId);
      const ghost = {
        ...newWidget(data.moduleId, dims),
        id: NEW_ID,
      };
      const next = withSizes(insertItem(base, ghost, cell.x, cell.y));
      const placed = next.find((w) => w.id === NEW_ID);
      setDropHint(
        placed
          ? { x: placed.x, y: placed.y, w: placed.w, h: placed.h }
          : { x: cell.x, y: cell.y, w: dims.w, h: dims.h },
      );
      setLiveLayout(next);
    } else {
      const id = String(e.active.id);
      const next = withSizes(moveItem(base, id, cell.x, cell.y));
      const placed = next.find((w) => w.id === id);
      if (placed) {
        setDropHint({ x: placed.x, y: placed.y, w: placed.w, h: placed.h });
      }
      setLiveLayout(next);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const layout = liveRef.current;
    const base = presentRef.current?.widgets;
    const data = e.active.data.current as
      | { kind: "widget" }
      | { kind: "module"; moduleId: string }
      | undefined;
    setActive(null);
    setLiveLayout(null);
    setDropHint(null);
    lastCell.current = "";
    if (!layout || !base) return;
    if (data?.kind === "module") {
      const id = uid();
      setWidgets(() => layout.map((w) => (w.id === NEW_ID ? { ...w, id } : w)));
      setSelectedId(id);
      setScrollTo(id);
    } else if (!sameGeometry(layout, base)) {
      setWidgets(() => layout);
    }
  };

  const onDragCancel = () => {
    setActive(null);
    setLiveLayout(null);
    setDropHint(null);
    lastCell.current = "";
  };

  /* shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const t = e.target as HTMLElement | null;
      const typing =
        !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        save();
      } else if (k === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (k === "y" && !typing) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, undo, redo]);

  const leave = useCallback(
    (to: string) => {
      if (dirty && !window.confirm("Discard unsaved changes to this dashboard?")) {
        return;
      }
      router.push(to);
    },
    [dirty, router],
  );

  /* render */
  if (!loaded) return <div className="rp-dbx" aria-busy="true" />;

  if (!present || !hist) {
    return (
      <div className="rp-dash-view">
        <p>Dashboard not found.</p>
        <Link href="/app/dashboards">← Library</Link>
      </div>
    );
  }

  const widgets = liveLayout ?? present.widgets;
  const selected = present.widgets.find((w) => w.id === selectedId) ?? null;
  const rows = Math.max(6, layoutBottom(widgets) + 2);
  const interacting = active !== null || resizingId !== null;
  const ordered = [...widgets].sort((a, b) => a.y - b.y || a.x - b.x);
  const canUndo = hist.past.length > 0 && !previewing;
  const canRedo = hist.future.length > 0 && !previewing;

  return (
    <div
      className="rp-dbx"
      data-preview={previewing ? "true" : undefined}
      data-builder-shell="true"
      data-testid="dashboard-builder"
    >
      <BuilderTopBar
        dashboard={present}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        previewing={previewing}
        isDefault={isDefault}
        isPinned={present.pinned}
        scopeLabel={scopeLabel}
        period={period}
        onBack={() => leave("/app/dashboards")}
        onRename={(name) => commit((d) => ({ ...d, name }), "name")}
        onPeriod={setPeriod}
        onUndo={undo}
        onRedo={redo}
        onAutoArrange={arrangeAuto}
        onPreview={() => {
          setPreviewing((p) => !p);
          setSelectedId(null);
        }}
        onSave={save}
        onShare={() => setShareOpen(true)}
        onTogglePin={() => {
          const result = togglePinDashboard(dashboardId);
          commit((d) => ({
            ...d,
            pinned: result.pinned,
            pinOrder: result.list.find((x) => x.id === dashboardId)?.pinOrder ?? d.pinOrder,
          }));
        }}
        onToggleDefault={() =>
          writeDefaultLanding(
            isDefault ? "control-center" : `dashboard:${dashboardId}`,
          )
        }
        onOpenView={() => leave(`/app/dashboards/${dashboardId}`)}
        onDuplicate={() => {
          const copy = duplicateDashboard(dashboardId);
          if (copy) router.push(`/app/dashboards/${copy.id}/edit`);
        }}
      />

      {shareOpen && present ? (
        <DashboardShareModal
          dashboard={present}
          onClose={() => setShareOpen(false)}
          onChange={({ sharedWith, visibility }) => {
            commit(
              (d) => ({ ...d, sharedWith, visibility }),
              "share",
            );
          }}
        />
      ) : null}

      {previewing ? (
        <div className="rp-dbx-preview">
          <p className="rp-dbx-preview-note">
            Preview — this is how the dashboard reads. Nothing here is editable.
          </p>
          {present.widgets.length === 0 ? (
            <div className="rp-dash-lib-empty">
              <p>This dashboard has no modules yet.</p>
            </div>
          ) : (
            <DashboardWidgetGrid widgets={present.widgets} />
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div className="rp-dbx-body">
            <BuilderLibrary
              catalog={catalog}
              isHotel={isHotel}
              onAdd={(id) => addModule(id)}
            />

            <main className="rp-dbx-stage" aria-label="Canvas">
              <div
                ref={canvasRef}
                className="rp-dbx-canvas"
                data-active={interacting ? "true" : undefined}
                data-testid="builder-canvas"
                style={{
                  gridTemplateRows: `repeat(${rows}, ${GRID_ROW_PX}px)`,
                  ["--dbx-row" as string]: `${GRID_ROW_PX}px`,
                  ["--dbx-gap" as string]: `${GRID_GAP_PX}px`,
                }}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                <div className="rp-dbx-guides" aria-hidden>
                  {Array.from({ length: 12 }, (_, i) => (
                    <i
                      key={i}
                      data-lit={
                        dropHint &&
                        i >= dropHint.x &&
                        i < dropHint.x + dropHint.w
                          ? "true"
                          : undefined
                      }
                    />
                  ))}
                </div>
                {dropHint ? (
                  <div
                    className="rp-dgrid-item rp-dbx-drop-hint"
                    aria-hidden
                    data-drop-hint="true"
                    style={placementStyle({
                      id: "hint",
                      intelligenceModuleId: "hint",
                      x: dropHint.x,
                      y: dropHint.y,
                      w: dropHint.w,
                      h: dropHint.h,
                      size: sizeFromWidth(dropHint.w),
                    })}
                  />
                ) : null}
                {widgets.length === 0 ? (
                  <div className="rp-dbx-empty">
                    <strong>Build this around the questions you ask most.</strong>
                    <span>
                      Drag a module here, or choose Add in the library.
                    </span>
                  </div>
                ) : null}
                {ordered.map((w) => (
                  <CanvasWidget
                    key={w.id}
                    widget={w}
                    selected={w.id === selectedId}
                    ghost={active?.kind === "widget" && active.id === w.id}
                    onSelect={setSelectedId}
                    onRemove={removeWidget}
                    onKey={onWidgetKey}
                    onResizeStart={startResize}
                  />
                ))}
              </div>
            </main>

            <BuilderProperties
              dashboard={present}
              widget={selected}
              onRename={(name) =>
                commit((d) => ({ ...d, name }), "name")
              }
              onDescribe={(description) =>
                commit((d) => ({ ...d, description }), "description")
              }
              onTitle={(id, title) =>
                patchConfig(id, { title }, `title:${id}`)
              }
              onText={(id, text) => patchConfig(id, { text }, `text:${id}`)}
              onConfig={patchConfig}
              onResize={(id, w, h) => resizeTo(id, w, h)}
              onMove={(id, x, y) => moveTo(id, x, y)}
              onDuplicate={duplicateWidget}
              onRemove={removeWidget}
              onDeselect={() => setSelectedId(null)}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {active?.kind === "widget" ? (
              <div
                className="rp-dbx-overlay"
                style={{ width: active.width, height: Math.min(active.height, 220) }}
              >
                <strong>
                  {(() => {
                    const w = present.widgets.find((x) => x.id === active.id);
                    return w ? widgetDisplayTitle(w) : "";
                  })()}
                </strong>
              </div>
            ) : active?.kind === "module" ? (
              <div className="rp-dbx-overlay rp-dbx-overlay-chip">
                <strong>{moduleTitle(active.moduleId)}</strong>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
