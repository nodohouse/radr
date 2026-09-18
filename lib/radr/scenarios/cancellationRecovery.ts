/**
 * GOLD STANDARD scenario: Berlin Mitte Table 14 cancellation recovery.
 * One source of truth for Control Center, Brief, Service Map, Value, Butler.
 *
 * Verified value = €184 (observed POS), never €192 (waitlist potential).
 */

import type { Finding, Action, Verification } from "@/lib/radr/domain";
import { moneyFromMajor } from "@/lib/radr/domain/money";

export const CANCELLATION_RECOVERY_ID = "fnd_cancel_recovery_t14";
export const CANCELLATION_ACTION_ID = "act_waitlist_match_t14";
export const CANCELLATION_VERIFICATION_ID = "ver_t14_pos_184";

/** Controlled demo business clock (venue-local). */
export const SCENARIO_CLOCK = {
  businessDate: "2026-08-18",
  timezone: "Europe/Berlin",
  label: "Berlin · 18 Aug 2026",
} as const;

export type TimelineEvent = {
  at: string;
  label: string;
  kind:
    | "detect"
    | "quantify"
    | "match"
    | "recommend"
    | "accept"
    | "seat"
    | "pos"
    | "verify";
  amountMajor?: number;
  currency?: string;
};

export type CancellationRecoveryScenario = {
  id: typeof CANCELLATION_RECOVERY_ID;
  organizationId: string;
  locationId: string;
  locationName: string;
  environment: "DEMO";

  reservation: {
    id: string;
    externalId: string;
    tableId: string;
    partySize: number;
    serviceTime: string;
    cancelledAt: string;
    expectedBookingValueMajor: number;
    currency: string;
  };

  waitlist: {
    id: string;
    partySize: number;
    requestedFrom: string;
    requestedTo: string;
    expectedValueMajor: number;
  };

  pos: {
    orderId: string;
    closedAt: string;
    observedRevenueMajor: number;
  };

  potentialRecoverableMajor: number;
  verifiedValueMajor: number;

  timeline: TimelineEvent[];
  finding: Finding;
  action: Action;
  verification: Verification | null;

  actionStatus:
    | "PROPOSED"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "MONITORING"
    | "VERIFIED";
};

const CURRENCY = "EUR";
const ORG = "org_northstar";
const LOC = "loc_ber";

function buildFinding(actionStatus: CancellationRecoveryScenario["actionStatus"]): Finding {
  const verified = actionStatus === "VERIFIED";
  const accepted =
    actionStatus === "ACCEPTED" ||
    actionStatus === "IN_PROGRESS" ||
    actionStatus === "COMPLETED" ||
    actionStatus === "MONITORING" ||
    verified;

  return {
    id: CANCELLATION_RECOVERY_ID,
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    territory: "RECOVER",
    category: "cancellation_recovery",
    subtype: "Waitlist recovery",
    title: "Late cancellation created recoverable inventory",
    summary:
      "4 covers released at 20:00. €256 original booking value. 3-person waitlist match available.",
    explanation:
      "A confirmed Table 14 reservation cancelled at 17:42. Waitlist demand overlaps the released slot. Potential recoverable value is €192. Verified value uses observed POS revenue only.",
    status: verified
      ? "VERIFIED"
      : accepted
        ? "ACTIONED"
        : "OPEN",
    urgency: "ACT_NOW",
    priorityScore: 180,
    confidenceScore: accepted ? 88 : 74,
    confidenceBand: accepted ? "HIGH" : "MEDIUM",
    confidenceExplanation: verified
      ? "POS close linked to replacement seating on Table 14."
      : "Match scored on party size, requested time, and expected spend. Not guaranteed until seated and POS closes.",
    timeframe: {
      start: "2026-08-18T20:00:00+02:00",
      end: "2026-08-18T22:00:00+02:00",
      label: "Tonight · 20:00 · Table 14",
    },
    financialImpact: {
      bookingValue: 256,
      grossValue: 256,
      revenueAtRisk: 166,
      recoverableValue: 192,
      verifiedValue: verified ? 184 : undefined,
      primaryValue: verified ? 184 : 192,
      primaryLabel: verified ? "Verified value" : "Potentially recoverable",
      currency: CURRENCY,
    },
    drivers: [
      { label: "Released covers", value: "4 · Table 14 · 20:00" },
      { label: "Original booking value", value: "€256" },
      { label: "Waitlist match", value: "3 guests · 19:45-20:15" },
      { label: "Potential recoverable", value: "€192" },
      ...(verified
        ? [{ label: "Observed POS", value: "€184" }]
        : []),
    ],
    recommendation: {
      title: "Offer released inventory to matching waitlist party",
      description: "Contact 3-guest waitlist party for Table 14 at 20:00.",
      expectedBenefit: 192,
      expectedNetBenefit: 192,
    },
    evidence: [
      {
        id: "ev_res",
        label: "Reservation",
        value: "r_late · Table 14 · cancelled 17:42",
        sourceId: "bookings",
      },
      {
        id: "ev_wl",
        label: "Waitlist",
        value: "wl_t14_match · 3 covers · €192 expected",
        sourceId: "bookings",
      },
      ...(verified
        ? [
            {
              id: "ev_pos",
              label: "POS order",
              value: "pos_t14_replace · closed €184",
              sourceId: "pos",
            },
          ]
        : []),
    ],
    sourceIds: verified ? ["bookings", "pos"] : ["bookings"],
    dedupeKey: `${LOC}:RECOVER:cancellation_recovery:t14:2026-08-18`,
    presentation: {
      kindLabel: "Waitlist recovery",
      headline: "Late cancellation created recoverable inventory.",
      recommendShort: "Match waitlist →",
      ctaLabel: accepted ? "View timeline" : "Review & act",
      financialNote:
        "Potential €192 is not verified. Verified value equals observed POS (€184) when linked.",
      actionCreated: accepted,
      actionedNote: accepted
        ? "Waitlist offer accepted · monitoring seating and POS"
        : undefined,
      primaryAction: {
        kind: "open",
        label: "Open finding",
        href: `/app/findings/${CANCELLATION_RECOVERY_ID}`,
      },
      secondaryHref: "/app/service?focus=t14",
      secondaryLabel: "View Table 14",
      eventId: "evt_t14_cancel_recovery",
      verificationStatus: verified
        ? "VERIFIED"
        : accepted
          ? "MONITORING"
          : "IDENTIFIED",
      verificationMethod:
        "Verified when replacement party is seated and POS closes against Table 14.",
      dataSources: [
        {
          key: "bookings",
          label: "Bookings",
          lastSyncLabel: "2m ago",
          ageMinutes: 2,
        },
        {
          key: "pos",
          label: "POS",
          lastSyncLabel: "4m ago",
          ageMinutes: 4,
        },
      ],
    },
    createdAt: "2026-08-18T17:42:00+02:00",
    updatedAt: verified
      ? "2026-08-18T21:37:00+02:00"
      : "2026-08-18T17:47:00+02:00",
  };
}

function buildAction(
  status: Action["status"],
): Action {
  const nowAccept = "2026-08-18T17:47:00+02:00";
  return {
    id: CANCELLATION_ACTION_ID,
    findingId: CANCELLATION_RECOVERY_ID,
    organizationId: ORG,
    locationId: LOC,
    title: "Offer Table 14 to waitlist party",
    description: "Match 3-guest waitlist to cancelled 20:00 inventory.",
    actionType: "waitlist_recovery_offer",
    status,
    expectedBenefit: 192,
    expectedNetBenefit: 192,
    currency: CURRENCY,
    preparedSummary:
      "Candidate ranked · Table 14 · 20:00 · party of 3 · expected €192 · GM approval.",
    requiredApproverRole: "GM",
    executionCapability: "DRAFT_ONLY",
    executionMode: "MANUAL",
    maxDelegationLevel: "EXECUTE_WITH_APPROVAL",
    targetSystem: "reservations",
    targetEntity: "res_t14_cancel",
    evidenceRefs: ["ev_cancel", "ev_wl"],
    reversible: true,
    createdBy: "radr_engine",
    createdAt: "2026-08-18T17:44:00+02:00",
    updatedAt: nowAccept,
    startedAt: status === "PROPOSED" ? null : nowAccept,
    completedAt:
      status === "COMPLETED" ? "2026-08-18T19:58:00+02:00" : null,
  };
}

function buildVerification(): Verification {
  return {
    id: CANCELLATION_VERIFICATION_ID,
    organizationId: ORG,
    locationId: LOC,
    findingId: CANCELLATION_RECOVERY_ID,
    actionId: CANCELLATION_ACTION_ID,
    expectedValue: 192,
    observedValue: 184,
    verifiedValue: 184,
    currency: CURRENCY,
    attribution: "RADR_RECOMMENDED",
    strength: "DIRECT",
    method: "Waitlist seated on Table 14 + POS close linked by table/time/covers",
    notes: "Conservative: claim observed €184, not potential €192.",
    evidenceIds: ["ev_res", "ev_wl", "ev_pos"],
    createdAt: "2026-08-18T21:37:00+02:00",
    updatedAt: "2026-08-18T21:37:00+02:00",
  };
}

export const CANCELLATION_TIMELINE: TimelineEvent[] = [
  {
    at: "2026-08-18T17:42:00+02:00",
    label: "Cancellation detected",
    kind: "detect",
  },
  {
    at: "2026-08-18T17:42:00+02:00",
    label: "€256 booking value exposed",
    kind: "quantify",
    amountMajor: 256,
    currency: CURRENCY,
  },
  {
    at: "2026-08-18T17:43:00+02:00",
    label: "Waitlist match identified",
    kind: "match",
    amountMajor: 192,
    currency: CURRENCY,
  },
  {
    at: "2026-08-18T17:44:00+02:00",
    label: "Recovery action recommended",
    kind: "recommend",
  },
  {
    at: "2026-08-18T17:47:00+02:00",
    label: "Action accepted",
    kind: "accept",
  },
  {
    at: "2026-08-18T19:58:00+02:00",
    label: "Replacement party seated",
    kind: "seat",
  },
  {
    at: "2026-08-18T21:36:00+02:00",
    label: "POS check closed",
    kind: "pos",
    amountMajor: 184,
    currency: CURRENCY,
  },
  {
    at: "2026-08-18T21:37:00+02:00",
    label: "€184 verified",
    kind: "verify",
    amountMajor: 184,
    currency: CURRENCY,
  },
];

export function buildCancellationRecoveryScenario(
  phase: CancellationRecoveryScenario["actionStatus"] = "VERIFIED",
): CancellationRecoveryScenario {
  const actionStatusMap: Record<
    CancellationRecoveryScenario["actionStatus"],
    Action["status"]
  > = {
    PROPOSED: "PROPOSED",
    ACCEPTED: "ACCEPTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    MONITORING: "COMPLETED",
    VERIFIED: "COMPLETED",
  };

  const timeline =
    phase === "PROPOSED"
      ? CANCELLATION_TIMELINE.filter((e) =>
          ["detect", "quantify", "match", "recommend"].includes(e.kind),
        )
      : phase === "ACCEPTED" || phase === "IN_PROGRESS"
        ? CANCELLATION_TIMELINE.filter((e) =>
            ["detect", "quantify", "match", "recommend", "accept"].includes(
              e.kind,
            ),
          )
        : phase === "COMPLETED" || phase === "MONITORING"
          ? CANCELLATION_TIMELINE.filter((e) => e.kind !== "verify" && e.kind !== "pos")
              .concat(CANCELLATION_TIMELINE.filter((e) => e.kind === "seat"))
          : CANCELLATION_TIMELINE;

  return {
    id: CANCELLATION_RECOVERY_ID,
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    environment: "DEMO",
    reservation: {
      id: "r_late",
      externalId: "ext_r_late",
      tableId: "t14",
      partySize: 4,
      serviceTime: "2026-08-18T20:00:00+02:00",
      cancelledAt: "2026-08-18T17:42:00+02:00",
      expectedBookingValueMajor: 256,
      currency: CURRENCY,
    },
    waitlist: {
      id: "wl_t14_match",
      partySize: 3,
      requestedFrom: "2026-08-18T19:45:00+02:00",
      requestedTo: "2026-08-18T20:15:00+02:00",
      expectedValueMajor: 192,
    },
    pos: {
      orderId: "pos_t14_replace",
      closedAt: "2026-08-18T21:36:00+02:00",
      observedRevenueMajor: 184,
    },
    potentialRecoverableMajor: 192,
    verifiedValueMajor: 184,
    timeline,
    finding: buildFinding(phase),
    action: buildAction(actionStatusMap[phase]),
    verification: phase === "VERIFIED" ? buildVerification() : null,
    actionStatus: phase,
  };
}

/** Money helpers for provenance display */
export function scenarioMoney(major: number, currency = CURRENCY) {
  return moneyFromMajor(major, currency);
}
