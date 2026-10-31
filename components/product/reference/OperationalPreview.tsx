"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { getServiceCommand, type ZoneKey } from "@/lib/product/serviceCommand";
import { Arrow, detailHref } from "./ReferenceUI";

const ZONES: {id: ZoneKey; label: string}[] = [{id:"main",label:"Dining room"},{id:"terrace",label:"Terrace"},{id:"bar",label:"Bar"},{id:"private",label:"Private dining"}];
const STATUS = {seated:"Seated",turning:"Turning",wait:"Needs attention",empty:"Available",blocked:"Reserved hold"};

/** A schematic of the demo's actual table positions and state, not a generated venue image. */
export function OperationalPreview({compact=false,immersive=false}:{compact?:boolean;immersive?:boolean}) {
  const model=getServiceCommand();
  const [zone,setZone]=useState<ZoneKey>("main");
  const [selection,setSelection]=useState(model.defaultTableId);
  const [zoom,setZoom]=useState(1);
  const [rotation,setRotation]=useState(-18);
  const [flat,setFlat]=useState(false);
  const [focus,setFocus]=useState<{x:number;y:number}>({x:50,y:50});
  const resetCamera=()=>{setZoom(1);setRotation(-18);setFlat(false);setFocus({x:50,y:50});};
  const tables=model.tables.filter(t=>t.zone===zone);
  const current=tables.find(t=>t.id===selection)||tables.find(t=>t.tone==="wait")||tables[0];
  const detail=current?model.tableDetails[current.id]:undefined;
  return <section className={`rp-operation-preview ${compact?"is-compact":""} ${immersive?"is-spatial":""}`} aria-label="Live operating floor">
    <header><div><span className="rp-preview-eyebrow">Your operation, connected</span><h2>{immersive?"See the service. Find the pressure.":"The floor behind the signal."}</h2></div><span className="rp-preview-time"><i />Demo snapshot · {model.liveTime}</span></header>
    <div className="rp-preview-content"><div className="rp-preview-world"><div className="rp-preview-zone-tabs" aria-label="Floor zones">{ZONES.map(z=><button type="button" key={z.id} aria-pressed={zone===z.id} onClick={()=>{setZone(z.id);resetCamera();}}>{z.label}</button>)}</div>
      {immersive?<div className="rp-spatial-intro"><span>VENUE EXPLORER</span><p>Click a table to move closer.</p><small>Rotate the floor or switch to a top view.</small></div>:null}
      <div className="rp-spatial-viewport"><div className="rp-preview-floor" style={immersive?{"--camera-zoom":zoom,"--camera-rotation":`${rotation}deg`,"--camera-tilt":flat?"0deg":"42deg",transformOrigin:`${focus.x}% ${focus.y}%`} as CSSProperties:undefined} aria-label={`${ZONES.find(z=>z.id===zone)?.label} table schematic`}>
        <div className="rp-preview-wall rp-preview-wall-top" aria-hidden="true"/><div className="rp-preview-wall rp-preview-wall-bottom" aria-hidden="true"/><span className="rp-preview-floor-label">{ZONES.find(z=>z.id===zone)?.label}</span>
        {tables.map(t=><button type="button" key={t.id} className="rp-preview-table" data-tone={t.tone} data-selected={current?.id===t.id||undefined} style={{left:`${t.x}%`,top:`${t.y}%`}} aria-label={`Table ${t.n}, ${STATUS[t.tone]}, ${t.party||0} of ${t.seats} seats`} aria-pressed={current?.id===t.id} onClick={()=>{setSelection(t.id);if(immersive){setFocus({x:t.x,y:t.y});setZoom(1.5);}}}><i className="rp-preview-chair rp-preview-chair-n"/><i className="rp-preview-chair rp-preview-chair-s"/>{t.seats>2?<><i className="rp-preview-chair rp-preview-chair-e"/><i className="rp-preview-chair rp-preview-chair-w"/></>:null}<strong>{t.n}</strong><span>{t.waitMin?`${t.waitMin}m`:t.party?`${t.party}/${t.seats}`:t.tone==='empty'?'Free':'Hold'}</span></button>)}
      </div></div>{immersive?<div className="rp-spatial-camera" role="group" aria-label="Floor camera controls">
        <button type="button" aria-label="Zoom out" disabled={zoom<=.75} onClick={()=>setZoom(v=>Math.max(.75,v-.25))}>−</button><output aria-label="Floor zoom">{Math.round(zoom*100)}%</output><button type="button" aria-label="Zoom in" disabled={zoom>=2} onClick={()=>setZoom(v=>Math.min(2,v+.25))}>+</button><i/>
        <button type="button" aria-label="Rotate floor left" onClick={()=>setRotation(v=>v-15)}>↶</button><button type="button" aria-label="Rotate floor right" onClick={()=>setRotation(v=>v+15)}>↷</button>
        <button type="button" aria-pressed={flat} onClick={()=>setFlat(v=>!v)}>{flat?"3D view":"Top view"}</button><button type="button" onClick={resetCamera}>Reset</button>
      </div>:null}<footer className="rp-preview-legend"><span><i data-tone="seated"/>Seated</span><span><i data-tone="wait"/>Needs attention</span><span><i data-tone="turning"/>Turning</span><span className="rp-preview-schematic">Operating schematic</span></footer>
    </div><aside className="rp-preview-inspector" aria-live="polite">{current?<><span className="rp-preview-eyebrow">Selected table</span><div className="rp-preview-selected"><h3>Table {current.n}</h3><span data-tone={current.tone}>{STATUS[current.tone]}</span></div><div className="rp-preview-table-facts"><span><b>{current.party||0}<small> / {current.seats}</small></b>Guests seated</span><span><b>{current.waitMin?`${current.waitMin} min`:current.seatedMin?`${current.seatedMin} min`:'Ready'}</b>{current.waitMin?'Current wait':current.seatedMin?'Since seated':'Table status'}</span></div><div className="rp-preview-recommendation"><span className="rp-preview-eyebrow">What matters</span><p>{detail?.problem||current.stage||`${STATUS[current.tone]} in ${ZONES.find(z=>z.id===zone)?.label.toLowerCase()}.`}</p>{detail?.recommendation?<small>{detail.recommendation}</small>:null}</div><Link href={detailHref(`/app/service?table=${current.id}`)} className="rp-preview-action">Review table evidence <Arrow/></Link><span className="rp-preview-provenance">Table state and timing from the operating demo.</span></>:<p>No tables in this area.</p>}</aside></div>
  </section>;
}
