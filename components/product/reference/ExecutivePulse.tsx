"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {aggregateTrend,trendScope,trendEstate,locationTrend,type TrendPeriod} from "@/lib/product/performanceTrend";
import {revenueBridge} from "@/lib/product/revenueBridge";
import {PerformanceTicker,type PerformanceView} from "./PerformanceTicker";
import {Arrow} from "./ReferenceUI";

export function ExecutivePulse({vertical,scope,comparison,children}:{vertical:string;scope:string;comparison:string[];children?:ReactNode}){
 const [period,setPeriod]=useState<TrendPeriod>("day");const [view,setView]=useState<PerformanceView|null>(null);const dialog=useRef<HTMLDialogElement>(null);
 const entities=trendScope(vertical,scope,comparison);const series=aggregateTrend(entities,period);const bridge=revenueBridge(entities,period);
 useEffect(()=>{if(!view)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";dialog.current?.showModal();return()=>{document.body.style.overflow=previous;};},[view]);
 const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:series?.currency||"USD",maximumFractionDigits:0}).format(value);
 const pct=(value:number)=>`${value>=0?"+":""}${value.toFixed(1)}%`;
 const now=period==="day"?"today":period==="week"?"week to date":"month to date";
 const peers=(entities.length>1?entities:trendEstate(vertical)).slice(0,8).map(e=>locationTrend(e,period));
 const points=series?.points.filter(p=>p.actual!==null)||[];
 const path=points.map((p,i)=>`${i?"L":"M"}${i*260/Math.max(1,points.length-1)},${65-(p.actual||0)/(series?.actual||1)*58}`).join(" ");
 return <section className="ep-overview" aria-label="Executive financial overview" data-testid="executive-overview">
  <header><div><span className="pt-eyebrow">PERFORMANCE AT A GLANCE</span><small>Demo · Sep 24 · {series?.currency||"No series"} · updates paused</small></div><div className="pt-periods" aria-label="Brief performance period">{(["day","week","month"] as const).map(p=><button type="button" key={p} aria-pressed={period===p} onClick={()=>setPeriod(p)}>{p==="day"?"Day":p==="week"?"Week":"Month"}</button>)}</div></header>
  {series&&bridge?<><div className="ep-metrics">
   <button type="button" onClick={()=>setView("revenue")}><span>Revenue {now}</span><strong>{money(bridge.revenue)}</strong><small>{vertical==="hotel"?"All departments · booked sales":`${pct(series.delta)} vs expected pace`}</small><Arrow/></button>
   <button type="button" className="ep-cost" onClick={()=>setView("contribution")}><span>Costs & deductions</span><strong>−{money(bridge.cost)}</strong><small>{now} · accrued / modeled</small><Arrow/></button>
   <button type="button" className="ep-contribution" onClick={()=>setView("contribution")}><span>Contribution {now}</span><strong>{money(bridge.contribution)}</strong><small>{(bridge.contribution/bridge.revenue*100).toFixed(1)}% margin · modeled, not net profit</small><Arrow/></button>
   <button type="button" onClick={()=>setView("revenue")}><span>Projected {period} close</span><strong>{money(series.projected)}</strong><small>{pct((series.projected/series.forecast-1)*100)} vs forecast{vertical==="hotel"?" · rooms only":""}</small><Arrow/></button>
  </div>{children}<div className="ep-graphs">
   <button type="button" className="ep-graph" onClick={()=>setView("revenue")} aria-label="Open revenue performance details"><span><strong>Revenue vs forecast</strong><small>{pct(series.delta)} at snapshot{vertical==="hotel"?" · room revenue":""}</small></span><svg viewBox="0 0 270 75" aria-hidden="true"><path d={points.map((p,i)=>`${i?"L":"M"}${i*260/Math.max(1,points.length-1)},${65-p.forecast/series.actual*58}`).join(" ")} fill="none" stroke="#9eb2cc" strokeDasharray="4 4" strokeWidth="2"/><path d={path} fill="none" stroke="#1755ed" strokeWidth="2.5"/></svg><Arrow/></button>
   <button type="button" className="ep-graph" onClick={()=>setView("contribution")} aria-label="Open contribution details"><span><strong>Contribution mix</strong><small>{vertical==="hotel"?"Departments, channels & costs":"Food, drinks, delivery & fees"}</small></span><div className="ep-mix">{bridge.products.map((r,i)=><i key={r.id} style={{width:`${r.contribution/bridge.contribution*100}%`,background:["#1755ed","#00bb83","#4a7baf","#8fcbb7"][i]}}/>)}</div><Arrow/></button>
   <button type="button" className="ep-graph" onClick={()=>setView("locations")} aria-label="Open location comparisons"><span><strong>Location comparison</strong><small>Same-period pace · compare on %</small></span><div className="ep-comparison-bars" aria-hidden="true">{peers.map(peer=><i key={peer.id} style={{height:`${Math.max(12,Math.min(90,50+peer.delta*4))}%`,background:peer.delta>=0?"#00bb83":"#c87849"}}/>)}</div><Arrow/></button>
  </div><p className="ep-note">Click a graph or number to explore. Illustrative demo series and allocations; booked revenue is not bank cash.</p></>:<><p>No performance series for this selection.</p>{children}</>}
  <dialog ref={dialog} className="ep-dialog" aria-label="Performance detail" onClose={()=>setView(null)}><div className="ep-dialog-bar"><strong>Performance detail</strong><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close performance details">Close <span aria-hidden>×</span></button></div>{view?<PerformanceTicker vertical={vertical} scope={scope} comparison={comparison} initialView={view} initialPeriod={period}/>:null}</dialog>
 </section>;
}
