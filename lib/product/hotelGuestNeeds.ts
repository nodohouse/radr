import type { HotelLiveRoom } from "@/lib/radr/product/hotelLive";
import type { GuestNeedsRecord } from "./guestSignals";
const incoming310:GuestNeedsRecord={booking:{reference:"STAY-310-TAN",party:"Michael Tan",provider:"PMS sample · not connected",receivedAt:"today 13:10"},occasions:["Birthday stay"],allergies:[{guest:"Michael Tan",allergen:"Shellfish",note:"Guest-reported in pre-arrival form. Breakfast and room service teams to reconfirm before serving."}],dietary:["Companion · vegetarian"],requests:["Feather-free bedding","Quiet room requested"],source:"Illustrative pre-arrival form · acknowledgement pending"};
/** Bind the fixture to its incoming stay, never just to a reusable physical room. */
export function hotelGuestNeeds(room:HotelLiveRoom):GuestNeedsRecord|undefined {
 return room.id==="room_310"&&room.guestName==="Michael Tan"&&room.arrivalAt==="15:20"&&room.state!=="occupied"?incoming310:undefined;
}
