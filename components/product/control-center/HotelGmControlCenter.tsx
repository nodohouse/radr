"use client";

/**
 * Hotel GM Control Center — Daylight property operating brief.
 * Visual SSOT: tmp/hotel-cc-mockup-ssot.png
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import {
  hotelControlCenterViewModel,
  type HotelControlCenterViewModel,
} from "@/lib/radr/product/hotelControlCenter";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  buildAppHref,
  locationsHref,
  operationsHref,
  valueHref,
} from "@/lib/product/radrContext/navigateWithContext";
import "./hotel-gm-cc.css";

type Props = {
  onSelectDecision: (id: string) => void;
};

type Horizon = "today" | "tomorrow" | "7d";

function Spark({ values, tone }: { values: number[]; tone: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 56;
      const y = 26 - ((v - min) / span) * 22;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke = tone === "neg" ? "#d4534a" : "#00a85a";
  return (
    <svg className="hgcc-spark" viewBox="0 0 56 28" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function PulseChart({
  model,
  onEvent,
}: {
  model: HotelControlCenterViewModel;
  onEvent: (decisionId?: string) => void;
}) {
  const w = 640;
  const h = 200;
  const padL = 28;
  const padR = 12;
  const padT = 28;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxY = Math.max(
    ...model.pulseSeries.map((p) => Math.max(p.actual, p.expected)),
  );

  const toX = (t: number) => padL + t * innerW;
  const toY = (v: number) => padT + innerH - (v / maxY) * innerH;

  const actualPath = model.pulseSeries
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x)},${toY(p.actual)}`)
    .join(" ");
  const expectedPath = model.pulseSeries
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.x)},${toY(p.expected)}`)
    .join(" ");
  const areaPath = `${actualPath} L${toX(1)},${padT + innerH} L${toX(0)},${padT + innerH} Z`;
  const now = model.pulse.find((e) => e.severity === "now");

  return (
    <div className="hgcc-pulse-stage">
      <svg
        className="hgcc-pulse-svg"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Operating pulse — rooms in progress through the day"
      >
        <defs>
          <linearGradient id="hgccPulseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d978" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#00d978" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#00d978" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padL}
            y1={toY(maxY * (1 - t))}
            x2={w - padR}
            y2={toY(maxY * (1 - t))}
            stroke="rgba(10,13,11,0.06)"
            strokeWidth="1"
          />
        ))}
        <path d={areaPath} fill="url(#hgccPulseFill)" />
        <path
          d={expectedPath}
          fill="none"
          stroke="rgba(10,13,11,0.22)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d={actualPath}
          fill="none"
          stroke="#00a85a"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {now ? (
          <>
            <line
              x1={toX(now.t)}
              y1={padT}
              x2={toX(now.t)}
              y2={padT + innerH}
              stroke="rgba(7,83,63,0.35)"
              strokeWidth="1.25"
              strokeDasharray="3 4"
            />
            <circle
              cx={toX(now.t)}
              cy={toY(
                model.pulseSeries[
                  Math.round(now.t * (model.pulseSeries.length - 1))
                ]?.actual ?? 40,
              )}
              r="6"
              fill="#00d978"
              stroke="#fff"
              strokeWidth="2.5"
            />
          </>
        ) : null}
        {["08:00", "12:00", "14:00", "16:00", "18:00", "22:00"].map(
          (label, i) => {
            const x = toX(i / 5);
            return (
              <text
                key={label}
                x={x}
                y={h - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#8a928d"
              >
                {label}
              </text>
            );
          },
        )}
      </svg>
      <ul className="hgcc-pulse-events">
        {model.pulse.map((ev) => (
          <li
            key={ev.id}
            data-sev={ev.severity}
            style={{ left: `${ev.t * 100}%` }}
          >
            <button type="button" onClick={() => onEvent(ev.decisionId)}>
              <strong>{ev.time}</strong>
              <span>{ev.title}</span>
              <em>{ev.detail}</em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HotelGmControlCenter({ onSelectDecision }: Props) {
  const router = useRouter();
  const { locationScope, setLocationScope } = useProduct();
  const focusId =
    locationScope !== "all" && !String(locationScope).startsWith("region_")
      ? String(locationScope)
      : "loc_canal_house";
  const model = useMemo(
    () => hotelControlCenterViewModel(focusId),
    [focusId],
  );
  const [horizon, setHorizon] = useState<Horizon>("today");

  return (
    <div className="hgcc" data-testid="hotel-gm-cc" data-horizon={horizon}>
      <div className="hgcc-main">
        <header className="hgcc-hero">
          <div
            className="hgcc-hero-atmos"
            style={{ backgroundImage: `url(${model.heroImage})` }}
            aria-hidden
          />
          <div className="hgcc-hero-inner">
            <div>
              <p className="hgcc-meta">
                {model.greeting.toUpperCase()}
                <span>
                  <i /> LIVE · {model.clockLabel}
                </span>
              </p>
              <h1 className="hgcc-statement">
                <span>{model.heroPrimary}</span>
                <span data-tone="adverse">{model.heroAdverse}</span>
              </h1>
              <p className="hgcc-summary">{model.summary}</p>
            </div>
            <div className="hgcc-exposure">
              <strong>
                €{model.exposureEuro.toLocaleString("en-GB")}
              </strong>
              <span>exposed tonight</span>
            </div>
          </div>
        </header>

        <section className="hgcc-kpis" aria-label="Hotel KPIs">
          {model.kpis.map((k) => (
            <button
              key={k.id}
              type="button"
              className="hgcc-kpi"
              data-tone={k.tone}
              onClick={() => {
                if (k.id === "ready") router.push(operationsHref());
                else if (k.id === "occ" || k.id === "adr")
                  router.push(locationsHref());
              }}
            >
              <span className="hgcc-kpi-k">{k.label}</span>
              <span className="hgcc-kpi-v">{k.value}</span>
              <span className="hgcc-kpi-d">{k.delta}</span>
              <Spark values={k.spark} tone={k.tone} />
            </button>
          ))}
        </section>

        <section className="hgcc-pulse" aria-label="Operating pulse">
          <div className="hgcc-pulse-head">
            <div>
              <h3>Operating pulse</h3>
              <p>Housekeeping → arrivals · operating day</p>
            </div>
            <div className="hgcc-pulse-controls">
              {(
                [
                  ["today", "Today"],
                  ["tomorrow", "Tomorrow"],
                  ["7d", "7 days"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  data-active={horizon === id ? "true" : undefined}
                  onClick={() => setHorizon(id)}
                >
                  {label}
                </button>
              ))}
              <select aria-label="Floor filter" defaultValue="all">
                <option value="all">All floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
                <option value="4">Floor 4</option>
              </select>
            </div>
          </div>
          <PulseChart
            model={model}
            onEvent={(id) => id && onSelectDecision(id)}
          />
        </section>

        <section className="hgcc-table-wrap" aria-label="Property performance">
          <div className="hgcc-table-head">
            <h3>
              Property performance
              <em> · {model.properties.length} properties</em>
            </h3>
            <Link href={locationsHref()}>View all properties →</Link>
          </div>
          <table className="hgcc-table">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Occupancy</th>
                <th scope="col">ADR</th>
                <th scope="col">RevPAR</th>
                <th scope="col">Pickup (7d)</th>
                <th scope="col">Readiness</th>
                <th scope="col">Exposure</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {model.properties.map((row) => (
                <tr
                  key={row.id}
                  data-active={row.id === focusId ? "true" : undefined}
                  onClick={() => {
                    setLocationScope(row.id as never);
                  }}
                >
                  <td>
                    <span className="hgcc-prop-name">{row.name}</span>
                    <span className="hgcc-prop-city">{row.city}</span>
                  </td>
                  <td>
                    {row.occupancy}%
                    <span className="hgcc-prop-city">{row.occupancyDelta}</span>
                  </td>
                  <td>
                    €{row.adr}
                    <span className="hgcc-prop-city">{row.adrDelta}</span>
                  </td>
                  <td>€{row.revpar}</td>
                  <td data-tone={row.pickup7d >= row.pickupExpected ? "pos" : "watch"}>
                    +{row.pickup7d}
                  </td>
                  <td>
                    {row.readiness}
                    {row.atRisk > 0 ? (
                      <span className="hgcc-prop-city">{row.atRisk} at risk</span>
                    ) : null}
                  </td>
                  <td data-tone={row.exposure > 500 ? "neg" : "pos"}>
                    {row.exposure
                      ? formatDecisionMoney(row.exposure)
                      : "—"}
                  </td>
                  <td>
                    <span className="hgcc-status" data-state={row.state}>
                      <i />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <aside className="hgcc-rail" aria-label="Action rail">
        <section className="hgcc-card" data-card="decision">
          <p className="hgcc-rail-k">
            Active decision
            <span className="hgcc-live">LIVE</span>
          </p>
          {model.activeDecision ? (
            <>
              <h2 className="hgcc-decision-verb">
                {model.activeDecision.verb}
              </h2>
              <p className="hgcc-decision-where">
                {model.activeDecision.where}
              </p>
              <p className="hgcc-decision-why">{model.activeDecision.why}</p>
              <div className="hgcc-decision-meta">
                <div>
                  <em>Expected impact</em>
                  <strong>{model.activeDecision.expectedImpact}</strong>
                </div>
                <div>
                  <em>Confidence</em>
                  <strong>{model.activeDecision.confidence}%</strong>
                </div>
              </div>
              <Link
                href={buildAppHref("/app/decisions", {
                  decision: model.activeDecision.id,
                  stay: "1",
                })}
                className="hgcc-cta"
                onClick={() => onSelectDecision(model.activeDecision!.id)}
              >
                Review decision →
              </Link>
            </>
          ) : (
            <p className="hgcc-decision-why">
              Property is on track. No material intervention required.
            </p>
          )}
        </section>

        <section className="hgcc-card" data-card="review">
          <p className="hgcc-rail-k">
            {model.reviewItems.length} things to review
          </p>
          <ul className="hgcc-review">
            {model.reviewItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.decisionId) onSelectDecision(item.decisionId);
                    else if (item.href) router.push(item.href);
                  }}
                >
                  <span className="hgcc-dot" data-tone={item.tone} />
                  <span>
                    <strong>
                      {item.family} · {item.title}
                    </strong>
                    <span>{item.detail}</span>
                    <em>{item.exposureLabel}</em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="hgcc-card hgcc-vv" data-card="verified">
          <p className="hgcc-rail-k">Verified value</p>
          <Link href={valueHref()} className="hgcc-vv-total-link">
            <strong className="hgcc-vv-total">
              €{model.verified.totalEuro.toLocaleString("en-GB")}
            </strong>
          </Link>
          <p className="hgcc-vv-label">
            Verified contribution MTD{" "}
            <span className="hgcc-vv-delta">+14%</span>
          </p>
          <div className="hgcc-vv-bars" aria-hidden>
            {model.verified.bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <ul className="hgcc-vv-stats">
            <li>
              <em>Decisions</em>
              <strong>{model.verified.decisions}</strong>
            </li>
            <li>
              <em>Positive</em>
              <strong>{model.verified.positive}</strong>
            </li>
            <li>
              <em>Avg impact</em>
              <strong>{model.verified.avgImpactLabel}</strong>
            </li>
          </ul>
          <Link href={valueHref()} className="hgcc-vv-link">
            View verified value →
          </Link>
        </section>
      </aside>
    </div>
  );
}
