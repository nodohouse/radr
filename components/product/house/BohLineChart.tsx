"use client";

/** Multi-series prep load chart — capacity / tuna line / forecast short. */

type Props = {
  shortLabel?: string;
};

export function BohLineChart({ shortLabel = "7 short" }: Props) {
  // ViewBox 0 0 320 140 — time 16:00–22:00
  const tuna = "12,88 58,78 104,62 150,48 196,38 242,52 288,70";
  const capacity = "12,55 58,55 104,55 150,55 196,55 242,55 288,55";
  const forecast = "196,38 220,44 242,58 265,72 288,86";

  return (
    <div className="boh-linechart">
      <div className="boh-linechart-legend">
        <span>
          <i className="is-tuna" /> Tuna · cold line
        </span>
        <span>
          <i className="is-cap" /> Capacity
        </span>
        <span>
          <i className="is-fc" /> Forecast load
        </span>
      </div>
      <svg viewBox="0 0 320 140" role="img" aria-label="Line load forecast with 7 short at peak">
        <defs>
          <linearGradient id="bohShortFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,83,74,0.22)" />
            <stop offset="100%" stopColor="rgba(212,83,74,0.02)" />
          </linearGradient>
        </defs>
        {/* grid */}
        {[30, 55, 80, 105].map((y) => (
          <line key={y} x1="12" y1={y} x2="300" y2={y} stroke="rgba(10,13,11,0.06)" />
        ))}
        {/* short zone */}
        <path
          d="M196,38 L220,44 L242,58 L265,72 L288,86 L288,105 L196,105 Z"
          fill="url(#bohShortFill)"
        />
        {/* capacity dashed */}
        <polyline
          points={capacity}
          fill="none"
          stroke="rgba(10,13,11,0.28)"
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        {/* tuna actual */}
        <polyline
          points={tuna}
          fill="none"
          stroke="#00a85a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* forecast after peak */}
        <polyline
          points={forecast}
          fill="none"
          stroke="#d4534a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 2"
        />
        {/* peak marker 20:15 ≈ x=210 */}
        <line x1="210" y1="22" x2="210" y2="110" stroke="#d4534a" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="210" cy="40" r="4" fill="#d4534a" />
        <g transform="translate(218, 18)">
          <rect x="0" y="0" width="58" height="20" rx="6" fill="#d4534a" />
          <text x="29" y="14" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
            {shortLabel}
          </text>
        </g>
        {/* x labels */}
        {["16:00", "18:00", "20:00", "22:00"].map((t, i) => (
          <text
            key={t}
            x={12 + i * 92}
            y="128"
            fill="#8a928d"
            fontSize="9"
            fontWeight="600"
          >
            {t}
          </text>
        ))}
      </svg>
    </div>
  );
}
