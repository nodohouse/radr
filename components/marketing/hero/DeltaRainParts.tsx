"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import { animate, motion, useMotionValue, type MotionValue } from "motion/react";
import { TERRITORY_COLORS } from "@/lib/radr/brandTokens";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";
import { RadrWordmark } from "@/components/radr/RadrWordmark";
import { TextSep } from "@/components/TextSep";
import {
  RADAR_OX,
  RADAR_OY,
  SHORT_LABEL,
  SPEC_BY_ID,
  type DeltaSpec,
  type ParticleConfig,
} from "@/lib/radr/deltaFieldData";

type Phase = "idle" | "falling" | "detected" | "landing";

/** Neon rain palette: brighter than chrome territory tokens */
const RAIN_COLORS = {
  BUY: "#3dff9c",
  LABOR: "#d2c4ff",
  SELL: "#ffc78a",
  RECOVER: "#efd4ff",
} as const;

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

/** CSS sweep period: keep in sync with .rx-radar-beam-wrap animation */
export const SWEEP_MS = 8000;

/**
 * Rain drop: CSS compositor fall (no Motion per-frame).
 * Detect/land only for material mid/front.
 */
export const DeltaSignal = memo(function DeltaSignal({
  config,
  reduced,
  paused = false,
  sweepRef,
  speedBoost,
  onDetect,
  onLand,
  onFirstDetect,
}: {
  config: ParticleConfig;
  reduced: boolean;
  paused?: boolean;
  sweepRef: MutableRefObject<number>;
  speedBoost: number;
  onDetect: (spec: DeltaSpec) => void;
  onLand: (spec: DeltaSpec, x: number, y: number) => void;
  onFirstDetect: () => void;
}) {
  const spec = SPEC_BY_ID[config.specId]!;
  const color = RAIN_COLORS[spec.territory];
  const [phase, setPhase] = useState<Phase>(reduced ? "falling" : "idle");
  const detectedRef = useRef(false);
  const cycleRef = useRef(0);
  const elRef = useRef<HTMLDivElement>(null);

  const needsDetect =
    !reduced && spec.material && config.depth !== "back";

  const meta =
    spec.material && spec.label
      ? SHORT_LABEL[spec.label] ?? spec.label.toUpperCase()
      : null;

  const dur = config.duration / speedBoost;
  const delay = config.delay / speedBoost;
  const fallDist = `${108 - config.yStart}vh`;

  const style = {
    left: `${config.x}%`,
    top: `${config.yStart}%`,
    color,
    ["--rain-c" as string]: color,
    ["--rain-op" as string]: String(config.opacity),
    ["--drift-x" as string]: `${config.driftX}px`,
    ["--fall-dist" as string]: fallDist,
    ["--fall-dur" as string]: `${dur}s`,
    ["--fall-delay" as string]: `${delay}s`,
    ["--rain-scale" as string]: String(config.scale),
    animationPlayState: paused || reduced ? "paused" : "running",
  } as CSSProperties;

  // Time-based detect (no per-frame Motion / layout reads)
  useEffect(() => {
    if (!needsDetect || paused) return;

    let cancelled = false;
    const timers: number[] = [];
    const span = 108 - config.yStart;
    const durMs = dur * 1000;
    const delayMs = delay * 1000;

    const armCycle = () => {
      if (cancelled) return;
      cycleRef.current += 1;
      const cycle = cycleRef.current;
      const cycleStart = performance.now();
      detectedRef.current = false;
      setPhase("falling");

      const enterMs = delayMs + ((32 - config.yStart) / span) * durMs;
      const exitMs = delayMs + ((74 - config.yStart) / span) * durMs;
      const landMs = delayMs + ((76 - config.yStart) / span) * durMs;
      const endMs = delayMs + durMs;

      const poll = window.setInterval(() => {
        if (cancelled || cycle !== cycleRef.current || detectedRef.current) return;
        const now = performance.now() - cycleStart;
        if (now < enterMs || now > exitMs) return;

        const y = config.yStart + ((now - delayMs) / durMs) * span;
        const dist = Math.hypot(config.x - RADAR_OX, y - RADAR_OY);
        if (dist > 44 || dist < 3) return;

        const beam = normAngle(sweepRef.current + 90);
        if (angleDelta(pointAngle(config.x, y), beam) > 16) return;

        detectedRef.current = true;
        setPhase("detected");
        onDetect(spec);
        onFirstDetect();
        window.clearInterval(poll);

        if (config.lands) {
          const landT = window.setTimeout(() => {
            if (cancelled || cycle !== cycleRef.current) return;
            setPhase("landing");
            onLand(spec, config.x, 76);
          }, Math.max(0, landMs - now));
          timers.push(landT);
        }
      }, 100);
      timers.push(poll as unknown as number);

      const restart = window.setTimeout(() => {
        if (cancelled || cycle !== cycleRef.current) return;
        detectedRef.current = false;
        setPhase("idle");
        armCycle();
      }, endMs + 40);
      timers.push(restart);
    };

    armCycle();

    return () => {
      cancelled = true;
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDetect, paused, speedBoost, config.slot]);

  useEffect(() => {
    if (!needsDetect || phase !== "detected") return;
    const t = window.setTimeout(() => {
      if (!config.lands) setPhase("falling");
    }, 700);
    return () => window.clearTimeout(t);
  }, [phase, needsDetect, config.lands]);

  const depthZ =
    config.depth === "back" ? 2 : config.depth === "mid" ? 3 : 4;
  const showMeta =
    spec.material && (config.depth === "front" || config.depth === "mid");
  const lit = phase === "detected" || phase === "landing";
  const trailH =
    config.depth === "front" ? Math.min(config.trail, 160) : Math.min(config.trail, 90);

  return (
    <div
      ref={elRef}
      className="rx-rain-signal rx-rain-signal--css"
      data-depth={config.depth}
      data-phase={phase}
      data-material={spec.material ? "true" : "false"}
      data-terr={spec.territory}
      style={{ ...style, zIndex: depthZ }}
    >
      {phase === "detected" ? (
        <span className="rx-rain-flash" aria-hidden="true" />
      ) : null}

      <span className="rx-rain-head">
        {spec.material && config.depth === "front" ? (
          <span className="rx-rain-delta" aria-hidden="true">
            <RadrDeltaGlyph />
          </span>
        ) : null}
        <span className="rx-rain-val">{spec.value}</span>
      </span>

      {showMeta ? (
        <span className={`rx-rain-meta${lit ? "" : " rx-rain-meta--quiet"}`}>
          <em>{spec.territory}</em>
          {lit && meta ? <strong>{meta}</strong> : null}
        </span>
      ) : null}

      {trailH > 0 && config.depth !== "back" ? (
        <span
          className="rx-rain-trail"
          data-style={config.trailStyle}
          data-lit={lit ? "true" : "false"}
          style={{ height: trailH }}
          aria-hidden="true"
        >
          <i />
        </span>
      ) : null}
    </div>
  );
});

/* === Radar: CSS-driven sweep (GPU, no JS lag) === */

const RINGS = [
  { rx: 70, ry: 18, o: 0.32 },
  { rx: 120, ry: 30, o: 0.26 },
  { rx: 180, ry: 46, o: 0.22 },
  { rx: 255, ry: 66, o: 0.18 },
  { rx: 340, ry: 88, o: 0.14 },
  { rx: 440, ry: 115, o: 0.1 },
  { rx: 560, ry: 148, o: 0.07 },
];

export function RadarField({
  ctaHot,
  reduced,
  beamOpacity,
}: {
  ctaHot?: boolean;
  reduced: boolean;
  beamOpacity?: MotionValue<number>;
}) {
  return (
    <div
      className="rx-radar"
      data-cta={ctaHot ? "hot" : "calm"}
      aria-hidden="true"
      style={{
        left: `${RADAR_OX}vw`,
        top: `${RADAR_OY}vh`,
      }}
    >
      <svg
        className="rx-radar-rings"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid meet"
      >
        {RINGS.map((r, i) => (
          <ellipse
            key={i}
            cx="600"
            cy="300"
            rx={r.rx}
            ry={r.ry}
            fill="none"
            stroke="rgba(0,255,130,0.9)"
            strokeWidth={i === 0 ? 1.4 : 0.85}
            opacity={r.o}
          />
        ))}
        {[0, 45, 90, 135].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 600 + Math.cos(rad) * 520;
          const y2 = 300 + Math.sin(rad) * 140;
          return (
            <line
              key={deg}
              x1="600"
              y1="300"
              x2={x2}
              y2={y2}
              stroke="rgba(0,255,130,0.12)"
              strokeWidth="0.6"
            />
          );
        })}
        <ellipse
          cx="600"
          cy="300"
          rx="12"
          ry="5"
          fill="rgba(0,255,130,0.85)"
          opacity={0.95}
        />
      </svg>

      {!reduced ? (
        <motion.div
          className="rx-radar-beam-wrap"
          aria-hidden="true"
          style={beamOpacity ? { opacity: beamOpacity } : undefined}
        >
          <div className="rx-radar-beam rx-radar-beam--tail" />
          <div className="rx-radar-beam rx-radar-beam--body" />
          <div className="rx-radar-beam rx-radar-beam--core" />
        </motion.div>
      ) : (
        <div
          className="rx-radar-beam-wrap rx-radar-beam-wrap--static"
          aria-hidden="true"
        >
          <div className="rx-radar-beam rx-radar-beam--body" />
          <div className="rx-radar-beam rx-radar-beam--core" />
        </div>
      )}
    </div>
  );
}

/* === Data net: static bitmap + light live layer @ ~24fps === */

type NetDot = {
  x: number;
  y: number;
  r: number;
  c: string;
  a: number;
  phase: number;
  speed: number;
};

function buildNetDots(w: number, h: number) {
  const staticDots: NetDot[] = [];
  const liveDots: NetDot[] = [];
  const cols = 28;
  const rows = 12;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const u = col / (cols - 1);
      const v = row / (rows - 1);
      const wave = Math.sin(u * Math.PI * 3.2 + v * 2.1) * 0.04;
      const x = u * w + Math.sin(row * 1.7 + col) * 2.2;
      const y = v * h * 0.92 + wave * h + v * v * h * 0.08;
      let c: string = TERRITORY_COLORS.BUY;
      if (u > 0.72) c = TERRITORY_COLORS.SELL;
      else if (u > 0.55 && (col + row) % 5 === 0) c = TERRITORY_COLORS.LABOR;
      else if (u > 0.35 && (col * 3 + row) % 11 === 0)
        c = TERRITORY_COLORS.RECOVER;

      staticDots.push({
        x,
        y,
        r: 0.55 + v * 1.1,
        c,
        a: 0.18 + v * 0.45,
        phase: 0,
        speed: 0,
      });
    }
  }
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < 16; i++) {
    const u = 0.52 + rnd() * 0.38;
    const v = 0.2 + rnd() * 0.6;
    liveDots.push({
      x: u * w,
      y: v * h,
      r: 1.1 + rnd() * 1.3,
      c: u > 0.7 ? TERRITORY_COLORS.SELL : TERRITORY_COLORS.BUY,
      a: 0.5 + rnd() * 0.35,
      phase: rnd() * Math.PI * 2,
      speed: 0.8 + rnd(),
    });
  }
  return { staticDots, liveDots };
}

type Landing = { id: string; x: number; y: number; color: string; key: number };

export function DataNet({
  landings,
  reduced,
  active = true,
}: {
  landings: Landing[];
  reduced: boolean;
  active?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLCanvasElement | null>(null);
  const poolRef = useRef({ staticDots: [] as NetDot[], liveDots: [] as NetDot[] });
  const landingsRef = useRef(landings);
  const activeRef = useRef(active);
  landingsRef.current = landings;
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let lastDraw = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const FRAME_MS = 1000 / 24;

    const paintStatic = (w: number, h: number) => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.floor(w * dpr));
      off.height = Math.max(1, Math.floor(h * dpr));
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = octx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "rgba(0,255,130,0.08)");
      g.addColorStop(0.55, "rgba(0,255,130,0.14)");
      g.addColorStop(0.78, "rgba(240,184,122,0.16)");
      g.addColorStop(1, "rgba(240,184,122,0.1)");
      octx.fillStyle = g;
      octx.fillRect(0, h * 0.35, w, h * 0.65);

      octx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y0 = h * (0.28 + i * 0.08);
        octx.beginPath();
        octx.strokeStyle =
          i % 3 === 0
            ? "rgba(240,184,122,0.28)"
            : i % 3 === 1
              ? "rgba(180,166,255,0.2)"
              : "rgba(0,255,130,0.3)";
        for (let x = 0; x <= w; x += 28) {
          const y =
            y0 +
            Math.sin(x * 0.008 + i) * (5 + i) +
            Math.sin(x * 0.02 + i * 2) * 2.5;
          if (x === 0) octx.moveTo(x, y);
          else octx.lineTo(x, y);
        }
        octx.stroke();
      }

      const { staticDots } = poolRef.current;
      for (let i = 0; i < staticDots.length; i++) {
        const d = staticDots[i]!;
        octx.beginPath();
        octx.fillStyle = d.c;
        octx.globalAlpha = Math.min(1, d.a);
        octx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        octx.fill();
      }
      octx.globalAlpha = 1;
      staticRef.current = off;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      poolRef.current = buildNetDots(rect.width, rect.height);
      paintStatic(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (!activeRef.current && lastDraw > 0) return;
      if (t - lastDraw < FRAME_MS) return;
      lastDraw = t;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const off = staticRef.current;
      if (off) ctx.drawImage(off, 0, 0, w, h);

      const { liveDots } = poolRef.current;
      for (let i = 0; i < liveDots.length; i++) {
        const d = liveDots[i]!;
        const pulse =
          reduced || !activeRef.current
            ? 1
            : 0.72 + 0.28 * Math.sin(t * 0.0018 * d.speed + d.phase);
        ctx.beginPath();
        ctx.fillStyle = d.c;
        ctx.globalAlpha = Math.min(1, d.a * pulse);
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const L of landingsRef.current) {
        const lx = (L.x / 100) * w;
        ctx.strokeStyle = L.color;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.quadraticCurveTo((lx + w * 0.7) / 2, h * 0.4, w * 0.7, h * 0.42);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = L.color;
        ctx.globalAlpha = 0.85;
        ctx.arc(w * 0.7, h * 0.42, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return (
    <div className="rx-net" aria-hidden="true">
      <canvas ref={canvasRef} className="rx-net-canvas" />
    </div>
  );
}

export function ValueOnRadr({
  value,
  flash,
  lastCapture,
}: {
  value: number;
  flash: boolean;
  lastCapture: number | null;
}) {
  const display = useMotionValue(value);
  const [text, setText] = useState(() =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value),
  );

  useEffect(() => {
    const fmt = new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });
    let last = 0;
    const from = display.get();
    const controls = animate(from, value, {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        display.set(v);
        const now = performance.now();
        if (now - last < 40 && v !== value) return;
        last = now;
        setText(fmt.format(v));
      },
      onComplete: () => setText(fmt.format(value)),
    });
    return () => controls.stop();
  }, [value, display]);

  const capture =
    lastCapture != null ? lastCapture.toLocaleString("en-IE") : "332";

  return (
    <div className="rx-value" data-flash={flash ? "true" : "false"}>
      <div className="rx-value-aura" aria-hidden="true" />
      <p className="rx-value-kicker">
        <span className="rx-value-kicker-label">Value on</span>
        <RadrWordmark variant="luminous" size="md" className="rx-value-wm" />
      </p>
      <p className="rx-value-main">
        <span className="rx-value-main-num">{text}</span>
      </p>
      <p className="rx-value-badge" data-flash={flash ? "true" : "false"}>
        <span className="rx-value-badge-mark" aria-hidden="true">
          <RadrDeltaGlyph />
        </span>
        <span className="rx-value-badge-amt">€{capture}</span>
      </p>
      <p className="rx-value-sub">
        <span>€684k identified</span>
        <TextSep />
        <span>€58.9k verified</span>
      </p>
    </div>
  );
}
