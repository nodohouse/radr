/** Geometry drafts are independent of operational inventory and Decision records. */
export const LAYOUT_KINDS = ["table2", "table4", "bar", "shelf", "wall", "room"] as const;
export type LayoutKind = typeof LAYOUT_KINDS[number];
export type LayoutItem = { id: string; kind: LayoutKind; label: string; x: number; z: number; width: number; depth: number; sourceId?: string };
export type LayoutFloor = { id: string; name: string; width:number; depth:number; items: LayoutItem[] };
export type LayoutDraft = { version: 1; vertical: "restaurant" | "hotel"; name: string; floors: LayoutFloor[] };
export const KIND_SIZE: Record<LayoutKind, [number, number]> = { table2:[1,1], table4:[1.6,1],bar:[4,1.2],shelf:[2,.6],wall:[4,.25],room:[3,5] };
const fail = (message: string): never => { throw new Error(message); };
function number(value: unknown, min: number, max: number, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) fail(`${label} must be between ${min} and ${max}.`);
  return value as number;
}
function label(value: unknown, fallback: string) {return typeof value === "string" && value.trim() ? value.trim().slice(0,100) : fallback;}
export function validateLayout(input: unknown): LayoutDraft {
  if (!input || typeof input !== "object") return fail("Upload a layout object.");
  const raw = input as Record<string,unknown>;
  if (raw.version !== 1) return fail("Layout version must be 1.");
  if (raw.vertical !== "hotel" && raw.vertical !== "restaurant") return fail("Choose hotel or restaurant as the layout vertical.");
  if (!Array.isArray(raw.floors) || !raw.floors.length || raw.floors.length > 20) return fail("A layout needs 1 to 20 levels.");
  const ids = new Set<string>();let count=0;
  const floors = raw.floors.map((value,index) => {
    if (!value || typeof value !== "object") return fail("Every level must be an object.");
    const floor=value as Record<string,unknown>;
    if (!Array.isArray(floor.items)) return fail("Every level needs an items array.");
    const id=label(floor.id,`floor-${index+1}`);
    if(ids.has(id))return fail("Level and object IDs must be unique.");ids.add(id);
    const items=floor.items.map((value,itemIndex):LayoutItem => {
      if (++count>500) return fail("Keep the layout to 500 objects or fewer.");
      if (!value || typeof value!=="object") return fail("Every object must have a kind and coordinates.");
      const item=value as Record<string,unknown>;
      if (!LAYOUT_KINDS.includes(item.kind as LayoutKind)) return fail("Unknown object kind. Use table2, table4, bar, shelf, wall or room.");
      const itemId=label(item.id,`${id}-item-${itemIndex+1}`);
      if(ids.has(itemId))return fail("Level and object IDs must be unique.");ids.add(itemId);
      return {id:itemId,kind:item.kind as LayoutKind,label:label(item.label,`Object ${itemIndex+1}`),x:number(item.x,-150,150,"X"),z:number(item.z,-150,150,"Z"),width:number(item.width,.15,50,"Width"),depth:number(item.depth,.15,50,"Depth")};
    });
    return {id,name:label(floor.name,`Level ${index+1}`),width:number(floor.width??Math.max(24,...items.map(item=>Math.abs(item.x)*2+item.width+3)),4,400,"Level width"),depth:number(floor.depth??Math.max(16,...items.map(item=>Math.abs(item.z)*2+item.depth+3)),4,400,"Level depth"),items};
  });
  return {version:1,vertical:raw.vertical,name:label(raw.name,"My layout"),floors};
}
export function generateHotel(levels: number, rooms: number): LayoutDraft {
  number(levels,1,20,"Levels");number(rooms,1,500,"Rooms");
  if(!Number.isInteger(levels)||!Number.isInteger(rooms)||rooms<levels||Math.ceil(rooms/levels)>60) return fail("Use whole numbers, at least one room per level and no more than 60 rooms per level.");
  let room=0;
  return {version:1,vertical:"hotel",name:"My hotel",floors:Array.from({length:levels},(_,level)=>{
    const count=Math.floor(rooms/levels)+(level<rooms%levels?1:0), columns=Math.ceil(count/2);
    return {id:`floor-${level+1}`,name:`Level ${level+1}`,width:Math.max(24,columns*3.3+3),depth:16,items:Array.from({length:count},(_,index)=>{
      room++;return {id:`room-${room}`,kind:"room" as const,label:`Room ${(level+1)*100+index+1}`,x:((index%columns)-(columns-1)/2)*3.3,z:index<columns?-4:4,width:3,depth:5};
    })};
  })};
}
/** Deliberately simple CSV: quoted labels are accepted; embedded line breaks are not. */
export function importLayoutCsv(text: string, vertical: LayoutDraft["vertical"]): LayoutDraft {
  const lines=text.replace(/^\uFEFF/,"").trim().split(/\r?\n/);
  const split=(line:string)=>{const out:string[]=[];let cell="",quote=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quote&&line[i+1]==='"'){cell+='"';i++;}else quote=!quote;}else if(c===','&&!quote){out.push(cell.trim());cell="";}else cell+=c;}if(quote)fail("CSV contains an unclosed quoted field.");out.push(cell.trim());return out;};
  const headers=split(lines[0]||"").map(h=>h.toLowerCase());
  for(const required of ["floor","kind","label","x","z","width","depth"])if(!headers.includes(required))return fail(`CSV needs a ${required} column.`);
  const floors=new Map<string,{id:string;name:string;items:unknown[]}>();
  lines.slice(1).filter(line=>line.trim()).forEach((line,index)=>{const cells=split(line);if(cells.length!==headers.length)fail(`CSV row ${index+2} has the wrong number of columns.`);const row=Object.fromEntries(headers.map((h,i)=>[h,cells[i]]));const name=row.floor||"Level 1";if(!floors.has(name))floors.set(name,{id:`floor-${floors.size+1}`,name,items:[]});const numeric=(key:string)=>row[key]?.trim()?Number(row[key]):NaN;floors.get(name)!.items.push({id:`import-${index+1}`,kind:row.kind,label:row.label,x:numeric("x"),z:numeric("z"),width:numeric("width"),depth:numeric("depth")});});
  return validateLayout({version:1,vertical,name:"Imported layout",floors:[...floors.values()]});
}
