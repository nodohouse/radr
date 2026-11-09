/** Geometry only. A generated room never inherits an operational record. */
export type HotelBuildingSpec = {
  version: 1;
  name: string;
  floors: number;
  rooms: number;
};
export type BuildingFloor = { number: number; rooms: number };
export const DEFAULT_HOTEL_BUILDING: HotelBuildingSpec = {
  version: 1,
  name: "Mercer House",
  floors: 8,
  rooms: 200,
};
export function validateHotelBuilding(
  input: unknown,
): HotelBuildingSpec | null {
  if (!input || typeof input !== "object") return null;
  const spec = input as Partial<HotelBuildingSpec>;
  if (
    spec.version !== 1 ||
    typeof spec.name !== "string" ||
    !spec.name.trim() ||
    spec.name.trim().length > 60 ||
    !Number.isInteger(spec.floors) ||
    !Number.isInteger(spec.rooms) ||
    spec.floors! < 1 ||
    spec.floors! > 24 ||
    spec.rooms! < spec.floors! ||
    spec.rooms! > 960 ||
    spec.rooms! > spec.floors! * 60
  )
    return null;
  return {
    version: 1,
    name: spec.name.trim(),
    floors: spec.floors!,
    rooms: spec.rooms!,
  };
}
export function buildingFloors(spec: HotelBuildingSpec): BuildingFloor[] {
  if (!validateHotelBuilding(spec)) return [];
  const base = Math.floor(spec.rooms / spec.floors);
  const remainder = spec.rooms % spec.floors;
  return Array.from({ length: spec.floors }, (_, i) => ({
    number: i + 1,
    rooms: base + (i < remainder ? 1 : 0),
  }));
}
export function buildingRoomNumbers(floor: BuildingFloor): string[] {
  return Array.from(
    { length: floor.rooms },
    (_, i) => `${floor.number}-${String(i + 1).padStart(2, "0")}`,
  );
}
