"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "../useDemoOrg";
import { recordsForLocationSelection } from "@/lib/radr/product/selectedScope";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { decisionSummary } from "@/lib/radr/product/decisionSummary";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";
import { subscribeDecisionStore, getDecisionStoreSnapshot } from "@/lib/radr/decision/store";
import { scopedDecisionsForDemo, recordAttention } from "@/lib/radr/product/roleScope";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";
import { buildMemoryOverview } from "@/lib/radr/product/memoryProofEngine";
import { buildDataHealthOverview } from "@/lib/radr/product/dataHealthProofEngine";
import { allFindings, findingStateFromDecision } from "@/lib/radr/product/intelligenceEngine";
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

export function useRecords() {
  const snap = useSyncExternalStore(subscribeDecisionStore,getDecisionStoreSnapshot,getDecisionStoreSnapshot);
  const { roleView, locationScope, comparisonLocationIds, locationMode } = useProduct(); const { session } = useDemoOrg();
  const selected = locationMode === "comparison" ? comparisonLocationIds : [];
  const scopeLabel = selected.length >= 2 ? `${selected.length} selected locations` : locationScope === "all" ? "All locations" : locationScope.startsWith("region_") ? locationScope.replace("region_", "").replace(/_/g, " ") : locationDisplayName(toCanonicalLocationId(locationScope));
  const records = recordsForLocationSelection(scopedDecisionsForDemo(Object.values(snap.records),roleView,session.vertical), locationScope, selected);
  return { roleView, vertical: session.vertical, records, summary: decisionSummary(records), locationScope, scopeLabel, comparisonLocationIds: selected };
}

export function ReferenceValue() {
  const { roleView,vertical,records,scopeLabel } = useRecords(); const model=buildValueOverview(roleView,vertical,records); const agg=deriveValueAggregate(roleView,vertical,records);
  return <div className="rs-page"><Heading eyebrow="Value" title="Track value. Verify the outcome." description={`Verified decision outcomes · ${scopeLabel} · ${agg.currencyLabel}`} />
    <div className="rs-metrics rs-two"><Metric value={formatDecisionMoney(agg.pendingVerification,agg.currency)} label="Expected value" note="Pending verification across current decisions" href={detailHref('/app/value')} link="View details" /><Metric value={model.verifiedFormatted} label="Verified value" note="Realized this month" href={detailHref('/app/value?view=over-time')} link="See outcomes" positive /></div>
    <div className="rs-two-columns"><Panel title="Value trend" action={<span className="rs-meta">This month</span>}><Chart values={model.trend.map(p=>p.cumulative)} labels={model.trend.map(p=>p.label)} caption="Verified value trend, month to date" /></Panel><Panel title="Value by decision class"><div className="rs-area-list">{[...model.drivers,...model.hiddenDrivers].map(d=><Link href={detailHref(`/app/value?view=class&class=${d.id}`)} key={d.id}><span className="rs-soft-icon">◇</span><span>{d.label}<small>{d.decisionCount} {d.decisionCount===1?"verified decision":"verified decisions"}</small></span><strong>{formatDecisionMoney(d.euro,model.currency)}</strong><Arrow /></Link>)}</div></Panel></div>
    <div className="rs-proof-strip"><span className="rs-soft-icon">✓</span><div><p className="rs-eyebrow">Verified outcomes</p><p>{model.decisionCount} positive-value decision outcomes linked to evidence. Expected and verified value remain separate.</p></div><TextLink href={detailHref('/app/value')}>View evidence</TextLink></div>
  </div>;
}

export function ReferenceMemory() {
  const { roleView,records,scopeLabel }=useRecords();const base=buildMemoryOverview(roleView);const ids=new Set(records.map(r=>r.id));const locations=new Set(records.map(r=>toCanonicalLocationId(r.locationId)));
  const model={...base,allLearnings:base.allLearnings.filter(l=>ids.has(l.id)),playbooks:base.playbooks.filter(p=>p.decisionIds.some(id=>ids.has(id))),dna:base.dna.filter(d=>locations.has(toCanonicalLocationId(d.locationId)))};
  const [filter,setFilter]=useState("All knowledge");
  const domains=["All knowledge",...new Set(model.allLearnings.map(l=>l.domain))];
  const rows=model.allLearnings.filter(l=>filter==="All knowledge"||l.domain===filter);
  return <div className="rs-page"><Heading eyebrow="Memory" title="Your operating memory, always on." description={`Evidence-linked learnings and operating responses · ${scopeLabel}`} />
    <div className="rs-metrics rs-three"><Metric value={model.allLearnings.length} label="Recorded learnings" note="Decision outcomes and evidence" /><Metric value={model.playbooks.length} label="Saved playbooks" note="Tested operating responses" /><Metric value={model.dna.length} label="Operating patterns" note="Built from previous decisions" /></div>
    <div className="rs-two-columns"><Panel title="Knowledge stream" action={<select aria-label="Filter knowledge" value={filter} onChange={e=>setFilter(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select>}><div className="rs-knowledge">{rows.slice(0,5).map((l,i)=><Link key={l.id} href={detailHref(l.href)}><span className={`rs-soft-icon rs-tone-${i%3}`}>▤</span><div><strong>{copy(l.statement)}</strong><small>{l.location} · {l.added}</small></div><span className="rs-tag">{l.domain}</span><Arrow /></Link>)}{rows.length===0?<p className="rs-empty">No learnings in this selection. Try another domain or location.</p>:null}</div></Panel>
    <div className="rs-stack">{ids.has(model.whatChanged.decisionId) ? <Panel title="Recommended for you"><Link className="rs-recommended" href={detailHref(`/app/memory?view=playbooks&playbook=${model.whatChanged.playbookId}`)}><span className="rs-dark-icon">✧</span><div><h3>{model.whatChanged.title}</h3><p>{copy(model.whatChanged.summary)}</p><span className="rs-pill">{model.whatChanged.toVersion} · Current playbook</span></div><Arrow /></Link></Panel> : null}<Panel title="Saved playbooks" action={<TextLink href={detailHref('/app/memory?view=playbooks')}>See all</TextLink>}><div className="rs-compact-list">{model.playbooks.slice(0,4).map(p=><Link key={p.id} href={detailHref(`/app/memory?view=playbooks&playbook=${p.id}`)}><span className="rs-soft-icon">▤</span><span>{p.name}<small>{p.scope} · {p.version}</small></span><Arrow /></Link>)}{model.playbooks.length===0 ? <p className="rs-empty">No decision-linked playbooks in this selection yet.</p> : null}</div></Panel></div></div>
  </div>;
}

export function ReferenceIntelligence() {
  const { records, scopeLabel } = useRecords();const findings=allFindings().filter(f => records.some(r => r.id === f.decisionId)).map(f => ({ ...f, state: findingStateFromDecision(records.find(r => r.id === f.decisionId)?.status, f.state) }));const [selected,setSelected]=useState(findings[0]?.id);const current=findings.find(f=>f.id===selected)||findings[0];
  const recommendations=findings.filter(f=>f.recommendations.length>0);const risks=findings.filter(f=>f.state==="DATA_DEGRADED"||f.state==="WATCHING");
  return <div className="rs-page"><Heading eyebrow="Intelligence" title="Signals into decisions." description={`Connected signals and evidence · ${scopeLabel}`} />
    <div className="rs-metrics rs-three"><Metric value={findings.length} label="Signals detected" note="Across the current demo evidence" href={detailHref('/app/intelligence')} link="View signals" /><Metric value={recommendations.length} label="Prepared recommendations" note="Ready for closer review" href={detailHref('/app/intelligence')} link="See recommendations" /><Metric value={risks.length} label="Signals to watch" note="Evidence or operating risk" href={detailHref('/app/intelligence')} link="Review risks" /></div>
    {current ? <div className="rs-two-columns"><div className="rs-stack"><Panel className="rs-feature-insight" title="Insight summary" action={<span className="rs-meta">{current.confidencePct}% confidence</span>}><p className="rs-insight-summary">{copy(current.whatRadrSees)}</p></Panel><Panel title="Signal relationships"><div className="rs-relationship"><div>{current.evidenceSources.slice(0,2).map(s=><span key={s.system}><i />{s.system}</span>)}</div><div className="rs-relation-center"><span className="rs-dark-icon">▤</span><strong>{current.title}</strong></div><div>{current.recommendations.slice(0,2).map(r=><span key={r.id}><i />{r.title}</span>)}</div></div></Panel></div><Panel title="Signals worth a closer look"><div className="rs-ranked">{findings.slice(0,3).map((f,i)=><button key={f.id} type="button" onClick={()=>setSelected(f.id)} aria-pressed={current?.id===f.id} data-selected={current?.id===f.id||undefined}><b>{i+1}</b><span><strong>{f.title}</strong><small>{copy(f.summary)}</small></span><em>{f.confidencePct}%</em></button>)}</div><h3 className="rs-subheading">Evidence and risk</h3><div className="rs-ranked">{risks.slice(0,2).map((f,i)=><button key={f.id} type="button" onClick={()=>setSelected(f.id)}><b className="rs-risk">{i+1}</b><span><strong>{f.title}</strong><small>{copy(f.whyItMatters)}</small></span></button>)}</div><TextLink href={detailHref(`/app/intelligence?finding=${current.id}`)}>Explore selected signal</TextLink></Panel></div> : null}
  </div>;
}

export function ReferenceHealth() {
  const { roleView,vertical }=useRecords();const model=buildDataHealthOverview(roleView,vertical);
  if(vertical === "hotel") return <div className="rs-page"><Heading eyebrow="Data Health" title="A clear view of your evidence." description="Hotel evidence health" /><Panel title="Hotel source snapshot not available"><p className="rs-empty">This demo includes a restaurant source-health snapshot. Hotel decisions retain their own evidence and confidence; restaurant connection scores are not shown for hotel properties.</p><TextLink href="/app/connections">Review hotel connections</TextLink></Panel></div>;
  const fresh=model.sourceTotal?Math.round(model.sources.reduce((s,r)=>s+r.freshnessScore,0)/model.sourceTotal):0;
  return <div className="rs-page"><Heading eyebrow="Data Health" title={model.attentionCount ? "Your evidence, in focus." : "Your data is healthy."} description="Restaurant estate source health · 10 locations · independent of the current decision selection" aside={<span className="rs-pill" data-warning={model.attentionCount>0||undefined}><i />{model.attentionCount ? `${model.attentionCount} sources need review` : 'All sources healthy'}</span>} />
    <div className="rs-metrics rs-four"><Metric value={model.sourceTotal} label="Connections" note="Evidence sources" /><Metric value={`${fresh}%`} label="Data freshness" note="Average source freshness score" /><Metric value={model.attentionCount} label="Open issues" note="Sources needing attention" /><Metric value={`${model.trustScore}%`} label="Evidence trust" note="Derived from source quality" /></div>
    <div className="rs-two-columns"><Panel title="Source connections" action={<TextLink href="/app/connections">View all</TextLink>}><div className="rs-source-table"><div className="rs-table-labels"><span>Source</span><span>Status</span><span>Last update</span><span>Freshness</span></div>{model.sources.slice(0,5).map(s=><Link key={s.id} href={detailHref(`/app/data-health?source=${s.id}`)}><strong>{s.name}</strong><span className="rs-source-status" data-warning={s.status!=="HEALTHY"||undefined}><i />{s.status.toLowerCase()}</span><span>{s.lastSync}</span><span className="rs-tag">{s.freshnessLabel.toLowerCase()}</span></Link>)}</div></Panel><Panel title="Evidence quality"><div className="rs-quality"><div className="rs-donut" style={{background:`conic-gradient(#1755ed ${model.trustScore*3.6}deg,#e8eef6 0)`}}><span><strong>{model.trustScore}%</strong><small>Trust score</small></span></div><div><p><i />Healthy <b>{model.healthyCount}</b></p><p>Degraded <b>{model.degradedCount}</b></p><p>Stale <b>{model.staleCount}</b></p></div></div></Panel></div>
    <div className="rs-two-columns"><Panel title="Decision impact"><div className="rs-check-list"><p>✓ {model.decisionsAffected} decisions affected by source quality</p><p>✓ {model.sourcesAffectingDecisions} sources feeding current decisions</p><p>✓ Required degraded sources limit confidence and require human approval</p></div><TextLink href={detailHref('/app/data-health')}>View details</TextLink></Panel><div className="rs-proof-strip rs-quality-note"><span className="rs-soft-icon">✧</span><div><h3>{model.attentionCount ? 'A clearer picture starts here.' : 'Good to go.'}</h3><p>{model.attentionCount ? 'Review the flagged sources before relying on affected decisions. Degraded evidence limits active recommendation confidence and permitted autonomy.' : 'Your evidence sources are connected and within the expected quality range.'}</p></div></div></div>
  </div>;
}

function ServiceSnapshotUnavailable({scopeLabel}:{scopeLabel:string}) { return <div className="rs-page"><Heading eyebrow="Service snapshot" title="The right evidence for this location." description={scopeLabel} /><Panel title="No service snapshot in this selection"><p className="rs-empty">The current restaurant demo includes a live service snapshot for Soho · New York. Choose Soho to explore its floor, demand, and operating pressure. Other locations keep their own decision records.</p><TextLink href="/app/decisions">Explore selected decisions</TextLink></Panel></div>; }

export function ReferenceLive() {
  const {locationScope,comparisonLocationIds,scopeLabel}=useRecords();
  const snapshotVisible = comparisonLocationIds.length>=2 ? comparisonLocationIds.map(toCanonicalLocationId).includes('loc_berlin_mitte') : locationScope==='all' || toCanonicalLocationId(locationScope)==='loc_berlin_mitte';
  const model=getServiceCommand();const state=BERLIN_GM_LIVE_STATE;
  if(!snapshotVisible) return <ServiceSnapshotUnavailable scopeLabel={scopeLabel} />;
  const alerts=model.pressure.filter(p=>p.current>=85);
  return <div className="rs-page"><Heading eyebrow="Live Operations" title="Tonight at a glance." description={`Live service performance at ${model.location}.`} aside={<span className="rs-pill"><i />Live · {model.liveTime}</span>} />
    <OperationalPreview immersive />
    <div className="rs-metrics rs-three"><Metric value={state.covers} label="Total covers" note={`${state.coversDeltaPct}% vs plan`} /><Metric value={`${D1911_WHY_NOW.averageTicketMin} min`} label="Average ticket time" note="Current dinner-service evidence" /><Metric value={model.kpis.find(k=>k.id==='occupancy')?.value||`${state.bookedCapacityPct}%`} label="Occupancy" note={model.location} /></div>
    <div className="rs-two-columns"><Panel title="Service demand" action={<span className="rs-meta">Tonight</span>}><Chart values={model.demand.map(d=>d.current)} labels={model.demand.map(d=>d.time)} caption="Current service demand from the operating demo" bars={false} /></Panel><Panel title="Live alerts" action={<TextLink href={detailHref('/app/live')}>View all</TextLink>}><div className="rs-alerts">{alerts.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)} data-risk={p.current>=90||undefined}><span className="rs-alert-icon">!</span><div><strong>{p.label} pressure is high</strong><p>{p.current}% current load</p><small>{p.cause}</small></div><Arrow /></Link>)}</div></Panel></div>
    <Panel title="Operating areas" action={<TextLink href={detailHref('/app/live')}>Open live floor</TextLink>}><div className="rs-area-tiles">{model.pressure.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)}><span><i data-warning={p.current>=85||undefined}/>{p.label}</span><strong>{p.current}%</strong><div className="rs-area-load" aria-hidden="true"><i style={{width:`${Math.min(100,p.current)}%`}} /></div></Link>)}</div></Panel>
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
    <div className="rs-two-columns"><Panel title="Current assignments"><div className="rs-tabs">{['All areas','Kitchen','Floor','Bar'].map(t=><button type="button" key={t} data-active={filter===t||undefined} onClick={()=>setFilter(t)}>{t}</button>)}</div><div className="rs-assignments"><div className="rs-assignment-head"><span>Team member</span><span>Current task</span><span>Status</span></div>{rows.map(s=><Link href={detailHref('/app/service?view=staff')} key={s.id}><span><strong>{s.name}</strong><small>{s.role}</small></span><span className="rs-task-bar">{s.task}</span><span className="rs-tag">{s.status}</span></Link>)}{rows.length===0?<p className="rs-empty">No assignments in this area.</p>:null}</div></Panel><div className="rs-stack"><Panel title="Operational tasks" action={<TextLink href={detailHref('/app/service')}>View all</TextLink>}><div className="rs-task-list">{waiting.slice(0,4).map(t=><Link href={detailHref(`/app/service?table=${t.id}`)} key={t.id}><i /><span>Review Table {t.n}<small>{t.stage||t.statusLabel}</small></span><span>{t.waitMin ? `${t.waitMin} min` : t.statusLabel}</span></Link>)}</div></Panel><Panel title="Active issues"><div className="rs-task-list">{issues.map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)}><i data-risk /><span>{p.label}<small>{p.cause}</small></span><span className="rs-tag">{p.current}%</span></Link>)}</div></Panel></div></div>
  </div>;
}

export function ReferenceSupplier({ record }: { record: DecisionRecord }) {
  const metric=formatPrimaryMetric(record);const resolved=!!record.verifiedValue;const band=recordAttention(record);const statusLabel=lifecycleLabel(record.status);
  return <div className="rs-page rs-supplier"><DecisionContextSync decisionId={record.id} record={record} /><p className="rs-eyebrow">Decisions / {customerDecisionClass(record)}</p><div className="rs-supplier-banner"><span className="rs-document-icon">▤</span><div><p>Evidence connected · {displayDecisionId(record.id)}</p><h1>{record.title}</h1><span>{record.property}</span></div><span className="rs-pill">{lifecycleLabel(record.status)}</span></div>
    <div className="rs-metrics rs-four"><Metric value={metric?.money||formatDecisionMoney(record.expectedContributionImpact)} label={resolved?'Verified contribution':'Expected value'} note={metric?.caption||'Pending review'} positive={resolved} /><Metric value={<span className="rs-word-value">{record.confidence.userFacing}</span>} label="Confidence" note="Decision evidence confidence" /><Metric value={record.evidenceRefs.length} label="Evidence items" note={record.property} /><Metric value={<span className="rs-word-value">{resolved?'Verified':band==='needs_you'?'Review':band==='handling'?'In progress':'Watching'}</span>} label="Decision status" note={record.decisionDeadline||record.contextLine} /></div>
    <div className="rs-two-columns rs-equal"><Panel title="Supporting evidence"><div className="rs-evidence-list">{record.evidenceRefs.slice(0,4).map(e=><Link href={detailHref(`/app/decisions/${record.id}#evidence`)} key={e.id}><span className="rs-soft-icon">▤</span><div><strong>{e.label}</strong><p>{e.value}</p><small>{e.source} · {e.freshness}</small></div></Link>)}</div><TextLink href={detailHref(`/app/decisions/${record.id}#evidence`)}>View all evidence</TextLink></Panel><Panel title={resolved?'Verified outcome':'Recommended action'} className="rs-action-panel"><span className="rs-pill">{resolved?'Evidence-linked result':band==='needs_you'?'Human approval required':statusLabel}</span><h2>{record.recommendationHeadline||record.title}</h2><p>{copy(record.recommendationReasoning)}</p><div className="rs-check-list">{record.actionPlan.steps.slice(0,3).map(s=><p key={s.id}>✓ {s.title}</p>)}</div><Link className="rs-primary-button" href={detailHref(`/app/decisions/${record.id}#action`)}>{resolved?'Review outcome':band==='needs_you'?'Review prepared action':'Open decision workspace'}<Arrow /></Link><small>{resolved?'Trace the evidence behind the result.':band==='needs_you'?'Review the evidence before approving an action.':'Follow the decision through its current stage.'}</small></Panel></div>
    <nav className="rs-lifecycle" aria-label="Decision lifecycle">{['Evidence','State','Futures','Recommendation','Action','Verification'].map((s,i)=><Link key={s} href={detailHref(`/app/decisions/${record.id}#${s.toLowerCase()}`)} data-active={i===0||undefined}>{s}</Link>)}</nav>
  </div>;
}
