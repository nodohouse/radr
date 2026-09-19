/**
 * Berlin Mitte week roster — who owns each section by day.
 * Demo week anchored on Mon 14 Sep 2026 (operating “tonight”).
 */

import type {
  FloorPlan,
  FloorServer,
  KitchenStation,
} from "@/lib/radr/floorModel";

/** Operating “tonight” in the Berlin demo. */
export const BERLIN_DEMO_TONIGHT = "2026-09-14";

export type BerlinDayRoster = {
  dateIso: string;
  weekday: string;
  dateLabel: string;
  mealLine: string;
  /** Short note under coverage, e.g. “Nora covers Marco’s side”. */
  note: string | null;
  serversBySection: Record<string, FloorServer[]>;
  kitchen: KitchenStation[];
};

const S = {
  lena: {
    id: "foh_lena",
    name: "Lena K.",
    short: "LENA",
    sectionId: "main",
    role: "server" as const,
  },
  marco: {
    id: "foh_marco",
    name: "Marco V.",
    short: "MARCO",
    sectionId: "main",
    role: "server" as const,
  },
  nora: {
    id: "foh_nora",
    name: "Nora S.",
    short: "NORA",
    sectionId: "main",
    role: "server" as const,
  },
  sofia: {
    id: "foh_sofia",
    name: "Sofia R.",
    short: "SOFIA",
    sectionId: "bar",
    role: "server" as const,
  },
  tom: {
    id: "foh_tom",
    name: "Tom H.",
    short: "TOM",
    sectionId: "bar",
    role: "server" as const,
  },
  jonas: {
    id: "foh_jonas",
    name: "Jonas M.",
    short: "JONAS",
    sectionId: "terrace",
    role: "server" as const,
  },
  ella: {
    id: "foh_ella",
    name: "Ella P.",
    short: "ELLA",
    sectionId: "terrace",
    role: "server" as const,
  },
};

const K = {
  ana: {
    id: "ks_expo",
    name: "Expo",
    person: "Ana P.",
    picking: "Pass · ticket pacing",
  },
  kai: {
    id: "ks_hot",
    name: "Hot line",
    person: "Kai N.",
    picking: "Mains · grill",
  },
  mira: {
    id: "ks_cold",
    name: "Cold / garde",
    person: "Mira S.",
    picking: "Starters · Tataki",
  },
  yuki: {
    id: "ks_hot",
    name: "Hot line",
    person: "Yuki T.",
    picking: "Mains · grill",
  },
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function toIso(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(iso: string, days: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

function weekdayLong(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(
    parseIso(iso),
  );
}

function dateLabelUpper(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(parseIso(iso))
    .toUpperCase()
    .replace(/,/g, "");
}

/** Monday of the demo week (ISO week containing BERLIN_DEMO_TONIGHT). */
export function berlinWeekMonday(anchor = BERLIN_DEMO_TONIGHT): string {
  const d = parseIso(anchor);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return toIso(d);
}

export function berlinWeekDates(anchor = BERLIN_DEMO_TONIGHT): string[] {
  const mon = berlinWeekMonday(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

function dinner(iso: string): string {
  const dow = parseIso(iso).getDay();
  if (dow === 0) return "Sunday dinner · 17:30-21:00";
  if (dow === 5 || dow === 6) return "Dinner service · 18:00-22:00";
  return "Dinner service · 18:00-21:00";
}

function rosterForIso(dateIso: string): BerlinDayRoster {
  const dow = parseIso(dateIso).getDay(); // 0 Sun … 6 Sat
  const base = {
    dateIso,
    weekday: weekdayLong(dateIso),
    dateLabel: dateLabelUpper(dateIso),
    mealLine: dinner(dateIso),
  };

  // Mon (tonight) — default Berlin floor
  if (dow === 1) {
    return {
      ...base,
      note: null,
      serversBySection: {
        main: [S.lena, S.marco],
        bar: [S.sofia],
        terrace: [S.jonas],
      },
      kitchen: [K.ana, K.kai, K.mira],
    };
  }
  // Tue — Marco off, Nora covers right side
  if (dow === 2) {
    return {
      ...base,
      note: "Nora covers Marco’s side",
      serversBySection: {
        main: [S.lena, { ...S.nora, sectionId: "main" }],
        bar: [S.sofia],
        terrace: [S.jonas],
      },
      kitchen: [K.ana, K.kai, K.mira],
    };
  }
  // Wed — heavy rain · terrace closed · Ella helps main
  if (dow === 3) {
    return {
      ...base,
      note: "Heavy rain · terrace closed · Ella on main with Marco",
      serversBySection: {
        main: [S.marco, { ...S.nora, sectionId: "main" }, { ...S.ella, sectionId: "main" }],
        bar: [S.sofia],
        terrace: [],
      },
      kitchen: [K.ana, K.yuki, K.mira],
    };
  }
  // Thu — damp / limited terrace after rain
  if (dow === 4) {
    return {
      ...base,
      note: "Damp evening · half terrace only",
      serversBySection: {
        main: [S.lena, S.marco],
        bar: [S.sofia],
        terrace: [S.jonas],
      },
      kitchen: [K.ana, K.kai, K.mira],
    };
  }
  // Fri — peak: Tom doubles bar
  if (dow === 5) {
    return {
      ...base,
      note: "Friday peak · Tom on bar with Sofia",
      serversBySection: {
        main: [S.lena, S.marco],
        bar: [S.sofia, { ...S.tom, sectionId: "bar" }],
        terrace: [S.jonas],
      },
      kitchen: [K.ana, K.kai, K.mira],
    };
  }
  // Sat — peak full set
  if (dow === 6) {
    return {
      ...base,
      note: "Saturday peak set",
      serversBySection: {
        main: [S.lena, S.marco],
        bar: [S.sofia, { ...S.tom, sectionId: "bar" }],
        terrace: [S.jonas, { ...S.ella, sectionId: "terrace" }],
      },
      kitchen: [K.ana, K.kai, K.mira],
    };
  }
  // Sun — lighter; terrace closed for weather / staffing
  return {
    ...base,
    note: "Sunday set · terrace closed",
    serversBySection: {
      main: [S.lena, S.marco],
      bar: [S.sofia],
      terrace: [],
    },
    kitchen: [K.ana, K.kai],
  };
}

export function berlinDayRoster(dateIso: string): BerlinDayRoster {
  return rosterForIso(dateIso);
}

export function shiftDay(iso: string, delta: number, week: string[]): string {
  const idx = week.indexOf(iso);
  if (idx < 0) return week[0]!;
  const next = Math.min(week.length - 1, Math.max(0, idx + delta));
  return week[next]!;
}

/** Overlay week roster onto the Berlin floor geometry. */
export function applyBerlinDayRoster(
  floor: FloorPlan,
  roster: BerlinDayRoster,
): FloorPlan {
  return {
    ...floor,
    sections: floor.sections.map((s) => ({
      ...s,
      servers: roster.serversBySection[s.id] ?? s.servers ?? [],
      assignedFoh: (roster.serversBySection[s.id] ?? []).length,
    })),
    kitchen: roster.kitchen,
  };
}
