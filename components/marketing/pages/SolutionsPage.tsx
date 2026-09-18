"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { money, CANON_OTA } from "@/data/demo";
import {
  INTELLIGENCE_CROSS_DOMAIN,
  OPERATING_STATE_BESTSELLER,
  OPERATING_STATES,
  TERRITORY_ROUTE,
  narrativeFor,
  type TerritoryRouteId,
} from "@/data/demo/intelligence";
import {
  HONESTY_LABEL,
  INTELLIGENCE_PRINCIPLE,
  TERRITORY_DEFINITIONS,
} from "@/lib/radr/intelligence";
import type { CanonDecision } from "@/lib/radr/decision/demo/canonical";
import { IntelFuturesFork } from "./IntelFuturesFork";
import { IntelProblemClasses } from "./IntelProblemClasses";
import { ValueLeaksNarratives } from "./ValueLeaksNarratives";
import "@/app/econ.css";
import "@/app/home.css";
import "@/app/intelligence.css";
import "@/app/motion.css";

const LENS_ORDER: TerritoryRouteId[] = ["buy", "labor", "sell", "recover"];

function EvidencePanel({ decision }: { decision: CanonDecision }) {
  const [open, setOpen] = useState(false);
  const baseline = decision.scenarios.find((s) => s.isNoAction);
  const n = narrativeFor(decision);

  return (
    <div className="rx-intel-evidence">
      <button
        type="button"
        className="rx-intel-ev-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "Hide evidence" : "WHY · EVIDENCE"}
      </button>

      {open ? (
        <div className="rx-intel-ev-panel">
          <ul className="rx-intel-sources">
            {decision.sources.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <span>{s.freshness}</span>
              </li>
            ))}
          </ul>
          <div className="rx-intel-ev-meta">
            {decision.evidenceCoverage ? (
              <span>Coverage {decision.evidenceCoverage}</span>
            ) : null}
            <span>Confidence {decision.decisionConfidence}</span>
            <span>{HONESTY_LABEL[decision.honesty]}</span>
          </div>
          <div className="rx-intel-contract">
            <p>
              <em>Looked normal</em>
              {n.lookedNormal}
            </p>
            <p>
              <em>Why incomplete</em>
              {n.climax}
            </p>
            <p>
              <em>Baseline</em>
              {baseline
                ? `${baseline.title} · ${money(baseline.expectedContributionEuro ?? 0)}`
                : "Do nothing modeled"}
            </p>
            <p>
              <em>Verify</em>
              Expected {money(n.expectedEuro)} · observed {money(n.observedEuro)}{" "}
              · verified {money(n.verifiedEuro)}
            </p>
          </div>
          <p className="rx-intel-demo">
            Illustrative product data. Numbers from the model — not chat.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Resting composition — product sells Decisions, not observations. */
function DecisionClimax({
  decision,
  dark = false,
}: {
  decision: CanonDecision;
  dark?: boolean;
}) {
  const n = narrativeFor(decision);
  const chosen =
    decision.scenarios.find((s) => s.id === decision.chosenScenarioId) ??
    decision.scenarios.find((s) => s.recommended);

  return (
    <div className="rx-intel-climax" data-theme={dark ? "dark" : "light"}>
      <div className="rx-intel-obvious">
        <em>The obvious move</em>
        <strong>{n.obvious}</strong>
      </div>

      <div className="rx-intel-radr-counter">
        <em>RADR</em>
        <strong>{n.climax}</strong>
        <span>{n.radrLine}</span>
      </div>

      <div className="rx-intel-rest">
        <p className="rx-intel-k">
          What RADR recommends
          <span>{decision.displayId}</span>
        </p>
        <p className="rx-intel-rest-what">
          {chosen?.title ?? decision.prepared}
        </p>
        <ul className="rx-intel-rest-meta">
          <li>
            <em>Expected contribution impact</em>
            <strong>
              +{money(n.expectedEuro)}
              <i>range · illustrative</i>
            </strong>
          </li>
          <li>
            <em>Decision deadline</em>
            <strong>{n.deadline}</strong>
          </li>
          <li>
            <em>Confidence</em>
            <strong>{decision.decisionConfidence}</strong>
          </li>
        </ul>
      </div>

      <div className="rx-intel-verify-ledger" aria-label="Verify and learn">
        <div>
          <em>Expected</em>
          <strong>+{money(n.expectedEuro)}</strong>
        </div>
        <div>
          <em>Observed</em>
          <strong>+{money(n.observedEuro)}</strong>
        </div>
        <div data-hot="true">
          <em>Verified</em>
          <strong>+{money(n.verifiedEuro)}</strong>
        </div>
        <div data-learn="true">
          <em>Learning</em>
          <strong>{n.learned}</strong>
        </div>
      </div>

      <div className="rx-intel-rest-actions">
        <EvidencePanel decision={decision} />
        <Link href="/product/futures" className="rx-intel-rest-link">
          SIMULATE
        </Link>
        <span className="rx-intel-rest-link" data-muted="true">
          ADD CONTEXT
        </span>
      </div>
    </div>
  );
}

function LensChoreography({ id }: { id: TerritoryRouteId }) {
  if (id === "buy") {
    return (
      <div className="rx-intel-docs" aria-hidden="true">
        <div className="rx-intel-doc" data-doc="contract">
          <em>Contract</em>
          <strong>€6.80 / L</strong>
        </div>
        <div className="rx-intel-doc" data-doc="invoice">
          <em>Invoice</em>
          <strong>€7.45 / L</strong>
        </div>
        <div className="rx-intel-doc" data-doc="delivery">
          <em>Delivery</em>
          <strong>420 L</strong>
        </div>
        <div className="rx-intel-doc" data-doc="usage">
          <em>Usage</em>
          <strong>+4%</strong>
        </div>
        <div className="rx-intel-doc" data-doc="menu">
          <em>Contribution</em>
          <strong>−13.2%</strong>
        </div>
        <div className="rx-intel-cause-split">
          <div>
            <em>Price effect</em>
            <strong>€273</strong>
            <span>Current supplier variance</span>
          </div>
          <div>
            <em>Usage effect</em>
            <strong>+4%</strong>
            <span>Additional contribution pressure</span>
          </div>
        </div>
        <p className="rx-intel-buy-climax">
          The invoice was the clue.
          <span>The margin leak was the problem.</span>
        </p>
      </div>
    );
  }
  if (id === "labor") {
    return (
      <div className="rx-intel-labor-story" aria-hidden="true">
        <div className="rx-intel-instinct">
          <em>Manager instinct</em>
          <strong>Add FOH</strong>
        </div>
        <div className="rx-intel-flow">
          <span>Demand</span>
          <em>→</em>
          <span>More FOH</span>
          <em>→</em>
          <span>Order injection</span>
          <em>→</em>
          <span data-hot="true">Kitchen 94%</span>
          <em>→</em>
          <span>Longer tickets</span>
        </div>
        <p className="rx-intel-labor-point">
          RADR optimizes the bottleneck — not headcount.
        </p>
      </div>
    );
  }
  if (id === "sell") {
    return (
      <div className="rx-intel-sell-econ" aria-hidden="true">
        <div className="rx-intel-channels">
          <div data-tone="weak">
            <em>OTA</em>
            <strong>+11 pts</strong>
            <span>Higher-cost demand</span>
          </div>
          <div data-tone="strong">
            <em>Direct</em>
            <strong>Ahead</strong>
            <span>Stronger contribution</span>
          </div>
          <div data-tone="hold">
            <em>Premium</em>
            <strong>4 hold</strong>
            <span>Scarce inventory</span>
          </div>
        </div>
        <div className="rx-intel-path-stacks">
          <div data-tone="weak">
            <em>OTA path · / premium room</em>
            <ul>
              <li>
                Gross room revenue{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.otaPath.grossRoomRevenue}
                </strong>
              </li>
              <li>
                Channel cost{" "}
                <strong>€{CANON_OTA.unitEconomics!.otaPath.channelCost}</strong>
              </li>
              <li>
                Fulfillment{" "}
                <strong>€{CANON_OTA.unitEconomics!.otaPath.fulfillment}</strong>
              </li>
              <li data-result="true">
                Expected contribution / premium room{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.otaPath.expectedContribution}
                </strong>
              </li>
            </ul>
          </div>
          <div data-tone="strong">
            <em>Direct hold path · / premium room</em>
            <ul>
              <li>
                Expected direct rate{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.directPath.expectedRate}
                </strong>
              </li>
              <li>
                Acquisition cost{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.directPath.acquisitionCost}
                </strong>
              </li>
              <li>
                Fulfillment{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.directPath.fulfillment}
                </strong>
              </li>
              <li data-result="true">
                Expected contribution / premium room{" "}
                <strong>
                  €{CANON_OTA.unitEconomics!.directPath.expectedContribution}
                </strong>
              </li>
            </ul>
          </div>
        </div>
        <p className="rx-intel-sell-point">
          Expected protected value{" "}
          <strong>{money(CANON_OTA.expectedProtectedEuro)}</strong>
          {" · "}
          4 premium rooms · 72h · vs OTA release — not 4 × unit delta.
        </p>
        <p className="rx-intel-sell-point">
          Scarce premium + direct pickup + event demand · allocate capacity, don’t
          maximize occupancy.
        </p>
      </div>
    );
  }
  return (
    <div className="rx-intel-clock" aria-hidden="true">
      <div data-t="now">
        <em>Gross night value</em>
        <strong>€164</strong>
        <span>Not net</span>
      </div>
      <div data-t="mid">
        <em>Wait 24h</em>
        <strong>€112</strong>
        <span>Expected net contribution</span>
      </div>
      <div data-t="late">
        <em>Take now</em>
        <strong>€78</strong>
        <span>Expected net contribution</span>
      </div>
      <div data-t="gone">
        <em>Expire</em>
        <strong>€0</strong>
        <span>Gone</span>
      </div>
      <div className="rx-intel-recover-reveal">
        <span>Orphan night</span>
        <span>LOS demand</span>
        <span>Direct arrival</span>
        <span>Channel cost</span>
        <span>Cleaning absorbed</span>
        <span>Next stay</span>
      </div>
      <p className="rx-intel-recover-surprise">
        <em>Obvious</em> Fill it now. <em>RADR</em> Wait.
      </p>
    </div>
  );
}

function LensStory({ routeId }: { routeId: TerritoryRouteId }) {
  const { code, decision } = TERRITORY_ROUTE[routeId];
  const def = TERRITORY_DEFINITIONS[code];
  const state = OPERATING_STATES[routeId];
  const n = narrativeFor(decision);
  const [forward, setForward] = useState(false);
  const [ranked, setRanked] = useState(false);

  return (
    <article
      className="rx-intel-decision"
      data-territory={routeId}
      data-choreography={code.toLowerCase()}
      data-resting={ranked ? "true" : "false"}
    >
      <header className="rx-intel-decision-head">
        <p className="rx-intel-k">
          {decision.territories.join(" · ")}
          <span>{decision.displayId}</span>
        </p>
        <h2 className="rx-intel-q">{def.question}</h2>
        <p className="rx-intel-looked">{n.lookedNormal}</p>
        <p className="rx-intel-state">{state.stateSentence}</p>
      </header>

      {!ranked ? (
        <>
          <div className="rx-intel-choreo">
            <LensChoreography id={routeId} />
          </div>
          <p className="rx-intel-connect">{decision.connect}</p>
        </>
      ) : null}

      {!forward ? (
        <div className="rx-intel-continue">
          <button
            type="button"
            className="rx-btn rx-btn-primary"
            onClick={() => setForward(true)}
          >
            Play it forward
          </button>
        </div>
      ) : !ranked ? (
        <IntelFuturesFork
          decision={decision}
          exposureLabel={
            decision.detectionType === "RECOVERY" ||
            decision.detectionType === "OPPORTUNITY"
              ? "AT STAKE"
              : "EXPOSURE"
          }
          compact
          onRanked={() => setRanked(true)}
        />
      ) : (
        <DecisionClimax decision={decision} />
      )}

      <nav className="rx-intel-lens-nav" aria-label="Other lenses">
        {LENS_ORDER.filter((id) => id !== routeId).map((id) => (
          <Link key={id} href={TERRITORY_ROUTE[id].path} className="rx-intel-lens">
            {TERRITORY_ROUTE[id].code}
          </Link>
        ))}
        <Link href="/solutions" className="rx-intel-lens">
          All lenses
        </Link>
      </nav>
    </article>
  );
}

function CrossDomainHero() {
  const d = INTELLIGENCE_CROSS_DOMAIN;
  const state = OPERATING_STATE_BESTSELLER;
  const n = narrativeFor(d);
  const [forward, setForward] = useState(false);
  const [ranked, setRanked] = useState(false);

  return (
    <section
      className="rx-intel-cross-hero"
      data-nav-theme="dark"
      data-resting={ranked ? "true" : "false"}
    >
      <div className="rx-shell">
        <p className="rx-intel-k">
          {d.territories.join(" · ")}
          <span>
            {d.displayId} · {HONESTY_LABEL[d.honesty]}
          </span>
        </p>
        <p className="rx-intel-looks">Looks healthy.</p>
        <h2 className="rx-intel-cross-title">
          Bestseller
          <em>#1</em>
        </h2>

        {!ranked ? (
          <>
            <ul className="rx-intel-signals">
              <li>
                <em>BUY</em>
                <strong>+8%</strong>
                <span>Input cost</span>
              </li>
              <li>
                <em>LABOR</em>
                <strong>+21%</strong>
                <span>Kitchen time</span>
              </li>
              <li>
                <em>SELL</em>
                <strong>+4 min</strong>
                <span>Ticket delay</span>
              </li>
              <li data-hot="true">
                <em>RESULT</em>
                <strong>−18%</strong>
                <span>Contrib. / min</span>
              </li>
            </ul>

            <p className="rx-intel-punch">
              Your bestseller is costing you during peak.
            </p>
            <p className="rx-intel-state rx-intel-state-quiet">
              {state.stateSentence}
            </p>

            <div className="rx-intel-obvious-inline">
              <em>The obvious move</em>
              <strong>{n.obvious}</strong>
            </div>
          </>
        ) : null}

        {!forward ? (
          <div className="rx-intel-continue">
            <button
              type="button"
              className="rx-btn rx-btn-primary"
              onClick={() => setForward(true)}
            >
              Play it forward
            </button>
            <p className="rx-intel-continue-hint">
              Options vs do nothing · then the Decision
            </p>
          </div>
        ) : !ranked ? (
          <IntelFuturesFork
            decision={d}
            exposureLabel="PEAK EXPOSURE"
            compact
            onRanked={() => setRanked(true)}
          />
        ) : (
          <DecisionClimax decision={d} dark />
        )}
      </div>
    </section>
  );
}

function Breath() {
  return (
    <section className="rx-intel-breath" data-nav-theme="light">
      <div className="rx-shell rx-intel-breath-shell">
        <p className="rx-intel-breath-line">
          Connect what changed.
          <span> Play the options forward.</span>
          <span> Verify what happened.</span>
        </p>
      </div>
    </section>
  );
}

function LensIntro() {
  return (
    <section className="rx-intel-lenses-intro" id="lenses" data-nav-theme="light">
      <div className="rx-shell">
        <p className="rx-intel-k">How RADR interprets the operation</p>
        <h2 className="rx-intel-classes-title">BUY · LABOR · SELL · RECOVER</h2>
        <p className="rx-intel-classes-lead">
          Economic lenses over the same Decision model — demoted below the value
          loss story. Not the first thing prospects see.
        </p>
        <p className="rx-intel-principle">{INTELLIGENCE_PRINCIPLE}</p>
        <ul className="rx-intel-lens-grid">
          {LENS_ORDER.map((id) => {
            const { code, path } = TERRITORY_ROUTE[id];
            const def = TERRITORY_DEFINITIONS[code];
            return (
              <li key={id}>
                <Link href={path} className="rx-intel-lens-card">
                  <em>{code}</em>
                  <strong>{def.definition}</strong>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * Intelligence — where RADR looks for value.
 * Landing: problem classes → how RADR thinks → lenses demoted.
 * Lens routes keep BUY / LABOR / SELL / RECOVER depth.
 */
export function SolutionsPage({
  lens,
}: {
  lens?: TerritoryRouteId;
} = {}) {
  return (
    <div className="radr radr-mineral radr-home rx-intel">
      <SiteNav />
      <main>
        <section className="rx-intel-hero" data-nav-theme="light">
          <div className="rx-intel-hero-atm" aria-hidden="true" />
          <div className="rx-shell rx-intel-hero-inner">
            <p className="rx-intel-category">Intelligence · illustrative</p>
            {lens ? (
              <>
                <h1 className="rx-intel-title">
                  {TERRITORY_ROUTE[lens].code}
                  <br />
                  <span style={{ fontWeight: 500, fontSize: "0.55em" }}>
                    Economic lens
                  </span>
                </h1>
                <p className="rx-intel-lead">
                  {TERRITORY_DEFINITIONS[TERRITORY_ROUTE[lens].code].definition}
                </p>
                <div
                  className="rx-intel-lenses"
                  role="tablist"
                  aria-label="Economic lenses"
                >
                  {LENS_ORDER.map((id) => (
                    <Link
                      key={id}
                      href={TERRITORY_ROUTE[id].path}
                      scroll={false}
                      role="tab"
                      aria-selected={lens === id}
                      className="rx-intel-lens"
                      data-on={lens === id ? "true" : "false"}
                    >
                      {TERRITORY_ROUTE[id].code}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className="rx-intel-title">
                  Where hospitality loses value.
                </h1>
                <p className="rx-intel-lead">
                  <span className="rx-intel-lead-stack">
                    RADR looks for value that is leaking, stuck, misallocated,
                    or about to expire.
                  </span>
                  <span className="rx-intel-lead-follow">
                    You don’t teach RADR what to look for. It already knows the
                    evidence, Decisions, and what counts as Verified.
                  </span>
                </p>
              </>
            )}
          </div>
        </section>

        {lens ? (
          <section className="rx-intel-stage" data-nav-theme="light">
            <div className="rx-shell">
              <LensStory routeId={lens} />
            </div>
          </section>
        ) : (
          <>
            <IntelProblemClasses />
            <ValueLeaksNarratives />
            <Breath />
            <LensIntro />
          </>
        )}

        <section className="rx-intel-cta" data-nav-theme="light">
          <div className="rx-shell">
            <div className="rx-ctas">
              <NextLink
                href="/app/lab/control-center?seed=recover"
                className="rx-btn rx-btn-primary"
              >
                See a recovery Decision <span aria-hidden="true">→</span>
              </NextLink>
              <Link
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-ghost"
              >
                Start a recovery pilot
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/** @deprecated use lens prop */
export type SolutionsTerritoryId = TerritoryRouteId;
