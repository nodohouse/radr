/**
 * Zero world leakage — restaurant lexicon must not appear in hotel surfaces
 * and hotel lexicon must not appear in restaurant CC situation.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";

const ROOT = join(process.cwd());

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

const RESTAURANT_LEAK = [
  /\bkitchen\b/i,
  /\bcovers?\b/i,
  /\btables?\b/i,
  /\bDelivery %\b/i,
  /\bcold station\b/i,
  /Revenue is ahead\.\s*Contribution/i,
];

const HOTEL_LEAK = [
  /\bRevPAR\b/,
  /\bADR\b/,
  /\brooms? ready\b/i,
  /\bhousekeeping\b/i,
  /\bOTA\b/,
];

describe("world leakage — hotel native situation", () => {
  it("hotel hero is occupancy/room contribution, not restaurant F&B line", () => {
    const live = canalHouseLive();
    expect(live.heroLine).toMatch(/OCCUPANCY|PICKUP|READINESS|ROOM CONTRIBUTION/i);
    expect(live.heroLine).not.toMatch(/Revenue is ahead/i);
    expect(live.heroSub).toMatch(/ready|risk|Floor|RevPAR|Occ/i);
  });

  it("HotelCockpit source does not hardcode restaurant situation", () => {
    const src = read("components/product/control-center/HotelCockpit.tsx");
    for (const re of [
      /Revenue is ahead/,
      /Contribution isn’t/,
      /Contribution isn't/,
      /Tuna Tataki/,
      /Walk-ins/,
    ]) {
      expect(src).not.toMatch(re);
    }
    expect(src).toMatch(/Occupancy|ADR|RevPAR|Ready|at risk/i);
    expect(src).toMatch(/OPERATING PULSE/);
  });

  it("HotelLiveSurface does not pass F&B reservation framing", () => {
    const src = read("components/product/live/HotelLiveSurface.tsx");
    expect(src).toMatch(/vertical=\"hotel\"/);
  });

  it("restaurant CcCockpit does not hardcode hotel room metrics in situation", () => {
    const src = read("components/product/control-center/CcCockpit.tsx");
    // Flagship restaurant situation stays F&B
    expect(src).toMatch(/Revenue is ahead/);
    for (const re of [/RevPAR/, /rooms ready/i, /housekeeping/i]) {
      expect(src).not.toMatch(re);
    }
  });
});

describe("world leakage — cream palette banned in product design system", () => {
  it("product-design-system and northstar do not invent cream canvas", () => {
    const pds = read("app/product-design-system.css");
    const ns = read("app/control-center-northstar.css");
    expect(pds).not.toMatch(/#f4f1ea|#fffcf7|#fbfaf6/);
    // northstar may mention cream only in comments / as banned
    expect(ns).toMatch(/--color-canvas/);
    expect(ns).not.toMatch(/--rp-ns-ivory:\s*#f4f1ea/);
  });
});

describe("world leakage — lexicon guards (source files)", () => {
  it("restaurant leak patterns absent from hotel cockpit CSS module names", () => {
    const src = read("components/product/control-center/hotel-cockpit.css");
    for (const re of RESTAURANT_LEAK.slice(0, 3)) {
      // CSS may mention nothing; ensure no kitchen/covers/tables class names
      expect(src).not.toMatch(/kitchen|covers|tables/i);
    }
  });

  it("hotel metric vocabulary present in hotel cockpit", () => {
    const src = read("components/product/control-center/HotelCockpit.tsx");
    expect(HOTEL_LEAK.some((re) => re.test(src))).toBe(true);
  });
});
