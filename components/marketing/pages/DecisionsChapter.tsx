"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import {
  CANON_OTA,
  formatCanonVariance,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/econ.css";

const ACTS = [
  {
    id: "problem",
    label: "Act 1 · The problem",
    visual: "/demo/facilities/canal-deluxe-king.jpg",
    line: "89% full looks like pricing power. The obvious move is release the last premium keys to OTA.",
    econ: `${formatDecisionMoney(CANON_OTA.exposureEuro)} channel exposure · ${CANON_OTA.displayId}`,
  },
  {
    id: "options",
    label: "Act 2 · Three plausible moves",
    visual: "/demo/facilities/canal-suite.jpg",
    line: "",
    econ: "Fill vs ADR vs direct mix — not one lever",
  },
  {
    id: "call",
    label: "Act 3 · RADR selects",
    visual: "/demo/facilities/canal-classic-queen.jpg",
    line: "Hold 4 premium direct 72h — not raise rate or OTA dump.",
    econ: `${formatDecisionMoney(CANON_OTA.expectedProtectedEuro)} expected protected · channel hold prepared`,
  },
  {
    id: "happened",
    label: "Act 4 · What happened",
    visual: "/demo/facilities/canal-suite.jpg",
    line: "Direct filled inside the window. OTA share held. Housekeeping block stayed clean.",
    econ: `${formatDecisionMoney(CANON_OTA.actualProtectedEuro)} verified protected · ${formatCanonVariance(CANON_OTA)} vs expected`,
  },
  {
    id: "learned",
    label: "Act 5 · What RADR learned",
    visual: "/demo/facilities/canal-deluxe-king.jpg",
    line: CANON_OTA.learning.lesson,
    econ: `${CANON_OTA.learning.playbookFrom} → ${CANON_OTA.learning.playbookTo}`,
  },
] as const;

/**
 * Decisions — one Decision as a storyboard film strip.
 */
export function DecisionsChapter() {
  const [act, setAct] = useState(0);
  const d = CANON_OTA;
  const current = ACTS[act]!;

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
          <p className="rx-plat10-lead" style={{ marginTop: "1rem" }}>
            A system of decision record for hospitality — judgment that survives
            from detection through verification and memory.
          </p>
          <div className="rx-ch-econ-row rx-dec-arc">
            <div>
              <strong className="rx-econ-risk">
                {formatDecisionMoney(d.exposureEuro)}
              </strong>
              <em className="rx-econ-deadline">EXPOSED</em>
            </div>
            <span className="rx-dec-arc-arrow" aria-hidden="true">
              →
            </span>
            <div>
              <strong className="rx-econ-verified">
                {formatDecisionMoney(d.actualProtectedEuro)}
              </strong>
              <em className="rx-econ-deadline">VERIFIED PROTECTED</em>
              <span className="rx-plat10-muted" style={{ display: "block", marginTop: "0.25rem" }}>
                {formatCanonVariance(d)} vs expected
              </span>
            </div>
          </div>
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

          <article className="rx-dec-strip" key={current.id}>
            <div className="rx-dec-strip-photo">
              <Image
                src={current.visual}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                style={{ objectFit: "cover", objectPosition: "50% 40%" }}
              />
              <div className="rx-dec-strip-veil" />
            </div>
            <div className="rx-dec-strip-copy">
              <em>{current.label}</em>
              {current.id === "options" ? (
                <>
                  <strong>Three viable moves</strong>
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
                        {s.value ? (
                          <em style={{ display: "block", marginTop: "0.2rem", fontSize: "0.7rem", color: "#626a65", fontStyle: "normal" }}>
                            {s.value.label}
                          </em>
                        ) : null}
                      </p>
                    ))}
                  </div>
                  <span>
                    Release to OTA looks like fill — but €0 here means €0
                    incremental vs the hold path, not €0 room revenue. Hold
                    direct wins on expected protected contribution and mix.
                  </span>
                </>
              ) : (
                <>
                  <strong>{current.line}</strong>
                  <span>{current.econ}</span>
                </>
              )}
              {current.id === "call" ? (
                <span>
                  RADR selects Hold 4 premium direct 72h because occupancy is not
                  the same as channel quality — the answer was not a rate lift.
                </span>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="rx-ch-body" data-nav-theme="light">
        <div className="rx-shell">
          <h2 className="rx-ch-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
            The Decision didn&apos;t end when the manager clicked Approve.
          </h2>
          <p className="rx-plat10-lead">
            RADR kept watching. Then actual outcome. Then Verified Value. Then
            memory.
          </p>
          <ol className="rx-why-spine" style={{ marginBottom: "1.5rem" }}>
            {[
              "Evidence",
              "Baseline",
              "Scenarios",
              "Operator context",
              "Choice",
              "Action",
              "Outcome",
              "Value",
              "Lesson",
            ].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="rx-ch-ctas">
            <NextLink href="/product/memory" className="rx-btn rx-btn-primary">
              Operating Memory <span aria-hidden="true">→</span>
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
