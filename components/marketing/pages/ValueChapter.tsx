"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { money } from "@/data/demo";
import {
  CANON_OTA,
  CANON_ORPHAN,
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
import {
  GROUP_LEDGER_THIS_MONTH,
  GROUP_METRICS,
  LOCATION_BY_ID,
  ledgerForLocation,
  type LocationId,
} from "@/lib/marketing/northstarGroup";
import { ValueTrace } from "@/components/marketing/kinetic/ValueTrace";
import { DecisionObject } from "@/components/marketing/primitives/DecisionObject";
import { EvidenceProvenance } from "@/components/marketing/primitives/EvidenceProvenance";
import { VerifiedStamp } from "@/components/marketing/primitives/VerifiedStamp";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const PROOF_BY_DISPLAY: Record<string, CanonDecision> = {
  "D-1911": CANON_PEAK,
  "D-2201": CANON_OTA,
  "D-3104": CANON_ORPHAN,
  "D-1920": CANON_LABOR,
  "D-4102": CANON_SUPPLIER,
  "D-4410": CANON_CREATED,
  "D-6671": CANON_TABLE,
};

const LOCATION_FILTERS: { id: "all" | LocationId; label: string }[] = [
  { id: "all", label: "All locations" },
  { id: "nyc-soho", label: "New York" },
  { id: "london-shoreditch", label: "London" },
  { id: "tokyo-shibuya", label: "Tokyo" },
  { id: "dubai-difc", label: "Dubai" },
  { id: "singapore-marina", label: "Singapore" },
];

/**
 * Verified Value — one traceable Decision first. Multi-location ledger.
 */
export function ValueChapter() {
  const [locationScope, setLocationScope] = useState<"all" | LocationId>("all");
  const [openId, setOpenId] = useState<string>("D-4102");

  const rows = useMemo(
    () =>
      ledgerForLocation(locationScope).filter((r) => r.status === "verified"),
    [locationScope],
  );
  const rollup = useMemo(
    () => rows.reduce((sum, r) => sum + r.verified, 0),
    [rows],
  );
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
              One Decision. Traceable. Every verified euro has a Decision behind
              it.
            </p>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Historical · {ECON_D4102.displayId} · sealed recovery · DEMO
            </p>
            <div className="rx-rso-hero-num" style={{ marginBottom: "2rem" }}>
              <strong className="rx-pub-num" data-tone="verified">
                {euro(ECON_D4102.verified)}
              </strong>
              <em>Verified recovery</em>
            </div>

            <ol
              className="rx-value-recovery-story"
              aria-label="Verified recovery story"
            >
              {[
                { label: "Contract", value: "$6.80/L" },
                { label: "Invoice", value: "$7.45/L · 420 L" },
                { label: "Variance", value: euro(ECON_D4102.exposed) },
                { label: "Decision", value: "Dispute" },
                { label: "Credit", value: euro(ECON_D4102.verified) },
                {
                  label: "Verified",
                  value: euro(ECON_D4102.verified),
                  tone: "verified" as const,
                },
              ].map((step) => (
                <li key={step.label} data-tone={step.tone}>
                  <span>{step.label}</span>
                  <strong>{step.value}</strong>
                </li>
              ))}
            </ol>

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
              <p style={{ marginTop: "0.85rem" }}>
                <NextLink
                  href="/product/decisions/D-4102/trace"
                  className="rx-dt-full-link"
                >
                  View Trace <span aria-hidden="true">→</span>
                </NextLink>
              </p>
            </DecisionObject>

            <div className="rx-he-ctas" style={{ marginTop: "1.75rem" }}>
              <NextLink
                href="/signup?intent=demo&next=/app/enter"
                className="rx-btn rx-btn-primary"
              >
                Open this in RADR <span aria-hidden="true">→</span>
              </NextLink>
            </div>

            <div className="rx-value-miss" style={{ marginTop: "4.5rem" }}>
              <p className="rx-ch-kicker">When RADR is wrong · DEMO</p>
              <h2
                className="rx-display rx-display-sm"
                style={{ marginBottom: "0.75rem" }}
              >
                D-4188 · $420 expected · $0 verified
              </h2>
              <p className="rx-lead rx-lead-short">
                Supplier provided valid seasonal surcharge documentation after
                Decision formation. Closed · no recovery · Memory updated.
              </p>
              <p>
                <NextLink
                  href="/product/decisions/D-4188/trace"
                  className="rx-dt-full-link"
                >
                  Open miss Trace <span aria-hidden="true">→</span>
                </NextLink>
              </p>
            </div>

            <p className="rx-ch-kicker" style={{ marginTop: "7.5rem" }}>
              Verified Value · all locations · this month
            </p>
            <div className="rx-rso-hero-num" style={{ marginBottom: "1.25rem" }}>
              <strong className="rx-pub-num" data-tone="verified">
                {euro(
                  locationScope === "all"
                    ? GROUP_METRICS.verifiedThisMonth
                    : rollup,
                )}
              </strong>
              <em>
                {locationScope === "all"
                  ? "Verified across the group"
                  : `Verified · ${LOCATION_BY_ID[locationScope].name}`}
              </em>
            </div>
            {locationScope === "all" ? (
              <div
                className="rx-gcc-metrics"
                style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}
                aria-label="Verified by class"
              >
                <div>
                  <em>Supplier / AP</em>
                  <strong data-tone="verified">
                    {euro(GROUP_METRICS.byClass.supplierAp)}
                  </strong>
                </div>
                <div>
                  <em>Labor</em>
                  <strong data-tone="verified">
                    {euro(GROUP_METRICS.byClass.labor)}
                  </strong>
                </div>
                <div>
                  <em>Perishable revenue</em>
                  <strong data-tone="verified">
                    {euro(GROUP_METRICS.byClass.perishable)}
                  </strong>
                </div>
              </div>
            ) : null}
            <p className="rx-value-stream-note" style={{ marginBottom: "1rem" }}>
              DEMO · derived from sealed Decision fixtures · not customer results
            </p>

            <div
              className="rx-value-loc-filter"
              role="tablist"
              aria-label="Location filter"
            >
              {LOCATION_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  data-on={locationScope === f.id ? "true" : "false"}
                  aria-selected={locationScope === f.id}
                  onClick={() => setLocationScope(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className="rx-value-ledger" aria-label="Decision ledger">
              <li className="rx-value-ledger-head" aria-hidden="true">
                <span>Decision</span>
                <span>Location</span>
                <span>Class</span>
                <span>Expected</span>
                <span>Observed</span>
                <span>Verified</span>
                <span>Status</span>
              </li>
              {rows.map((r) => (
                <li key={r.displayId}>
                  <em>{r.displayId}</em>
                  <span>{LOCATION_BY_ID[r.locationId].name}</span>
                  <span>{r.classLabel}</span>
                  <span>{euro(r.expected)}</span>
                  <span>{euro(r.observed)}</span>
                  <strong data-tone="verified">{euro(r.verified)}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      if (PROOF_BY_DISPLAY[r.displayId]) setOpenId(r.displayId);
                    }}
                    style={{
                      appearance: "none",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: PROOF_BY_DISPLAY[r.displayId]
                        ? "pointer"
                        : "default",
                      fontSize: "0.78rem",
                      fontWeight: 560,
                      color: "#0a0d0b",
                      textAlign: "left",
                    }}
                  >
                    {r.status}
                  </button>
                </li>
              ))}
            </ul>
            <p className="rx-value-ledger-meta">
              {rows.length} Decisions · {euro(rollup)} verified in view ·{" "}
              {GROUP_LEDGER_THIS_MONTH.length} group fixtures this month
            </p>

            <p className="rx-ch-kicker" style={{ marginTop: "4rem" }}>
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

            {proof && chosen ? (
              <details
                className="rx-value-proof-details"
                open={openId === "D-4102"}
                style={{ marginTop: "2rem" }}
              >
                <summary>
                  {proof.displayId} ·{" "}
                  {`Proof trail · ${money(verifiedEuro(proof))} verified ${proof.verifiedKind}`}
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
              <NextLink
                href="/signup?intent=demo&next=/app/enter"
                className="rx-btn rx-btn-primary"
              >
                See this inside RADR <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink
                href="/contact?intent=recovery-pilot"
                className="rx-btn rx-btn-ghost"
              >
                Start a recovery pilot
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
