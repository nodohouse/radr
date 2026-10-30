"use client";

/**
 * Decision Gap canvas — intelligence engine surface.
 * Signals → RADR operating state → Decision + Compare Futures.
 */

import type { ReactNode } from "react";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { RadrMarkNode } from "@/components/brand/RadrMarkNode";
import { HeroConnectMap } from "@/components/marketing/v2030/HeroConnectMap";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
} from "@/lib/marketing/publicCanon";

export type HeroVertical = "restaurant" | "hotel";

export function HeroProductTheater({ vertical = "restaurant" }: { vertical?: HeroVertical }) {
  return (
    <div className="rx-hpt rx-hpt--board" data-vertical={vertical}>
      <div className="rx-hpt-frame rx-hpt-frame--board">
        <HeroConnectMap vertical={vertical} />
      </div>
    </div>
  );
}

export function DecisionGapContinue({
  vertical,
}: {
  vertical: HeroVertical;
}): ReactNode {
  const isRest = vertical === "restaurant";
  const r = PUBLIC_RESTAURANT;
  const h = PUBLIC_HOTEL;

  const evidence = isRest
    ? [
        { k: "Demand", v: "+21%" },
        { k: "Kitchen", v: "Rising" },
        { k: "Delivery", v: "+31%" },
        { k: "Labor", v: "Stretched" },
      ]
    : [
        { k: "Occupancy", v: "89%" },
        { k: "Arrivals", v: "42" },
        { k: "Readiness", v: "31/42" },
        { k: "Labor", v: "Tight" },
      ];

  const state = isRest
    ? [
        { k: "Demand", v: "+21%" },
        { k: "Kitchen pressure", v: "Rising" },
        { k: "Labor", v: "Stretched" },
        { k: "Inventory", v: "Tight" },
        { k: "Economics", v: "+$620" },
      ]
    : [
        { k: "Occupancy", v: "89%" },
        { k: "Arrivals", v: "Wave" },
        { k: "Readiness", v: "31/42" },
        { k: "Labor", v: "Tight" },
        { k: "Economics", v: "Exposed" },
      ];

  return (
    <div className="rx-gap-flow rx-gap-flow--engine" data-vertical={vertical}>
      <div className="rx-gap-flow-col rx-gap-flow-col--signals">
        <p className="rx-gap-flow-label" data-tone="blue">
          Raw signals
        </p>
        <ul className="rx-gap-evidence">
          {evidence.map((row) => (
            <li key={row.k}>
              <span>{row.k}</span>
              <strong>{row.v}</strong>
            </li>
          ))}
        </ul>
        <p className="rx-gap-flow-note">Raw operating signals</p>
      </div>

      <div className="rx-gap-flow-col rx-gap-flow-col--radr">
        <p className="rx-gap-flow-label" data-tone="green">
          RADR operating state
        </p>
        <div className="rx-gap-flow-core">
          <RadrMarkNode theme="light" />
        </div>
        <ul className="rx-gap-flow-state">
          {state.map((row) => (
            <li key={row.k}>
              <span>{row.k}</span>
              <strong>{row.v}</strong>
            </li>
          ))}
        </ul>
        <p className="rx-gap-flow-bridge">Connects · contextualizes · decides</p>
      </div>

      <div className="rx-gap-flow-col rx-gap-flow-col--dec">
        <p className="rx-gap-flow-label" data-tone="green">
          Compare futures
        </p>

        <div className="rx-gap-futures">
          <article className="rx-gap-future rx-gap-future--none">
            <header>Do nothing</header>
            <ul>
              {isRest ? (
                <>
                  <li>Kitchen overload</li>
                  <li>Longer waits</li>
                  <li>Inventory pressure</li>
                  <li>Higher refund risk</li>
                </>
              ) : (
                <>
                  <li>Late readiness</li>
                  <li>Arrival friction</li>
                  <li>Guest complaints</li>
                  <li>Exposed revenue</li>
                </>
              )}
            </ul>
          </article>
          <article className="rx-gap-future rx-gap-future--act">
            <header>
              <FrozenRadrLogo variant="mark" theme="dark" width={14} decorative />
              {isRest ? "Pace 12 min" : "Reassign 2"}
            </header>
            <ul>
              {isRest ? (
                <>
                  <li>Service stabilizes</li>
                  <li>Throughput protected</li>
                  <li>
                    <strong>{r.expectedFormatted} expected</strong>
                  </li>
                  <li>{r.confidencePct}% confidence</li>
                </>
              ) : (
                <>
                  <li>Readiness recovers</li>
                  <li>Arrival wave absorbed</li>
                  <li>
                    <strong>{h.exposureFormatted} protected</strong>
                  </li>
                  <li>79% confidence</li>
                </>
              )}
            </ul>
          </article>
        </div>

        <div className="rx-gap-flow-topline">
          <span>{isRest ? r.decisionId : "D-H-9201"}</span>
          <span className="rx-gap-flow-badge">Recommendation</span>
        </div>
        <strong className="rx-gap-flow-action">
          {isRest ? r.actionCompact : "Reassign 2 housekeepers"}
        </strong>
        <em>
          {isRest ? r.displayName : h.displayName} ·{" "}
          {isRest ? r.clockLine : h.clockLine}
        </em>
      </div>
    </div>
  );
}
