/**
 * Berlin Mitte - Active Revenue + Live Recovery demo fixture.
 * Hospitality-first: material recoveries + max 1-2 guest suggestions per table.
 */

import { CANCELLATION_RECOVERY_ID } from "@/lib/radr/scenarios/cancellationRecovery";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import {
  composeRecoveryPlan,
  prepareSocialEscalation,
} from "./plan";
import {
  composeSocialPreview,
  demoRecoveryTemplates,
  demoSocialProviders,
  demoSocialRecoveryRoi,
} from "./social";
import type {
  ActiveRevenueBrief,
  CancellationOpportunity,
  GuestOpportunity,
  RecoveryChannelPerf,
  GuestOpportunityPerf,
  RecoveryConfig,
  LiveRecoveryEvent,
} from "./types";

const ORG = "org_northstar";
const LOC = "loc_ber";
const SERVICE = "svc_ber_dinner_2026_08_19";

export function demoRecoveryConfig(): RecoveryConfig {
  return {
    noShow: {
      organizationId: ORG,
      locationId: LOC,
      serviceId: SERVICE,
      gracePeriodMinutes: 15,
      autoReleaseAfterGrace: false,
      automationLevel: "ASSISTED",
    },
    maxSocialPostsPerDay: 2,
    minSocialRecoveryValue: 150,
    minSocialPartySize: 4,
    socialCooldownMinutes: 90,
    socialPostsToday: 1,
    defaultBrandVoice: "PREMIUM",
  };
}

function enrich(
  base: Omit<CancellationOpportunity, "plan" | "socialPreview">,
): CancellationOpportunity {
  const social = prepareSocialEscalation(base)
    ? composeSocialPreview({
        time: base.reservationTime,
        partySize: base.partySize,
        locationName: base.locationName,
        template:
          base.trigger === "NO_SHOW"
            ? demoRecoveryTemplates().find((t) => t.id === "tpl_noshow_warm")
            : undefined,
      })
    : null;
  const plan = composeRecoveryPlan(base, {
    trigger: base.trigger,
    socialPreview: social,
  });
  return { ...base, plan, socialPreview: social };
}

/** TABLE OPENED - explicit cancellation · waitlist first · social prepared. */
function openCancellation(): CancellationOpportunity {
  return enrich({
    id: "ari_cancel_t8",
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    reservationId: "r_cancel_t8",
    tableId: "tbl_8",
    tableLabel: "Table 8",
    serviceId: SERVICE,
    reservationTime: "20:00",
    cancelledAt: "20:03",
    partySize: 4,
    trigger: "CANCELLATION",
    reservationState: "CANCELLED",
    originalExpectedRevenue: 184,
    originalExpectedContribution: 91,
    depositAmount: 0,
    cancellationFee: 40,
    remainingRevenueExposure: 184,
    replacementProbabilityPct: 71,
    waitlistMatches: [
      {
        id: "wl_01",
        partySize: 4,
        requestedFrom: "19:00",
        requestedTo: "20:00",
        returningGuest: true,
        acceptanceProbabilityPct: 72,
        label: "Party of 4 · returning",
      },
      {
        id: "wl_02",
        partySize: 3,
        requestedFrom: "19:15",
        requestedTo: "20:30",
        returningGuest: false,
        acceptanceProbabilityPct: 54,
        label: "Party of 3",
      },
      {
        id: "wl_03",
        partySize: 4,
        requestedFrom: "19:30",
        requestedTo: "21:00",
        returningGuest: false,
        acceptanceProbabilityPct: 48,
        label: "Party of 4",
      },
      {
        id: "wl_04",
        partySize: 2,
        requestedFrom: "19:00",
        requestedTo: "20:00",
        returningGuest: true,
        acceptanceProbabilityPct: 41,
        label: "Party of 2 · flexible",
      },
      {
        id: "wl_05",
        partySize: 5,
        requestedFrom: "19:00",
        requestedTo: "20:30",
        returningGuest: false,
        acceptanceProbabilityPct: 28,
        label: "Party of 5 · split possible",
      },
      {
        id: "wl_06",
        partySize: 4,
        requestedFrom: "20:00",
        requestedTo: "21:00",
        returningGuest: false,
        acceptanceProbabilityPct: 22,
        label: "Party of 4 · later window",
      },
    ],
    expectedWalkInDemand: 18,
    recoveryDeadline: "20:00",
    minutesToService: 27,
    recommendedStrategy: "WAITLIST",
    strategyWhy: [
      "Cancelled 2 min ago · 6 matching waitlist parties",
      "Best match returning guest · 72% estimated acceptance",
      "Do not post social yet - waitlist fill probability leads",
      "Instagram Story prepared if still open after 10 min",
    ],
    automationLevel: "ASSISTED",
    requiresApproval: true,
    status: "RECOVERY_ACTIVE",
    attentionPhase: "NEEDS_YOU",
    evidenceHref: `/app/findings/${CANCELLATION_RECOVERY_ID}`,
    actionHref: "/app/recover",
  });
}

/** NO-SHOW - past reservation + grace (policy-driven, not hardcoded in UI). */
function noShowRecovery(config: RecoveryConfig): CancellationOpportunity {
  const grace = config.noShow.gracePeriodMinutes;
  return enrich({
    id: "ari_noshow_t14",
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    reservationId: "r_noshow_t14",
    tableId: "tbl_14b",
    tableLabel: "Table 14",
    serviceId: SERVICE,
    reservationTime: "20:00",
    cancelledAt: null,
    partySize: 2,
    trigger: "NO_SHOW",
    reservationState: "NO_SHOW",
    minutesLate: grace,
    originalExpectedRevenue: 96,
    originalExpectedContribution: 48,
    depositAmount: 0,
    cancellationFee: 0,
    remainingRevenueExposure: 96,
    replacementProbabilityPct: 58,
    waitlistMatches: [
      {
        id: "wl_ns_01",
        partySize: 2,
        requestedFrom: "19:45",
        requestedTo: "20:30",
        returningGuest: true,
        acceptanceProbabilityPct: 68,
        label: "Party of 2 · returning",
      },
      {
        id: "wl_ns_02",
        partySize: 2,
        requestedFrom: "20:00",
        requestedTo: "21:00",
        returningGuest: false,
        acceptanceProbabilityPct: 51,
        label: "Party of 2",
      },
      {
        id: "wl_ns_03",
        partySize: 3,
        requestedFrom: "19:30",
        requestedTo: "20:30",
        returningGuest: false,
        acceptanceProbabilityPct: 34,
        label: "Party of 3 · flexible",
      },
    ],
    expectedWalkInDemand: 22,
    recoveryDeadline: "20:45",
    minutesToService: 0,
    recommendedStrategy: "WAITLIST",
    strategyWhy: [
      `${grace} min late · no check-in · grace period reached`,
      "3 waitlist matches · release table now recommended",
      "Social not primary - waitlist first",
    ],
    automationLevel: "ASSISTED",
    requiresApproval: true,
    status: "NO_SHOW_PENDING",
    attentionPhase: "NEEDS_YOU",
    evidenceHref: "/app/recover",
    actionHref: "/app/recover",
  });
}

/** RADR already offering waitlist - not in needs-you queue. */
function handlingRecovery(): CancellationOpportunity {
  return enrich({
    id: "ari_cancel_t16_handling",
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    reservationId: "r_cancel_t16",
    tableId: "tbl_16",
    tableLabel: "Table 16",
    serviceId: SERVICE,
    reservationTime: "19:45",
    cancelledAt: "19:20",
    partySize: 3,
    trigger: "CANCELLATION",
    reservationState: "RECOVERY_ACTIVE",
    originalExpectedRevenue: 142,
    originalExpectedContribution: 70,
    depositAmount: 0,
    cancellationFee: 0,
    remainingRevenueExposure: 142,
    replacementProbabilityPct: 64,
    waitlistMatches: [
      {
        id: "wl_h_01",
        partySize: 3,
        requestedFrom: "19:30",
        requestedTo: "20:30",
        returningGuest: false,
        acceptanceProbabilityPct: 61,
        label: "Party of 3 · offer sent",
      },
    ],
    expectedWalkInDemand: 14,
    recoveryDeadline: "19:45",
    minutesToService: 0,
    recommendedStrategy: "WAITLIST",
    strategyWhy: ["Waitlist offer sent · 3 min remaining on response window"],
    automationLevel: "ASSISTED",
    requiresApproval: false,
    status: "WAITLIST",
    attentionPhase: "HANDLING",
    evidenceHref: "/app/recover",
    actionHref: "/app/recover",
  });
}

function walkInHoldOpportunity(): CancellationOpportunity {
  return enrich({
    id: "ari_cancel_t22",
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    reservationId: "r_cancel_t22",
    tableId: "tbl_22",
    tableLabel: "Table 22",
    serviceId: SERVICE,
    reservationTime: "20:15",
    cancelledAt: "19:40",
    partySize: 2,
    trigger: "CANCELLATION",
    reservationState: "CANCELLED",
    originalExpectedRevenue: 96,
    originalExpectedContribution: 48,
    depositAmount: 0,
    cancellationFee: 0,
    remainingRevenueExposure: 96,
    replacementProbabilityPct: 62,
    waitlistMatches: [],
    expectedWalkInDemand: 31,
    recoveryDeadline: "20:15",
    minutesToService: 12,
    recommendedStrategy: "WALK_IN_HOLD",
    strategyWhy: [
      "Expected walk-ins 31 · seats opened 2",
      "Hold for walk-ins · expected contribution €210,00 path beats promotional recovery",
      "Do not promote - social not justified",
    ],
    automationLevel: "MANUAL",
    requiresApproval: false,
    status: "DETECTED",
    attentionPhase: "HANDLING",
    evidenceHref: "/app/recover",
    actionHref: "/app/recover",
  });
}

function verifiedFromScenario(): CancellationOpportunity {
  const scenario = getCancellationRecoveryScenario();
  return enrich({
    id: "ari_cancel_t14_verified",
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    reservationId: scenario.reservation.id,
    tableId: scenario.reservation.tableId,
    tableLabel: "Table 14",
    serviceId: SERVICE,
    reservationTime: "20:00",
    cancelledAt: "17:42",
    partySize: scenario.reservation.partySize,
    trigger: "CANCELLATION",
    reservationState: "REBOOKED",
    originalExpectedRevenue: scenario.reservation.expectedBookingValueMajor,
    originalExpectedContribution: 128,
    depositAmount: 0,
    cancellationFee: 0,
    remainingRevenueExposure: 0,
    replacementProbabilityPct: 100,
    waitlistMatches: [
      {
        id: scenario.waitlist.id,
        partySize: scenario.waitlist.partySize,
        requestedFrom: "19:45",
        requestedTo: "20:30",
        returningGuest: false,
        acceptanceProbabilityPct: 90,
        label: "Waitlist match · seated",
      },
    ],
    expectedWalkInDemand: 0,
    recoveryDeadline: "20:00",
    minutesToService: 0,
    recommendedStrategy: "WAITLIST",
    strategyWhy: ["Waitlist rebooked · POS observed · verified"],
    automationLevel: "ASSISTED",
    requiresApproval: false,
    status: "VERIFIED",
    attentionPhase: "HANDLED",
    recoveryChannel: "WAITLIST",
    replacementActualSpend: scenario.pos.observedRevenueMajor,
    verifiedRecoveredValue: scenario.verifiedValueMajor,
    verifiedContribution: 91,
    recoveredInMinutes: 11,
    evidenceHref: `/app/findings/${CANCELLATION_RECOVERY_ID}`,
    actionHref: "/app/value",
  });
}

function liveEvents(): LiveRecoveryEvent[] {
  return [
    {
      id: "le_01",
      at: "20:03",
      kind: "cancellation_detected",
      label: "Table 8 cancelled",
      opportunityId: "ari_cancel_t8",
      tone: "attention",
    },
    {
      id: "le_02",
      at: "20:00",
      kind: "no_show_eligible",
      label: "Table 14 no-show detected",
      opportunityId: "ari_noshow_t14",
      tone: "attention",
    },
    {
      id: "le_03",
      at: "19:58",
      kind: "recovered",
      label: "Table 14 recovered · waitlist",
      opportunityId: "ari_cancel_t14_verified",
      tone: "ready",
    },
    {
      id: "le_04",
      at: "19:42",
      kind: "waitlist_offered",
      label: "Table 16 waitlist offer sent",
      opportunityId: "ari_cancel_t16_handling",
      tone: "watch",
    },
    {
      id: "le_05",
      at: "20:08",
      kind: "no_show_pending",
      label: "Table 11 · 8 min late · not released",
      tone: "watch",
    },
  ];
}

function guestOpportunities(): GuestOpportunity[] {
  return [
    {
      id: "ari_go_t18_champagne",
      guestId: null,
      guestLabel: null,
      reservationId: "r_anniv",
      tableId: "tbl_18",
      tableLabel: "Table 18",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "PAIRING",
      suggestion: "Champagne pairing",
      reason: [
        "Anniversary",
        "Ordered Champagne on 2 of last 3 visits",
        "Pairing available tonight",
      ],
      recommendedTiming: "arrival",
      timingLabel: "After seating",
      occasionLabel: "Anniversary",
      returningGuest: true,
      expectedIncrementalRevenue: 84,
      expectedIncrementalContribution: 42,
      confidence: "high",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
    {
      id: "ari_go_t9_dessert",
      guestId: "gst_sophie",
      guestLabel: "Sophie Laurent party",
      reservationId: "r_sophie",
      tableId: "tbl_9",
      tableLabel: "Table 9",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "CELEBRATION_ADD_ON",
      suggestion: "Birthday dessert presentation",
      reason: [
        "Birthday",
        "Quiet table preferred - keep celebration discreet",
        "Kitchen can plate after mains",
      ],
      recommendedTiming: "after_mains",
      timingLabel: "After mains",
      occasionLabel: "Birthday",
      returningGuest: true,
      expectedIncrementalRevenue: 48,
      expectedIncrementalContribution: 28,
      confidence: "high",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
    {
      id: "ari_go_t21_burgundy",
      guestId: "gst_daniel",
      guestLabel: "Daniel Weber",
      reservationId: "r_daniel",
      tableId: "tbl_21",
      tableLabel: "Table 21",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "WINE",
      suggestion: "New Burgundy by the glass",
      reason: [
        "Returning guest · 7 visits",
        "Past preference: Burgundy",
        "By-the-glass available tonight",
      ],
      recommendedTiming: "menu_selection",
      timingLabel: "At menu",
      returningGuest: true,
      expectedIncrementalRevenue: 36,
      expectedIncrementalContribution: 22,
      confidence: "high",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
    {
      id: "ari_go_t7_sharing",
      guestId: null,
      guestLabel: null,
      reservationId: "r_bday7",
      tableId: "tbl_7",
      tableLabel: "Table 7",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "SHARING_STARTER",
      suggestion: "Sharing starters for the table",
      reason: [
        "Party of 6",
        "Birthday · communal start fits the table",
        "Prep capacity calm for this course",
      ],
      recommendedTiming: "menu_selection",
      timingLabel: "At menu",
      occasionLabel: "Birthday",
      expectedIncrementalRevenue: 72,
      expectedIncrementalContribution: 38,
      confidence: "medium",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
    {
      id: "ari_go_t3_aperitif",
      guestId: null,
      guestLabel: null,
      reservationId: "r_engagement",
      tableId: "tbl_3",
      tableLabel: "Table 3",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "APERITIF",
      suggestion: "Celebratory aperitif",
      reason: [
        "Engagement",
        "Two-top · arrival moment",
        "No allergy flags on this booking",
      ],
      recommendedTiming: "arrival",
      timingLabel: "On arrival",
      occasionLabel: "Engagement",
      expectedIncrementalRevenue: 44,
      expectedIncrementalContribution: 26,
      confidence: "medium",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
    {
      id: "ari_go_t5_wine",
      guestId: null,
      guestLabel: null,
      reservationId: "r_bday5",
      tableId: "tbl_5",
      tableLabel: "Table 5",
      locationId: LOC,
      serviceId: SERVICE,
      opportunityType: "WINE",
      suggestion: "House sparkling to open",
      reason: ["Birthday · party of 4", "Light start before tasting"],
      recommendedTiming: "arrival",
      timingLabel: "On arrival",
      occasionLabel: "Birthday",
      expectedIncrementalRevenue: 52,
      expectedIncrementalContribution: 30,
      confidence: "medium",
      safetyClear: true,
      inventoryAvailable: true,
      status: "SUGGESTED",
    },
  ];
}

/**
 * Rank guest opportunities · max 1 per table · relevance before margin.
 */
export function rankGuestOpportunities(
  all: GuestOpportunity[],
  max = 6,
): GuestOpportunity[] {
  const safe = all.filter((g) => g.safetyClear && g.inventoryAvailable);
  const byTable = new Map<string, GuestOpportunity>();
  const scored = [...safe].sort((a, b) => {
    const conf = { high: 3, medium: 2, low: 1 };
    const score =
      conf[b.confidence] * 1000 +
      b.expectedIncrementalContribution -
      (conf[a.confidence] * 1000 + a.expectedIncrementalContribution);
    return score;
  });
  for (const g of scored) {
    if (!byTable.has(g.tableId)) byTable.set(g.tableId, g);
  }
  return [...byTable.values()]
    .sort(
      (a, b) =>
        b.expectedIncrementalContribution - a.expectedIncrementalContribution,
    )
    .slice(0, max);
}

function channelPerf(): RecoveryChannelPerf[] {
  return [
    {
      channel: "WAITLIST",
      label: "Waitlist",
      attempts: 42,
      fillRatePct: 71,
      avgRecoveryMinutes: 8,
      verifiedRevenue: 8420,
    },
    {
      channel: "RESERVATION_INVENTORY",
      label: "Marketplace",
      attempts: 18,
      fillRatePct: 44,
      avgRecoveryMinutes: 22,
      verifiedRevenue: 3120,
    },
    {
      channel: "DIRECT_GUEST",
      label: "Direct",
      attempts: 11,
      fillRatePct: 36,
      avgRecoveryMinutes: 15,
      verifiedRevenue: 1680,
    },
    {
      channel: "SOCIAL",
      label: "Social",
      attempts: 23,
      fillRatePct: 48,
      avgRecoveryMinutes: 14,
      verifiedRevenue: 2840,
    },
    {
      channel: "WALK_IN_HOLD",
      label: "Walk-in",
      attempts: 24,
      fillRatePct: 58,
      avgRecoveryMinutes: 0,
      verifiedRevenue: 2680,
    },
  ];
}

function opportunityPerf(): GuestOpportunityPerf[] {
  return [
    {
      opportunityType: "PAIRING",
      label: "Wine / Champagne pairing",
      relevantTables: 84,
      offered: 62,
      accepted: 28,
      verifiedIncrementalContribution: 1860,
    },
    {
      opportunityType: "APERITIF",
      label: "Aperitif",
      relevantTables: 96,
      offered: 70,
      accepted: 31,
      verifiedIncrementalContribution: 1240,
    },
    {
      opportunityType: "CELEBRATION_ADD_ON",
      label: "Celebration add-ons",
      relevantTables: 40,
      offered: 34,
      accepted: 22,
      verifiedIncrementalContribution: 980,
    },
    {
      opportunityType: "SHARING_STARTER",
      label: "Sharing starters",
      relevantTables: 52,
      offered: 38,
      accepted: 19,
      verifiedIncrementalContribution: 740,
    },
  ];
}

export function demoBerlinActiveRevenue(): ActiveRevenueBrief {
  const config = demoRecoveryConfig();
  const open = openCancellation();
  const noShow = noShowRecovery(config);
  const handling = handlingRecovery();
  const walkIn = walkInHoldOpportunity();
  const verified = verifiedFromScenario();
  const guests = rankGuestOpportunities(guestOpportunities(), 6);

  const recoveryExposure =
    open.remainingRevenueExposure + noShow.remainingRevenueExposure;
  const guestPotential = guests.reduce(
    (s, g) => s + g.expectedIncrementalContribution,
    0,
  );

  return {
    organizationId: ORG,
    locationId: LOC,
    locationName: "Berlin Mitte",
    serviceLabel: "Dinner",
    businessDate: "2026-08-19",
    asOf: "2026-08-19T20:05:00+02:00",
    illustrative: true,
    currency: "EUR",
    recoveries: [open, noShow, handling, walkIn, verified],
    guestOpportunities: guests,
    fohPrompts: guests.slice(0, 4),
    rollup: {
      tonightPotential: Math.round((recoveryExposure + guestPotential) * 100) / 100,
      recoveryCount: 2,
      guestOpportunityCount: guests.length,
      monthCancellationAtRisk: 18420,
      monthCancellationRecovered: 14880,
      monthRecoveryRatePct: 80.8,
      monthGuestVerified: 6420,
      monthCombinedVerified: 21300,
    },
    channelPerformance: channelPerf(),
    opportunityPerformance: opportunityPerf(),
    inventoryProviders: [
      {
        id: "sevenrooms",
        name: "SevenRooms",
        canReleaseInventory: false,
        canOfferWaitlist: true,
        canCreateHold: false,
        canUpdateAvailability: false,
        canTrackRebooking: true,
        status: "partner_access",
      },
      {
        id: "opentable",
        name: "OpenTable",
        canReleaseInventory: false,
        canOfferWaitlist: true,
        canCreateHold: false,
        canUpdateAvailability: false,
        canTrackRebooking: true,
        status: "partner_access",
      },
    ],
    config,
    socialProviders: demoSocialProviders(),
    templates: demoRecoveryTemplates(),
    liveEvents: liveEvents(),
    socialRoi: demoSocialRecoveryRoi(),
    perishableInventory: [],
  };
}
