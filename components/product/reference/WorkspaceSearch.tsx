"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRecords } from "./ReferencePages";
import { useDemoOrg } from "../useDemoOrg";
import { buildMemoryOverview } from "@/lib/radr/product/memoryProofEngine";
import { allFindings } from "@/lib/radr/product/intelligenceEngine";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { WORKSPACE_PRIMARY_NAV, WORKSPACE_SECONDARY_LINKS } from "@/lib/product/appNav";

const PAGES = [
  ...WORKSPACE_PRIMARY_NAV.map(([, title, href]) => [title, href] as const),
  ...WORKSPACE_SECONDARY_LINKS,
];

/** Local object search. Answers and conversations remain in Ask RADR. */
export default function WorkspaceSearch({ onClose }: { onClose: () => void }) {
  const { records, roleView } = useRecords();
  const { org } = useDemoOrg();
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const memory = buildMemoryOverview(roleView, records);
  const recordIds = new Set(records.map(record => record.id));
  const items = [
    ...PAGES.map(([title,href])=>({title,href,kind:"Page",detail:"Workspace"})),
    ...records.map(record=>({title:record.title,href:`/app/decisions/${record.id}`,kind:"Decision",detail:`${displayDecisionId(record.id)} · ${record.property}`})),
    ...allFindings().filter(f=>f.decisionId !== null && recordIds.has(f.decisionId)).map(f=>({title:f.title,href:`/app/decisions/${f.decisionId}`,kind:"Signal",detail:records.find(record=>record.id===f.decisionId)?.recommendationHeadline||records.find(record=>record.id===f.decisionId)?.contextLine||f.summary})),
    ...memory.allLearnings.map(l=>({title:l.statement,href:l.href,kind:"Memory",detail:l.location})),
    ...org.locations.map(l=>({title:l.displayName||l.name,href:`/app/locations?location=${encodeURIComponent(l.id)}`,kind:"Location",detail:org.name})),
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter(item => `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(normalizedQuery)).slice(0,12);

  useEffect(()=>{
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    input.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return ()=>{ document.body.style.overflow = previousOverflow; previous?.focus(); };
  },[]);

  return <dialog ref={dialog} className="rs-search-dialog" aria-label="Search workspace" onCancel={onClose} onClick={event=>{if(event.target===dialog.current)onClose();}} onKeyDown={event=>{
    const links = Array.from(results.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
    if (!links.length) return;
    if (event.key === "Enter" && event.target === input.current) {
      event.preventDefault();
      links[0].click();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (index < 0 && event.target !== input.current) return;
      event.preventDefault();
      const next = index < 0 ? (event.key === "ArrowDown" ? 0 : links.length - 1)
        : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next].focus();
    }
  }}>
    <div className="rs-search-content"><header><label htmlFor="rs-search-input">Search workspace</label><button type="button" aria-label="Close search" onClick={onClose}>Esc</button></header>
      <input ref={input} id="rs-search-input" placeholder="Search decisions, signals, memory, locations…" value={query} onChange={event=>setQuery(event.target.value)} autoComplete="off" maxLength={200} />
      <p className="rs-search-context">Decisions and signals follow your role and selected location.</p>
      <div ref={results} className="rs-search-results" aria-live="polite">{filtered.length ? filtered.map((item,index)=><Link key={`${item.href}-${index}`} href={item.href} onClick={onClose}><span className="rs-search-kind">{item.kind}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><span aria-hidden="true">↗</span></Link>) : <div className="rs-search-empty">No matching results in this scope.</div>}</div>
    </div>
  </dialog>;
}
