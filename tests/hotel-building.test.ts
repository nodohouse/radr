import { describe, expect, it } from "vitest";
import {
  buildingFloors,
  buildingRoomNumbers,
  validateHotelBuilding,
  DEFAULT_HOTEL_BUILDING,
} from "../lib/product/hotelBuilding";

describe("hotel building geometry", () => {
  it("allocates uneven room counts exactly with stable unique room IDs", () => {
    const spec = validateHotelBuilding({
      version: 1,
      name: "  Ocean House  ",
      floors: 7,
      rooms: 103,
    })!;
    expect(spec.name).toBe("Ocean House");
    const floors = buildingFloors(spec);
    expect(floors).toHaveLength(7);
    expect(floors.reduce((sum, floor) => sum + floor.rooms, 0)).toBe(103);
    expect(
      Math.max(...floors.map((f) => f.rooms)) -
        Math.min(...floors.map((f) => f.rooms)),
    ).toBe(1);
    const rooms = floors.flatMap(buildingRoomNumbers);
    expect(new Set(rooms).size).toBe(103);
    expect(rooms).toContain("7-14");
    expect(floors[0]).not.toHaveProperty("state");
    expect(floors[0]).not.toHaveProperty("guestName");
  });
  it.each([
    null,
    {},
    { ...DEFAULT_HOTEL_BUILDING, version: 2 },
    { ...DEFAULT_HOTEL_BUILDING, name: " " },
    { ...DEFAULT_HOTEL_BUILDING, name: "X".repeat(61) },
    { ...DEFAULT_HOTEL_BUILDING, floors: 0 },
    { ...DEFAULT_HOTEL_BUILDING, floors: 25 },
    { ...DEFAULT_HOTEL_BUILDING, floors: 2.5 },
    { ...DEFAULT_HOTEL_BUILDING, rooms: 1 },
    { ...DEFAULT_HOTEL_BUILDING, rooms: 961 },
    { ...DEFAULT_HOTEL_BUILDING, rooms: 200.1 },
    { ...DEFAULT_HOTEL_BUILDING, floors: 1, rooms: 61 },
    { ...DEFAULT_HOTEL_BUILDING, floors: "8" },
  ])("rejects invalid or stale specifications %#", (input) =>
    expect(validateHotelBuilding(input)).toBeNull(),
  );
  it("supports smallest and largest properties without room-ID collisions", () => {
    for (const spec of [
      { version: 1 as const, name: "One", floors: 1, rooms: 1 },
      { version: 1 as const, name: "Tower", floors: 24, rooms: 960 },
    ]) {
      const rooms = buildingFloors(spec).flatMap(buildingRoomNumbers);
      expect(rooms).toHaveLength(spec.rooms);
      expect(new Set(rooms).size).toBe(spec.rooms);
    }
  });
});
