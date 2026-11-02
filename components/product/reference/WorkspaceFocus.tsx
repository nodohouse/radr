"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useRecords} from "./useDecisionScope";
import {formatPrimaryMetric} from "@/lib/radr/product/primaryMetric";
import {displayDecisionId} from "@/lib/radr/decision/ids";
import {NAV_ICONS} from "../shell/navIcons";
import type {DecisionRecord} from "@/lib/radr/decision/record";

const clean = (text: string) => text.replace(/\s*—\s*/g, ", ");
const VIEWS: Record<string, {eyebrow: string; intent: string; question: string; note: string; match?: RegExp; mode?: "outcome" | "trust" | "settings"}> = {
  live: {eyebrow:"Live Operations", intent:"See the pressure. Protect the guest experience.", question:"What changes the next service moment?", note:"The floor is an operating snapshot. Open a table or room for guest needs, orders and the next arrival.", match:/service|capacity|seating|arrival|room|guest|readiness/i},
  decisions: {eyebrow:"Decision record", intent:"Evidence first. Your judgment next.", question:"What deserves your attention?", note:"Expected impact stays separate from verified value. Review the alternatives and confidence before approving."},
  service: {eyebrow:"Operations", intent:"Resolve constraints before they become service failures.", question:"Where is the operation under pressure?", note:"Use readiness and pressure below to inspect the constraint. Prepared changes retain their approval requirements.", match:/service|capacity|staff|labor|housekeep|readiness|arrival|room/i},
  house: {eyebrow:"Back of House", intent:"Turn field evidence into an operating response.", question:"What must be checked behind the scenes?", note:"Camera, voice and stock notes are evidence to review. A capture alone does not verify stock or execute an order.", match:/BUY|stock|supplier|procure|inventory|sugar|linen|amenit|maintenance/i},
  intelligence: {eyebrow:"Intelligence", intent:"Understand the connection before choosing the response.", question:"What is the evidence telling you?", note:"BUY, LABOR, SELL and RECOVER are lenses over the same decisions. Inspect why, compare futures, then act."},
  value: {eyebrow:"Value", intent:"Follow each outcome back to its proof.", question:"What value has evidence behind it?", note:"Expected contribution, observed contribution and verified value are distinct. Open the record to inspect attribution.", mode:"outcome"},
  memory: {eyebrow:"Memory", intent:"Carry the lesson into the next decision.", question:"What can the operation learn from?", note:"Keep supporting and contradicting observations visible. A learned association is not a promise of the next outcome.", mode:"outcome"},
  "data-health": {eyebrow:"Data Health", intent:"Fix the evidence that limits a decision.", question:"What can you trust before acting?", note:"Source quality and decision confidence measure different things. Review freshness, coverage and affected decisions.", mode:"trust"},
  connections: {eyebrow:"Connections", intent:"Connected systems. Visible evidence limits.", question:"Build the evidence behind the decision.", note:"A connection is not proof of quality. Check freshness, completeness and coverage before trusting a recommendation.", mode:"trust"},
  settings: {eyebrow:"Settings", intent:"Set the boundaries. Keep judgment in your hands.", question:"Your operation, your decision guardrails.", note:"Demo preferences are saved on this device. Policies, access roles and autonomy remain visible; no external provider writes happen here.", mode:"settings"},
};

/** Shared orientation uses canonical scope and record priority, never a second financial model. */
export function WorkspaceFocus({eyebrow,focusRecord}: {eyebrow: string; focusRecord?: DecisionRecord | null}) {
  const path = usePathname();
  const {records, summary, scopeLabel} = useRecords();
  const key = path.split("/")[2];
  const view = VIEWS[key];
  if (!view || view.eyebrow !== eyebrow || path.split("/").length > 3) return null;
  const matches = (record: (typeof records)[number]) => !view.match || view.match.test(`${record.title} ${record.decisionType} ${record.territories?.join(" ")}`);
  const candidates = view.mode === "outcome" ? records.filter(record => !!record.verifiedValue) : view.mode === "trust" || view.mode === "settings" ? [] : summary.groups.needs_you.filter(matches);
  const record = focusRecord === undefined ? candidates[0] : focusRecord;
  const outcome = view.mode === "outcome" || Boolean(record?.verifiedValue);
  const metric = record ? formatPrimaryMetric(record) : null;
  const Icon = NAV_ICONS[key === "service" ? "service" : key] || NAV_ICONS.decisions;
  const href = record ? `/app/decisions/${record.id}` : view.mode === "settings" ? "/app/settings?section=autonomy" : view.mode === "trust" ? key === "connections" ? "/app/data-health" : "/app/connections" : outcome ? "/app/decisions?band=resolved" : "/app/decisions";
  const action = record ? outcome ? "Inspect outcome" : "Review decision" : view.mode === "settings" ? "Review autonomy & approvals" : view.mode === "trust" ? key === "connections" ? "Review evidence quality" : "Review connections" : "Open scoped decisions";
  return <section className="ws-focus" aria-label={`${eyebrow} decision context`} data-testid="workspace-focus" data-mode={view.mode || "decision"} data-negative={Boolean(record?.verifiedValue && record.verifiedValue.amount < 0) || undefined}>
    <div className="ws-focus-main"><div className="ws-focus-label"><Icon/><span>{view.intent}</span><small>{outcome ? "OUTCOME TO EVIDENCE" : view.mode === "settings" ? "GOVERNANCE" : view.mode === "trust" ? "EVIDENCE BEFORE ACTION" : "YOUR FOCUS"}</small></div><h2>{record ? clean(record.title) : view.question}</h2><p>{record ? `${displayDecisionId(record.id)} · ${record.property} · ${outcome ? "Recorded outcome" : record.decisionDeadline || clean(record.decisionHorizon.replaceAll("_", " ").toLowerCase())}` : `${scopeLabel} · ${view.mode === "settings" ? "Demo workspace preferences" : view.mode === "trust" ? "Source cohorts are labelled separately below" : "Review the current filters and scoped decisions"}`}</p><Link href={href}>{action}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></Link></div>
    <div className="ws-focus-proof">{record && metric ? <><span>{outcome ? "Recorded value" : "Decision impact"}</span><strong>{metric.money}</strong><small>{metric.caption}</small><p>{record.confidence.userFacing.toLowerCase()} confidence · {record.evidenceRefs.length} evidence items</p></> : <><span>{view.mode === "settings" ? "DESIGNED FOR CONTROL" : "BEFORE YOU ACT"}</span><strong className="ws-proof-title">{view.mode === "settings" ? "Human judgment stays visible." : outcome ? "No verified outcome in this scope yet." : "Keep the evidence in view."}</strong></>}<p className="ws-focus-note">{view.note}</p></div>
  </section>;
}
