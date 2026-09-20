/**
 * Compose role × phase glance brief - max 3 primary, 5 secondary.
 */

import { formatMoney } from "@/lib/radr/money";
import { bluefinForRole, staffingForRole } from "./language";
import { finalizeGlanceBrief } from "./priority";
import type { GlanceBrief, GlanceComposeInput, GlanceSignal } from "./types";

type GlanceDraft = Omit<
  GlanceBrief,
  "meta" | "minutesToOpen" | "contextPanel"
>;

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

function phaseKicker(
  phase: GlanceComposeInput["phase"],
  _locationName: string,
): string {
  if (phase === "PRE_SHIFT") return "Pre-shift";
  if (phase === "LIVE") return "Live";
  if (phase === "CLOSING") return "Closing";
  return "Post-shift";
}

function buildBluefin(input: GlanceComposeInput): GlanceSignal {
  const lang = bluefinForRole(
    input.role,
    input.menuPortionsLeft,
    input.menuPortionsExpected,
    input.menuRunOutBy,
    input.menuContributionAtRisk,
    input.menuSourcingNet,
  );
  const isKitchen = input.role === "head_chef" || input.role === "kitchen";
  return {
    id: "bluefin",
    label: isKitchen ? "BLUEFIN" : "MENU",
    state: lang.state,
    impact: lang.number,
    deadline: "Decision by 17:15",
    context: lang.why,
    why: lang.why,
    actionLabel: lang.actionLabel,
    action:
      input.role === "host" || input.role === "server" ? "none" : "plan",
    tone: "watch",
    kind: "commercial",
    rankWeight: 720,
  };
}

function buildStaff(input: GlanceComposeInput): GlanceSignal {
  const lang = staffingForRole(
    input.role,
    input.staffingWindow,
    input.staffingAtRisk,
  );
  return {
    id: "staff",
    label: "STAFF",
    state: lang.state,
    impact: lang.number,
    deadline: input.staffingWindow,
    context: lang.why,
    why: lang.why,
    actionLabel: lang.actionLabel,
    action: "plan",
    tone: "watch",
    kind: "ops",
    rankWeight: 520,
  };
}

function buildAllergies(input: GlanceComposeInput): GlanceSignal {
  const pending =
    input.allergyUnconfirmed + input.allergyKitchenPending;
  const first = input.allergyLines[0];
  const title = first
    ? `${first.table}, ${first.label} allergy`
    : `${input.allergyTables} tables`;
  return {
    id: "allergies",
    label: "SAFETY",
    state: title,
    impact:
      pending > 0
        ? "Kitchen confirmation missing"
        : "Confirmed",
    deadline: first?.time ? `Guest arrives ${first.time}` : undefined,
    why:
      pending > 0
        ? "Allergen not confirmed with the kitchen yet - miss this and the guest is at risk"
        : "Kitchen already has the allergen note",
    context:
      input.allergyLines.length > 1
        ? `+${input.allergyLines.length - 1} more allergy table${input.allergyLines.length > 2 ? "s" : ""}`
        : undefined,
    actionLabel: pending > 0 ? "Confirm" : undefined,
    action: pending > 0 ? "hosp" : "none",
    tone: pending > 0 ? "critical" : "ready",
    kind: "safety",
    rankWeight: pending > 0 ? 1000 : 50,
  };
}

function composeChefKitchen(input: GlanceComposeInput): GlanceDraft {
  const primary: GlanceSignal[] = [];
  if (input.phase === "PRE_SHIFT" || input.phase === "LIVE") {
    primary.push(buildBluefin(input));
    if (input.phase === "PRE_SHIFT") primary.push(buildStaff(input));
    primary.push(buildAllergies(input));
  }

  const secondary: GlanceSignal[] = [
    {
      id: "covers",
      label: "COVERS",
      state: String(input.expectedCovers),
      context: `Peak ${input.peakLabel}`,
      action: "none",
      tone: "neutral",
    },
    {
      id: "prep",
      label: "PREP",
      state: "2 changes",
      context: "Tataki +12, Truffle pasta −8",
      action: "plan",
      actionLabel: "Open",
      tone: "watch",
    },
  ];
  if (input.privateDining > 0) {
    secondary.push({
      id: "private",
      label: "PRIVATE",
      state: "12 covers at 20:00",
      action: "hosp",
      actionLabel: "Brief",
      tone: "neutral",
    });
  }

  const need = primary.filter((p) => p.tone === "critical" || p.tone === "watch")
    .length;

  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline:
      input.phase === "LIVE"
        ? need > 0
          ? `${need} live kitchen issue${need === 1 ? "" : "s"}.`
          : "Kitchen on track."
        : `${Math.min(need, 3)} things before service.`,
    primary: take(primary, 3),
    secondary: take(secondary, 5),
    readyLine:
      input.phase === "PRE_SHIFT"
        ? "Terrace and private room ready"
        : null,
    strip: [
      { id: "demand", label: "DEMAND", state: "READY", tone: "ready" },
      {
        id: "menu",
        label: "MENU",
        state: "1 ISSUE",
        tone: "critical",
      },
      {
        id: "safety",
        label: "SAFETY",
        state:
          input.allergyUnconfirmed + input.allergyKitchenPending > 0
            ? "1 ISSUE"
            : "READY",
        tone:
          input.allergyUnconfirmed + input.allergyKitchenPending > 0
            ? "watch"
            : "ready",
      },
    ],
  };
}

function composeHost(input: GlanceComposeInput): GlanceDraft {
  const primary: GlanceSignal[] = [
    {
      id: "table-open",
      label: "TABLE OPENED",
      state: "19:30 · Table 12 · 4 guests",
      number: "€184",
      impact: "6 waitlist matches",
      why: "Cancellation · offer waitlist now · social ready if unfilled",
      deadline: "38 min",
      action: "revenue",
      actionLabel: "Offer",
      tone: "money",
      kind: "commercial",
      rankWeight: 90,
    },
    {
      id: "noshow",
      label: "NO-SHOW",
      state: "Table 8 · 20:00 · 2 guests",
      context: "Grace reached · release table",
      action: "revenue",
      actionLabel: "Recover",
      tone: "watch",
      kind: "commercial",
      rankWeight: 85,
    },
    {
      id: "safety",
      label: "SAFETY",
      state: `${input.allergyTables} allergy`,
      number:
        input.allergyUnconfirmed + input.allergyKitchenPending > 0
          ? "Needs check"
          : "✓ confirmed",
      action: "hosp",
      actionLabel: "Open",
      tone:
        input.allergyUnconfirmed + input.allergyKitchenPending > 0
          ? "watch"
          : "ready",
    },
  ];

  const secondary: GlanceSignal[] = [
    {
      id: "tonight",
      label: "TONIGHT",
      state: `${input.expectedCovers} covers`,
      number: `${input.expectedWalkIns} walk-ins`,
      action: "none",
      tone: "neutral",
    },
    {
      id: "moments",
      label: "MOMENTS",
      state: `${input.birthdays} birthdays`,
      context: [
        input.engagements > 0 ? `${input.engagements} engagement` : null,
        input.anniversaries > 0 ? `${input.anniversaries} anniversary` : null,
      ]
        .filter(Boolean)
        .join(", "),
      action: "hosp",
      actionLabel: "Brief",
      tone: "neutral",
    },
    {
      id: "seating",
      label: "SEATING",
      state: `${input.quietRequests + input.terraceRequests} requests`,
      context: `${input.quietRequests} quiet, ${input.terraceRequests} terrace`,
      action: "hosp",
      actionLabel: "Brief",
      tone: "neutral",
    },
  ];

  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline: "1 table needs you.",
    primary: take(primary, 3),
    secondary: take(secondary, 5),
    readyLine: null,
    strip: [],
  };
}

function composeServer(input: GlanceComposeInput): GlanceDraft {
  const primary: GlanceSignal[] = [
    {
      id: "section",
      label: "SECTION B",
      state: "18 covers",
      context: `Peak ${input.peakLabel}`,
      action: "none",
      tone: "neutral",
    },
    {
      id: "t12",
      label: "TABLE 12, 19:30",
      state: "Birthday, Peanut",
      context: "Quiet table",
      action: "hosp",
      actionLabel: "Open",
      tone: "critical",
    },
    {
      id: "t14",
      label: "TABLE 14, 19:45",
      state: "Returning guest",
      context: "Sparkling water preference",
      action: "none",
      tone: "neutral",
    },
  ];
  const secondary: GlanceSignal[] = [
    {
      id: "t18",
      label: "TABLE 18, 20:00",
      state: "Anniversary",
      context: "Shellfish, confirm on arrival",
      action: "hosp",
      actionLabel: "Open",
      tone: "watch",
    },
  ];
  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline: "Your section only.",
    primary: take(primary, 3),
    secondary: take(secondary, 3),
    readyLine: null,
    strip: [],
  };
}

function composeGm(input: GlanceComposeInput): GlanceDraft {
  const primary: GlanceSignal[] = [
    buildBluefin(input),
    buildStaff(input),
  ];
  if (input.allergyKitchenPending + input.allergyUnconfirmed > 0) {
    primary.push(buildAllergies(input));
  } else {
    primary.push({
      id: "revenue",
      label: "TABLE OPENED",
      state: "19:30 · Table 12 · 4 guests",
      number: "€184",
      impact: "6 waitlist · plan ready",
      why: "Offer waitlist now · Instagram Story prepared if unfilled in 10 min",
      deadline: "38 min",
      action: "revenue",
      actionLabel: "Approve",
      tone: "money",
      kind: "commercial",
      rankWeight: 72,
    });
  }

  const secondary: GlanceSignal[] = [
    {
      id: "noshow",
      label: "NO-SHOW",
      state: "Table 8 · 20:00",
      number: "€96",
      impact: "3 waitlist · release now",
      why: "Grace period reached · no check-in",
      action: "revenue",
      actionLabel: "Recover",
      tone: "watch",
      kind: "commercial",
      rankWeight: 70,
    },
    {
      id: "revenue",
      label: "REVENUE",
      state: "3 tables to recover",
      number: "€376",
      impact: "6 relevant suggestions",
      why: "Cancellation + no-show + walk-in hold · social only as escalation",
      deadline: "38 min",
      action: "revenue",
      actionLabel: "Review",
      tone: "money",
      kind: "commercial",
      rankWeight: 72,
    },
    {
      id: "service",
      label: "SERVICE",
      state: `${input.expectedCovers} covers`,
      context: `${input.expectedWalkIns} walk-ins, peak ${input.peakLabel}${input.terraceOpen ? ", terrace open" : ""}`,
      action: "plan",
      actionLabel: "Plan",
      tone: "ready",
    },
    {
      id: "hosp",
      label: "HOSPITALITY",
      state: `${input.birthdays} birthdays`,
      context: `${input.engagements} engagement, ${input.anniversaries} anniversary, ${input.allergyTables} allergy`,
      action: "hosp",
      actionLabel: "Brief",
      tone: "neutral",
    },
  ];

  const n = primary.length;
  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline:
      input.phase === "LIVE"
        ? "1 thing needs you."
        : `${n} things need you.`,
    primary: take(primary, 3),
    secondary: take(secondary, 5),
    readyLine: "Everything else ready.",
    strip: [
      { id: "demand", label: "DEMAND", state: "READY", tone: "ready" },
      { id: "staff", label: "STAFF", state: "1 ISSUE", tone: "watch" },
      { id: "menu", label: "MENU", state: "1 ISSUE", tone: "watch" },
      {
        id: "guests",
        label: "GUESTS",
        state: "READY",
        tone: "ready",
      },
      {
        id: "safety",
        label: "SAFETY",
        state:
          input.allergyKitchenPending + input.allergyUnconfirmed > 0
            ? "1 ISSUE"
            : "READY",
        tone:
          input.allergyKitchenPending + input.allergyUnconfirmed > 0
            ? "critical"
            : "ready",
      },
    ],
  };
}

function composeCfo(input: GlanceComposeInput): GlanceDraft {
  const exposure =
    input.menuContributionAtRisk + input.staffingAtRisk;
  const contribution = input.expectedContribution;
  const verified = input.verifiedValue ?? 184;
  const recoverable = input.recoverable ?? 118;
  const primary: GlanceSignal[] = [
    {
      id: "attention",
      label: "EXPOSURE",
      state: eur(exposure),
      context: "2 material decisions · not floor noise",
      action: "plan",
      actionLabel: "Top decision",
      tone: "watch",
      kind: "commercial",
      rankWeight: 800,
    },
    {
      id: "contrib",
      label: "CONTRIBUTION",
      state: eur(contribution),
      context: `${eur(input.projectedRevenue)} projected · contribution ≠ profit`,
      action: "none",
      tone: "money",
      kind: "context",
    },
    {
      id: "menu",
      label: "MENU RISK",
      state: eur(input.menuContributionAtRisk),
      context: `Sourcing protects ${eur(input.menuSourcingNet)} net`,
      action: "plan",
      actionLabel: "Review",
      tone: "watch",
      kind: "commercial",
      rankWeight: 720,
    },
  ];
  const secondary: GlanceSignal[] = [
    {
      id: "labor",
      label: "LABOR",
      state: eur(input.staffingAtRisk),
      action: "none",
      tone: "neutral",
    },
    {
      id: "verified",
      label: "VERIFIED",
      state: eur(verified),
      context: "Proved outcomes today",
      action: "none",
      tone: "ready",
    },
    {
      id: "recover",
      label: "RECOVERABLE",
      state: eur(recoverable),
      context: "Aggregate · no table list on this view",
      action: "revenue",
      actionLabel: "Exposure",
      tone: "money",
    },
  ];
  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline: `${eur(exposure)} needs attention.`,
    primary: take(primary, 3),
    secondary: take(secondary, 5),
    readyLine: "Reconciliation quiet. Floor recovery is aggregated here.",
    strip: [
      { id: "contrib", label: "CONTRIB", state: eur(contribution), tone: "money" },
      { id: "verified", label: "VERIFIED", state: eur(verified), tone: "ready" },
      {
        id: "exposure",
        label: "EXPOSURE",
        state: eur(exposure),
        tone: "watch",
      },
    ],
  };
}

function composeOwner(input: GlanceComposeInput): GlanceDraft {
  const exposure =
    input.groupExposure ??
    input.menuContributionAtRisk + input.staffingAtRisk;
  const verified = input.verifiedValue ?? 2184;
  const contribution = input.expectedContribution;
  const marginPts =
    input.projectedRevenue > 0
      ? Math.round((contribution / input.projectedRevenue) * 1000) / 10
      : 0;
  const multi =
    input.groupNeedAttention != null || input.groupReady != null;
  const need = input.groupNeedAttention ?? 0;
  const ready = input.groupReady ?? 0;
  const sites = ready + (input.groupAtRisk ?? 0) + need;

  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(
      input.phase,
      multi ? input.locationName || "Group" : input.locationName,
    ),
    headline: multi
      ? need > 0
        ? `${need} location${need === 1 ? "" : "s"} need you · rest of the group is quiet.`
        : `${sites || ready} locations · group on track.`
      : input.phase === "LIVE" || input.phase === "CLOSING"
        ? "Business on track - 2 decisions at stake."
        : "On track after recommended changes.",
    primary: multi
      ? [
          {
            id: "group",
            label: "LOCATIONS",
            state: `${ready} ready`,
            number:
              need > 0
                ? `${need} need you`
                : `${input.groupAtRisk ?? 0} watch`,
            context: "Compare side by side below - not one floor",
            action: "decision",
            actionLabel: "Compare",
            tone: need > 0 ? "watch" : "ready",
            kind: "commercial",
            rankWeight: 820,
          },
          {
            id: "exposure",
            label: "EXPOSURE",
            state: eur(exposure),
            context: "Material across the group",
            action: "plan",
            actionLabel: "Review",
            tone: "watch",
            kind: "commercial",
            rankWeight: 760,
          },
          {
            id: "verified",
            label: "VERIFIED",
            state: eur(verified),
            context: "Proved across venues today",
            action: "none",
            tone: "ready",
            kind: "context",
          },
        ]
      : [
          {
            id: "contrib",
            label: "CONTRIBUTION",
            state: eur(contribution),
            number: `${marginPts}% margin`,
            context: "Not profit - operating contribution tonight",
            action: "none",
            tone: "money",
            kind: "context",
          },
          {
            id: "verified",
            label: "VERIFIED",
            state: eur(verified),
            context: "RADR proved today",
            action: "none",
            tone: "ready",
            kind: "context",
          },
          {
            id: "decisions",
            label: "AT STAKE",
            state: eur(exposure),
            number: "2 decisions",
            context: "Material exposure - not table detail",
            action: "plan",
            actionLabel: "Review",
            tone: "watch",
            kind: "commercial",
            rankWeight: 780,
          },
        ],
    secondary: [
      {
        id: "projected",
        label: "PROJECTED",
        state: eur(input.projectedRevenue),
        action: "none",
        tone: "neutral",
      },
      {
        id: "tomorrow",
        label: "TOMORROW",
        state: multi ? "Arena night · 2 sites busy" : "168 covers, busy",
        context: "Prepare early",
        action: "none",
        tone: "watch",
      },
      {
        id: "lead",
        label: "LEAD",
        state: "Fair in 3 weeks",
        context: "Capacity + labor plan",
        action: "none",
        tone: "critical",
      },
    ],
    readyLine: multi
      ? "Drill a location only when the comparison asks for judgment."
      : "Floor recovery handled in the operation - not on this view.",
    strip: multi
      ? [
          {
            id: "pulse",
            label: "GROUP",
            state: need > 0 ? `${need} OPEN` : "HEALTHY",
            tone: need > 0 ? "watch" : "ready",
          },
          {
            id: "exposure",
            label: "EXPOSURE",
            state: eur(exposure),
            tone: "watch",
          },
        ]
      : [
          {
            id: "pulse",
            label: "PULSE",
            state: "HEALTHY",
            tone: "ready",
          },
          {
            id: "exposure",
            label: "EXPOSURE",
            state: eur(exposure),
            tone: "watch",
          },
        ],
  };
}

function composeCoo(input: GlanceComposeInput): GlanceDraft {
  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, "Group"),
    headline: "2 locations need attention.",
    primary: [
      {
        id: "group",
        label: "LOCATIONS",
        state: `${input.groupReady ?? 15} ready`,
        context: `${input.groupNeedAttention ?? 2} need you, ${input.groupAtRisk ?? 1} at risk`,
        action: "none",
        tone: "watch",
      },
      {
        id: "exposure",
        label: "EXPOSURE",
        state: eur(input.groupExposure ?? 12480),
        action: "decision",
        actionLabel: "Open",
        tone: "money",
      },
      {
        id: "berlin",
        label: "PRIORITY",
        state: "Berlin Mitte",
        context: "Bluefin + staffing",
        action: "plan",
        actionLabel: "Open",
        tone: "critical",
      },
    ],
    secondary: [
      {
        id: "ams",
        label: "OPPORTUNITY",
        state: "Amsterdam West terrace",
        number: "+€1.240,00",
        action: "none",
        tone: "ready",
      },
      {
        id: "tomorrow",
        label: "TOMORROW",
        state: "Berlin, busy",
        context: "168 covers, arena night",
        action: "none",
        tone: "watch",
      },
      {
        id: "lead",
        label: "3 WEEKS",
        state: "Hospitality fair",
        context: "Lock staffing and private rooms",
        action: "none",
        tone: "critical",
      },
    ],
    readyLine: null,
    strip: [],
  };
}

function composeFinance(input: GlanceComposeInput): GlanceDraft {
  return {
    role: input.role,
    phase: input.phase,
    kicker: phaseKicker(input.phase, input.locationName),
    headline: `${eur(input.recoverable ?? 8420)} recoverable.`,
    primary: [
      {
        id: "recover",
        label: "RECOVERABLE",
        state: eur(input.recoverable ?? 8420),
        action: "decision",
        actionLabel: "Review",
        tone: "money",
      },
      {
        id: "invoice",
        label: "INVOICES",
        state: "12 mismatches",
        context: "4 missing credits, 2 settlements",
        action: "decision",
        actionLabel: "Open",
        tone: "watch",
      },
      {
        id: "credit",
        label: "NEW CREDIT",
        state: eur(1184),
        context: "Needs review",
        action: "decision",
        actionLabel: "Review",
        tone: "ready",
      },
    ],
    secondary: [],
    readyLine: null,
    strip: [],
  };
}

/**
 * Role-specific compressed brief. Caps enforced. Safety ranks first.
 */
export function composeGlanceBrief(input: GlanceComposeInput): GlanceBrief {
  let draft: GlanceDraft;
  switch (input.role) {
    case "head_chef":
    case "kitchen":
      draft = composeChefKitchen(input);
      break;
    case "host":
      draft = composeHost(input);
      break;
    case "server":
      draft = composeServer(input);
      break;
    case "cfo":
      draft = composeCfo(input);
      break;
    case "owner":
      draft = composeOwner(input);
      break;
    case "coo":
    case "regional":
      draft = composeCoo(input);
      break;
    case "finance":
      draft = composeFinance(input);
      break;
    case "gm":
    case "fb_operator":
    default:
      draft = composeGm(input);
      break;
  }
  return finalizeGlanceBrief(draft, input);
}

/** Build compose input from demo domain objects. */
export function glanceInputFromDemo(args: {
  role: GlanceComposeInput["role"];
  phase: GlanceComposeInput["phase"];
  locationName: string;
  expectedCovers: number;
  expectedWalkIns: number;
  projectedRevenue: number;
  expectedContribution: number;
  peakStart: string;
  peakEnd: string;
  terraceOpen: boolean;
  terraceNet: number | null;
  menuPortionsLeft: number;
  menuPortionsExpected: number;
  menuRunOutBy: string;
  menuContributionAtRisk: number;
  menuSourcingNet: number;
  staffingAtRisk: number;
  staffingWindow: string;
  allergyTables: number;
  allergyUnconfirmed: number;
  allergyKitchenPending: number;
  allergyLines: { table: string; time: string; label: string }[];
  birthdays: number;
  engagements: number;
  anniversaries: number;
  quietRequests: number;
  terraceRequests: number;
  privateDining: number;
  returningGuests: number;
  liveSales?: number;
  livePacePct?: number;
  minutesToOpen?: number | null;
  groupReady?: number;
  groupNeedAttention?: number;
  groupAtRisk?: number;
  groupExposure?: number;
  verifiedValue?: number;
  recoverable?: number;
}): GlanceComposeInput {
  return {
    ...args,
    peakLabel: `${args.peakStart} to ${args.peakEnd}`,
    minutesToOpen: args.minutesToOpen ?? null,
  };
}
