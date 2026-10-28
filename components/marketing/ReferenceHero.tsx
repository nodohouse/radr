import Image from "next/image";
import Link from "next/link";
import "./reference-hero.css";
import { ReferenceNav } from "./ReferenceNav";

const brand = "/brand/radr-wordmark-clean-white.svg";
const destinations = [
  "Control Center",
  "Live",
  "Decisions",
  "Operations",
  "Intelligence",
  "Value",
  "Memory",
  "Data Health",
];

function Arrow() {
  return (
    <svg
      className="rh-arrow"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15m-5-5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dashboard() {
  return (
    <div
      className="rh-device"
      aria-label="RADR product preview with illustrative data"
    >
      <div className="rh-dashboard">
        <aside className="rh-sidebar">
          <Image
            src="/brand/radr-wordmark-clean-monochrome-black.svg"
            width={83}
            height={20}
            alt="RADR"
          />
          <div className="rh-workspace">
            WORKSPACE <span>⌄</span>
          </div>
          <div className="rh-side-items">
            {destinations.map((name, i) => (
              <div key={name} className={i === 0 ? "selected" : ""}>
                <span aria-hidden="true">
                  {["▣", "◉", "◎", "▤", "◈", "◇", "▥", "◌"][i]}
                </span>
                {name}
              </div>
            ))}
          </div>
          <div className="rh-sidebar-bottom">
            <span className="rh-status-dot" /> All systems connected
          </div>
        </aside>
        <div className="rh-main">
          <div className="rh-toolbar">
            <span className="rh-search">
              ⌕ <span>Search anything...</span>
            </span>
            <span className="rh-group">Group view ⌄</span>
            <span className="rh-avatar">A</span>
          </div>
          <div className="rh-greeting">
            <span className="rh-demo-label">ILLUSTRATIVE PRODUCT PREVIEW</span>
            <h2>Good morning, Alex.</h2>
            <p>Here’s what needs your attention today.</p>
          </div>
          <div className="rh-metrics">
            {[
              {
                value: "3",
                label: "Decisions",
                sub: "need review",
                link: "See decisions",
                icon: "●",
              },
              {
                value: "$12.4K",
                label: "Estimated opportunity",
                sub: "",
                link: "View details",
                icon: "",
              },
              {
                value: "+8%",
                label: "RevPASH lift",
                sub: "potential",
                link: "See performance",
                icon: "◈",
              },
            ].map((m) => (
              <div className="rh-metric" key={m.value}>
                <span className="rh-metric-status">{m.icon}</span>
                <strong>{m.value}</strong>
                <span>
                  {m.label}
                  <br />
                  {m.sub}
                </span>
                <small>{m.link} →</small>
              </div>
            ))}
          </div>
          <div className="rh-dashboard-bottom">
            <div className="rh-chart">
              <h3>
                Revenue opportunity <span>This week ⌄</span>
              </h3>
              <div className="rh-chart-inner">
                <svg
                  viewBox="0 0 360 155"
                  role="img"
                  aria-label="Illustrative revenue opportunity rising over the week"
                >
                  <defs>
                    <linearGradient id="rhArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#43cba3" stopOpacity=".55" />
                      <stop
                        offset="100%"
                        stopColor="#43cba3"
                        stopOpacity=".03"
                      />
                    </linearGradient>
                    <linearGradient id="rhBar" x1="0" y1="0" x2="0" y2="1">
                      <stop stopColor="#29b48b" />
                      <stop offset="1" stopColor="#c9eee0" />
                    </linearGradient>
                  </defs>
                  {[30, 65, 100, 135].map((y) => (
                    <path
                      key={y}
                      d={`M0 ${y}H325`}
                      stroke="#d7dfda"
                      strokeWidth=".7"
                    />
                  ))}
                  <path
                    d="M0 135 L30 128 L63 115 L94 118 L126 95 L157 101 L188 113 L220 102 L252 66 L283 73 L315 55 V140H0Z"
                    fill="url(#rhArea)"
                  />
                  <path
                    d="M0 135 L30 128 L63 115 L94 118 L126 95 L157 101 L188 113 L220 102 L252 66 L283 73 L315 55"
                    fill="none"
                    stroke="#49bd9b"
                    strokeWidth="2"
                  />
                  {[120, 105, 110, 90, 98, 112, 100, 68, 75, 58].map((y, i) => (
                    <rect
                      key={i}
                      x={i * 31 + 5}
                      y={y}
                      width="16"
                      height={140 - y}
                      fill="url(#rhBar)"
                    />
                  ))}
                  <g fill="#6b7973" fontSize="10">
                    <text x="335" y="34">
                      $40K
                    </text>
                    <text x="335" y="101">
                      $20K
                    </text>
                    <text x="335" y="140">
                      $0
                    </text>
                  </g>
                </svg>
                <div className="rh-days">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (x) => (
                      <span key={x}>{x}</span>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="rh-signal">
              <h3>Top signal</h3>
              <div className="rh-signal-content">
                <span className="rh-signal-icon">▤</span>
                <div>
                  <strong>
                    Overcharge pattern
                    <br />
                    detected
                  </strong>
                  <p>Across 3 locations</p>
                  <span>
                    Review recommended
                    <br />
                    action →
                  </span>
                </div>
              </div>
              <div className="rh-signal-footer">
                <span className="rh-status-dot" /> Evidence connected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReferenceHero() {
  return (
    <section className="rh-hero" id="product" aria-labelledby="rh-title">
      <div className="rh-backdrop" />
      <ReferenceNav />
      <div className="rh-copy">
        <p className="rh-eyebrow">HOSPITALITY OPERATING INTELLIGENCE</p>
        <h1 id="rh-title">
          NOTHING OFF
          <br />
          <span className="rh-last-line">
            THE{" "}
            <Image src={brand} alt="RADR" width={300} height={68} priority />
            <span className="rh-period">.</span>
          </span>
        </h1>
        <p className="rh-description">
          Turn your data into better decisions,
          <br />
          higher profits and stronger guest experiences.
        </p>
        <div className="rh-ctas">
          <Link href="/contact" className="rh-button">
            Book a demo <Arrow />
          </Link>
          <Link href="/how" className="rh-button rh-button-ghost">
            See how it works <Arrow />
          </Link>
        </div>
      </div>
      <Dashboard />
      <span className="rh-scene-note">CLARITY FOR EVERY OPERATION.</span>
    </section>
  );
}
