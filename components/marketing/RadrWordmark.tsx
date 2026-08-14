"use client";

import { useId } from "react";

type Props = {
  className?: string;
  animate?: boolean;
  size?: "nav" | "md" | "lg" | "hero" | "footer";
  as?: "span" | "p" | "div";
};

/**
 * Canonical R△DR — ONE SVG, shared baseline / cap height.
 *
 * Cap top y=8.2 · baseline y=36 · cap height 27.8
 * △ path is inset for stroke so optical outer edges match letter extents.
 * Kerning: R→△ breath · △→D tighter · D→R normal.
 */
export function RadrWordmark({
  className = "",
  animate = false,
  size = "md",
  as: Tag = "span",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const live = animate && size !== "nav" && size !== "footer";
  const gradId = `rx-wm-${uid}`;

  return (
    <Tag
      className={`rx-mark rx-mark--${size} ${className}`.trim()}
      aria-label="RADR"
      data-animate={live ? "true" : "false"}
    >
      <svg
        className="rx-mark-svg"
        viewBox="0 0 152 44"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <title>RADR</title>
        {live ? (
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A8F4A" />
              <stop offset="35%" stopColor="#00F56A" />
              <stop offset="55%" stopColor="#B8FFE0" />
              <stop offset="78%" stopColor="#22F87A" />
              <stop offset="100%" stopColor="#0A8F4A" />
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                from="0 52.5 22"
                to="360 52.5 22"
                dur="5s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>
        ) : null}

        {/* R — cap 8.2 → baseline 36 */}
        <path
          className="rx-mark-glyph"
          d="M8 36 V8.2 H22.4 C28.9 8.2 33.2 11.6 33.2 17.6 C33.2 22.4 30.5 25.7 25.8 26.7 L34.6 36 H28.1 L20.1 26.9 H14.2 V36 H8 Z M14.2 21.6 H22.1 C25.5 21.6 27.2 20 27.2 17.6 C27.2 15.1 25.5 13.5 22.1 13.5 H14.2 V21.6 Z"
        />

        {/*
          △ as A: stroke 4.9 inset so outer tip≈8.2 and outer base≈36.
          Width ~ optical A. Center 52.5. Breathing after R, tighter before D.
        */}
        <path
          className="rx-mark-delta"
          d="M52.5 10.55 L62.4 33.45 H42.6 Z"
          fill="none"
          stroke={live ? `url(#${gradId})` : "currentColor"}
          strokeWidth="4.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* D — same cap / baseline */}
        <path
          className="rx-mark-glyph"
          d="M70 8.2 H85.2 C95.6 8.2 102.4 14.4 102.4 22.1 C102.4 29.8 95.6 36 85.2 36 H70 V8.2 Z M76.2 13.6 V30.6 H84.6 C91.2 30.6 95.8 27.2 95.8 22.1 C95.8 17 91.2 13.6 84.6 13.6 H76.2 Z"
        />

        {/* R */}
        <path
          className="rx-mark-glyph"
          d="M112 36 V8.2 H126.4 C132.9 8.2 137.2 11.6 137.2 17.6 C137.2 22.4 134.5 25.7 129.8 26.7 L138.6 36 H132.1 L124.1 26.9 H118.2 V36 H112 Z M118.2 21.6 H126.1 C129.5 21.6 131.2 20 131.2 17.6 C131.2 15.1 129.5 13.5 126.1 13.5 H118.2 V21.6 Z"
        />
      </svg>
    </Tag>
  );
}

export function RadrLogo(props: Props) {
  return <RadrWordmark {...props} />;
}

export { RadrWordmark as BrandMark };
