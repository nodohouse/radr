/**
 * Dashboard grid engine — pure functions over { id, x, y, w, h }.
 *
 * 12 columns, unbounded rows, vertical compaction (gravity up).
 * Used by the builder canvas and the view-mode grid so both agree on placement.
 */

export const GRID_COLS = 12;
/** Absolute floor — widget-specific mins apply via constraintsForModule. */
export const MIN_W = 2;
export const MAX_H = 8;
export const MIN_H = 1;
/** Shared by CSS (--dbx-row / --dbx-gap) and pointer → cell math. */
export const GRID_ROW_PX = 128;
/** Canonical snap spacing (~16px). */
export const GRID_GAP_PX = 16;

export type SizeConstraints = {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
};

export type LayoutItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function clampItem<T extends LayoutItem>(
  item: T,
  constraints?: SizeConstraints,
): T {
  const minW = constraints?.minW ?? MIN_W;
  const minH = constraints?.minH ?? MIN_H;
  const maxW = constraints?.maxW ?? GRID_COLS;
  const maxH = constraints?.maxH ?? MAX_H;
  const w = Math.min(
    GRID_COLS,
    maxW,
    Math.max(minW, Math.round(item.w) || minW),
  );
  const h = Math.min(maxH, Math.max(minH, Math.round(item.h) || minH));
  const x = Math.min(GRID_COLS - w, Math.max(0, Math.round(item.x) || 0));
  const y = Math.max(0, Math.round(item.y) || 0);
  return { ...item, x, y, w, h };
}

export function collides(a: LayoutItem, b: LayoutItem): boolean {
  if (a.id === b.id) return false;
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function hasOverlap(items: LayoutItem[]): boolean {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (collides(items[i]!, items[j]!)) return true;
    }
  }
  return false;
}

export function layoutBottom(items: LayoutItem[]): number {
  return items.reduce((m, i) => Math.max(m, i.y + i.h), 0);
}

function byPosition(a: LayoutItem, b: LayoutItem): number {
  return a.y - b.y || a.x - b.x;
}

/** Lowest y ≥ 0 where `item` fits without touching `placed`. */
function lowestFreeY(item: LayoutItem, placed: LayoutItem[]): number {
  let y = 0;
  // Candidates are only 0 or the bottom edge of an item that blocks us.
  for (;;) {
    const probe = { ...item, y };
    const blocker = placed.find((p) => collides(probe, p));
    if (!blocker) return y;
    y = blocker.y + blocker.h;
  }
}

function compactAround<T extends LayoutItem>(
  others: T[],
  pinned: T | undefined,
): T[] {
  const placed: T[] = pinned ? [pinned] : [];
  for (const item of [...others].sort(byPosition)) {
    placed.push({ ...item, y: lowestFreeY(item, placed) });
  }
  return placed;
}

/**
 * Resolve a layout. When `pinnedId` is set, that item keeps its requested cell
 * (others are pushed below / pulled up around it). The pinned item may then float
 * up if space above it is free, and the others settle once more around it.
 */
function resolve<T extends LayoutItem>(items: T[], pinnedId?: string): T[] {
  const clamped = items.map((item) => clampItem(item));
  const pinned = pinnedId ? clamped.find((i) => i.id === pinnedId) : undefined;
  const others = clamped.filter((i) => i.id !== pinnedId);

  if (!pinned) return restoreOrder(items, compactAround(others, undefined));

  const first = compactAround(others, pinned).filter((i) => i.id !== pinned.id);
  const settled = { ...pinned, y: lowestFreeY(pinned, first) };
  const second = compactAround(others, settled);
  return restoreOrder(items, second);
}

function restoreOrder<T extends LayoutItem>(original: T[], next: T[]): T[] {
  const byId = new Map(next.map((i) => [i.id, i]));
  return original.map((o) => byId.get(o.id)!).filter(Boolean);
}

/** Left-to-right, wrapping rows, in array order. Used to repair legacy data. */
function flow<T extends LayoutItem>(items: T[]): T[] {
  let cx = 0;
  let ry = 0;
  let rowH = 0;
  return items.map((raw) => {
    const item = clampItem(raw);
    if (cx + item.w > GRID_COLS) {
      cx = 0;
      ry += rowH;
      rowH = 0;
    }
    const placed = { ...item, x: cx, y: ry };
    cx += item.w;
    rowH = Math.max(rowH, item.h);
    return placed;
  });
}

/** Safe layout for any stored widget list (legacy reorder saves overlap). */
export function normalizeLayout<T extends LayoutItem>(items: T[]): T[] {
  if (items.length === 0) return items;
  const clamped = items.map((item) => clampItem(item));
  const base = hasOverlap(clamped) ? flow(items) : clamped;
  return resolve(base);
}

export function compactLayout<T extends LayoutItem>(items: T[]): T[] {
  return resolve(items);
}

export function moveItem<T extends LayoutItem>(
  items: T[],
  id: string,
  x: number,
  y: number,
): T[] {
  const target = items.find((i) => i.id === id);
  if (!target) return items;
  return resolve(
    items.map((i) => (i.id === id ? { ...i, x, y } : i)),
    id,
  );
}

export function resizeItem<T extends LayoutItem>(
  items: T[],
  id: string,
  w: number,
  h: number,
  constraints?: SizeConstraints,
): T[] {
  const target = items.find((i) => i.id === id);
  if (!target) return items;
  const next = clampItem({ ...target, w, h }, constraints);
  return resolve(
    items.map((i) => (i.id === id ? { ...i, w: next.w, h: next.h } : i)),
    id,
  );
}

/**
 * Auto-arrange: largest widgets first, flowed left→right / top→bottom.
 * Optional `modulePriority` + `moduleIdOf` puts persona-critical modules above the fold.
 */
export function autoArrange<T extends LayoutItem>(
  items: T[],
  opts?: {
    modulePriority?: readonly string[];
    moduleIdOf?: (item: T) => string | undefined;
  },
): T[] {
  if (items.length === 0) return items;
  const priority = opts?.modulePriority ?? [];
  const idOf = opts?.moduleIdOf;
  const rank = (item: T): number => {
    if (!idOf || priority.length === 0) return Number.POSITIVE_INFINITY;
    const mid = idOf(item);
    if (!mid) return Number.POSITIVE_INFINITY;
    const i = priority.indexOf(mid);
    return i === -1 ? priority.length + 1 : i;
  };
  const ranked = [...items].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      b.w * b.h - a.w * a.h ||
      a.y - b.y ||
      a.x - b.x,
  );
  return restoreOrder(items, flow(ranked));
}

/** Insert `item` at (x, y); everything else compacts around it. */
export function insertItem<T extends LayoutItem>(
  items: T[],
  item: T,
  x: number,
  y: number,
): T[] {
  return resolve([...items, { ...item, x, y }], item.id);
}

/** Append `item` below everything else (click-to-add). */
export function appendItem<T extends LayoutItem>(items: T[], item: T): T[] {
  return insertItem(items, item, 0, layoutBottom(items));
}

export function removeItem<T extends LayoutItem>(items: T[], id: string): T[] {
  return resolve(items.filter((i) => i.id !== id));
}

/** Legacy S/M/L badge kept in sync with width. */
export function sizeFromWidth(w: number): "S" | "M" | "L" {
  return w >= 8 ? "L" : w >= 5 ? "M" : "S";
}

/** Pointer position (relative to canvas top-left) → grid cell. */
export function pointToCell(
  px: number,
  py: number,
  canvasWidth: number,
  mode: "round" | "floor" = "round",
): { x: number; y: number } {
  const colW = (canvasWidth - GRID_GAP_PX * (GRID_COLS - 1)) / GRID_COLS;
  const fn = mode === "floor" ? Math.floor : Math.round;
  return {
    x: fn(px / (colW + GRID_GAP_PX)),
    y: fn(py / (GRID_ROW_PX + GRID_GAP_PX)),
  };
}

export function pxToCellDelta(
  dx: number,
  dy: number,
  canvasWidth: number,
): { dx: number; dy: number } {
  const colW = (canvasWidth - GRID_GAP_PX * (GRID_COLS - 1)) / GRID_COLS;
  return {
    dx: Math.round(dx / (colW + GRID_GAP_PX)),
    dy: Math.round(dy / (GRID_ROW_PX + GRID_GAP_PX)),
  };
}
