import type { GuestNeedsRecord } from "@/lib/product/guestSignals";
export type { GuestNeedsRecord } from "@/lib/product/guestSignals";
/** Reported needs are evidence, never an assurance of an allergy-free service. */
export function GuestNeeds({record,title="Guest needs"}:{record?:GuestNeedsRecord;title?:string}) {
 return <section className="guest-needs" aria-label={title}><h4>{title}</h4>
  <div className="guest-needs-allergies" data-alert={!!record?.allergies?.length}><span>Allergies</span>{record?.allergies?.length?<ul>{record.allergies.map(a=><li key={`${a.guest}-${a.allergen}`}><strong>{a.allergen} · {a.guest}</strong><p>{a.note}</p></li>)}</ul>:<strong>{record?.allergies?"None reported":"Not recorded"}</strong>}<small>{record?.allergies?"Confirm directly with the guest before service.":"Check with the guest. Missing data does not mean no allergies."}</small></div>
  <dl>{record?.occasions?.length?<div><dt>Occasion</dt><dd>{record.occasions.join(" · ")}</dd></div>:null}<div><dt>Dietary preferences</dt><dd>{record?.dietary.length?record.dietary.join(" · "):"Not recorded"}</dd></div><div><dt>Service & access needs</dt><dd>{record?.requests.length?record.requests.join(" · "):"Not recorded"}</dd></div></dl>
  <p className="guest-needs-source">{record?.booking?`${record.booking.provider} · ${record.booking.reference} · ${record.booking.party} · received ${record.booking.receivedAt}. `:""}{record?.source||"No linked guest-needs record"}</p>
 </section>;
}
