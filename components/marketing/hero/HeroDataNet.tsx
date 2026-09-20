"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const GREEN = "rgba(0,245,122,";
const AMBER = "rgba(255,181,27,";
const VIO = "rgba(178,108,255,";

type PathSpec = { d: string; c: string; w: number; o: number };

/** Fewer paths - static fabric, not a particle storm. */
function paths(): PathSpec[] {
  const ox = 1104;
  const oy = 36;
  const out: PathSpec[] = [];

  const greens = [
    `M 40 180 C 280 160, 640 90, ${ox} ${oy + 8}`,
    `M 160 200 C 420 140, 780 70, ${ox} ${oy + 16}`,
    `M 480 200 C 700 120, 980 60, ${ox} ${oy + 4}`,
    `M 20 100 C 200 130, 500 90, ${ox - 80} ${oy + 40}`,
    `M 0 190 C 180 200, 400 160, 720 120`,
    `M 500 240 C 800 180, 1100 90, ${ox} ${oy + 12}`,
  ];
  greens.forEach((d, i) =>
    out.push({
      d,
      c: `${GREEN}${i % 3 === 0 ? 0.45 : 0.26})`,
      w: i % 4 === 0 ? 1.5 : 1.0,
      o: 1,
    }),
  );

  out.push({
    d: `M 1480 190 C 1320 140, 1180 80, ${ox + 40} ${oy + 10}`,
    c: `${AMBER}0.28)`,
    w: 1.05,
    o: 1,
  });
  out.push({
    d: `M 1540 200 C 1280 150, 1080 90, ${ox - 30} ${oy + 18}`,
    c: `${VIO}0.26)`,
    w: 1.0,
    o: 1,
  });

  return out;
}

const PATHS = paths();

const STATIC_DOTS = Array.from({ length: 22 }, (_, i) => {
  const u = (i * 0.137) % 1;
  const v = (i * 0.271) % 1;
  return {
    x: 40 + u * 1520,
    y: 40 + v * v * 180,
    r: i % 11 === 0 ? 1.6 : 0.85,
    c:
      i % 7 === 0
        ? `${AMBER}0.4)`
        : i % 5 === 0
          ? `${VIO}0.35)`
          : `${GREEN}0.35)`,
  };
});

const RIDERS = [
  { i: 0, dur: 11, delay: 0 },
  { i: 2, dur: 13, delay: 3.5 },
];

export type HeroDataNetHandle = {
  setPaused: (paused: boolean) => void;
};

type Props = {
  reduced?: boolean;
};

/**
 * Quiet catchment fabric: static density + 2 slow riders.
 * Pause/resume is imperative so scroll IO never re-renders this tree.
 */
const HeroDataNetImpl = forwardRef<HeroDataNetHandle, Props>(
  function HeroDataNetImpl({ reduced = false }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const pausedRef = useRef(false);

    const applyPause = (paused: boolean) => {
      pausedRef.current = paused;
      const svg = svgRef.current;
      if (!svg) return;
      if (paused || reduced) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };

    useImperativeHandle(ref, () => ({ setPaused: applyPause }), [reduced]);

    useEffect(() => {
      applyPause(pausedRef.current);
    }, [reduced]);

    return (
      <div className="rx-net" aria-hidden="true">
        <svg
          ref={svgRef}
          className="rx-net-svg"
          viewBox="0 0 1600 240"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="rx-net-dots"
              x="0"
              y="0"
              width="1600"
              height="240"
              patternUnits="userSpaceOnUse"
            >
              {STATIC_DOTS.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} />
              ))}
            </pattern>
          </defs>
          {PATHS.map((p, i) => (
            <path
              key={i}
              id={`rx-net-p${i}`}
              d={p.d}
              fill="none"
              stroke={p.c}
              strokeWidth={p.w}
              opacity={p.o}
            />
          ))}
          <rect
            width="1600"
            height="240"
            fill="url(#rx-net-dots)"
            pointerEvents="none"
          />
          {!reduced
            ? RIDERS.map((r, k) => (
                <circle
                  key={`r${k}`}
                  r={k === 0 ? 2.2 : 1.6}
                  fill={`${GREEN}0.8)`}
                >
                  <animateMotion
                    dur={`${r.dur}s`}
                    begin={`${r.delay}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath href={`#rx-net-p${r.i}`} />
                  </animateMotion>
                </circle>
              ))
            : null}
        </svg>
      </div>
    );
  },
);

export const HeroDataNet = memo(HeroDataNetImpl);
