"use client";

import { useState } from "react";
import Link from "next/link";
import { CONNECTION_CATALOG, VendorLogo } from "./VendorLogo";
import { Heading, TextLink } from "../reference/ReferenceUI";
import { useRecords } from "../reference/useDecisionScope";
import { evidenceNeedsReview } from "@/lib/product/evidencePresentation";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import "./hotel-evidence-workbench.css";

const SOURCES = [
  { id:"mews", label:"Property management", purpose:"Room readiness, incoming stays and guest needs", keys:"Property ID · room ID · booking ID", checks:["Confirm the property and permitted datasets.","Match room and stay identifiers before joining guest notes.","Compare room status and arrival timestamps with the source."], risk:"An arrival can look ready while its room or guest requirements are still unresolved." },
  { id:"opera-cloud", label:"Property management", purpose:"Reservations, room inventory and stay lifecycle", keys:"Hotel code · reservation ID · room ID", checks:["Confirm Oracle partner and property access.","Map reservation status, room types and cancellation rules.","Reconcile the initial inventory and incoming stays."], risk:"A mismatched stay can put a guest note on the wrong arrival. Keep physical rooms and bookings separate." },
  { id:"stripe", label:"Payments", purpose:"Payment events, refunds and settlement evidence", keys:"Payment ID · refund ID · currency", checks:["Confirm the account and read permissions.","Match refunds and settlements to their originating transactions.","Reconcile currency, fees and the settlement period."], risk:"Booked sales and settled cash are different measures. A refund request is not proof of recovered value." },
  { id:"xero", label:"Finance", purpose:"Supplier documents, credits and accounting review", keys:"Invoice ID · supplier ID · credit reference", checks:["Confirm the legal entity and accounting period.","Match invoice lines, credit references and currency.","Review posting status before recognizing a verified outcome."], risk:"A proposed supplier credit remains expected until the credit and accounting evidence can be matched." },
  { id:"deputy", label:"Workforce", purpose:"Shift coverage and housekeeping capacity", keys:"Location ID · staff ID · shift time", checks:["Confirm location scope and staff-data permissions.","Normalize shift dates, time zones and role definitions.","Compare available coverage with the arrival and service window."], risk:"A headcount alone does not show whether the right team is available at the right time." },
] as const;

export function HotelSourceCatalog({ embedded=false }: { embedded?:boolean }) {
  const { records, scopeLabel } = useRecords();
  const [selected, setSelected] = useState<string>("mews");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("checks");
  const source = SOURCES.find(item=>item.id===selected)!;
  const provider = CONNECTION_CATALOG.find(item=>item.id===source.id)!;
  const sources = SOURCES.filter(item=>`${item.label} ${item.purpose} ${CONNECTION_CATALOG.find(provider=>provider.id===item.id)?.name}`.toLowerCase().includes(query.toLowerCase()));
  const evidenceCount = records.reduce((sum,record)=>sum+record.evidenceRefs.length,0);
  const review = records.filter(evidenceNeedsReview);
  const workbench = <div className="he-workbench" data-testid="hotel-evidence-workbench">
    <div className="he-summary" aria-label="Hotel evidence overview">
      <div><span>Source quality</span><strong>Unmeasured</strong><p>Provider checks are not recorded.</p></div>
      <div><span>Decision evidence</span><strong>{evidenceCount}<small> references</small></strong><p>In {records.length} selected demo decisions.</p></div>
      <div><span>Review queue</span><strong>{review.length}<small> decisions</small></strong><p>Inspect the evidence before acting.</p></div>
    </div>
    <div className="he-readiness"><span className="he-status-dot"/><div><strong>Know what needs to be checked.</strong><p>These are integration options, not connected-source claims. Decision evidence is illustrative; credentials, coverage and a successful sync must be checked before source quality can be measured.</p></div><Link href="/app/connections/import">Review a data export →</Link></div>
    <div className="he-grid">
      <section className="he-sources" aria-label="Hotel evidence sources"><header><h2>Your evidence sources</h2><span>{SOURCES.length} options</span></header><label className="he-search"><span className="sr-only">Find a hotel source</span><input type="search" placeholder="Find a source or workflow" value={query} onChange={event=>setQuery(event.target.value)}/></label><div className="he-source-list">{sources.map(item=>{const vendor=CONNECTION_CATALOG.find(provider=>provider.id===item.id)!;return <button type="button" key={item.id} aria-pressed={item.id===selected} onClick={()=>{setSelected(item.id);setTab("checks");}}><VendorLogo id={item.id} name={vendor.name} size={40}/><span><strong>{vendor.name}</strong><small>{item.label}</small></span><em>Not assessed</em></button>;})}{!sources.length?<p className="he-empty">No matching source. Try a workflow such as payments or rooms.</p>:null}</div><footer>Integration availability and access are confirmed separately. No source has been connected from this demo.</footer></section>
      <section className="he-inspector" aria-label={`${provider.name} evidence review`}><header><VendorLogo id={source.id} name={provider.name} size={44}/><div><span>{source.label}</span><h2>{provider.name}</h2></div><span className="he-tag">Unmeasured</span></header><p className="he-purpose">{source.purpose}</p><div className="he-tabs" role="group" aria-label="Evidence review views">{[["checks","Quality checks"],["improve","Improve readiness"],["decisions","Decision evidence"]].map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
        {tab==="checks"?<div className="he-checks"><div className="he-risk"><strong>Why this matters</strong><p>{source.risk}</p></div>{["Freshness","Completeness","Consistency","Coverage"].map((label,index)=><div className="he-check" key={label}><span className="he-check-index">0{index+1}</span><div><strong>{label}</strong><small>{["When was the required record last updated?","Are required fields and identifiers present?","Do values reconcile across the source and operating model?","Does this dataset cover the selected property and period?"][index]}</small></div><span>Not assessed</span></div>)}<p className="he-footnote">Source quality requires validation for the selected property and period.</p></div>:null}
        {tab==="improve"?<div className="he-improve"><h3>Make the next review concrete.</h3><ol>{source.checks.map(check=><li key={check}>{check}</li>)}</ol><div className="he-keys"><span>Identifiers to prepare</span><strong>{source.keys}</strong></div><Link href="/app/connections/import">Check a structured export →</Link><p>File checks run in the browser preview. They do not establish a live connection or change source quality.</p></div>:null}
        {tab==="decisions"?<div className="he-decisions"><p>Selected hotel decisions carry their own evidence. These links do not claim that {provider.name} supplied or verified those records.</p>{(review.length?review:records).slice(0,5).map(record=><Link key={record.id} href={`/app/decisions/${record.id}`}><span><small>{displayDecisionId(record.id)} · {record.property}</small><strong>{record.title}</strong></span><span>{record.evidenceRefs.length} evidence items →</span></Link>)}{!records.length?<p className="he-empty">No decisions in this selection. Choose another property to inspect its evidence.</p>:null}</div>:null}
      </section>
    </div>
    <p className="he-scope">{scopeLabel} · Decision scope and provider connection checks are separate. Quality is measured after the required source checks.</p>
  </div>;
  return embedded ? workbench : <div className="rs-page hp-page"><Heading eyebrow="Connections" title="Build the evidence behind every decision." description={`Hotel sources, operating coverage and review steps · ${scopeLabel}`} aside={<TextLink href="/app/data-health">Review evidence health</TextLink>}/>{workbench}</div>;
}
