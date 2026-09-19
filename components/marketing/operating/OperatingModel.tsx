"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  DEFAULT_LOCATION_ID,
  getLocation,
  RADR_VALUE_YTD,
  TERRITORY_COPY,
  type ChartDayCase,
  type OpTerritory,
} from "@/lib/radr/operatingHero";
import { RadarField } from "./RadarField";
import { OperationCore } from "./OperationCore";
import { OperatingTerritory } from "./OperatingTerritory";
import { InvestigationDrawer } from "./InvestigationDrawer";

/** Single active information item: hover preview / click investigate */
type ActiveItem =
  | null
  | { kind: "territory"; id: OpTerritory }
  | { kind: "chart"; key: string };

type DrawerState =
  | null
  | { kind: "territory"; id: OpTerritory }
  | { kind: "chart"; day: ChartDayCase };

const LEAVE_MS = 800;

const CONNECTOR: Record<OpTerritory, string> = {
  buy: "M50 50 Q42 28 38 14",
  labor: "M50 50 Q28 48 12 50",
  sell: "M50 50 Q72 48 88 50",
  recover: "M50 50 Q58 72 62 86",
};

/**
 * Operating model: hover = focus + micro preview; click = drawer.
 * Radar is visual-only and never opens information.
 */
export function OperatingModel({
  active,
  onActiveChange,
  paused,
}: {
  active: OpTerritory;
  onActiveChange: (t: OpTerritory) => void;
  paused?: boolean;
}) {
  const reduced = useReducedMotion();
  const [locationId, setLocationId] = useState(DEFAULT_LOCATION_ID);
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);
  const [radarPulse, setRadarPulse] = useState<OpTerritory | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [ready, setReady] = useState(false);

  const leaveTimer = useRef<number | null>(null);
  const focusReturn = useRef<HTMLButtonElement | null>(null);
  const terrRefs = useRef<Partial<Record<OpTerritory, HTMLButtonElement | null>>>({});
  const pathId = useId();

  const location = getLocation(locationId);
  const hoverTerritory =
    activeItem?.kind === "territory"
      ? activeItem.id
      : paused
        ? active
        : null;

  const clearLeave = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  useEffect(() => {
    return () => clearLeave();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), reduced ? 0 : 180);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Sync left-nav highlight when user hovers a territory
  useEffect(() => {
    if (hoverTerritory) onActiveChange(hoverTerritory);
  }, [hoverTerritory, onActiveChange]);

  const onRadarPulse = useCallback((hit: OpTerritory | null) => {
    setRadarPulse(hit);
  }, []);

  const enterTerritory = (t: OpTerritory) => {
    clearLeave();
    setActiveItem({ kind: "territory", id: t });
  };

  const leaveTerritory = () => {
    clearLeave();
    leaveTimer.current = window.setTimeout(() => {
      setActiveItem((cur) => (cur?.kind === "territory" ? null : cur));
    }, LEAVE_MS);
  };

  const openTerritory = (t: OpTerritory) => {
    focusReturn.current = terrRefs.current[t] ?? null;
    setDrawer({ kind: "territory", id: t });
    onActiveChange(t);
  };

  const openChartDay = (day: ChartDayCase) => {
    focusReturn.current = null;
    setDrawer({ kind: "chart", day });
  };

  const closeDrawer = () => {
    setDrawer(null);
    requestAnimationFrame(() => {
      focusReturn.current?.focus();
    });
  };

  const hasFocus = hoverTerritory !== null;

  return (
    <>
      <div
        className="rx-om"
        data-active={hoverTerritory ?? "none"}
        data-ready={ready ? "true" : "false"}
        data-drawer={drawer ? "true" : "false"}
        aria-label={`Operating model · ${location.venueName}`}
      >
        <div className="rx-om-canvas">
          <RadarField onPulse={onRadarPulse} />

          <svg className="rx-om-link" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id={`${pathId}-g`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,232,106,0)" />
                <stop offset="55%" stopColor="rgba(0,232,106,0.35)" />
                <stop offset="100%" stopColor="rgba(0,232,106,0.55)" />
              </linearGradient>
            </defs>
            {(Object.keys(CONNECTOR) as OpTerritory[]).map((id) => (
              <path
                key={id}
                d={CONNECTOR[id]}
                className="rx-om-link-path"
                data-hot={hoverTerritory === id ? "true" : "false"}
                fill="none"
                stroke={`url(#${pathId}-g)`}
              />
            ))}
          </svg>

          <OperatingTerritory
            ref={(el) => {
              terrRefs.current.buy = el;
            }}
            territory={TERRITORY_COPY.buy}
            value={location.territories.buy.value}
            kind={location.territories.buy.kind}
            lit={hoverTerritory === "buy"}
            dimmed={hasFocus && hoverTerritory !== "buy"}
            showPreview={hoverTerritory === "buy"}
            pulsed={!hasFocus && radarPulse === "buy"}
            ready={ready}
            onEnter={() => enterTerritory("buy")}
            onLeave={leaveTerritory}
            onClick={() => openTerritory("buy")}
          />
          <OperatingTerritory
            ref={(el) => {
              terrRefs.current.labor = el;
            }}
            territory={TERRITORY_COPY.labor}
            value={location.territories.labor.value}
            kind={location.territories.labor.kind}
            lit={hoverTerritory === "labor"}
            dimmed={hasFocus && hoverTerritory !== "labor"}
            showPreview={hoverTerritory === "labor"}
            pulsed={!hasFocus && radarPulse === "labor"}
            ready={ready}
            onEnter={() => enterTerritory("labor")}
            onLeave={leaveTerritory}
            onClick={() => openTerritory("labor")}
          />

          <OperationCore
            location={location}
            onLocationChange={setLocationId}
            highlightTerritory={hoverTerritory}
            onChartDayClick={openChartDay}
            onOpenTerritory={openTerritory}
            ready={ready}
          />

          <OperatingTerritory
            ref={(el) => {
              terrRefs.current.sell = el;
            }}
            territory={TERRITORY_COPY.sell}
            value={location.territories.sell.value}
            kind={location.territories.sell.kind}
            lit={hoverTerritory === "sell"}
            dimmed={hasFocus && hoverTerritory !== "sell"}
            showPreview={hoverTerritory === "sell"}
            pulsed={!hasFocus && radarPulse === "sell"}
            ready={ready}
            onEnter={() => enterTerritory("sell")}
            onLeave={leaveTerritory}
            onClick={() => openTerritory("sell")}
          />
          <OperatingTerritory
            ref={(el) => {
              terrRefs.current.recover = el;
            }}
            territory={TERRITORY_COPY.recover}
            value={location.territories.recover.value}
            kind={location.territories.recover.kind}
            lit={hoverTerritory === "recover"}
            dimmed={hasFocus && hoverTerritory !== "recover"}
            showPreview={hoverTerritory === "recover"}
            pulsed={!hasFocus && radarPulse === "recover"}
            ready={ready}
            onEnter={() => enterTerritory("recover")}
            onLeave={leaveTerritory}
            onClick={() => openTerritory("recover")}
          />
        </div>

        <div className="rx-om-rail">
          <span className="rx-om-rail-kicker">What RADR delivered · YTD</span>
          <p>
            <button
              type="button"
              className="rx-om-rail-verified"
              title={RADR_VALUE_YTD.verifiedNote}
            >
              <strong>{RADR_VALUE_YTD.verifiedDisplay}</strong> verified
            </button>
            <span>
              <strong>{RADR_VALUE_YTD.identifiedDisplay}</strong> identified
            </span>
          </p>
        </div>
      </div>

      <InvestigationDrawer open={drawer !== null} state={drawer} onClose={closeDrawer} />
    </>
  );
}
