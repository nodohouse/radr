import { describe, expect, it } from "vitest";
import {
  canalHouseAttention,
  canalHouseArrivals,
  canalHouseInHouse,
  canalHouseOvernight,
  canalHousePerishableInventory,
  canalHouseRooms,
  canalHouseTonight,
  canalHouseYesterday,
  formatHotelRecoveryOpened,
} from "@/lib/radr/demo/canalHouseAmsterdam";

describe("Canal House Amsterdam hotel DEMO", () => {
  it("tonight pulse has attention load, not vanity backlog", () => {
    const t = canalHouseTonight();
    expect(t.needsYou).toBe(2);
    expect(t.radrHandling).toBeGreaterThan(0);
    expect(t.inHouseGuests).toBeGreaterThan(0);
    expect(t.stayovers).toBeGreaterThan(0);
  });

  it("start-of-day brief includes overnight continuity", () => {
    expect(canalHouseOvernight().length).toBeGreaterThanOrEqual(2);
    expect(canalHouseInHouse().some((g) => g.flags.includes("Anniversary"))).toBe(
      true,
    );
    expect(canalHouseYesterday().guestMessagesHandled).toBeGreaterThan(0);
  });

  it("attention items carry WHAT RADR ALREADY DID", () => {
    const items = canalHouseAttention();
    expect(items.length).toBe(2);
    expect(items.every((i) => i.radrDid)).toBe(true);
    expect(items.some((i) => i.territory === "RECOVER")).toBe(true);
    expect(items.some((i) => i.territory === "LABOR")).toBe(true);
  });

  it("rooms board includes delayed readiness and recovery inventory", () => {
    const rooms = canalHouseRooms();
    expect(rooms.some((r) => r.status === "delayed")).toBe(true);
    expect(rooms.some((r) => r.number === "118")).toBe(true);
    expect(canalHouseArrivals().length).toBeGreaterThanOrEqual(3);
  });

  it("recovery copy uses room night language", () => {
    const line = formatHotelRecoveryOpened({
      roomType: "Deluxe King",
      nights: 1,
      euro: 420,
    });
    expect(line).toContain("Room night opened");
    expect(line).toContain("Deluxe King");
    const inv = canalHousePerishableInventory();
    expect(inv[0]?.inventoryType).toBe("room_night");
  });
});
