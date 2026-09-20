/**
 * Operating horizon - always prepared.
 * Tomorrow · this week · 4-week lead for huge events.
 */

export type HorizonScale = "NORMAL" | "BIG" | "HUGE";

export type HorizonDay = {
  id: string;
  label: string;
  /** Short date e.g. Sat 22 Aug */
  when: string;
  covers: number;
  outlook: string;
  note: string;
  scale: HorizonScale;
};

export type HorizonWeekItem = {
  id: string;
  day: string;
  label: string;
  note: string;
  scale: HorizonScale;
};

export type HorizonLead = {
  id: string;
  /** Weeks until start */
  weeksOut: number;
  title: string;
  when: string;
  scale: "BIG" | "HUGE";
  why: string;
  prepare: string;
};

export type OperatingHorizon = {
  tomorrow: HorizonDay;
  week: HorizonWeekItem[];
  /** Material leads - BIG/HUGE only; HUGE always from ≤4 weeks. */
  leads: HorizonLead[];
  /** One-line summary for strip. */
  headline: string;
};
