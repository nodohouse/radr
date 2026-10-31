import type { HotelLiveRoom } from "@/lib/radr/product/hotelLive";
import { GuestNeeds } from "../guest-context/GuestNeeds";

import { hotelGuestNeeds } from "@/lib/product/hotelGuestNeeds";

export function RoomGuestBrief({room,history=false}:{room:HotelLiveRoom;history?:boolean}) {
 const needs=hotelGuestNeeds(room);
 const example=!!needs;
 const incoming=room.state!=="occupied"&&!!room.arrivalAt;
 return <section className="room-guest-brief" data-testid="room-guest-brief">
  <span className="rp-preview-eyebrow">Illustrative guest & stay context</span><div className="room-guest-headline"><strong>{incoming?`Next arrival ${room.arrivalAt} · ${room.guestName||"Guest name unavailable"}`:room.state==="occupied"?"Current stay · details not linked":"No next reservation linked"}</strong><span>{example?"Shellfish allergy · Birthday stay · feather-free bedding requested":"Allergies and preferences not recorded"}</span></div>
  {history?<div className="rp-table-slot"><span>Previous stay</span><strong>{example?"Previous party · 2 adults":"Previous stay unavailable"}</strong><small>{example?"Checked out today 11:00 · room released for housekeeping":"No linked departure record"}</small></div>:null}
  <div className="rp-table-slot"><span>Current room status</span><strong>{room.state==="occupied"?"In-house stay":room.state==="ready"?"Ready for arrival":room.state==="ooo"?"Out of order":"Between stays · preparation required"}</strong><small>{room.state==="occupied"?"Current guest and departure details are not linked in this snapshot.":room.expectedReadyAt?`Expected ready ${room.expectedReadyAt} · estimate, not confirmed`:"No readiness estimate recorded"}</small></div>
  <div className="rp-next-arrival" aria-label="Next hotel reservation"><span className="rp-preview-eyebrow">Next reservation</span><strong>{incoming?`${room.arrivalAt} today · ${room.guestName||"Guest name unavailable"}`:"Next reservation unavailable"}</strong><p>{incoming?`${room.adults} adults · ${room.nights} nights · expected arrival, not checked in`:"No incoming stay linked to this room."}</p>{example?<><small>STAY-310-TAN · Confirmed · returning guest, 4th stay</small><p>Check-out after 3 nights · 11:00</p></>:null}{incoming?<div className="rp-turnover"><strong>{room.state==="ready"?"Room marked ready":"Room not ready for handover"}</strong><small>{room.expectedReadyAt?`Expected ready ${room.expectedReadyAt} · arrival ${room.arrivalAt}`:"Confirm readiness before assigning the room"}</small><small>{room.assigned?`Housekeeping owner · ${room.assigned}`:"Housekeeping owner not assigned"}</small></div>:null}</div>
  <GuestNeeds record={needs} title={incoming?"Incoming guest needs":"Current guest needs"}/>
  {example?<div className="rp-table-slot"><span>Preparation handoff</span><strong>Guest services · acknowledgement pending</strong><small>Confirm feather-free setup with housekeeping and reported food allergy with F&B. No task has been sent to an external system.</small></div>:null}
  {history&&example?<ol className="room-stay-timeline"><li><time>11:00</time><span>Previous guests checked out</span></li><li><time>13:10</time><span>Incoming guest needs received</span></li><li><time>14:58</time><span>Estimated room readiness · inspection still required</span></li><li><time>15:20</time><span>Next arrival scheduled · not checked in</span></li></ol>:null}
  <p className="guest-needs-source">Demo snapshot · not a connected PMS or guest-profile feed</p>
 </section>;
}
