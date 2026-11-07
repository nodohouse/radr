"use client";

import { useEffect, useId, useRef } from "react";
import "./value-capture-field.css";

// Decorative exposure examples. No running total or verified-savings claim.
const SIGNALS = [
  {
    amount: "$184",
    x: 12,
    catchY: 448,
    delay: -0.8,
    duration: 7.8,
    anchor: "start",
  },
  {
    amount: "$620",
    x: 250,
    catchY: 492,
    delay: -4.8,
    duration: 8.4,
    anchor: "middle",
  },
  {
    amount: "$280",
    x: 470,
    catchY: 520,
    delay: -2.9,
    duration: 8.1,
    anchor: "middle",
  },
  {
    amount: "$168",
    x: 740,
    catchY: 510,
    delay: -6.2,
    duration: 8.8,
    anchor: "middle",
  },
  {
    amount: "$350",
    x: 950,
    catchY: 474,
    delay: -3.8,
    duration: 7.6,
    anchor: "middle",
  },
  {
    amount: "$420",
    x: 1188,
    catchY: 438,
    delay: -1.9,
    duration: 8.2,
    anchor: "end",
  },
] as const;

// Align every color change and pulse to its own path's interception point.
function captureFraction(x: number, y: number) {
  let previous = { x, y };
  let curveLength = 0;
  const controlX = x < 600 ? 350 : 850;
  for (let i = 1; i <= 64; i++) {
    const t = i / 64,
      u = 1 - t;
    const point = {
      x:
        u * u * u * x +
        3 * u * u * t * x +
        3 * u * t * t * controlX +
        t * t * t * 615,
      y:
        u * u * u * y +
        3 * u * u * t * (y + 80) +
        3 * u * t * t * 595 +
        t * t * t * 555,
    };
    curveLength += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return ((y + 55) / (y + 55 + curveLength)).toFixed(6);
}

/** An ambient metaphor: exposure is intercepted and brought into the decision view. */
export function ValueCaptureField({
  moving,
  reduced,
}: {
  moving: boolean;
  reduced: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    const node = field.current;
    if (!node) return;
    const measure = () => {
      const scale = 1200 / Math.max(1, node.clientWidth);
      const mobile = window.matchMedia("(max-width:720px)").matches;
      node.style.setProperty(
        "--rvc-amount-size",
        `${(mobile ? 18 : 24) * scale}px`,
      );
      node.style.setProperty(
        "--rvc-state-size",
        `${(mobile ? 7 : 8) * scale}px`,
      );
      node.style.setProperty("--rvc-state-one", `${18 * scale}px`);
      node.style.setProperty("--rvc-state-two", `${30 * scale}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = svg.current;
    if (!node) return;
    if (moving && !reduced) node.unpauseAnimations();
    else node.pauseAnimations();
  }, [moving, reduced]);
  return (
    <div
      ref={field}
      className="rvc-field"
      aria-hidden="true"
      data-running={moving && !reduced}
      data-reduced={reduced}
    >
      <svg
        ref={svg}
        viewBox="0 0 1200 720"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#63aaff" stopOpacity=".05" />
            <stop offset=".3" stopColor="#64caff" stopOpacity=".38" />
            <stop offset=".72" stopColor="#00f59a" stopOpacity=".7" />
            <stop offset="1" stopColor="#00f59a" stopOpacity=".08" />
          </linearGradient>
          <radialGradient id={`${id}-aura`}>
            <stop stopColor="#00edaa" stopOpacity=".17" />
            <stop offset="1" stopColor="#00edaa" stopOpacity="0" />
          </radialGradient>
          <filter
            id={`${id}-glow`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <ellipse
          cx="615"
          cy="550"
          rx="545"
          ry="120"
          fill={`url(#${id}-aura)`}
        />
        <g className="rvc-rings" fill="none" stroke={`url(#${id}-rim)`}>
          <path d="M12 448 C220 800 980 800 1188 438" strokeWidth="1.25" />
          <path
            d="M65 475 C280 730 920 730 1135 475"
            strokeWidth=".65"
            opacity=".5"
          />
          <path
            d="M12 448 C220 800 980 800 1188 438"
            stroke="#00f59a"
            strokeWidth="2"
            strokeDasharray="90 1800"
            opacity=".65"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="1900;0"
              dur="7.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>
        <g className="rvc-signals">
          {SIGNALS.map((signal, index) => {
            const timing = {
              dur: `${signal.duration}s`,
              begin: `${signal.delay}s`,
              repeatCount: "indefinite",
            };
            const path = `M ${signal.x} -55 L ${signal.x} ${signal.catchY} C ${signal.x} ${signal.catchY + 80} ${signal.x < 600 ? 350 : 850} 595 615 555`;
            return (
              <g
                key={signal.amount}
                className={`rvc-signal rvc-signal-${index}`}
              >
                <g>
                  <animateMotion
                    {...timing}
                    path={path}
                    rotate="0"
                    keyPoints={`0;${captureFraction(signal.x, signal.catchY)};1`}
                    keyTimes="0;.64;1"
                    calcMode="spline"
                    keySplines=".42 0 .7 1;.16 .7 .25 1"
                  />
                  <g className="rvc-value" fill="#b9dcff">
                    <animate
                      {...timing}
                      attributeName="opacity"
                      values="0;.65;.65;1;0;0"
                      keyTimes="0;.1;.56;.65;.86;1"
                    />
                    <animate
                      {...timing}
                      attributeName="fill"
                      values="#b9dcff;#b9dcff;#00f59a;#00f59a"
                      keyTimes="0;.56;.64;1"
                    />
                    <text textAnchor={signal.anchor} className="rvc-amount">
                      {signal.amount}
                    </text>
                    <text textAnchor={signal.anchor} className="rvc-state">
                      EXPOSED
                      <animate
                        {...timing}
                        attributeName="opacity"
                        values="1;1;0;0"
                        keyTimes="0;.56;.64;1"
                      />
                    </text>
                    <text
                      textAnchor={signal.anchor}
                      className="rvc-state"
                      opacity="0"
                    >
                      IN VIEW
                      <animate
                        {...timing}
                        attributeName="opacity"
                        values="0;0;1;1"
                        keyTimes="0;.56;.64;1"
                      />
                    </text>
                    <text
                      textAnchor={signal.anchor}
                      className="rvc-state rvc-horizon"
                    >
                      TONIGHT
                    </text>
                  </g>
                  <circle cy="-12" r="3" fill="#00f59a">
                    <animate
                      {...timing}
                      attributeName="opacity"
                      values="0;0;1;1;0"
                      keyTimes="0;.57;.65;.9;1"
                    />
                  </circle>
                </g>
                <circle
                  cx={signal.x}
                  cy={signal.catchY}
                  r="8"
                  fill="none"
                  stroke="#00f59a"
                  strokeWidth="1.2"
                  opacity="0"
                >
                  <animate
                    {...timing}
                    attributeName="opacity"
                    values="0;0;.65;0;0"
                    keyTimes="0;.55;.64;.85;1"
                  />
                  <animate
                    {...timing}
                    attributeName="r"
                    values="6;6;20;36;36"
                    keyTimes="0;.55;.64;.85;1"
                  />
                </circle>
                <circle
                  cx={signal.x}
                  cy={signal.catchY}
                  r="10"
                  fill="#00f59a"
                  opacity="0"
                  filter={`url(#${id}-glow)`}
                >
                  <animate
                    {...timing}
                    attributeName="opacity"
                    values="0;0;.25;0;0"
                    keyTimes="0;.55;.64;.8;1"
                  />
                </circle>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
