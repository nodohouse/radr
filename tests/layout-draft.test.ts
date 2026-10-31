import { describe, expect, it } from "vitest";
import { generateHotel, importLayoutCsv, validateLayout } from "../lib/radr/live/layoutDraft";

describe("spatial layout drafts",()=>{
  it("distributes an uneven room count without losing or inventing rooms",()=>{
    const draft=generateHotel(3,10);
    expect(draft.floors.map(f=>f.items.length)).toEqual([4,3,3]);
    expect(new Set(draft.floors.flatMap(f=>f.items.map(i=>i.id))).size).toBe(10);
    expect(validateLayout(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
  });
  it.each([[0,10],[2,1],[1,61],[21,100],[2.5,10],[20,501]])("rejects unsupported building dimensions %s/%s",(levels,rooms)=>{
    expect(()=>generateHotel(levels,rooms)).toThrow();
  });
  it("imports quoted labels and preserves authored positions and level order",()=>{
    const draft=importLayoutCsv('floor,kind,label,x,z,width,depth\nLevel 2,room,"Room, west",-4,2,3,5\nLevel 3,shelf,Linen,4,-2,2,.6',"hotel");
    expect(draft.floors.map(f=>f.name)).toEqual(["Level 2","Level 3"]);
    expect(draft.floors[0].items[0]).toMatchObject({label:"Room, west",x:-4,z:2,width:3,depth:5});
  });
  it.each([
    'floor,kind,label,x,z,width,depth\nA,room,Missing,,0,3,5',
    'floor,kind,label,x,z,width,depth\nA,room,Bad,Infinity,0,3,5',
    'floor,kind,label,x,z,width,depth\nA,script,Bad,0,0,3,5',
    'floor,kind,label,x,z,width,depth\nA,room,"Broken,0,0,3,5',
    'floor,label,x,z,width,depth\nA,Missing kind,0,0,3,5',
  ])("rejects malformed or unsafe CSV instead of silently generating geometry",csv=>{
    expect(()=>importLayoutCsv(csv,"hotel")).toThrow();
  });
  it("rejects duplicate IDs, excessive counts and invalid dimensions",()=>{
    const draft=generateHotel(2,4);
    draft.floors[1].items[0].id=draft.floors[0].items[0].id;
    expect(()=>validateLayout(draft)).toThrow(/unique/);
    const other=generateHotel(1,2);other.floors[0].items[0].width=-1;
    expect(()=>validateLayout(other)).toThrow(/Width/);
    const tooMany=generateHotel(10,500);tooMany.floors[0].items.push({...tooMany.floors[0].items[0],id:"extra"});
    expect(()=>validateLayout(tooMany)).toThrow(/500/);
  });
  it("keeps the measured footprint stable when an object moves",()=>{
    const draft=generateHotel(1,2);const width=draft.floors[0].width;
    draft.floors[0].items[0].x=40;
    expect(validateLayout(JSON.parse(JSON.stringify(draft))).floors[0].width).toBe(width);
  });
  it("does not import operational inventory or execution state as geometry",()=>{
    const draft=generateHotel(1,2);
    const result=validateLayout({...draft,inventory:{sugar:400},approved:true});
    expect(result).not.toHaveProperty("inventory");expect(result).not.toHaveProperty("approved");
  });
});
