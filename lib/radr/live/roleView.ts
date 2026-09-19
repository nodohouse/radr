import type { RoleView } from "@/lib/product/types";
import { formatCurrency } from "@/lib/radr/currency";
import type { RoleLiveSummary, ShiftEconomicState } from "./types";

function eur(n: number, cents = false) {
  return formatCurrency(n, "EUR", { cents, compact: false });
}

export function roleLiveSummary(
  role: RoleView,
  state: ShiftEconomicState,
): RoleLiveSummary {
  const ahead = state.vsExpectedPct >= 0;
  const pace = ahead
    ? `${state.vsExpectedPct}% ahead of expected pace`
    : `${Math.abs(state.vsExpectedPct)}% behind expected pace`;

  if (role === "owner") {
    const contrib =
      state.estimatedContribution ?? Math.round(state.netSales * 0.65);
    return {
      kicker: `LIVE · ${state.locationName} · business pulse`,
      primary: {
        amount: eur(contrib),
        label: "est. contribution",
      },
      lines: [
        {
          label: "vs plan",
          value: `${ahead ? "+" : ""}${state.vsExpectedPct}%`,
          tone: ahead ? "good" : "watch",
        },
        { label: "Net sales", value: eur(state.netSales), tone: "neutral" },
        { label: "Projected close", value: eur(state.forecastClose) },
        {
          label: "Leakage",
          value: eur(state.discounts + state.comps + state.refunds),
          tone: "watch",
        },
      ],
      narrative:
        "Tonight’s economics and pace - seats stay with the floor.",
    };
  }

  if (role === "cfo") {
    const lines: RoleLiveSummary["lines"] = [
      {
        label: "vs expected",
        value: `${ahead ? "+" : "−"}${eur(Math.abs(state.vsExpectedAbs))} · ${pace}`,
        tone: ahead ? "good" : "watch",
      },
      {
        label: "Discounts / comps",
        value: eur(state.discounts + state.comps),
        tone: "neutral",
      },
      { label: "Refunds", value: eur(state.refunds), tone: "watch" },
    ];
    if (state.estimatedContribution != null) {
      lines.unshift({
        label: "Est. contribution",
        value: `${eur(state.estimatedContribution)} · ${state.estimatedContributionPct}%`,
        tone: "good",
      });
    }
    return {
      kicker: `LIVE · ${state.locationName} · finance`,
      primary: {
        amount: eur(state.estimatedContribution ?? state.netSales),
        label:
          state.estimatedContribution != null
            ? "est. contribution"
            : "net sales",
      },
      lines: lines.slice(0, 4),
      narrative: `${pace} Contribution is the lens - not profit.`,
    };
  }

  if (role === "finance") {
    return {
      kicker: `LIVE · ${state.locationName}`,
      primary: { amount: eur(state.netSales), label: "net sales" },
      lines: [
        { label: "Refunds", value: eur(state.refunds), tone: "watch" },
        { label: "Discounts", value: eur(state.discounts), tone: "neutral" },
        {
          label: "Delivery fees",
          value: eur(state.deliveryFees),
          tone: "neutral",
        },
        {
          label: "Open checks",
          value: eur(state.openCheckValue),
          tone: "neutral",
        },
      ],
      narrative: "Watch leakage and open value as the shift settles.",
    };
  }

  if (role === "coo" || role === "regional") {
    return {
      kicker: "LIVE · GROUP PULSE",
      primary: { amount: eur(state.netSales), label: "this location · net" },
      lines: [
        {
          label: "Pace",
          value: pace,
          tone: ahead ? "good" : "watch",
        },
        {
          label: "Open value",
          value: `${eur(state.openCheckValue)} · ${state.openCheckCount} checks`,
        },
        {
          label: "Projected close",
          value: eur(state.forecastClose),
        },
      ],
      narrative: `${state.locationName} is ${ahead ? "ahead" : "behind"} - open Live Shift for drivers.`,
    };
  }

  if (role === "head_chef" || role === "kitchen") {
    return {
      kicker: `LIVE · ${state.locationName} · kitchen`,
      primary: { amount: String(state.covers), label: "covers so far" },
      lines: [
        { label: "Pace", value: pace, tone: ahead ? "good" : "watch" },
        { label: "Net sales", value: eur(state.netSales), tone: "neutral" },
        {
          label: "Open tickets",
          value: `${state.openCheckCount} · ${eur(state.openCheckValue)}`,
        },
      ],
      narrative: "Covers and ticket pressure - leave the P&L elsewhere.",
    };
  }

  if (role === "host" || role === "server") {
    return {
      kicker: `LIVE · ${state.locationName} · floor`,
      primary: { amount: String(state.covers), label: "covers seated" },
      lines: [
        { label: "Pace", value: pace, tone: ahead ? "good" : "watch" },
        {
          label: "Open checks",
          value: `${state.openCheckCount} · ${eur(state.openCheckValue)}`,
        },
        { label: "Avg spend", value: eur(state.averageSpend) },
      ],
      narrative: "Seating and guest flow - this is the floor.",
    };
  }

  // GM / F&B
  return {
    kicker: `LIVE · ${state.locationName} · ${state.serviceLabel}`,
    primary: { amount: eur(state.netSales), label: "net sales" },
    lines: [
      {
        label: "Pace",
        value: pace,
        tone: (ahead ? "good" : "watch") as "good" | "watch",
      },
      { label: "Covers", value: String(state.covers) },
      {
        label: "Comps",
        value: eur(state.comps),
        tone: "neutral" as const,
      },
      {
        label: "Projected close",
        value: eur(state.forecastClose),
      },
    ].slice(0, 4),
    narrative: `Dinner is running ${pace}.`,
  };
}
