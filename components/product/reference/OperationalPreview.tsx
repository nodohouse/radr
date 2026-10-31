"use client";

import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import { getServiceCommand, type ZoneKey } from "@/lib/product/serviceCommand";
import { PlanCanvas } from "../layout-studio/PlanCanvas";
import type { CameraBridge } from "../layout-studio/LayoutScene";
import type { LayoutDraft } from "@/lib/radr/live/layoutDraft";
import { Arrow, detailHref } from "./ReferenceUI";

const ZONES: {id: ZoneKey; label: string}[] = [{id:"main",label:"Dining room"},{id:"terrace",label:"Terrace"},{id:"bar",label:"Bar"},{id:"private",label:"Private dining"}];
const STATUS = {seated:"Seated",turning:"Turning",wait:"Needs attention",empty:"Available",blocked:"Reserved hold"};

/** A schematic of the demo's actual table positions and state, not a generated venue image. */
export function OperationalPreview({compact=false,immersive=false}:{compact?:boolean;immersive?:boolean}) {
  const model=getServiceCommand();
  const [zone,setZone]=useState<ZoneKey>("main");
  const [selection,setSelection]=useState(model.defaultTableId);
  const bridge=useRef<CameraBridge|null>(null);
  const tables=model.tables.filter(t=>t.zone===zone);
  const current=tables.find(t=>t.id===selection)||tables.find(t=>t.tone==="wait")||tables[0];
  const detail=current?model.tableDetails[current.id]:undefined;
  const draft:LayoutDraft=useMemo(()=>({version:1,vertical:"restaurant",name:"Live service",floors:[{id:`live-${zone}`,name:ZONES.find(z=>z.id===zone)?.label||"Dining room",width:24,depth:16,items:model.tables.filter(t=>t.zone===zone).map(t=>({id:t.id,kind:t.seats===2?"table2":"table4",label:`Table ${t.n}`,x:(t.x-50)*.24,z:(t.y-50)*.16,width:t.seats===2?1:1.6,depth:1}))}]}),[model,zone]);
  const liveStates=Object.fromEntries(tables.map(t=>[t.id,{tone:t.tone,label:STATUS[t.tone],detail:t.waitMin?`${t.waitMin} min wait`:t.party?`${t.party}/${t.seats} guests`:t.tone==="empty"?"Available":"Reserved"}]));
  return <section className={`rp-operation-preview ${compact?"is-compact":""} ${immersive?"is-live-plan":""}`} aria-label="Live operating floor">
    <header><div><span className="rp-preview-eyebrow">Your operation, connected</span><h2>{immersive?"See the service. Find the pressure.":"The floor behind the signal."}</h2></div><span className="rp-preview-time"><i />Demo snapshot · {model.liveTime}</span></header>
    <div className="rp-preview-content"><div className="rp-preview-world"><div className="rp-preview-zone-tabs" aria-label="Floor zones">{ZONES.map(z=><button type="button" key={z.id} aria-pressed={zone===z.id} onClick={()=>{setZone(z.id);}}>{z.label}</button>)}</div>
      {immersive?<>
        <div className="rp-live-gesture-stage" tabIndex={0} role="region" aria-label="Live floor. Drag to pan; scroll or pinch to zoom; click a table for evidence." onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(["+","=","-","0"].includes(e.key)){e.preventDefault();if(e.key==="0")bridge.current?.reset();else bridge.current?.zoom(e.key==="-"?1.15:.87);}}}>
          <PlanCanvas draft={draft} floor={`live-${zone}`} selected={current?.id||null} editing={false} reference={null} revision={0} onSelect={id=>{if(id)setSelection(id);}} onFloor={()=>{}} onMove={()=>{}} onAdd={()=>{}} onGestureStart={()=>{}} bridge={bridge} readOnly liveStates={liveStates}/>
        </div>
        <div className="rp-live-gesture-help">Drag to shift around · Scroll or pinch to zoom · Double-click to fit</div>
      </>:<div className="rp-preview-floor" aria-label={`${ZONES.find(z=>z.id===zone)?.label} table schematic`}>{tables.map(t=><button type="button" key={t.id} className="rp-preview-table" data-tone={t.tone} data-selected={current?.id===t.id||undefined} style={{left:`${t.x}%`,top:`${t.y}%`}} aria-label={`Table ${t.n}, ${STATUS[t.tone]}`} aria-pressed={current?.id===t.id} onClick={()=>setSelection(t.id)}><strong>{t.n}</strong></button>)}</div>}
      <footer className="rp-preview-legend"><span><i data-tone="seated"/>Seated</span><span><i data-tone="wait"/>Needs attention</span><span><i data-tone="turning"/>Turning</span><span className="rp-preview-schematic">Operating schematic</span></footer>
    </div><aside className="rp-preview-inspector" aria-live="polite">{current?<><span className="rp-preview-eyebrow">Selected table</span><div className="rp-preview-selected"><h3>Table {current.n}</h3><span data-tone={current.tone}>{STATUS[current.tone]}</span></div><div className="rp-preview-table-facts"><span><b>{current.party||0}<small> / {current.seats}</small></b>Guests seated</span><span><b>{current.waitMin?`${current.waitMin} min`:current.seatedMin?`${current.seatedMin} min`:'Ready'}</b>{current.waitMin?'Current wait':current.seatedMin?'Since seated':'Table status'}</span></div><div className="rp-preview-recommendation"><span className="rp-preview-eyebrow">What matters</span><p>{detail?.problem||current.stage||`${STATUS[current.tone]} in ${ZONES.find(z=>z.id===zone)?.label.toLowerCase()}.`}</p>{detail?.recommendation?<small>{detail.recommendation}</small>:null}</div><Link href={detailHref(`/app/service?table=${current.id}`)} className="rp-preview-action">Review table evidence <Arrow/></Link><span className="rp-preview-provenance">Table state and timing from the operating demo.</span></>:<p>No tables in this area.</p>}</aside></div>
  </section>;
}
