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
      tone: "cost",
      color: "#ffd58c",
      caption: "EXPOSED TONIGHT",
      amount: "$184",
      title: "$184 exposed tonight",
      source: "Supplier costs",
      detail: "Price variance · needs review",
      x: 12,
      mobileX: 12,
      catchY: 448,
      captureAt: 10,
      anchor: "start",
    },
    {
      id: "allergy",
      tone: "guest",
      color: "#ffb5a4",
      caption: "INCOMING GUEST",
      amount: arrival.allergy || "Guest note",
      title: `${arrival.allergy} allergy`,
      source: "Hotel",
      detail: `${arrival.label} · Arrival ${arrival.next.split(" · ")[0]}`,
      x: 0,
      mobileX: 250,
      catchY: 492,
      captureAt: 1,
      anchor: "start",
    },
    {
      id: "reservation",
      tone: "booking",
      color: "#8be7ff",
      caption: "NEXT RESERVATION",
      amount: table.next.split(" · ")[0],
      title: `Next table at ${table.next.split(" · ")[0]}`,
      source: "Restaurant",
      detail: `${table.label} · ${table.nextAllergy} allergy`,
      x: 1172,
      mobileX: 470,
      catchY: 520,
      captureAt: 7,
      anchor: "end",
    },
    {
      id: "service",
      tone: "pressure",
      color: "#ffc991",
      caption: "EXPOSED TONIGHT",
      amount: "$620",
      title: "$620 exposed tonight",
      source: "Service pressure",
      detail: "Demand ahead of kitchen capacity",
      x: 1199,
      mobileX: 740,
      catchY: 438,
      captureAt: 4,
      anchor: "end",
    },
    {
      id: "readiness",
      tone: "readiness",
      color: "#afd5ff",
      caption: "READY TARGET",
      amount: arrival.value.replace("Ready target ", ""),
      title: arrival.value,
      source: "Room readiness",
      detail: `${arrival.label} · Arrival ${arrival.next.split(" · ")[0]}`,
      x: 28,
      mobileX: 950,
      catchY: 474,
      captureAt: 13,
      anchor: "start",
    },
    {
      id: "channel",
      tone: "channel",
      color: "#9fe8e5",
      caption: "EXPOSED TONIGHT",
      amount: "$420",
      title: "$420 exposed tonight",
      source: "Channel contribution",
      detail: "Delivery economics · needs review",
      x: 1186,
      mobileX: 1188,
      catchY: 510,
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
