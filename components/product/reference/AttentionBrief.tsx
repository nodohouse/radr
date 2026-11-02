"use client";

import Link from "next/link";
import {useEffect, useRef} from "react";
import type {DecisionRecord} from "@/lib/radr/decision/record";
import {formatPrimaryMetric} from "@/lib/radr/product/primaryMetric";
import {displayDecisionId} from "@/lib/radr/decision/ids";
import {Arrow} from "./ReferenceUI";

const clean = (value: string) => value.replace(/\s*—\s*/g, ", ");

/** A shortcut into the canonical queue, never a separate ranking or invented value sum. */
export function AttentionBrief({needs, handling, uncertain, scopeLabel}: {
  needs: DecisionRecord[]; handling: DecisionRecord[]; uncertain: number; scopeLabel: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const savedOverflow = useRef<string | null>(null);
  const restoreScroll = () => {
    if (savedOverflow.current === null) return;
    document.body.style.overflow = savedOverflow.current;
    savedOverflow.current = null;
  };
  useEffect(() => () => {
    if (savedOverflow.current !== null) document.body.style.overflow = savedOverflow.current;
  }, []);
  const open = () => {
    if (!dialog.current || dialog.current.open) return;
    savedOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current.showModal();
  };
  const close = () => { dialog.current?.close(); restoreScroll(); };
  const total = needs.length + handling.length;
  const share = total ? needs.length / total * 100 : 0;
  return <>
    <button type="button" className="cc-attention-brief" onClick={open} aria-label="Open your 30-second attention brief" aria-haspopup="dialog">
      <span className="cc-attention-label">YOUR ATTENTION <small>30-second brief</small></span>
      <span className="cc-attention-main"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" className="cc-attention-track"/><circle cx="24" cy="24" r="19" pathLength="100" strokeDasharray={`${share} ${100-share}`} transform="rotate(-90 24 24)"/><text x="24" y="29">{needs.length}</text></svg><span><strong>{needs.length ? `${needs.length} ${needs.length === 1 ? "call needs" : "calls need"} you` : "No calls pending"}</strong><small>{handling.length} in motion · {uncertain} evidence {uncertain === 1 ? "check" : "checks"}</small></span></span>
      <span className="cc-attention-footer">Get straight to what matters <Arrow/></span>
    </button>
    <dialog ref={dialog} className="cc-attention-dialog" aria-labelledby="attention-brief-title" onClose={restoreScroll} onCancel={event => {event.preventDefault(); close();}}>
      <header><div><span className="cc-section-label">YOUR 30-SECOND BRIEF</span><h2 id="attention-brief-title">Know what needs you.</h2><p>{scopeLabel} · Demo snapshot, updates paused</p></div><button type="button" onClick={close} aria-label="Close attention brief">Close <span aria-hidden="true">×</span></button></header>
      <div className="cc-attention-content"><h3>{needs.length} awaiting your judgment</h3><p className="cc-attention-note">In your existing priority order. Expected impacts remain separate by decision and horizon.</p>
        {needs.length ? <ol>{needs.slice(0,3).map(record => {
          const metric = formatPrimaryMetric(record);
          return <li key={record.id}><Link href={`/app/decisions/${record.id}`} onClick={close}><div className="cc-attention-meta"><span>{displayDecisionId(record.id)} · {record.property}</span><b>{clean(record.decisionDeadline || record.decisionHorizon.replaceAll("_", " ").toLowerCase())}</b></div><h4>{record.title}</h4><p>{clean(record.recommendationHeadline || record.contextLine)}</p><div className="cc-attention-impact"><strong>{metric?.money || "Review impact"}<small>{metric?.caption || "Evidence-linked decision"}</small></strong><span>{record.confidence.userFacing.toLowerCase()} confidence · {record.evidenceRefs.length} evidence items <Arrow/></span></div></Link></li>;
        })}</ol> : <div className="cc-attention-clear">Nothing awaits your judgment in this scope. RADR continues watching.</div>}
        <div className="cc-attention-shortcuts"><Link href="/app/decisions?band=handling" onClick={close}><span><strong>{handling.length} in motion</strong><small>Review what RADR is handling</small></span><Arrow/></Link><Link href="/app/data-health" onClick={close}><span><strong>{uncertain} evidence {uncertain === 1 ? "check" : "checks"}</strong><small>Active decisions with uncertain data</small></span><Arrow/></Link></div>
      </div><footer><Link href="/app/decisions?band=needs_you" onClick={close}>Open your full judgment queue <Arrow/></Link><span>Prepared actions still require their existing approvals.</span></footer>
    </dialog>
  </>;
}
