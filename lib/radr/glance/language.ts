/**
 * Role language for the same underlying issue.
 * State = what · reading = short causal line (no school “Why”).
 */

import { abbrevWithExpansion } from "@/lib/radr/terminology";

const FOH = abbrevWithExpansion("foh");

export function bluefinForRole(
  role: string,
  portionsLeft: number,
  portionsExpected: number,
  runOutBy: string,
  contributionAtRisk: number,
  sourcingNet: number,
): { state: string; number?: string; why: string; actionLabel: string } {
  switch (role) {
    case "head_chef":
    case "kitchen":
      return {
        state: `${portionsLeft} / ${portionsExpected}`,
        number: `OUT ~${runOutBy}`,
        why: "Booked demand will burn the last portions before close",
        actionLabel: "Source",
      };
    case "host":
    case "server":
      return {
        state: "May sell out",
        number: `After ~${runOutBy}`,
        why: "Late tables may ask for a dish you can no longer fire",
        actionLabel: "Note",
      };
    case "cfo":
    case "finance":
    case "owner":
      return {
        state: `€${contributionAtRisk.toLocaleString("de-DE")},00 at risk`,
        why: `Sourcing still protects ~€${sourcingNet.toLocaleString("de-DE")},00 if you decide before prep locks`,
        actionLabel: "Review",
      };
    default:
      return {
        state: "Signature dish at risk",
        number: `€${contributionAtRisk.toLocaleString("de-DE")},00 contribution exposed`,
        why: `Bluefin looks set to sell through around ${runOutBy}`,
        actionLabel: "Decide",
      };
  }
}

export function staffingForRole(
  role: string,
  window: string,
  atRisk: number,
): { state: string; number?: string; why: string; actionLabel: string } {
  switch (role) {
    case "head_chef":
    case "kitchen":
      return {
        state: `1 ${FOH} short`,
        number: window,
        why: "Thin floor coverage slows fire and turns when it peaks",
        actionLabel: "Fix",
      };
    case "cfo":
    case "finance":
      return {
        state: `€${atRisk.toLocaleString("de-DE")},00 labor exposure`,
        why: `Peak covers outrun planned ${FOH} in ${window}`,
        actionLabel: "Review",
      };
    default:
      return {
        state: `+1 ${FOH} needed`,
        number: window,
        why: `Guest demand in ${window} outruns the floor you scheduled`,
        actionLabel: "Fix",
      };
  }
}
