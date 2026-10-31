export type GuestNeedsRecord = {
 allergies:{guest:string;allergen:string;note:string}[]|null;
 dietary:string[];
 requests:string[];
 source:string;
 occasions?:string[];
 booking?:{reference:string;party:string;provider:string;receivedAt:string};
};
export type GuestSignal={kind:"allergy"|"occasion"|"remark";scope:"current"|"incoming";label:string;detail:string};
/** Signals come from structured records, not keyword guesses or a room number alone. */
export function guestSignals(record:GuestNeedsRecord|undefined,scope:GuestSignal["scope"]):GuestSignal[]{
 if(!record)return [];
 const signals:GuestSignal[]=[];
 if(record.allergies?.length)signals.push({kind:"allergy",scope,label:"Allergy",detail:record.allergies.map(a=>`${a.allergen} · ${a.guest}`).join("; ")});
 if(record.occasions?.length)signals.push({kind:"occasion",scope,label:"Occasion",detail:record.occasions.join("; ")});
 const remarks=[...record.dietary,...record.requests];
 if(remarks.length)signals.push({kind:"remark",scope,label:"Notes",detail:remarks.join("; ")});
 return signals;
}
export function signalDescription(signals:GuestSignal[]):string{return signals.map(s=>`${s.scope==="incoming"?"Next booking":"Current party"}: ${s.label}: ${s.detail}`).join(". ");}
