"use client";

import Link from "next/link";
import { ProductBrand } from "../ProductBrand";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ICONS } from "../shell/navIcons";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "../useDemoOrg";
import { buildDataHealthOverview } from "@/lib/radr/product/dataHealthProofEngine";

const ITEMS = [
  ["control-center", "Control Center", "/app"], ["live", "Live", "/app/live"],
  ["decisions", "Decisions", "/app/decisions"], ["service", "Operations", "/app/service"],
  ["intelligence", "Intelligence", "/app/intelligence"], ["value", "Value", "/app/value"],
  ["memory", "Memory", "/app/memory"], ["data-health", "Data Health", "/app/data-health"],
] as const;
const MORE = [["Connections", "/app/connections"], ["Locations", "/app/locations"], ["Guests", "/app/guests"], ["Back of house", "/app/house"], ["Dashboards", "/app/dashboards"], ["Settings", "/app/settings"]] as const;

export function ReferenceNavigation({ onNavigate }: { onNavigate: () => void }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const { roleView } = useProduct();
  const { session, isHotel, org } = useDemoOrg();
  const health = buildDataHealthOverview(roleView, session.vertical);
  return <aside className="rs-navigation" aria-label="RADR workspace">
    <Link className="rs-brand" href="/app" onClick={onNavigate} aria-label="RADR Control Center"><ProductBrand width={136} /></Link>
    <button type="button" className="rs-workspace" onClick={() => setMore(v => !v)} aria-expanded={more} aria-controls="rs-workspace-menu"><span className="rs-workspace-copy"><small>WORKSPACE</small><strong>{org.name}</strong></span><span aria-hidden="true">⌄</span></button>
    {more ? <div className="rs-more" id="rs-workspace-menu">{MORE.map(([label,href]) => <Link key={href} href={href} onClick={() => { setMore(false); onNavigate(); }}>{label}<span aria-hidden="true">↗</span></Link>)}</div> : null}
    <nav className="rs-nav-items" aria-label="Primary">{ITEMS.map(([id,label,href]) => {
      const active = href === "/app" ? path === href : path.startsWith(href);
      const Icon = NAV_ICONS[id];
      return <Link key={id} href={href} aria-current={active ? "page" : undefined} data-active={active || undefined} onClick={onNavigate}><span className="rs-nav-icon"><Icon /></span><span>{label}</span></Link>;
    })}</nav>
    <Link href="/app/data-health" className="rs-connection-status" onClick={onNavigate}><i data-warning={!isHotel && health.attentionCount > 0 || undefined} /><span>{isHotel ? "Review evidence health" : health.attentionCount > 0 ? `${health.attentionCount} evidence ${health.attentionCount === 1 ? "source needs" : "sources need"} review` : "Evidence sources connected"}</span></Link>
  </aside>;
}
