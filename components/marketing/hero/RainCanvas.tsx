"use client";

import { useEffect, useRef } from "react";
import {
  PARTICLE_CONFIGS,
  RADAR_OX,
  RADAR_OY,
  SPEC_BY_ID,
  type DeltaSpec,
} from "@/lib/radr/deltaFieldData";

export const SWEEP_MS = 8000;

const RAIN_COLORS = {
  BUY: "#3dff9c",
  LABOR: "#d2c4ff",
  SELL: "#ffc78a",
  RECOVER: "#efd4ff",
} as const;

type Drop = {
  specId: string;
  xPct: number;
  yStart: number;
  depth: "back" | "mid" | "front";
  duration: number;
  delay: number;
  scale: number;
  opacity: number;
  driftX: number;
  material: boolean;
  lands: boolean;
  value: string;
  color: string;
  /** cycle start (ms, performance.now) */
  t0: number;
  detected: boolean;
  landed: boolean;
};

function normAngle(a: number) {
  let x = a % 360;
  if (x < 0) x += 360;
  return x;
}

function angleDelta(a: number, b: number) {
  const d = Math.abs(normAngle(a) - normAngle(b));
  return Math.min(d, 360 - d);
}

function pointAngle(xPct: number, yPct: number) {
  const dx = xPct - RADAR_OX;
  const dy = yPct - RADAR_OY;
  return normAngle((Math.atan2(dx, -dy) * 180) / Math.PI);
}

function buildDrops(speedBoost: number, now: number): Drop[] {
  // Cap density hard: canvas stays smooth
  const configs = PARTICLE_CONFIGS.filter((c) => {
    if (c.depth === "back") return c.slot % 2 === 0;
    return true;
  }).slice(0, 14);

  return configs.map((c, i) => {
    const spec = SPEC_BY_ID[c.specId]!;
    return {
      specId: c.specId,
      xPct: c.x,
      yStart: c.yStart,
      depth: c.depth,
      duration: (c.duration / speedBoost) * 1000,
      delay: (c.delay / speedBoost) * 1000,
      scale: c.scale,
      opacity: c.opacity,
      driftX: c.driftX,
      material: spec.material,
      lands: c.lands,
      value: spec.value,
      color: RAIN_COLORS[spec.territory],
      t0: now - (i % 5) * 400,
      detected: false,
      landed: false,
    };
  });
}

type Props = {
  active: boolean;
  reduced: boolean;
  speedBoost?: number;
  opacity?: number;
  onDetect?: (spec: DeltaSpec) => void;
  onLand?: (spec: DeltaSpec, x: number, y: number) => void;
  onFirstDetect?: () => void;
};

/**
 * Single-canvas delta rain: one RAF @ ~30fps, no DOM particles.
 */
export function RainCanvas({
  active,
  reduced,
  speedBoost = 1,
  opacity = 1,
  onDetect,
  onLand,
  onFirstDetect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbs = useRef({ onDetect, onLand, onFirstDetect });
  cbs.current = { onDetect, onLand, onFirstDetect };
  const firstDetect = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let last = 0;
    const TARGET = 1000 / 30;
    const dprCap = 1.25;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const drops = buildDrops(speedBoost, performance.now());
    const sweepT0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawReduced = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const d of drops) {
        if (d.xPct < 42) continue;
        const x = (d.xPct / 100) * w;
        const y = ((14 + (d.delay % 7) * 9) / 100) * h;
        ctx.globalAlpha = d.opacity * 0.7 * opacity;
        ctx.fillStyle = d.color;
        ctx.font = `${Math.round(13 * d.scale)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillText(d.value, x, y);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!active) return;
      if (now - last < TARGET) return;
      last = now;

      ctx.clearRect(0, 0, w, h);
      if (opacity < 0.02) return;

      const sweep = (((now - sweepT0) % SWEEP_MS) / SWEEP_MS) * 360;
      const beam = normAngle(sweep + 90);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const d of drops) {
        // Keep copy column empty
        if (d.xPct < 44) continue;

        let local = now - d.t0;
        const cycle = d.delay + d.duration + 80;
        if (local < 0) continue;
        if (local > cycle) {
          d.t0 = now;
          d.detected = false;
          d.landed = false;
          local = 0;
        }

        if (local < d.delay) continue;
        const p = (local - d.delay) / d.duration;
        if (p > 1) continue;

        const yPct = d.yStart + p * (108 - d.yStart);
        const x = (d.xPct / 100) * w + d.driftX * p;
        const y = (yPct / 100) * h;

        let a = d.opacity;
        if (p < 0.05) a *= p / 0.05;
        if (p > 0.9) a *= (1 - p) / 0.1;
        a *= opacity;
        if (d.detected) a = Math.min(1, a * 1.35);

        const size =
          d.depth === "front"
            ? 15 * d.scale
            : d.depth === "mid"
              ? 13 * d.scale
              : 11 * d.scale;

        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.fillStyle = d.color;
        ctx.shadowBlur = 0;
        ctx.font = `700 ${Math.round(size)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillText(d.value, x, y);

        // Neon via cheap second pass (no shadowBlur: GPU killer)
        if (d.depth === "front" || d.detected) {
          ctx.globalAlpha = Math.max(0, Math.min(1, a * 0.35));
          ctx.font = `700 ${Math.round(size + 0.5)}px ui-sans-serif, system-ui, sans-serif`;
          ctx.fillText(d.value, x, y);
        }

        // Short trail for mid/front only
        if (d.depth !== "back" && a > 0.2) {
          ctx.globalAlpha = a * 0.28;
          ctx.strokeStyle = d.color;
          ctx.lineWidth = d.depth === "front" ? 1.3 : 1;
          ctx.beginPath();
          ctx.moveTo(x, y + size * 0.55);
          ctx.lineTo(x - d.driftX * 0.06, y + 32);
          ctx.stroke();
        }

        // Detect (material only)
        if (
          d.material &&
          !d.detected &&
          yPct > 32 &&
          yPct < 74
        ) {
          const dist = Math.hypot(d.xPct - RADAR_OX, yPct - RADAR_OY);
          if (dist < 44 && dist > 3) {
            const pa = pointAngle(d.xPct, yPct);
            if (angleDelta(pa, beam) <= 16) {
              d.detected = true;
              const spec = SPEC_BY_ID[d.specId];
              if (spec) {
                cbs.current.onDetect?.(spec);
                if (!firstDetect.current) {
                  firstDetect.current = true;
                  cbs.current.onFirstDetect?.();
                }
              }
            }
          }
        }

        if (d.lands && d.detected && !d.landed && yPct >= 74) {
          d.landed = true;
          const spec = SPEC_BY_ID[d.specId];
          if (spec) cbs.current.onLand?.(spec, d.xPct, yPct);
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    if (reduced) {
      drawReduced();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, reduced, speedBoost, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="rx-rain-canvas"
      aria-hidden="true"
    />
  );
}
