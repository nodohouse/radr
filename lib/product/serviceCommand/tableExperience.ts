/** Illustrative records for the product demo. Never treated as connected POS/CRM data. */
export type TableExperience = {
 guest:{name:string;returning:boolean;visits:number};
 orders:{name:string;quantity:number;unitPrice:number;status:"Served"|"Preparing"|"Paid"}[];
 previous:{time:string;party:string;summary:string};
 next:{time:string;party:string;guests:number;note:string};
 events:{time:string;label:string;detail:string}[];
};
export const tableExperiences:Record<string,TableExperience>={
 t8:{
  guest:{name:"Morgan party",returning:true,visits:5},
  orders:[{name:"Burrata",quantity:2,unitPrice:18,status:"Served"},{name:"Steak frites",quantity:2,unitPrice:38,status:"Preparing"},{name:"Roasted sea bass",quantity:2,unitPrice:34,status:"Preparing"},{name:"House wine · glass",quantity:4,unitPrice:14,status:"Served"}],
  previous:{time:"18:15",party:"Taylor party · 2 guests",summary:"Departed · $126 paid"},
  next:{time:"20:15",party:"Jordan party",guests:4,note:"Confirmed reservation · not yet seated"},
  events:[{time:"18:40",label:"Guests seated",detail:"4 guests · returning party"},{time:"18:47",label:"Order placed",detail:"Starters, mains and 4 glasses of wine"},{time:"19:02",label:"Starters served",detail:"2 burrata delivered"},{time:"19:29",label:"Mains sent to kitchen",detail:"2 steak frites · 2 sea bass"},{time:"19:48",label:"Mains waiting · 19 min",detail:"Needs attention · kitchen pressure elevated"}]
 },
 t6:{
  guest:{name:"Casey party",returning:false,visits:1},
  orders:[{name:"Three-course menu",quantity:4,unitPrice:62,status:"Paid"},{name:"Sparkling water",quantity:2,unitPrice:7,status:"Paid"}],
  previous:{time:"17:35",party:"Alex party · 2 guests",summary:"Departed · $98 paid"},
  next:{time:"20:10",party:"Sam party",guests:4,note:"Confirmed reservation · not yet seated"},
  events:[{time:"17:56",label:"Guests seated",detail:"4 guests · first recorded visit"},{time:"18:05",label:"Order placed",detail:"4 three-course menus"},{time:"19:25",label:"Dessert served",detail:"Final course delivered"},{time:"19:42",label:"Check paid",detail:"$262 settled · excluding gratuity"},{time:"19:48",label:"Table turning",detail:"Pre-bus before the next arrival"}]
 }
};
