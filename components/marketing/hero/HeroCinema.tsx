"use client";

import { useEffect, useRef } from "react";
import {
  PARTICLE_CONFIGS,
  RADAR_OX,
  RADAR_OY,
  SHORT_LABEL,
  SPEC_BY_ID,
  type DeltaSpec,
} from "@/lib/radr/deltaFieldData";

export const SWEEP_MS = 7200;

const COLORS = {
  BUY: "#00ff7a",
  LABOR: "#d4a8ff",
  SELL: "#ffc24a",
  RECOVER: "#7dffc4",
} as const;

type Drop = {
  specId: string;
  xPct: number;
  yStart: number;
  depth: "back" | "mid" | "front";
  period: number;
  phase: number;
  scale: number;
  opacity: number;
  driftX: number;
  material: boolean;
  lands: boolean;
  value: string;
  label: string;
  color: string;
  territory: string;
  landed: boolean;
};

type Props = {
  active: boolean;
  reduced: boolean;
  speedBoost?: number;
  ctaHot?: boolean;
  /** Scroll dissolve: read each frame, never remount */
  opacityRef?: { current: number };
  onLand?: (spec: DeltaSpec, x: number, y: number) => void;
  onFirstDetect?: () => void;
};

function norm(a: number) {
  let x = a % 360;
  if (x < 0) x += 360;
  return x;
}

function drawDelta(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const h = size * 0.92;
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.55);
  ctx.lineTo(x + size * 0.52, y + h * 0.42);
  ctx.lineTo(x - size * 0.52, y + h * 0.42);
  ctx.closePath();
  ctx.stroke();
}

function buildDrops(speedBoost: number): Drop[] {
  const picks = PARTICLE_CONFIGS.filter((c) => c.x >= 40);
  return picks.map((c, i) => {
    const spec = SPEC_BY_ID[c.specId]!;
    const periodBoost = c.depth === "back" ? 0.88 : 1;
    return {
      specId: c.specId,
      xPct: c.x,
      yStart: c.yStart,
      depth: c.depth,
      period: (c.duration / speedBoost) * 1000 * periodBoost,
      phase: (i * 0.113 + c.delay * 0.04) % 1,
      scale: c.scale,
      opacity: spec.material ? 0.95 : 0.55,
      driftX: c.driftX * 0.45,
      material: spec.material,
      lands: c.lands,
      value: spec.value.replace(" / yr", ""),
      label: spec.label ? SHORT_LABEL[spec.label] ?? spec.label.toUpperCase() : "",
      color: COLORS[spec.territory],
      territory: spec.territory,
      landed: false,
    };
  });
}

/**
 * One cinematic canvas: living sonar + neon delta rain + hit pings.
 * Smooth @ 30fps. Opacity/active via refs (no remount thrash).
 */
export function HeroCinema({
  active,
  reduced,
  speedBoost = 1,
  ctaHot = false,
  opacityRef,
  onLand,
  onFirstDetect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const ctaRef = useRef(ctaHot);
  const localOp = useRef(1);
  const opRef = opacityRef ?? localOp;
  const cbs = useRef({ onLand, onFirstDetect });
  activeRef.current = active;
  ctaRef.current = ctaHot;
  cbs.current = { onLand, onFirstDetect };
  const firstDetect = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let last = 0;
    const FPS = 1000 / 30;
    const dprMax = 1.5;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const drops = buildDrops(speedBoost);
    const t0 = performance.now();
    let intro = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, dprMax);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ox = () => (RADAR_OX / 100) * w;
    const oy = () => (RADAR_OY / 100) * h;

    const drawSonar = (now: number, beamDeg: number) => {
      const cx = ox();
      const cy = oy();
      const pulse = 0.92 + 0.08 * Math.sin(now * 0.0015);
      const hot = ctaRef.current;

      // Origin bloom
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.48);
      bloom.addColorStop(0, `rgba(0, 255, 130, ${0.28 * pulse})`);
      bloom.addColorStop(0.28, `rgba(0, 255, 130, ${0.12 * pulse})`);
      bloom.addColorStop(1, "rgba(0, 255, 130, 0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.42, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rings: elliptical sonar dish
      const rings = [
        [0.08, 0.045, 0.75],
        [0.14, 0.075, 0.58],
        [0.22, 0.115, 0.46],
        [0.32, 0.165, 0.36],
        [0.44, 0.225, 0.26],
        [0.58, 0.295, 0.18],
        [0.74, 0.375, 0.12],
      ] as const;

      ctx.lineWidth = 1.35;
      for (let i = 0; i < rings.length; i++) {
        const [rx, ry, a] = rings[i]!;
        const breathe = 1 + Math.sin(now * 0.0012 + i * 0.4) * 0.014;
        ctx.strokeStyle = `rgba(120, 255, 190, ${a * pulse})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * rx * breathe, h * ry * breathe, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair spokes
      ctx.strokeStyle = "rgba(0, 255, 130, 0.1)";
      ctx.lineWidth = 0.8;
      for (let deg = 0; deg < 180; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * w * 0.55, cy + Math.sin(rad) * h * 0.28);
        ctx.stroke();
      }

      // Sweep wedge (canvas: never disappears)
      const sweepMs = hot ? 5600 : SWEEP_MS;
      const ang = ((now / sweepMs) * Math.PI * 2) % (Math.PI * 2);
      // Align with CSS rotate convention used for detection
      void beamDeg;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang - Math.PI / 2);

      const reachX = w * 0.48;
      const reachY = h * 0.32;

      // Soft trail
      for (let i = 0; i < 14; i++) {
        const t = i / 14;
        const spread = 0.06 + t * 0.7;
        ctx.fillStyle = `rgba(0, 255, 130, ${(1 - t) * (hot ? 0.2 : 0.14)})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.ellipse(0, 0, reachX, reachY, 0, -spread, 0.025, false);
        ctx.closePath();
        ctx.fill();
      }

      // Bright leading edge
      ctx.strokeStyle = hot
        ? "rgba(255, 255, 255, 1)"
        : "rgba(230, 255, 240, 0.98)";
      ctx.lineWidth = hot ? 2.8 : 2.2;
      ctx.shadowColor = "rgba(0, 255, 130, 1)";
      ctx.shadowBlur = hot ? 22 : 16;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(reachX * 0.98, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Core tip glow
      const tip = ctx.createRadialGradient(reachX * 0.55, 0, 0, reachX * 0.55, 0, 40);
      tip.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      tip.addColorStop(1, "rgba(0, 255, 130, 0)");
      ctx.fillStyle = tip;
      ctx.beginPath();
      ctx.arc(reachX * 0.55, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Origin nugget
      ctx.fillStyle = "rgba(180, 255, 210, 0.95)";
      ctx.shadowColor = "rgba(0, 255, 130, 0.9)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawNetHint = () => {
      const cx = ox();
      const cy = oy();
      // Vertical dashed depth lines
      ctx.setLineDash([3, 7]);
      ctx.lineWidth = 0.8;
      for (let i = -4; i <= 5; i++) {
        const x = cx + i * w * 0.055;
        ctx.strokeStyle = "rgba(0, 255, 130, 0.12)";
        ctx.beginPath();
        ctx.moveTo(x, cy - h * 0.28);
        ctx.lineTo(cx + i * w * 0.018, cy + h * 0.12);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Particle floor
      const top = h * 0.68;
      for (let i = 0; i < 7; i++) {
        const y = top + i * (h * 0.038);
        ctx.beginPath();
        ctx.strokeStyle =
          i % 3 === 1 ? "rgba(240, 184, 122, 0.16)" : "rgba(0, 255, 130, 0.18)";
        ctx.lineWidth = i === 2 ? 1.3 : 1;
        for (let x = w * 0.32; x <= w; x += 18) {
          const yy = y + Math.sin(x * 0.011 + i * 0.7) * (4 + i * 0.6);
          if (x === w * 0.32) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    };

    const drawRain = (now: number, _beamDeg: number, introMul: number) => {
      const valFront = 21;
      const valMid = 17;
      const valBack = 13;
      const floorY = oy() + h * 0.06;

      for (const d of drops) {
        if (d.xPct < 40) continue;

        const u = (now / d.period + d.phase) % 1;
        const prevU = ((now - 33) / d.period + d.phase) % 1;
        if (prevU > u) d.landed = false;

        const yPct = d.yStart + u * (108 - d.yStart);
        const x = (d.xPct / 100) * w + d.driftX * u;
        const y = (yPct / 100) * h;

        let a = d.opacity * introMul;
        if (u < 0.04) a *= u / 0.04;
        if (u > 0.92) a *= (1 - u) / 0.08;
        a = Math.max(0, Math.min(1, a));
        if (a < 0.04) continue;

        ctx.fillStyle = d.color;
        ctx.strokeStyle = d.color;

        if (!d.material) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.globalAlpha = a;
          ctx.font = `600 ${valBack}px ui-sans-serif, system-ui, sans-serif`;
          ctx.fillText(d.value, x, y);
          continue;
        }

        const valSize = d.depth === "front" ? valFront : valMid;
        const deltaSize = valSize * 0.7;
        const pinEnd = Math.min(floorY, y + 64);

        ctx.globalAlpha = a * 0.55;
        ctx.lineWidth = 1.15;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(x, y + valSize * 0.65);
        ctx.lineTo(x, pinEnd);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, pinEnd, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${valSize}px ui-sans-serif, system-ui, sans-serif`;
        const vw = ctx.measureText(d.value).width;
        const left = x - (deltaSize + 6 + vw) / 2;
        const dx = left + deltaSize * 0.5;
        const vx = left + deltaSize + 6;

        ctx.globalAlpha = a;
        ctx.lineWidth = 1.7;
        drawDelta(ctx, dx, y, deltaSize);
        ctx.fillText(d.value, vx, y);
        ctx.globalAlpha = a * 0.35;
        ctx.fillText(d.value, vx, y);
        ctx.lineWidth = 2.2;
        drawDelta(ctx, dx, y, deltaSize);

        ctx.textAlign = "center";
        ctx.globalAlpha = a * 0.88;
        ctx.font = `600 11px ui-monospace, monospace`;
        ctx.fillText(d.territory, x, y + valSize * 0.95);

        if (d.lands && !d.landed && yPct >= 76) {
          d.landed = true;
          const spec = SPEC_BY_ID[d.specId];
          if (spec) {
            cbs.current.onLand?.(spec, d.xPct, yPct);
            if (!firstDetect.current) {
              firstDetect.current = true;
              cbs.current.onFirstDetect?.();
            }
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";
    };

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!activeRef.current) return;
      if (now - last < FPS) return;
      last = now;

      intro = Math.min(1, (now - t0) / 1400);
      const introMul = intro * intro * (3 - 2 * intro); // smoothstep
      const fieldA = introMul * Math.max(0, Math.min(1, opRef.current));

      ctx.clearRect(0, 0, w, h);
      if (fieldA < 0.02) return;

      ctx.globalAlpha = fieldA;
      const sweepMs = ctaRef.current ? 5600 : SWEEP_MS;
      const beamDeg = norm(((now - t0) / sweepMs) * 360);

      drawSonar(now, beamDeg);
      drawNetHint();
      ctx.globalAlpha = 1;
      drawRain(now, beamDeg, fieldA);
    };

    if (reduced) {
      // Static still: rings + a few values
      drawSonar(performance.now(), 40);
      drawNetHint();
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.7;
      for (const d of drops.filter((x) => x.depth !== "back").slice(0, 6)) {
        ctx.fillStyle = d.color;
        ctx.font = `700 ${Math.round(14 * d.scale)}px system-ui, sans-serif`;
        ctx.fillText(
          d.value,
          (d.xPct / 100) * w,
          ((20 + d.phase * 50) / 100) * h,
        );
      }
      ctx.globalAlpha = 1;
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduced, speedBoost]);

  return (
    <canvas
      ref={canvasRef}
      className="rx-hero-cinema"
      aria-hidden="true"
      data-active={active ? "true" : "false"}
    />
  );
}