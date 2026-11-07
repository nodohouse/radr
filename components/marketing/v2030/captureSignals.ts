import {
  HOTEL_OBJECTS,
  RESTAURANT_OBJECTS,
} from "@/lib/marketing/hospitalityShowcase";

const arrival = HOTEL_OBJECTS.find((room) => room.id === "room_310")!;
const table = RESTAURANT_OBJECTS.find((room) => room.id === "t8")!;

// A shared score for the falling signal and its corresponding glass insight.
// Amounts are illustrative exposure, never recovered or verified savings.
const PERIOD = 18;
export const CAPTURE_SIGNALS = (
  [
    {
      id: "supplier",
      amount: "$184",
      title: "$184 exposed tonight",
      source: "Supplier costs",
      detail: "Price variance · needs review",
      x: 12,
      catchY: 448,
      captureAt: 10,
      anchor: "start",
    },
    {
      id: "allergy",
      amount: "Guest note",
      title: `${arrival.allergy} allergy`,
      source: "Hotel",
      detail: `${arrival.label} · Arrival ${arrival.next.split(" · ")[0]}`,
      x: 250,
      catchY: 492,
      captureAt: 1,
      anchor: "middle",
    },
    {
      id: "reservation",
      amount: table.next.split(" · ")[0],
      title: `Next table at ${table.next.split(" · ")[0]}`,
      source: "Restaurant",
      detail: `${table.label} · ${table.nextAllergy} allergy`,
      x: 470,
      catchY: 520,
      captureAt: 7,
      anchor: "middle",
    },
    {
      id: "service",
      amount: "$620",
      title: "$620 exposed tonight",
      source: "Service pressure",
      detail: "Demand ahead of kitchen capacity",
      x: 740,
      catchY: 510,
      captureAt: 4,
      anchor: "middle",
    },
    {
      id: "readiness",
      amount: arrival.value.replace("Ready target ", ""),
      title: arrival.value,
      source: "Room readiness",
      detail: `${arrival.label} · Arrival ${arrival.next.split(" · ")[0]}`,
      x: 950,
      catchY: 474,
      captureAt: 13,
      anchor: "middle",
    },
    {
      id: "channel",
      amount: "$420",
      title: "$420 exposed tonight",
      source: "Channel contribution",
      detail: "Delivery economics · needs review",
      x: 1188,
      catchY: 438,
      captureAt: 16,
      anchor: "end",
    },
  ] as const
).map((signal) => ({
  ...signal,
  duration: PERIOD,
  delay: signal.captureAt - PERIOD * 0.64,
}));

export type CapturedSignal = { index: number; cycle: number };
