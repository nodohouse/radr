"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { NAV_ICONS } from "../shell/navIcons";

export function detailHref(href: string) {
  const [path,hash] = href.split("#");
  return `${path}${path.includes("?") ? "&" : "?"}layout=detail${hash ? `#${hash}` : ""}`;
}
export function Arrow() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
const SECTION_ICONS: Record<string,string> = {"Control Center":"control-center","Live Operations":"live","Decision record":"decisions","Operations":"service","Back of House":"house","Intelligence":"intelligence","Value":"value","Memory":"memory","Data Health":"data-health","Connections":"connections","Locations":"locations","Guest intelligence":"guests","Dashboards":"dashboards","Settings":"settings"};

export function Heading({ eyebrow,title,description,aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {

  const Icon = NAV_ICONS[SECTION_ICONS[eyebrow] || "control-center"];
  return <header className="rs-heading"><div><p className="rs-eyebrow"><span className="rs-section-mark" aria-hidden="true"><Icon /></span>{eyebrow}</p><h1>{title}</h1><p className="rs-description">{description.replace(/\s*—\s*/g, ", ")}</p></div>{aside}</header>;
}
export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "attention" | "healthy" | "watch" | "risk" }) {
  return <span className="rs-status-pill" data-tone={tone}><i aria-hidden="true" />{children}</span>;
}
export function Metric({ value,label,note,href,link,positive,icon }: { value: ReactNode; label: string; note?: string; href?: string; link?: string; positive?: boolean; icon?: ReactNode }) {
  const content = <><div className="rs-metric-icon">{icon || <i />}</div><strong data-positive={positive || undefined}>{value}</strong><span className="rs-metric-label">{label}</span>{note ? <small>{note}</small> : null}{href ? <span className="rs-text-link">{link || "View details"}<Arrow /></span> : null}</>;
  return href ? <Link className={`rs-card rs-metric${positive?" rs-metric-verified":""}`} href={href}>{content}</Link> : <div className={`rs-card rs-metric${positive?" rs-metric-verified":""}`}>{content}</div>;
}
export function Panel({ title,action,children,className="" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={`rs-card rs-panel ${className}`}><header><h2>{title}</h2>{action}</header>{children}</section>; }
export function TextLink({ href,children }: { href: string; children: ReactNode }) { return <Link href={href} className="rs-text-link">{children}<Arrow /></Link>; }
export function Chart({ values,labels,caption,bars=true }: { values: number[]; labels: string[]; caption: string; bars?: boolean }) {
  const gradientId = useId();
  // Cumulative records can share a day. Show that day's final value once.
  const pointsByLabel = new Map<string, number>();
  labels.forEach((label, index) => pointsByLabel.set(label, values[index] ?? 0));
  const chartValues = labels.length === values.length ? [...pointsByLabel.values()] : values;
  const chartLabels = labels.length === values.length ? [...pointsByLabel.keys()] : labels;
  if (!chartValues.some(value => value > 0)) return <div className="rs-chart-empty"><p>No verified outcomes in this scope yet.</p><span>Expected value stays separate until evidence verifies the result.</span></div>;
  const max = Math.max(1,...chartValues);
  const points = chartValues.map((v,i) => `${35+i*(490/Math.max(1,chartValues.length-1))},${190-v/max*145}`);
  const path = points.length ? `M${points.join(" L")}` : "M35,190L525,190";
  return <div className="rs-chart"><svg viewBox="0 0 580 240" role="img" aria-label={caption}>
    <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1755ed" stopOpacity=".18"/><stop offset="100%" stopColor="#00ed87" stopOpacity=".025"/></linearGradient></defs>
    {[45,95,145,195].map(y => <path key={y} d={`M35 ${y}H530`} stroke="#e3e9f0" strokeWidth="1" />)}
    <path d={`${path} L525 195H35Z`} fill={`url(#${gradientId})`} />
    {bars ? chartValues.map((v,i) => <rect key={i} x={25+i*(490/Math.max(1,chartValues.length-1))} y={195-v/max*140} width={Math.min(29,330/Math.max(1,chartValues.length))} height={v/max*140} rx="1" fill="var(--app-signal, #00ed87)" opacity={0.35+i/Math.max(1,chartValues.length)*.4} />) : null}
    <path d={path} fill="none" stroke="var(--app-blue, #1755ed)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    {chartValues.map((v,i)=><circle key={i} cx={35+i*(490/Math.max(1,chartValues.length-1))} cy={190-v/max*145} r="3.5" fill="#fff" stroke="#1755ed" strokeWidth="2"><title>{`${chartLabels[i]}: ${v.toLocaleString("en-US")}`}</title></circle>)}
    {chartLabels.map((label,i) => <text key={i} x={35+i*(490/Math.max(1,chartLabels.length-1))} y="225" fontSize="10" fill="var(--app-quiet, #5c717e)" textAnchor="middle">{label}</text>)}
  </svg></div>;
}
