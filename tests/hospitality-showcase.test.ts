import { describe, it, expect } from "vitest";
import {
  RESTAURANT_OBJECTS,
  HOTEL_OBJECTS,
} from "@/lib/marketing/hospitalityShowcase";
describe("marketing Live keeps guest context bound to its booking", () => {
  it("distinguishes the current sesame allergy from the next peanut allergy and birthday", () => {
    const table = RESTAURANT_OBJECTS.find((o) => o.id === "t8")!;
    expect(table.party).toBe("Morgan party");
    expect(table.allergy).toBe("Sesame");
    expect(table.occasion).toBe("Anniversary");
    expect(table.nextAllergy).toBe("Peanuts");
    expect(table.nextNeeds).toContain("Birthday");
    expect(table.nextNeeds).toContain("Step-free");
    expect(table.value).toBe("$236 ordered");
  });
  it("never treats unconfirmed next-booking allergies as a clean guest record", () => {
    const table = RESTAURANT_OBJECTS.find((o) => o.id === "t6")!;
    expect(table.allergyState).toBe("none-reported");
    expect(table.nextNeeds).toContain("Allergies not confirmed");
    expect(table.nextNeeds).toContain("High chair");
    expect(table.value).toBe("$262 paid");
  });
  it("attaches hotel needs to the incoming Tan stay without leaking them to another room", () => {
    const room = HOTEL_OBJECTS.find((o) => o.id === "room_310")!;
    expect(room.party).toBe("Michael Tan");
    expect(room.scope).toBe("Incoming guest");
    expect(room.allergy).toBe("Shellfish");
    expect(room.request).toContain("Feather-free");
    expect(room.next).toContain("15:20");
    const other = HOTEL_OBJECTS.find((o) => o.id === "room_308")!;
    expect(other.allergy).toBeNull();
    expect(other.allergyState).toBe("unknown");
    expect(other.request).toBe("Guest notes pending");
  });
});
