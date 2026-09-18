"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useProduct } from "@/lib/product/store";
import {
  acceptCancellationRecoveryAction,
  approveSupplierCredit,
  executeSupplierCreditRequest,
  getCancellationRecoveryScenario,
  getSupplierVarianceScenario,
  requestSupplierCreditApproval,
  resetCancellationRecoveryScenario,
  resetSupplierVarianceScenario,
  seatCancellationRecovery,
  verifyCancellationRecovery,
  verifySupplierCredit,
} from "@/lib/radr/scenarios/store";
import {
  CANCELLATION_RECOVERY_ID,
  SCENARIO_CLOCK,
} from "@/lib/radr/scenarios/cancellationRecovery";
import {
  SUPPLIER_SCENARIO_CLOCK,
  SUPPLIER_VARIANCE_ID,
} from "@/lib/radr/scenarios/supplierVariance";
import { provenanceForCancellationRecovery } from "@/lib/radr/provenance";
import { findingsForScope, urgencyDisplayLabel } from "@/lib/radr/findings";
import type { Finding } from "@/lib/radr/domain";
import { TextSep } from "@/components/TextSep";
import { evidenceRowsFromFinding } from "@/lib/radr/evidence";
import { AskThis } from "@/components/product/ask/AskThis";
import { EvidenceBlock } from "@/components/product/EvidenceBlock";
import { PreparedActionCard } from "@/components/product/PreparedActionCard";
import { RadrLoopRail } from "@/components/product/RadrLoopRail";
import {
  economicStateLabel,
  operatorAttentionState,
  attentionStateLabel,
  valueStateOfFinding,
} from "@/lib/radr/valueSemantics";
import {
  CANONICAL_EVENTS,
} from "@/lib/radr/canonicalDemo";
import { demoBerlinDinnerPeriod } from "@/lib/radr/domain/servicePeriod";

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    }).format(new Date(iso));
  } catch {
    return iso.slice(11, 16);
  }
}

function resolveFinding(id: string): Finding | null {
  if (id === CANCELLATION_RECOVERY_ID) {
    return getCancellationRecoveryScenario().finding;
  }
  if (id === SUPPLIER_VARIANCE_ID) {
    return getSupplierVarianceScenario().finding;
  }
  return findingsForScope("loc_ber").find((f) => f.id === id) ?? null;
}

/**
 * Domain finding detail - cancellation + supplier gold loops.
 */
export default function FindingDetailPage() {
  const params = useParams<{ id: string }>();
  const { setSelectedFindingId } = useProduct();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (params.id) setSelectedFindingId(params.id);
  }, [params.id, setSelectedFindingId]);

  void tick;
  const scenario = getCancellationRecoveryScenario();
  const supplier = getSupplierVarianceScenario();
  const finding = resolveFinding(params.id);

  if (!finding) {
    return (
      <div className="rp-empty">
        <h3>Finding not found</h3>
        <p>
          <Link href="/app/findings">Back to findings</Link>
        </p>
      </div>
    );
  }

  const isRecovery = finding.id === CANCELLATION_RECOVERY_ID;
  const isSupplier = finding.id === SUPPLIER_VARIANCE_ID;
  const provenance = isRecovery ? provenanceForCancellationRecovery() : null;
  const band = urgencyDisplayLabel(finding.urgency);
  const evidenceRows = evidenceRowsFromFinding(finding);

  return (
    <div className="rp-case">
      <p className="rp-crumb">
        <Link href="/app/findings">Needs attention</Link>
        <span>/</span>
        {finding.locationName ?? finding.locationId}
        <span>/</span>
        {finding.territory}
      </p>

      <header className="rp-case-head">
        <div>
          <p className="rp-attn-drawer-terr" data-terr={finding.territory}>
            {finding.territory}
            <TextSep />
            {finding.subtype}
            <TextSep />
            {band}
          </p>
          <h1>{finding.title}</h1>
          <p className="rp-case-sum">{finding.summary}</p>
          <AskThis
            query={
              isRecovery
                ? "Did we recover the Table 14 cancellation?"
                : isSupplier
                  ? "Where are we paying suppliers too much?"
                  : finding.category === "weather_sensitive_demand"
                    ? "Will the weather affect us tomorrow?"
                    : `Why does this matter?`
            }
            label="Ask about this"
            entityId={finding.id}
            entityLabel={`Finding: ${finding.title}`}
          />
          <p className="rp-case-asks">
            <AskThis query="Show me the calculation." label="Calculation" entityId={finding.id} entityLabel={finding.title} />
            {" · "}
            <AskThis query="What happens if I do nothing?" label="If I do nothing" entityId={finding.id} entityLabel={finding.title} />
            {" · "}
            <AskThis query="What should I do?" label="What to do" entityId={finding.id} entityLabel={finding.title} />
          </p>
          {isRecovery ? (
            <p className="rp-glance-meta">{SCENARIO_CLOCK.label}</p>
          ) : null}
          {isSupplier ? (
            <p className="rp-glance-meta">{SUPPLIER_SCENARIO_CLOCK.label}</p>
          ) : null}
        </div>
        <div className="rp-case-money">
          <strong>
            €{finding.financialImpact.primaryValue.toLocaleString("en-IE")}
          </strong>
          <TextSep srOnly>: </TextSep>
          <em>{finding.financialImpact.primaryLabel}</em>
        </div>
      </header>

      <RadrLoopRail finding={finding} />

      <section className="rp-attn-block" aria-label="Attention and economics">
        <p className="rp-attn-block-label">Attention</p>
        <p>{attentionStateLabel(operatorAttentionState(finding))}</p>
        <p className="rp-attn-block-label">Economic state</p>
        <p>{economicStateLabel(valueStateOfFinding(finding))}</p>
        {finding.servicePeriodId || isRecovery ? (
          <>
            <p className="rp-attn-block-label">Service period</p>
            <p>
              {demoBerlinDinnerPeriod().label}
              <TextSep />
              {demoBerlinDinnerPeriod().date}
            </p>
          </>
        ) : null}
      </section>

      <section className="rp-attn-block">
        <p className="rp-attn-block-label">What happened</p>
        <p>{finding.summary}</p>
        <p className="rp-attn-block-label">Why it matters</p>
        <p>{finding.explanation}</p>
        <p className="rp-attn-block-label">Value</p>
        <p>
          €{finding.financialImpact.primaryValue.toLocaleString("en-IE")} ·{" "}
          {finding.financialImpact.primaryLabel}
          {isRecovery ? (
            <>
              {" "}
              · Potential €{CANONICAL_EVENTS.cancellationPotential}
              {" · "}
              Observed €{CANONICAL_EVENTS.cancellationObservedVerified}
              {finding.status === "VERIFIED" ? (
                <>
                  {" · "}
                  Verified €{CANONICAL_EVENTS.cancellationObservedVerified}
                </>
              ) : null}
            </>
          ) : null}
          {!isRecovery && finding.financialImpact.verifiedValue != null ? (
            <>
              {" "}
              · Verified €
              {finding.financialImpact.verifiedValue.toLocaleString("en-IE")}
            </>
          ) : null}
        </p>
      </section>

      <EvidenceBlock
        confidence={finding.confidenceBand}
        confidenceReason={finding.confidenceExplanation}
        rows={evidenceRows}
        freshness={(finding.presentation?.dataSources ?? []).map((d) => ({
          label: d.label,
          lastSyncLabel: d.lastSyncLabel,
        }))}
      />

      {isRecovery ? (
        <section className="rp-attn-block" aria-label="Event timeline">
          <p className="rp-attn-block-label">Event timeline</p>
          <ol className="rp-finding-timeline">
            {scenario.timeline.map((ev) => (
              <li key={`${ev.at}-${ev.label}`}>
                <time dateTime={ev.at}>{formatWhen(ev.at)}</time>
                <span>{ev.label}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {isSupplier ? (
        <section className="rp-attn-block" aria-label="Invoice lines">
          <p className="rp-attn-block-label">Mismatched lines</p>
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Contract</th>
                  <th>Invoiced</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {supplier.invoice.lines.map((line) => (
                  <tr key={line.label}>
                    <td>{line.label}</td>
                    <td className="rp-money">€{line.contract}</td>
                    <td className="rp-money">€{line.invoiced}</td>
                    <td className="rp-money">+€{line.variance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rp-attn-block">
        <p className="rp-attn-block-label">What RADR needs from you</p>
        <p className="rp-attn-rec-action">{finding.recommendation.title}</p>
        <p className="rp-attn-rec-detail">
          {finding.recommendation.description}
        </p>
        {finding.recommendation.expectedBenefit != null ||
        finding.recommendation.expectedCost != null ? (
          <dl className="rp-tonight-econ">
            {finding.recommendation.expectedBenefit != null ? (
              <div>
                <dt>Gross opportunity</dt>
                <dd>€{finding.recommendation.expectedBenefit}</dd>
              </div>
            ) : null}
            {finding.recommendation.expectedCost != null ? (
              <div>
                <dt>Cost to capture</dt>
                <dd>€{finding.recommendation.expectedCost}</dd>
              </div>
            ) : null}
            {finding.recommendation.expectedNetBenefit != null ? (
              <div data-emphasize="true">
                <dt>Expected net</dt>
                <dd>€{finding.recommendation.expectedNetBenefit}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {isSupplier && supplier.action ? (
          <PreparedActionCard
            action={supplier.action}
            willDo={supplier.action.title}
            why={supplier.action.preparedSummary}
            confidenceLabel={finding.confidenceBand}
            showActions={false}
          />
        ) : null}
        {isRecovery ? (
          <PreparedActionCard
            action={scenario.action}
            willDo={scenario.action.title}
            why={scenario.action.preparedSummary}
            confidenceLabel={finding.confidenceBand}
            showActions={false}
          />
        ) : null}
        {finding.drivers.some((d) => d.label === "If you do nothing") ? (
          <>
            <p className="rp-attn-block-label">What if I do nothing?</p>
            <p>
              {
                finding.drivers.find((d) => d.label === "If you do nothing")
                  ?.value
              }
            </p>
          </>
        ) : null}
        <p className="rp-attn-block-label">Action state</p>
        <p>{finding.status.replace(/_/g, " ")}</p>
        {finding.presentation?.actionedNote ? (
          <>
            <p className="rp-attn-block-label">Outcome</p>
            <p>{finding.presentation.actionedNote}</p>
          </>
        ) : null}
        <p className="rp-attn-block-label">Verification</p>
        <p>
          {finding.presentation?.verificationStatus ?? "Not started"}
          {finding.presentation?.verificationMethod
            ? ` · ${finding.presentation.verificationMethod}`
            : ""}
        </p>
      </section>

      {provenance ? (
        <section className="rp-attn-block" aria-label="How calculated">
          <p className="rp-attn-block-label">How is this calculated?</p>
          <p>
            <strong>{provenance.value}</strong> · {provenance.definition}
          </p>
          <p className="rp-attn-note">Formula: {provenance.formula}</p>
          <ul className="rp-attn-sources">
            {provenance.sources.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <TextSep>: </TextSep>
                <em>{s.detail}</em>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isRecovery ? (
        <footer className="rp-attn-drawer-actions">
          {scenario.actionStatus === "PROPOSED" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                acceptCancellationRecoveryAction();
                refresh();
              }}
            >
              Accept action →
            </button>
          ) : null}
          {scenario.actionStatus === "ACCEPTED" ||
          scenario.actionStatus === "IN_PROGRESS" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                seatCancellationRecovery();
                refresh();
              }}
            >
              Mark seated →
            </button>
          ) : null}
          {scenario.actionStatus === "COMPLETED" ||
          scenario.actionStatus === "MONITORING" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                verifyCancellationRecovery();
                refresh();
              }}
            >
              Verify POS €184 →
            </button>
          ) : null}
          {scenario.verification ? (
            <p className="rp-attn-status-note" data-status="ACTIONED">
              Verified €{scenario.verification.verifiedValue} · attribution{" "}
              {scenario.verification.attribution}
            </p>
          ) : null}
          <Link href="/app/service?focus=t14" className="rp-btn rp-btn-ghost">
            Service map · Table 14 →
          </Link>
          <Link href="/app/value" className="rp-btn rp-btn-ghost">
            Verified Value →
          </Link>
          <button
            type="button"
            className="rp-btn rp-btn-ghost"
            onClick={() => {
              resetCancellationRecoveryScenario("PROPOSED");
              refresh();
            }}
          >
            Replay from recommend
          </button>
        </footer>
      ) : null}

      {isSupplier ? (
        <footer className="rp-attn-drawer-actions">
          {supplier.phase === "DETECTED" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                requestSupplierCreditApproval();
                refresh();
              }}
            >
              Request credit (needs approval) →
            </button>
          ) : null}
          {supplier.phase === "APPROVAL_REQUIRED" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                approveSupplierCredit();
                refresh();
              }}
            >
              Approve credit request →
            </button>
          ) : null}
          {supplier.phase === "APPROVED" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                executeSupplierCreditRequest();
                refresh();
              }}
            >
              Mark as manually sent (demo) →
            </button>
          ) : null}
          {supplier.phase === "EXECUTING" ? (
            <button
              type="button"
              className="rp-btn rp-btn-primary"
              onClick={() => {
                verifySupplierCredit();
                refresh();
              }}
            >
              Confirm credit €118 →
            </button>
          ) : null}
          {supplier.verification ? (
            <p className="rp-attn-status-note" data-status="ACTIONED">
              Verified €{supplier.verification.verifiedValue} ·{" "}
              {supplier.verification.method}
            </p>
          ) : null}
          <Link href="/app/recover" className="rp-btn rp-btn-ghost">
            Recover →
          </Link>
          <Link href="/app/value" className="rp-btn rp-btn-ghost">
            Verified Value →
          </Link>
          <button
            type="button"
            className="rp-btn rp-btn-ghost"
            onClick={() => {
              resetSupplierVarianceScenario("DETECTED");
              refresh();
            }}
          >
            Replay from detect
          </button>
        </footer>
      ) : null}

      <p className="rp-crumb" style={{ marginTop: "1.5rem" }}>
        <Link href="/app/findings">← Findings</Link>
        {" · "}
        <Link href="/app">Control Center</Link>
      </p>
    </div>
  );
}
