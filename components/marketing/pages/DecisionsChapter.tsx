"use client";

/**
 * Decisions — one persistent Decision object transforms through Acts.
 */

import { useState } from "react";
import NextLink from "next/link";
import {
  CANON_OTA,
  formatCanonVariance,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";

const ACTS = [
  {
    id: "problem",
    label: "Act 1 · Problem",
    grade: "EXPOSED",
    euro: formatDecisionMoney(CANON_OTA.exposureEuro),
    line: "89% full looks like pricing power. The obvious move is release the last premium keys to OTA.",
  },
  {
    id: "options",
    label: "Act 2 · Futures",
    grade: "PATHS OPEN",
    euro: formatDecisionMoney(CANON_OTA.expectedProtectedEuro),
    line: "Fill vs ADR vs direct mix — three viable moves, one recommended.",
  },
  {
    id: "call",
    label: "Act 3 · Selected",
    grade: "RECOMMENDED",
    euro: formatDecisionMoney(CANON_OTA.expectedProtectedEuro),
    line: "Hold 4 premium direct 72h — not raise rate or OTA dump.",
  },
  {
    id: "happened",
    label: "Act 4 · Observed",
    grade: "OBSERVED",
    euro: formatDecisionMoney(CANON_OTA.actualProtectedEuro),
    line: "Direct filled inside the window. OTA share held. Housekeeping block stayed clean.",
  },
  {
    id: "learned",
    label: "Act 5 · Memory",
    grade: "LEARNED",
    euro: formatDecisionMoney(CANON_OTA.actualProtectedEuro),
    line: CANON_OTA.learning.lesson,
  },
] as const;

export function DecisionsChapter() {
  const [act, setAct] = useState(0);
  const d = CANON_OTA;
  const current = ACTS[act]!;
  const sealed = act >= 3;

  return (
    <main className="rx-ch-main">
      <section className="rx-ch-hero" data-nav-theme="light">
        <div className="rx-shell">
          <p className="rx-ch-kicker">
            Platform · Decisions · {CANON_OTA.displayId} · DEMO · ILLUSTRATIVE
          </p>
          <h1 className="rx-ch-title">
            One Decision.
            <br />
            From first signal to lasting memory.
          </h1>
        </div>
      </section>

      <section className="rx-ch-body" data-nav-theme="light">
        <div className="rx-shell">
          <div className="rx-plat-stage-rail" role="tablist">
            {ACTS.map((a, i) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                data-on={act === i ? "true" : "false"}
                aria-selected={act === i}
                onClick={() => setAct(i)}
              >
                {a.label}
              </button>
            ))}
          </div>

          <article
            className="rx-dec-object"
            data-stage={current.id}
            data-sealed={sealed ? "true" : undefined}
            key={current.id}
          >
            <header>
              <em>
                {d.displayId} · {d.property}
              </em>
              <div
                className="rx-euro-chip"
                data-sealed={sealed ? "true" : undefined}
              >
                <strong>{current.euro}</strong>
                <em>{current.grade}</em>
              </div>
            </header>
            <h2>{current.line}</h2>
            {current.id === "options" ? (
              <div className="rx-plat-live-paths">
                {d.scenarios.map((s) => (
                  <p key={s.id} data-rec={s.recommended ? "true" : undefined}>
                    <span>
                      {s.title} · {s.note}
                    </span>
                    <strong>
                      {formatDecisionMoney(s.expectedContributionEuro ?? 0)}
                    </strong>
                  </p>
                ))}
              </div>
            ) : null}
            {current.id === "happened" ? (
              <p className="rx-plat10-muted">
                {formatCanonVariance(d)} vs expected
              </p>
            ) : null}
            {current.id === "learned" ? (
              <p className="rx-plat10-playbook-tag">
                {d.learning.playbookFrom} → {d.learning.playbookTo}
              </p>
            ) : null}
          </article>

          <div className="rx-ch-ctas" style={{ marginTop: "2rem" }}>
            <NextLink href="/product/memory" className="rx-btn rx-btn-primary">
              Operating Memory <span aria-hidden="true">→</span>
            </NextLink>
            <NextLink href="/product/floor" className="rx-btn rx-btn-ghost">
              RADR Floor
            </NextLink>
            <NextLink href="/demo" className="rx-btn rx-btn-ghost">
              {CTAS.primaryProduct}
            </NextLink>
          </div>
        </div>
      </section>
    </main>
  );
}
