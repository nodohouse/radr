/**
 * Berlin Mitte - forward operating horizon (demo fixture).
 * Demo as-of ~19 Aug 2026 Thursday → tomorrow Fri, week ahead, 4-week HUGE.
 * Notes are short causal whys - why this night matters.
 */

import type { OperatingHorizon } from "./types";

export function composeBerlinOperatingHorizon(): OperatingHorizon {
  return {
    tomorrow: {
      id: "hz_tomorrow",
      label: "Tomorrow",
      when: "Fri 21 Aug · dinner",
      covers: 168,
      outlook: "Busy",
      note: "Arena concert nearby lifts walk-ins and terrace demand",
      scale: "BIG",
    },
    week: [
      {
        id: "hz_sat",
        day: "Sat",
        label: "Peak weekend",
        note: "Biggest covers of the week with private dining stacked on top",
        scale: "BIG",
      },
      {
        id: "hz_sun",
        day: "Sun",
        label: "Soft close",
        note: "Brunch lifts lunch; dinner stays lighter than Saturday",
        scale: "NORMAL",
      },
      {
        id: "hz_wed",
        day: "Wed",
        label: "Trade dinner",
        note: "Buyout enquiry would lock 40 covers if confirmed",
        scale: "BIG",
      },
    ],
    leads: [
      {
        id: "hz_fair",
        weeksOut: 3,
        title: "International hospitality fair",
        when: "11-14 Sep · Messe",
        scale: "HUGE",
        why: "Fair weeks historically add 35-55 covers; groups already booking",
        prepare: "Lock staffing and private rooms; hold terrace capacity",
      },
      {
        id: "hz_marathon",
        weeksOut: 4,
        title: "City marathon weekend",
        when: "20-21 Sep",
        scale: "BIG",
        why: "Street closures cut lunch; dinner recovers late",
        prepare: "Shift lunch FOH (Front of House); extend dinner kitchen window",
      },
    ],
    headline: "Tomorrow busy · fair in 3 weeks",
  };
}
