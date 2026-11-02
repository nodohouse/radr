"use client";

import Link from "next/link";
import {useRecords} from "./useDecisionScope";
import { useState } from "react";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";
import { recordAttention } from "@/lib/radr/product/roleScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";
import { buildMemoryOverview } from "@/lib/radr/product/memoryProofEngine";
import { DataHealthPremium } from "./DataHealthPremium";
import { IntelligenceDesk } from "./IntelligenceDesk";
import { OperatingPressure } from "./OperatingPressure";
import { OutcomeLedger } from "./OutcomeLedger";
import { MemoryEvidence } from "./MemoryEvidence";
import { DecisionWorkbench } from "./DecisionWorkbench";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { lifecycleLabel } from "@/lib/radr/decision/lifecycle";
import { getServiceCommand } from "@/lib/product/serviceCommand";
import { BERLIN_GM_LIVE_STATE, D1911_WHY_NOW } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { DecisionContextSync } from "../decision/DecisionContextSync";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { OperationalPreview } from "./OperationalPreview";
import { Arrow, Chart, Heading, Metric, Panel, TextLink, detailHref } from "./ReferenceUI";

function copy(value: string) { return value.replace(/\s*—\s*/g, ", "); }

export {useRecords} from "./useDecisionScope";

export function ReferenceValue() {
  const { roleView,vertical,records,scopeLabel } = useRecords(); const model=buildValueOverview(roleView,vertical,records); const agg=deriveValueAggregate(roleView,vertical,records);
  return <div className="rs-page"><Heading eyebrow="Value" title="Track value. Verify the outcome." description={`Verified decision outcomes · ${scopeLabel} · ${agg.currencyLabel}`} />
    <div className="rs-metrics rs-two"><Metric value={formatDecisionMoney(agg.pendingVerification,agg.currency)} label="Expected value" note="Pending verification across current decisions" href={detailHref('/app/value')} link="View details" /><Metric value={model.verifiedFormatted} label="Verified value" note="Realized this month" href={detailHref('/app/value?view=over-time')} link="See outcomes" positive /></div>
    <OutcomeLedger records={records} role={roleView}/>
    <details className="wb-secondary"><summary>Month-to-date trend and value attribution</summary><div className="rs-two-columns"><Panel title="Value trend" action={<span className="rs-meta">This month</span>}><Chart values={model.trend.map(p=>p.cumulative)} labels={model.trend.map(p=>p.label)} caption="Verified value trend, month to date" /></Panel><Panel title="Value by decision class"><div className="rs-area-list">{[...model.drivers,...model.hiddenDrivers].map(d=><Link href={detailHref(`/app/value?view=class&class=${d.id}`)} key={d.id}><span className="rs-soft-icon">◇</span><span>{d.label}<small>{d.decisionCount} {d.decisionCount===1?"verified decision":"verified decisions"}</small></span><strong>{formatDecisionMoney(d.euro,model.currency)}</strong><Arrow /></Link>)}</div></Panel></div>
    <div className="rs-proof-strip"><span className="rs-soft-icon">✓</span><div><p className="rs-eyebrow">Verified outcomes</p><p>{model.decisionCount} positive-value decision outcomes linked to evidence. Expected and verified value remain separate.</p></div><TextLink href={detailHref('/app/value')}>View evidence</TextLink></div>
    </details>
  </div>;
}

export function ReferenceMemory() {
  const { roleView,records,scopeLabel }=useRecords();const base=buildMemoryOverview(roleView,records);const ids=new Set(records.map(r=>r.id));const locations=new Set(records.map(r=>toCanonicalLocationId(r.locationId)));
  const model={...base,allLearnings:base.allLearnings.filter(l=>ids.has(l.id)),playbooks:base.playbooks.filter(p=>p.decisionIds.some(id=>ids.has(id))),dna:base.dna.filter(d=>locations.has(toCanonicalLocationId(d.locationId)))};
  const [filter,setFilter]=useState("All knowledge");
  const domains=["All knowledge",...new Set(model.allLearnings.map(l=>l.domain))];
  const rows=model.allLearnings.filter(l=>filter==="All knowledge"||l.domain===filter);
  return <div className="rs-page"><Heading eyebrow="Memory" title="Your operating memory, always on." description={`Evidence-linked learnings and operating responses · ${scopeLabel}`} />
    <div className="rs-metrics rs-three"><Metric value={model.allLearnings.length} label="Recorded learnings" note="Decision outcomes and evidence" /><Metric value={model.playbooks.length} label="Saved playbooks" note="Tested operating responses" /><Metric value={model.dna.length} label="Operating patterns" note="Built from previous decisions" /></div>
    <MemoryEvidence learnings={model.allLearnings}/>
    <details className="wb-secondary"><summary>Playbooks and knowledge index</summary><div className="rs-two-columns"><Panel title="Knowledge stream" action={<select aria-label="Filter knowledge" value={filter} onChange={e=>setFilter(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select>}><div className="rs-knowledge">{rows.slice(0,5).map((l,i)=><Link key={l.id} href={detailHref(l.href)}><span className={`rs-soft-icon rs-tone-${i%3}`}>▤</span><div><strong>{copy(l.statement)}</strong><small>{l.location} · {l.added}</small></div><span className="rs-tag">{l.domain}</span><Arrow /></Link>)}{rows.length===0?<p className="rs-empty">No learnings in this selection. Try another domain or location.</p>:null}</div></Panel>
    <div className="rs-stack">{ids.has(model.whatChanged.decisionId) ? <Panel title="Recommended for you"><Link className="rs-recommended" href={detailHref(`/app/memory?view=playbooks&playbook=${model.whatChanged.playbookId}`)}><span className="rs-dark-icon">✧</span><div><h3>{model.whatChanged.title}</h3><p>{copy(model.whatChanged.summary)}</p><span className="rs-pill">{model.whatChanged.toVersion} · Current playbook</span></div><Arrow /></Link></Panel> : null}<Panel title="Saved playbooks" action={<TextLink href={detailHref('/app/memory?view=playbooks')}>See all</TextLink>}><div className="rs-compact-list">{model.playbooks.slice(0,4).map(p=><Link key={p.id} href={detailHref(`/app/memory?view=playbooks&playbook=${p.id}`)}><span className="rs-soft-icon">▤</span><span>{p.name}<small>{p.scope} · {p.version}</small></span><Arrow /></Link>)}{model.playbooks.length===0 ? <p className="rs-empty">No decision-linked playbooks in this selection yet.</p> : null}</div></Panel></div></div>
    </details>
  </div>;
}

export function ReferenceIntelligence() {
 const {records,scopeLabel}=useRecords();return <IntelligenceDesk records={records} scopeLabel={scopeLabel}/>;
}

export function ReferenceHealth() {
 const {roleView,vertical,records}=useRecords();
 return <DataHealthPremium role={roleView} vertical={vertical} records={records}/>;
}

function ServiceSnapshotUnavailable({scopeLabel}:{scopeLabel:string}) { return <div className="rs-page"><Heading eyebrow="Service snapshot" title="The right evidence for this location." description={scopeLabel} /><Panel title="No service snapshot in this selection"><p className="rs-empty">The current restaurant demo includes a live service snapshot for Soho · New York. Choose Soho to explore its floor, demand, and operating pressure. Other locations keep their own decision records.</p><TextLink href="/app/decisions">Explore selected decisions</TextLink></Panel></div>; }

export function ReferenceLive() {
  const {locationScope,comparisonLocationIds,scopeLabel}=useRecords();
  const snapshotVisible = comparisonLocationIds.length>=2 ? comparisonLocationIds.map(toCanonicalLocationId).includes('loc_berlin_mitte') : locationScope==='all' || toCanonicalLocationId(locationScope)==='loc_berlin_mitte';
  const model=getServiceCommand();const state=BERLIN_GM_LIVE_STATE;
  if(!snapshotVisible) return <ServiceSnapshotUnavailable scopeLabel={scopeLabel} />;
  const alerts=model.pressure.filter(p=>p.current>=85);
  return <div className="rs-page wb-live-page"><Heading eyebrow="Live Operations" title="Tonight at a glance." description={`Live service performance at ${model.location}.`} aside={<TextLink href="/app/live/plan">Edit floor plan</TextLink>} />
    <div className="rs-metrics rs-three"><Metric value={state.covers} label="Total covers" note={`${state.coversDeltaPct}% vs plan`} /><Metric value={`${D1911_WHY_NOW.averageTicketMin} min`} label="Average ticket time" note="Current dinner-service evidence" /><Metric value={model.kpis.find(k=>k.id==='occupancy')?.value||`${state.bookedCapacityPct}%`} label="Occupancy" note={model.location} /></div>
    <OperationalPreview immersive />
    <details className="wb-secondary"><summary>Demand, live alerts and area pressure</summary><div className="rs-two-columns"><Panel title="Service demand" action={<span className="rs-meta">Tonight</span>}><Chart values={model.demand.map(d=>d.current)} labels={model.demand.map(d=>d.time)} caption="Current service demand from the operating demo" bars={false} /></Panel><Panel title="Live alerts" action={<TextLink href={detailHref('/app/live')}>View all</TextLink>}><div className="rs-alerts">{alerts.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)} data-risk={p.current>=90||undefined}><span className="rs-alert-icon">!</span><div><strong>{p.label} pressure is high</strong><p>{p.current}% current load</p><small>{p.cause}</small></div><Arrow /></Link>)}</div></Panel></div>
    <Panel title="Operating areas" action={<TextLink href={detailHref('/app/live')}>Open live floor</TextLink>}><div className="rs-area-tiles">{model.pressure.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)}><span><i data-warning={p.current>=85||undefined}/>{p.label}</span><strong>{p.current}%</strong><div className="rs-area-load" aria-hidden="true"><i style={{width:`${Math.min(100,p.current)}%`}} /></div></Link>)}</div></Panel>
    </details>
  </div>;
}

export function ReferenceOperations() {
  const {locationScope,comparisonLocationIds,scopeLabel}=useRecords();
  const snapshotVisible = comparisonLocationIds.length>=2 ? comparisonLocationIds.map(toCanonicalLocationId).includes('loc_berlin_mitte') : locationScope==='all' || toCanonicalLocationId(locationScope)==='loc_berlin_mitte';
  const model=getServiceCommand();const [filter,setFilter]=useState('All areas');
  if(!snapshotVisible) return <ServiceSnapshotUnavailable scopeLabel={scopeLabel} />;
  const rows=filter==='All areas'?model.staff:model.staff.filter(s=>`${s.role} ${s.task}`.toLowerCase().includes(filter.toLowerCase()));
  const waiting=model.tables.filter(t=>t.tone==='wait');const issues=model.pressure.filter(p=>p.current>=85);
  return <div className="rs-page"><Heading eyebrow="Operations" title="Keep your operation on track." description={`Service readiness and operational decisions · ${model.location}`} aside={<TextLink href={detailHref('/app/service')}>Open service floor</TextLink>} />
    <div className="rs-metrics rs-four"><Metric value={model.kpis.find(k=>k.id==='occupancy')?.value||'Current'} label="Occupancy" note={model.location} /><Metric value={model.staff.length} label="Assigned staff" note="Current service assignments" /><Metric value={waiting.length} label="Tables needing attention" note="Waiting or delayed" /><Metric value={model.kpis.find(k=>k.id==='kitchen')?.value||'Current'} label="Kitchen load" note="Current service evidence" /></div>
    <OperatingPressure/>
    <details className="wb-secondary"><summary>Team assignments and table follow-ups</summary><div className="rs-two-columns"><Panel title="Current assignments"><div className="rs-tabs">{['All areas','Kitchen','Floor','Bar'].map(t=><button type="button" key={t} data-active={filter===t||undefined} onClick={()=>setFilter(t)}>{t}</button>)}</div><div className="rs-assignments"><div className="rs-assignment-head"><span>Team member</span><span>Current task</span><span>Status</span></div>{rows.map(s=><Link href={detailHref('/app/service?view=staff')} key={s.id}><span><strong>{s.name}</strong><small>{s.role}</small></span><span className="rs-task-bar">{s.task}</span><span className="rs-tag">{s.status}</span></Link>)}{rows.length===0?<p className="rs-empty">No assignments in this area.</p>:null}</div></Panel><div className="rs-stack"><Panel title="Operational tasks" action={<TextLink href={detailHref('/app/service')}>View all</TextLink>}><div className="rs-task-list">{waiting.slice(0,4).map(t=><Link href={detailHref(`/app/service?table=${t.id}`)} key={t.id}><i /><span>Review Table {t.n}<small>{t.stage||t.statusLabel}</small></span><span>{t.waitMin ? `${t.waitMin} min` : t.statusLabel}</span></Link>)}</div></Panel><Panel title="Active issues"><div className="rs-task-list">{issues.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)}><i data-risk /><span>{p.label}<small>{p.cause}</small></span><span className="rs-tag">{p.current}%</span></Link>)}</div></Panel></div></div>
    </details>
  </div>;
}

export function ReferenceSupplier({ record }: { record: DecisionRecord }) {
  const metric=formatPrimaryMetric(record);const resolved=!!record.verifiedValue;const band=recordAttention(record);
  return <div className="rs-page rs-supplier"><DecisionContextSync decisionId={record.id} record={record} /><p className="rs-eyebrow">Decisions / {customerDecisionClass(record)}</p><div className="rs-supplier-banner"><span className="rs-document-icon">▤</span><div><p>Evidence connected · {displayDecisionId(record.id)}</p><h1>{record.title}</h1><span>{record.property}</span></div><span className="rs-pill">{lifecycleLabel(record.status)}</span></div>
    <div className="rs-metrics rs-four"><Metric value={metric?.money||formatDecisionMoney(record.expectedContributionImpact)} label={resolved?'Verified contribution':'Expected value'} note={metric?.caption||'Pending review'} positive={resolved} /><Metric value={<span className="rs-word-value">{record.confidence.userFacing}</span>} label="Confidence" note="Decision evidence confidence" /><Metric value={record.evidenceRefs.length} label="Evidence items" note={record.property} /><Metric value={<span className="rs-word-value">{resolved?'Verified':band==='needs_you'?'Review':band==='handling'?'In progress':'Watching'}</span>} label="Decision status" note={record.decisionDeadline||record.contextLine} /></div>
    <section className="wb-decision-direction"><div><span>{resolved?"Recorded outcome":"Recommended response"}</span><h2>{record.recommendationHeadline||record.title}</h2><p>{record.decisionDeadline} · {resolved?"Review the attribution evidence":`Approval role: ${record.requiredRole}`}</p></div><Link className="wb-primary" href={detailHref(`/app/decisions/${record.id}#${resolved?"verification":"action"}`)}>{resolved?"Review verification":"Review prepared action"}<Arrow/></Link></section>
    <DecisionWorkbench key={record.id} record={record}/>
    <nav className="rs-lifecycle" aria-label="Decision lifecycle">{['Evidence','Context','Futures','Recommendation','Action','Verification'].map((s,i)=><Link key={s} href={detailHref(`/app/decisions/${record.id}#${s==='Context'?'state':s.toLowerCase()}`)} data-active={i===0||undefined}>{s}</Link>)}</nav>
  </div>;
}
