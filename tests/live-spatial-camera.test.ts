import { describe, expect, it } from "vitest";
import {
  clampLiveZoom,
  fitToEntity,
  fitToScene,
  LIVE_ZOOM_MAX,
  LIVE_ZOOM_MIN,
  projectSvgToClient,
  validateSpatialAnchors,
  viewBoxScale,
  type SpatialAnchor,
} from "@/lib/radr/live/spatialCamera";
import {
  OVERVIEW_CAMERA,
  TABLE_POSITIONS,
  ZONE_LABEL_AT,
} from "@/components/product/live-spatial/liveSpatialData";

describe("live spatial camera", () => {
  it("clamps zoom to supported range", () => {
    expect(clampLiveZoom(0.1)).toBe(LIVE_ZOOM_MIN);
    expect(clampLiveZoom(9)).toBe(LIVE_ZOOM_MAX);
    expect(clampLiveZoom(1.5)).toBe(1.5);
  });

  it("projects SVG scene points into client pixels", () => {
    const p = projectSvgToClient(
      { x: OVERVIEW_CAMERA.x + OVERVIEW_CAMERA.w / 2, y: OVERVIEW_CAMERA.y },
      OVERVIEW_CAMERA,
      { width: 960, height: 640 },
    );
    expect(p.x).toBeCloseTo(480, 5);
    expect(p.y).toBeCloseTo(0, 5);
  });

  it("viewBox scale is 1 at overview and >1 when zoomed in", () => {
    expect(viewBoxScale(OVERVIEW_CAMERA, OVERVIEW_CAMERA)).toBe(1);
    const zone = { x: 220, y: 120, w: 520, h: 380 };
    expect(viewBoxScale(zone, OVERVIEW_CAMERA)).toBeGreaterThan(1);
  });

  it("fitToEntity keeps selected table in frame", () => {
    const t = TABLE_POSITIONS.t14!;
    const anchor: SpatialAnchor = {
      entityId: "t14",
      space: "svg",
      centroid: { x: t.x, y: t.y },
      labelAnchor: { x: t.x, y: t.y - 20 },
      bounds: { x: t.x - 20, y: t.y - 14, w: 40, h: 28 },
    };
    const cam = fitToEntity(anchor, OVERVIEW_CAMERA);
    expect(cam.w).toBeGreaterThan(40);
    expect(cam.x).toBeLessThan(t.x);
    expect(cam.x + cam.w).toBeGreaterThan(t.x);
  });

  it("fitToScene respects chrome padding", () => {
    const cam = fitToScene(
      OVERVIEW_CAMERA,
      { width: 1200, height: 800 },
      { left: 200, right: 320, top: 64, bottom: 80 },
    );
    expect(cam.w).toBeGreaterThan(0);
    expect(cam.h).toBeGreaterThan(0);
  });

  it("validates table + zone anchors without silent 0,0", () => {
    const anchors: SpatialAnchor[] = [
      ...Object.entries(TABLE_POSITIONS).map(([id, pos]) => ({
        entityId: id,
        space: "svg" as const,
        centroid: { x: pos.x, y: pos.y },
        labelAnchor: { x: pos.x, y: pos.y - 18 },
        bounds: { x: pos.x - 18, y: pos.y - 12, w: 36, h: 24 },
      })),
      ...Object.entries(ZONE_LABEL_AT).map(([id, pos]) => ({
        entityId: `zone-${id}`,
        space: "svg" as const,
        centroid: { x: pos.x, y: pos.y },
        labelAnchor: { x: pos.x, y: pos.y },
      })),
    ];
    expect(validateSpatialAnchors(anchors, () => {})).toBe(0);
  });
});
