"use client";

import Link, {useLinkStatus} from "next/link";
import { useRecords } from "./useDecisionScope";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ICONS } from "../shell/navIcons";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "../useDemoOrg";
import { buildDataHealthOverview } from "@/lib/radr/product/dataHealthProofEngine";

const ITEMS = [
  ["control-center", "Control Center", "/app"], ["live", "Live", "/app/live"],
  ["decisions", "Decisions", "/app/decisions"], ["service", "Operations", "/app/service"],
  ["house", "Back of House", "/app/house"],
  ["intelligence", "Intelligence", "/app/intelligence"], ["value", "Value", "/app/value"],
  ["memory", "Memory", "/app/memory"], ["data-health", "Data Health", "/app/data-health"], ["connections", "Connections", "/app/connections"],
] as const;
function RoutePending(){const {pending}=useLinkStatus();return pending?<span className="rs-route-pending" role="status" aria-label="Opening section"/>:null;}
const NAV_CONTEXT: Record<string, string> = {
  "control-center": "What needs you now",
  live: "Service as it happens",
  decisions: "Evidence to action",
  service: "Capacity and readiness",
  house: "Behind the operation",
  intelligence: "See the connections",
  value: "Outcomes with proof",
  memory: "Experience, retained",
  "data-health": "Trust the evidence",
  connections: "Your connected systems",
};
const WorkspaceIcon = NAV_ICONS.locations;
const MORE = [["Floor plan editor", "/app/live/plan"], ["Locations", "/app/locations"], ["Guests", "/app/guests"], ["Dashboards", "/app/dashboards"], ["Settings", "/app/settings"]] as const;

export function ReferenceNavigation({ onNavigate }: { onNavigate: () => void }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const [pinned, setPinned] = useState(false);
  const { roleView } = useProduct();
  const { session, isHotel, org } = useDemoOrg();
  const health = buildDataHealthOverview(roleView, session.vertical);
  const { summary, scopeLabel } = useRecords();
  const needs = summary.groups.needs_you.length;
  const handling = summary.groups.handling.length;
  return <aside className="rs-navigation" aria-label="RADR workspace" data-pinned={pinned || undefined}
    onKeyDown={event=>{if(event.key==="Escape"){setMore(false);setPinned(false);onNavigate();document.getElementById("product-content")?.focus();}}}
    onMouseLeave={event=>{if(!event.currentTarget.querySelector(":focus-visible")){setMore(false);if(event.currentTarget.contains(document.activeElement))document.getElementById("product-content")?.focus();}}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setMore(false);}}>
    <div className="rs-rail-brand-row">
    <Link className="rs-brand" href="/app" onClick={onNavigate} aria-label="RADR Control Center"><FrozenRadrLogo variant="mark" theme="light" width={44} priority /></Link>
    <div className="rs-rail-context">
      <Link href="/app/decisions?band=needs_you" onClick={onNavigate} className="rs-rail-attention" aria-label={`Review ${needs} ${needs === 1 ? "decision" : "decisions"} requiring your attention in ${scopeLabel}`}>
        <span>{needs} {needs === 1 ? "needs" : "need"} you</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
      <span>{handling} in motion</span>
    </div>
    <button type="button" className="rs-rail-pin" aria-label={pinned?"Unpin navigation":"Pin navigation open"} aria-pressed={pinned} onClick={()=>setPinned(value=>!value)} title={pinned?"Unpin navigation":"Keep navigation open"}><svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true"><path d="m12 3 5 5-2 1-2 4-3-3-4 4-1-1 4-4-3-3 4-2 2-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="m6 14-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
    </div>
    <button type="button" className="rs-workspace" onClick={() => setMore(v => !v)} aria-expanded={more} aria-label={`Workspace: ${org.name}`} aria-controls="rs-workspace-menu"><span className="rs-workspace-icon" aria-hidden="true"><WorkspaceIcon /></span><span className="rs-workspace-copy"><small>WORKSPACE</small><strong>{org.name}</strong></span><span className="rs-workspace-chevron" aria-hidden="true">⌄</span></button>
    {more ? <div className="rs-more" id="rs-workspace-menu">{MORE.map(([label,href]) => <Link key={href} href={href} onClick={() => { setMore(false); onNavigate(); }}>{label}<span aria-hidden="true">↗</span></Link>)}</div> : null}
    <nav className="rs-nav-items" aria-label="Primary">{ITEMS.map(([id,label,href]) => {
      const active = id === "live" ? path.startsWith("/app/live")&&!path.startsWith("/app/live/plan") : href === "/app" ? path === href : path.startsWith(href);
      const Icon = NAV_ICONS[id];
      return <Link key={id} href={href} aria-current={active ? "page" : undefined} data-active={active || undefined} aria-label={label} title={label} data-section={id==="intelligence"?"analysis":id==="data-health"?"system":undefined} onClick={onNavigate}><span className="rs-nav-icon"><Icon /></span><span className="rs-nav-copy"><span className="rs-nav-label">{label}</span>{active?<small className="rs-nav-context" aria-hidden="true">{NAV_CONTEXT[id]}</small>:null}</span><svg className="rs-nav-direction" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="M3 8h9m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg><RoutePending/></Link>;
    })}</nav>
    <Link href="/app/data-health" className="rs-connection-status" onClick={onNavigate}><i data-warning={!isHotel && health.attentionCount > 0 || undefined} /><span className="rs-status-label">{isHotel ? "Review evidence health" : health.attentionCount > 0 ? `${health.attentionCount} evidence ${health.attentionCount === 1 ? "source needs" : "sources need"} review` : "Evidence sources connected"}</span></Link>
  </aside>;
}
