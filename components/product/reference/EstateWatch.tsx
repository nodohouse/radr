"use client";

import {locationTrend,trendScope,trendEstate,type TrendPeriod} from "@/lib/product/performanceTrend";
import {Arrow} from "./ReferenceUI";

export function EstateWatch({vertical,scope,comparison,onReview,period}:{period:TrendPeriod;vertical:string;scope:string;comparison:string[];onReview:()=>void}) {
 const selected=trendScope(vertical,scope,comparison);
 const entities=selected.length>1?selected:trendEstate(vertical);
 const ranked=entities.map(e=>locationTrend(e,period)).sort((a,b)=>a.delta-b.delta);
 const worst=ranked[0],best=ranked.at(-1);const behind=ranked.filter(s=>s.delta<=-10).length;
 if(!worst||!best)return null;
 return <button type="button" className="cc-estate-watch" onClick={onReview} aria-label="Review estate performance exceptions"><header><span>ESTATE WATCH <small>{period==="day"?"Today":period==="week"?"This week":"This month"} · demo peers</small></span><b data-none={behind===0||undefined}>{behind} ≥10% behind</b></header><div><span><i data-risk={worst.delta<0||undefined}/><strong>{worst.label}</strong><b>{worst.delta>=0?"+":""}{worst.delta.toFixed(1)}%</b></span><span><i data-risk={best.delta<0||undefined}/><strong>{best.label}</strong><b>{best.delta>=0?"+":""}{best.delta.toFixed(1)}%</b></span></div><footer>Compare the outliers. Inspect what changed.<Arrow/></footer></button>;
}
