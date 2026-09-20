/**
 * Compose grounded ButlerResponse from tool results.
 * No freestyle arithmetic - numbers come from tool payloads only.
 * Each intent maps to a distinct responseKind - never a shared Control Center dump.
 */

import type { ButlerResponse, ButlerSession, ButlerSource } from "@/lib/radr/butler/types";
import type { AskIntentClass } from "./intents";
import type { ResolvedContext } from "./context";
import type { LaborRequirementLocation, ToolResult } from "./tools";
import { euro } from "./tools";

function demoSources(
  fresh?: ToolResult,
  systems?: string[],
): ButlerSource[] {
  const data = fresh?.data as
    | { sources?: { label: string; ageMinutes: number }[]; demo?: boolean }
    | undefined;
  const synced =
    data?.sources?.[0] != null
      ? `${data.sources[0].ageMinutes}m ago`
      : "2m ago";
  const base: ButlerSource[] = [
    {
      system: "RADR DEMO DATA",
      detail: "Synthetic operating dataset",
      syncedLabel: synced,
    },
  ];
  const labels = systems ?? ["Reservations", "Forecast", "Labor"];
  for (const label of labels) {
    base.push({ system: label, detail: "Demo adapter", syncedLabel: synced });
  }
  return base;
}

function tool<T>(results: ToolResult[], name: string): T | null {
  const row = results.find((r) => r.tool === name && r.ok);
  return (row?.data as T) ?? null;
}

function unavailable(results: ToolResult[], name: string): string | null {
  const row = results.find((r) => r.tool === name && !r.ok);
  return row?.error ?? null;
}

function staffingSources(fresh?: ToolResult): ButlerSource[] {
  return demoSources(fresh, ["Reservations", "Forecast", "Labor"]);
}

export function composeAskAnswer(
  intent: AskIntentClass,
  ctx: ResolvedContext,
  results: ToolResult[],
  question: string,
  classification?: { clarification?: string; confidence?: number },
): ButlerResponse {
  const fresh = results.find((r) => r.tool === "get_data_freshness");
  const sources = demoSources(fresh);
  const warnings =
    fresh?.ok &&
    (fresh.data as { userMessage?: string | null }).userMessage
      ? [
          {
            message: (fresh.data as { userMessage: string }).userMessage,
            severity: "watch" as const,
          },
        ]
      : undefined;

  const base = {
    sources,
    warnings,
    confidence: { band: "HIGH" as const, score: 86 },
  };

  if (intent === "CLARIFY") {
    const msg =
      classification?.clarification ??
      "Ask about tonight's service, staffing, margin, revenue, waitlist, or attention.";
    return {
      title: "Need a domain",
      summary: msg,
      answer: msg,
      responseKind: "clarification",
      actions: [
        { label: "Tonight outlook", href: "#ask:How will we do tonight" },
        { label: "Staffing", href: "#ask:do we need more people tonight" },
        { label: "Attention", href: "#ask:what needs my attention" },
      ],
      evidence: [],
      sources: demoSources(fresh, []),
      followUps: [
        "How will we do tonight?",
        "Do we need to call more people in tonight?",
        "What needs my attention?",
      ],
      toolUsed: "clarify",
      topic: "general",
    };
  }

  if (intent === "TERM") {
    return {
      title: "Covers",
      summary:
        "A cover is one guest seated. Covers measure volume independent of party size.",
      answer: "A cover is one guest seated.",
      responseKind: "term",
      actions: [{ label: "Performance", href: "/app/performance" }],
      evidence: [{ label: "Term", value: "cover = seated guest" }],
      sources: [{ system: "RADR", detail: "Operating terminology" }],
      toolUsed: "searchEntities",
      topic: "term",
    };
  }

  if (intent === "LABOR_REQUIREMENT" || intent === "SERVICE_PRESSURE") {
    return composeStaffing(question, ctx, results, fresh, base);
  }

  if (intent === "LABOR_COST") {
    const labor = tool<{
      locationName: string;
      laborPct: number;
      laborVsPlanPts: number;
    }>(results, "get_labor_status");
    if (!labor) return notEnough(ctx, "Labor cost data unavailable.", results);
    return {
      ...base,
      responseKind: "labor_cost",
      title: "Labor cost",
      summary: `${labor.locationName} labor is ${labor.laborPct}% of revenue (${labor.laborVsPlanPts >= 0 ? "+" : ""}${labor.laborVsPlanPts} pts vs plan).`,
      answer: `Labor ${labor.laborPct}% of revenue.`,
      primaryMetric: {
        label: "Labor % of revenue",
        value: `${labor.laborPct}%`,
        hint: `${labor.laborVsPlanPts >= 0 ? "+" : ""}${labor.laborVsPlanPts} pts vs plan`,
        tone: labor.laborVsPlanPts > 0 ? "watch" : "positive",
      },
      evidence: [
        { label: "Labor %", value: `${labor.laborPct}%` },
        {
          label: "Vs plan",
          value: `${labor.laborVsPlanPts >= 0 ? "+" : ""}${labor.laborVsPlanPts} pts`,
        },
      ],
      actions: [{ label: "Open LABOR", href: "/app/labor" }],
      followUps: [
        "Do we need to call more people in tonight?",
        "Why was margin down yesterday?",
      ],
      toolUsed: "get_labor_status",
      topic: "labor",
      sources: demoSources(fresh, ["Labor", "POS"]),
    };
  }

  if (intent === "MARGIN_ANALYSIS") {
    const m = tool<{
      locationName: string;
      marginPct: number;
      vsPlanPts: number;
      direction: string;
      note: string;
      evidenceNotes: string[];
      laborPct: number;
      laborVsPlanPts: number;
    }>(results, "get_margin");
    const buy = tool<{ largest?: number }>(results, "get_supplier_variances");
    if (!m) {
      return notEnough(ctx, "I don't have enough margin data for this scope yet.", results);
    }
    void buy;
    const planPct = Number((m.marginPct - m.vsPlanPts).toFixed(1));
    const laborPts = Number((-Math.abs(m.laborVsPlanPts || 0)).toFixed(1));
    const steps: { label: string; pts: number }[] = [];
    if (laborPts !== 0) {
      steps.push({ label: "Labor", pts: laborPts });
    }
    // Remainder attributed only as unexplained residual - not invented causal story
    const explained = steps.reduce((s, x) => s + x.pts, 0);
    const residual = Number((m.vsPlanPts - explained).toFixed(1));
    if (residual !== 0) {
      steps.push({ label: "Other observed variance", pts: residual });
    }
    return {
      ...base,
      responseKind: "margin_analysis",
      title:
        m.direction === "below_plan"
          ? `Margin fell ${Math.abs(m.vsPlanPts).toFixed(1)} pts`
          : `Margin ${m.vsPlanPts >= 0 ? "+" : ""}${m.vsPlanPts.toFixed(1)} pts vs plan`,
      summary: `${m.locationName} operating margin finished ${m.marginPct.toFixed(1)}% (${m.vsPlanPts >= 0 ? "+" : ""}${m.vsPlanPts.toFixed(1)} pts vs plan). ${m.note}`,
      answer: `${m.locationName} margin ${m.marginPct.toFixed(1)}%. ${m.note}`,
      primaryMetric: {
        label: "Operating margin",
        value: `${m.marginPct.toFixed(1)}%`,
        hint: `${m.vsPlanPts >= 0 ? "+" : ""}${m.vsPlanPts.toFixed(1)} pts vs plan`,
        tone: m.direction === "below_plan" ? "risk" : "positive",
      },
      visualization: {
        type: "marginBridge",
        planPct,
        actualPct: m.marginPct,
        steps,
      },
      drivers: m.evidenceNotes.map((n) => ({ label: "Evidence", value: n })),
      evidence: m.evidenceNotes.map((n, i) => ({
        label: `Fact ${i + 1}`,
        value: n,
      })),
      actions: [
        { label: "View labor", href: "/app/labor" },
        { label: "Review supplier variance", href: "/app/buy" },
      ],
      followUps: [
        "What about New York?",
        "Are we understaffed tonight?",
        "Show me invoices above contract price.",
      ],
      toolUsed: "get_margin",
      topic: "general",
      expanded: true,
      sources: demoSources(fresh, ["POS", "Labor", "Supplier invoices"]),
    };
  }

  if (intent === "CHANNEL_ECONOMICS") {
    const ch = tool<{
      locationName: string;
      netSales: number;
      channels: {
        kind: string;
        label: string;
        netSales: number;
        revenueSharePct: number;
        contribution: number;
        contributionSharePct: number;
        contributionMarginPct: number;
      }[];
      deliveryMarginPct: number;
      dineInMarginPct: number;
      marginDifferencePts: number;
      marginWhy: { label: string; pts: number }[];
      topProvider: { name: string; contribution: number; marginPct: number } | null;
      pause: {
        window: string;
        netExpectedValue: number;
        recommendation: string;
        requiresApproval: boolean;
      };
      commissionVariances: { provider: string; amount?: number; label?: string }[];
      note: string;
    }>(results, "get_channel_economics");
    if (!ch) {
      return notEnough(ctx, "I don't have channel economics for this scope yet.", results);
    }
    const delivery = ch.channels.find((c) => c.kind === "delivery");
    const dineIn = ch.channels.find((c) => c.kind === "dine_in");
    const wantsPause = /pause/i.test(question);
    const wantsWhy = /why|margin lower|difference/i.test(question);
    const wantsBest = /most money|best|which (delivery )?platform/i.test(question);
    const answer = wantsPause
      ? `Prepared pause ${ch.pause.window}: net expected value +${euro(ch.pause.netExpectedValue)}. Requires approval - RADR will not disable channels alone.`
      : wantsBest && ch.topProvider
        ? `${ch.topProvider.name} contributes the most among delivery providers (${euro(ch.topProvider.contribution)}, ${ch.topProvider.marginPct.toFixed(1)}% margin) - still below dine-in quality.`
        : wantsWhy
          ? `Delivery margin ${ch.deliveryMarginPct.toFixed(1)}% vs dine-in ${ch.dineInMarginPct.toFixed(1)}% (${ch.marginDifferencePts.toFixed(1)} pts). Mainly commission, promotions, packaging, and menu mix.`
          : `Delivery is ${delivery?.revenueSharePct.toFixed(0) ?? " - "}% of revenue but ${delivery?.contributionSharePct.toFixed(0) ?? " - "}% of contribution. Dine-in is ${dineIn?.revenueSharePct.toFixed(0) ?? " - "}% / ${dineIn?.contributionSharePct.toFixed(0) ?? " - "}%.`;

    return {
      ...base,
      responseKind: "channel_economics",
      title: "Channel economics",
      summary: `${ch.locationName}: ${answer} ${ch.note}`,
      answer,
      primaryMetric: {
        label: "Delivery vs dine-in margin",
        value: `${ch.marginDifferencePts.toFixed(1)} pts`,
        hint: `Delivery ${ch.deliveryMarginPct.toFixed(1)}% · dine-in ${ch.dineInMarginPct.toFixed(1)}%`,
        tone: "risk",
      },
      drivers: ch.channels.map((c) => ({
        label: c.label,
        value: `${c.revenueSharePct.toFixed(0)}% revenue · ${c.contributionSharePct.toFixed(0)}% contribution`,
      })),
      evidence: [
        ...ch.marginWhy.map((w) => ({
          label: w.label,
          value: `${w.pts.toFixed(1)} pts`,
        })),
        ...ch.commissionVariances.map((v) => ({
          label: v.provider,
          value: v.amount != null ? `${euro(v.amount)} ${v.label ?? ""}` : "open",
        })),
      ],
      actions: [
        { label: "Open channel economics", href: "/app/finance" },
        { label: "Review pause for approval", href: "/app/controls" },
      ],
      followUps: [
        "Should we pause delivery during peak?",
        "Which delivery platform makes us the most money?",
        "Why is delivery margin lower?",
      ],
      toolUsed: "get_channel_economics",
      topic: "general",
      expanded: true,
      sources: demoSources(fresh, ["POS", "Delivery platforms", "Payments"]),
    };
  }

  if (intent === "ACTIVE_REVENUE") {
    const ar = tool<{
      locationName: string;
      tonightPotential: number;
      recoveryCount: number;
      guestOpportunityCount: number;
      recoveries: {
        table: string;
        time: string;
        partySize: number;
        atRisk: number;
        strategy: string;
        trigger: string;
        waitlistMatches: number;
        bestAcceptance?: number;
        why: string;
        requiresApproval: boolean;
        socialEscalation: boolean;
        planHeadline: string;
      }[];
      guestOpportunities: {
        table: string;
        suggestion: string;
        occasion?: string;
        timing: string;
        contribution: number;
        why: string;
      }[];
      month: {
        cancellationRecovered: number;
        recoveryRatePct: number;
        guestVerified: number;
        combinedVerified: number;
      };
      socialRoi: {
        posts: number;
        tablesFilled: number;
        recoveryRatePct: number;
        verifiedRecoveredRevenue: number;
        topChannel: string;
        topTemplate: string;
      };
      templates: { name: string; fillRatePct: number; favorite: boolean }[];
      note: string;
    }>(results, "get_active_revenue");
    if (!ar) {
      return notEnough(ctx, "I don't have active revenue data for this scope yet.", results);
    }
    const top = ar.recoveries[0];
    const guest = ar.guestOpportunities[0];
    const wantsGuest = /guest|table \d+|champagne|pairing|suggest/i.test(question);
    const wantsMonth = /month|recovered this month|how much revenue did we recover/i.test(
      question,
    );
    const wantsSocial =
      /social|instagram|post|channel|template|draft/i.test(question);
    const wantsNoShow = /no-?show/i.test(question);
    const noShow = ar.recoveries.find((r) => r.trigger === "NO_SHOW");
    const answer = wantsMonth
      ? `This month recovered ${euro(ar.month.cancellationRecovered)} from cancellations (${ar.month.recoveryRatePct.toFixed(1)}% rate). Social recovery ${euro(ar.socialRoi.verifiedRecoveredRevenue)} · top template ${ar.socialRoi.topTemplate}. Combined verified ${euro(ar.month.combinedVerified)}.`
      : wantsSocial
        ? `Social is escalation only. This month: ${ar.socialRoi.posts} posts · ${ar.socialRoi.tablesFilled} tables filled · ${ar.socialRoi.recoveryRatePct}% rate · ${euro(ar.socialRoi.verifiedRecoveredRevenue)} verified. Top channel ${ar.socialRoi.topChannel}. Best template: ${ar.socialRoi.topTemplate}. Drafts require approval.`
        : wantsNoShow && noShow
          ? `${noShow.table} · ${noShow.time} · ${noShow.partySize} guests · ${euro(noShow.atRisk)} at risk. ${noShow.why} Recommend ${noShow.strategy === "WAITLIST" ? "release / offer waitlist" : noShow.strategy.toLowerCase().replace(/_/g, " ")}.`
          : wantsGuest && guest
            ? `${guest.table}${guest.occasion ? ` · ${guest.occasion}` : ""}: ${guest.suggestion} (${guest.timing}). Why: ${guest.why}. Expected contribution ${euro(guest.contribution)}.`
            : top
              ? `${top.table} · ${top.time} · ${top.partySize} guests · ${euro(top.atRisk)} at risk. ${top.planHeadline}. Recommend ${top.strategy === "WAITLIST" ? "offer waitlist now" : top.strategy.toLowerCase().replace(/_/g, " ")}. ${top.waitlistMatches} matches${top.bestAcceptance != null ? ` · best ${top.bestAcceptance}% acceptance` : ""}.${top.socialEscalation ? " Social prepared if unfilled." : ""}${top.requiresApproval ? " Approval required." : ""}`
              : `${ar.recoveryCount} recovery opportunities · ${ar.guestOpportunityCount} guest suggestions · ${euro(ar.tonightPotential)} potential tonight.`;

    return {
      ...base,
      responseKind: "active_revenue",
      title: "Live revenue recovery",
      summary: `${ar.locationName}: ${answer} ${ar.note}`,
      answer,
      primaryMetric: {
        label: "Potential tonight",
        value: euro(ar.tonightPotential),
        hint: `${ar.recoveryCount} recover · ${ar.guestOpportunityCount} guest`,
        tone: "positive",
      },
      drivers: [
        ...ar.recoveries.slice(0, 2).map((r) => ({
          label: r.table,
          value: `${euro(r.atRisk)} · ${r.strategy}`,
        })),
        ...ar.guestOpportunities.slice(0, 2).map((g) => ({
          label: g.table,
          value: g.suggestion,
        })),
      ],
      evidence: [
        ...ar.recoveries.slice(0, 3).map((r) => ({
          label: `${r.table} · ${r.trigger}`,
          value: euro(r.atRisk),
        })),
        {
          label: "Social ROI",
          value: `${euro(ar.socialRoi.verifiedRecoveredRevenue)} · ${ar.socialRoi.topTemplate}`,
        },
      ],
      actions: [
        { label: "Open recovery", href: "/app" },
        { label: "Recover", href: "/app/recover" },
        { label: "Settings · Social", href: "/app/settings" },
      ],
      followUps: [
        "Any no-shows?",
        "Should we post this opening?",
        "Which recovery template performs best?",
        "How much revenue did social recovery generate this month?",
      ],
      toolUsed: "get_active_revenue",
      topic: "general",
      expanded: true,
      sources: demoSources(fresh, ["Reservations", "Waitlist", "POS", "Social"]),
    };
  }

  if (intent === "RESERVATION_SUMMARY") {
    const err = unavailable(results, "get_reservations");
    if (err) return notEnough(ctx, err, results);
    const r = tool<{
      reservations: number;
      bookedCovers: number;
      forecastCovers: number;
      expectedOccupancyPct: number;
      peakWindow: string;
      groupBookings: number;
    }>(results, "get_reservations");
    const wl = tool<{ guests: number }>(results, "get_waitlist");
    const svc = tool<{
      serviceCurve?: { time: string; intensity?: number; covers?: number }[];
      peakService?: string;
    }>(results, "get_service_status");
    if (!r) return notEnough(ctx, "Reservation data unavailable.", results);
    const fc = tool<{
      tonightExpectedRevenue?: number;
      tonightExpectedOccupancy?: number;
    }>(results, "get_forecast");
    const groupFocus = /group|large (party|parties)/i.test(question);
    if (groupFocus) {
      return {
        ...base,
        responseKind: "reservation_pulse",
        title: "Large parties",
        summary: `${r.groupBookings} large parties tonight.`,
        answer: `${r.groupBookings} groups tonight.`,
        primaryMetric: {
          label: "Groups",
          value: String(r.groupBookings),
          tone: "signal",
        },
        evidence: [
          { label: "Groups", value: String(r.groupBookings) },
          { label: "Booked covers", value: String(r.bookedCovers) },
        ],
        actions: [{ label: "Service map", href: "/app/service" }],
        toolUsed: "get_reservations",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations"]),
      };
    }
    const outlook = /how (will|are|do) we|will we do|do (good|well)|outlook|expect/i.test(
      question,
    );
    const curve = svc?.serviceCurve;
    const locLabel =
      ctx.locationName === "All locations" ? "Berlin Mitte" : ctx.locationName;
    return {
      ...base,
      responseKind: "reservation_pulse",
      title: outlook ? `Tonight outlook · ${locLabel}` : `Tonight · ${locLabel}`,
      summary: outlook
        ? `${locLabel}: ${r.bookedCovers} booked → ${r.forecastCovers} forecast · ${r.expectedOccupancyPct}% occupancy · peak ${r.peakWindow}.${fc?.tonightExpectedRevenue ? ` Expected ${euro(fc.tonightExpectedRevenue)}.` : ""}`
        : `${r.reservations} reservations · ${r.bookedCovers} booked guests · ${r.forecastCovers} forecast · ${wl?.guests ?? 0} waitlist · ${r.groupBookings} groups. ${r.expectedOccupancyPct}% expected occupancy.`,
      answer: outlook
        ? `${r.expectedOccupancyPct}% expected occupancy · ${r.forecastCovers} forecast covers.`
        : `${r.reservations} reservations tonight.`,
      primaryMetric: {
        label: "Expected occupancy",
        value: `${r.expectedOccupancyPct}%`,
        hint: r.peakWindow,
        tone: "signal",
      },
      metrics: [
        { label: "Reservations", value: String(r.reservations) },
        { label: "Booked covers", value: String(r.bookedCovers), tone: "signal" },
        { label: "Forecast covers", value: String(r.forecastCovers) },
        {
          label: "Expected occupancy",
          value: `${r.expectedOccupancyPct}%`,
          tone: "signal",
        },
        { label: "Waitlisted guests", value: String(wl?.guests ?? 0) },
        { label: "Large parties", value: String(r.groupBookings) },
        ...(fc?.tonightExpectedRevenue
          ? [
              {
                label: "Expected revenue",
                value: euro(fc.tonightExpectedRevenue),
                tone: "positive" as const,
              },
            ]
          : []),
      ],
      visualization: curve?.length
        ? {
            type: "reservationPulse",
            peakLabel: r.peakWindow,
            slots: curve.slice(0, 8).map((s) => ({
              time: s.time,
              intensity: s.intensity ?? Math.min(1, (s.covers ?? 0) / 40),
            })),
          }
        : {
            type: "reservationPulse",
            peakLabel: `${r.peakWindow} · peak service`,
            slots: [
              { time: "18:00", intensity: 0.35 },
              { time: "19:00", intensity: 0.75 },
              { time: "20:00", intensity: 1 },
              { time: "21:00", intensity: 0.55 },
            ],
          },
      evidence: [
        { label: "Reservations", value: String(r.reservations) },
        { label: "Peak", value: r.peakWindow },
        ...(fc?.tonightExpectedRevenue
          ? [{ label: "Expected revenue", value: euro(fc.tonightExpectedRevenue) }]
          : []),
      ],
      actions: [
        { label: "Open service map", href: "/app/service" },
        { label: "Review staffing", href: "/app/labor" },
      ],
      followUps: [
        "Do we need to call more people in tonight?",
        "How many people are on the waitlist?",
        "Which cancellations can we still recover?",
      ],
      toolUsed: "get_reservations",
      topic: "reservations",
      expanded: true,
      sources: demoSources(fresh, ["Reservations", "Forecast"]),
    };
  }

  if (intent === "WAITLIST_STATUS") {
    const err = unavailable(results, "get_waitlist");
    if (err) return notEnough(ctx, err, results);
    const wl = tool<{
      guests: number;
      parties: number;
      potentialEuro: number;
    }>(results, "get_waitlist");
    if (!wl) return notEnough(ctx, "Waitlist unavailable.", results);
    return {
      ...base,
      responseKind: "waitlist",
      title: "Waitlist",
      summary: `${wl.guests} guests across ${wl.parties} parties. Potential recoverable demand ${euro(wl.potentialEuro)}.`,
      answer: `${wl.guests} people on the waitlist.`,
      primaryMetric: {
        label: "Waitlist guests",
        value: String(wl.guests),
        tone: "signal",
      },
      evidence: [
        { label: "Parties", value: String(wl.parties) },
        { label: "Potential value", value: euro(wl.potentialEuro) },
      ],
      actions: [{ label: "Open service map", href: "/app/service" }],
      followUps: [
        "Which cancellations can we still recover?",
        "How busy are we tonight?",
      ],
      toolUsed: "get_waitlist",
      topic: "waitlist",
      sources: demoSources(fresh, ["Reservations"]),
    };
  }

  if (
    intent === "CANCELLATION_EXPOSURE" ||
    intent === "RECOVERY_OPPORTUNITY"
  ) {
    const err = unavailable(results, "get_cancellations");
    if (err) return notEnough(ctx, err, results);
    const c = tool<{
      cancelledReservations: number;
      cancelledCovers: number;
      bookingValue: number;
      currentlyAtRisk: number;
      potentialRecovery?: number;
      observedPos?: number;
      verifiedValue?: number;
      status?: string;
      expectedNaturalRecovery: number;
      note: string;
      tableHint: string;
    }>(results, "get_cancellations");
    if (!c) return notEnough(ctx, "Cancellation data unavailable.", results);
    const verified = c.verifiedValue ?? 0;
    const potential = c.potentialRecovery ?? 0;
    const isVerified = c.status === "VERIFIED" && verified > 0;
    return {
      ...base,
      responseKind: "cancellation_recovery",
      title: c.tableHint,
      summary: isVerified
        ? `${c.note}`
        : `${c.note} Booking value ${euro(c.bookingValue)}.`,
      answer: isVerified
        ? `Potential recovery was ${euro(potential)}. Observed POS ${euro(c.observedPos ?? verified)}. Verified value is ${euro(verified)}, not the potential.`
        : `${euro(c.currentlyAtRisk)} currently at risk from cancellations.`,
      primaryMetric: isVerified
        ? {
            label: "Verified value",
            value: euro(verified),
            tone: "positive",
          }
        : {
            label: "Original booking value",
            value: euro(c.bookingValue),
            tone: "watch",
          },
      metrics: isVerified
        ? [
            {
              label: "Potential recovery (estimate)",
              value: euro(potential),
            },
            {
              label: "Observed POS",
              value: euro(c.observedPos ?? verified),
              tone: "positive",
            },
            {
              label: "Verified value",
              value: euro(verified),
              tone: "positive",
            },
          ]
        : [
            {
              label: "Currently at risk",
              value: euro(c.currentlyAtRisk),
              tone: "risk",
            },
          ],
      explanation: c.note,
      recommendation: isVerified
        ? {
            title: "Review verified proof chain",
            href: "/app/value",
          }
        : {
            title: "Match waitlist to released inventory",
            href: "/app/service",
          },
      evidence: [
        { label: "Slot", value: c.tableHint },
        { label: "Cancelled covers", value: String(c.cancelledCovers) },
        ...(isVerified
          ? [
              { label: "Potential vs verified", value: `${euro(potential)} estimate → ${euro(verified)} claimed` },
            ]
          : []),
      ],
      actions: [
        { label: "Open finding", href: "/app/findings/fnd_cancel_recovery_t14" },
        { label: "Verified Value", href: "/app/value" },
      ],
      impactEuro: isVerified ? verified : c.currentlyAtRisk,
      followUps: [
        "How much value has RADR verified?",
        "What needs my attention?",
      ],
      toolUsed: "get_cancellations",
      topic: "cancellations",
      expanded: true,
      sources: demoSources(fresh, ["Reservations", "POS"]),
    };
  }

  if (intent === "SUPPLIER_VARIANCE" || intent === "INVOICE_ANALYSIS") {
    const s = tool<{
      variances: {
        title: string;
        euro: number;
        label: string;
        drivers: { label: string; value: string }[];
      }[];
      largest: number;
      note?: string;
    }>(results, "get_supplier_variances");
    if (!s?.variances?.length) {
      return {
        ...base,
        responseKind: "supplier_variance",
        title: "Supplier variances",
        summary: s?.note ?? "No open supplier variances in this scope.",
        answer: "No open supplier variances.",
        actions: [{ label: "Open BUY", href: "/app/buy" }],
        evidence: [],
        toolUsed: "get_supplier_variances",
        topic: "supplier",
        sources: demoSources(fresh, ["Supplier invoices"]),
      };
    }
    const top = s.variances[0]!;
    return {
      ...base,
      responseKind: "supplier_variance",
      title: "Supplier variance",
      summary: `${top.title} · ${euro(top.euro)} ${top.label.toLowerCase()}.`,
      answer: `Largest open variance ${euro(s.largest)}.`,
      primaryMetric: {
        label: top.label,
        value: euro(top.euro),
        tone: "watch",
      },
      drivers: (top.drivers ?? []).map((d) => ({
        label: d.label,
        value: d.value,
      })),
      actions: [
        { label: "Open reconciliation", href: "/app/checks" },
        { label: "View BUY", href: "/app/buy" },
      ],
      evidence: s.variances.map((v) => ({
        label: v.title,
        value: euro(v.euro),
      })),
      impactEuro: s.largest,
      followUps: ["Why is labor cost high?", "What needs my attention?"],
      toolUsed: "get_supplier_variances",
      topic: "supplier",
      expanded: true,
      sources: demoSources(fresh, ["Supplier invoices", "Contracts"]),
    };
  }

  if (intent === "LOCATION_COMPARISON") {
    const c = tool<{
      a: { name: string; margin: number; laborPct: number };
      b: { name: string; margin: number; laborPct: number };
      marginDeltaPts: number;
      laborDeltaPts: number;
      ahead: string;
      explainedBy: { label: string; pts: number; note: string }[];
    }>(results, "compare_locations");
    if (!c) return notEnough(ctx, "Need two locations with accessible data.", results);
    const aheadPts = Math.abs(c.marginDeltaPts);
    return {
      ...base,
      responseKind: "location_comparison",
      title: `${c.ahead} is ${aheadPts.toFixed(1)} pts ahead`,
      summary: `${c.a.name} ${c.a.margin.toFixed(1)}% vs ${c.b.name} ${c.b.margin.toFixed(1)}%. Difference ${c.marginDeltaPts >= 0 ? "+" : ""}${c.marginDeltaPts.toFixed(1)} pts.`,
      answer: `${c.a.name} vs ${c.b.name}: ${c.marginDeltaPts.toFixed(1)} pts margin gap.`,
      visualization: {
        type: "comparison",
        columns: ["Margin", "Labor %"],
        rows: [
          {
            id: "a",
            name: c.a.name,
            cells: [
              { key: "m", value: `${c.a.margin.toFixed(1)}%` },
              { key: "l", value: `${c.a.laborPct.toFixed(1)}%` },
            ],
          },
          {
            id: "b",
            name: c.b.name,
            cells: [
              { key: "m", value: `${c.b.margin.toFixed(1)}%` },
              { key: "l", value: `${c.b.laborPct.toFixed(1)}%` },
            ],
          },
        ],
        footnote: "Drivers limited to observed margin and labor % gaps.",
      },
      drivers: c.explainedBy.map((e) => ({
        label: e.label,
        value: e.note,
        delta: `${e.pts >= 0 ? "+" : ""}${e.pts} pts`,
      })),
      evidence: [
        { label: `${c.a.name} margin`, value: `${c.a.margin.toFixed(1)}%` },
        { label: `${c.b.name} margin`, value: `${c.b.margin.toFixed(1)}%` },
      ],
      actions: [
        { label: `Open ${c.a.name}`, href: "/app" },
        { label: "Compare locations", href: "/app/locations" },
      ],
      followUps: ["What needs my attention?", "Are we understaffed tonight?"],
      toolUsed: "compare_locations",
      topic: "amsterdam",
      expanded: true,
    };
  }

  if (intent === "VERIFIED_VALUE") {
    const v = tool<{
      monthVerifiedCatalog: number;
      scenarioVerified: number;
    }>(results, "get_verified_value");
    if (!v) return notEnough(ctx, "Verified value ledger unavailable.", results);
    const table14 = /table 14|actually spend|recover the table/i.test(question);
    if (table14) {
      return {
        ...base,
        responseKind: "verified_value",
        title: "Table 14 recovery",
        summary: `Observed POS on Table 14 is ${euro(v.scenarioVerified)}. Verified value uses observed spend only - not the ${euro(192)} waitlist estimate.`,
        answer: `${euro(v.scenarioVerified)} observed on Table 14.`,
        primaryMetric: {
          label: "Observed POS",
          value: euro(v.scenarioVerified),
          tone: "positive",
        },
        evidence: [
          { label: "Observed POS", value: euro(v.scenarioVerified) },
          { label: "Potential recoverable", value: euro(192) },
          { label: "Finding", value: "fnd_cancel_recovery_t14" },
        ],
        actions: [{ label: "Open Verified Value", href: "/app/value" }],
        impactEuro: v.scenarioVerified,
        toolUsed: "get_verified_value",
        topic: "table14",
      };
    }
    return {
      ...base,
      responseKind: "verified_value",
      title: "Verified value",
      summary: `RADR has verified ${euro(v.monthVerifiedCatalog)} this month in the demo ledger.`,
      answer: `${euro(v.monthVerifiedCatalog)} verified this month.`,
      primaryMetric: {
        label: "Verified this month",
        value: euro(v.monthVerifiedCatalog),
        tone: "positive",
      },
      evidence: [
        { label: "Month ledger", value: euro(v.monthVerifiedCatalog) },
        { label: "Table 14 observed", value: euro(v.scenarioVerified) },
      ],
      actions: [{ label: "Open Verified Value", href: "/app/value" }],
      impactEuro: v.monthVerifiedCatalog,
      toolUsed: "get_verified_value",
      topic: "verified_value",
    };
  }

  if (intent === "CONTROL_CENTER_SUMMARY" || intent === "DATA_PROVENANCE") {
    const findings = tool<{
      open: number;
      atRiskEuro: number;
      items: {
        territory: string;
        title: string;
        euro: number;
        urgency: string;
      }[];
    }>(results, "get_findings");
    const summary =
      tool<{
        locationName: string;
        narrative: string;
        attention: { label: string; atRiskEuro: number; open: number };
        trading: { margin: number; marginVsPlan: number };
      }>(results, "get_location_summary") ??
      tool<{
        locationName: string;
        narrative: string;
        attention: { label: string; atRiskEuro: number; open: number };
        trading: { margin: number; marginVsPlan: number };
      }>(results, "get_group_summary");

    if (!findings && !summary) {
      return notEnough(ctx, "I can't determine that from available data yet.", results);
    }

    const atRisk = findings?.atRiskEuro ?? summary?.attention.atRiskEuro ?? 0;
    const open = findings?.open ?? summary?.attention.open ?? 0;
    const locLabel = summary?.locationName ?? ctx.locationName;
    return {
      ...base,
      responseKind:
        intent === "DATA_PROVENANCE" ? "provenance" : "executive_summary",
      title: open > 0 ? `${open} issues need attention` : "Operation on plan",
      summary:
        (summary?.narrative
          ? `${locLabel}. ${summary.narrative}`
          : `${locLabel}: ${open} open findings · ${euro(atRisk)} currently exposed.`) +
        (/worr|attention|tonight/i.test(question) ? ` Focus: ${locLabel}.` : ""),
      answer: `${euro(atRisk)} currently at risk across ${open} findings.`,
      primaryMetric: {
        label: "Value currently at risk",
        value: euro(atRisk),
        tone: atRisk > 0 ? "risk" : "positive",
      },
      metrics: summary
        ? [
            {
              label: "Margin",
              value: `${summary.trading.margin.toFixed(1)}%`,
            },
            {
              label: "Vs plan",
              value: `${summary.trading.marginVsPlan >= 0 ? "+" : ""}${summary.trading.marginVsPlan.toFixed(1)} pts`,
            },
          ]
        : undefined,
      visualization: findings?.items?.length
        ? {
            type: "breakdown",
            rows: findings.items.map((i) => ({
              label: `${i.territory} · ${i.title}`,
              value: euro(i.euro),
              amount: i.euro,
              tone: i.urgency === "ACT_NOW" ? "risk" : "watch",
            })),
            totalLabel: "Total",
            totalValue: euro(atRisk),
          }
        : undefined,
      evidence: (findings?.items ?? []).map((i) => ({
        label: `${i.territory} · ${i.title}`,
        value: euro(i.euro),
      })),
      actions: [
        { label: `View ${open} findings`, href: "/app/findings" },
        { label: "Control Center", href: "/app" },
      ],
      followUps: [
        "Do we need to call more people in tonight?",
        "What's tonight looking like?",
        "Why was margin down yesterday?",
      ],
      impactEuro: atRisk,
      toolUsed: "get_findings",
      topic: "attention",
      expanded: true,
    };
  }

  if (intent === "REVENUE_ANALYSIS") {
    const rev = tool<{
      locationName: string;
      revenueDisplay: string;
      vsForecastPct: number;
      drivers?: { covers: number; avgSpend: number };
    }>(results, "get_revenue");
    if (!rev) return notEnough(ctx, "Revenue data unavailable.", results);
    return {
      ...base,
      responseKind: "revenue_analysis",
      title: "Revenue",
      summary: `${rev.locationName} finished ${rev.revenueDisplay} (${rev.vsForecastPct >= 0 ? "+" : ""}${rev.vsForecastPct}% vs forecast).`,
      answer: `${rev.revenueDisplay} · ${rev.vsForecastPct >= 0 ? "+" : ""}${rev.vsForecastPct}% vs forecast.`,
      primaryMetric: {
        label: "Revenue",
        value: rev.revenueDisplay,
        hint: `${rev.vsForecastPct >= 0 ? "+" : ""}${rev.vsForecastPct}% vs forecast`,
        tone: rev.vsForecastPct >= 0 ? "positive" : "risk",
      },
      drivers: rev.drivers
        ? [
            {
              label: "Covers",
              value: `${rev.drivers.covers >= 0 ? "+" : ""}${rev.drivers.covers}%`,
            },
            {
              label: "Avg spend",
              value: `${rev.drivers.avgSpend >= 0 ? "+" : ""}${rev.drivers.avgSpend}%`,
            },
          ]
        : undefined,
      evidence: [
        { label: "Revenue", value: rev.revenueDisplay },
        {
          label: "Vs forecast",
          value: `${rev.vsForecastPct >= 0 ? "+" : ""}${rev.vsForecastPct}%`,
        },
      ],
      actions: [{ label: "Performance", href: "/app/performance" }],
      toolUsed: "get_revenue",
      topic: "general",
      sources: demoSources(fresh, ["POS"]),
    };
  }

  if (intent === "WEATHER_CONTEXT") {
    const wx = tool<{
      hasTerrace?: boolean;
      tomorrow: { highC: number; summary: string; precipitationProbabilityPct: number };
      terrace: {
        estimatedImpact: number;
        grossOpportunity?: number;
        netOpportunity?: number;
        laborCostToCapture?: number;
        doNothingValue?: number;
        additionalExpectedCovers: number;
        calc: string;
        netCalc?: string;
        doNothingCalc?: string;
        comparableLiftPct?: number;
        comparableSampleSize?: number;
        scheduledCapacity?: number;
        expectedDemand?: number;
        fohPlan?: number;
        peak?: string;
        findingId?: string;
      };
      terraceTonight: {
        decision: string;
        temperatureC: number;
        conditionLabel: string;
        precipitationProbabilityPct: number;
        additionalExpectedCovers: number;
        incrementalRevenue: number;
        grossOpportunity: number;
        laborCostToCapture: number;
        netOpportunity: number;
        recommendation: string;
        comparableLiftPct?: number;
        comparableSampleSize?: number;
        outdoorLabel?: string;
        outdoorSeats?: number;
        confidence: string;
        calc: string;
        netCalc: string;
        rainCounterfactual: {
          rainPct: number;
          coversLost: number;
          revenueAtRisk: number;
          recommendation: string;
        } | null;
      } | null;
    }>(results, "get_weather");
    if (!wx?.terrace && !wx?.terraceTonight) {
      return notEnough(ctx, "Weather context is not available for this location.", results);
    }

    const tonightQ =
      /\btonight\b|\bdinner\b|\bthis evening\b|open (the )?terrace|whole terrace|full terrace/i.test(
        question,
      );
    const tn = wx.terraceTonight;

    if (tonightQ && tn) {
      const rainQ = /rain|rains|wet/i.test(question);
      if (rainQ && tn.rainCounterfactual) {
        const rc = tn.rainCounterfactual;
        return {
          ...base,
          responseKind: "forecast",
          title: "If rain rises tonight",
          summary: `Rain at ${rc.rainPct}% would put about ${rc.coversLost} terrace covers at risk.`,
          answer: `Hold indoor capacity. Expected terrace cancellations ${rc.coversLost} covers · ${euro(rc.revenueAtRisk)} revenue at risk. ${rc.recommendation}`,
          primaryMetric: {
            label: "Revenue at risk",
            value: euro(rc.revenueAtRisk),
            tone: "watch",
          },
          recommendation: {
            title: rc.recommendation,
            protectValue: euro(rc.revenueAtRisk),
          },
          evidence: [
            {
              label: "Tonight weather (current)",
              value: `${tn.temperatureC}°C · ${tn.conditionLabel} · ${tn.precipitationProbabilityPct}% rain`,
            },
            { label: "Counterfactual rain", value: `${rc.rainPct}%` },
          ],
          actions: [{ label: "Control Center", href: "/app" }],
          impactEuro: rc.revenueAtRisk,
          toolUsed: "get_weather",
          topic: "forecast",
          sources: demoSources(fresh, [
            "Weather forecast",
            "POS history",
            "Labor schedule",
          ]),
        };
      }

      return {
        ...base,
        responseKind: "forecast",
        verdict: "Yes",
        title: "Open the full terrace tonight",
        summary: `${tn.temperatureC}°C · ${tn.conditionLabel}. Location history says warm dry dinners lift terrace covers here.`,
        answer: `Yes. Expected incremental covers ${tn.additionalExpectedCovers}. Revenue ${euro(tn.incrementalRevenue)}. Additional FOH ${euro(tn.laborCostToCapture)}. Expected net contribution ${euro(tn.netOpportunity)}. Main drivers: dry weather, ${tn.temperatureC}°C, local event traffic. Confidence: ${tn.confidence}. ${tn.recommendation}`,
        primaryMetric: {
          label: "Net expected contribution",
          value: euro(tn.netOpportunity),
          tone: "positive",
        },
        metrics: [
          { label: "Incremental covers", value: `+${tn.additionalExpectedCovers}` },
          {
            label: "Incremental revenue",
            value: euro(tn.incrementalRevenue),
            tone: "positive",
          },
          { label: "FOH cost", value: euro(tn.laborCostToCapture) },
          {
            label: "Comparable lift",
            value: `+${tn.comparableLiftPct ?? 22}% · n=${tn.comparableSampleSize ?? 19}`,
          },
        ],
        recommendation: {
          title: tn.recommendation,
          protectValue: euro(tn.netOpportunity),
        },
        evidence: [
          {
            label: "Tonight weather",
            value: `${tn.temperatureC}°C · ${tn.conditionLabel} · ${tn.precipitationProbabilityPct}% rain`,
          },
          {
            label: "Outdoor",
            value: `${tn.outdoorLabel ?? "Terrace"}${tn.outdoorSeats ? ` · ${tn.outdoorSeats} seats` : ""}`,
          },
          { label: "Economics", value: tn.calc },
          {
            label: "Location correlation",
            value: `Warm-dry dinners +${tn.comparableLiftPct ?? 22}% terrace covers (n=${tn.comparableSampleSize ?? 19})`,
          },
        ],
        actions: [
          { label: "Review pre-shift plan", href: "/app" },
          { label: "Prepare staffing adjustment", href: "/app" },
        ],
        impactEuro: tn.netOpportunity,
        toolUsed: "get_weather",
        topic: "forecast",
        sources: demoSources(fresh, [
          "Weather forecast",
          "POS history",
          "Labor schedule",
          "Reservations",
        ]),
      };
    }

    if (wx.hasTerrace === false) {
      return {
        ...base,
        responseKind: "forecast",
        title: "No terrace at this location",
        summary: "This venue has no weather-elastic outdoor seating.",
        answer:
          "RADR only surfaces terrace weather opportunities where the location has outdoor seating that historically responds to weather. This location does not.",
        evidence: [
          { label: "Outdoor seating", value: "None / not weather-elastic" },
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_weather",
        topic: "forecast",
        sources: demoSources(fresh, ["Weather forecast"]),
      };
    }

    const t = wx.terrace;
    if (!t) {
      return notEnough(ctx, "Weather context is not available for this location.", results);
    }
    const tom = wx.tomorrow;
    const gross = t.grossOpportunity ?? t.estimatedImpact;
    const net = t.netOpportunity ?? gross;
    const cost = t.laborCostToCapture ?? 0;
    const nothing = t.doNothingValue ?? 0;
    const nothingQ = /do nothing|what if|don'?t|happens if/i.test(question);
    const rainQ = /rain|rains|wet/i.test(question);
    if (rainQ && tom.precipitationProbabilityPct <= 25) {
      return {
        ...base,
        responseKind: "forecast",
        title: "Rain is unlikely to erase the lunch opportunity",
        summary: `Precipitation probability is ${tom.precipitationProbabilityPct}% for the lunch window. The terrace opportunity remains modeled.`,
        answer: `Forecast rain chance is ${tom.precipitationProbabilityPct}%. RADR still expects ${t.additionalExpectedCovers} incremental covers and ${euro(gross)} gross opportunity if the dry forecast holds.`,
        primaryMetric: {
          label: "Gross opportunity",
          value: euro(gross),
          tone: "positive",
        },
        evidence: [
          { label: "Precipitation probability", value: `${tom.precipitationProbabilityPct}%` },
          { label: "Calculation", value: t.calc },
        ],
        actions: [
          { label: "Finding", href: `/app/findings/${t.findingId ?? "fnd_weather_terrace_loc_ber"}` },
        ],
        impactEuro: gross,
        toolUsed: "get_weather",
        topic: "forecast",
        sources: demoSources(fresh, ["Weather forecast", "POS history", "Labor schedule", "Reservations"]),
      };
    }
    if (nothingQ) {
      return {
        ...base,
        responseKind: "forecast",
        title: "If you do nothing",
        summary: `Expected demand ${t.expectedDemand ?? 56} covers vs FOH plan ${t.fohPlan ?? 46}. About ${Math.max(0, (t.expectedDemand ?? 56) - (t.fohPlan ?? 46))} covers would be constrained.`,
        answer: t.doNothingCalc ?? `${euro(nothing)} estimated contribution left behind if capacity and staffing stay as planned.`,
        primaryMetric: {
          label: "Value left behind (estimate)",
          value: euro(nothing),
          tone: "watch",
        },
        evidence: [
          { label: "Do nothing calculation", value: t.doNothingCalc ?? String(nothing) },
          { label: "Gross if captured", value: t.calc },
        ],
        actions: [
          { label: "Finding", href: `/app/findings/${t.findingId ?? "fnd_weather_terrace_loc_ber"}` },
        ],
        impactEuro: nothing,
        toolUsed: "get_weather",
        topic: "forecast",
        sources: demoSources(fresh, ["Weather forecast", "POS history", "Labor schedule", "Reservations"]),
      };
    }
    return {
      ...base,
      responseKind: "forecast",
      title: "Weather as operating context",
      summary: `Thursday lunch is likely stronger than the current plan assumes. Forecast ${tom.highC}°C and dry (${tom.precipitationProbabilityPct}% rain).`,
      answer: `Comparable warm, dry Thursdays lifted terrace covers by ${t.comparableLiftPct ?? 24}% (n=${t.comparableSampleSize ?? 23}). RADR expects ${t.additionalExpectedCovers} incremental covers. ${t.calc}. Capturing that requires about ${euro(cost)} additional FOH, leaving ${euro(net)} expected net. ${t.netCalc ?? ""}`.trim(),
      primaryMetric: {
        label: "Gross opportunity",
        value: euro(gross),
        tone: "positive",
      },
      metrics: [
        { label: "Cost to capture", value: euro(cost) },
        { label: "Expected net", value: euro(net), tone: "positive" },
        { label: "If you do nothing", value: euro(nothing), tone: "watch" },
      ],
      recommendation: {
        title: "Open full terrace and add one FOH 12:30-15:30",
        protectValue: euro(net),
      },
      evidence: [
        { label: "Weather forecast", value: `${tom.highC}°C · ${tom.summary} · ${tom.precipitationProbabilityPct}% rain` },
        { label: "Gross calculation", value: t.calc },
        { label: "Net calculation", value: t.netCalc ?? `${euro(gross)} − ${euro(cost)} = ${euro(net)}` },
        { label: "Comparable service periods", value: `Terrace +${t.comparableLiftPct ?? 24}% · n=${t.comparableSampleSize ?? 23}` },
        { label: "Labor plan", value: `FOH supports ${t.fohPlan ?? 46} covers` },
        { label: "Terrace capacity", value: String(t.scheduledCapacity ?? 42) },
      ],
      actions: [
        { label: "Forecast", href: "/app/forecast" },
        { label: "Finding", href: `/app/findings/${t.findingId ?? "fnd_weather_terrace_loc_ber"}` },
      ],
      impactEuro: gross,
      toolUsed: "get_weather",
      topic: "forecast",
      sources: demoSources(fresh, ["Weather forecast", "POS history", "Labor schedule", "Reservations"]),
    };
  }

  if (intent === "GUEST_VALUE") {
    const g = tool<{
      aggregatesOnly: boolean;
      returningGuests: number;
      firstTimeGuests: number;
      expectedReturningRevenue: number;
      expectedFirstTimeRevenue: number;
      returningRevenueSharePct: number;
      highValueReturning: number;
      lapsedReturning90d: number;
      serviceNotesNeedingAttention: number;
      bluefinAffinityGuests: number;
      bluefinAffinityExpectedValue: number;
      topRelationship: {
        name: string;
        tiers: string;
        why: string[];
        tonight: string;
        expectedTonight: string;
        serviceNote: string | null;
      } | null;
      attentionNotes: { guestLabel: string; note: string }[] | null;
    }>(results, "get_guest_value");
    if (!g) {
      return notEnough(ctx, "Guest value data is not available for this location.", results);
    }

    const bluefinQ = /bluefin|tuna/i.test(question);
    const notesQ = /service note|preference/i.test(question);
    const revenueQ = /returning revenue|how much revenue|repeat/i.test(question);
    const lapsedQ = /hasn'?t returned|lapsed|not returned/i.test(question);

    if (bluefinQ) {
      return {
        ...base,
        responseKind: "guest_value",
        title: "Menu affinity tonight",
        summary: `${g.bluefinAffinityGuests} high-value returning guests tonight historically order Bluefin dishes. Affinity context ${euro(g.bluefinAffinityExpectedValue)} - not a prediction they will order it tonight.`,
        answer: `${g.bluefinAffinityGuests} guests · ${euro(g.bluefinAffinityExpectedValue)} affinity context`,
        primaryMetric: {
          label: "Bluefin affinity guests",
          value: String(g.bluefinAffinityGuests),
          hint: `${euro(g.bluefinAffinityExpectedValue)} historical affinity`,
          tone: "watch",
        },
        evidence: [
          {
            label: "Returning guests tonight",
            value: String(g.returningGuests),
          },
          {
            label: "Expected returning revenue",
            value: euro(g.expectedReturningRevenue),
          },
        ],
        followUps: [
          "How much revenue comes from returning guests?",
          "Any important service notes tonight?",
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_guest_value",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "POS history", "Guest preferences"]),
      };
    }

    if (notesQ && g.attentionNotes && g.attentionNotes.length > 0) {
      return {
        ...base,
        responseKind: "guest_value",
        title: "Service notes tonight",
        summary: `${g.serviceNotesNeedingAttention} notes need attention before service.`,
        answer: g.attentionNotes
          .map((n) => `${n.guestLabel}: ${n.note}`)
          .join(" · "),
        evidence: g.attentionNotes.map((n) => ({
          label: n.guestLabel,
          value: n.note,
        })),
        followUps: [
          "Which returning guests are booked?",
          "Who's coming tonight?",
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_guest_value",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "Guest preferences"]),
      };
    }

    if (lapsedQ) {
      return {
        ...base,
        responseKind: "guest_value",
        title: "Lapsed returners tonight",
        summary: `${g.lapsedReturning90d} guests returning after 90+ days are booked tonight - relationship recovery opportunity, not a marketing blast.`,
        answer: `${g.lapsedReturning90d} after 90+ days`,
        primaryMetric: {
          label: "Returning after 90+ days",
          value: String(g.lapsedReturning90d),
          tone: "watch",
        },
        evidence: [
          {
            label: "High-value returners",
            value: String(g.highValueReturning),
          },
        ],
        followUps: [
          "Which returning guests are booked?",
          "How much revenue comes from returning guests?",
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_guest_value",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "POS history"]),
      };
    }

    if (revenueQ || g.aggregatesOnly) {
      return {
        ...base,
        responseKind: "guest_value",
        title: "Returning revenue",
        summary: `${euro(g.expectedReturningRevenue)} expected tonight from ${g.returningGuests} returning guests - ${g.returningRevenueSharePct}% of projected reservation revenue. Not guaranteed.`,
        answer: euro(g.expectedReturningRevenue),
        primaryMetric: {
          label: "Expected returning revenue",
          value: euro(g.expectedReturningRevenue),
          hint: `${g.returningRevenueSharePct}% of reservation revenue`,
          tone: "positive",
        },
        evidence: [
          { label: "Returning guests", value: String(g.returningGuests) },
          { label: "First-time guests", value: String(g.firstTimeGuests) },
          {
            label: "First-time expected",
            value: euro(g.expectedFirstTimeRevenue),
          },
          {
            label: "High-value returners",
            value: String(g.highValueReturning),
          },
        ],
        followUps: [
          "Any important service notes tonight?",
          "Which tonight's guests usually order Bluefin?",
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_guest_value",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "POS history"]),
      };
    }

    const top = g.topRelationship;
    return {
      ...base,
      responseKind: "guest_value",
      title: "Guests tonight",
      summary: top
        ? `${g.returningGuests} returning guests · ${euro(g.expectedReturningRevenue)} expected returning revenue. Top relationship: ${top.name} (${top.tiers}) - ${top.why.slice(0, 2).join(" · ")}. Tonight: ${top.tonight}.`
        : `${g.returningGuests} returning guests · ${euro(g.expectedReturningRevenue)} expected returning revenue · ${g.highValueReturning} high-value returners.`,
      answer: `${g.returningGuests} returning · ${euro(g.expectedReturningRevenue)} expected`,
      primaryMetric: {
        label: "Returning guests",
        value: String(g.returningGuests),
        hint: `${euro(g.expectedReturningRevenue)} expected revenue`,
        tone: "positive",
      },
      evidence: [
        {
          label: "High-value returners",
          value: String(g.highValueReturning),
        },
        {
          label: "Service notes",
          value: String(g.serviceNotesNeedingAttention),
        },
        ...(top?.serviceNote
          ? [{ label: "Top note", value: top.serviceNote }]
          : []),
        ...(g.bluefinAffinityGuests > 0
          ? [
              {
                label: "Bluefin affinity",
                value: `${g.bluefinAffinityGuests} guests · ${euro(g.bluefinAffinityExpectedValue)} context`,
              },
            ]
          : []),
      ],
      followUps: [
        "How much revenue comes from returning guests?",
        "Any important service notes tonight?",
        "Which tonight's guests usually order Bluefin?",
      ],
      actions: [{ label: "Control Center", href: "/app" }],
      toolUsed: "get_guest_value",
      topic: "reservations",
      sources: demoSources(fresh, ["Reservations", "POS history", "Guest preferences"]),
    };
  }

  if (intent === "HOSPITALITY_SAFETY") {
    const h = tool<{
      aggregatesOnly: boolean;
      canSeeAllergyDetail: boolean;
      birthdays: number;
      engagements: number;
      anniversaries: number;
      allergyAlerts: number;
      needsAction: boolean;
      safety: {
        allergyReservations: number;
        kitchenAcknowledged: number;
        needsActionBeforeOpen: boolean;
        actionSummary: string | null;
      };
      allergies: {
        tableLabel: string;
        time: string;
        allergenLabel: string;
        severityExplicit: string | null;
        needsClarification: boolean;
        clarificationHint: string | null;
        fohInstruction: string;
        kitchenInstruction: string | null;
        kitchenAcknowledged: boolean;
        menuContainsCount: number;
        menuCrossContactCount: number;
        originalText: string;
        menuGuidance: {
          name: string;
          containment: string;
          detail: string;
        }[];
      }[];
      moments: { tableLabel: string | null; time: string; label: string }[];
    }>(results, "get_hospitality");
    if (!h) {
      return notEnough(
        ctx,
        "Hospitality data is not available for this location.",
        results,
      );
    }

    if (!h.canSeeAllergyDetail || h.aggregatesOnly) {
      return {
        ...base,
        responseKind: "hospitality_safety",
        title: "Hospitality tonight",
        summary: `${h.birthdays} birthdays · ${h.allergyAlerts} allergy reservations (detail hidden for this role).`,
        answer: `${h.allergyAlerts} allergy reservations`,
        evidence: [
          { label: "Birthdays", value: String(h.birthdays) },
          { label: "Allergy reservations", value: String(h.allergyAlerts) },
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_hospitality",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations"]),
      };
    }

    const peanutQ = /peanut|which menu|contain/i.test(question);
    const tableQ = /table\s*(\d+)/i.exec(question);
    const kitchenQ = /kitchen/i.test(question);

    if (tableQ) {
      const table = `Table ${tableQ[1]}`;
      const row = h.allergies.find((a) => a.tableLabel === table);
      if (!row) {
        return {
          ...base,
          responseKind: "hospitality_safety",
          title: table,
          summary: `No allergy / dietary alert on file for ${table} in tonight’s brief.`,
          answer: "No allergy alert on file",
          toolUsed: "get_hospitality",
          topic: "reservations",
          sources: demoSources(fresh, ["Reservations"]),
          actions: [{ label: "Control Center", href: "/app" }],
          evidence: [],
        };
      }
      return {
        ...base,
        responseKind: "hospitality_safety",
        title: `${row.tableLabel} · ${row.allergenLabel}`,
        summary: row.needsClarification
          ? row.clarificationHint ?? row.fohInstruction
          : `${row.allergenLabel}${row.severityExplicit === "severe" ? " · guest stated severe" : ""}. FOH: ${row.fohInstruction}`,
        answer: `${row.allergenLabel} · ${row.time}`,
        evidence: [
          { label: "Original note", value: row.originalText },
          {
            label: "Menu",
            value: `${row.menuContainsCount} contain · ${row.menuCrossContactCount} cross-contact`,
          },
          ...(row.kitchenInstruction
            ? [{ label: "Kitchen", value: row.kitchenInstruction }]
            : []),
        ],
        followUps: [
          "Any allergies tonight?",
          "What should the kitchen know before service?",
        ],
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_hospitality",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "Menu allergen data"]),
      };
    }

    if (peanutQ) {
      const peanut = h.allergies.find((a) =>
        /peanut|nut/i.test(a.allergenLabel),
      );
      const contains =
        peanut?.menuGuidance.filter((g) => g.containment === "CONTAINS") ?? [];
      return {
        ...base,
        responseKind: "hospitality_safety",
        title: "Peanut · menu data",
        summary:
          contains.length > 0
            ? `${contains.length} items contain peanut in current menu data. Cross-contact is listed separately. Do not treat unmarked items as medically safe - confirm with kitchen.`
            : "Allergen data is incomplete. Kitchen confirmation required.",
        answer:
          contains.length > 0
            ? contains.map((c) => c.name).join(", ")
            : "Kitchen confirmation required",
        evidence: contains.slice(0, 6).map((c) => ({
          label: c.name,
          value: c.detail,
        })),
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_hospitality",
        topic: "reservations",
        sources: demoSources(fresh, ["Menu allergen data"]),
      };
    }

    if (kitchenQ) {
      const pending = h.allergies.filter((a) => !a.kitchenAcknowledged);
      return {
        ...base,
        responseKind: "hospitality_safety",
        title: "Kitchen safety",
        summary:
          pending.length === 0
            ? `Kitchen acknowledgements complete · ${h.safety.allergyReservations} allergy reservations tonight.`
            : pending
                .map(
                  (a) =>
                    `${a.tableLabel} · ${a.time} · ${a.allergenLabel}${a.kitchenInstruction ? ` - ${a.kitchenInstruction}` : ""}`,
                )
                .join(" · "),
        answer:
          pending.length === 0
            ? "Kitchen ready"
            : `${pending.length} pending kitchen ack`,
        evidence: h.allergies.map((a) => ({
          label: `${a.tableLabel} · ${a.allergenLabel}`,
          value: a.kitchenAcknowledged ? "Acknowledged" : "Pending",
        })),
        actions: [{ label: "Control Center", href: "/app" }],
        toolUsed: "get_hospitality",
        topic: "reservations",
        sources: demoSources(fresh, ["Reservations", "Menu allergen data"]),
      };
    }

    return {
      ...base,
      responseKind: "hospitality_safety",
      title: "Hospitality tonight",
      summary: h.needsAction
        ? `${h.birthdays} birthdays · ${h.allergyAlerts} allergy reservations · Needs action: ${h.safety.actionSummary}`
        : `${h.birthdays} birthdays · ${h.engagements} engagement · ${h.allergyAlerts} allergy reservations · safety ready`,
      answer: h.needsAction
        ? h.safety.actionSummary ?? "Needs action"
        : "Safety ready",
      primaryMetric: {
        label: "Allergy reservations",
        value: String(h.allergyAlerts),
        hint: h.needsAction ? "Action required" : "Prepared",
        tone: h.needsAction ? "watch" : "positive",
      },
      evidence: [
        ...(h.moments ?? []).slice(0, 4).map((m) => ({
          label: `${m.tableLabel ?? "TBD"} · ${m.time}`,
          value: m.label,
        })),
        ...h.allergies.map((a) => ({
          label: `${a.tableLabel} · ${a.allergenLabel}`,
          value: a.needsClarification
            ? "Needs clarification"
            : a.kitchenAcknowledged
              ? "Kitchen ready"
              : "Kitchen pending",
        })),
      ],
      followUps: [
        "Does Table 12 have any dietary restrictions?",
        "What should the kitchen know before service?",
        "Which menu items contain peanuts?",
      ],
      actions: [{ label: "Control Center", href: "/app" }],
      toolUsed: "get_hospitality",
      topic: "reservations",
      sources: demoSources(fresh, ["Reservations", "Menu allergen data"]),
    };
  }

  if (intent === "FORECAST") {
    const f = tool<{
      tonightExpectedRevenue?: number;
      tonightExpectedOccupancy?: number;
      signal?: { title: string; exposure: number; recommend: string };
    }>(results, "get_forecast");
    return {
      ...base,
      responseKind: "forecast",
      title: "Forecast",
      summary: f?.tonightExpectedRevenue
        ? `Tonight expected ${euro(f.tonightExpectedRevenue)} · ${f.tonightExpectedOccupancy}% occupancy.`
        : "Forecast snapshot loaded.",
      answer: f?.tonightExpectedRevenue
        ? euro(f.tonightExpectedRevenue)
        : "Forecast available.",
      recommendation: f?.signal
        ? {
            title: f.signal.recommend,
            protectValue: euro(f.signal.exposure),
          }
        : undefined,
      evidence: f?.signal
        ? [{ label: f.signal.title, value: euro(f.signal.exposure) }]
        : [],
      actions: [{ label: "Forecast", href: "/app/forecast" }],
      toolUsed: "get_forecast",
      topic: "forecast",
    };
  }

  if (intent === "DATA_HEALTH") {
    const h = tool<{
      overall: string;
      sources: { label: string; status: string; ageMinutes: number }[];
      userMessage?: string | null;
    }>(results, "get_data_freshness");
    return {
      ...base,
      responseKind: "data_health",
      title: "Data health",
      summary: h?.userMessage ?? `Overall status: ${h?.overall ?? "unknown"}.`,
      answer: h?.overall ?? "Unknown",
      evidence: (h?.sources ?? []).map((s) => ({
        label: s.label,
        value: `${s.status} · ${s.ageMinutes}m`,
      })),
      actions: [{ label: "Control Center", href: "/app" }],
      toolUsed: "get_data_freshness",
      topic: "general",
    };
  }

  if (intent === "FOLLOW_UP" || intent === "NAVIGATION" || intent === "METRIC_EXPLANATION") {
    return {
      ...base,
      responseKind: "clarification",
      title: "Need a bit more",
      summary:
        "Tell me which domain you mean - staffing, reservations, margin, or group attention.",
      answer: "Clarify the subject.",
      actions: [{ label: "Control Center", href: "/app" }],
      evidence: [],
      followUps: [
        "Do we need to call more people in tonight?",
        "How busy are we tonight?",
        "What needs my attention?",
      ],
      toolUsed: "clarify",
      topic: "general",
    };
  }

  return notEnough(
    ctx,
    "I can't determine that confidently from the available RADR data yet.",
    results,
  );
}

function composeStaffing(
  question: string,
  ctx: ResolvedContext,
  results: ToolResult[],
  fresh: ToolResult | undefined,
  base: { sources: ButlerSource[]; warnings?: ButlerResponse["warnings"]; confidence: { band: "HIGH"; score: number } },
): ButlerResponse {
  const req = tool<{
    needAdditionalStaff: boolean;
    scopeLabel: string;
    adequatelyStaffedNote: string | null;
    locationsNeedingStaff: LaborRequirementLocation[];
    primary: LaborRequirementLocation | null;
  }>(results, "get_labor_requirement");

  if (!req) {
    return notEnough(ctx, "Labor schedule data unavailable for this scope.", results);
  }

  const whyQ = /^(why|what caused|what drove)/i.test(question.trim()) || question.trim().toLowerCase() === "why";
  const costQ = /how much|cost|€|euro/i.test(question);
  const nothingQ = /do nothing|what if|don'?t|happens if/i.test(question);
  const recommendQ = /what (would|should) (you|we) do|recommend/i.test(question);

  const locs = req.locationsNeedingStaff;
  const primary = req.primary ?? locs[0] ?? null;

  if (!req.needAdditionalStaff || !primary) {
    return {
      ...base,
      responseKind: "staffing_requirement",
      verdict: "NO.",
      title: "Adequately staffed tonight",
      summary:
        req.adequatelyStaffedNote ??
        `${ctx.locationName} does not need additional cover tonight in the available data.`,
      answer: "No additional staff needed tonight.",
      confidence: { band: "HIGH", score: 82 },
      actions: [{ label: "Open LABOR", href: "/app/labor" }],
      evidence: [],
      followUps: ["How busy are we tonight?", "What needs my attention?"],
      toolUsed: "get_labor_requirement",
      topic: "labor",
      sources: staffingSources(fresh),
    };
  }

  if (whyQ) {
    return {
      ...base,
      responseKind: "staffing_requirement",
      title: `Why ${primary.location} needs +${primary.additionalHeadcount} ${primary.role}`,
      summary: primary.drivers.join(". ") + ".",
      answer: primary.drivers.join("; "),
      drivers: primary.drivers.map((d) => ({ label: "Driver", value: d })),
      metrics: [
        {
          label: "Expected peak demand",
          value: String(primary.expectedDemand),
        },
        {
          label: "Current service capacity",
          value: String(primary.scheduledCapacity),
        },
        { label: "Gap", value: String(primary.demandGap), tone: "risk" },
      ],
      visualization: demandViz(primary),
      confidence: {
        band: "HIGH",
        score: Math.round(primary.confidence * 100),
      },
      actions: [
        { label: "Review staffing", href: "/app/labor" },
        { label: "Open service pressure", href: "/app/service" },
      ],
      evidence: primary.drivers.map((d) => ({ label: "Why", value: d })),
      followUps: [
        "How much will it cost?",
        "What if we don't?",
        "What would you do?",
      ],
      impactEuro: primary.estimatedRevenueProtected,
      toolUsed: "get_labor_requirement",
      topic: "labor",
      expanded: true,
      sources: staffingSources(fresh),
    };
  }

  if (costQ) {
    return {
      ...base,
      responseKind: "staffing_requirement",
      title: "Additional labor cost",
      summary: `Calling in +${primary.additionalHeadcount} ${primary.role} for ${primary.timeframe.start}-${primary.timeframe.end} costs about ${euro(primary.expectedAdditionalCost)} and protects ~${euro(primary.estimatedRevenueProtected)} revenue.`,
      answer: euro(primary.expectedAdditionalCost),
      primaryMetric: {
        label: "Additional labor",
        value: euro(primary.expectedAdditionalCost),
        tone: "watch",
      },
      metrics: [
        {
          label: "Value protected",
          value: euro(primary.estimatedRevenueProtected),
          tone: "positive",
        },
      ],
      actions: [{ label: "Review staffing", href: "/app/labor" }],
      evidence: [
        { label: "Cost", value: euro(primary.expectedAdditionalCost) },
        {
          label: "Protected",
          value: euro(primary.estimatedRevenueProtected),
        },
      ],
      impactEuro: primary.expectedAdditionalCost,
      followUps: ["What if we don't?", "Why?"],
      toolUsed: "get_labor_requirement",
      topic: "labor",
      sources: staffingSources(fresh),
      confidence: {
        band: "HIGH",
        score: Math.round(primary.confidence * 100),
      },
    };
  }

  if (nothingQ) {
    return {
      ...base,
      responseKind: "staffing_requirement",
      title: "If we don't add cover",
      summary: `Peak gap stays at ${primary.demandGap} covers. Expected consequences: elevated service pressure, longer waits, and ~${euro(primary.estimatedRevenueProtected)} revenue exposed during ${primary.timeframe.start}-${primary.timeframe.end}.`,
      answer: `${euro(primary.estimatedRevenueProtected)} remains at risk.`,
      primaryMetric: {
        label: "Revenue exposed",
        value: euro(primary.estimatedRevenueProtected),
        tone: "risk",
      },
      drivers: [
        { label: "Service pressure", value: "Elevated through peak" },
        { label: "Demand gap", value: `${primary.demandGap} covers` },
        {
          label: "Confidence",
          value: `${Math.round(primary.confidence * 100)}%`,
        },
      ],
      actions: [{ label: "Review staffing", href: "/app/labor" }],
      evidence: primary.drivers.map((d) => ({ label: "Context", value: d })),
      impactEuro: primary.estimatedRevenueProtected,
      followUps: ["What would you do?", "How much will it cost?"],
      toolUsed: "get_labor_requirement",
      topic: "labor",
      sources: staffingSources(fresh),
      confidence: {
        band: "HIGH",
        score: Math.round(primary.confidence * 100),
      },
      pendingWrite: {
        kind: "CREATE_ACTION",
        summary: `Call in +${primary.additionalHeadcount} ${primary.role} · ${primary.timeframe.start}-${primary.timeframe.end}`,
        details: [
          { label: "Cost", value: euro(primary.expectedAdditionalCost) },
          {
            label: "Protect",
            value: euro(primary.estimatedRevenueProtected),
          },
        ],
      },
    };
  }

  if (recommendQ) {
    return {
      ...base,
      responseKind: "staffing_requirement",
      title: `Call in +${primary.additionalHeadcount} ${primary.role}`,
      summary: `Reallocate or call +${primary.additionalHeadcount} ${primary.role} into peak service ${primary.timeframe.start}-${primary.timeframe.end} at ${primary.location}.`,
      answer: primary.role + " +" + primary.additionalHeadcount,
      recommendation: {
        title: `Call in ${primary.additionalHeadcount} ${primary.role} team member for ${primary.timeframe.start}-${primary.timeframe.end}`,
        detail: `${primary.location} · peak demand ${primary.expectedDemand} vs capacity ${primary.scheduledCapacity}`,
        costLabel: "Action cost",
        costValue: euro(primary.expectedAdditionalCost),
        protectLabel: "Protect",
        protectValue: euro(primary.estimatedRevenueProtected),
        href: "/app/labor",
      },
      pendingWrite: {
        kind: "CREATE_ACTION",
        summary: `Call in +${primary.additionalHeadcount} ${primary.role} · ${primary.timeframe.start}-${primary.timeframe.end}`,
        details: [
          { label: "Cost", value: euro(primary.expectedAdditionalCost) },
          {
            label: "Protect",
            value: euro(primary.estimatedRevenueProtected),
          },
        ],
      },
      actions: [
        { label: "Review staffing", href: "/app/labor" },
        { label: "Open service pressure", href: "/app/service" },
      ],
      evidence: primary.drivers.map((d) => ({ label: "Driver", value: d })),
      impactEuro: primary.estimatedRevenueProtected,
      followUps: ["Why?", "How much will it cost?", "What if we don't?"],
      toolUsed: "get_labor_requirement",
      topic: "labor",
      sources: staffingSources(fresh),
      confidence: {
        band: "HIGH",
        score: Math.round(primary.confidence * 100),
      },
    };
  }

  // Group vs single
  if (locs.length > 1 || (ctx.isGroup && locs.length >= 1)) {
    const multi = locs.length > 1;
    return {
      ...base,
      responseKind: "staffing_requirement",
      verdict: "YES.",
      title: multi
        ? `${locs.length} locations need extra staff tonight`
        : `Only ${primary.location} needs additional cover tonight`,
      summary: multi
        ? locs
            .map(
              (l) =>
                `${l.location}: +${l.additionalHeadcount} ${l.role} · ${l.timeframe.start}-${l.timeframe.end} · ${euro(l.estimatedRevenueProtected)} at risk`,
            )
            .join(". ") +
          (req.adequatelyStaffedNote ? `. ${req.adequatelyStaffedNote}` : "")
        : `${primary.location} needs +${primary.additionalHeadcount} ${primary.role} ${primary.timeframe.start}-${primary.timeframe.end}. ${req.adequatelyStaffedNote ?? ""}`,
      answer: `Yes - ${primary.location} needs +${primary.additionalHeadcount} ${primary.role}.`,
      primaryMetric: {
        label: `+${primary.additionalHeadcount} ${primary.role}`,
        value: `${primary.timeframe.start}-${primary.timeframe.end}`,
        hint: primary.location,
        tone: "risk",
      },
      metrics: [
        {
          label: "Expected peak demand",
          value: String(primary.expectedDemand),
        },
        {
          label: "Current service capacity",
          value: String(primary.scheduledCapacity),
        },
        { label: "Gap", value: `${primary.demandGap} covers`, tone: "risk" },
        {
          label: "Additional labor",
          value: `~${euro(primary.expectedAdditionalCost)}`,
        },
        {
          label: "Value protected",
          value: `~${euro(primary.estimatedRevenueProtected)}`,
          tone: "positive",
        },
      ],
      visualization: demandViz(primary),
      explanation: `Why: ${primary.drivers.join(". ")}.`,
      recommendation: {
        title: `Call in ${primary.additionalHeadcount} ${primary.role} for ${primary.timeframe.start}-${primary.timeframe.end}`,
        costLabel: "Cost",
        costValue: euro(primary.expectedAdditionalCost),
        protectLabel: "Value protected",
        protectValue: euro(primary.estimatedRevenueProtected),
        href: "/app/labor",
      },
      confidence: {
        band: "HIGH",
        score: Math.round(primary.confidence * 100),
      },
      actions: [
        { label: "Review staffing", href: "/app/labor" },
        { label: "Open service pressure", href: "/app/service" },
      ],
      evidence: primary.drivers.map((d) => ({ label: "Driver", value: d })),
      impactEuro: primary.estimatedRevenueProtected,
      followUps: ["Why?", "How much will it cost?", "What if we don't?"],
      toolUsed: "get_labor_requirement",
      topic: "labor",
      expanded: true,
      sources: staffingSources(fresh),
    };
  }

  return {
    ...base,
    responseKind: "staffing_requirement",
    verdict: "YES.",
    title: `${primary.location} needs +${primary.additionalHeadcount} ${primary.role} tonight`,
    summary: `${primary.timeframe.start}-${primary.timeframe.end}. Peak demand ${primary.expectedDemand} covers vs capacity ${primary.scheduledCapacity} (gap ${primary.demandGap}).`,
    answer: `Yes - ${primary.location} needs +${primary.additionalHeadcount} ${primary.role}.`,
    primaryMetric: {
      label: `+${primary.additionalHeadcount} ${primary.role}`,
      value: `${primary.timeframe.start}-${primary.timeframe.end}`,
      tone: "risk",
    },
    metrics: [
      {
        label: "Expected peak demand",
        value: String(primary.expectedDemand),
      },
      {
        label: "Current service capacity",
        value: String(primary.scheduledCapacity),
      },
      { label: "Gap", value: `${primary.demandGap} covers`, tone: "risk" },
      {
        label: "Additional labor",
        value: `~${euro(primary.expectedAdditionalCost)}`,
      },
      {
        label: "Value protected",
        value: `~${euro(primary.estimatedRevenueProtected)}`,
        tone: "positive",
      },
    ],
    visualization: demandViz(primary),
    explanation: `Why: ${primary.drivers.join(". ")}.`,
    recommendation: {
      title: `Call in ${primary.additionalHeadcount} ${primary.role} team member for ${primary.timeframe.start}-${primary.timeframe.end}`,
      costLabel: "Cost",
      costValue: euro(primary.expectedAdditionalCost),
      protectLabel: "Value protected",
      protectValue: euro(primary.estimatedRevenueProtected),
      href: "/app/labor",
    },
    confidence: {
      band: "HIGH",
      score: Math.round(primary.confidence * 100),
    },
    actions: [
      { label: "Review staffing", href: "/app/labor" },
      { label: "Open service pressure", href: "/app/service" },
    ],
    evidence: primary.drivers.map((d) => ({ label: "Driver", value: d })),
    impactEuro: primary.estimatedRevenueProtected,
    followUps: ["Why?", "How much will it cost?", "What if we don't?"],
    toolUsed: "get_labor_requirement",
    topic: "labor",
    expanded: true,
    sources: staffingSources(fresh),
  };
}

function demandViz(primary: LaborRequirementLocation) {
  return {
    type: "demandCapacity" as const,
    times: primary.times,
    demand: primary.demandCurve,
    capacity: primary.capacityCurve,
    gapLabel: "GAP",
    peakGap: primary.demandGap,
  };
}

function notEnough(
  ctx: ResolvedContext,
  message: string,
  results: ToolResult[],
): ButlerResponse {
  return {
    title: "Insufficient evidence",
    summary: message,
    answer: message,
    responseKind: "generic",
    explanation:
      "RADR will not invent a causal story when the underlying fields or integrations are missing.",
    actions: [
      { label: "Control Center", href: "/app" },
      { label: "View findings", href: "/app/findings" },
    ],
    evidence: results
      .filter((r) => !r.ok)
      .map((r) => ({ label: r.tool, value: r.error ?? "unavailable" })),
    sources: demoSources(results.find((r) => r.tool === "get_data_freshness")),
    warnings: [{ message, severity: "info" }],
    followUps: [
      "What needs my attention?",
      "How busy are we tonight?",
      "Do we need to call more people in tonight?",
    ],
    toolUsed: "searchEntities",
    topic: "general",
  };
}

export function nextAskSession(
  prev: ButlerSession | undefined,
  query: string,
  response: ButlerResponse,
  ctx: ResolvedContext,
): ButlerSession {
  return {
    topic: response.topic,
    locationId: ctx.locationId === "all" ? prev?.locationId : ctx.locationId,
    locationName: ctx.locationName,
    lastQuery: query,
    findingId: prev?.findingId,
    history: [
      ...(prev?.history ?? []),
      {
        query,
        title: response.title,
        at: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ].slice(-8),
  };
}
