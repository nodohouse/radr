"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_MENU_PEAK,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

type RailItem = {
  id: string;
  displayId: string;
  action: string;
  place: string;
  econ: string;
  econLabel: string;
  why: string;
  href: string;
};

const ITEMS: RailItem[] = [
  {
    id: "peak",
    displayId: CANON_PEAK.displayId,
    action: "WAIT 12 MINUTES",
    place: "Berlin · Restaurant",
    econ: formatDecisionMoney(CANON_PEAK.expectedProtectedEuro),
    econLabel: "Expected incremental contribution",
    why: "Kitchen 92% · 38 covers inbound · second turns dominate seat-now economics.",
    href: "/demo",
  },
  {
    id: "ota",
    displayId: CANON_OTA.displayId,
    action: "HOLD 4 PREMIUM ROOMS DIRECT",
    place: "Amsterdam · Hotel",
    econ: formatDecisionMoney(CANON_OTA.actualProtectedEuro),
    econLabel: "Verified protected",
    why: "Direct pickup ahead · OTA share elevated · premium scarcity.",
    href: "/demo",
  },
  {
    id: "orphan",
    displayId: CANON_ORPHAN.displayId,
    action: "WAIT 24 HOURS",
    place: "Lisbon · Serviced apartments",
    econ: formatDecisionMoney(verifiedEuro(CANON_ORPHAN)),
    econLabel: "Verified recovered",
    why: "Orphan night · direct often fills inside 48h · low-quality fill destroys option value.",
    href: "/demo",
  },
  {
    id: "menu",
    displayId: CANON_MENU_PEAK.displayId,
    action: "THIS STAR HURTS AT PEAK",
    place: "Berlin · Menu",
    econ: "−18%",
    econLabel: "Contribution / kitchen minute vs peers",
    why: "At 19:00–20:30, Tuna Tataki consumes the scarce cold-station minute.",
    href: "/app/intelligence/menu",
  },
];

/**
 * Slow editorial Decision gallery — not a news ticker.
 */
export function SectionDecisionRail() {
  const [paused, setPaused] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const loop = [...ITEMS, ...ITEMS];

  return (
    <section className="rx-dec-rail" data-nav-theme="light" aria-label="Decision gallery">
      <div className="rx-dec-rail-head">
        <p className="rx-dec-rail-kicker">Decisions in motion</p>
        <h2 className="rx-dec-rail-title">
          The operation moves.
          <br />
          RADR stays calm.
        </h2>
      </div>

      <div
        className="rx-dec-rail-track-wrap"
        data-paused={paused || openId ? "true" : undefined}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          setOpenId(null);
        }}
      >
        <div className="rx-dec-rail-track">
          {loop.map((item, i) => (
            <NextLink
              key={`${item.id}-${i}`}
              href={item.href}
              className="rx-dec-rail-card"
              data-open={openId === `${item.id}-${i}` ? "true" : undefined}
              onFocus={() => {
                setPaused(true);
                setOpenId(`${item.id}-${i}`);
              }}
              onBlur={() => {
                setOpenId(null);
                setPaused(false);
              }}
              onMouseEnter={() => setOpenId(`${item.id}-${i}`)}
            >
              <span className="rx-dec-rail-id">{item.displayId}</span>
              <strong className="rx-dec-rail-action">{item.action}</strong>
              <p className="rx-dec-rail-meta">{item.place}</p>
              <div className="rx-dec-rail-econ">
                <strong>{item.econ}</strong>
                <span>{item.econLabel}</span>
              </div>
              <p className="rx-dec-rail-why">{item.why}</p>
            </NextLink>
          ))}
        </div>
      </div>
    </section>
  );
}
