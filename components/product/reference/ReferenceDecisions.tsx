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
const BANDS=[['all','All decisions'],['needs_you','Needs you'],['handling','In progress'],['verified','Verified'],['watching','Watching']] as const;
export function ReferenceDecisions() {
 const {records,scopeLabel}=useRecords();const search=useSearchParams();const [band,setBand]=useState(search.get('band')||'all');const [query,setQuery]=useState('');
 const rows=records.filter(r=>(band==='all'||recordAttention(r)===band||(band==='verified'&&recordAttention(r)==='learned'))&&`${r.title} ${r.property} ${displayDecisionId(r.id)}`.toLowerCase().includes(query.toLowerCase()));
 return <div className="rs-page rd-workspace"><Heading eyebrow="Decision record" title="Know what deserves a yes." description={`${scopeLabel} · Every decision, from evidence to outcome.`} aside={<TextLink href={detailHref('/app/decisions')}>Open detailed workspace</TextLink>} />
 <div className="rd-toolbar"><div className="rd-bands" aria-label="Filter decisions">{BANDS.map(([id,label])=><button type="button" key={id} onClick={()=>setBand(id)} aria-pressed={band===id}>{label}<span>{records.filter(r=>id==='all'||recordAttention(r)===id||(id==='verified'&&recordAttention(r)==='learned')).length}</span></button>)}</div><label className="rd-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a decision" aria-label="Find a decision" /></label></div>
 <div className="rd-list">{rows.map(r=>{const metric=formatPrimaryMetric(r);const attention=recordAttention(r);return <Link href={`/app/decisions/${r.id}`} key={r.id} className="rd-record" data-band={attention}><div className="rd-record-status"><span className="rd-symbol">{attention==='verified'||attention==='learned'?'✓':attention==='needs_you'?'↗':'◉'}</span><span>{displayDecisionId(r.id)}</span></div><div className="rd-record-main"><div className="rd-record-meta"><span className="rd-status" data-band={attention}>{lifecycleLabel(r.status)}</span><span>{r.property}</span></div><h2>{r.title}</h2><p>{(r.recommendationHeadline||r.contextLine).replace(/\s*—\s*/g,', ')}</p><div className="rd-record-proof"><span>{r.evidenceRefs.length} evidence items</span><span>{r.confidence.userFacing.toLowerCase()} confidence</span><span>{r.decisionDeadline||r.decisionHorizon.replaceAll('_',' ').toLowerCase()}</span></div></div><div className="rd-record-value"><strong>{metric?.money}</strong><small>{metric?.caption}</small><span>Review decision <Arrow /></span></div></Link>})}{!rows.length?<div className="rd-empty"><h2>No decisions in this view.</h2><p>Try another status or search term.</p><button type="button" onClick={()=>{setBand('all');setQuery('')}}>Show all decisions</button></div>:null}</div>
 </div>;
}
