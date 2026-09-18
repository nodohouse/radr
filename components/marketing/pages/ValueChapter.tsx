"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { money } from "@/data/demo";
import {
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PLAYBOOK,
  CANON_LABOR,
  CANON_SUPPLIER,
  CANON_CREATED,
  CANON_TABLE,
  CANON_PEAK,
  canonChosen,
  canonScenario,
  formatCanonVariance,
  verifiedEuro,
  type CanonDecision,
} from "@/lib/radr/decision/demo/canonical";
import { demoValueUnderRadr } from "@/lib/radr/decision/economics";
import { CTAS } from "@/lib/marketing/brand";
import { ValueTrace } from "@/components/marketing/kinetic/ValueTrace";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";

const STREAM = [
  { id: "D-1911", kind: "protected", amt: CANON_PEAK.actualProtectedEuro },
  { id: "D-2201", kind: "protected", amt: CANON_OTA.actualProtectedEuro },
  {
    id: "D-3104",
    kind: "recovered",
    amt: CANON_ORPHAN.verifiedIncrementalEuro ?? CANON_ORPHAN.actualProtectedEuro,
  },
  { id: "D-5208", kind: "avoided", amt: CANON_PLAYBOOK.actualProtectedEuro },
  { id: "D-1920", kind: "protected", amt: CANON_LABOR.actualProtectedEuro },
  { id: "D-4102", kind: "recovered", amt: CANON_SUPPLIER.actualProtectedEuro },
  { id: "D-4410", kind: "created", amt: CANON_CREATED.actualProtectedEuro },
  { id: "D-6671", kind: "recovered", amt: CANON_TABLE.actualProtectedEuro },
] as const;

const PROOF_BY_DISPLAY: Record<string, CanonDecision> = {
  "D-1911": CANON_PEAK,
  "D-2201": CANON_OTA,
  "D-3104": CANON_ORPHAN,
  "D-5208": CANON_PLAYBOOK,
  "D-1920": CANON_LABOR,
  "D-4102": CANON_SUPPLIER,
  "D-4410": CANON_CREATED,
  "D-6671": CANON_TABLE,
};

/**
 * Verified Value — provenance stream into a ledger, not KPI boxes.
 */
export function ValueChapter() {
  const value = demoValueUnderRadr();
  const [filter, setFilter] = useState<"all" | "protected">("all");
  const [openId, setOpenId] = useState<string>("D-1911");
  const visible =
    filter === "all" ? STREAM : STREAM.filter((s) => s.kind === "protected");
  const proof = PROOF_BY_DISPLAY[openId];
  const chosen = proof ? canonChosen(proof) : null;
  const counterfactual = proof
    ? proof.scenarios.find((s) => s.isNoAction) ??
      canonScenario(proof, proof.scenarios[1]?.id ?? "")
    : null;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-value-cinema" data-nav-theme="dark">
          <Image
            src="/demo/facilities/canal-deluxe-king.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="rx-value-cinema-img"
            style={{ objectPosition: "55% 35%" }}
          />
          <div className="rx-value-cinema-veil" />
          <div className="rx-shell rx-value-cinema-copy">
            <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
              Verified Value · DEMO PORTFOLIO · ILLUSTRATIVE
            </p>
            <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
              A recommendation is not value.
              <br />
              An expected outcome is not value.
              <br />
              Value is verified after reality.
            </h1>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <ValueTrace
              disclosure="DEMO · ILLUSTRATIVE · not customer results"
              stages={[
                {
                  id: "exposure",
                  label: "Exposure",
                  euro: money(CANON_PEAK.exposureEuro),
                  detail: CANON_PEAK.title,
                },
                {
                  id: "expected",
                  label: "Expected",
                  euro: money(CANON_PEAK.expectedProtectedEuro),
                  detail: "Wait 12 minutes · modeled protected contribution",
                },
                {
                  id: "observed",
                  label: "Observed",
                  euro: money(
                    CANON_PEAK.observedContributionEuro ??
                      CANON_PEAK.actualProtectedEuro,
                  ),
                  detail: "What reality returned",
                },
                {
                  id: "attributed",
                  label: "Attributed",
                  euro: money(verifiedEuro(CANON_PEAK)),
                  detail: `${CANON_PEAK.displayId} · ${formatCanonVariance(CANON_PEAK)}`,
                },
                {
                  id: "verified",
                  label: "Verified",
                  euro: money(verifiedEuro(CANON_PEAK)),
                  detail: "Protected · claim only what you can prove",
                },
              ]}
            />

            <div className="rx-value-ledger" style={{ marginTop: "2rem" }}>
              <strong className="rx-econ-verified">
                {money(value.verifiedEuro)}
              </strong>
              <span>ILLUSTRATIVE DEMO PORTFOLIO · NOT CUSTOMER RESULTS</span>
            </div>

            <div className="rx-value-filters" role="tablist" style={{ marginTop: "1.5rem" }}>
              <button
                type="button"
                data-on={filter === "all" ? "true" : "false"}
                onClick={() => {
                  setFilter("all");
                  setOpenId("D-1911");
                }}
              >
                All
              </button>
              <button
                type="button"
                data-on={filter === "protected" ? "true" : "false"}
                onClick={() => {
                  setFilter("protected");
                  setOpenId("D-1911");
                }}
              >
                Protected
              </button>
            </div>

            <ul className="rx-value-stream" aria-label="Selected verified Decisions">
              {visible.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (PROOF_BY_DISPLAY[s.id]) setOpenId(s.id);
                    }}
                    data-on={s.id === openId && proof ? "true" : undefined}
                  >
                    <em>{s.id}</em>
                    <strong>{money(s.amt)}</strong>
                    <span>{s.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="rx-value-stream-note">
              Selected verified Decisions (sample) — not a sum of the rollup.
            </p>

            {proof && chosen ? (
              <details className="rx-value-proof-details">
                <summary>
                  {proof.displayId} ·{" "}
                  {proof.actualProtectedEuro === 0 &&
                  proof.expectedProtectedEuro === 0
                    ? "OPEN · not yet verified"
                    : `Proof trail · ${money(verifiedEuro(proof))} verified ${proof.verifiedKind}`}
                </summary>
                <div className="rx-value-proof">
                  <ol className="rx-value-investigation">
                    <li>
                      <em>Exposure</em>
                      <strong>{money(proof.exposureEuro)}</strong>
                      <p>{proof.title}</p>
                    </li>
                    <li>
                      <em>Expected</em>
                      <strong>{money(proof.expectedProtectedEuro)}</strong>
                      <p>Modeled outcome of the chosen response</p>
                    </li>
                    <li>
                      <em>Observed</em>
                      <strong>
                        {money(
                          proof.observedContributionEuro ??
                            proof.actualProtectedEuro,
                        )}
                      </strong>
                      <p>What reality returned</p>
                    </li>
                    <li>
                      <em>Verified</em>
                      <strong>{money(verifiedEuro(proof))}</strong>
                      <p>
                        {proof.attributionStrength.replaceAll("_", " ")} · claim
                        only what you can prove
                      </p>
                    </li>
                    <li>
                      <em>Variance</em>
                      <strong>{formatCanonVariance(proof)}</strong>
                      <p>
                        Counterfactual: {counterfactual?.title ?? "Do nothing"}
                      </p>
                    </li>
                  </ol>
                </div>
              </details>
            ) : null}

            <div className="rx-ch-ctas">
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                {CTAS.seeVerified} <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink
                href={`/app/decisions/${proof?.id ?? CANON_OTA.id}`}
                className="rx-btn rx-btn-ghost"
              >
                Open the proof
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
