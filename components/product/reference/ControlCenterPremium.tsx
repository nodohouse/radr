"use client";

import Link from "next/link";
import { useRecords } from "./ReferencePages";
import { roleContextFor } from "@/lib/radr/product/personas";
import { recordAttention } from "@/lib/radr/product/roleScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { Arrow, Chart, Heading, Metric, Panel, StatusPill, TextLink } from "./ReferenceUI";

/** The daily brief: three summaries, one proof visual, one priority decision. */
export function ControlCenterPremium() {
  const { roleView, vertical, records, scopeLabel } = useRecords();
  const context = roleContextFor(roleView, vertical);
  const needs = records.filter(r => recordAttention(r) === "needs_you");
  const handling = records.filter(r => recordAttention(r) === "handling");
  const primary = needs[0];
  const aggregate = deriveValueAggregate(roleView, vertical, records);
  const value = buildValueOverview(roleView, vertical, records);
  const metric = primary ? formatPrimaryMetric(primary) : null;

  return <div className="rs-page rs-center rs-brief">
    <Heading eyebrow="Control Center" title={`Your day in focus, ${context.firstName}.`} description={`Here’s what needs your attention · ${scopeLabel}`} />
    <div className="rs-metrics rs-three">
      <Metric value={needs.length} label="Decisions need attention" note="Prioritized for your role and location" href="/app/decisions?band=needs_you" link="See decisions" />
      <Metric value={formatDecisionMoney(aggregate.pendingVerification)} label="Expected value" note="In progress · awaiting verification" href="/app/decisions?band=handling" link={`Follow ${handling.length === 1 ? '1 decision' : `${handling.length} decisions`}`} />
      <Metric value={value.verifiedFormatted} label="Verified contribution" note="Month to date · evidence linked" href="/app/value" link="See verified outcomes" positive />
    </div>
    <div className="rs-two-columns rs-brief-grid">
      <Panel title="Verified contribution" action={<span className="rs-meta">Month to date · USD</span>} className="rs-brief-proof">
        <Chart values={value.trend.map(p=>p.cumulative)} labels={value.trend.map(p=>p.label)} caption="Cumulative verified contribution, month to date" />
        <div className="rs-chart-legend"><i />Evidence-linked outcomes<TextLink href="/app/value">View value record</TextLink></div>
      </Panel>
      <Panel title="Top decision" className="rs-brief-decision">
        {primary ? <>
          <div className="rs-brief-status"><StatusPill tone="attention">Needs you</StatusPill><span>{displayDecisionId(primary.id)}</span></div>
          <h3>{primary.title}</h3>
          <p className="rs-brief-recommendation">{(primary.recommendationHeadline || primary.contextLine).replace(/\s*—\s*/g,', ')}</p>
          <div className="rs-brief-impact"><strong>{metric?.money}</strong><span>{metric?.caption}</span></div>
          <Link href={`/app/decisions/${primary.id}`} className="rs-text-link">Review recommended action <Arrow /></Link>
          <div className="rs-brief-evidence"><span><i />{primary.evidenceRefs.length} evidence items connected</span><span>{primary.confidence.userFacing.toLowerCase()} confidence · approval required</span></div>
        </> : <div className="rs-empty"><h3>You’re up to date.</h3><p>No decisions currently need your review in this scope.</p><TextLink href="/app/decisions">View decision record</TextLink></div>}
      </Panel>
    </div>
  </div>;
}
