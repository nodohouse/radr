"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  CANON_ORPHAN,
  CANON_OTA,
  CANON_PEAK,
  canonChosen,
  expectedMetricLabel,
  formatScenarioEuro,
  scenarioMetricCaption,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/econ.css";

type Vertical = "hotel" | "restaurant" | "aparthotel";

const WORLDS: Record<
  Vertical,
  {
    label: string;
    canon: CanonDecision;
    image: string;
    unit: string;
    constraint: string;
  }
> = {
  hotel: {
    label: "Hotel",
    canon: CANON_OTA,
    image: "/demo/facilities/canal-deluxe-king.jpg",
    unit: "Room night",
    constraint: "Brand rate · channel contract · housekeeping readiness",
  },
  restaurant: {
    label: "Restaurant",
    canon: CANON_PEAK,
    image: "/demo/facilities/berlin-dining.jpg",
    unit: "Service / covers",
    constraint: "Inbound covers · kitchen capacity · delivery · table turns",
  },
  aparthotel: {
    label: "Aparthotel",
    canon: CANON_ORPHAN,
    image: "/demo/facilities/lisbon-onebed.jpg",
    unit: "Unit night",
    constraint: "Min profitable rate · cleaning · next-stay turnover",
  },
};

/**
 * Public interactive demo — no login. Matches the marketing promise.
 */
export function SeeHowDemo() {
  const [vertical, setVertical] = useState<Vertical>("hotel");
  const world = WORLDS[vertical];
  const d = world.canon;
  const chosen = canonChosen(d);

  const scenarios = useMemo(
    () =>
      d.scenarios.map((s) => ({
        ...s,
        money: formatScenarioEuro(s),
        metricCaption: scenarioMetricCaption(s),
      })),
    [d],
  );

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-demo-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">Interactive demo</p>
            <h1 className="rx-ch-title">
              See how RADR decides.
              <br />
              Then add what only you know.
            </h1>
            <p className="rx-demo-lead">
              System evidence first. Operator context second. Feasible futures
              only. No login — illustrative DEMO.
            </p>

            <div className="rx-demo-tabs" role="tablist" aria-label="Vertical">
              {(Object.keys(WORLDS) as Vertical[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={vertical === id}
                  data-on={vertical === id ? "true" : undefined}
                  onClick={() => setVertical(id)}
                >
                  {WORLDS[id].label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell rx-demo-grid">
            <div className="rx-demo-scene">
              <Image
                src={world.image}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                className="rx-demo-scene-img"
                style={{ objectPosition: "50% 42%" }}
              />
              <div className="rx-demo-scene-veil" />
              <div className="rx-demo-scene-copy">
                <em>
                  {d.displayId} · {world.unit}
                </em>
                <strong>{d.property}</strong>
                <p>{d.problemLine}</p>
              </div>
            </div>

            <aside className="rx-demo-panel">
              <p className="rx-demo-kicker">System evidence</p>
              <ul className="rx-demo-evidence">
                {d.evidence.map((e) => (
                  <li key={e.label}>
                    <span>{e.label}</span>
                    <strong>{e.value}</strong>
                  </li>
                ))}
              </ul>

              <p className="rx-demo-kicker">Constraints</p>
              <p className="rx-demo-constraint">{world.constraint}</p>

              <p className="rx-demo-kicker">Futures</p>
              <ul className="rx-demo-futures">
                {scenarios.map((s) => (
                  <li
                    key={s.id}
                    data-rec={s.recommended ? "true" : undefined}
                    data-base={s.isNoAction ? "true" : undefined}
                  >
                    <div>
                      <strong>{s.title}</strong>
                      <span>{s.note}</span>
                    </div>
                    <em>
                      {s.money}
                      <small>{s.metricCaption}</small>
                    </em>
                  </li>
                ))}
              </ul>

              {d.recommendedRateEuro ? (
                <p className="rx-demo-rate">
                  Recommended rate {formatDecisionMoney(d.recommendedRateEuro)} ·
                  not Verified Value
                </p>
              ) : null}

              <div className="rx-demo-rec">
                <em>RADR recommends</em>
                <strong>{chosen.title}</strong>
                <span>
                  {expectedMetricLabel(d)}{" "}
                  {formatDecisionMoney(d.expectedProtectedEuro)}
                </span>
              </div>

              <p className="rx-demo-judgment">
                A {vertical === "restaurant" ? "chef" : "GM"} may still add
                context the systems do not hold. RADR re-simulates — it does not
                argue.
              </p>

              <div className="rx-ch-ctas">
                <NextLink href="/contact" className="rx-btn rx-btn-primary">
                  {CTAS.primarySales} <span aria-hidden="true">→</span>
                </NextLink>
                <NextLink href="/product" className="rx-btn rx-btn-ghost">
                  Platform
                </NextLink>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
