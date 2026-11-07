"use client";

import { contributionPresentation } from "@/lib/product/contributionPresentation";
import { useId } from "react";
import type { TrendSeries } from "@/lib/product/performanceTrend";
import type { revenueBridge } from "@/lib/product/revenueBridge";
import type { PerformanceView } from "./PerformanceTicker";
import { Arrow } from "./ReferenceUI";

type Bridge = NonNullable<ReturnType<typeof revenueBridge>>;
const COLORS = ["#197b5c", "#3674b6", "#75b6a2", "#a0b8d4"];

export function BriefGraphics({series,bridge,peers,isHotel,onOpen}:{series:TrendSeries;bridge:Bridge;peers:TrendSeries[];isHotel:boolean;onOpen:(view:PerformanceView)=>void}) {
 const id=useId().replace(/:/g,"");
 const money=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:series.currency,maximumFractionDigits:0}).format(n);
 const compactMoney=(n:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:series.currency,notation:Math.abs(n)>=100000?"compact":"standard",maximumFractionDigits:Math.abs(n)>=100000?1:0}).format(n);
 const max=Math.max(1,...series.points.flatMap(p=>[p.forecast,p.actual??0,p.projection??0]));
 const x=(i:number)=>48+i*410/Math.max(1,series.points.length-1);
 const y=(n:number)=>170-n/max*140;
 const line=(key:"actual"|"forecast"|"projection")=>series.points.flatMap((p,i)=>p[key]===null?[]:[`${i===0||series.points[i-1][key]===null?"M":"L"}${x(i)},${y(p[key]!)}`]).join(" ");
 const actual=series.points.map((p,i)=>({p,i})).filter(({p})=>p.actual!==null);
 const last=actual.at(-1);
 const area=last?`${line("actual")} L${x(last.i)},170 L48,170 Z`:"";
 const mix=contributionPresentation(bridge.products);
 const hasLosses=mix.mode==="signed";
 let offset=0;
 const segments=mix.products.map((p,i)=>{const share=p.share??0;const segment={...p,share,offset,color:COLORS[i%COLORS.length]};offset+=share;return segment;});
 const extent=Math.max(5,...peers.map(p=>Math.abs(p.delta)));
 return <><section className="cc-visuals" aria-label="Performance graphics">
  <button type="button" className="cc-visual cc-trend-visual" onClick={()=>onOpen("revenue")} aria-label="Open revenue performance details">
   <header><span><small>THE SHAPE OF YOUR SERVICE</small><strong>Revenue vs forecast</strong></span><span className="cc-visual-delta">{series.delta>=0?"+":""}{series.delta.toFixed(1)}%<small>vs expected pace</small></span></header>
   <svg className="cc-revenue-graphic" viewBox="0 0 490 215" role="img" aria-label={`${money(series.actual)} recorded; ${money(series.projected)} projected close. ${isHotel?"Room revenue. ":""}Illustrative demo trajectory.`}>
    <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a9d71" stopOpacity=".22"/><stop offset="1" stopColor="#1a9d71" stopOpacity="0"/></linearGradient></defs>
    {[0,.5,1].map(t=><g key={t}><line x1="48" x2="458" y1={y(max*t)} y2={y(max*t)} stroke="#a6bdce" strokeOpacity=".24"/><text x="39" y={y(max*t)+4} textAnchor="end">{new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:0}).format(max*t)}</text></g>)}
    <path d={area} fill={`url(#${id}-fill)`}/><path d={line("forecast")} className="cc-forecast-line"/><path d={line("projection")} className="cc-projection-line"/><path d={line("actual")} className="cc-actual-line"/>
    {last?<><line x1={x(last.i)} x2={x(last.i)} y1={y(last.p.actual!)} y2="170" stroke="#478d78" strokeOpacity=".25" strokeDasharray="3 4"/><circle cx={x(last.i)} cy={y(last.p.actual!)} r="5" fill="#197b5c" stroke="#f3fff9" strokeWidth="2"/><text className="cc-chart-current" x={x(last.i)} y={y(last.p.actual!)-13} textAnchor="middle">{money(series.actual)}</text></>:null}
    {series.points.map((p,i)=>i===0||i===series.cutoff||i===series.points.length-1?<text key={p.label} x={x(i)} y="198" textAnchor="middle">{p.label}</text>:null)}
   </svg><footer><span><i className="is-actual"/>Recorded</span><span><i className="is-forecast"/>Forecast</span><span><i className="is-projection"/>Projected</span><Arrow/></footer><p className="cc-visual-provenance">{isHotel?"Room revenue · ":""}Demo trajectory · updates paused</p>
  </button>
  <button type="button" className="cc-visual cc-mix-visual" onClick={()=>onOpen("contribution")} aria-label="Open contribution details">
   <header><span><small>WHERE VALUE COMES FROM</small><strong>Contribution mix</strong></span><Arrow/></header>
   {hasLosses?<div className="cc-mix-losses"><p>Contribution includes losses. Compare the signed amounts below.</p>{bridge.products.map(p=><div key={p.id}><span>{p.label}</span><strong>{money(p.contribution)}</strong></div>)}</div>:<><div className="cc-donut-wrap"><svg viewBox="0 0 160 160" role="img" aria-label={`${money(bridge.contribution)} modeled contribution, split by ${isHotel?"department":"product"}.`}><circle cx="80" cy="80" r="60" fill="none" stroke="#dce8eb" strokeWidth="15"/>{segments.map(s=><circle key={s.id} cx="80" cy="80" r="60" pathLength="100" fill="none" stroke={s.color} strokeWidth="15" strokeDasharray={`${s.share*100} ${100-s.share*100}`} strokeDashoffset={-s.offset*100} transform="rotate(-90 80 80)"><title>{`${s.label}: ${money(s.contribution)}, ${Math.round(s.share*100)}%`}</title></circle>)}</svg><div><strong>{compactMoney(bridge.contribution)}</strong><small>Modeled contribution</small></div></div>
   <ul className="cc-mix-legend">{segments.map(s=><li key={s.id}><span><i style={{background:s.color}}/>{s.label}</span><b>{money(s.contribution)} <small>· {Math.round(s.share*100)}%</small></b></li>)}</ul></>}
   <p className="cc-visual-provenance">Allocated costs included · inspect the calculation</p>
  </button>
  <button type="button" className="cc-visual cc-peer-visual" onClick={()=>onOpen("locations")} aria-label="Open location comparisons"><header><span><small>ACROSS YOUR LOCATIONS</small><strong>Pace vs forecast</strong></span><Arrow/></header><div className="cc-peer-list">{peers.slice(0,5).map(p=><div className="cc-peer-row" key={p.id}><div><span>{p.label}</span><b data-negative={p.delta<0||undefined}>{p.delta>=0?"+":""}{p.delta.toFixed(1)}%</b></div><div className="cc-peer-track"><i className="cc-peer-zero"/><i className="cc-peer-fill" data-negative={p.delta<0||undefined} style={{left:`${p.delta<0?50-Math.abs(p.delta)/extent*48:50}%`,width:`${Math.abs(p.delta)/extent*48}%`}}/></div></div>)}</div><p className="cc-visual-provenance">Same-period pace · 0% baseline · illustrative peers</p></button>
 </section><p className="cc-graphics-hint">Swipe graphics to explore · tap for the full detail</p></>;
}
