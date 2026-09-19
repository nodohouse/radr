/**
 * Priority ranking + role context panels for command-center layout.
 */

import { formatMoney } from "@/lib/radr/money";
import type {
  GlanceBrief,
  GlanceComposeInput,
  GlanceContextPanel,
  GlanceKind,
  GlanceSignal,
  GlanceTone,
} from "./types";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

export function signalKind(signal: GlanceSignal): GlanceKind {
  if (signal.kind) return signal.kind;
  if (signal.id === "allergies" || signal.label === "SAFETY" || signal.label === "ALLERGIES") {
    return "safety";
  }
  if (
    signal.label === "RECOVERY" ||
    signal.label === "CANCELLED" ||
    signal.label === "TABLE OPENED" ||
    signal.label === "NO-SHOW" ||
    signal.label === "RECOVERED" ||
    signal.label === "EXPIRED" ||
    signal.label === "GUEST LATE" ||
    signal.id.startsWith("recovery_") ||
    signal.action === "revenue"
  ) {
    return "recovery";
  }
  if (signal.action === "none") return "context";
  if (signal.id === "staff") return "ops";
  return "commercial";
}

/** Safety > recovery > urgency/deadline > financial > ops. */
export function prioritizeSignals(signals: GlanceSignal[]): GlanceSignal[] {
  return [...signals].sort((a, b) => {
    const wa = a.rankWeight ?? defaultWeight(a);
    const wb = b.rankWeight ?? defaultWeight(b);
    return wb - wa;
  });
}

function defaultWeight(s: GlanceSignal): number {
  const kind = signalKind(s);
  if (kind === "safety" && s.action !== "none") return 1000;
  if (kind === "recovery" && s.action !== "none") return 900;
  if (kind === "commercial" && s.action !== "none") return 700;
  if (kind === "ops" && s.action !== "none") return 500;
  if (s.action !== "none") return 400;
  return 100;
}

export function composeMeta(input: GlanceComposeInput): string | null {
  const parts: string[] = [];
  if (input.locationName) parts.push(input.locationName);
  parts.push(`${input.expectedCovers} covers expected`);
  if (
    input.phase === "PRE_SHIFT" &&
    input.minutesToOpen != null &&
    input.minutesToOpen > 0
  ) {
    parts.push(`opens in ${input.minutesToOpen} min`);
  } else if (input.phase === "LIVE") {
    parts.push(`peak ${input.peakLabel}`);
  }
  return parts.join(", ");
}

export function composeNextMoment(
  input: GlanceComposeInput,
  ranked: GlanceSignal[],
): { when: string; label: string } | null {
  const top = ranked.find((s) => s.action !== "none");
  if (top?.id === "bluefin" || top?.id === "menu") {
    return { when: "17:15", label: "Bluefin sourcing decision" };
  }
  if (top?.id === "allergies") {
    const t = input.allergyLines[0]?.time ?? "19:30";
    return { when: t, label: "Allergy confirmation" };
  }
  if (top?.id === "staff") {
    return { when: "19:15", label: "FOH (Front of House) coverage window" };
  }
  if (input.phase === "PRE_SHIFT") {
    return { when: "19:30", label: "Peak service begins" };
  }
  return null;
}

export function composeContextPanel(
  input: GlanceComposeInput,
  ranked: GlanceSignal[],
): GlanceContextPanel | null {
  const next = composeNextMoment(input, ranked);
  const role = input.role;

  if (role === "cfo" || role === "finance" || role === "owner") {
    return {
      title: "Financial pulse",
      metrics: [
        {
          label: "Projected",
          value: eur(input.projectedRevenue),
          hint: `${eur(input.expectedContribution)} contribution`,
        },
        {
          label: "At stake",
          value: eur(input.menuContributionAtRisk + input.staffingAtRisk),
          hint: "Open decisions",
        },
        {
          label: "Verified",
          value: eur(input.verifiedValue ?? 184),
        },
      ],
      sections: [
        {
          label: "Recoverable",
          lines: [`${eur(input.recoverable ?? 118)} still open`],
        },
      ],
      next,
      ctaLabel: "Review highest value",
      ctaAction: "plan",
    };
  }

  if (role === "coo" || role === "regional") {
    return {
      title: "Location health",
      metrics: [
        {
          label: "Ready",
          value: String(input.groupReady ?? 15),
          hint: "locations",
        },
        {
          label: "Need you",
          value: String(input.groupNeedAttention ?? 2),
        },
        {
          label: "Exposure",
          value: eur(input.groupExposure ?? 12480),
        },
      ],
      sections: [
        {
          label: "Priority",
          lines: ["Berlin Mitte, Bluefin + staffing"],
        },
      ],
      next,
      ctaLabel: "Review exceptions",
      ctaAction: "decision",
    };
  }

  if (role === "head_chef" || role === "kitchen") {
    return {
      title: "Kitchen readiness",
      metrics: [
        {
          label: "Bluefin",
          value: `${input.menuPortionsLeft} / ${input.menuPortionsExpected}`,
          hint: `Out ~${input.menuRunOutBy}`,
        },
        {
          label: "Covers",
          value: String(input.expectedCovers),
          hint: `Peak ${input.peakLabel}`,
        },
      ],
      sections: [
        {
          label: "Allergies",
          lines: [
            `${input.allergyTables} tables`,
            input.allergyKitchenPending > 0
              ? `${input.allergyKitchenPending} kitchen pending`
              : "Kitchen clear",
          ],
        },
      ],
      next,
      ctaLabel: "Open kitchen brief",
      ctaAction: "plan",
    };
  }

  if (role === "host" || role === "server") {
    return {
      title: "Guest & seating",
      metrics: [
        {
          label: "Covers",
          value: String(input.expectedCovers),
          hint: `${input.expectedWalkIns} walk-ins`,
        },
        {
          label: "Peak",
          value: input.peakLabel,
        },
      ],
      sections: [
        {
          label: "Moments",
          lines: [
            `${input.birthdays} birthdays`,
            `${input.engagements} engagement, ${input.anniversaries} anniversary`,
          ],
        },
        {
          label: "Safety",
          lines: [
            `${input.allergyTables} allergy tables`,
            input.allergyUnconfirmed + input.allergyKitchenPending > 0
              ? `${input.allergyUnconfirmed + input.allergyKitchenPending} need confirmation`
              : "Confirmed",
          ],
        },
      ],
      next,
      ctaLabel: "Open guest brief",
      ctaAction: "hosp",
    };
  }

  // GM / F&B default - Tonight
  return {
    title: "Tonight",
    metrics: [
      {
        label: "Expected covers",
        value: String(input.expectedCovers),
      },
      {
        label: "Walk-ins",
        value: String(input.expectedWalkIns),
      },
      {
        label: "Peak",
        value: input.peakLabel,
      },
    ],
    sections: [
      {
        label: "Terrace",
        lines: [
          input.terraceOpen ? "Strong" : "Closed",
          input.terraceOpen ? "+14 covers expected" : "Weather hold",
        ],
      },
      {
        label: "Hospitality",
        lines: [
          `${input.birthdays} birthdays`,
          `${input.engagements} engagement, ${input.anniversaries} anniversary`,
        ],
      },
      {
        label: "Returning",
        lines: [`${input.returningGuests} guests`],
      },
      {
        label: "Safety",
        lines: [
          `${input.allergyTables} allergy tables`,
          input.allergyKitchenPending + input.allergyUnconfirmed > 0
            ? `${input.allergyKitchenPending + input.allergyUnconfirmed} needs confirmation`
            : "Clear",
        ],
      },
    ],
    next,
    ctaLabel: "Open shift brief",
    ctaAction: "plan",
  };
}

/** Attach meta, sorted primary, context panel. Every item gets a short why. */
export function finalizeGlanceBrief(
  brief: Omit<GlanceBrief, "meta" | "minutesToOpen" | "contextPanel"> &
    Partial<Pick<GlanceBrief, "meta" | "minutesToOpen" | "contextPanel">>,
  input: GlanceComposeInput,
): GlanceBrief {
  const primary = prioritizeSignals(brief.primary).map(ensureSignalWhy);
  const secondary = brief.secondary.map(ensureSignalWhy);
  const strip = brief.strip.map((s) => ({
    ...s,
    why: s.why?.trim() || defaultStripWhy(s),
  }));
  const actionable = primary.filter((s) => s.action !== "none");
  const n = actionable.length;
  return {
    ...brief,
    primary,
    secondary,
    strip,
    headline:
      brief.headline ||
      (n === 0
        ? "Nothing needs you."
        : n === 1
          ? "1 thing needs you."
          : `${n} things need you.`),
    meta: brief.meta ?? composeMeta(input),
    minutesToOpen:
      brief.minutesToOpen ??
      (input.phase === "PRE_SHIFT" ? (input.minutesToOpen ?? null) : null),
    contextPanel:
      brief.contextPanel === undefined
        ? composeContextPanel(input, primary)
        : brief.contextPanel,
  };
}

function ensureSignalWhy(s: GlanceSignal): GlanceSignal {
  const why = s.why?.trim() || s.context?.trim() || defaultSignalWhy(s);
  return { ...s, why, context: s.context ?? why };
}

function defaultSignalWhy(s: GlanceSignal): string {
  if (s.id === "allergies") {
    return "Allergen not confirmed with the kitchen yet - miss this and the guest is at risk";
  }
  if (s.id === "bluefin" || s.id === "menu") {
    return "Signature dish supply will not cover tonight's bookings";
  }
  if (s.id === "staff") {
    return "Peak demand exceeds scheduled floor coverage";
  }
  if (s.action === "none") {
    return "Context for the shift - no decision needed";
  }
  return "This changes tonight's outcome if left alone";
}

function defaultStripWhy(s: {
  id: string;
  label: string;
  state: string;
  tone: GlanceTone;
}): string {
  if (s.tone === "ready") return "Ready for service as planned";
  if (s.tone === "watch") return "Worth a glance before peak";
  if (s.tone === "critical") return "Blocks a safe open if ignored";
  return "Shift readiness cue";
}
