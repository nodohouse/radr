import {getRestaurantMoneyFlow,getHotelMoneyFlow} from "@/lib/radr/product/liveFlows";
import {DEMO_FX_TO_USD,type DemoEstateEntity} from "@/lib/radr/demo/estateRegistry";
import {locationTrend,type TrendPeriod} from "./performanceTrend";
export type BridgeRow={id:string;label:string;revenue:number;cost:number;contribution:number};
export type CostRow={id:string;label:string;amount:number;evidence:string};
export type RevenueBridge={revenue:number;cost:number;contribution:number;products:BridgeRow[];channels:BridgeRow[];costs:CostRow[]};
/** A reconciled illustrative allocation, not product-level POS margin or settled cash. */
function baseBridge(hotel:boolean):RevenueBridge{
 const flow=hotel?getHotelMoneyFlow():getRestaurantMoneyFlow();
 const productLabels=hotel?["Rooms","Food & drinks","Packages & upgrades","Spa"]:["Food","Drinks"];
 const channelLabels=hotel?["Direct / property","Booking.com","Expedia"]:["Dine-in","Bar","Direct delivery / pickup","Uber Eats","Deliveroo"];
 // Rows are product categories, columns channels. These dimensions never add together.
 const matrix=hotel?[[10300,5600,2740],[1240,0,0],[1840,0,0],[620,0,0]]:[[9000,120,1450,1840,850],[3840,1000,170,100,50]];
 const costs:CostRow[]=flow.steps.filter(s=>s.kind==="reduction").map(s=>({id:s.id,label:s.label,amount:-s.amount,evidence:s.evidence.toLowerCase()}));
 if(hotel)costs.push({id:"labor",label:"Labor estimate",amount:6700,evidence:"modeled"},{id:"cogs",label:"Consumption estimate",amount:1800,evidence:"modeled"},{id:"supplies",label:"Room supplies estimate",amount:840,evidence:"modeled"},{id:"energy",label:"Energy allocation",amount:620,evidence:"modeled"});
 const revenue=matrix.flat().reduce((a,b)=>a+b,0);const cost=costs.reduce((s,c)=>s+c.amount,0);
 const feeByChannel=hotel?[0,760,360]:[0,0,30,480,100];
 const directFee=feeByChannel.reduce((a,b)=>a+b,0);const shared=cost-directFee;
 const channelRevenues=channelLabels.map((_,j)=>matrix.reduce((s,row)=>s+row[j],0));
 const products=productLabels.map((label,i)=>{const amount=matrix[i].reduce((a,b)=>a+b,0);const allocated=shared*amount/revenue+matrix[i].reduce((sum,value,j)=>sum+feeByChannel[j]*value/channelRevenues[j],0);return {id:`product-${i}`,label,revenue:amount,cost:allocated,contribution:amount-allocated};});
 const channels=channelLabels.map((label,j)=>{const amount=channelRevenues[j];const allocated=shared*amount/revenue+feeByChannel[j];return {id:`channel-${j}`,label,revenue:amount,cost:allocated,contribution:amount-allocated};});
 return {revenue,cost,contribution:revenue-cost,products,channels,costs};
}
export function revenueBridge(entities:DemoEstateEntity[],period:TrendPeriod,progress=1):RevenueBridge|null{
 if(!entities.length)return null;const hotel=entities[0].vertical==="hotel";const base=baseBridge(hotel);
 // Hotel trend tracks room revenue only; this bridge includes all departments.
 const factor=Math.max(0,Math.min(1,progress))*entities.reduce((sum,e)=>sum+locationTrend(e,period).actual/(hotel?18640:18420)*(entities.length>1?DEMO_FX_TO_USD[e.currency]:1),0);
 return {revenue:base.revenue*factor,cost:base.cost*factor,contribution:base.contribution*factor,products:base.products.map(r=>({...r,revenue:r.revenue*factor,cost:r.cost*factor,contribution:r.contribution*factor})),channels:base.channels.map(r=>({...r,revenue:r.revenue*factor,cost:r.cost*factor,contribution:r.contribution*factor})),costs:base.costs.map(r=>({...r,amount:r.amount*factor}))};
}
