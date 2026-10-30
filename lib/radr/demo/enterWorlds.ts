/**
 * RADR demo gateway — operating world framing.
 * Cities / counts derive from DemoEstateRegistry (product SSOT).
 */

import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  estateCityLine,
  estateCount,
  estateForVertical,
} from "@/lib/radr/demo/estateRegistry";

export type EnterModuleChip = {
  id: string;
  label: string;
};

export type EnterKpi = {
  label: string;
  value: string;
  delta: string;
};

export type EnterWorld = {
  id: DemoVerticalFamily;
  eyebrow: string;
  title: string;
  meta: string;
  description: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  modules: EnterModuleChip[];
  cities: string[];
  citiesExtra: number;
  performanceTitle: string;
  kpis: EnterKpi[];
  chartKind: "line" | "bars";
};

function worldMeta(
  vertical: DemoVerticalFamily,
  noun: "locations" | "properties",
): { cities: string[]; citiesExtra: number; meta: string } {
  const { cities, extra } = estateCityLine(vertical, 6);
  const n = estateCount(vertical);
  return {
    cities,
    citiesExtra: extra,
    meta: `Global ${vertical === "hotel" ? "hotel" : "restaurant"} group · ${n} ${noun}`,
  };
}

const restaurantMeta = worldMeta("restaurant", "locations");
const hotelMeta = worldMeta("hotel", "properties");

export const ENTER_WORLDS: Record<DemoVerticalFamily, EnterWorld> = {
  restaurant: {
    id: "restaurant",
    eyebrow: "Restaurants",
    title: "Restaurants",
    meta: restaurantMeta.meta,
    description:
      "From service to inventory, see how RADR helps restaurant teams make better decisions, faster.",
    cta: "Enter Restaurant World →",
    imageSrc: "/demo/facilities/radr-restaurant-atmosphere.jpg",
    imageAlt: "Premium restaurant dining atmosphere at dusk",
    modules: [
      { id: "service", label: "Service" },
      { id: "kitchen", label: "Kitchen" },
      { id: "guests", label: "Guests" },
      { id: "labor", label: "Labor" },
      { id: "inventory", label: "Inventory" },
      { id: "decisions", label: "Decisions" },
    ],
    cities: restaurantMeta.cities,
    citiesExtra: restaurantMeta.citiesExtra,
    performanceTitle: "Restaurant Performance",
    kpis: [
      { label: "Revenue", value: "$284K", delta: "+12%" },
      { label: "Guests", value: "3.2K", delta: "+18%" },
      { label: "Table Turnover", value: "2.4x", delta: "+9%" },
    ],
    chartKind: "line",
  },
  hotel: {
    id: "hotel",
    eyebrow: "Hotels",
    title: "Hotels",
    meta: hotelMeta.meta,
    description:
      "From rooms to revenue, see how RADR helps hotels operate more efficiently and profitably.",
    cta: "Enter Hotel World →",
    imageSrc: "/demo/facilities/canal-deluxe-king.jpg",
    imageAlt: "Luxury hotel room with refined interiors",
    modules: [
      { id: "rooms", label: "Rooms" },
      { id: "revenue", label: "Revenue" },
      { id: "hk", label: "Housekeeping" },
      { id: "guests", label: "Guests" },
      { id: "distribution", label: "Distribution" },
      { id: "decisions", label: "Decisions" },
    ],
    cities: hotelMeta.cities,
    citiesExtra: hotelMeta.citiesExtra,
    performanceTitle: "Hotel Performance",
    kpis: [
      { label: "Occupancy", value: "78%", delta: "+6%" },
      { label: "ADR", value: "$312", delta: "+11%" },
      { label: "RevPAR", value: "$243", delta: "+14%" },
    ],
    chartKind: "bars",
  },
};

/** Pins for gateway atmosphere — derived from estate coordinates (normalized). */
export const ENTER_MAP_CITIES: { id: string; label: string; x: number; y: number }[] =
  [
    { id: "nyc", label: "New York", x: 22, y: 35 },
    { id: "lax", label: "Los Angeles", x: 8, y: 55 },
    { id: "lon", label: "London", x: 40, y: 42 },
    { id: "dxb", label: "Dubai", x: 55, y: 58 },
    { id: "sin", label: "Singapore", x: 68, y: 48 },
    { id: "tyo", label: "Tokyo", x: 82, y: 32 },
    { id: "syd", label: "Sydney", x: 92, y: 62 },
  ];

export function parseEnterVertical(
  raw: string | null,
): DemoVerticalFamily | null {
  if (raw === "restaurant" || raw === "restaurants") return "restaurant";
  if (raw === "hotel" || raw === "hotels") return "hotel";
  return null;
}

/** Featured venue chips for gateway (optional). */
export function estateFeaturedNames(vertical: DemoVerticalFamily): string[] {
  return estateForVertical(vertical)
    .slice(0, 5)
    .map((e) => e.displayName);
}
