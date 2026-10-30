"use client";

/**
 * Hotel Control Center — graphite instrument baseline (parity with CcCockpit).
 */

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  canalHouseLive,
  hotelGroupRollup,
} from "@/lib/radr/demo/hotelDataset";
import {
  hotelNeedsYouDecisions,
  hotelVerifiedExamples,
} from "@/lib/radr/demo/hotelDecisions";
import { NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";
import { HotelPaceCalendar } from "./MiniOperatingCalendar";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { controlCenterLensFor } from "@/lib/radr/product/controlCenterLens";
import { useProduct } from "@/lib/product/store";
import { VisionHotelPace } from "./vision/VisionHotelPace";
import { HotelGmControlCenter } from "./HotelGmControlCenter";
import "./control-center-instrument.css";

type Props = {
  onSelectDecision: (id: string) => void;
};

const PROPERTY_META: Record<
  string,
  {
    pickup7d: number;
    roomsLeft: number;
    readiness: string;
    exposure: number;
    occ: number;
    adr: number;
    revpar: number;
    state: "ok" | "watch" | "pressure";
    status: string;
  }
> = {
  loc_canal_house: {
    pickup7d: 11,
    roomsLeft: 18,
    readiness: "31/42",
    exposure: 1840,
    occ: 89,
    adr: 248,
    revpar: 221,
    state: "pressure",
    status: "Readiness gap",
  },
  loc_ams_harbour: {
    pickup7d: 6,
    roomsLeft: 24,
    readiness: "OK",
    exposure: 420,
    occ: 84,
    adr: 196,
    revpar: 165,
    state: "watch",
    status: "Watch channel mix",
  },
  loc_schiphol_gate: {
    pickup7d: 3,
    roomsLeft: 31,
    readiness: "OK",
    exposure: 0,
    occ: 78,
    adr: 142,
    revpar: 111,
    state: "ok",
    status: "On pace",
  },
  loc_lisbon_alfama: {
    pickup7d: 5,
    roomsLeft: 22,
    readiness: "OK",
    exposure: 180,
    occ: 91,
    adr: 178,
    revpar: 162,
    state: "watch",
    status: "Event compression",
  },
};

function greeting(clock: string): string {
  const h = Number(clock.split(":")[0] ?? 14);
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function HotelCockpit({ onSelectDecision }: Props) {
  const live = canalHouseLive();
  const group = hotelGroupRollup();
  const needs = hotelNeedsYouDecisions();
  const verified = hotelVerifiedExamples();
  const verifiedSum = verified.reduce((s, v) => s + v.euro, 0);
  const router = useRouter();
  const { roleView, locationScope } = useProduct();
  const lens = useMemo(
    () => controlCenterLensFor(roleView, "hotel"),
    [roleView],
  );
  const isGroupScope =
    locationScope === "all" || locationScope.startsWith("region_");
  const showPace =
    lens.heroObject === "pace" || roleView === "revenue_manager";

  const active = needs[0];
  const reviewItems = needs.slice(0, 3);

  const band = useMemo(
    () =>
      lens.band.map((b) => {
        if (b.id === "occ")
          return { id: b.id, label: b.label, value: `${live.occupancyPct}%`, vs: b.fallbackVs, tone: b.tone };
        if (b.id === "adr")
          return { id: b.id, label: b.label, value: `€${live.expectedAdr - 4}`, vs: b.fallbackVs, tone: b.tone };
        if (b.id === "revpar")
          return { id: b.id, label: b.label, value: `€${live.expectedRevpar - 16}`, vs: b.fallbackVs, tone: b.tone };
        if (b.id === "ready")
          return { id: b.id, label: b.label, value: `${live.ready}/${live.arrivals}`, vs: `${live.atRiskArrivals} at risk`, tone: b.tone };
        return { id: b.id, label: b.label, value: b.fallbackValue, vs: b.fallbackVs, tone: b.tone };
      }),
    [lens.band, live],
  );

  const orgTotal = NORTHSTAR_HOTELS.locations.length;
  const properties = NORTHSTAR_HOTELS.locations.map((loc, i) => {
    const meta =
      PROPERTY_META[loc.id] ??
      ({
        pickup7d: Math.max(1, 5 - (i % 4)),
        roomsLeft: 18 + i * 3,
        readiness: i % 3 === 0 ? `${28 + i}/${36 + i}` : "OK",
        exposure: i % 4 === 0 ? 640 : 0,
        occ: 90 - i * 2,
        adr: group.adr - i * 6,
        revpar: group.revpar - i * 8,
        state: (i === 0 ? "pressure" : i % 3 === 0 ? "watch" : "ok") as
          | "ok"
          | "watch"
          | "pressure",
        status: i === 0 ? "Needs decision" : "On pace",
      });
    return { loc, meta };
  });
  const visibleProperties = isGroupScope
    ? properties
    : properties.filter((p) => p.loc.id === locationScope);

  const vvBars = [38, 52, 47, 61, 55, 70, 58, 74, 63, 71, 68, 80];
  const avgImpact =
    verified.length > 0
      ? `€${(verifiedSum / verified.length / 1000).toFixed(1)}k`
      : "—";

  if (showPace) {
    return <VisionHotelPace onSelectDecision={onSelectDecision} />;
  }

  // GM / rooms flagship — Daylight command brief (mockup SSOT)
  if (lens.heroObject === "rooms" || roleView === "hotel_gm" || roleView === "gm") {
    return <HotelGmControlCenter onSelectDecision={onSelectDecision} />;
  }

  return (
    <div
      className="rp-cc-instrument"
      data-surface="daylight"
      data-page="control-center"
      data-vertical="hotel"
      data-lens={lens.role}
      data-scope={isGroupScope ? "group" : "property"}
      data-hero={lens.heroObject}
      data-pace={showPace ? "true" : undefined}
    >
      <div className="rp-cc-instrument-main">
        <p className="rp-cci-ctx">
          {greeting(live.clockLabel).toUpperCase()}
          <span className="rp-cci-ctx-live">
            <i /> LIVE {live.clockLabel}
          </span>
        </p>

        <header className="rp-cci-hero">
          <h2 className="rp-cci-statement">
            <span>{lens.heroPrimary}</span>
            <span data-tone="adverse">{lens.heroAdverse}</span>
          </h2>
          <div className="rp-cci-net">
            <strong>€{live.exposureEuro.toLocaleString("en-IE")}</strong>
            <span>exposed tonight</span>
          </div>
        </header>

        <p className="rp-cci-why">{lens.why}</p>

        <ul className="rp-cci-band rp-cci-band-hotel" aria-label={lens.question}>
          {band.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() =>
                  b.id === "ready"
                    ? onSelectDecision(active?.id ?? "")
                    : router.push("/app/locations")
                }
              >
                <span className="rp-cci-band-k">{b.label}</span>
                <span className="rp-cci-band-v" data-tone={b.tone}>
                  {b.value}
                </span>
                <span className="rp-cci-band-d">{b.vs}</span>
              </button>
            </li>
          ))}
        </ul>

        <section
          className="rp-cci-pulse rp-cci-pulse-hotel"
          aria-label="Operating pulse"
          data-flagship={showPace ? "pace" : "day"}
        >
          <div className="rp-cci-pulse-head">
            <div>
              <h3>{showPace ? "Pace calendar" : "Operating pulse"}</h3>
              <p>{lens.pulseCaption}</p>
            </div>
          </div>
          {showPace ? (
            <div className="rp-cci-hotel-pace rp-cci-hotel-pace-flagship">
              <HotelPaceCalendar
                onDayClick={() => onSelectDecision(active?.id ?? "")}
              />
            </div>
          ) : (
            <>
              <HotelOperatingPulse
                live={live}
                decisionId={active?.id}
                onSelectDecision={onSelectDecision}
              />
              <div className="rp-cci-hotel-pace">
                <HotelPaceCalendar
                  onDayClick={() => onSelectDecision(active?.id ?? "")}
                />
              </div>
            </>
          )}
        </section>

        <section className="rp-cci-table-wrap" aria-label={lens.tableTitle}>
          <div className="rp-cci-table-head">
            <h3>
              {lens.tableTitle}
              {isGroupScope ? (
                <em>
                  {" "}
                  · {visibleProperties.length} of {orgTotal}
                </em>
              ) : null}
            </h3>
            <Link href="/app/locations">View all properties →</Link>
          </div>
          <table className="rp-cci-table">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Occupancy</th>
                <th scope="col">ADR</th>
                <th scope="col">RevPAR</th>
                <th scope="col">Pickup</th>
                <th scope="col">Readiness</th>
                <th scope="col">Exposure</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleProperties.map(({ loc, meta }) => (
                <tr
                  key={loc.id}
                  onClick={() => router.push(`/app/locations/${loc.id}`)}
                >
                  <td>{loc.name}</td>
                  <td>{meta.occ}%</td>
                  <td>€{meta.adr}</td>
                  <td>€{meta.revpar}</td>
                  <td data-tone={meta.pickup7d >= 5 ? "pos" : "watch"}>
                    +{meta.pickup7d}
                  </td>
                  <td>{meta.readiness}</td>
                  <td data-tone={meta.exposure > 500 ? "neg" : "pos"}>
                    {meta.exposure ? formatDecisionMoney(meta.exposure) : "—"}
                  </td>
                  <td>
                    <span className="rp-cci-status" data-state={meta.state}>
                      <i />
                      {meta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <aside className="rp-cc-instrument-rail" aria-label="Intelligence rail">
        <section className="rp-cci-rail-card" data-card="decision">
          <p className="rp-cci-rail-k">
            Active decision
            <span className="rp-cci-live">Live</span>
          </p>
          {active ? (
            <>
              <h3 className="rp-cci-decision-verb">{active.verb}</h3>
              <p className="rp-cci-decision-where">
                {active.locationLabel} · {active.deadlineLabel}
              </p>
              <p className="rp-cci-decision-why">{active.why}</p>
              <div className="rp-cci-decision-meta">
                <div>
                  <em>Expected impact</em>
                  <strong>+{active.economicFormatted.replace(/^\+/, "")}</strong>
                </div>
                <div>
                  <em>Confidence</em>
                  <strong>81%</strong>
                </div>
              </div>
              <button
                type="button"
                className="rp-cci-cta"
                onClick={() => onSelectDecision(active.id)}
              >
                Review decision →
              </button>
            </>
          ) : (
            <p className="rp-cci-decision-why">
              Nothing needs your judgment. RADR is watching.
            </p>
          )}
        </section>

        <section className="rp-cci-rail-card" data-card="review">
          <p className="rp-cci-rail-k">
            {Math.min(reviewItems.length, 3)} things to review
          </p>
          <ul className="rp-cci-review">
            {reviewItems.map((item, idx) => (
              <li key={item.id}>
                <button type="button" onClick={() => onSelectDecision(item.id)}>
                  <span
                    className="rp-cci-dot"
                    data-tone={idx === 0 ? "neg" : undefined}
                  />
                  <span>
                    <strong>
                      {item.family.replace(/_/g, " ")} · {item.locationLabel}
                    </strong>
                    <span>
                      {item.economicFormatted} · {item.deadlineLabel}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rp-cci-rail-card rp-cci-vv" data-card="verified">
          <p className="rp-cci-rail-k">Verified value</p>
          <strong>€{verifiedSum.toLocaleString("en-IE")}</strong>
          <p className="rp-cci-vv-label">
            Verified contribution MTD{" "}
            <span className="rp-cci-vv-delta">+14%</span>
          </p>
          <div className="rp-cci-vv-bars" aria-hidden="true">
            {vvBars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <ul className="rp-cci-vv-stats">
            <li>
              <em>Decisions</em>
              <strong>{verified.length || 8}</strong>
            </li>
            <li>
              <em>Positive</em>
              <strong>{Math.max(1, verified.length - 1)}</strong>
            </li>
            <li>
              <em>Avg impact</em>
              <strong>{avgImpact}</strong>
            </li>
          </ul>
          <Link href="/app/value" className="rp-cci-vv-link">
            View verified value →
          </Link>
        </section>
      </aside>
    </div>
  );
}

function HotelOperatingPulse({
  live,
  decisionId,
  onSelectDecision,
}: {
  live: ReturnType<typeof canalHouseLive>;
  decisionId?: string;
  onSelectDecision: (id: string) => void;
}) {
  const events = [
    {
      t: 0.18,
      label: "12:00",
      title: "Departures peak",
      detail: `${live.departuresDue} due`,
      tone: "pos" as const,
    },
    {
      t: 0.42,
      label: "14:00",
      title: "Cleaning pressure",
      detail: `${live.cleaning} in HK`,
      tone: "neg" as const,
    },
    {
      t: 0.55,
      label: live.clockLabel,
      title: "NOW",
      detail: `${live.ready}/${live.arrivals} ready`,
      tone: "pos" as const,
    },
    {
      t: 0.72,
      label: "15:30",
      title: "Check-in wave",
      detail: `${live.atRiskArrivals} at risk`,
      tone: "neg" as const,
    },
  ];

  return (
    <div className="rp-pulse-land rp-pulse-land-hotel" aria-label="Hotel day pulse">
      <svg
        className="rp-pulse-land-svg"
        viewBox="0 0 900 280"
        preserveAspectRatio="none"
        role="img"
        aria-label="Occupancy, ADR and contribution through the operating day"
      >
        <defs>
          <linearGradient id="rpHotelPulseArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d978" stopOpacity="0.24" />
            <stop offset="55%" stopColor="#00d978" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00d978" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[48, 96, 144, 192, 240].map((y) => (
          <line
            key={y}
            x1="48"
            y1={y}
            x2="880"
            y2={y}
            stroke="rgba(255,255,255,0.045)"
            strokeWidth="1"
          />
        ))}
        <path
          d="M48,170 C140,160 220,140 300,110 C380,82 460,78 540,95 C620,112 700,130 780,118 C830,110 860,98 880,90 L880,252 L48,252 Z"
          fill="url(#rpHotelPulseArea)"
        />
        <path
          d="M48,170 C140,160 220,140 300,110 C380,82 460,78 540,95 C620,112 700,130 780,118 C830,110 860,98 880,90"
          fill="none"
          stroke="#00d978"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M48,195 C160,188 260,175 360,160 C460,145 560,155 660,168 C760,180 830,172 880,165"
          fill="none"
          stroke="rgba(232,235,233,0.75)"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <path
          d="M48,210 C170,205 280,195 400,188 C520,182 640,195 760,205 C820,210 860,208 880,200"
          fill="none"
          stroke="rgba(232,235,233,0.38)"
          strokeWidth="1.55"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
        <line
          x1={900 * 0.72}
          y1="32"
          x2={900 * 0.72}
          y2="252"
          stroke="rgba(224,112,96,0.55)"
          strokeWidth="1.25"
          strokeDasharray="4 5"
        />
        <line
          x1={900 * 0.55}
          y1="28"
          x2={900 * 0.55}
          y2="252"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <circle
          cx={900 * 0.55}
          cy="108"
          r="5.5"
          fill="#00d978"
          stroke="#141716"
          strokeWidth="2.5"
        />
      </svg>
      <div className="rp-pulse-land-axis" aria-hidden="true">
        <span>09:00</span>
        <span>12:00</span>
        <span>14:00</span>
        <span className="rp-pulse-land-now">NOW {live.clockLabel}</span>
        <span>16:00</span>
        <span>18:00</span>
      </div>
      <ul className="rp-pulse-land-events">
        {events.map((ev) => (
          <li
            key={ev.label}
            data-tone={ev.tone}
            style={{ left: `${ev.t * 100}%` }}
          >
            <button
              type="button"
              onClick={() => decisionId && onSelectDecision(decisionId)}
            >
              <strong>{ev.label}</strong>
              <span>{ev.title}</span>
              <em>{ev.detail}</em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
