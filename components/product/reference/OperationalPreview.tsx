"use client";

import Link from "next/link";
import { guestSignals } from "@/lib/product/guestSignals";
import { GuestNeeds } from "../guest-context/GuestNeeds";
import { useState, useMemo, useRef, useEffect } from "react";
import { getServiceCommand, type ZoneKey } from "@/lib/product/serviceCommand";
import { PlanCanvas } from "../layout-studio/PlanCanvas";
import type { CameraBridge } from "../layout-studio/LayoutScene";
import type { LayoutDraft } from "@/lib/radr/live/layoutDraft";
import { tableExperiences } from "@/lib/product/serviceCommand/tableExperience";
import { Arrow, detailHref } from "./ReferenceUI";

const ZONES: {id: ZoneKey; label: string}[] = [{id:"main",label:"Dining room"},{id:"terrace",label:"Terrace"},{id:"bar",label:"Bar"},{id:"private",label:"Private dining"}];
const STATUS = {seated:"Seated",turning:"Turning",wait:"Needs attention",empty:"Available",blocked:"Reserved hold"};

/** A schematic of the demo's actual table positions and state, not a generated venue image. */
export function OperationalPreview({compact=false,immersive=false}:{compact?:boolean;immersive?:boolean}) {
  const model=getServiceCommand();
  const [zone,setZone]=useState<ZoneKey>("main");
  const [selection,setSelection]=useState(model.defaultTableId);
  const [tableTab,setTableTab]=useState<"guest"|"order"|"timeline"|"notes">("guest");
  const [opened,setOpened]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(opened&&!dialog.current?.open)dialog.current?.showModal();else if(!opened&&dialog.current?.open)dialog.current.close();},[opened]);
  const openTable=(id:string)=>{setSelection(id);setTableTab("guest");setOpened(true);};

  const bridge=useRef<CameraBridge|null>(null);
  const tables=model.tables.filter(t=>t.zone===zone);
  const current=tables.find(t=>t.id===selection)||tables.find(t=>t.tone==="wait")||tables[0];
  const detail=current?model.tableDetails[current.id]:undefined;
  const draft:LayoutDraft=useMemo(()=>({version:1,vertical:"restaurant",name:"Live service",floors:[{id:`live-${zone}`,name:ZONES.find(z=>z.id===zone)?.label||"Dining room",width:24,depth:16,items:model.tables.filter(t=>t.zone===zone).map(t=>({id:t.id,kind:t.seats===2?"table2":"table4",label:`Table ${t.n}`,x:(t.x-50)*.24,z:(t.y-50)*.16,width:t.seats===2?1.7:t.seats>=6?2.8:2.3,depth:1.6}))}]}),[model,zone]);
  const experience=current?tableExperiences[current.id]:undefined;
  const money=(value:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value);
  const checkTotal=experience?.orders.reduce((sum,line)=>sum+line.quantity*line.unitPrice,0);
  const minutes=(clock:string)=>{const [h,m]=clock.split(":").map(Number);return h*60+m;};
  const untilArrival=experience?minutes(experience.next.time)-minutes(model.liveTime):null;
  const buffer=experience?minutes(experience.next.time)-minutes(experience.turnover.expectedDeparture)-experience.turnover.resetMinutes:null;
  const liveStates=Object.fromEntries(tables.map(t=>[t.id,{tone:t.tone,label:STATUS[t.tone],signals:[...guestSignals(tableExperiences[t.id]?.needs,"current"),...guestSignals(tableExperiences[t.id]?.next.needs,"incoming")],detail:t.waitMin?`${t.waitMin} min wait`:t.party?`${t.party}/${t.seats} guests`:t.tone==="empty"?"Available":"Reserved"}]));
  return <section className={`rp-operation-preview ${compact?"is-compact":""} ${immersive?"is-live-plan":""} is-simplified`} aria-label="Live operating floor">
    <header><div><span className="rp-preview-eyebrow">Your operation, connected</span><h2>{immersive?"See the service. Find the pressure.":"The floor behind the signal."}</h2></div><span className="rp-preview-time"><i />Demo snapshot · {model.liveTime}</span></header>
    <div className="simp-live-attention" aria-label="Current service pressure">{model.pressure.filter(p=>p.current>=85).map(p=><Link key={p.id} href={detailHref(`/app/service?pressure=${p.id}`)}><strong>{p.label} · {p.current}%</strong><span>{p.cause}</span><b>Review pressure →</b></Link>)}</div>
    <div className="rp-preview-content"><div className="rp-preview-world"><div className="rp-preview-zone-tabs" aria-label="Floor zones">{ZONES.map(z=><button type="button" key={z.id} aria-pressed={zone===z.id} onClick={()=>{setZone(z.id);}}>{z.label}</button>)}</div>
      {immersive?<>
        <div className="rp-live-gesture-stage" tabIndex={0} role="region" aria-label="Live floor. Drag to pan; scroll or pinch to zoom; click a table for evidence." onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(["+","=","-","0"].includes(e.key)){e.preventDefault();if(e.key==="0")bridge.current?.reset();else bridge.current?.zoom(e.key==="-"?1.15:.87);}}}>
          <PlanCanvas draft={draft} floor={`live-${zone}`} selected={current?.id||null} editing={false} reference={null} revision={0} onSelect={id=>{if(id){openTable(id);}}} onInspect={()=>{}} onFloor={()=>{}} onMove={()=>{}} onAdd={()=>{}} onGestureStart={()=>{}} bridge={bridge} readOnly liveStates={liveStates}/>
        </div>
        <div className="rp-live-gesture-help">Drag to shift around · Scroll or pinch to zoom · Double-click to fit</div>
      </>:<div className="rp-preview-floor" aria-label={`${ZONES.find(z=>z.id===zone)?.label} table schematic`}>{tables.map(t=><button type="button" key={t.id} className="rp-preview-table" data-tone={t.tone} data-selected={current?.id===t.id||undefined} style={{left:`${t.x}%`,top:`${t.y}%`}} aria-label={`Table ${t.n}, ${STATUS[t.tone]}`} aria-pressed={current?.id===t.id} onClick={()=>openTable(t.id)}><strong>{t.n}</strong></button>)}</div>}
      <div className="guest-signal-legend"><span>! Allergy</span><span>★ Occasion</span><span>≡ Booking notes</span><span>Dashed markers = next booking</span></div><footer className="rp-preview-legend"><span><i data-tone="seated"/>Seated</span><span><i data-tone="wait"/>Needs attention</span><span><i data-tone="turning"/>Turning</span><span className="rp-preview-schematic">Operating schematic</span></footer>
    </div><dialog ref={dialog} className="simp-live-dialog" aria-labelledby="simp-table-title" onClose={()=>setOpened(false)} onClick={e=>{if(e.target===e.currentTarget)setOpened(false);}}>
    <header className="simp-drawer-header"><span className="rs-eyebrow">TABLE CONTEXT</span><button type="button" onClick={()=>setOpened(false)} aria-label="Close table details">Close ×</button></header>
    <aside className="rp-preview-inspector" data-testid="table-service-details">{current ? <>
      <div className="rp-preview-selected"><h3 id="simp-table-title">Table {current.n}</h3><span data-tone={current.tone}>{STATUS[current.tone]}</span></div>
      <div className="simp-table-facts"><span><b>{current.party||0} / {current.seats}</b>Guests</span><span><b>{current.seatedMin ? `${current.seatedMin} min` : "Ready"}</b>Since seated</span><span><b>{checkTotal !== undefined ? money(checkTotal) : "Unavailable"}</b>{current.tone === "turning" ? "Settled check" : "Current check"}</span></div>
      <div className="simp-table-action"><span className="rp-preview-eyebrow">NEXT ACTION</span><p>{detail?.recommendation || detail?.problem || current.stage || STATUS[current.tone]}</p><small>{current.stage || "Course not recorded"}{current.waitMin ? ` · ${current.waitMin} min waiting` : ""}</small></div>
      <div className="simp-critical-needs" aria-label="Immediate guest alerts"><strong>Current party</strong><p>{experience?.needs.allergies?.length ? experience.needs.allergies.map(a=>`${a.allergen} allergy · ${a.guest}`).join("; ") : experience?.needs.allergies ? "No allergies reported · confirm with guest" : "Allergies not recorded · confirm before service"}</p>{experience?.needs.occasions?.length ? <small>{experience.needs.occasions.join(" · ")}</small> : null}
      {experience?.needs.requests.length ? <small>Service needs: {experience.needs.requests.join(" · ")}</small> : null}<strong>Next reservation · {experience?.next.time || "Unavailable"}</strong><p>{experience ? `${experience.next.guests} guests · ${untilArrival! > 0 ? `due in ${untilArrival} min` : "Check arrival status"}` : "No confirmed next booking linked"}</p>{experience?.next.needs.allergies?.length ? <p>Incoming allergy: {experience.next.needs.allergies.map(a=>a.allergen).join(", ")} · reconfirm before seating</p> : null}{experience?.next.needs.requests.length ? <small>Incoming needs: {experience.next.needs.requests.join(" · ")}</small> : null}{experience?.next.needs.occasions?.length ? <small>Incoming: {experience.next.needs.occasions.join(" · ")}</small> : null}</div>
      <div className="rp-table-tabs" role="tablist" aria-label="Table details" onKeyDown={e=>{const tabs=["guest","order","timeline","notes"] as const;if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key)){e.preventDefault();const i=tabs.indexOf(tableTab);const next=tabs[e.key==="Home"?0:e.key==="End"?3:(i+(e.key==="ArrowRight"?1:3))%4];setTableTab(next);e.currentTarget.querySelector<HTMLButtonElement>(`#table-${next}-tab`)?.focus();}}}>{(["guest","order","timeline","notes"] as const).map(tab=><button type="button" key={tab} id={`table-${tab}-tab`} role="tab" aria-controls={`table-${tab}`} aria-selected={tableTab===tab} tabIndex={tableTab===tab?0:-1} onClick={()=>setTableTab(tab)}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>)}</div>
      <section id="table-guest" role="tabpanel" aria-labelledby="table-guest-tab" hidden={tableTab!=="guest"} className="simp-table-panel"><h4>{experience ? experience.guest.returning ? "Returning guests" : "First recorded visit" : "Guest history unavailable"}</h4><p>{experience ? `${experience.guest.name} · ${experience.guest.visits} recorded visits` : "No linked guest record for this table."}</p><details><summary>Guest preferences and booking evidence</summary><GuestNeeds record={experience?.needs} title="Current party needs"/></details></section>
      <section id="table-order" role="tabpanel" aria-labelledby="table-order-tab" hidden={tableTab!=="order"} className="simp-table-panel"><h4>{current.stage || "Course not recorded"}</h4><p>{current.waitMin ? `${current.waitMin} min waiting · service attention needed` : STATUS[current.tone]} · {experience ? `${experience.orders.reduce((n,l)=>n+l.quantity,0)} items on check` : "No linked check"}</p><details><summary>View itemized order</summary><ul className="simp-order-lines">{experience?.orders.map(line=><li key={line.name}><span>{line.quantity} × {line.name}<small>{line.status}</small></span><b>{money(line.quantity*line.unitPrice)}</b></li>)}</ul>{!experience ? <p>Order details are unavailable in this snapshot.</p> : null}</details><small>Demo POS · excluding tax and gratuity</small></section>
      <section id="table-timeline" role="tabpanel" aria-labelledby="table-timeline-tab" hidden={tableTab!=="timeline"} className="simp-table-panel rp-table-journey"><h4>Table timeline · {model.liveTime}</h4><div className="rp-table-slot"><span>Before</span><strong>{experience?.previous.party || "Previous party unavailable"}</strong><small>{experience ? `${experience.previous.time} · ${experience.previous.summary}` : "No linked seating history"}</small></div><ol>{experience?.events.map((event,i)=><li key={event.time} data-current={i===experience.events.length-1}><time>{event.time}</time><div><strong>{event.label}</strong><p>{event.detail}</p></div></li>)}</ol><div className="rp-table-slot is-next"><span>Up next</span><strong>{experience ? `${experience.next.time} · ${experience.next.party}` : "Next reservation unavailable"}</strong><small>{experience?.next.note}</small></div>{experience ? <p>Expected departure {experience.turnover.expectedDeparture} · {experience.turnover.resetMinutes} min reset · {buffer! >= 0 ? `${buffer} min estimated buffer` : `${Math.abs(buffer!)} min estimated conflict`}. Estimate, not confirmed release. {experience.turnover.owner}.</p> : null}</section>
      <section id="table-notes" role="tabpanel" aria-labelledby="table-notes-tab" hidden={tableTab!=="notes"} className="simp-table-panel"><GuestNeeds record={experience?.needs} title="Current party notes"/><GuestNeeds record={experience?.next.needs} title="Incoming party notes"/>{experience ? <small>{experience.next.reference} · Confirmed · arrival not recorded</small> : null}</section>
      <Link href={detailHref(`/app/service?table=${current.id}`)} className="rp-preview-action">Review table evidence <Arrow/></Link><span className="rp-preview-provenance">Illustrative demo records · not a live POS or guest feed.</span>
    </> : <p>No table selected.</p>}</aside></dialog></div>

  </section>;
}
