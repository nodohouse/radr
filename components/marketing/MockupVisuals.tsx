import { IntelligenceFlow } from "./IntelligenceFlow";
import Image from "next/image";
import { MotionScene } from "./MotionScene";
export function Glyph({
  name = "spark",
  size = 22,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    pos: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <circle cx="12" cy="13" r="3" />
        <path d="M7 5V3h4v2m5 4h2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3" />
      </>
    ),
    hotel: (
      <>
        <path d="M3 20V6h18v14M3 15h18M7 15v-5h10v5M7 20v-2m10 2v-2" />
      </>
    ),
    restaurant: (
      <>
        <path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M17 3c-3 4-3 8 0 9h2V3h-2Zm0 9v9" />
      </>
    ),
    group: (
      <>
        <path d="M4 21V8h7v13M11 21V3h7v18M2 21h20M7 11v1m0 3v1m7-10v1m0 3v1m0 3v1" />
      </>
    ),
    data: (
      <>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v13c0 4 14 4 14 0V5M5 10c0 4 14 4 14 0M5 14c0 4 14 4 14 0" />
      </>
    ),
    labor: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M19 14a5 5 0 0 1 3 5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20v-5m5 5V9m5 11V5m5 15V2" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10M7 4l10 6" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    heart: <path d="m12 21-8-8C-3 5 7-1 12 6c5-7 15-1 8 7l-8 8Z" />,
    gear: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="m9 3 1-2h4l1 2 3 2h3v4l2 2v3l-2 1v4l-4 1-2 2h-4l-1-2-4-1v-4l-2-1v-3l2-2V5h3Z" />
      </>
    ),
    document: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.spark}
    </svg>
  );
}
export function Sparkline({ blue = false }: { blue?: boolean }) {
  return (
    <svg className="mx-sparkline" viewBox="0 0 100 35" aria-hidden="true">
      {[13, 9, 17, 12, 21, 18, 25, 22, 31, 27, 34, 30].map((h, i) => (
        <rect
          key={i}
          x={i * 8}
          y={35 - h}
          width="4"
          height={h}
          rx="1"
          fill={blue ? "#48a8ce" : "#39bd98"}
        />
      ))}
    </svg>
  );
}
export function PerformanceChart() {
  return (
    <svg
      className="mx-performance-chart"
      viewBox="0 0 420 160"
      role="img"
      aria-label="Illustrative revenue, labor and guest experience trends"
    >
      <defs>
        <linearGradient id="mx-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#50c9aa" stopOpacity=".25" />
          <stop offset="1" stopColor="#50c9aa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 65, 100, 135].map((y) => (
        <path key={y} d={`M0 ${y}H420`} stroke="#cfdfd5" strokeWidth=".5" />
      ))}
      <path
        d="M0 100C55 150 80 45 140 80S200 130 260 70 340 110 420 45V160H0Z"
        fill="url(#mx-chart-fill)"
      />
      <path
        d="M0 100C55 150 80 45 140 80S200 130 260 70 340 110 420 45"
        fill="none"
        stroke="#37ba94"
        strokeWidth="2"
      />
      <path
        d="M0 60C65 110 75 5 140 50S205 95 270 40 340 80 420 30"
        fill="none"
        stroke="#59abd1"
        strokeWidth="1.5"
      />
      <path
        d="M0 110C80 85 100 135 160 110S240 60 310 90 380 125 420 95"
        fill="none"
        stroke="#d3bb7d"
        strokeWidth="1.5"
      />
    </svg>
  );
}
export function PortfolioPreview({
  solutions = false,
}: {
  solutions?: boolean;
}) {
  return (
    <div className="mx-device">
      <div className="mx-preview">
        <aside>
          <Image
            src="/brand/radr-wordmark-clean-monochrome-black.svg"
            width={92}
            height={22}
            alt="RADR"
          />
          {[
            "Overview",
            "Live",
            "Operations",
            "Intelligence",
            "Value",
            "Reports",
            "Data Health",
          ].map((s, i) => (
            <div className={i === 0 ? "active" : ""} key={s}>
              <Glyph name={i === 0 ? "check" : "document"} size={12} />
              {s}
            </div>
          ))}
        </aside>
        <div className="mx-preview-main">
          <div className="mx-preview-top">
            <span>⌕ &nbsp; Search anything...</span>
            <small>Group view ⌄</small>
            <b>A</b>
          </div>
          <h2>{solutions ? "Good evening, Alex." : "Good morning, Alex."}</h2>
          <p>Here’s what’s happening across your portfolio today.</p>
          <div className="mx-preview-metrics">
            {(solutions
              ? [
                  ["28.4%", "Labor cost"],
                  ["$18K", "Revenue opportunity"],
                  ["4.6", "Guest sentiment"],
                ]
              : [
                  ["27", "Locations"],
                  ["$124K", "Revenue opportunity"],
                  ["94%", "Operating state"],
                  ["3", "Action items"],
                ]
            ).map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
                <Sparkline />
              </div>
            ))}
          </div>
          {solutions ? (
            <div className="mx-preview-signals">
              <h3>Signals to review</h3>
              {[
                "Menu mix shift detected",
                "Labor overage risk",
                "Supplier price variance",
              ].map((s, i) => (
                <div key={s}>
                  <Glyph name={["restaurant", "labor", "box"][i]} size={17} />
                  <span>
                    {s}
                    <small>Illustrative signal · requires review</small>
                  </span>
                  <i>{["Pricing", "Labor", "Procurement"][i]}</i>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-preview-chart">
              <div>
                <h3>Operating performance</h3>
                <p>
                  Revenue &nbsp; · &nbsp; Labor &nbsp; · &nbsp; Guest experience
                </p>
                <PerformanceChart />
                <small>Mon　 Tue　 Wed　 Thu　 Fri　 Sat　 Sun</small>
              </div>
              <div>
                <h3>Top opportunities</h3>
                {[
                  "Labor optimization",
                  "Menu performance",
                  "Supply cost variance",
                  "Guest experience",
                ].map((s) => (
                  <p key={s}>
                    <Glyph name="check" size={12} />
                    {s}
                  </p>
                ))}
              </div>
            </div>
          )}
          <span className="mx-example-note">
            ILLUSTRATIVE PRODUCT PREVIEW · NOT LIVE OPERATING DATA
          </span>
        </div>
      </div>
    </div>
  );
}
export function DataFoundation() {
  return <IntelligenceFlow />;
}

/** Small native dashboards echo the role-specific views in the approved Platform reference. */
export function RolePreview({ role }: { role: string }) {
  const finance = role === "Finance";
  const procurement = role === "Procurement";
  const leadership = role === "Leadership";
  return (
    <div
      className="mx-role-preview"
      aria-label={`${role} illustrative product view`}
    >
      <div className="mx-role-mini-nav">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="mx-role-mini-body">
        <span>
          {leadership
            ? "Portfolio overview"
            : finance
              ? "Financial overview"
              : procurement
                ? "Supplier performance"
                : role === "Labor"
                  ? "Workforce performance"
                  : "Operating overview"}
        </span>
        <div className="mx-role-mini-metrics">
          <b>
            {finance
              ? "$124K"
              : procurement
                ? "12"
                : role === "Labor"
                  ? "28.4%"
                  : "94%"}
            <small>
              {finance
                ? "Revenue"
                : procurement
                  ? "Suppliers"
                  : role === "Labor"
                    ? "Labor cost"
                    : "Operating state"}
            </small>
          </b>
          <b>
            +8%<small>Illustrative trend</small>
          </b>
        </div>
        {procurement ? (
          <div className="mx-role-mini-rows">
            {[
              "Supply cost variance",
              "Invoice reconciliation",
              "Contract comparison",
            ].map((x) => (
              <span key={x}>
                {x}
                <i />
              </span>
            ))}
          </div>
        ) : (
          <PerformanceChart />
        )}
        <small className="mx-role-mini-caption">Illustrative interface</small>
      </div>
    </div>
  );
}
