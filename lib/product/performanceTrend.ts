import {RESTAURANT_ESTATE,HOTEL_ESTATE,DEMO_FX_TO_USD,type DemoEstateEntity} from "@/lib/radr/demo/estateRegistry";
import {toCanonicalLocationId} from "@/lib/radr/product/locationIds";
import {getRestaurantDayPace,getHotelDayPace} from "@/lib/radr/product/revenuePacing";
export type TrendPeriod="day"|"week"|"month";
export type TrendPoint={label:string;forecast:number;actual:number|null;projection:number|null};
export type TrendStory={state:"Outperforming"|"Needs attention"|"Recovering"|"On pace";headline:string;driver:string;eventIndex:number};
export type TrendSeries={story:TrendStory|null;id:string;label:string;currency:string;points:TrendPoint[];cutoff:number;actual:number;expected:number;forecast:number;projected:number;delta:number};
export const trendEstate=(vertical:string)=>vertical==="hotel"?HOTEL_ESTATE:RESTAURANT_ESTATE;
export function trendScope(vertical:string,scope:string,comparison:string[]):DemoEstateEntity[]{
 const estate=trendEstate(vertical);
 if(comparison.length>=2)return estate.filter(e=>comparison.map(toCanonicalLocationId).includes(e.id));
 if(scope==="all")return estate;
 if(scope.startsWith("region_"))return estate.filter(e=>e.region.toLowerCase()===scope.slice(7).toLowerCase());
 return estate.filter(e=>e.id===toCanonicalLocationId(scope));
}
/** Explicit fictional operating stories, not inferred causes or connected telemetry. */
export function trendStory(entity:DemoEstateEntity,period:TrendPeriod):TrendStory {
 const i=trendEstate(entity.vertical).findIndex(e=>e.id===entity.id)%7;
 const hotel=entity.vertical==="hotel";
 const stories:Omit<TrendStory,"eventIndex">[]=[
  {state:"On pace",headline:hotel?"Arrival wave builds":"Dinner demand accelerates",driver:hotel?"Illustrative late-arrival concentration; review readiness against the arrival wave.":"Illustrative dinner surge and delivery overlap; compare service capacity before adding covers."},
  {state:"Outperforming",headline:hotel?"Direct bookings outperform":"Conversion beats the plan",driver:hotel?"Fictional direct-booking pickup with stronger room-rate mix.":"Fictional event traffic and higher conversion support an above-plan dinner."},
  {state:"Needs attention",headline:hotel?"Cancellation cluster":"Mid-service interruption",driver:hotel?"Fictional group cancellations create a room-revenue shortfall; inspect channel and cancellation evidence.":"Fictional kitchen interruption suppresses the middle service window; inspect staffing, ticket pace and channel mix."},
  {state:"Outperforming",headline:hotel?"Group arrival uplift":"Large-party booking uplift",driver:hotel?"Fictional group pickup creates a concentrated revenue step.":"Fictional large-party seating produces a concentrated revenue step, followed by a quieter interval."},
  {state:"Needs attention",headline:hotel?"Distribution demand softens":"Demand falls below plan",driver:hotel?"Fictional softer channel demand; review availability, rate and distribution context.":"Fictional walk-in demand softens after lunch; inspect demand and labor before changing the plan."},
  {state:"Recovering",headline:hotel?"Late pickup narrows the gap":"Dinner recovers a weak lunch",driver:hotel?"Fictional late direct pickup closes an earlier gap; the recovery is not a verified intervention outcome.":"Fictional dinner pickup narrows an earlier shortfall; the recovery is not a verified intervention outcome."},
  {state:"Outperforming",headline:hotel?"Event-week outlier":"Event-led outlier",driver:hotel?"Fictional event-week demand and premium room mix create an unusually strong day.":"Fictional nearby event creates an unusually concentrated peak. Check repeatability before treating it as the new baseline."},
 ];
 const cutoff=period==="day"?8:period==="week"?3:6;
 return {...stories[i],eventIndex:i===2||i===5?Math.floor(cutoff/2)+1:i===3||i===6?Math.floor(cutoff*.65)+1:Math.max(1,cutoff-1)};
}

/** Positive interval weights create uneven cumulative trajectories while preserving endpoints. */
function cumulative(count:number,seed:number,pattern:number):number[] {
 const weights=Array.from({length:count},(_,j)=>{
  let weight=.6+(j+1)/count*.7+(Math.sin((j+1)*1.8+seed)+1)*.35;
  if(pattern===2&&j===Math.floor(count/2))weight*=.12;
  if((pattern===3||pattern===6)&&j===Math.floor(count*.65))weight*=3.2;
  if(pattern===5)weight*=j<count/2?.25:1.9;
  if(pattern===1&&j>count/2)weight*=1.65;
  return weight;
 });
 const total=weights.reduce((a,b)=>a+b,0);let sum=0;
 return [0,...weights.map(w=>{sum+=w;return sum/total;})];
}

/** Featured daily endpoints reuse pacing canon; other venue/period stories are fictional. */
export function locationTrend(entity:DemoEstateEntity,period:TrendPeriod):TrendSeries{
 const estate=trendEstate(entity.vertical);const i=estate.findIndex(e=>e.id===entity.id);const pattern=i%7;
 const pace=entity.vertical==="hotel"?getHotelDayPace():getRestaurantDayPace();
 const fx=DEMO_FX_TO_USD[entity.currency];const scale=i===0?1:(.7+(i%7)*.13)/fx;
 const adjustment=period==="day"?0:period==="week"?[0,-.025,.055,-.03,.02,.065,-.06][pattern]:[0,-.05,.095,-.045,.035,.035,-.09][pattern];
 const ratio=i===0?pace.revenueActualNow/pace.revenueForecastAtNow:[1,1.184,.784,1.128,.875,.982,1.272][pattern]+adjustment;
 const multiplier=period==="day"?1:period==="week"?6.4:29;
 const forecast=pace.revenueBudgetDay*scale*multiplier;
 const expected=period==="day"?pace.revenueForecastAtNow*scale:forecast*(period==="week"?.57:.79);
 const actual=expected*ratio;
 const projected=period==="day"&&i===0?pace.revenueForecastClose*scale:forecast*(1+(ratio-1)*.7);
 const cutoff=period==="day"?8:period==="week"?3:6;
 const labels=period==="day"?["08:00","10:00","12:00","14:00","16:00","17:00","18:00","19:00",pace.clockLabel,"21:00","22:00","Close"]:period==="week"?["Mon 21","Tue 22","Wed 23","Thu 24","Fri 25","Sat 26","Sun 27"]:["Sep 1","Sep 4","Sep 8","Sep 12","Sep 16","Sep 20","Sep 24","Sep 27","Sep 30"];
 const forecastPast=cumulative(cutoff,0,0);const actualPast=cumulative(cutoff,i+2,pattern);const future=cumulative(labels.length-1-cutoff,i+3,pattern);const forecastFuture=cumulative(labels.length-1-cutoff,1,0);
 const points=labels.map((label,j)=>({label,forecast:j<=cutoff?expected*forecastPast[j]:expected+(forecast-expected)*forecastFuture[j-cutoff],actual:j<=cutoff?actual*actualPast[j]:null,projection:j>=cutoff?actual+(projected-actual)*future[j-cutoff]:null}));
 return {id:entity.id,label:entity.displayName,currency:entity.currency,points,cutoff,actual,expected,forecast,projected,delta:(actual/expected-1)*100,story:trendStory(entity,period)};
}
export function aggregateTrend(entities:DemoEstateEntity[],period:TrendPeriod):TrendSeries|null{
 if(!entities.length)return null;if(entities.length===1)return locationTrend(entities[0],period);
 const series=entities.map(e=>locationTrend(e,period));
 const sum=(key:"actual"|"expected"|"forecast"|"projected")=>series.reduce((v,s,i)=>v+s[key]*DEMO_FX_TO_USD[entities[i].currency],0);
 const actual=sum("actual"),expected=sum("expected");
 return {id:"selection",label:`${entities.length} locations · group reporting`,currency:"USD",cutoff:series[0].cutoff,actual,expected,forecast:sum("forecast"),projected:sum("projected"),delta:(actual/expected-1)*100,story:null,points:series[0].points.map((p,j)=>({label:p.label,forecast:series.reduce((v,s,i)=>v+s.points[j].forecast*DEMO_FX_TO_USD[entities[i].currency],0),actual:p.actual===null?null:series.reduce((v,s,i)=>v+s.points[j].actual!*DEMO_FX_TO_USD[entities[i].currency],0),projection:p.projection===null?null:series.reduce((v,s,i)=>v+s.points[j].projection!*DEMO_FX_TO_USD[entities[i].currency],0)}))};
}
