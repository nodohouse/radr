"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";

type Tab = "restaurant" | "hotel" | "apartment";

const PANELS: Record<
  Tab,
  {
    label: string;
    src: string;
    pos: string;
    problem: string;
    outcomeLabel: string;
    outcome: number;
    lifecycle?: string;
  }
> = {
  restaurant: {
    label: "Restaurant",
    src: "",
    pos: "50% 40%",
    problem: "Obvious: seat walk-ins · RADR: wait 12 minutes",
    outcomeLabel: "After service · Verified · D-1911",
    outcome: CANON_PEAK.actualProtectedEuro,
    lifecycle: "18:42 Decision → 21:30 Observed → Next day Verified",
  },
  hotel: {
    label: "Hotel",
    src: "",
    pos: "55% 40%",
    problem: "Channel economics under occupancy",
    outcomeLabel: "Verified protected · D-2201",
    outcome: CANON_OTA.actualProtectedEuro,
  },
  apartment: {
    label: "Aparthotels",
    src: "",
    pos: "50% 50%",
    problem: "Orphan night still recoverable",
    outcomeLabel: "Verified recovered · incremental",
    outcome: verifiedEuro(CANON_ORPHAN),
  },
};

/**
 * Scene 06 — immersive vertical panels → close.
 * Verified euros live on each vertical panel — no orphan portfolio vanity total.
 */
export function SectionFinalEngine() {
  const [tab, setTab] = useState<Tab>("restaurant");
  const panel = PANELS[tab];

  return (
    <section
      className="rx-vert-panels"
      data-nav-theme="light"
      id="close"
    >
      <div className="rx-shell">
        <header className="rx-cinema-head">
          <p className="rx-cinema-kicker">Across hospitality</p>
          <h2 className="rx-cinema-title">
            Different operations.
            <br />
            Same decision loop.
          </h2>
        </header>

        <div className="rx-vert-panels-rail" role="tablist">
          {(Object.keys(PANELS) as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              data-on={tab === id ? "true" : "false"}
              onClick={() => setTab(id)}
            >
              {PANELS[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="rx-vert-panels-stage" key={tab}>
        <Image
          src={panel.src}
          alt=""
          fill
          sizes="100vw"
          className="rx-vert-panels-img"
          style={{ objectPosition: panel.pos }}
        />
        <div className="rx-vert-panels-veil" />
        <div className="rx-shell rx-vert-panels-copy">
          <p className="rx-vert-panels-problem">{panel.problem}</p>
          {panel.lifecycle ? (
            <p className="rx-vert-panels-life">{panel.lifecycle}</p>
          ) : null}
          <p className="rx-vert-panels-outcome">
            <em>{panel.outcomeLabel}</em>
            <strong className="rx-econ-verified">
              {formatDecisionMoney(panel.outcome)}
            </strong>
          </p>
        </div>
      </div>

      <div className="rx-shell">
        <p className="rx-vert-panels-ledger">
          Each figure is one Decision after the night — not a portfolio vanity
          total.{" "}
          <NextLink href="/product/value">See Verified Value →</NextLink>
        </p>

        <div className="rx-vert-panels-cta">
          <h3>Put your operation on RADR.</h3>
          <div className="rx-ctas">
            <NextLink href="/demo" className="rx-btn rx-btn-primary">
              {CTAS.primaryProduct} <span aria-hidden="true">→</span>
            </NextLink>
            <Link href="/contact" className="rx-btn rx-btn-ghost">
              {CTAS.primarySales}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
