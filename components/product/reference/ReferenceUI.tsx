import Link from "next/link";
import type { ReactNode } from "react";

export function detailHref(href: string) {
  const [path,hash] = href.split("#");
  return `${path}${path.includes("?") ? "&" : "?"}layout=detail${hash ? `#${hash}` : ""}`;
}
export function Arrow() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
export function Heading({ eyebrow,title,description,aside }: { eyebrow: string; title: string; description: string; aside?: ReactNode }) {
  return <header className="rs-heading"><div><p className="rs-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="rs-description">{description}</p></div>{aside}</header>;
}
export function Metric({ value,label,note,href,link,positive,icon }: { value: ReactNode; label: string; note?: string; href?: string; link?: string; positive?: boolean; icon?: ReactNode }) {
  const content = <><div className="rs-metric-icon">{icon || <i />}</div><strong data-positive={positive || undefined}>{value}</strong><span className="rs-metric-label">{label}</span>{note ? <small>{note}</small> : null}{href ? <span className="rs-text-link">{link || "View details"}<Arrow /></span> : null}</>;
  return href ? <Link className="rs-card rs-metric" href={href}>{content}</Link> : <div className="rs-card rs-metric">{content}</div>;
}
export function Panel({ title,action,children,className="" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={`rs-card rs-panel ${className}`}><header><h2>{title}</h2>{action}</header>{children}</section>; }
export function TextLink({ href,children }: { href: string; children: ReactNode }) { return <Link href={href} className="rs-text-link">{children}<Arrow /></Link>; }
export function Chart({ values,labels,caption,bars=true }: { values: number[]; labels: string[]; caption: string; bars?: boolean }) {
  const max = Math.max(1,...values);
  const points = values.map((v,i) => `${35+i*(490/Math.max(1,values.length-1))},${190-v/max*145}`);
  const path = points.length ? `M${points.join(" L")}` : "M35,190L525,190";
  return <div className="rs-chart"><svg viewBox="0 0 580 240" role="img" aria-label={caption}>
    {[45,95,145,195].map(y => <path key={y} d={`M35 ${y}H530`} stroke="#e3e9f0" strokeWidth="1" />)}
    <path d={`${path} L525 195H35Z`} fill="#cdeee04d" />
    {bars ? values.map((v,i) => <rect key={i} x={25+i*(490/Math.max(1,values.length-1))} y={195-v/max*140} width={Math.min(29,330/Math.max(1,values.length))} height={v/max*140} rx="1" fill="#1ca98a" opacity={0.35+i/Math.max(1,values.length)*.4} />) : null}
    <path d={path} fill="none" stroke="#15a886" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    {labels.map((label,i) => <text key={i} x={35+i*(490/Math.max(1,labels.length-1))} y="225" fontSize="10" fill="#8792a1" textAnchor="middle">{label}</text>)}
  </svg></div>;
}
