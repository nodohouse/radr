"use client";

import { useMemo, useState } from "react";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { hotelNeedsYouDecisions } from "@/lib/radr/demo/hotelDecisions";
import { HotelPaceCalendar } from "../MiniOperatingCalendar";

type Props = {
  onSelectDecision: (id: string) => void;
};

type DayStatus = "on-pace" | "compressed" | "soft" | "event" | "decision";

const DAYS: Array<{
  d: number;
  status: DayStatus;
  occ: number;
  adr: number;
  yoy: string;
}> = [
  { d: 1, status: "on-pace", occ: 72, adr: 268, yoy: "+4%" },
  { d: 2, status: "on-pace", occ: 74, adr: 274, yoy: "+5%" },
  { d: 3, status: "soft", occ: 61, adr: 242, yoy: "−2%" },
  { d: 4, status: "on-pace", occ: 76, adr: 286, yoy: "+8%" },
  { d: 5, status: "event", occ: 88, adr: 340, yoy: "+16%" },
  { d: 6, status: "compressed", occ: 91, adr: 318, yoy: "+11%" },
  { d: 7, status: "on-pace", occ: 79, adr: 298, yoy: "+7%" },
  { d: 8, status: "on-pace", occ: 77, adr: 292, yoy: "+6%" },
  { d: 9, status: "soft", occ: 64, adr: 248, yoy: "−1%" },
  { d: 10, status: "on-pace", occ: 80, adr: 304, yoy: "+9%" },
  { d: 11, status: "event", occ: 90, adr: 352, yoy: "+18%" },
  { d: 12, status: "decision", occ: 84, adr: 328, yoy: "+12%" },
  { d: 13, status: "compressed", occ: 93, adr: 336, yoy: "+14%" },
  { d: 14, status: "on-pace", occ: 78, adr: 300, yoy: "+7%" },
  { d: 15, status: "on-pace", occ: 75, adr: 288, yoy: "+5%" },
  { d: 16, status: "soft", occ: 58, adr: 236, yoy: "−3%" },
  { d: 17, status: "on-pace", occ: 81, adr: 310, yoy: "+10%" },
  { d: 18, status: "on-pace", occ: 83, adr: 316, yoy: "+11%" },
  { d: 19, status: "event", occ: 92, adr: 360, yoy: "+19%" },
  { d: 20, status: "decision", occ: 86, adr: 332, yoy: "+13%" },
  { d: 21, status: "on-pace", occ: 79, adr: 302, yoy: "+8%" },
  { d: 22, status: "on-pace", occ: 76, adr: 290, yoy: "+6%" },
  { d: 23, status: "soft", occ: 62, adr: 244, yoy: "−1%" },
  { d: 24, status: "on-pace", occ: 80, adr: 306, yoy: "+9%" },
  { d: 25, status: "compressed", occ: 89, adr: 324, yoy: "+12%" },
  { d: 26, status: "on-pace", occ: 77, adr: 294, yoy: "+7%" },
  { d: 27, status: "on-pace", occ: 74, adr: 280, yoy: "+4%" },
  { d: 28, status: "event", occ: 91, adr: 348, yoy: "+17%" },
  { d: 29, status: "on-pace", occ: 82, adr: 312, yoy: "+10%" },
  { d: 30, status: "on-pace", occ: 78, adr: 298, yoy: "+8%" },
];

const STATUS_LABEL: Record<DayStatus, string> = {
  "on-pace": "On pace",
  compressed: "Compressed · sell tight",
  soft: "Soft pickup",
  event: "Event demand",
  decision: "Rate decision",
};

export function VisionHotelPace({ onSelectDecision }: Props) {
  const live = canalHouseLive();
  const needs = hotelNeedsYouDecisions();
  const active = needs[0];
  const [selectedDay, setSelectedDay] = useState(12);

  const day = useMemo(
    () => DAYS.find((d) => d.d === selectedDay) ?? DAYS[11]!,
    [selectedDay],
  );

  const metrics = useMemo(
    () => [
      { label: "Occupancy", value: "78.4%", delta: "+6.2% vs LY", tone: "pos" as const },
      { label: "ADR", value: "$312", delta: "+8.1% vs LY", tone: "pos" as const },
      { label: "RevPAR", value: "$245", delta: "+14.9% vs LY", tone: "pos" as const },
      {
        label: "Arrivals today",
        value: String(live.arrivals),
        delta: live.nowNext.nextDetail,
        tone: "watch" as const,
      },
      {
        label: "Inspected ready",
        value: `${live.ready} / ${live.arrivals}`,
        delta: live.nowNext.now,
        tone: "pos" as const,
      },
      { label: "7D pickup", value: "+5.8%", delta: "+4.2 pts vs STLY", tone: "pos" as const },
      { label: "30D pickup", value: "+12.6%", delta: "+5.8 pts vs STLY", tone: "pos" as const },
      { label: "Rooms left", value: "164 / 850", delta: "Next 30 nights", tone: "neutral" as const },
    ],
    [live],
  );

  return (
    <div className="rv-cc rv-hotel-pace">
      <div className="rv-cc-main">
        <header className="rv-cc-head">
          <p className="rv-label">Hotels · Revenue &amp; readiness</p>
          <h1 className="rv-display">Arrivals · readiness pace</h1>
          <p>Inspected rooms · OTA mix · next 30 nights</p>
        </header>

        <div className="rv-metric-band">
          {metrics.map((m) => (
            <div key={m.label} className="rv-metric">
              <span className="rv-label">{m.label}</span>
              <strong className="rv-num">{m.value}</strong>
              <em data-tone={m.tone}>{m.delta}</em>
            </div>
          ))}
        </div>

        <section className="rv-panel">
          <div className="rv-panel-head">
            <h2>Pace calendar</h2>
            <p className="rv-label rv-pace-cal-note">
              Select a night · soft green = on pace · amber = rate decision
            </p>
            <ul className="rv-pace-legend" aria-label="Status legend">
              {(Object.keys(STATUS_LABEL) as DayStatus[]).map((s) => (
                <li key={s} data-status={s}>
                  {STATUS_LABEL[s]}
                </li>
              ))}
            </ul>
          </div>

          <div className="rv-pace-grid" role="grid" aria-label="October pace">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="rv-pace-dow">
                {d}
              </span>
            ))}
            {/* Oct 2024 starts Tuesday — pad Mon */}
            <span className="rv-pace-pad" />
            {DAYS.map((cell) => (
              <button
                key={cell.d}
                type="button"
                className="rv-pace-day"
                data-status={cell.status}
                data-active={selectedDay === cell.d ? "true" : undefined}
                onClick={() => {
                  setSelectedDay(cell.d);
                  if (cell.status === "decision" && active) {
                    onSelectDecision(active.id);
                  }
                }}
              >
                <strong>{cell.d}</strong>
                <em>{STATUS_LABEL[cell.status]}</em>
                <span className="rv-num">{cell.occ}%</span>
                <span>${cell.adr}</span>
                <i>{cell.yoy}</i>
              </button>
            ))}
          </div>

          <div className="rv-pace-native">
            <HotelPaceCalendar
              onDayClick={() => {
                if (active) onSelectDecision(active.id);
              }}
            />
          </div>
        </section>

        <section className="rv-panel rv-chart-box">
          <div className="rv-panel-head">
            <h2>Pace trajectory</h2>
            <p className="rv-label">Actual vs STLY · forecast range</p>
          </div>
          <svg className="rv-line" viewBox="0 0 640 160" aria-hidden>
            <defs>
              <linearGradient id="rvPaceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0,217,120,0.25)" />
                <stop offset="100%" stopColor="rgba(0,217,120,0)" />
              </linearGradient>
            </defs>
            <path
              d="M20 120 C80 110, 140 100, 200 95 S320 80, 380 70 S520 55, 620 40 L620 140 L20 140 Z"
              fill="url(#rvPaceFill)"
            />
            <path
              d="M20 125 C80 118, 140 112, 200 108 S320 100, 380 92 S520 78, 620 68"
              fill="none"
              stroke="color-mix(in srgb, var(--rv-ink) 18%, transparent)"
              strokeWidth="1.5"
              strokeDasharray="4 5"
            />
            <path
              d="M20 120 C80 110, 140 100, 200 95 S320 80, 380 70 S520 55, 620 40"
              fill="none"
              stroke="#00d978"
              strokeWidth="2.2"
            />
            <line
              x1="280"
              y1="20"
              x2="280"
              y2="140"
              stroke="color-mix(in srgb, var(--rv-ink) 14%, transparent)"
              strokeDasharray="3 4"
            />
            <text x="286" y="32" fill="var(--rv-quiet)" fontSize="10">
              Today
            </text>
          </svg>
        </section>
      </div>

      <aside className="rv-rail">
        <div className="rv-rail-block">
          <p className="rv-label">Selected day</p>
          <div className="rv-verified">
            <span className="rv-status" data-sev={day.status === "decision" ? "watch" : "healthy"}>
              <i />
              {STATUS_LABEL[day.status]}
            </span>
            <strong className="rv-num">Sat {day.d} Oct</strong>
            <em>Live {live.clockLabel}</em>
          </div>
        </div>

        <div className="rv-metric-band" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rv-metric">
            <span className="rv-label">Occupancy</span>
            <strong className="rv-num">{day.occ}%</strong>
            <em data-tone="pos">+12 pts vs STLY</em>
          </div>
          <div className="rv-metric">
            <span className="rv-label">ADR</span>
            <strong className="rv-num">${day.adr}</strong>
            <em data-tone="pos">+18% vs STLY</em>
          </div>
          <div className="rv-metric">
            <span className="rv-label">Rooms left</span>
            <strong className="rv-num">136</strong>
          </div>
          <div className="rv-metric">
            <span className="rv-label">7D pickup</span>
            <strong className="rv-num">+8.4%</strong>
          </div>
        </div>

        <div className="rv-rail-block">
          <p className="rv-label">Demand drivers</p>
          <ul className="rv-need-list">
            <li>
              <button type="button">
                <strong>NYC Fashion Week</strong>
                <span>High demand</span>
              </button>
            </li>
            <li>
              <button type="button">
                <strong>Weekend leisure</strong>
                <span>US corporate shoulder</span>
              </button>
            </li>
            <li>
              <button type="button">
                <strong>Restricted supply</strong>
                <span>Comp set compression</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="rv-rail-block">
          <p className="rv-label">OTA &amp; channel mix</p>
          <div className="rv-channel-bar" aria-hidden>
            <i style={{ flex: 0.42 }} data-ch="direct" />
            <i style={{ flex: 0.34 }} data-ch="ota" />
            <i style={{ flex: 0.14 }} data-ch="whole" />
            <i style={{ flex: 0.1 }} data-ch="other" />
          </div>
          <p className="rv-label" style={{ marginTop: "0.35rem" }}>
            Direct 42% · OTA 34% · Wholesale 14% · GDS / other 10%
          </p>
        </div>

        {active ? (
          <div className="rv-decision-card">
            <p className="rv-label">Active decision</p>
            <h3>
              Increase BAR by $24 to capture higher demand and market momentum.
            </h3>
            <p>
              Expected +$5,760 revenue · Occupancy +4.2 pts · ADR +$24
            </p>
            <div className="rv-decision-actions">
              <button
                type="button"
                className="rv-btn"
                data-primary="true"
                onClick={() => onSelectDecision(active.id)}
              >
                Review BAR adjustment
              </button>
              <button
                type="button"
                className="rv-btn"
                onClick={() => onSelectDecision(active.id)}
              >
                View Simulation
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
