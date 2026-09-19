"use client";

import {
  CancelDecompositionBar,
  InvoiceDeltaBars,
  LaborCapacitySpark,
  RecoveryIndicator,
} from "@/components/product/LiveVisuals";
import { MetricExplain } from "@/components/product/MetricExplain";
import { AskThis } from "@/components/product/ask/AskThis";
import { TextSep } from "@/components/TextSep";
import { RADR_MOTION } from "@/lib/radr/motion";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import type { Finding, FindingStatus } from "@/lib/radr/domain";
import {
  applyFindingStatus,
  markFindingActioned,
  urgencyDisplayLabel,
} from "@/lib/radr/findings";
import { attentionNowFindings } from "@/lib/radr/valueSemantics";
import { createActionFromFinding, listActionsForFinding } from "@/lib/radr/actions/service";
import { PreparedActionCard } from "@/components/product/PreparedActionCard";
import { WhyLine } from "@/components/product/WhyLine";
import type { MetricId } from "@/lib/product/metricDefinitions";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

type Props = {
  findings: Finding[];
  onFindingsChange: (next: Finding[]) => void;
};

function MoneyRow({
  label,
  metric,
  value,
  risk,
  emphasize,
}: {
  label: string;
  metric?: MetricId;
  value: string;
  risk?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div data-emphasize={emphasize ? "true" : undefined}>
      <dt>
        {metric ? (
          <MetricExplain metric={metric}>{label}</MetricExplain>
        ) : (
          label
        )}
      </dt>
      <dd data-risk={risk ? "true" : undefined}>{value}</dd>
    </div>
  );
}

function FindingDrawer({
  finding,
  onClose,
  onStatus,
  onAddAction,
}: {
  finding: Finding;
  onClose: () => void;
  onStatus: (id: string, status: FindingStatus, note?: string) => void;
  onAddAction: (id: string) => void;
}) {
  const titleId = useId();
  const [showCalc, setShowCalc] = useState(false);
  const fi = finding.financialImpact;
  const rec = finding.recommendation;
  const ui = finding.presentation;
  const band = urgencyDisplayLabel(finding.urgency);
  const kindLabel = ui?.kindLabel ?? finding.subtype;
  const timeframeLabel = finding.timeframe.label ?? finding.timeframe.start;
  const preparedAction = useMemo(
    () => listActionsForFinding(finding.id)[0] ?? null,
    // Re-read when operator prepares an action from this drawer.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actionCreated/status gate refresh
    [finding.id, finding.status, ui?.actionCreated],
  );

  return (
    <motion.div
      className="rp-drawer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={RADR_MOTION.tooltip}
    >
      <button
        type="button"
        className="rp-drawer-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <motion.aside
        className="rp-drawer-panel rp-attn-drawer"
        role="dialog"
        aria-labelledby={titleId}
        initial={{ x: 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 24, opacity: 0 }}
        transition={RADR_MOTION.panel}
      >
        <header>
          <div>
            <p className="rp-attn-drawer-terr" data-terr={finding.territory}>
              {finding.territory}
              <TextSep />
              {kindLabel}
            </p>
            <h2 id={titleId}>{kindLabel}</h2>
            <p className="rp-attn-drawer-when">{timeframeLabel}</p>
          </div>
          <button type="button" className="rp-btn rp-btn-ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="rp-attn-drawer-band">{band}</p>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">What RADR sees</p>
          <p>{finding.summary}</p>
          <dl className="rp-attn-why">
            {finding.evidence.map((row) => (
              <div key={row.id ?? row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Reading</p>
          <p>{finding.explanation}</p>
          <dl className="rp-attn-why">
            {finding.drivers.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">Financial impact</p>
          <dl className="rp-attn-money">
            {fi.grossValue != null ? (
              <MoneyRow
                label="Original booking value"
                metric="bookingValueAffected"
                value={formatFindingEuro(fi.grossValue)}
              />
            ) : null}
            {fi.revenueAtRisk != null ? (
              <MoneyRow
                label="Revenue at risk"
                metric="revenueAtRiskGeneric"
                value={formatFindingEuro(fi.revenueAtRisk)}
                risk
              />
            ) : null}
            {fi.contributionAtRisk != null ? (
              <MoneyRow
                label="Contribution at risk"
                metric="contributionAtRisk"
                value={formatFindingEuro(fi.contributionAtRisk)}
              />
            ) : null}
            {fi.recoverableValue != null && fi.revenueAtRisk == null ? (
              <MoneyRow
                label="Recoverable"
                metric="recoverable"
                value={formatFindingEuro(fi.recoverableValue)}
                risk
              />
            ) : null}
          </dl>
          {ui?.financialNote ? (
            <p className="rp-attn-note">{ui.financialNote}</p>
          ) : null}
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">RADR recommends</p>
          <p className="rp-attn-rec-action">{rec.title}</p>
          <p className="rp-attn-rec-detail">{rec.description}</p>
          {rec.channels?.length ? (
            <ul className="rp-attn-channels">
              {rec.channels.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : null}
          <dl className="rp-attn-money">
            {rec.expectedCost != null ? (
              <MoneyRow
                label="Expected cost"
                value={`€${rec.expectedCost}`}
              />
            ) : null}
            {rec.expectedRevenueProtected != null ? (
              <MoneyRow
                label="Expected value protected"
                metric="expectedRevenueProtected"
                value={formatFindingEuro(rec.expectedRevenueProtected)}
              />
            ) : null}
            {rec.expectedContributionProtected != null ? (
              <MoneyRow
                label="Expected contribution protected"
                metric="expectedContributionProtected"
                value={formatFindingEuro(rec.expectedContributionProtected)}
              />
            ) : null}
            {rec.expectedNetBenefit != null ? (
              <MoneyRow
                label="Expected net value"
                metric="expectedNetBenefit"
                value={`${rec.expectedNetBenefit >= 0 ? "+" : "−"}${formatFindingEuro(Math.abs(rec.expectedNetBenefit))}`}
                emphasize
              />
            ) : null}
          </dl>
        </section>

        {preparedAction ? (
          <PreparedActionCard
            action={preparedAction}
            willDo={rec.title}
            why={finding.summary}
            confidenceLabel={
              finding.confidenceBand === "HIGH"
                ? "High"
                : finding.confidenceBand === "MEDIUM"
                  ? "Medium"
                  : "Low"
            }
            showActions={false}
          />
        ) : null}

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">
            <MetricExplain metric="confidence">Confidence</MetricExplain>
          </p>
          <p className="rp-attn-confidence">
            <strong>{finding.confidenceBand}</strong>
            <span>{finding.confidenceExplanation}</span>
          </p>
        </section>

        <section className="rp-attn-block">
          <p className="rp-attn-block-label">
            <MetricExplain metric="verifiedValue">Verification</MetricExplain>
          </p>
          <p className="rp-attn-verify">
            <em>{ui?.verificationStatus ?? "IDENTIFIED"}</em>
            {ui?.verificationMethod ??
              "Verified value requires observed outcome evidence."}
          </p>
        </section>

        {showCalc ? (
          <section className="rp-attn-block">
            <p className="rp-attn-block-label">Data sources</p>
            <ul className="rp-attn-sources">
              {(ui?.dataSources ?? []).map((s) => (
                <li key={s.key}>
                  <span>{s.label}</span>
                  <em>Last sync {s.lastSyncLabel}</em>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {ui?.actionCreated || finding.status === "ACTIONED" ? (
          <p className="rp-attn-status-note" data-status="ACTIONED">
            Action prepared
            {ui?.actionedNote ? ` · ${ui.actionedNote}` : null}
            <span>
              {" "}
              Ready for approval. Execution only if supported and policy allows.
            </span>
          </p>
        ) : null}

        <footer className="rp-attn-drawer-actions">
          <button
            type="button"
            className="rp-btn rp-btn-primary"
            onClick={() => onAddAction(finding.id)}
          >
            {ui?.actionCreated ? "Prepared action created" : "Prepare action →"}
          </button>
          {ui?.primaryAction.href &&
          (ui.primaryAction.kind === "review" ||
            ui.primaryAction.kind === "open") ? (
            <Link
              href={ui.primaryAction.href}
              className="rp-btn rp-btn-ghost"
              onClick={onClose}
            >
              {ui.primaryAction.label} →
            </Link>
          ) : null}
          <button
            type="button"
            className="rp-btn rp-btn-ghost"
            onClick={() => setShowCalc((v) => !v)}
          >
            {showCalc ? "Hide calculation" : "View calculation"}
          </button>
          <button
            type="button"
            className="rp-btn rp-btn-ghost"
            onClick={() => {
              onStatus(finding.id, "DISMISSED");
              onClose();
            }}
          >
            Dismiss
          </button>
          {ui ? (
            <Link
              href={ui.secondaryHref}
              className="rp-attn-drawer-full"
              onClick={onClose}
            >
              {ui.secondaryLabel} →
            </Link>
          ) : null}
        </footer>
      </motion.aside>
    </motion.div>
  );
}

function FindingRow({
  finding,
  index,
  onOpen,
}: {
  finding: Finding;
  index: number;
  onOpen: (id: string) => void;
}) {
  const ui = finding.presentation;
  const band = urgencyDisplayLabel(finding.urgency);
  const timeframeLabel = finding.timeframe.label ?? finding.timeframe.start;
  const detailBits = [
    finding.locationName,
    timeframeLabel,
  ].filter(Boolean);
  const evidenceLine =
    finding.summary ||
    finding.drivers
      ?.slice(0, 2)
      .map((d) => d.value)
      .join(" · ");

  return (
    <li>
      <button
        type="button"
        className="rp-attn-row"
        data-terr={finding.territory}
        data-band={band}
        data-status={finding.status}
        onClick={() => onOpen(finding.id)}
      >
        <span className="rp-attn-left">
          <span className="rp-attn-idx" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="rp-attn-delta" aria-hidden="true" />
          <span className="rp-attn-terr-line">
            <em data-terr={finding.territory}>{finding.territory}</em>
            <TextSep />
            <b className="rp-attn-band" data-band={band}>
              {band}
            </b>
          </span>
        </span>

        <span className="rp-attn-main">
          <span className="rp-attn-headline">
            {ui?.headline ?? finding.title}
          </span>
          <span className="rp-attn-meta">{detailBits.join(", ")}</span>
          {evidenceLine ? (
            <WhyLine as="span" why={evidenceLine} className="rp-attn-why" />
          ) : null}
          <span className="rp-attn-rec">
            {ui?.recommendShort ?? finding.recommendation.title}
          </span>
          <span className="rp-attn-viz" aria-hidden="true">
            {finding.territory === "LABOR" ? <LaborCapacitySpark /> : null}
            {finding.category === "cancellation_recovery" ||
            (finding.territory === "SELL" &&
              finding.category !== "weather_sensitive_demand") ? (
              <CancelDecompositionBar />
            ) : null}
            {finding.territory === "RECOVER" ? <RecoveryIndicator /> : null}
            {finding.territory === "BUY" ? <InvoiceDeltaBars /> : null}
          </span>
          {ui?.actionCreated ? (
            <span className="rp-attn-row-status" data-status="ACTIONED">
              Prepared for approval
              {ui.actionedNote ? ` · ${ui.actionedNote}` : null}
            </span>
          ) : null}
        </span>

        <span className="rp-attn-right">
          <span className="rp-attn-money-col">
            <strong>
              {formatFindingEuro(finding.financialImpact.primaryValue)}
            </strong>
            <TextSep srOnly>: </TextSep>
            <em>{finding.financialImpact.primaryLabel}</em>
          </span>
          <span className="rp-attn-cta">
            {ui?.ctaLabel ?? "Review & act"}
            <i aria-hidden="true">→</i>
          </span>
        </span>
      </button>
    </li>
  );
}

/** Above-the-fold command center: findings queue only (exec brief sits above). */
export function NeedsAttention({ findings, onFindingsChange }: Props) {
  const open = attentionNowFindings(findings);
  const top = open.slice(0, 3);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = findings.find((f) => f.id === activeId) ?? null;

  const setStatus = useCallback(
    (id: string, status: FindingStatus, note?: string) => {
      onFindingsChange(
        findings.map((f) =>
          f.id === id ? applyFindingStatus(f, status, note) : f,
        ),
      );
    },
    [findings, onFindingsChange],
  );

  const addAction = useCallback(
    (id: string) => {
      onFindingsChange(
        findings.map((f) => {
          if (f.id !== id) return f;
          createActionFromFinding(f, "demo_operator");
          return markFindingActioned(f);
        }),
      );
    },
    [findings, onFindingsChange],
  );

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  return (
    <>
      <section
        id="needs-attention"
        className="rp-attn"
        aria-label="Needs your attention"
      >
        <header className="rp-attn-head">
          <p className="rp-attn-title">Needs your attention</p>
          <div className="rp-attn-head-meta">
            <p className="rp-attn-open">{open.length} open</p>
            <AskThis
              query="What needs my attention?"
              label="Ask RADR"
              entityLabel="Needs attention"
            />
          </div>
        </header>

        {top.length ? (
          <ol className="rp-attn-list">
            {top.map((f, i) => (
              <FindingRow
                key={f.id}
                finding={f}
                index={i}
                onOpen={(id) => {
                  setActiveId(id);
                  if (f.status === "OPEN" || f.status === "DETECTED") {
                    setStatus(id, "REVIEWED");
                  }
                }}
              />
            ))}
          </ol>
        ) : (
          <p className="rp-attn-empty">No material exceptions in this scope.</p>
        )}

        {top.length > 0 ? (
          <div className="rp-attn-next">
            <p>
              <strong>{`${open.length} open finding${open.length === 1 ? "" : "s"}`}</strong>
              <span>Start with the highest-priority issue.</span>
            </p>
            <div className="rp-attn-next-actions">
              <button
                type="button"
                className="rp-attn-next-primary"
                onClick={() => {
                  const first = top[0];
                  if (!first) return;
                  setActiveId(first.id);
                  if (first.status === "OPEN" || first.status === "DETECTED") {
                    setStatus(first.id, "REVIEWED");
                  }
                }}
              >
                {`Review ${Math.min(open.length, 3)} finding${Math.min(open.length, 3) === 1 ? "" : "s"}`}
              </button>
              <AskThis
                query="What should I fix first?"
                label="Ask RADR what to fix first"
                entityLabel="Priority"
              />
            </div>
          </div>
        ) : null}

        <p className="rp-attn-all">
          <Link href="/app/findings">View all findings →</Link>
        </p>
      </section>

      <AnimatePresence>
        {active ? (
          <FindingDrawer
            finding={active}
            onClose={() => setActiveId(null)}
            onStatus={setStatus}
            onAddAction={addAction}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
