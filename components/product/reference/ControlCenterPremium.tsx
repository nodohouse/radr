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
import { Arrow, Chart, Heading, Metric, Panel, TextLink, detailHref } from "./ReferenceUI";

export function ControlCenterPremium() {
  const { roleView, vertical, records, scopeLabel } = useRecords();
  const context = roleContextFor(roleView, vertical);
  const needs = records.filter(r => recordAttention(r) === "needs_you");
  const handling = records.filter(r => recordAttention(r) === "handling");
  const primary = needs[0];
  const aggregate = deriveValueAggregate(roleView, vertical, records);
  const value = buildValueOverview(roleView, vertical, records);
  const metric = primary ? formatPrimaryMetric(primary) : null;
  return <div className="rs-page rs-center rc-premium">
    <Heading eyebrow="Your daily brief" title={`A clear next move, ${context.firstName}.`} description={`${scopeLabel} · What needs you. What is moving. What came back.`} aside={<span className="rc-session"><i />Demo workspace</span>} />
    <div className="rs-metrics rs-three">
      <Metric value={needs.length} label="Needs your decision" note="Prioritized for your role and location" href="/app/decisions?band=needs_you" link="Review decisions" />
      <Metric value={formatDecisionMoney(aggregate.pendingVerification)} label="Awaiting verification" note={`${handling.length} ${handling.length === 1 ? "decision" : "decisions"} in progress · expected value`} href={detailHref('/app/value')} link="Follow the evidence" />
      <Metric value={value.verifiedFormatted} label="Verified contribution" note="Month to date · evidence linked" href="/app/value" link="Explore outcomes" positive />
    </div>
    {primary ? <section className="rc-priority" aria-label="Priority decision">
      <div className="rc-priority-copy"><div className="rc-priority-meta"><span className="rc-attention"><i />Needs you</span><span>{displayDecisionId(primary.id)} · {primary.decisionDeadline || primary.decisionHorizon.replaceAll('_',' ').toLowerCase()}</span></div>
        <h2>{primary.title}</h2><p>{(primary.recommendationHeadline || primary.contextLine).replace(/\s*—\s*/g,', ')}</p>
        <div className="rc-impact"><strong>{metric?.money}</strong><span>{metric?.caption}</span></div>
        <Link href={`/app/decisions/${primary.id}`} className="rc-review">Review the decision <Arrow /></Link>
      </div>
      <div className="rc-evidence"><div className="rc-evidence-heading"><span>THE EVIDENCE BEHIND THE MOVE</span><b>{primary.confidence.userFacing.toLowerCase()} confidence</b></div>
        <div className="rc-evidence-items">{primary.evidenceRefs.slice(0,3).map((e,i)=><Link key={e.id} href={detailHref(`/app/decisions/${primary.id}#evidence`)}><span className="rc-evidence-number">0{i+1}</span><div><small>{e.source}</small><strong>{e.label}</strong><p>{e.value}</p></div><Arrow /></Link>)}</div>
        <div className="rc-evidence-foot"><i />{primary.evidenceRefs.length} connected evidence items<span>Human approval stays with you</span></div>
      </div>
    </section> : <Panel title="You’re up to date."><p className="rs-description">No decisions need your review in this scope.</p><TextLink href="/app/decisions">Explore the decision record</TextLink></Panel>}
    <div className="rs-two-columns"><Panel title="Value, with a trail." action={<TextLink href="/app/value">View ledger</TextLink>}><div className="rc-chart-total"><strong>{value.verifiedFormatted}</strong><span>verified contribution · month to date</span></div><Chart values={value.trend.map(p=>p.cumulative)} labels={value.trend.map(p=>p.label)} caption="Cumulative verified contribution, month to date" /></Panel>
      <Panel title="In your decision queue" action={<span className="rs-meta">{records.length} in scope</span>}><div className="rc-queue">{[...needs.slice(1),...handling].slice(0,3).map(r=><Link key={r.id} href={`/app/decisions/${r.id}`}><span className="rc-queue-icon">↗</span><div><small>{recordAttention(r)==='handling'?'In progress':'Needs you'} · {displayDecisionId(r.id)}</small><h3>{r.title}</h3><p>{r.property}</p></div><Arrow /></Link>)}{needs.length<=1&&!handling.length?<p className="rs-description">Your next priorities will appear here.</p>:null}</div><TextLink href="/app/decisions">Open all decisions</TextLink></Panel></div>
  </div>;
}
