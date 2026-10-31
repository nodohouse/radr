"use client";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { Edges, Html, OrbitControls } from "@react-three/drei";
import { Color, Plane, Raycaster, TextureLoader, Vector2, Vector3, SRGBColorSpace, type Texture } from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import type { LayoutDraft, LayoutItem, LayoutKind } from "@/lib/radr/live/layoutDraft";
export type CameraBridge = { reset:()=>void; zoom:(factor:number)=>void; drop:(x:number,y:number,kind:LayoutKind)=>void };
export type SceneProps = {onGestureStart:()=>void;draft:LayoutDraft;floor:string;editing:boolean;selected:string|null;reference:string|null;revision:number;onSelect:(id:string|null)=>void;onFloor:(id:string)=>void;onMove:(id:string,x:number,z:number)=>void;onAdd:(kind:LayoutKind,x:number,z:number)=>void;bridge:MutableRefObject<CameraBridge|null>};
const HEIGHT=3.6;
function ObjectMesh({item,y,editing,selected,onSelect,onMove,onDrag}:{item:LayoutItem;y:number;editing:boolean;selected:boolean;onSelect:()=>void;onMove:(x:number,z:number)=>void;onDrag:(value:boolean)=>void}) {
  const [hover,setHover]=useState(false);const drag=useRef(false);const offset=useRef(new Vector3());
  const table=item.kind.startsWith("table");const height=table ? .72 :item.kind==="room"?2:item.kind==="wall"?2.6:item.kind==="bar"?1.1:1.8;
  const color=selected?"#00ed87":hover?"#92c0ff":item.kind==="room"?"#d2e2ff":item.kind==="wall"?"#9db5db":table?"#ffffff":"#97b8e8";
  const intersect=(e:ThreeEvent<PointerEvent>)=>e.ray.intersectPlane(new Plane(new Vector3(0,1,0),-y),new Vector3());
  return <group position={[item.x,y,item.z]} onPointerOver={e=>{e.stopPropagation();setHover(true);}} onPointerOut={()=>setHover(false)}
    onPointerDown={e=>{e.stopPropagation();onSelect();if(!editing)return;const p=intersect(e);if(!p)return;offset.current.set(item.x-p.x,0,item.z-p.z);drag.current=true;onDrag(true);(e.target as unknown as Element).setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{if(!drag.current)return;e.stopPropagation();const p=intersect(e);if(p){onMove(Math.max(-150,Math.min(150,Math.round((p.x+offset.current.x)*4)/4)),Math.max(-150,Math.min(150,Math.round((p.z+offset.current.z)*4)/4)));}}}
    onPointerUp={e=>{if(!drag.current)return;drag.current=false;onDrag(false);(e.target as unknown as Element).releasePointerCapture(e.pointerId);}}
    onPointerCancel={()=>{drag.current=false;onDrag(false);}}>
    <mesh castShadow receiveShadow position={[0,height/2,0]}><boxGeometry args={[item.width,height,item.depth]}/><meshStandardMaterial color={color} roughness={.3} metalness={.12}/>{(selected||hover||item.kind==="room")?<Edges color={selected?"#00b877":"#8ba9d5"}/>:null}</mesh>
    {table?[-1,1].flatMap(side=>[<mesh key={`${side}-a`} position={[side*(item.width/2+.22),.25,0]} castShadow><boxGeometry args={[.32,.5,.4]}/><meshStandardMaterial color="#6686b6"/></mesh>,...(item.kind==="table4"?[<mesh key={`${side}-b`} position={[0,.25,side*(item.depth/2+.22)]} castShadow><boxGeometry args={[.4,.5,.32]}/><meshStandardMaterial color="#6686b6"/></mesh>]:[])]):null}
    {(hover||selected)&&!drag.current?<Html position={[0,height+.5,0]} center style={{pointerEvents:"none"}}><div className="lp-world-label">{item.label}<small>{item.kind==="room"?"Layout room":"Layout object"}</small></div></Html>:null}
  </group>;
}
function World(props:SceneProps) {
  const {draft,floor,editing,selected,reference,revision,onSelect,onFloor,onMove,onAdd,bridge}=props;
  const {camera,gl,invalidate}=useThree();const controls=useRef<OrbitControlsType>(null);const [dragging,setDragging]=useState(false);const [hoverFloor,setHoverFloor]=useState<string|null>(null);const [texture,setTexture]=useState<Texture|null>(null);
  const draftRef=useRef(draft);draftRef.current=draft;const addRef=useRef(onAdd);addRef.current=onAdd;
  const activeIndex=draft.floors.findIndex(f=>f.id===floor);
  useEffect(()=>{if(!reference){setTexture(null);return;}let valid=true;let loaded:Texture|null=null;new TextureLoader().load(reference,t=>{loaded=t;t.colorSpace=SRGBColorSpace;if(valid){setTexture(t);invalidate();}else t.dispose();});return()=>{valid=false;loaded?.dispose();};},[reference,invalidate]);
  useEffect(()=>{
    const reset=()=>{const items=draftRef.current.floors.flatMap(f=>f.items);const width=Math.max(24,...draftRef.current.floors.map(f=>f.width),...items.map(i=>Math.abs(i.x)*2+i.width+6));const depth=Math.max(18,...draftRef.current.floors.map(f=>f.depth),...items.map(i=>Math.abs(i.z)*2+i.depth+6));const y=floor==="all"?(draftRef.current.floors.length-1)*HEIGHT/2:Math.max(0,activeIndex)*HEIGHT;const size=Math.max(width,depth,draftRef.current.floors.length*HEIGHT);camera.position.set(size*.85,y+size*.75,size);controls.current?.target.set(0,y,0);controls.current?.update();invalidate();};
    bridge.current={reset,zoom:factor=>{if(!controls.current)return;camera.position.sub(controls.current.target).multiplyScalar(factor).add(controls.current.target);controls.current.update();invalidate();},drop:(clientX,clientY,kind)=>{const bounds=gl.domElement.getBoundingClientRect();const ray=new Raycaster();ray.setFromCamera(new Vector2((clientX-bounds.left)/bounds.width*2-1,-(clientY-bounds.top)/bounds.height*2+1),camera);const point=ray.ray.intersectPlane(new Plane(new Vector3(0,1,0),-Math.max(0,activeIndex)*HEIGHT),new Vector3());if(point)addRef.current(kind,point.x,point.z);}};
    reset();return()=>{bridge.current=null;};
    // Draft updates move objects without snapping the camera back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[revision,floor,camera,gl,invalidate]);
  useEffect(()=>{
    if(editing||!selected||!controls.current)return;
    const index=draftRef.current.floors.findIndex(f=>f.items.some(item=>item.id===selected));
    const item=draftRef.current.floors[index]?.items.find(item=>item.id===selected);
    if(!item)return;
    const target=new Vector3(item.x,index*HEIGHT+1,item.z);
    const direction=camera.position.clone().sub(controls.current.target).normalize();
    camera.position.copy(target).add(direction.multiplyScalar(Math.max(8,Math.min(20,Math.max(item.width,item.depth)*3))));
    controls.current.target.copy(target);controls.current.update();invalidate();
  },[selected,editing,camera,invalidate]);
  return <>
    <color attach="background" args={["#edf3ff"]}/><fog attach="fog" args={["#edf3ff",300,900]}/>
    <ambientLight intensity={1.4}/><hemisphereLight args={["#d7e7ff","#7391be",1.5]}/><directionalLight position={[25,45,20]} intensity={3} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-55} shadow-camera-right={55} shadow-camera-top={55} shadow-camera-bottom={-55}/>
    <gridHelper args={[220,110,"#b7cbe9","#dbe6f7"]} position={[0,-.3,0]}/>
    {draft.floors.map((level,index)=>{if(floor!=="all"&&floor!==level.id)return null;const width=level.width;const depth=level.depth;const y=index*HEIGHT;return <group key={level.id}>
      <mesh position={[0,y-.18,0]} receiveShadow onPointerOver={e=>{e.stopPropagation();setHoverFloor(level.id);}} onPointerOut={()=>setHoverFloor(null)} onClick={e=>{e.stopPropagation();if(!editing)onFloor(level.id);}}><boxGeometry args={[width,.3,depth]}/><meshStandardMaterial color={hoverFloor===level.id?"#d5e8ff":"#f8fbff"} roughness={.4} metalness={.15}/><Edges color={hoverFloor===level.id?"#1755ed":"#a9bfdf"}/></mesh>
      {texture&&floor!=="all"?<mesh position={[0,y+.005,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width,depth]}/><meshBasicMaterial map={texture} transparent opacity={.55} depthWrite={false}/></mesh>:null}
      {level.items.map(item=><ObjectMesh key={item.id} item={item} y={y} editing={editing&&floor!=="all"} selected={selected===item.id} onSelect={()=>onSelect(item.id)} onMove={(x,z)=>onMove(item.id,x,z)} onDrag={value=>{if(value)props.onGestureStart();setDragging(value);}}/>)}
      {hoverFloor===level.id&&!selected?<Html position={[-width/2,y+1,depth/2]} center style={{pointerEvents:"none"}}><div className="lp-world-label">{level.name}<small>{level.items.filter(i=>i.kind==="room").length} rooms · click to enter level</small></div></Html>:null}
    </group>;})}
    <OrbitControls ref={controls} makeDefault enabled={!dragging} minDistance={5} maxDistance={800} maxPolarAngle={Math.PI/2.05} enableDamping={false}/>
  </>;
}
export default function LayoutScene(props:SceneProps) {return <Canvas frameloop="demand" shadows dpr={[1,1.5]} camera={{position:[35,30,40],fov:42,near:.1,far:2000}} onPointerMissed={()=>props.onSelect(null)} gl={{antialias:true}} onCreated={({scene})=>{scene.background=new Color("#edf3ff");}}><World {...props}/></Canvas>;}
