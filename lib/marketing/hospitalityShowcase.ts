import { getServiceCommand } from "@/lib/product/serviceCommand";
import { tableExperiences } from "@/lib/product/serviceCommand/tableExperience";
import {
  hotelLivePropertyModel,
  roomStateLabel,
} from "@/lib/radr/product/hotelLive";
import { hotelGuestNeeds } from "@/lib/product/hotelGuestNeeds";
import type { GuestNeedsRecord } from "@/lib/product/guestSignals";
import { PUBLIC_HOTEL, PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";

export type HospitalityKind = "restaurant" | "hotel";
export type HospitalityObject = {
  id: string;
  label: string;
  state: string;
  party: string;
  meta: string;
  value: string;
  allergy: string | null;
  allergyState: "reported" | "none-reported" | "unknown";
  scope: "Current party" | "Incoming guest";
  occasion: string;
  request: string;
  orders: string;
  next: string;
  nextAllergy: string | null;
  nextNeeds: string;
  nextOccasion: string;
  timeline: { time: string; label: string }[];
  owner: string;
};
function allergy(record: GuestNeedsRecord | undefined) {
  return record?.allergies?.length
    ? record.allergies.map((a) => a.allergen).join(", ")
    : null;
}
function allergyState(
  record: GuestNeedsRecord | undefined,
): HospitalityObject["allergyState"] {
  return record?.allergies == null
    ? "unknown"
    : record.allergies.length
      ? "reported"
      : "none-reported";
}
const service = getServiceCommand();
export const HOTEL_SHOWCASE = hotelLivePropertyModel();
export const HOSPITALITY_LOCATIONS = {
  restaurant: PUBLIC_RESTAURANT.displayName,
  hotel: PUBLIC_HOTEL.displayName,
};
export const RESTAURANT_OBJECTS: HospitalityObject[] = [
  "t8",
  "t6",
  "t3",
  "t14",
].map((id) => {
  const t = service.tables.find((t) => t.id === id)!;
  const e = tableExperiences[id];
  const total = e?.orders.reduce((sum, o) => sum + o.quantity * o.unitPrice, 0);
  return {
    id,
    label: `Table ${t.n}`,
    state: t.stage || t.statusLabel,
    party:
      e?.guest.name || (t.party ? `${t.party} guests` : "Reservation hold"),
    meta: e
      ? `${t.party} guests · ${e.guest.returning ? `Returning · ${e.guest.visits} visits` : "First recorded visit"}`
      : `${t.seats} seats · Guest notes pending`,
    value:
      total !== undefined
        ? `$${total} ${e.orders.every((o) => o.status === "Paid") ? "paid" : "ordered"}`
        : "Not recorded",
    allergy: allergy(e?.needs),
    allergyState: allergyState(e?.needs),
    scope: "Current party",
    occasion: e?.needs.occasions?.join(" · ") || "",
    request: e?.needs.requests.join(" · ") || "Guest notes pending",
    orders:
      e?.orders.map((o) => `${o.quantity} × ${o.name}`).join(" · ") ||
      "Order details pending",
    next: e
      ? `${e.next.time} · ${e.next.party}`
      : t.nextBooking || "Next booking not recorded",
    nextAllergy: allergy(e?.next.needs),
    nextNeeds: e
      ? [
          allergy(e.next.needs)
            ? `${allergy(e.next.needs)} allergy`
            : e.next.needs.allergies === null
              ? "Allergies not confirmed"
              : "No allergies reported",
          ...(e.next.needs.occasions || []),
          ...e.next.needs.requests,
        ].join(" · ")
      : "Booking details pending",
    nextOccasion: e?.next.needs.occasions?.join(" · ") || "",
    timeline: e
      ? [
          { time: e.previous.time, label: "Previous party" },
          {
            time: e.events[e.events.length - 1]!.time,
            label: t.stage || "Current party",
          },
          { time: e.next.time, label: "Next reservation" },
        ]
      : [{ time: "19:48", label: t.stage || "Current status" }],
    owner: e?.turnover.owner || "Dining host",
  };
});
export const HOTEL_OBJECTS: HospitalityObject[] = [
  "room_310",
  "room_308",
  "room_306",
  "room_312",
].map((id) => {
  const room = HOTEL_SHOWCASE.rooms.find((r) => r.id === id)!;
  const needs = hotelGuestNeeds(room);
  return {
    id,
    label: `Room ${room.number}`,
    state: roomStateLabel(room.state),
    party: room.guestName || "No assigned arrival",
    meta: room.guestName
      ? `${room.type} · ${room.adults} guests · ${room.nights} nights`
      : `${room.type} · No guest assigned`,
    value: room.expectedReadyAt
      ? `Ready target ${room.expectedReadyAt}`
      : roomStateLabel(room.state),
    allergy: allergy(needs),
    allergyState: allergyState(needs),
    scope: "Incoming guest",
    occasion: needs?.occasions?.join(" · ") || "",
    request: needs?.requests.join(" · ") || "Guest notes pending",
    orders:
      room.dependencies
        .filter((d) => !d.done)
        .map((d) => d.label)
        .join(" · ") || "No open tasks recorded",
    next: room.arrivalAt
      ? `${room.arrivalAt} · Arrival`
      : "No arrival recorded",
    nextAllergy: null,
    nextNeeds: "",
    nextOccasion: "",
    timeline: [
      ...(room.cleaningStartedAt
        ? [
            {
              time: room.cleaningStartedAt,
              label:
                room.state === "cleaning"
                  ? "Cleaning started"
                  : "Housekeeping logged",
            },
          ]
        : []),
      ...(room.expectedReadyAt
        ? [{ time: room.expectedReadyAt, label: "Ready target" }]
        : []),
      ...(room.arrivalAt
        ? [{ time: room.arrivalAt, label: "Guest arrival" }]
        : []),
    ],
    owner: room.assigned || "Front desk",
  };
});
