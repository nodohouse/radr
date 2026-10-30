# Live Rendering — Alignment & Zoom Audit

**Date:** 2026-10-20  
**Mode:** Precision / Retina / zoom stability. Visual language frozen.  
**Shipped route:** `/app/live` → restaurant `LiveSpatialShell` · hotel `HotelLiveShell`

---

## 1. Principle

> Never position operational overlays by eyeballing pixels.  
> Scene anchors → transform matrix → viewport → screen.  
> Labels stay screen-space; geometry stays scene-space.

If I zoom in, it should look better — not break apart.

---

## 2. Current architecture (as shipped)

### Restaurant — `components/product/live-spatial/`

| Layer | Tech | Notes |
|-------|------|-------|
| Venue scene | SVG `viewBox` 960×640 + `<image>` 4K JPG | `VenueWorld.tsx` |
| Camera | Animated SVG viewBox (Framer) | `OVERVIEW_CAMERA` / `ZONE_CAMERA` in `liveSpatialData.ts` |
| Zones / tables / stations | SVG paths + `translate(x y)` | Scene units — good base |
| Labels | SVG `<text>` / hover cards **inside** scaled SVG | **Risk:** type scales with zoom |
| Estate map | Raster JPG + absolute `%` pins | `EstateWorld.tsx` + `estateSites.ts` |
| URL | `level` · `lens` · `horizon` · `zone` · `station` · `table` · `location` | Present |
| DPR | N/A (SVG) | Sharpness = asset resolution |
| Screen-space overlay | **Missing** | |
| `debugGeometry` | **Missing** | |
| ResizeObserver fit | **Missing** on stage | |

### Hotel — `components/product/hotel-live/`

| Layer | Tech | Notes |
|-------|------|-------|
| Floor plan | DOM tiles, absolute `%` | `HotelLiveShell` `FloorPlan` |
| Room layout | Generated grids in `hotelLive.ts` | Formulaic %, not hand magic per room |
| Camera | CSS `transform: scale(zoom)` 0.92–1.25 | Not URL-synced; “fit” = `zoom=1` |
| Labels | Inside tiles → scale with zoom | **Risk** |
| Corridor / lift | Hard-coded `%` in CSS | Drift risk vs room grid |
| URL | `level` · `property` · `floor` · `room` · `mode` · `time` | Present |
| Screen-space overlay | **Missing** | |
| `debugGeometry` | **Missing** | |

### Not on product `/app/live`

`RadrLiveShell`, `VenueSpatialCanvas` (has DPR + ResizeObserver — reference only), WebGL `VenueCanvas`.

---

## 3. Coordinate spaces (target model)

| Space | Restaurant | Hotel |
|-------|------------|-------|
| World | Table/zone entity IDs | Room/floor entity IDs |
| Scene | SVG units 0–960 × 0–640 (or stable viewBox) | Normalized 0–100% plan rect |
| Viewport | Camera viewBox / pan-zoom | Stage transform `{x,y,scale}` |
| Screen | CSS px after CTM / getBoundingClientRect | Same |

**One camera** per surface. No independent scale on bg vs markers vs hits.

---

## 4. Defect classes (priority)

### P0 — Alignment / zoom breakage

1. **Labels scale with scene** (restaurant SVG text, hotel room numbers) → tiny/huge type  
2. **Hotel fit is blind** (`zoom=1`) — sidebar/inspector open squashes without re-fit  
3. **No ResizeObserver** on Live stage — layout chrome changes without window resize drift scene  
4. **Estate pins** hand `%` + CSS `translate(-50%, -72%)` — art crop breaks registration  
5. **Hotel corridor CSS %** vs generated room grid — highlight/selection can feel offset  

### P1 — Quality

6. Raster venue art must stay ≥2× max display; no CSS upscale beyond natural  
7. SVG strokes without `vector-effect="non-scaling-stroke"` blur / thicken oddly  
8. Hit targets = tiny labels instead of zone/table polygons (partially OK for zones; tables need bounds)  
9. LOD missing — all labels always on → clutter + collision at overview  

### P2 — Tooling / regression

10. No `?debugGeometry=1`  
11. No startup geometry validation (centroid in bounds, unique ids)  
12. No Playwright visual snapshots for Live at 100% / 150%  

---

## 5. Target two-layer render

```
┌─ Live stage ─────────────────────────────────┐
│  LAYER A — scene (transforms with camera)    │
│    floor art · polygons · status fills       │
│    hit paths (invisible / debug stroke)      │
│                                              │
│  LAYER B — screen-space overlays             │
│    labels · badges · tooltips · selection    │
│    (position from projected anchors;         │
│     font-size fixed in CSS px)               │
└──────────────────────────────────────────────┘
```

Selected entity always wins collision / LOD.

---

## 6. Canonical entity anchors (target shape)

```ts
type SpatialAnchor = {
  entityId: string;
  space: "svg" | "planPct";
  polygon?: { x: number; y: number }[];
  bounds?: { x: number; y: number; w: number; h: number };
  centroid: { x: number; y: number };
  labelAnchor: { x: number; y: number };
  zIndex?: number;
};
```

Restaurant: extend `TABLE_POSITIONS` / `STATION_HITS` / zone paths in `liveSpatialData.ts`.  
Hotel: derive from `hotelLive` room layout `%` → same shape.  
Estate: registry id + pin `{x,y}` in scene % — no orphan pin lists that disagree with estate registry.

---

## 7. Camera / zoom policy

| | Restaurant | Hotel |
|--|------------|-------|
| State | viewBox (equiv. to x,y,scale) | `{ x, y, scale }` preferred over bare CSS scale |
| Min / max | Explicit clamp (e.g. 0.8–3.5 equiv.) | Widen beyond 0.92–1.25 once overlay layer exists |
| Fit | `fitToScene({ paddingL/R/T/B })` | Same; replace `setZoom(1)` |
| Selection | `fitToEntity(id)` shared util | Same |
| Motion | 250–450ms, high damping, no bounce | Same |
| Modes / time | Update encoding only — **never remount geometry** | Same |

Sidebar / inspector: remeasure stage → `fitScene` / keep selected anchor in focus — do not squash.

---

## 8. LOD + collision (target)

| Zoom | Show |
|------|------|
| Low | Zones / floors / pressure; hide table/room labels |
| Mid | Status dots + key labels |
| High | Full label · ETA · mini metrics |

Collision: hide lower priority · offset secondary · preserve selected.

---

## 9. Debug + validation

### `?debugGeometry=1` (dev / demo only)

Draw: centroid crosshair · polygon outline · label anchor · hitbox · camera/viewport rect. Distinct colors. Restaurant + hotel.

### Dev startup asserts

Every interactive entity: valid polygon/bounds · centroid inside · labelAnchor · unique id. Log errors; never silently render at 0,0.

---

## 10. Quality gates

### Browser zoom: 80 · 90 · 100 · 110 · 125 · 150%

### App zoom: min · 1× · 1.5× · 2× · 3× · max

### Viewports: 1440×900 · 1512×982 · 1728×1117 · 1920×1080 · 2560×1440 @ DPR 1–2

At each: selected entity anchored · labels readable ≥10px · hitboxes match · inspector/sidebar no drift · raster sharp · SVG strokes crisp.

### Visual regression (PASS 12)

| Shot | State |
|------|-------|
| Hotel | property · floor selected · room selected |
| Restaurant | location · zone · table |
| Zoom | 100% + 150% browser |

---

## 11. Magic-number search (PASS 5–8)

Audit and eliminate **alignment-critical** literals:

- `left: Npx` / `top: Npx` / `translate(Npx` on entity markers  
- Independent highlight x/y animation vs scene camera  
- Hint anchors like `right: 18%; top: 42%` unless derived  

Keep schematic aesthetic constants that are not entity anchors (corridor decoration) only if they stay visually coherent with room grid — else regenerate from same layout source.

---

## 12. Renderer quality gate

Priority: rich spatial (if HQ) → floor plan → schematic → operational grid.  
Hide Spatial/3D option if anchors invalid or asset under-resolved. Product Live today = SVG/DOM — do not force blurry 3D.

---

## 13. Implementation order (Live)

| Pass | Work |
|------|------|
| 5 | Coordinate-system audit (this doc) — done |
| 6 | Canonical anchors from existing table/room data |
| 7 | Screen-space overlay layer (labels/badges) |
| 8 | Retina/vector: `non-scaling-stroke`, asset size check |
| 9 | Zoom limits · ResizeObserver · fitToEntity/Scene · inspector padding |
| 10 | LOD + label collision |
| 11 | `debugGeometry=1` + geometry validation |
| 12 | Playwright visual snapshots |

---

## 14. Final Live checklist — CLOSED

- [x] Selected room/table stays anchored at all zooms  
- [x] Labels readable (screen-space), never `transform: scale()` text  
- [x] Hitboxes = polygons/bounds  
- [x] Inspector / sidebar / resize preserve alignment  
- [x] Browser zoom + app zoom OK — `tests/e2e/live-browser-zoom-qa.spec.ts` (80–150%)  
- [x] Raster sharp; SVG strokes crisp  
- [x] Mode / time scrub does not remount geometry  
- [x] Continuous selection → inspector — restaurant `ls-inspector-motion` slide; hotel `hl-insp-in`  

### Shipped

| Capability | Location |
|------------|----------|
| `spatialCamera.ts` | fit / project / validate / zoom clamp |
| `?debugGeometry=1` | Restaurant + hotel |
| Label LOD / counter-scale | `VenueWorld` + `hl-tile-num` |
| Inspector continuity | `LiveSpatialShell` motion + hotel CSS |
| Browser zoom E2E | `live-browser-zoom-qa.spec.ts` |
| Visual gates | `live-visual-regression.spec.ts` (`RADR_VISUAL=1`) |

**Definition of done (Live):** met for shipped SVG/DOM Live.
