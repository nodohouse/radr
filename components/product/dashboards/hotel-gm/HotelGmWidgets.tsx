"use client";

/**
 * Hotel GM Dashboard widget skins — mockup SSOT presentation.
 * Data from hotelGmDashboardCanon (reconciles with CC / Live / Value).
 */

import { useMemo, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import {
  hotelGmPerformance,
  hotelGmReadiness,
  hotelGmPickup,
  hotelGmChannelMix,
  hotelGmNeedsYou,
  hotelGmVerifiedValue,
} from "@/lib/radr/product/hotelGmDashboardCanon";
import {
  morningBriefEvent,
  morningBriefReadiness,
  morningBriefVerifiedValue,
} from "@/lib/radr/product/hotelMorningBriefCanon";
import "./hotel-gm-dashboard.css";

const FAV_KEY = "radr.dash.hotelGm.fav.v1";

function useFav(id: string) {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      return Boolean(map[id]);
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        const raw = localStorage.getItem(FAV_KEY);
        const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
        map[id] = next;
        localStorage.setItem(FAV_KEY, JSON.stringify(map));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [id]);
  return { on, toggle };
}

function CardHead({
  icon,
  title,
  sub,
  openHref,
  status,
  chip,
  favId,
}: {
  icon: ReactNode;
  title: string;
  sub?: string;
  openHref: string;
  status?: string;
  chip?: string;
  favId?: string;
}) {
  const fav = useFav(favId ?? "__none__");
  const showFav = Boolean(favId);
  return (
    <div className="hgm-card-head">
      <div className="hgm-card-head-left">
        <span className="hgm-ico" aria-hidden>
          {icon}
        </span>
        <div>
          <h3>{title}</h3>
          {sub ? <p>{sub}</p> : null}
        </div>
      </div>
      <div className="hgm-card-head-right">
        {status ? (
          <span className="hgm-status">
            <i />
            {status}
          </span>
        ) : null}
        {chip ? <span className="hgm-chip">{chip}</span> : null}
        {showFav ? (
          <button
            type="button"
            className={fav.on ? "hgm-fav is-on" : "hgm-fav"}
            aria-label={fav.on ? "Unfavorite widget" : "Favorite widget"}
            aria-pressed={fav.on}
            onClick={fav.toggle}
          >
            {fav.on ? "★" : "☆"}
          </button>
        ) : null}
        <Link className="hgm-open" href={openHref}>
          Open →
        </Link>
      </div>
    </div>
  );
}

function IcoBars() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 14V9M7.5 14V5M12 14V7.5M15.5 14V3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IcoBed() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2.5 13.5V8.5a1.5 1.5 0 0 1 1.5-1.5h10a1.5 1.5 0 0 1 1.5 1.5v5M2.5 13.5h13M4.5 7V5a1 1 0 0 1 1-1h3v3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2.5 12.5 6.5 8l3 2.5L15.5 4.5M11.5 4.5h4v4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoNet() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 9h12M9 3c2 2.2 2 9.8 0 12M9 3c-2 2.2-2 9.8 0 12"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function IcoBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M10 2.5 4.5 10h4l-.5 5.5L14 7.5h-4L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoDiamond() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2.5 15.5 9 9 15.5 2.5 9 9 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2M3.2 3.2l1.4 1.4M9.4 9.4l1.4 1.4M10.8 3.2 9.4 4.6M4.6 9.4 3.2 10.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function deltaText(raw: string) {
  return raw;
}

export function HotelGmOccAdrRevpar() {
  const d = hotelGmPerformance();
  return (
    <div className="hgm-card" data-widget="hotel_occ_adr_revpar">
      <CardHead
        icon={<IcoBars />}
        title="Occ · ADR · RevPAR"
        openHref={d.openHref}
        status={d.statusLabel}
      />
      <div className="hgm-triple">
        <div>
          <span>Occupancy</span>
          <strong>{d.occupancyPct}%</strong>
          <em className="hgm-vs">{deltaText(d.occupancyDelta)}</em>
        </div>
        <div>
          <span>ADR</span>
          <strong>€{d.adrEuro}</strong>
          <em className="hgm-vs">{deltaText(d.adrDelta)}</em>
        </div>
        <div>
          <span>RevPAR</span>
          <strong>€{d.revparEuro}</strong>
          <em className="hgm-vs">{deltaText(d.revparDelta)}</em>
        </div>
      </div>
      <div className="hgm-intel">
        <IcoSpark />
        <span>{d.intel}</span>
      </div>
    </div>
  );
}

export function HotelGmRoomReadiness() {
  const d = hotelGmReadiness();
  const r = 36;
  const c = 48;
  const circ = 2 * Math.PI * r;
  const readyLen = (d.ready / d.due) * circ;
  const prepLen = (d.toPrepare / d.due) * circ;

  return (
    <div className="hgm-card" data-widget="room_readiness">
      <CardHead
        icon={<IcoBed />}
        title="Room readiness"
        openHref={d.openHref}
        favId="room_readiness"
      />
      <div className="hgm-ready-body">
        <div>
          <p className="hgm-ready-k">Ready vs arrivals</p>
          <p className="hgm-ready-num">
            {d.ready}/{d.due}
          </p>
          <p className="hgm-ready-sub">rooms ready</p>
          <p className="hgm-ready-risk">
            ⚠ {d.atRisk} of {d.toPrepare} at-risk arrivals
          </p>
        </div>
        <svg className="hgm-donut" viewBox="0 0 96 96" aria-hidden>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(10,13,11,0.06)"
            strokeWidth="10"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#cfead9"
            strokeWidth="10"
            strokeDasharray={`${prepLen} ${circ}`}
            strokeDashoffset={-readyLen}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#07533f"
            strokeWidth="10"
            strokeDasharray={`${readyLen} ${circ}`}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          />
          <text x={c} y={c - 2} textAnchor="middle" className="hgm-donut-center">
            {d.readyPct}%
          </text>
          <text x={c} y={c + 12} textAnchor="middle" className="hgm-donut-sub">
            Ready
          </text>
        </svg>
        <ul className="hgm-legend">
          <li>
            <span>
              <i style={{ background: "#07533f" }} /> Ready
            </span>
            <strong>{d.ready}</strong>
          </li>
          <li>
            <span>
              <i style={{ background: "#cfead9" }} /> To prepare
            </span>
            <strong>{d.toPrepare}</strong>
          </li>
          <li>
            <span>
              <i style={{ background: "#a8aea9" }} /> At risk
            </span>
            <strong>{d.atRisk}</strong>
          </li>
        </ul>
      </div>
      <Link className="hgm-ready-strip" href={d.openHref}>
        <span>{d.insight}</span>
        <em>›</em>
      </Link>
    </div>
  );
}

export function HotelGmPickup() {
  const d = hotelGmPickup();
  const geo = useMemo(() => {
    const w = 520;
    const h = 96;
    const padL = 8;
    const padR = 8;
    const padT = 14;
    const padB = 18;
    const pts = d.points;
    const maxD = Math.max(...pts.map((p) => p.daysBeforeArrival));
    const minD = Math.min(...pts.map((p) => p.daysBeforeArrival));
    const maxY = d.sellableRooms;
    const x = (days: number) =>
      padL + ((maxD - days) / (maxD - minD || 1)) * (w - padL - padR);
    const y = (v: number) =>
      padT + (1 - v / maxY) * (h - padT - padB);
    const line = (key: "current" | "comparable" | "forecast") =>
      pts
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${x(p.daysBeforeArrival).toFixed(1)},${y(p[key]).toFixed(1)}`,
        )
        .join(" ");
    const area =
      line("current") +
      ` L${x(minD).toFixed(1)},${(h - padB).toFixed(1)} L${x(maxD).toFixed(1)},${(h - padB).toFixed(1)} Z`;
    const markers = d.markers.map((m) => {
      const p = pts.reduce((best, cur) =>
        Math.abs(cur.daysBeforeArrival - m.daysBeforeArrival) <
        Math.abs(best.daysBeforeArrival - m.daysBeforeArrival)
          ? cur
          : best,
      );
      return {
        ...m,
        cx: x(p.daysBeforeArrival),
        cy: y(p.current),
      };
    });
    const ticks = [120, 90, 60, 30, 7, 0].filter(
      (t) => t <= maxD && t >= minD,
    );
    // Pace report is 30→0; label axis as mockup D-120…Today via mapped labels
    const axis = [
      { d: maxD, label: "D-120" },
      { d: Math.round(maxD * 0.75), label: "D-90" },
      { d: Math.round(maxD * 0.5), label: "D-60" },
      { d: Math.round(maxD * 0.25), label: "D-30" },
      { d: Math.max(2, Math.round(maxD * 0.08)), label: "D-7" },
      { d: 0, label: "Today" },
    ];
    return {
      w,
      h,
      padT,
      padB,
      line,
      area,
      markers,
      invY: y(d.sellableRooms),
      axis,
      ticks,
      x,
    };
  }, [d]);

  return (
    <div className="hgm-card" data-widget="hotel_pickup">
      <CardHead
        icon={<IcoTrend />}
        title="Pickup"
        sub={d.headline}
        openHref={d.openHref}
      />
      <div className="hgm-pickup-meta">
        <div>
          <p>{d.supporting}</p>
          <p style={{ marginTop: 2 }}>
            Booking pace · OTA &amp; direct · {d.arrivalLabel} · nights on the
            books
          </p>
        </div>
        <div className="hgm-pickup-deltas">
          <span>+{d.deltaPctVsComparable}% vs comparable</span>
          <span>+{d.deltaPctVsForecast}% vs forecast</span>
        </div>
      </div>
      <svg
        className="hgm-pickup-chart"
        viewBox={`0 0 ${geo.w} ${geo.h}`}
        role="img"
        aria-label="Pickup vs comparable and forecast"
      >
        <defs>
          <linearGradient id="hgmPickupFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,168,90,0.18)" />
            <stop offset="100%" stopColor="rgba(0,168,90,0)" />
          </linearGradient>
        </defs>
        <line
          x1={8}
          x2={geo.w - 8}
          y1={geo.invY}
          y2={geo.invY}
          stroke="rgba(0,168,90,0.4)"
          strokeWidth="1.25"
          strokeDasharray="4 3"
        />
        <path d={geo.area} fill="url(#hgmPickupFill)" />
        <path
          d={geo.line("forecast")}
          fill="none"
          stroke="rgba(10,13,11,0.22)"
          strokeWidth="1.25"
          strokeDasharray="2 3"
        />
        <path
          d={geo.line("comparable")}
          fill="none"
          stroke="rgba(10,13,11,0.38)"
          strokeWidth="1.35"
          strokeDasharray="4 3"
        />
        <path
          d={geo.line("current")}
          fill="none"
          stroke="#07533f"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {geo.markers.map((m) => (
          <g key={m.displayId}>
            <circle cx={m.cx} cy={m.cy} r="4.5" fill="#07533f" />
            <circle cx={m.cx} cy={m.cy} r="7" fill="none" stroke="#07533f" strokeWidth="1" opacity="0.35" />
            <text
              x={m.cx}
              y={m.cy - 10}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#07533f"
            >
              {m.displayId}
            </text>
          </g>
        ))}
        {geo.axis.map((t) => (
          <text
            key={t.label}
            x={geo.x(t.d)}
            y={geo.h - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#8a928d"
            fontWeight="650"
          >
            {t.label}
          </text>
        ))}
      </svg>
      <div className="hgm-pickup-legend" aria-hidden>
        <span data-s="current">Current pickup</span>
        <span data-s="comparable">Comparable</span>
        <span data-s="forecast">Forecast</span>
        <span data-s="inv">Sellable inventory</span>
      </div>
    </div>
  );
}

const CH_DOT: Record<string, string> = {
  direct: "#0b5c38",
  booking_com: "#8a6a3c",
  expedia: "#3a6ea5",
  corporate: "#6b4f8a",
};

const CH_LABEL: Record<string, string> = {
  direct: "Direct",
  booking_com: "Booking.com",
  expedia: "Expedia",
  corporate: "Corporate",
};

export function HotelGmChannelMix() {
  const d = hotelGmChannelMix();
  return (
    <div className="hgm-card" data-widget="hotel_channel_mix">
      <CardHead
        icon={<IcoNet />}
        title="Channel mix"
        sub={d.headline}
        openHref={d.openHref}
        chip={d.decisionChip}
      />
      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#626a65" }}>
        {d.supporting}
      </p>
      <div style={{ overflowX: "auto", minWidth: 0 }}>
        <table className="hgm-ch-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Gross ADR</th>
              <th>Commission</th>
              <th>Net ADR</th>
              <th>Contribution</th>
              <th>Room nights · net</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.channel}>
                <td>
                  <span className="hgm-ch-name">
                    <i style={{ background: CH_DOT[r.channel] ?? "#626a65" }} />
                    {CH_LABEL[r.channel] ?? r.channel}
                  </span>
                </td>
                <td>€{r.grossAdr}</td>
                <td>
                  {r.commissionPct > 0 ? `−${r.commissionPct}%` : "€0"}
                </td>
                <td>€{r.netAdr}</td>
                <td>€{r.netContribution}</td>
                <td>
                  <span className="hgm-ch-bar" title="Room-night share">
                    <i style={{ width: `${r.rnSharePct}%` }} />
                  </span>
                  <span className="hgm-ch-rn">
                    {" "}
                    {r.pickupTonight} rn · €{r.netAdr}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HotelGmNeedsYou() {
  const rows = hotelGmNeedsYou();
  return (
    <div className="hgm-card" data-widget="needs_you">
      <CardHead
        icon={<IcoBolt />}
        title="Needs you"
        openHref="/app/decisions"
      />
      <ul className="hgm-needs">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={r.href}>
              <span className="hgm-ico" aria-hidden>
                <IcoBolt />
              </span>
              <span>
                <strong>{r.title}</strong>
                <em>{r.context}</em>
              </span>
              <span className="hgm-pri" data-p={r.priority}>
                {r.priority === "high" ? "High" : "Medium"}
              </span>
              <span className="hgm-chev" aria-hidden>
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HotelGmVerifiedValue() {
  const d = hotelGmVerifiedValue();
  const geo = useMemo(() => {
    const w = 480;
    const h = 72;
    const pad = 8;
    const maxY = d.totalEuro;
    const x = (i: number) =>
      pad + (i / (d.points.length - 1)) * (w - pad * 2);
    const y = (v: number) => pad + (1 - v / maxY) * (h - pad * 2);
    const line = d.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.cumulative).toFixed(1)}`,
      )
      .join(" ");
    const area =
      line +
      ` L${x(d.points.length - 1).toFixed(1)},${(h - pad).toFixed(1)} L${x(0).toFixed(1)},${(h - pad).toFixed(1)} Z`;
    return { w, h, pad, line, area, x, y, points: d.points };
  }, [d]);

  return (
    <div className="hgm-card" data-widget="verified_value_trend">
      <CardHead
        icon={<IcoDiamond />}
        title="Verified value"
        sub="MTD · Cumulative sealed outcomes this period."
        openHref={d.openHref}
      />
      <div className="hgm-vv-top">
        <div>
          <p className="hgm-vv-num">
            €{d.totalEuro.toLocaleString("en-GB")}
          </p>
          <p className="hgm-vv-label">Verified value</p>
          <p className="hgm-vv-sub">
            {d.sealedCount} sealed Decisions · MTD cumulative
          </p>
        </div>
        <span className="hgm-status">
          <i />+{d.vsPriorPct}% vs prior period
        </span>
      </div>
      <svg
        className="hgm-vv-chart"
        viewBox={`0 0 ${geo.w} ${geo.h}`}
        role="img"
        aria-label={`Verified Value cumulative €${d.totalEuro}`}
      >
        <defs>
          <linearGradient id="hgmVvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,168,90,0.2)" />
            <stop offset="100%" stopColor="rgba(0,168,90,0)" />
          </linearGradient>
        </defs>
        <path d={geo.area} fill="url(#hgmVvFill)" />
        <path
          d={geo.line}
          fill="none"
          stroke="#00a85a"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {geo.points.map((p, i) => (
          <circle
            key={p.label}
            cx={geo.x(i)}
            cy={geo.y(p.cumulative)}
            r={i === geo.points.length - 1 ? 3.5 : 2.25}
            fill="#07533f"
          />
        ))}
        {geo.points.map((p, i) =>
          i % 1 === 0 ? (
            <text
              key={`t-${p.label}`}
              x={geo.x(i)}
              y={geo.h - 1}
              textAnchor="middle"
              fontSize="8.5"
              fill="#8a928d"
              fontWeight="650"
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function IcoCal() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="2.5"
        y="3.5"
        width="13"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.5 7h13M6 2.5v2M12 2.5v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Morning Brief readiness — forecast for 14:20, not observed at 10:37. */
export function MorningBriefRoomReadiness() {
  const d = morningBriefReadiness();
  const r = 36;
  const c = 48;
  const circ = 2 * Math.PI * r;
  const readyLen = (d.ready / d.due) * circ;
  const prepLen = (d.toPrepare / d.due) * circ;

  return (
    <div className="hgm-card" data-widget="room_readiness">
      <CardHead
        icon={<IcoBed />}
        title="Room readiness"
        openHref={d.openHref}
        favId="mb_room_readiness"
      />
      <div className="hgm-ready-body">
        <div>
          <p className="hgm-ready-k">{d.forecastLabel}</p>
          <p className="hgm-ready-num">
            {d.ready}/{d.due}
          </p>
          <p className="hgm-ready-sub">{d.primaryCaption}</p>
          <p className="hgm-ready-risk">⚠ {d.riskLine}</p>
        </div>
        <svg className="hgm-donut" viewBox="0 0 96 96" aria-hidden>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgba(10,13,11,0.06)"
            strokeWidth="10"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#cfead9"
            strokeWidth="10"
            strokeDasharray={`${prepLen} ${circ}`}
            strokeDashoffset={-readyLen}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#07533f"
            strokeWidth="10"
            strokeDasharray={`${readyLen} ${circ}`}
            transform={`rotate(-90 ${c} ${c})`}
            strokeLinecap="butt"
          />
          <text x={c} y={c - 2} textAnchor="middle" className="hgm-donut-center">
            {d.readyPct}%
          </text>
          <text x={c} y={c + 12} textAnchor="middle" className="hgm-donut-sub">
            Ready
          </text>
        </svg>
        <ul className="hgm-legend">
          <li>
            <span>
              <i style={{ background: "#07533f" }} /> Ready
            </span>
            <strong>{d.ready}</strong>
          </li>
          <li>
            <span>
              <i style={{ background: "#cfead9" }} /> To prepare
            </span>
            <strong>{d.toPrepare}</strong>
          </li>
          <li>
            <span>
              <i style={{ background: "#a8aea9" }} /> At risk
            </span>
            <strong>
              {d.atRisk}
              <span style={{ fontWeight: 600, color: "#626a65" }}> of {d.toPrepare}</span>
            </strong>
          </li>
        </ul>
      </div>
      <Link className="hgm-ready-strip" href={d.openHref}>
        <span>{d.insight}</span>
        <em>›</em>
      </Link>
    </div>
  );
}

export function MorningBriefEventContext() {
  const d = morningBriefEvent();
  return (
    <div className="hgm-card hgm-event" data-widget="event_context">
      <CardHead
        icon={<IcoCal />}
        title="Event context"
        sub={d.headline}
        openHref={d.openHref}
        favId="mb_event_context"
      />
      <div className="hgm-event-body">
        <div>
          <p className="hgm-ready-k">Vs baseline</p>
          <p className="hgm-event-delta">+{d.vsBaselinePct}%</p>
          <p className="hgm-event-venue">{d.venueLine}</p>
          <p className="hgm-event-copy">{d.explanation}</p>
        </div>
      </div>
      <div className="hgm-event-strip">{d.strip}</div>
    </div>
  );
}

/** Full-width Morning Brief Verified Value hero. */
export function MorningBriefVerifiedValue() {
  const d = morningBriefVerifiedValue();
  const geo = useMemo(() => {
    const w = 720;
    const h = 110;
    const padL = 28;
    const padR = 12;
    const padT = 10;
    const padB = 18;
    const maxY = 8000;
    const x = (i: number) =>
      padL + (i / (d.points.length - 1)) * (w - padL - padR);
    const y = (v: number) => padT + (1 - v / maxY) * (h - padT - padB);
    const line = d.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.cumulative).toFixed(1)}`,
      )
      .join(" ");
    const area =
      line +
      ` L${x(d.points.length - 1).toFixed(1)},${(h - padB).toFixed(1)} L${x(0).toFixed(1)},${(h - padB).toFixed(1)} Z`;
    const yTicks = [0, 2000, 4000, 6000, 8000];
    return { w, h, padL, padB, line, area, x, y, yTicks, points: d.points };
  }, [d]);

  return (
    <div className="hgm-card hgm-vv-hero" data-widget="verified_value_trend">
      <CardHead
        icon={<IcoDiamond />}
        title="Verified value"
        sub="MTD · Cumulative sealed outcomes this period."
        openHref={d.openHref}
      />
      <div className="hgm-vv-hero-body">
        <div className="hgm-vv-hero-num">
          <p className="hgm-vv-num">
            €{d.totalEuro.toLocaleString("en-GB")}
          </p>
          <p className="hgm-vv-label">Verified value</p>
          <p className="hgm-vv-sub">
            {d.sealedCount} sealed Decisions · MTD cumulative
          </p>
        </div>
        <svg
          className="hgm-vv-hero-chart"
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          role="img"
          aria-label={`Verified Value cumulative €${d.totalEuro} MTD`}
        >
          <defs>
            <linearGradient id="hgmMbVvFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,168,90,0.22)" />
              <stop offset="100%" stopColor="rgba(0,168,90,0)" />
            </linearGradient>
          </defs>
          {geo.yTicks.map((t) => (
            <g key={t}>
              <line
                x1={geo.padL}
                x2={geo.w - 12}
                y1={geo.y(t)}
                y2={geo.y(t)}
                stroke="rgba(10,13,11,0.05)"
              />
              <text
                x={geo.padL - 6}
                y={geo.y(t) + 3}
                textAnchor="end"
                fontSize="9"
                fill="#8a928d"
                fontWeight="650"
              >
                {t === 0 ? "0" : `${t / 1000}k`}
              </text>
            </g>
          ))}
          <path d={geo.area} fill="url(#hgmMbVvFill)" />
          <path
            d={geo.line}
            fill="none"
            stroke="#00a85a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {geo.points.map((p, i) => (
            <circle
              key={p.label}
              cx={geo.x(i)}
              cy={geo.y(p.cumulative)}
              r={i === geo.points.length - 1 ? 4 : 2.5}
              fill="#07533f"
            >
              <title>
                {p.label} · {p.title} · €{p.cumulative.toLocaleString("en-GB")}
              </title>
            </circle>
          ))}
          {geo.points.map((p, i) => (
            <text
              key={`t-${p.label}`}
              x={geo.x(i)}
              y={geo.h - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#8a928d"
              fontWeight="650"
            >
              {p.label}
            </text>
          ))}
        </svg>
        <span className="hgm-status hgm-vv-hero-delta">
          <i />+{d.vsPriorPct}% vs prior period
        </span>
      </div>
    </div>
  );
}

/** Map dashboard module id → Hotel GM skin. */
export function renderHotelGmWidget(moduleId: string): ReactNode | null {
  switch (moduleId) {
    case "hotel_occ_adr_revpar":
      return <HotelGmOccAdrRevpar />;
    case "room_readiness":
      return <HotelGmRoomReadiness />;
    case "hotel_pickup":
      return <HotelGmPickup />;
    case "hotel_channel_mix":
      return <HotelGmChannelMix />;
    case "builder_decisions":
      return <HotelGmNeedsYou />;
    case "verified_value_trend":
      return <HotelGmVerifiedValue />;
    default:
      return null;
  }
}

/** Morning Brief skins — curated daily brief. */
export function renderMorningBriefWidget(moduleId: string): ReactNode | null {
  switch (moduleId) {
    case "hotel_occ_adr_revpar":
      return <HotelGmOccAdrRevpar />;
    case "room_readiness":
      return <MorningBriefRoomReadiness />;
    case "hotel_pickup":
      return <HotelGmPickup />;
    case "event_context":
      return <MorningBriefEventContext />;
    case "builder_decisions":
      return <HotelGmNeedsYou />;
    case "verified_value_trend":
      return <MorningBriefVerifiedValue />;
    default:
      return null;
  }
}
