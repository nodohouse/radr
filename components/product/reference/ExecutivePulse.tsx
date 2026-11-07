"use client";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {aggregateTrend,trendScope,trendEstate,locationTrend,type TrendPeriod} from "@/lib/product/performanceTrend";
import {revenueBridge} from "@/lib/product/revenueBridge";
import {PerformanceTicker,type PerformanceView} from "./PerformanceTicker";
import {Arrow} from "./ReferenceUI";
import {DataMeaning, MetricKind} from "./DataMeaning";
import {BriefGraphics} from "./BriefGraphics";

export function ExecutivePulse({vertical,scope,comparison,children,heading}:{vertical:string;scope:string;comparison:string[];children?:ReactNode;heading?:(onOpen:(view:PerformanceView)=>void,period:TrendPeriod)=>ReactNode}){
 const [period,setPeriod]=useState<TrendPeriod>("day");const [view,setView]=useState<PerformanceView|null>(null);const dialog=useRef<HTMLDialogElement>(null);const previousBodyOverflow=useRef("");
 const entities=trendScope(vertical,scope,comparison);const series=aggregateTrend(entities,period);const bridge=revenueBridge(entities,period);
 useEffect(()=>{if(!view)return;const previous=document.body.style.overflow;previousBodyOverflow.current=previous;document.body.style.overflow="hidden";dialog.current?.showModal();return()=>{document.body.style.overflow=previous;};},[view]);
 const closeDetail=()=>{document.body.style.overflow=previousBodyOverflow.current;dialog.current?.close();setView(null);};
 const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:series?.currency||"USD",maximumFractionDigits:0}).format(value);
 const pct=(value:number)=>`${value>=0?"+":""}${value.toFixed(1)}%`;
 const now=period==="day"?"today":period==="week"?"week to date":"month to date";
 const peers=(entities.length>1?entities:trendEstate(vertical)).slice(0,8).map(e=>locationTrend(e,period));
 return <>{heading?.(setView,period)}<section className="ep-overview" aria-label="Executive financial overview" data-testid="executive-overview">
  <header><div><span className="pt-eyebrow">PERFORMANCE AT A GLANCE</span><small>Demo snapshot · Sep 24 · {series?.currency||"No series"} · updates paused</small></div><div className="pt-periods" aria-label="Brief performance period">{(["day","week","month"] as const).map(p=><button type="button" key={p} aria-pressed={period===p} onClick={()=>setPeriod(p)}>{p==="day"?"Day":p==="week"?"Week":"Month"}</button>)}</div></header>
  {series&&bridge?<><div className="ep-metrics">
   <button type="button" onClick={()=>setView("revenue")}><span>Revenue {now}</span><MetricKind kind="recorded"/><strong>{money(bridge.revenue)}</strong><small>{vertical==="hotel"?"All departments · booked sales":`${pct(series.delta)} vs expected pace`}</small><Arrow/></button>
   <button type="button" className="ep-cost" onClick={()=>setView("contribution")}><span>Costs & deductions</span><MetricKind kind="modeled"/><strong>−{money(bridge.cost)}</strong><small>{now} · accrued / modeled</small><Arrow/></button>
   <button type="button" className="ep-contribution" onClick={()=>setView("contribution")}><span>Contribution {now}</span><MetricKind kind="modeled"/><strong>{money(bridge.contribution)}</strong><small>{(bridge.contribution/bridge.revenue*100).toFixed(1)}% margin · modeled, not net profit</small><Arrow/></button>
   <button type="button" onClick={()=>setView("revenue")}><span>Projected {period} close</span><MetricKind kind="projected"/><strong>{money(series.projected)}</strong><small>{pct((series.projected/series.forecast-1)*100)} vs forecast{vertical==="hotel"?" · rooms only":""}</small><Arrow/></button>
  </div><DataMeaning scope={series.label} currency={series.currency} period={now}/>{children}<BriefGraphics series={series} bridge={bridge} peers={peers} isHotel={vertical==="hotel"} onOpen={setView}/><p className="ep-note">Click a graph or number to explore. Illustrative demo series and allocations; booked revenue is not bank cash.</p></>:<><p>No performance series for this selection.</p>{children}</>}
  <dialog ref={dialog} className="ep-dialog" aria-label="Performance detail" onCancel={event=>{event.preventDefault();closeDetail();}} onClose={()=>{document.body.style.overflow=previousBodyOverflow.current;setView(null);}}><div className="ep-dialog-bar"><strong>Performance detail</strong><button type="button" onClick={closeDetail} aria-label="Close performance details">Close <span aria-hidden>×</span></button></div>{view?<PerformanceTicker vertical={vertical} scope={scope} comparison={comparison} initialView={view} initialPeriod={period}/>:null}</dialog>
 </section></>;
}
