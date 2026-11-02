import {RESTAURANT_ESTATE,HOTEL_ESTATE,DEMO_FX_TO_USD,type DemoEstateEntity} from "@/lib/radr/demo/estateRegistry";
import {toCanonicalLocationId} from "@/lib/radr/product/locationIds";
import {getRestaurantDayPace,getHotelDayPace} from "@/lib/radr/product/revenuePacing";
export type TrendPeriod="day"|"week"|"month";
export type TrendPoint={label:string;forecast:number;actual:number|null;projection:number|null};
export type TrendSeries={id:string;label:string;currency:string;points:TrendPoint[];cutoff:number;actual:number;expected:number;forecast:number;projected:number;delta:number};
export const trendEstate=(vertical:string)=>vertical==="hotel"?HOTEL_ESTATE:RESTAURANT_ESTATE;
export function trendScope(vertical:string,scope:string,comparison:string[]):DemoEstateEntity[]{
 const estate=trendEstate(vertical);
 if(comparison.length>=2)return estate.filter(e=>comparison.map(toCanonicalLocationId).includes(e.id));
 if(scope==="all")return estate;
 if(scope.startsWith("region_"))return estate.filter(e=>e.region.toLowerCase()===scope.slice(7).toLowerCase());
 return estate.filter(e=>e.id===toCanonicalLocationId(scope));
}
/** Illustrative trajectories. Hero daily endpoints use existing demo pacing canon.
 * Week/month shapes and peer endpoints are synthetic fixtures, never historical observations. */
export function locationTrend(entity:DemoEstateEntity,period:TrendPeriod):TrendSeries{
 const estate=trendEstate(entity.vertical);const i=estate.findIndex(e=>e.id===entity.id);
 const pace=entity.vertical==="hotel"?getHotelDayPace():getRestaurantDayPace();
 const fx=DEMO_FX_TO_USD[entity.currency];const scale=i===0?1:(.7+(i%7)*.13)/fx;
 const ratio=i===0?pace.revenueActualNow/pace.revenueForecastAtNow:1+Math.sin(i*2.3)*.085;
 const multiplier=period==="day"?1:period==="week"?6.4:29;
 const forecast=pace.revenueBudgetDay*scale*multiplier;
 const expected=period==="day"?pace.revenueForecastAtNow*scale:forecast*(period==="week"?.57:.79);
 const actual=expected*ratio;
 const projected=period==="day"?pace.revenueForecastClose*scale:forecast*(1+(ratio-1)*.7);
 const cutoff=period==="day"?8:period==="week"?3:6;
 const labels=period==="day"?["08:00","10:00","12:00","14:00","16:00","17:00","18:00","19:00",pace.clockLabel,"21:00","22:00","Close"]:period==="week"?["Mon 21","Tue 22","Wed 23","Thu 24","Fri 25","Sat 26","Sun 27"]:["Sep 1","Sep 4","Sep 8","Sep 12","Sep 16","Sep 20","Sep 24","Sep 27","Sep 30"];
 const points=labels.map((label,j)=>{
  const before=j<=cutoff;const t=before?j/cutoff:(j-cutoff)/(labels.length-1-cutoff);
  const f=before?expected*Math.pow(t,1.35):expected+(forecast-expected)*t;
  return {label,forecast:f,actual:before?actual*Math.pow(t,1.35)*(1+Math.sin(j*1.6)*.025*(1-t)):null,projection:j>=cutoff?actual+(projected-actual)*((j-cutoff)/(labels.length-1-cutoff)):null};
 });
 return {id:entity.id,label:entity.displayName,currency:entity.currency,points,cutoff,actual,expected,forecast,projected,delta:(actual/expected-1)*100};
}
export function aggregateTrend(entities:DemoEstateEntity[],period:TrendPeriod):TrendSeries|null{
 if(!entities.length)return null;if(entities.length===1)return locationTrend(entities[0],period);
 const series=entities.map(e=>locationTrend(e,period));
 const sum=(key:"actual"|"expected"|"forecast"|"projected")=>series.reduce((v,s,i)=>v+s[key]*DEMO_FX_TO_USD[entities[i].currency],0);
 const actual=sum("actual"),expected=sum("expected");
 return {id:"selection",label:`${entities.length} locations · group reporting`,currency:"USD",cutoff:series[0].cutoff,actual,expected,forecast:sum("forecast"),projected:sum("projected"),delta:(actual/expected-1)*100,points:series[0].points.map((p,j)=>({label:p.label,forecast:series.reduce((v,s,i)=>v+s.points[j].forecast*DEMO_FX_TO_USD[entities[i].currency],0),actual:p.actual===null?null:series.reduce((v,s,i)=>v+s.points[j].actual!*DEMO_FX_TO_USD[entities[i].currency],0),projection:p.projection===null?null:series.reduce((v,s,i)=>v+s.points[j].projection!*DEMO_FX_TO_USD[entities[i].currency],0)}))};
}
