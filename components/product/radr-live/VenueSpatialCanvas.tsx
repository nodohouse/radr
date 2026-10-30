"use client";

/**
 * RADR Live — Canvas 2D spatial venue (PRIMARY renderer).
 * No WebGL. Perspective projection + architecture + camera + flow.
 */

import { useEffect, useRef } from "react";
import type { LiveEntity } from "@/lib/radr/spatial-live/types";
import {
  SEV_HEX,
  VENUE_FLOOR,
  VENUE_OVERVIEW_CAM,
  VENUE_ZONE_GEOMS,
  entityIdForZone,
  focusCameraForZone,
  zoneKindFromEntity,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";
import {
  type CamState,
  type Vec3,
  BOX_FACES,
  boxCorners,
  easeInOutCubic,
  lerpV,
  project,
  v3,
} from "@/lib/radr/spatial-live/project";

type Props = {
  locationId: string;
  zones: LiveEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHoverZone: (kind: VenueZoneKind | null) => void;
  simProgress?: number;
};

type DrawFace = {
  pts: { x: number; y: number }[];
  depth: number;
  fill: string;
  alpha?: number;
};

type HitZone = {
  id: string;
  kind: VenueZoneKind;
  poly: { x: number; y: number }[];
};

const ZONE_FLOOR: Record<VenueZoneKind, string> = {
  kitchen: "#3a4048",
  bar: "#4a3e32",
  main: "#453e34",
  terrace: "#4e4a42",
  delivery: "#3c403c",
};

const ZONE_WALL: Record<VenueZoneKind, string> = {
  kitchen: "#4a5058",
  bar: "#5a4a3c",
  main: "#52483c",
  terrace: "#5a564c",
  delivery: "#484c48",
};

function camFromLayout(c: {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}): CamState {
  return {
    position: v3(...c.position),
    target: v3(...c.target),
    fov: c.fov ?? VENUE_OVERVIEW_CAM.fov,
  };
}

function pointInPoly(x: number, y: number, poly: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function shade(hex: string, amount: number) {
  const n = hex.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(n.slice(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(n.slice(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(n.slice(4, 6), 16) + amount));
  return `rgb(${r},${g},${b})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function VenueSpatialCanvas({
  locationId,
  zones,
  selectedId,
  onSelect,
  onHoverZone,
  simProgress = 0,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitsRef = useRef<HitZone[]>([]);
  const hoverRef = useRef<VenueZoneKind | null>(null);
  const camRef = useRef<CamState>(camFromLayout(VENUE_OVERVIEW_CAM));
  const camFromRef = useRef<CamState>(camFromLayout(VENUE_OVERVIEW_CAM));
  const camToRef = useRef<CamState>(camFromLayout(VENUE_OVERVIEW_CAM));
  const camAnimRef = useRef({ t: 1, dur: 0.62 });
  const propsRef = useRef({ locationId, zones, selectedId, simProgress, onSelect, onHoverZone });
  propsRef.current = { locationId, zones, selectedId, simProgress, onSelect, onHoverZone };

  // Camera choreography when selection changes
  useEffect(() => {
    const ent = selectedId
      ? zones.find((z) => z.id === selectedId)
      : null;
    const kind = ent ? zoneKindFromEntity(ent) : null;
    const next = kind
      ? camFromLayout({ ...focusCameraForZone(kind), fov: 32 })
      : camFromLayout(VENUE_OVERVIEW_CAM);
    camFromRef.current = { ...camRef.current };
    camToRef.current = next;
    camAnimRef.current = { t: 0, dur: kind ? 0.68 : 0.55 };
  }, [selectedId, zones]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    let raf = 0;
    let running = true;
    let last = performance.now();
    let clock = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = host.clientWidth;
      const h = host.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const pushBox = (
      faces: DrawFace[],
      cam: CamState,
      W: number,
      H: number,
      cx: number,
      cy: number,
      cz: number,
      w: number,
      h: number,
      d: number,
      base: string,
      opts?: { elev?: number; bright?: number; alpha?: number },
    ) => {
      const elev = opts?.elev ?? 0;
      const bright = opts?.bright ?? 0;
      const corners = boxCorners(cx, cy + elev + h / 2, cz, w, h, d);
      const projected = corners.map((c) => project(c, cam, W, H));
      if (projected.filter((p) => p.visible).length < 4) return;
      for (let fi = 0; fi < BOX_FACES.length; fi++) {
        const idx = BOX_FACES[fi];
        const pts = idx.map((i) => ({ x: projected[i].x, y: projected[i].y }));
        if (pts.some((_, i) => !projected[idx[i]].visible)) continue;
        const depth = idx.reduce((s, i) => s + projected[i].depth, 0) / idx.length;
        const faceShade =
          fi === 1 ? 36 + bright : fi === 0 ? -42 : fi === 2 || fi === 3 ? -14 : 10;
        faces.push({
          pts,
          depth,
          fill: shade(base, faceShade),
          alpha: opts?.alpha,
        });
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;

      const {
        locationId: locId,
        zones: zs,
        selectedId: sel,
        simProgress: sim,
      } = propsRef.current;
      const byId = new Map(zs.map((z) => [z.id, z]));
      const selEnt = sel ? byId.get(sel) : undefined;
      const selectedKind = selEnt ? zoneKindFromEntity(selEnt) : null;

      const anim = camAnimRef.current;
      if (anim.t < 1) {
        anim.t = Math.min(1, anim.t + dt / anim.dur);
        const e = easeInOutCubic(anim.t);
        camRef.current = {
          position: lerpV(camFromRef.current.position, camToRef.current.position, e),
          target: lerpV(camFromRef.current.target, camToRef.current.target, e),
          fov: lerpV(
            v3(camFromRef.current.fov, 0, 0),
            v3(camToRef.current.fov, 0, 0),
            e,
          ).x,
        };
      }

      let cam = camRef.current;
      const hover = hoverRef.current;
      if (hover && !selectedKind) {
        const focus = focusCameraForZone(hover);
        const px = (focus.target[0] - VENUE_OVERVIEW_CAM.target[0]) * 0.045;
        const pz = (focus.target[2] - VENUE_OVERVIEW_CAM.target[2]) * 0.045;
        cam = {
          ...cam,
          position: { x: cam.position.x + px, y: cam.position.y, z: cam.position.z + pz },
          target: { x: cam.target.x + px, y: cam.target.y, z: cam.target.z + pz },
        };
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = ctx.createRadialGradient(W * 0.42, H * 0.28, 30, W * 0.5, H * 0.55, H * 0.95);
      bg.addColorStop(0, "#1a1612");
      bg.addColorStop(0.45, "#12100e");
      bg.addColorStop(1, "#080706");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const faces: DrawFace[] = [];
      const hits: HitZone[] = [];
      const kitchenCalm = sim;

      // Soft ground
      {
        const g = project(v3(0.15, -0.4, -0.15), cam, W, H);
        if (g.visible) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = "#060504";
          ctx.beginPath();
          ctx.ellipse(g.x, g.y + 12, W * 0.4, H * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      const [fw, fh, fd] = VENUE_FLOOR.size;
      const [fx, fy, fz] = VENUE_FLOOR.position;
      pushBox(faces, cam, W, H, fx, fy, fz, fw, fh, fd, "#3a342c");
      pushBox(faces, cam, W, H, fx, 0.02, fz, fw * 0.94, 0.06, fd * 0.94, "#4a433a");
      pushBox(faces, cam, W, H, 0.15, 1.2, -fd / 2 + 0.95, fw * 0.86, 2.4, 0.28, "#3c362e");
      pushBox(faces, cam, W, H, -fw / 2 + 1.05, 1.25, -0.4, 0.28, 2.5, fd * 0.7, "#3c362e");
      pushBox(faces, cam, W, H, -0.35, 0.05, -0.4, 14.2, 0.08, 0.55, "#524a40");
      pushBox(faces, cam, W, H, -2.6, 0.1, -0.35, 2.8, 0.95, 0.7, "#4a4540");
      {
        const pulse = 0.5 + Math.sin(clock * 2.2) * 0.5;
        pushBox(
          faces,
          cam,
          W,
          H,
          -2.6,
          1.05,
          -0.35,
          2.6,
          0.08,
          0.55,
          shade("#c9a05a", Math.floor((0.2 + (1 - kitchenCalm) * 0.4) * pulse * 50)),
        );
      }

      type LabelDraw = {
        x: number;
        y: number;
        depth: number;
        title: string;
        metric: string;
        sev: string;
        strong: boolean;
        dim: boolean;
      };
      const labels: LabelDraw[] = [];

      for (const geom of VENUE_ZONE_GEOMS) {
        const id = entityIdForZone(locId, geom.entitySuffix);
        const entity = byId.get(id);
        if (!entity) continue;
        const [x, , z] = geom.position;
        const [w, h, d] = geom.size;
        const selected = sel === id;
        const hovered = hover === geom.kind;
        const dimmed = Boolean(sel && !selected);
        const elev = selected || hovered ? 0.09 : 0;
        const wallH = geom.kind === "terrace" ? 0.55 : Math.min(h, 2.15);
        const alpha = dimmed ? 0.5 : 1;
        const bright = selected ? 20 : hovered ? 12 : 0;

        pushBox(faces, cam, W, H, x, elev, z, w, 0.05, d, ZONE_FLOOR[geom.kind], {
          elev,
          bright,
          alpha,
        });

        const wt = 0.14;
        if (geom.walls.n) {
          pushBox(faces, cam, W, H, x, elev, z - d / 2 + wt / 2, w, wallH, wt, ZONE_WALL[geom.kind], {
            elev,
            bright,
            alpha,
          });
        }
        if (geom.walls.s && geom.kind !== "main") {
          pushBox(
            faces,
            cam,
            W,
            H,
            x,
            elev,
            z + d / 2 - wt / 2,
            w * 0.92,
            wallH * 0.75,
            wt,
            ZONE_WALL[geom.kind],
            { elev, bright, alpha },
          );
        }
        if (geom.walls.e) {
          pushBox(faces, cam, W, H, x + w / 2 - wt / 2, elev, z, wt, wallH, d, ZONE_WALL[geom.kind], {
            elev,
            bright,
            alpha,
          });
        }
        if (geom.walls.w) {
          pushBox(faces, cam, W, H, x - w / 2 + wt / 2, elev, z, wt, wallH, d, ZONE_WALL[geom.kind], {
            elev,
            bright,
            alpha,
          });
        }

        if (geom.kind === "main") {
          for (const [tx, tz] of [
            [-4.2, -1.6], [-1.6, -1.9], [1.0, -1.5], [3.4, -1.8],
            [-3.8, 1.4], [-0.8, 1.7], [2.2, 1.3], [4.4, 1.6],
          ] as [number, number][]) {
            pushBox(faces, cam, W, H, x + tx, elev, z + tz, 0.95, 0.12, 0.95, "#6b5644", {
              elev,
              bright,
              alpha,
            });
            pushBox(faces, cam, W, H, x + tx, elev, z + tz, 0.14, 0.36, 0.14, "#2a2f2c", {
              elev,
              bright,
              alpha,
            });
            for (const [cx, cz] of [
              [0.72, 0],
              [-0.72, 0],
              [0, 0.72],
              [0, -0.72],
            ] as [number, number][]) {
              pushBox(
                faces,
                cam,
                W,
                H,
                x + tx + cx,
                elev,
                z + tz + cz,
                0.28,
                0.32,
                0.28,
                "#3a342e",
                { elev, bright, alpha },
              );
            }
          }
        }
        if (geom.kind === "kitchen") {
          pushBox(faces, cam, W, H, x, elev, z + d * 0.22, w * 0.82, 0.88, 0.78, "#5a6268", {
            elev,
            bright,
            alpha,
          });
          pushBox(
            faces,
            cam,
            W,
            H,
            x,
            elev + 0.9,
            z + d * 0.22,
            w * 0.7,
            0.06,
            0.35,
            "#c86b5c",
            { elev, bright: bright + 24 + Math.sin(clock * 3) * 12, alpha },
          );
          pushBox(faces, cam, W, H, x + w * 0.2, elev, z - d * 0.2, w * 0.34, 0.68, d * 0.3, "#333936", {
            elev,
            bright,
            alpha,
          });
          pushBox(
            faces,
            cam,
            W,
            H,
            x - w * 0.08,
            elev + 1.4,
            z - d * 0.05,
            w * 0.5,
            0.45,
            d * 0.4,
            "#2e3431",
            { elev, bright, alpha },
          );
        }
        if (geom.kind === "bar") {
          pushBox(faces, cam, W, H, x, elev, z + d * 0.12, w * 0.72, 0.85, 1.05, "#3d342c", {
            elev,
            bright,
            alpha,
          });
          pushBox(faces, cam, W, H, x, elev + 0.9, z + d * 0.12, w * 0.74, 0.08, 1.1, "#4a4036", {
            elev,
            bright,
            alpha,
          });
          pushBox(faces, cam, W, H, x, elev, z - d * 0.28, w * 0.68, 1.5, 0.35, "#2a2825", {
            elev,
            bright,
            alpha,
          });
          for (const sx of [-1.4, -0.45, 0.5, 1.4]) {
            pushBox(faces, cam, W, H, x + sx, elev, z + d * 0.38, 0.32, 0.55, 0.32, "#2f2c28", {
              elev,
              bright,
              alpha,
            });
          }
        }
        if (geom.kind === "terrace") {
          for (const [tx, tz] of [
            [-1.4, -1.5],
            [0.2, -1.7],
            [1.5, -1.3],
            [-1.2, 1.2],
            [0.4, 1.5],
            [1.6, 1.1],
          ] as [number, number][]) {
            pushBox(faces, cam, W, H, x + tx, elev, z + tz, 0.85, 0.12, 0.85, "#3a403b", {
              elev,
              bright,
              alpha,
            });
          }
        }
        if (geom.kind === "delivery") {
          pushBox(faces, cam, W, H, x, elev, z, w * 0.55, 0.95, d * 0.45, "#323734", {
            elev,
            bright,
            alpha,
          });
          pushBox(faces, cam, W, H, x, elev, z + d * 0.28, w * 0.7, 0.18, d * 0.22, "#2a302c", {
            elev,
            bright,
            alpha,
          });
        }

        const sev = SEV_HEX[entity.severity];
        const pulse =
          entity.severity === "healthy" ? 0.7 : 0.55 + Math.sin(clock * 2.4) * 0.25;
        pushBox(
          faces,
          cam,
          W,
          H,
          x + w * 0.38,
          elev,
          z - d * 0.38,
          0.18,
          0.42,
          0.18,
          shade(sev, Math.floor(pulse * 30)),
          { elev, bright: 40, alpha: dimmed ? 0.25 : 1 },
        );

        if (selected || hovered) {
          pushBox(faces, cam, W, H, x, elev + 0.01, z, w + 0.35, 0.04, d + 0.35, shade(sev, -15), {
            elev,
            bright: 8,
            alpha: selected ? 0.4 : 0.22,
          });
        }

        const top = [0, 1, 2, 3].map((i) => {
          const c = boxCorners(x, elev + 0.04, z, w, 0.02, d)[i + 4];
          return project(c, cam, W, H);
        });
        if (top.every((p) => p.visible)) {
          hits.push({ id, kind: geom.kind, poly: top.map((p) => ({ x: p.x, y: p.y })) });
        }

        const anchor = project(v3(x, wallH + 0.9 + elev, z), cam, W, H);
        if (anchor.visible) {
          const primary = entity.metrics[0];
          const metric =
            geom.kind === "kitchen"
              ? `${primary?.value ?? "91%"} load`
              : geom.kind === "delivery"
                ? String(primary?.value ?? "34%")
                : `${primary?.value ?? ""} occupied`.trim();
          labels.push({
            x: anchor.x,
            y: anchor.y,
            depth: anchor.depth,
            title: entity.label.toUpperCase(),
            metric,
            sev: entity.severity,
            strong: selected || hovered,
            dim: dimmed && !hovered,
          });
        }
      }

      // Flow particles
      const bunch = (1 - kitchenCalm) * 0.45;
      const flows: { a: Vec3; b: Vec3; color: string; lag: number; speed: number }[] = [
        { a: v3(-1.2, 0.42, 1.6), b: v3(-4.0, 0.42, -2.2), color: "#00d978", lag: 0, speed: 0.2 },
        { a: v3(-1.2, 0.42, 1.6), b: v3(-4.0, 0.42, -2.2), color: "#3dcf8e", lag: 0.34, speed: 0.2 },
        { a: v3(-4.2, 0.42, -1.4), b: v3(-6.4, 0.42, 2.2), color: "#c9a05a", lag: 0.12, speed: 0.22 },
        { a: v3(-4.2, 0.42, -1.4), b: v3(-6.4, 0.42, 2.2), color: "#c86b5c", lag: 0.48, speed: 0.19 },
        { a: v3(-4.2, 0.42, -1.4), b: v3(-6.4, 0.42, 2.2), color: "#c86b5c", lag: 0.72, speed: 0.2 },
        { a: v3(-4.0, 0.42, -2.0), b: v3(-0.8, 0.42, 1.8), color: "#7ec8a8", lag: 0.22, speed: 0.16 },
      ];
      for (const f of flows) {
        const slowed = f.speed * (1 - bunch * 0.5);
        let u = (clock * slowed + f.lag) % 1;
        if (bunch > 0.2) u = Math.pow(u, 1 + bunch);
        const p = v3(
          f.a.x + (f.b.x - f.a.x) * u,
          f.a.y + Math.sin(u * Math.PI) * 0.14,
          f.a.z + (f.b.z - f.a.z) * u,
        );
        const s = project(p, cam, W, H);
        if (!s.visible) continue;
        ctx.save();
        ctx.globalAlpha = 0.18 + Math.sin(u * Math.PI) * 0.5;
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.4 + Math.sin(u * Math.PI) * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      faces.sort((a, b) => b.depth - a.depth);
      for (const face of faces) {
        if (face.pts.length < 3) continue;
        ctx.save();
        if (face.alpha != null && face.alpha < 1) ctx.globalAlpha = face.alpha;
        ctx.beginPath();
        ctx.moveTo(face.pts[0].x, face.pts[0].y);
        for (let i = 1; i < face.pts.length; i++) ctx.lineTo(face.pts[i].x, face.pts[i].y);
        ctx.closePath();
        ctx.fillStyle = face.fill;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.lineWidth = 0.55;
        ctx.stroke();
        ctx.restore();
      }

      // Labels (after geometry)
      labels.sort((a, b) => b.depth - a.depth);
      for (const lb of labels) {
        const padX = 8;
        const padY = 6;
        ctx.save();
        ctx.globalAlpha = lb.dim ? 0.28 : lb.strong ? 1 : 0.72;
        ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
        const tw = Math.max(ctx.measureText(lb.title).width, ctx.measureText(lb.metric).width);
        const boxW = tw + padX * 2;
        const boxH = lb.strong ? 42 : 32;
        const bx = lb.x - boxW / 2;
        const by = lb.y - boxH - 6;
        ctx.fillStyle = "rgba(12, 14, 12, 0.78)";
        ctx.strokeStyle = lb.strong
          ? "rgba(0, 217, 120, 0.28)"
          : "rgba(255,255,255,0.1)";
        roundRect(ctx, bx, by, boxW, boxH, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f2f4f2";
        ctx.fillText(lb.title, bx + padX, by + 14);
        ctx.font = "400 11px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "rgba(242,244,242,0.68)";
        ctx.fillText(lb.metric, bx + padX, by + 28);
        if (lb.strong) {
          ctx.font = "500 9px ui-sans-serif, system-ui, sans-serif";
          ctx.fillStyle =
            lb.sev === "intervene" || lb.sev === "critical"
              ? "#c86b5c"
              : lb.sev === "watch"
                ? "#c9a05a"
                : "#3dcf8e";
          const tag =
            lb.sev === "intervene" || lb.sev === "critical"
              ? "● High pressure"
              : lb.sev === "watch"
                ? "● Watch"
                : "● Healthy";
          ctx.fillText(tag, bx + padX, by + 40);
        }
        ctx.restore();
      }

      hitsRef.current = hits;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.body.style.cursor = "auto";
    };
  }, []);

  const pick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = hitsRef.current.length - 1; i >= 0; i--) {
      const h = hitsRef.current[i];
      if (pointInPoly(x, y, h.poly)) return h;
    }
    return null;
  };

  return (
    <div
      className="rp-live3-canvas rp-live3-spatial2d"
      ref={hostRef}
      data-testid="radr-live-canvas"
      data-renderer="canvas2d"
    >
      <canvas
        ref={canvasRef}
        className="rp-live3-spatial-canvas"
        onMouseMove={(e) => {
          const hit = pick(e.clientX, e.clientY);
          const kind = hit?.kind ?? null;
          if (hoverRef.current !== kind) {
            hoverRef.current = kind;
            propsRef.current.onHoverZone(kind);
            document.body.style.cursor = kind ? "pointer" : "auto";
          }
        }}
        onMouseLeave={() => {
          hoverRef.current = null;
          propsRef.current.onHoverZone(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          const hit = pick(e.clientX, e.clientY);
          propsRef.current.onSelect(hit?.id ?? "");
        }}
      />
    </div>
  );
}
