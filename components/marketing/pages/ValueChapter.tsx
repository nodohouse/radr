"use client";

import { useState } from "react";
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
import { CTAS } from "@/lib/marketing/brand";
import { capabilityBadge } from "@/lib/marketing/capabilityStatus";
import {
  MONEY_D1911_EXPECTED,
  MONEY_D1911_OBSERVED,
  MONEY_D1911_VERIFIED,
  formatPublicMoney,
} from "@/lib/marketing/publicMoney";
import {
  euro,
  ECON_D4102,
} from "@/lib/marketing/publicDecisionEconomics";
import { ValueTrace } from "@/components/marketing/kinetic/ValueTrace";
import { DecisionObject } from "@/components/marketing/primitives/DecisionObject";
import { EvidenceProvenance } from "@/components/marketing/primitives/EvidenceProvenance";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const STREAM = [
  { id: "D-1911", kind: "protected", amt: CANON_PEAK.actualProtectedEuro },
  { id: "D-2201", kind: "protected", amt: CANON_OTA.actualProtectedEuro },
  {
    id: "D-3104",
    kind: "recovered",
    amt:
      CANON_ORPHAN.verifiedIncrementalEuro ?? CANON_ORPHAN.actualProtectedEuro,
  },
  { id: "D-5208", kind: "avoided", amt: CANON_PLAYBOOK.actualProtectedEuro },
  { id: "D-1920", kind: "protected", amt: CANON_LABOR.actualProtectedEuro },
  {
    id: "D-4102",
    kind: "recovered",
    amt: verifiedEuro(CANON_SUPPLIER),
  },
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
 * Verified Value — one traceable Decision first. No vanity portfolio total.
 */
export function ValueChapter() {
  const [filter, setFilter] = useState<"all" | "protected">("all");
  const [openId, setOpenId] = useState<string>("D-1911");
  const visible =
    filter === "all" ? STREAM : STREAM.filter((s) => s.kind === "protected");
  const proof = PROOF_BY_DISPLAY[openId];
  const chosen = proof ? canonChosen(proof) : null;
  const counterfactual = proof
    ? (proof.scenarios.find((s) => s.isNoAction) ??
      canonScenario(proof, proof.scenarios[1]?.id ?? ""))
    : null;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section
          className="rx-value-cinema rx-value-cinema-solid"
          data-nav-theme="dark"
        >
          <div className="rx-shell rx-value-cinema-copy">
            <p className="rx-ch-kicker" style={{ color: "#00d978" }}>
              Verified Value · {capabilityBadge("verifiedValue")}
            </p>
            <h1 className="rx-ch-title" style={{ color: "#f7faf8" }}>
              A recommendation is not value.
              <br />
              An expected outcome is not value.
              <br />
              Value is verified after reality.
            </h1>
            <p
              className="rx-pilot-note"
              style={{ color: "rgba(247,250,248,0.78)" }}
            >
              One Decision. Traceable. Not a synthetic portfolio total.
            </p>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Historical · {ECON_D4102.displayId} · sealed recovery · DEMO
            </p>
            <div className="rx-rso-hero-num" style={{ marginBottom: "3rem" }}>
              <strong className="rx-pub-num" data-tone="verified">
                {euro(ECON_D4102.verified)}
              </strong>
              <em>Verified recovery</em>
            </div>
            <DecisionObject
              displayId={ECON_D4102.displayId}
              title="Contract vs invoice · contribution compression"
              amount={euro(ECON_D4102.verified)}
              amountLabel="Verified recovered"
              verified
            >
              <VerifiedStamp verified label="Verified recovered" />
              <div style={{ marginTop: "0.85rem" }}>
                <EvidenceProvenance
                  steps={[
                    { label: "Variance", value: euro(ECON_D4102.exposed) },
                    { label: "Expected", value: euro(ECON_D4102.expected) },
                    {
                      label: "Verified",
                      value: euro(ECON_D4102.verified),
                      verified: true,
                    },
                  ]}
                />
              </div>
              <p style={{ marginTop: "0.85rem" }}>
                Credit matched to INV-88421 · AP-POST-991. A recommendation is
                not value — this trail is.
              </p>
            </DecisionObject>

            <p className="rx-ch-kicker" style={{ marginTop: "7.5rem" }}>
              Decision ledger · sample · DEMO
            </p>
            <p className="rx-value-stream-note" style={{ marginBottom: "1.25rem" }}>
              Precise. Dense. Calm. Secondary Decisions — including zero or open
              cases. Not a rollup.
            </p>
            <p className="rx-ch-kicker">
              {MONEY_D1911_EXPECTED.displayId} · historical peak · DEMO
            </p>
            <ValueTrace
              disclosure="DEMO · ILLUSTRATIVE · not customer results"
              stages={[
                {
                  id: "expected",
                  label: "Expected",
                  euro: formatPublicMoney(MONEY_D1911_EXPECTED),
                  detail: MONEY_D1911_EXPECTED.label,
                },
                {
                  id: "observed",
                  label: "Observed",
                  euro: formatPublicMoney(MONEY_D1911_OBSERVED),
                  detail: MONEY_D1911_OBSERVED.label,
                },
                {
                  id: "attributed",
                  label: "Strongly attributed",
                  euro: formatPublicMoney(MONEY_D1911_VERIFIED),
                  detail: "Same amount · attribution strength applied",
                },
                {
                  id: "verified",
                  label: "Verified protected",
                  euro: formatPublicMoney(MONEY_D1911_VERIFIED),
                  detail: MONEY_D1911_VERIFIED.label,
                },
              ]}
            />

            <div
              className="rx-value-filters"
              role="tablist"
              style={{ marginTop: "2rem" }}
            >
              <button
                type="button"
                data-on={filter === "all" ? "true" : "false"}
                onClick={() => {
                  setFilter("all");
                  setOpenId("D-1911");
                }}
              >
                Sample Decisions
              </button>
              <button
                type="button"
                data-on={filter === "protected" ? "true" : "false"}
                onClick={() => {
                  setFilter("protected");
                  setOpenId("D-1911");
                }}
              >
                Protected only
              </button>
            </div>

            <ul
              className="rx-value-stream"
              aria-label="Selected sample Decisions"
            >
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
              Selected sample Decisions — not a rollup. Sealed recoveries show
              verified amounts; open cases stay unlabeled as verified.
            </p>

            {proof && chosen ? (
              <details
                className="rx-value-proof-details"
                open={openId === "D-1911"}
              >
                <summary>
                  {proof.displayId} ·{" "}
                  {verifiedEuro(proof) === 0 &&
                  proof.expectedProtectedEuro === 0
                    ? "CLOSED · NO VERIFIED RECOVERY"
                    : proof.actualProtectedEuro === 0 &&
                        proof.expectedProtectedEuro === 0
                      ? "OPEN · not yet verified"
                      : `Proof trail · ${money(verifiedEuro(proof))} verified ${proof.verifiedKind}`}
                </summary>
                <div className="rx-value-proof">
                  <ol className="rx-value-investigation">
                    <li>
                      <em>Exposure / variance</em>
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
