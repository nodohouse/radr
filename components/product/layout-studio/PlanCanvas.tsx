"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { SceneProps } from "./LayoutScene";
import type { LayoutKind } from "@/lib/radr/live/layoutDraft";
type View={x:number;y:number;w:number;h:number};
/** Native SVG pointer capture keeps arrangement independent of WebGL and orbit controls. */
export function PlanCanvas({draft,floor,selected,reference,revision,onSelect,onMove,onAdd,onGestureStart,bridge}:SceneProps) {
  const level=draft.floors.find(f=>f.id===floor)||draft.floors[0];
  const initial=useCallback(()=>({x:-level.width/2-2,y:-level.depth/2-2,w:level.width+4,h:level.depth+4}),[level.width,level.depth]);
  const [view,setView]=useState<View>(initial);const svg=useRef<SVGSVGElement>(null);const viewRef=useRef(view);viewRef.current=view;
  const latest=useRef({onMove,onAdd,onGestureStart,onSelect});latest.current={onMove,onAdd,onGestureStart,onSelect};
  const drag=useRef<{id:string;dx:number;dz:number}|null>(null);const pan=useRef<{x:number;y:number;view:View;scale:number}|null>(null);
  const touches=useRef(new Map<number,{x:number;y:number}>());const pinch=useRef<{distance:number;view:View;x:number;y:number}|null>(null);
  const point=(clientX:number,clientY:number)=>{const el=svg.current,m=el?.getScreenCTM();if(!el||!m)return null;const p=el.createSVGPoint();p.x=clientX;p.y=clientY;return p.matrixTransform(m.inverse());};
  const zoom=useCallback((factor:number,anchor?:{x:number;y:number})=>setView(v=>{const f=Math.max((level.width+4)*.2,Math.min((level.width+4)*4,v.w*factor))/v.w;const p=anchor||{x:v.x+v.w/2,y:v.y+v.h/2};return {x:p.x-(p.x-v.x)*f,y:p.y-(p.y-v.y)*f,w:v.w*f,h:v.h*f};}),[level.width]);
  useEffect(()=>{setView(initial());drag.current=null;pan.current=null;},[initial,revision,floor]);
  useEffect(()=>{bridge.current={reset:()=>setView(initial()),zoom,drop:(x:number,y:number,kind:LayoutKind)=>{const p=point(x,y);if(p)latest.current.onAdd(kind,p.x,p.y);}};return()=>{bridge.current=null;};},[bridge,initial,zoom]);
  useEffect(()=>{const el=svg.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();const p=point(e.clientX,e.clientY);zoom(Math.exp(Math.max(-200,Math.min(200,e.deltaY))*.003),p||undefined);};el.addEventListener("wheel",wheel,{passive:false});return()=>el.removeEventListener("wheel",wheel);},[zoom]);
  const finish=(e:ReactPointerEvent<SVGElement>)=>{drag.current=null;pan.current=null;touches.current.delete(e.pointerId);if(touches.current.size<2)pinch.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
  return <svg ref={svg} className="lp-native-plan" data-testid="floor-plan" viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} aria-label={`${level.name}. Drag any object to move it.`}
    onPointerDownCapture={e=>{if(e.pointerType!=="touch")return;touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.current.size===2){const [a,b]=[...touches.current.values()];const p=point((a.x+b.x)/2,(a.y+b.y)/2);if(p){pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),view:viewRef.current,x:p.x,y:p.y};drag.current=null;pan.current=null;e.currentTarget.setPointerCapture(e.pointerId);e.stopPropagation();}}}}
    onPointerMoveCapture={e=>{if(e.pointerType!=="touch"||!touches.current.has(e.pointerId))return;touches.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch.current&&touches.current.size===2){e.preventDefault();e.stopPropagation();const [a,b]=[...touches.current.values()];const start=pinch.current;const f=Math.max(.2,Math.min(4,start.distance/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))));setView({x:start.x-(start.x-start.view.x)*f,y:start.y-(start.y-start.view.y)*f,w:start.view.w*f,h:start.view.h*f});}}}
    onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();latest.current.onSelect(null);const m=e.currentTarget.getScreenCTM();pan.current={x:e.clientX,y:e.clientY,view:viewRef.current,scale:m?.a||1};e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{if(!pan.current)return;const p=pan.current;setView({...p.view,x:p.view.x-(e.clientX-p.x)/p.scale,y:p.view.y-(e.clientY-p.y)/p.scale});}}
    onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={()=>{drag.current=null;pan.current=null;}}>
    <defs><pattern id="plan-grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#dce6f6" strokeWidth=".025"/></pattern></defs>
    <rect x="-1000" y="-1000" width="2000" height="2000" fill="#edf3ff"/>
    <rect x={-level.width/2} y={-level.depth/2} width={level.width} height={level.depth} rx=".25" fill="#fff" stroke="#a9bedf" strokeWidth=".08"/>
    <rect x={-level.width/2} y={-level.depth/2} width={level.width} height={level.depth} fill="url(#plan-grid)"/>
    {reference?<image href={reference} x={-level.width/2} y={-level.depth/2} width={level.width} height={level.depth} opacity=".5" pointerEvents="none"/>:null}
    {level.items.map(item=>{const active=selected===item.id,table=item.kind.startsWith("table"),r=item.kind==="table2"?Math.min(item.width,item.depth)/2:.12;return <g key={item.id} data-layout-item={item.id} role="button" tabIndex={0} aria-label={`Move ${item.label}`} aria-pressed={active} transform={`translate(${item.x} ${item.z})`} className="lp-plan-object"
      onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const p=point(e.clientX,e.clientY);if(!p)return;latest.current.onSelect(item.id);latest.current.onGestureStart();drag.current={id:item.id,dx:item.x-p.x,dz:item.z-p.y};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(drag.current?.id!==item.id)return;e.preventDefault();e.stopPropagation();const p=point(e.clientX,e.clientY);if(p)latest.current.onMove(item.id,Math.max(-150,Math.min(150,Math.round((p.x+drag.current.dx)*4)/4)),Math.max(-150,Math.min(150,Math.round((p.y+drag.current.dz)*4)/4)));}}
      onPointerUp={e=>{e.stopPropagation();finish(e);}} onPointerCancel={finish}
      onKeyDown={e=>{const moves:Record<string,[number,number]>={ArrowLeft:[-.25,0],ArrowRight:[.25,0],ArrowUp:[0,-.25],ArrowDown:[0,.25]};if(moves[e.key]){e.preventDefault();latest.current.onGestureStart();latest.current.onSelect(item.id);latest.current.onMove(item.id,Math.max(-150,Math.min(150,item.x+moves[e.key][0])),Math.max(-150,Math.min(150,item.z+moves[e.key][1])));}else if(e.key==="Enter"||e.key===" "){e.preventDefault();latest.current.onSelect(item.id);}}}>
      <rect x={-item.width/2-.35} y={-item.depth/2-.35} width={item.width+.7} height={item.depth+.7} fill="transparent"/>
      {table?[-1,1].map(side=><g key={side} pointerEvents="none"><rect x={side<0?-item.width/2-.3:item.width/2+.08} y="-.22" width=".22" height=".44" rx=".07" fill="#a4bddd"/>{item.kind==="table4"?<rect x="-.22" y={side<0?-item.depth/2-.3:item.depth/2+.08} width=".44" height=".22" rx=".07" fill="#a4bddd"/>:null}</g>):null}
      <rect x={-item.width/2} y={-item.depth/2} width={item.width} height={item.depth} rx={r} fill={active?"#00ed87":table?"#235795":"#d8e6fc"} stroke={active?"#08794f":"#7298cd"} strokeWidth={active?.1:.05} pointerEvents="none"/>
      <text y=".1" textAnchor="middle" fontSize={Math.min(.36,item.width*.24)} fill={table&&!active?"#fff":"#173c70"} pointerEvents="none">{(()=>{const text=item.label.replace(/^Table (?:for [24] )?/,"T").replace(/^Room /,"");const max=Math.max(3,Math.floor(item.width/.2));return text.length>max?`${text.slice(0,max-1)}…`:text;})()}</text>
      {active?<rect x={-item.width/2-.17} y={-item.depth/2-.17} width={item.width+.34} height={item.depth+.34} rx=".13" fill="none" stroke="#1755ed" strokeWidth=".055" strokeDasharray=".15 .1" pointerEvents="none"/>:null}
    </g>;})}
  </svg>;
}
