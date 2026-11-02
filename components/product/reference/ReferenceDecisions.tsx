"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRecords } from "./ReferencePages";
import { recordAttention } from "@/lib/radr/product/roleScope";
import { lifecycleLabel } from "@/lib/radr/decision/lifecycle";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { Heading, Arrow, TextLink, detailHref } from "./ReferenceUI";
const BANDS=[['all','All decisions'],['needs_you','Needs judgment'],['handling','In motion'],['resolved','Resolved'],['watching','Watching']] as const;
export function ReferenceDecisions() {
 const {records,scopeLabel,summary}=useRecords();const search=useSearchParams();const [band,setBand]=useState(search.get('band')==='verified'?'resolved':search.get('band')||'needs_you');const [query,setQuery]=useState('');const [lens,setLens]=useState("All lenses");const [sort,setSort]=useState("priority");
 const rows=records.filter(r=>(lens==="All lenses"||r.territories?.some(t=>t===lens))&&(band==='all'||(band==='resolved'?summary.groups.resolved.includes(r):recordAttention(r)===band))&&`${r.title} ${r.property} ${displayDecisionId(r.id)}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="evidence"?b.evidenceRefs.length-a.evidenceRefs.length:sort==="title"?a.title.localeCompare(b.title):0);
 return <div className="rs-page rd-workspace"><Heading focusRecord={rows[0] || null} eyebrow="Decision record" title="Know what deserves a yes." description={`${scopeLabel} · Every decision, from evidence to outcome.`} aside={<TextLink href={detailHref('/app/decisions')}>Open detailed workspace</TextLink>} />
 <div className="rd-toolbar"><div className="rd-bands" aria-label="Filter decisions">{BANDS.map(([id,label])=><button type="button" key={id} onClick={()=>setBand(id)} aria-pressed={band===id}>{label}<span>{summary.counts[id]}</span></button>)}</div><label className="rd-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a decision" aria-label="Find a decision" /></label></div>
 <div className="wb-decision-tools"><div className="wb-lenses" aria-label="Decision economic lens">{["All lenses","BUY","LABOR","SELL","RECOVER"].map(l=><button type="button" key={l} aria-pressed={lens===l} onClick={()=>setLens(l)}>{l}</button>)}</div><label>Order<select aria-label="Order decisions" value={sort} onChange={e=>setSort(e.target.value)}><option value="priority">Role priority</option><option value="evidence">Evidence depth</option><option value="title">Title A–Z</option></select></label></div>
 <div className="rd-list">{rows.map(r=>{const metric=formatPrimaryMetric(r);const attention=recordAttention(r);return <Link href={`/app/decisions/${r.id}`} key={r.id} className="rd-record" data-band={attention}><div className="rd-record-status"><span className="rd-symbol">{attention==='verified'||attention==='learned'?'✓':attention==='needs_you'?'↗':'◉'}</span><span>{displayDecisionId(r.id)}</span></div><div className="rd-record-main"><div className="rd-record-meta"><span className="rd-status" data-band={attention}>{lifecycleLabel(r.status)}</span><span>{r.property}</span></div><h2>{r.title}</h2><p>{(r.recommendationHeadline||r.contextLine).replace(/\s*—\s*/g,', ')}</p><div className="rd-record-proof"><span>{r.evidenceRefs.length} evidence items</span><span>{r.confidence.userFacing.toLowerCase()} confidence</span><span>{r.decisionDeadline||r.decisionHorizon.replaceAll('_',' ').toLowerCase()}</span></div></div><div className="rd-record-value"><strong>{metric?.money}</strong><small>{metric?.caption}</small><span>Review decision <Arrow /></span></div></Link>})}{!rows.length?<div className="rd-empty"><h2>No decisions in this view.</h2><p>Try another status or search term.</p><button type="button" onClick={()=>{setBand('all');setQuery('');setLens("All lenses")}}>Show all decisions</button></div>:null}</div>
 </div>;
}
