"use client";

/** Multi-series demand/value convergence — Regulars · Terrace · First visit · Occasion. */

export function ValueWindowChart() {
  return (
    <div className="gi-chart">
      <div className="gi-chart-legend">
        <span>
          <i className="is-reg" /> Regulars
        </span>
        <span>
          <i className="is-ter" /> Terrace
        </span>
        <span>
          <i className="is-first" /> First visit
        </span>
        <span>
          <i className="is-occ" /> Occasion
        </span>
      </div>
      <svg viewBox="0 0 520 168" role="img" aria-label="Guest demand convergence 18:00 to 22:00">
        <defs>
          <linearGradient id="giRegFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,168,90,0.28)" />
            <stop offset="100%" stopColor="rgba(0,168,90,0.02)" />
          </linearGradient>
          <linearGradient id="giTerFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(7,83,63,0.18)" />
            <stop offset="100%" stopColor="rgba(7,83,63,0.02)" />
          </linearGradient>
          <linearGradient id="giWinFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(196,136,42,0.16)" />
            <stop offset="100%" stopColor="rgba(196,136,42,0.02)" />
          </linearGradient>
        </defs>
        {[36, 72, 108].map((y) => (
          <line key={y} x1="24" y1={y} x2="496" y2={y} stroke="rgba(10,13,11,0.06)" />
        ))}
        {/* peak window 20:10–20:40 ≈ x 292–348 */}
        <rect x="292" y="16" width="56" height="118" fill="url(#giWinFill)" />
        <line x1="292" y1="16" x2="292" y2="134" stroke="#c4882a" strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1="348" y1="16" x2="348" y2="134" stroke="#c4882a" strokeWidth="1.2" strokeDasharray="3 3" />
        <g transform="translate(268, 4)">
          <rect x="0" y="0" width="112" height="18" rx="6" fill="#1a221e" />
          <text x="56" y="12.5" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
            20:10–20:40 Peak
          </text>
        </g>
        {/* terrace area */}
        <path
          d="M24,118 C80,110 140,96 200,78 C260,58 300,42 320,38 C360,48 420,70 496,92 L496,134 L24,134 Z"
          fill="url(#giTerFill)"
        />
        {/* regulars area */}
        <path
          d="M24,104 C90,96 150,78 210,58 C270,40 300,28 320,24 C360,36 420,58 496,78 L496,134 L24,134 Z"
          fill="url(#giRegFill)"
        />
        {/* regulars line */}
        <path
          d="M24,104 C90,96 150,78 210,58 C270,40 300,28 320,24 C360,36 420,58 496,78"
          fill="none"
          stroke="#00a85a"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* terrace line */}
        <path
          d="M24,118 C80,110 140,96 200,78 C260,58 300,42 320,38 C360,48 420,70 496,92"
          fill="none"
          stroke="#07533f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* first visit */}
        <path
          d="M24,122 C100,118 180,112 260,98 C320,88 380,92 496,108"
          fill="none"
          stroke="#8a928d"
          strokeWidth="1.6"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
        {/* occasion */}
        <path
          d="M24,126 C120,120 220,100 300,70 C340,58 400,74 496,96"
          fill="none"
          stroke="#c4882a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {["18:00", "19:00", "20:00", "21:00", "22:00"].map((t, i) => (
          <text
            key={t}
            x={24 + i * 118}
            y="154"
            fill="#8a928d"
            fontSize="10"
            fontWeight="600"
          >
            {t}
          </text>
        ))}
      </svg>
    </div>
  );
}
