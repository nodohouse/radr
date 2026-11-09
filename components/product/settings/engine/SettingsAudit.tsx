"use client";

import { useMemo, useState } from "react";
import { useDemoOrg } from "../../useDemoOrg";
import { useRecords } from "../../reference/useDecisionScope";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";

export function SettingsAudit() {
  const { org, isHotel } = useDemoOrg();
  const { records, scopeLabel } = useRecords();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const events = useMemo(() => {
    const verified = records.find(record => record.verifiedValue);
    const metric = verified ? formatPrimaryMetric(verified) : null;
    return [
      { time:"Today 09:14", actor:"Operations lead", kind:"Policy", action:isHotel ? "Reviewed room-release approval rule" : "Reviewed service-capacity approval rule", object:"Prepare → request approval", scope:scopeLabel },
      { time:"Today 08:02", actor:"RADR · prepared response", kind:"Decision", action:isHotel ? "Prepared arrival-readiness handoff" : "Prepared seating-pace handoff", object:"Operator review required", scope:scopeLabel },
      ...(verified && metric ? [{ time:"Yesterday 18:41", actor:"Finance reviewer", kind:"Evidence", action:"Reviewed a recorded outcome", object:`${verified.title} · ${metric.money}`, scope:verified.property }] : []),
      { time:"Yesterday 11:20", actor:"Evidence review", kind:"Evidence", action:"Reviewed source readiness", object:"Required source checks remain visible in Data Health", scope:scopeLabel },
      { time:"Mon 16:05", actor:"Workspace administrator", kind:"Access", action:"Reviewed team access", object:"Persona views do not change access permissions", scope:org.name },
    ];
  }, [records, scopeLabel, org.name, isHotel]);
  const filtered = events.filter(event => (kind === "all" || event.kind === kind) && `${event.actor} ${event.action} ${event.object} ${event.scope}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="se-panel" data-settings-audit="true">
    <header className="se-panel-head"><div><h2>Audit trail</h2><p>{org.name} · {scopeLabel}. Illustrative history of policy, evidence and access review.</p></div></header>
    <div className="se-audit-controls"><div className="se-audit-field"><label htmlFor="se-audit-search">Find an event</label><input id="se-audit-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Action, person or location"/></div><div className="se-audit-field"><label htmlFor="se-audit-kind">Event type</label><select id="se-audit-kind" value={kind} onChange={event=>setKind(event.target.value)}><option value="all">All events</option>{["Policy","Decision","Evidence","Access"].map(value=><option key={value}>{value}</option>)}</select></div><span>{filtered.length} {filtered.length===1?"event":"events"}</span></div>
    <div className="se-table-wrap" role="region" aria-label="Scrollable audit history" tabIndex={0}><table className="se-table se-audit-table" aria-label="Audit events"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Context</th><th>Scope</th></tr></thead><tbody>{filtered.map(event=><tr key={`${event.time}-${event.action}`}><td>{event.time}</td><td>{event.actor}</td><td><strong>{event.action}</strong><small>{event.kind}</small></td><td>{event.object}</td><td>{event.scope}</td></tr>)}</tbody></table></div>
    {!filtered.length ? <p className="rs-empty">No matching events. Clear the search or select another event type.</p> : null}
    <p className="se-audit-note">Demo review history. Changes to preview preferences are saved on this device; this list is not a live compliance log.</p>
  </section>;
}
