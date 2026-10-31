"use client";

import Link from "next/link";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ICONS } from "../shell/navIcons";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "../useDemoOrg";
import { buildDataHealthOverview } from "@/lib/radr/product/dataHealthProofEngine";

const ITEMS = [
  ["control-center", "Control Center", "/app"], ["live", "Live & floor plan", "/app/live"],
  ["decisions", "Decisions", "/app/decisions"], ["service", "Operations", "/app/service"],
  ["house", "Back of House", "/app/house"],
  ["intelligence", "Intelligence", "/app/intelligence"], ["value", "Value", "/app/value"],
  ["memory", "Memory", "/app/memory"], ["data-health", "Data Health", "/app/data-health"],
] as const;
const WorkspaceIcon = NAV_ICONS.locations;
const MORE = [["Connections", "/app/connections"], ["Locations", "/app/locations"], ["Guests", "/app/guests"], ["Dashboards", "/app/dashboards"], ["Settings", "/app/settings"]] as const;

export function ReferenceNavigation({ onNavigate }: { onNavigate: () => void }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const [pinned, setPinned] = useState(false);
  const { roleView } = useProduct();
  const { session, isHotel, org } = useDemoOrg();
  const health = buildDataHealthOverview(roleView, session.vertical);
  return <aside className="rs-navigation" aria-label="RADR workspace" data-pinned={pinned || undefined}
    onKeyDown={event=>{if(event.key==="Escape"){setMore(false);setPinned(false);onNavigate();document.getElementById("product-content")?.focus();}}}
    onMouseLeave={event=>{if(!event.currentTarget.querySelector(":focus-visible")){setMore(false);if(event.currentTarget.contains(document.activeElement))document.getElementById("product-content")?.focus();}}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setMore(false);}}>
    <div className="rs-rail-brand-row">
    <Link className="rs-brand" href="/app" onClick={onNavigate} aria-label="RADR Control Center"><FrozenRadrLogo variant="mark" theme="dark" width={44} priority /></Link>
    <button type="button" className="rs-rail-pin" aria-label={pinned?"Unpin navigation":"Pin navigation open"} aria-pressed={pinned} onClick={()=>setPinned(value=>!value)} title={pinned?"Unpin navigation":"Keep navigation open"}><svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true"><path d="m12 3 5 5-2 1-2 4-3-3-4 4-1-1 4-4-3-3 4-2 2-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="m6 14-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
    </div>
    <button type="button" className="rs-workspace" onClick={() => setMore(v => !v)} aria-expanded={more} aria-label={`Workspace: ${org.name}`} aria-controls="rs-workspace-menu"><span className="rs-workspace-icon" aria-hidden="true"><WorkspaceIcon /></span><span className="rs-workspace-copy"><small>WORKSPACE</small><strong>{org.name}</strong></span><span className="rs-workspace-chevron" aria-hidden="true">⌄</span></button>
    {more ? <div className="rs-more" id="rs-workspace-menu">{MORE.map(([label,href]) => <Link key={href} href={href} onClick={() => { setMore(false); onNavigate(); }}>{label}<span aria-hidden="true">↗</span></Link>)}</div> : null}
    <nav className="rs-nav-items" aria-label="Primary">{ITEMS.map(([id,label,href]) => {
      const active = href === "/app" ? path === href : path.startsWith(href);
      const Icon = NAV_ICONS[id];
      return <Link key={id} href={href} aria-current={active ? "page" : undefined} data-active={active || undefined} aria-label={label} title={label} onClick={onNavigate}><span className="rs-nav-icon"><Icon /></span><span className="rs-nav-label">{label}</span></Link>;
    })}</nav>
    <Link href="/app/data-health" className="rs-connection-status" onClick={onNavigate}><i data-warning={!isHotel && health.attentionCount > 0 || undefined} /><span className="rs-status-label">{isHotel ? "Review evidence health" : health.attentionCount > 0 ? `${health.attentionCount} evidence ${health.attentionCount === 1 ? "source needs" : "sources need"} review` : "Evidence sources connected"}</span></Link>
  </aside>;
}
