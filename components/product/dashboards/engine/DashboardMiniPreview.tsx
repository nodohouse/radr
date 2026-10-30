"use client";

import type { PreviewKind } from "@/lib/radr/product/dashboardsProofEngine";

type Props = {
  kind: PreviewKind;
  size?: "hero" | "card" | "thumb";
};

export function DashboardMiniPreview({ kind, size = "card" }: Props) {
  return (
    <div
      className="db-preview"
      data-size={size}
      data-kind={kind}
      aria-hidden
    >
      {kind === "gm" ? <GmPreview /> : null}
      {kind === "coo" ? <CooPreview /> : null}
      {kind === "cfo" ? <CfoPreview /> : null}
      {kind === "friday" ? <FridayPreview /> : null}
      {kind === "live" ? <LivePreview /> : null}
      {kind === "chef" ? <ChefPreview /> : null}
      {kind === "generic" ? <GenericPreview /> : null}
      {kind === "hotel-gm" ? <HotelGmPreview /> : null}
      {kind === "hotel-cfo" ? <HotelCfoPreview /> : null}
      {kind === "hotel-revenue" ? <HotelRevenuePreview /> : null}
      {kind === "hotel-ops" ? <HotelOpsPreview /> : null}
      {kind === "hotel-fo" ? <HotelFrontOfficePreview /> : null}
      {kind === "hotel-hk" ? <HotelHkPreview /> : null}
      {kind === "hotel-brief" ? <HotelBriefPreview /> : null}
      {kind === "hotel-portfolio" ? <HotelPortfolioPreview /> : null}
    </div>
  );
}

function GmPreview() {
  return (
    <div className="db-pv-grid" data-layout="gm">
      <div className="db-pv-tile">
        <span>Total revenue</span>
        <strong>€12,480</strong>
        <em>+12%</em>
        <svg viewBox="0 0 80 28" className="db-pv-bars">
          {[10, 14, 11, 18, 15, 22, 19].map((h, i) => (
            <rect
              key={i}
              x={4 + i * 11}
              y={28 - h}
              width={7}
              height={h}
              rx={1.5}
              fill="currentColor"
              opacity={0.35 + i * 0.08}
            />
          ))}
        </svg>
      </div>
      <div className="db-pv-tile db-pv-gauge">
        <span>Service pace</span>
        <svg viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(10,13,11,0.08)" strokeWidth="5" />
          <circle
            cx="28"
            cy="28"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={`${0.78 * 125.6} 125.6`}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
          <text x="28" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            78%
          </text>
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>Occupancy</span>
        <strong>92%</strong>
        <svg viewBox="0 0 80 28" className="db-pv-line">
          <path
            d="M2 22 C14 20, 20 14, 32 12 S52 8, 78 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="db-pv-tile db-pv-list">
        <span>Top items</span>
        {[
          ["Steak Frites", 86],
          ["Truffle Pasta", 72],
          ["Sea Bass", 58],
        ].map(([label, w]) => (
          <div key={String(label)} className="db-pv-hbar">
            <i style={{ width: `${w}%` }} />
            <em>{label}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function CooPreview() {
  return (
    <div className="db-pv-grid" data-layout="coo">
      <div className="db-pv-tile wide">
        <span>Portfolio exposure</span>
        <strong>€184k</strong>
        <svg viewBox="0 0 120 36" className="db-pv-bars">
          {[18, 12, 24, 10, 20, 16, 28, 14].map((h, i) => (
            <rect
              key={i}
              x={4 + i * 14}
              y={36 - h}
              width={9}
              height={h}
              rx={2}
              fill="currentColor"
              opacity={i === 6 ? 0.9 : 0.35}
            />
          ))}
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>MTD pace</span>
        <strong>+6.2%</strong>
      </div>
      <div className="db-pv-tile">
        <span>Exceptions</span>
        <strong>4</strong>
      </div>
    </div>
  );
}

function CfoPreview() {
  return (
    <div className="db-pv-grid" data-layout="cfo">
      <div className="db-pv-tile">
        <span>Verified Value</span>
        <strong>€612k</strong>
        <em>+42%</em>
      </div>
      <div className="db-pv-tile">
        <span>Contribution</span>
        <svg viewBox="0 0 80 36" className="db-pv-line">
          <path
            d="M2 28 L18 22 L34 24 L50 14 L66 16 L78 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="db-pv-tile wide">
        <span>Settlement bridge</span>
        <svg viewBox="0 0 120 36" className="db-pv-bars">
          {[20, 14, -8, 18, 12].map((h, i) => (
            <rect
              key={i}
              x={10 + i * 22}
              y={h > 0 ? 30 - h : 30}
              width={14}
              height={Math.abs(h)}
              rx={2}
              fill="currentColor"
              opacity={h < 0 ? 0.35 : 0.7}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function FridayPreview() {
  return (
    <div className="db-pv-grid" data-layout="friday">
      <div className="db-pv-tile">
        <span>Covers</span>
        <strong>184</strong>
        <em>tonight</em>
      </div>
      <div className="db-pv-tile">
        <span>Kitchen</span>
        <strong>92%</strong>
      </div>
      <div className="db-pv-tile wide">
        <span>Reservation wave</span>
        <svg viewBox="0 0 120 32" className="db-pv-bars">
          {[6, 10, 14, 22, 28, 24, 16, 10].map((h, i) => (
            <rect
              key={i}
              x={6 + i * 14}
              y={32 - h}
              width={10}
              height={h}
              rx={2}
              fill="currentColor"
              opacity={0.3 + i * 0.07}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function LivePreview() {
  return (
    <div className="db-pv-grid" data-layout="live">
      <div className="db-pv-tile wide">
        <span className="db-pv-live">Live</span>
        <strong>€4,280</strong>
        <span>tonight · 19:48</span>
        <svg viewBox="0 0 120 28" className="db-pv-line">
          <path
            d="M2 20 C20 18, 30 10, 48 12 S78 6, 118 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>Turns</span>
        <strong>1.4×</strong>
      </div>
      <div className="db-pv-tile">
        <span>Wait</span>
        <strong>12m</strong>
      </div>
    </div>
  );
}

function ChefPreview() {
  return (
    <div className="db-pv-grid" data-layout="chef">
      <div className="db-pv-tile db-pv-gauge">
        <span>Kitchen load</span>
        <svg viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(10,13,11,0.08)" strokeWidth="5" />
          <circle
            cx="28"
            cy="28"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={`${0.92 * 125.6} 125.6`}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
          <text x="28" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            92%
          </text>
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>Prep</span>
        <strong>Ready</strong>
      </div>
      <div className="db-pv-tile">
        <span>Stock risk</span>
        <strong>3</strong>
      </div>
      <div className="db-pv-tile">
        <span>Tickets</span>
        <strong>4.2m</strong>
      </div>
    </div>
  );
}

function GenericPreview() {
  return (
    <div className="db-pv-grid" data-layout="generic">
      <div className="db-pv-tile wide">
        <span>Operating view</span>
        <svg viewBox="0 0 100 28" className="db-pv-bars">
          {[12, 16, 10, 20, 14, 18].map((h, i) => (
            <rect
              key={i}
              x={6 + i * 15}
              y={28 - h}
              width={10}
              height={h}
              rx={2}
              fill="currentColor"
              opacity={0.4}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function HotelGmPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-gm">
      <div className="db-pv-tile">
        <span>Occupancy</span>
        <strong>87%</strong>
        <em>+2.1pp</em>
      </div>
      <div className="db-pv-tile">
        <span>ADR</span>
        <strong>€214</strong>
      </div>
      <div className="db-pv-tile">
        <span>RevPAR</span>
        <strong>€186</strong>
        <svg viewBox="0 0 80 22" className="db-pv-line">
          <path
            d="M2 18 C16 16, 28 12, 40 10 S64 6, 78 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="db-pv-tile db-pv-gauge">
        <span>Ready</span>
        <svg viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(10,13,11,0.08)" strokeWidth="5" />
          <circle
            cx="28"
            cy="28"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray={`${0.91 * 125.6} 125.6`}
            strokeLinecap="round"
            transform="rotate(-90 28 28)"
          />
          <text x="28" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            91%
          </text>
        </svg>
      </div>
    </div>
  );
}

function HotelCfoPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-cfo">
      <div className="db-pv-tile">
        <span>Room revenue</span>
        <strong>€428k</strong>
        <em>vs plan</em>
      </div>
      <div className="db-pv-tile">
        <span>Contribution</span>
        <strong>€186k</strong>
      </div>
      <div className="db-pv-tile wide">
        <span>Property economics</span>
        <svg viewBox="0 0 120 32" className="db-pv-bars">
          {[18, 22, 14, 26, 16, 20, 12, 24].map((h, i) => (
            <rect
              key={i}
              x={4 + i * 14}
              y={32 - h}
              width={10}
              height={h}
              rx={2}
              fill="currentColor"
              opacity={i === 3 ? 0.9 : 0.35}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function HotelRevenuePreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-revenue">
      <div className="db-pv-tile wide">
        <span>Booking pace · 30D</span>
        <svg viewBox="0 0 120 36" className="db-pv-line">
          <path
            d="M2 30 C18 28, 28 22, 42 18 S68 10, 88 12 S110 8, 118 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2 32 C20 30, 36 26, 52 24 S80 20, 118 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.35"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>Pickup</span>
        <strong>+42</strong>
      </div>
      <div className="db-pv-tile">
        <span>OTA share</span>
        <strong>34%</strong>
      </div>
    </div>
  );
}

function HotelOpsPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-ops">
      <div className="db-pv-tile">
        <span>Arrivals</span>
        <strong>46</strong>
        <em>next 2h · 18</em>
      </div>
      <div className="db-pv-tile">
        <span>Departures</span>
        <strong>38</strong>
      </div>
      <div className="db-pv-tile wide">
        <span>Property readiness</span>
        <div className="db-pv-ready-strip">
          {[
            ["Ready", 62, 0.85],
            ["Inspect", 18, 0.55],
            ["Dirty", 14, 0.35],
            ["OOO", 6, 0.2],
          ].map(([label, w, op]) => (
            <i
              key={String(label)}
              style={{ width: `${w}%`, opacity: Number(op) }}
              title={String(label)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HotelFrontOfficePreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-fo">
      <div className="db-pv-tile wide">
        <span>Arrival timeline</span>
        <svg viewBox="0 0 120 28" className="db-pv-bars">
          {[4, 6, 10, 16, 22, 18, 12, 8].map((h, i) => (
            <rect
              key={i}
              x={6 + i * 14}
              y={28 - h}
              width={10}
              height={h}
              rx={2}
              fill="currentColor"
              opacity={0.3 + i * 0.08}
            />
          ))}
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>VIP</span>
        <strong>4</strong>
      </div>
      <div className="db-pv-tile">
        <span>Queue</span>
        <strong>Busy</strong>
      </div>
    </div>
  );
}

function HotelHkPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-hk">
      <div className="db-pv-tile wide">
        <span>Room readiness grid</span>
        <div className="db-pv-room-grid">
          {["r", "r", "c", "d", "r", "i", "d", "r", "r", "o", "c", "r"].map(
            (s, i) => (
              <b key={i} data-state={s} />
            ),
          )}
        </div>
      </div>
      <div className="db-pv-tile">
        <span>To clean</span>
        <strong>28</strong>
      </div>
      <div className="db-pv-tile">
        <span>Ready</span>
        <strong>114</strong>
      </div>
    </div>
  );
}

function HotelBriefPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-brief">
      <div className="db-pv-tile">
        <span>Yesterday</span>
        <strong>+3.2%</strong>
        <em>vs plan</em>
      </div>
      <div className="db-pv-tile">
        <span>Today Occ</span>
        <strong>87%</strong>
      </div>
      <div className="db-pv-tile wide db-pv-list">
        <span>RADR priorities</span>
        {[
          ["Arrival readiness", 86],
          ["HK reassignment", 72],
          ["OTA hold", 58],
        ].map(([label, w]) => (
          <div key={String(label)} className="db-pv-hbar">
            <i style={{ width: `${w}%` }} />
            <em>{label}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotelPortfolioPreview() {
  return (
    <div className="db-pv-grid" data-layout="hotel-portfolio">
      <div className="db-pv-tile wide">
        <span>Property health</span>
        <svg viewBox="0 0 120 40" className="db-pv-bubbles">
          {[
            [22, 22, 10],
            [48, 14, 8],
            [72, 26, 12],
            [98, 16, 7],
            [58, 30, 6],
          ].map(([cx, cy, r], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              opacity={0.25 + i * 0.12}
            />
          ))}
        </svg>
      </div>
      <div className="db-pv-tile">
        <span>Exposure</span>
        <strong>€1.2k</strong>
      </div>
      <div className="db-pv-tile">
        <span>Verified</span>
        <strong>€618</strong>
      </div>
    </div>
  );
}
