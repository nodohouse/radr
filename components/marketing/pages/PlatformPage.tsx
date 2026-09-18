"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import {
  CANON_ORPHAN,
  CANON_OTA,
  CANON_PEAK,
  canonScenario,
  expectedMetricLabel,
  formatCanonVariance,
  observedMetricLabel,
  verifiedEuro,
  verifiedMetricLabel,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/editorial.css";
import "@/app/econ.css";

const STAGES = [
  "CONNECT",
  "UNDERSTAND",
  "FUTURES",
  "DECIDE",
  "VERIFY",
  "REMEMBER",
] as const;

type Stage = (typeof STAGES)[number];
type VerticalId = "hotel" | "restaurant" | "aparthotel";

type TruthRow = { cat: string; val: string };

type VerticalConfig = {
  id: VerticalId;
  label: string;
  canon: CanonDecision;
  heroImg: string;
  heroPos: string;
  floorImg: string;
  floorPos: string;
  truth: TruthRow[];
  state: { label: string; val: string }[];
  stateNote: string;
  obviousScenarioId: string;
};

const VERTICALS: VerticalConfig[] = [
  {
    id: "hotel",
    label: "HOTEL",
    canon: CANON_OTA,
    heroImg: "/demo/facilities/canal-deluxe-king.jpg",
    heroPos: "55% 40%",
    floorImg: "/demo/facilities/canal-suite.jpg",
    floorPos: "50% 45%",
    truth: [
      { cat: "OCCUPANCY", val: "89% · event weekend" },
      { cat: "CHANNEL", val: "OTA +11 pts" },
      { cat: "ROOM INVENTORY", val: "4 premium open" },
      { cat: "PICKUP", val: "Direct ahead" },
      { cat: "HOUSEKEEPING", val: "Premium ready" },
      { cat: "EVENTS", val: "Weekend inbound" },
      { cat: "HISTORY", val: "73% direct fill" },
    ],
    state: [
      { label: "Occupancy ↔ premium block", val: "89% load · 4 keys held direct" },
      { label: "Channel mix ↔ direct fill", val: "OTA +11 pts · 73% hist. fill" },
      { label: "Housekeeping ↔ arrival wave", val: "Premium ready · 15:00 check-in" },
      { label: "PMS ↔ channel manager", val: "Mix drift · commission path open" },
      { label: "Decision emerging", val: `${CANON_OTA.displayId} · hold vs release` },
    ],
    stateNote:
      "One living hotel operation: inventory, channel economics, and readiness move together — not four isolated chips.",
    obviousScenarioId: "do_nothing",
  },
  {
    id: "restaurant",
    label: "RESTAURANT",
    canon: CANON_PEAK,
    heroImg: "/demo/facilities/berlin-dining.jpg",
    heroPos: "48% 40%",
    floorImg: "/demo/facilities/berlin-bar.jpg",
    floorPos: "50% 45%",
    truth: [
      { cat: "RESERVATIONS", val: "38 inbound · 22m" },
      { cat: "KDS / TICKETS", val: "14 min ↑" },
      { cat: "KITCHEN", val: "92% capacity" },
      { cat: "DELIVERY", val: "+31% vs plan" },
      { cat: "MENU ECONOMICS", val: "Fast dish €/min ↑" },
      { cat: "TABLE TURNS", val: "9 second-turn at risk" },
      { cat: "FLOOR", val: "78% · walk-ins waiting" },
    ],
    state: [
      { label: "Floor occupancy", val: "78%" },
      { label: "Kitchen load", val: "92%" },
      { label: "Inbound covers", val: "38 · 22m" },
      { label: "Vs seat-now", val: "+€620 wait" },
    ],
    stateNote:
      "Empty tables look like capacity — inbound covers + kitchen load say wait.",
    obviousScenarioId: "seat_now",
  },
  {
    id: "aparthotel",
    label: "APARTHOTEL",
    canon: CANON_ORPHAN,
    heroImg: "/demo/facilities/lisbon-studio.jpg",
    heroPos: "50% 50%",
    floorImg: "/demo/facilities/lisbon-onebed.jpg",
    floorPos: "52% 48%",
    truth: [
      { cat: "UNIT INVENTORY", val: "Unit 24 · 1 night gap" },
      { cat: "FILL", val: "64% hist." },
      { cat: "TURNOVER", val: "Cleaning absorbed" },
      { cat: "COMP SET", val: "Mid-week soft" },
      {
        cat: "DIRECT",
        val: `€${CANON_ORPHAN.recommendedRateEuro} recommended rate`,
      },
      { cat: "OTA", val: "Early discount open" },
      { cat: "HISTORY", val: "17 orphans" },
    ],
    state: [
      {
        label: "Orphan opportunity",
        val: `${formatDecisionMoney(CANON_ORPHAN.exposureEuro)} exposed`,
      },
      {
        label: "Discount · expected net contribution",
        val: formatDecisionMoney(
          CANON_ORPHAN.scenarios.find((s) => s.id === "discount_128")
            ?.expectedContributionEuro ?? 78,
        ),
      },
      {
        label: "Wait · expected net contribution",
        val: formatDecisionMoney(CANON_ORPHAN.expectedProtectedEuro),
      },
      {
        label: "Recommended rate",
        val: `€${CANON_ORPHAN.recommendedRateEuro}`,
      },
    ],
    stateNote:
      "Discount now fills fast — wait-then-direct often wins on comparable orphans.",
    obviousScenarioId: "discount_128",
  },
];

/**
 * Platform — one living operating environment transforms through six stages.
 */
export function PlatformPage() {
  const [vertical, setVertical] = useState<VerticalId>("hotel");
  const [stage, setStage] = useState<Stage>("CONNECT");
  const env = useMemo(
    () => VERTICALS.find((v) => v.id === vertical) ?? VERTICALS[0]!,
    [vertical],
  );
  const d = env.canon;
  const obvious = canonScenario(d, env.obviousScenarioId)!;
  const chosen = canonScenario(d, d.chosenScenarioId)!;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-plat-live">
        <section className="rx-plat-live-hero rx-plat-live-hero-light" data-nav-theme="light">
          <div className="rx-shell rx-plat-live-hero-copy">
            <p className="rx-cinema-kicker">Platform</p>
            <h1>
              One Decision.
              <br />
              From first signal to lasting memory.
            </h1>
            <p>
              Systems record what happened. RADR determines what matters, what
              the alternatives are, what should happen next, and whether the
              outcome was worth it.
            </p>
            <ol className="rx-plat-lifecycle" aria-label="Decision lifecycle">
              {[
                "Detected",
                "Understood",
                "Futures",
                "Recommended",
                "Approved",
                "Observed",
                "Verified",
                "Learned",
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-plat-live-body" data-nav-theme="light">
          <div className="rx-shell">
            <div
              className="rx-plat-stage-rail"
              role="tablist"
              aria-label="Operating environment"
            >
              {VERTICALS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={vertical === v.id}
                  data-on={vertical === v.id ? "true" : "false"}
                  onClick={() => setVertical(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div
              className="rx-plat-stage-rail"
              role="tablist"
              aria-label="How RADR thinks"
            >
              {STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={stage === s}
                  data-on={stage === s ? "true" : "false"}
                  onClick={() => setStage(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="rx-plat10-muted" style={{ margin: "0.75rem 0 1.25rem" }}>
              {d.displayId} persists through Detected → Understood → Simulated →
              Recommended → Approved → Observed → Verified → Learned. The object
              stays the same.
            </p>

            <article
              className="rx-plat-live-op"
              data-stage={stage}
              data-vertical={vertical}
            >
              <div className="rx-plat-live-floor" aria-hidden="true">
                <Image
                  src={env.floorImg}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 70vw"
                  className="rx-plat-live-floor-img"
                  style={{ objectPosition: env.floorPos }}
                  key={env.floorImg}
                />
                <div className="rx-plat-live-floor-veil" />
                <div className="rx-plat-live-lens" />
              </div>

              <div className="rx-plat-live-readout" key={`${vertical}-${stage}`}>
                {stage === "CONNECT" ? (
                  <>
                    <em>Multi-system · {d.property}</em>
                    <ul>
                      {env.truth.map((row) => (
                        <li key={row.cat}>
                          <span>{row.cat}</span>
                          <strong>{row.val}</strong>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {stage === "UNDERSTAND" ? (
                  <>
                    <em>
                      {vertical === "hotel"
                        ? `${d.displayId} forming · cross-system relationships`
                        : "Relationships · not one metric"}
                    </em>
                    <ul>
                      {env.state.map((row) => (
                        <li key={row.label}>
                          <span>{row.label}</span>
                          <strong>{row.val}</strong>
                        </li>
                      ))}
                    </ul>
                    <span>{env.stateNote}</span>
                  </>
                ) : null}

                {stage === "FUTURES" ? (
                  <>
                    <em>Three trajectories · cost & pressure</em>
                    <div className="rx-plat-live-paths">
                      {d.scenarios.map((s) => (
                        <p
                          key={s.id}
                          data-rec={s.recommended ? "true" : undefined}
                        >
                          <span>
                            {s.title} · {s.note}
                          </span>
                          <strong>
                            {formatDecisionMoney(s.expectedContributionEuro ?? 0)}
                          </strong>
                        </p>
                      ))}
                    </div>
                  </>
                ) : null}

                {stage === "DECIDE" ? (
                  <>
                    <em>
                      {vertical === "hotel"
                        ? `${d.displayId} · ${d.title}`
                        : "Conflict · then selection"}
                    </em>
                    <span>
                      Obvious: {obvious.title} ·{" "}
                      {formatDecisionMoney(obvious.expectedContributionEuro ?? 0)} expected ·{" "}
                      {obvious.note}
                    </span>
                    <strong className="rx-plat-live-big">{chosen.title}</strong>
                    <span>
                      {formatDecisionMoney(d.expectedProtectedEuro)}{" "}
                      {expectedMetricLabel(d).toLowerCase()} · {chosen.note}
                    </span>
                  </>
                ) : null}

                {stage === "VERIFY" ? (
                  <>
                    <em>After the window · DEMO · ILLUSTRATIVE</em>
                    <dl className="rx-plat-live-reality">
                      <div>
                        <dt>{expectedMetricLabel(d)}</dt>
                        <dd>{formatDecisionMoney(d.expectedProtectedEuro)}</dd>
                      </div>
                      {d.observedContributionEuro != null ? (
                        <div>
                          <dt>{observedMetricLabel(d)}</dt>
                          <dd>
                            {formatDecisionMoney(d.observedContributionEuro)}
                          </dd>
                        </div>
                      ) : null}
                      <div>
                        <dt>{verifiedMetricLabel(d)}</dt>
                        <dd className="rx-plat-live-big rx-econ-verified">
                          {formatDecisionMoney(verifiedEuro(d))}
                        </dd>
                      </div>
                    </dl>
                    <span>
                      {d.attributionStrength.replaceAll("_", " ").toLowerCase()}{" "}
                      · variance {formatCanonVariance(d)}
                      {d.counterfactualContributionEuro != null
                        ? ` · vs counterfactual ${formatDecisionMoney(d.counterfactualContributionEuro)}`
                        : null}
                      {d.learning.actualConversionPct != null
                        ? ` · substitute ${d.learning.actualConversionPct}%`
                        : null}
                    </span>
                  </>
                ) : null}

                {stage === "REMEMBER" ? (
                  <>
                    <em>Playbook updated</em>
                    <strong className="rx-plat-live-big">
                      {d.learning.playbookFrom} → {d.learning.playbookTo}
                    </strong>
                    <span>{d.learning.lesson}</span>
                  </>
                ) : null}
              </div>
            </article>

            <div className="rx-ch-ctas">
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </NextLink>
              <Link href="/product/decisions" className="rx-btn rx-btn-ghost">
                Decisions
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
