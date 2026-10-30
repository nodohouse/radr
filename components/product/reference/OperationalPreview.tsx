"use client";

import Link from "next/link";
import { useState } from "react";
import { getServiceCommand, type ZoneKey } from "@/lib/product/serviceCommand";
import { Arrow, detailHref } from "./ReferenceUI";

const ZONES: {id: ZoneKey; label: string}[] = [{id:"main",label:"Dining room"},{id:"terrace",label:"Terrace"},{id:"bar",label:"Bar"},{id:"private",label:"Private dining"}];
const STATUS = {seated:"Seated",turning:"Turning",wait:"Needs attention",empty:"Available",blocked:"Reserved hold"};

/** A schematic of the demo's actual table positions and state, not a generated venue image. */
export function OperationalPreview({compact=false}:{compact?:boolean}) {
  const model=getServiceCommand();
  const [zone,setZone]=useState<ZoneKey>("main");
  const [selection,setSelection]=useState(model.defaultTableId);
  const tables=model.tables.filter(t=>t.zone===zone);
  const current=tables.find(t=>t.id===selection)||tables.find(t=>t.tone==="wait")||tables[0];
  const detail=current?model.tableDetails[current.id]:undefined;
  return <section className={`rp-operation-preview ${compact?"is-compact":""}`} aria-label="Live operating floor">
    <header><div><span className="rp-preview-eyebrow">Your operation, connected</span><h2>The floor behind the signal.</h2></div><span className="rp-preview-time"><i />Demo snapshot · {model.liveTime}</span></header>
    <div className="rp-preview-content"><div className="rp-preview-world"><div className="rp-preview-zone-tabs" aria-label="Floor zones">{ZONES.map(z=><button type="button" key={z.id} aria-pressed={zone===z.id} onClick={()=>setZone(z.id)}>{z.label}</button>)}</div>
      <div className="rp-preview-floor" aria-label={`${ZONES.find(z=>z.id===zone)?.label} table schematic`}>
        <div className="rp-preview-wall rp-preview-wall-top" aria-hidden="true"/><div className="rp-preview-wall rp-preview-wall-bottom" aria-hidden="true"/><span className="rp-preview-floor-label">{ZONES.find(z=>z.id===zone)?.label}</span>
        {tables.map(t=><button type="button" key={t.id} className="rp-preview-table" data-tone={t.tone} data-selected={current?.id===t.id||undefined} style={{left:`${t.x}%`,top:`${t.y}%`}} aria-label={`Table ${t.n}, ${STATUS[t.tone]}, ${t.party||0} of ${t.seats} seats`} aria-pressed={current?.id===t.id} onClick={()=>setSelection(t.id)}><i className="rp-preview-chair rp-preview-chair-n"/><i className="rp-preview-chair rp-preview-chair-s"/>{t.seats>2?<><i className="rp-preview-chair rp-preview-chair-e"/><i className="rp-preview-chair rp-preview-chair-w"/></>:null}<strong>{t.n}</strong><span>{t.waitMin?`${t.waitMin}m`:t.party?`${t.party}/${t.seats}`:t.tone==='empty'?'Free':'Hold'}</span></button>)}
      </div><footer className="rp-preview-legend"><span><i data-tone="seated"/>Seated</span><span><i data-tone="wait"/>Needs attention</span><span><i data-tone="turning"/>Turning</span><span className="rp-preview-schematic">Operating schematic</span></footer>
    </div><aside className="rp-preview-inspector" aria-live="polite">{current?<><span className="rp-preview-eyebrow">Selected table</span><div className="rp-preview-selected"><h3>Table {current.n}</h3><span data-tone={current.tone}>{STATUS[current.tone]}</span></div><div className="rp-preview-table-facts"><span><b>{current.party||0}<small> / {current.seats}</small></b>Guests seated</span><span><b>{current.waitMin?`${current.waitMin} min`:current.seatedMin?`${current.seatedMin} min`:'Ready'}</b>{current.waitMin?'Current wait':current.seatedMin?'Since seated':'Table status'}</span></div><div className="rp-preview-recommendation"><span className="rp-preview-eyebrow">What matters</span><p>{detail?.problem||current.stage||`${STATUS[current.tone]} in ${ZONES.find(z=>z.id===zone)?.label.toLowerCase()}.`}</p>{detail?.recommendation?<small>{detail.recommendation}</small>:null}</div><Link href={detailHref(`/app/service?table=${current.id}`)} className="rp-preview-action">Review table evidence <Arrow/></Link><span className="rp-preview-provenance">Table state and timing from the operating demo.</span></>:<p>No tables in this area.</p>}</aside></div>
  </section>;
}
