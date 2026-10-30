/**
 * Live spatial camera + projection helpers.
 * Scene geometry stays in world/scene space; labels/UI project to screen space.
 */

export type Camera2D = {
  x: number;
  y: number;
  scale: number;
};

export type SceneRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Point2 = { x: number; y: number };

export type SpatialAnchor = {
  entityId: string;
  space: "svg" | "planPct";
  polygon?: Point2[];
  bounds?: { x: number; y: number; w: number; h: number };
  centroid: Point2;
  labelAnchor: Point2;
  zIndex?: number;
};

/** Supported app zoom for hotel CSS stage (and similar). */
export const LIVE_ZOOM_MIN = 0.8;
export const LIVE_ZOOM_MAX = 3.5;

export function clampLiveZoom(scale: number): number {
  return Math.min(LIVE_ZOOM_MAX, Math.max(LIVE_ZOOM_MIN, scale));
}

/** ViewBox camera → relative scale vs overview (1 = overview). */
export function viewBoxScale(
  camera: SceneRect,
  overview: SceneRect,
): number {
  if (camera.w <= 0) return 1;
  return overview.w / camera.w;
}

/**
 * Project scene point (SVG units) through viewBox into CSS pixels
 * relative to the SVG element's client box.
 */
export function projectSvgToClient(
  point: Point2,
  viewBox: SceneRect,
  client: { width: number; height: number },
): Point2 {
  const sx = client.width / viewBox.w;
  const sy = client.height / viewBox.h;
  return {
    x: (point.x - viewBox.x) * sx,
    y: (point.y - viewBox.y) * sy,
  };
}

/** Plan % (0–100) → CSS px inside a measured stage rect. */
export function projectPlanPctToClient(
  point: Point2,
  client: { width: number; height: number },
): Point2 {
  return {
    x: (point.x / 100) * client.width,
    y: (point.y / 100) * client.height,
  };
}

export function centroidOfBounds(b: {
  x: number;
  y: number;
  w: number;
  h: number;
}): Point2 {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function pointInBounds(
  p: Point2,
  b: { x: number; y: number; w: number; h: number },
  pad = 0,
): boolean {
  return (
    p.x >= b.x - pad &&
    p.x <= b.x + b.w + pad &&
    p.y >= b.y - pad &&
    p.y <= b.y + b.h + pad
  );
}

/**
 * Fit a scene rect into a viewport with chrome padding.
 * Returns a viewBox-style SceneRect covering the content with padding.
 */
export function fitToScene(
  content: SceneRect,
  viewport: { width: number; height: number },
  padding: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  } = {},
): SceneRect {
  const pl = padding.left ?? 0;
  const pr = padding.right ?? 0;
  const pt = padding.top ?? 0;
  const pb = padding.bottom ?? 0;
  const availW = Math.max(1, viewport.width - pl - pr);
  const availH = Math.max(1, viewport.height - pt - pb);
  const scale = Math.min(availW / content.w, availH / content.h);
  const viewW = availW / scale;
  const viewH = availH / scale;
  return {
    x: content.x - (viewW - content.w) / 2,
    y: content.y - (viewH - content.h) / 2,
    w: viewW,
    h: viewH,
  };
}

/** Focus camera on an entity anchor with optional padding in scene units. */
export function fitToEntity(
  anchor: SpatialAnchor,
  overview: SceneRect,
  opts?: { padding?: number; minSpan?: number },
): SceneRect {
  const pad = opts?.padding ?? 48;
  const minSpan = opts?.minSpan ?? 120;
  const b =
    anchor.bounds ??
    (anchor.polygon
      ? polygonBounds(anchor.polygon)
      : {
          x: anchor.centroid.x - 20,
          y: anchor.centroid.y - 20,
          w: 40,
          h: 40,
        });
  const w = Math.max(minSpan, b.w + pad * 2);
  const h = Math.max(minSpan, b.h + pad * 2);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const next = {
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
  // Keep aspect similar to overview when possible
  const aspect = overview.w / overview.h;
  if (next.w / next.h > aspect) {
    next.h = next.w / aspect;
    next.y = cy - next.h / 2;
  } else {
    next.w = next.h * aspect;
    next.x = cx - next.w / 2;
  }
  return next;
}

function polygonBounds(poly: Point2[]): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Dev-only geometry validation — logs, does not throw. */
export function validateSpatialAnchors(
  anchors: SpatialAnchor[],
  log: (msg: string) => void = console.warn,
): number {
  let errors = 0;
  const seen = new Set<string>();
  for (const a of anchors) {
    if (!a.entityId) {
      log("[live geometry] missing entityId");
      errors++;
      continue;
    }
    if (seen.has(a.entityId)) {
      log(`[live geometry] duplicate id ${a.entityId}`);
      errors++;
    }
    seen.add(a.entityId);
    if (
      !Number.isFinite(a.centroid.x) ||
      !Number.isFinite(a.centroid.y) ||
      (a.centroid.x === 0 && a.centroid.y === 0 && !a.bounds)
    ) {
      log(`[live geometry] suspicious centroid for ${a.entityId}`);
      errors++;
    }
    if (a.bounds && !pointInBounds(a.centroid, a.bounds, 2)) {
      log(`[live geometry] centroid outside bounds for ${a.entityId}`);
      errors++;
    }
    if (
      !a.labelAnchor ||
      !Number.isFinite(a.labelAnchor.x) ||
      !Number.isFinite(a.labelAnchor.y)
    ) {
      log(`[live geometry] missing labelAnchor for ${a.entityId}`);
      errors++;
    }
  }
  return errors;
}
