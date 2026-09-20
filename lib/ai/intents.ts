/**
 * Ask RADR intent classification.
 * Prefer answering from domain data over clarifying.
 * CLARIFY only when the question is truly empty of operational signal.
 */

export type AskIntentClass =
  | "CONTROL_CENTER_SUMMARY"
  | "LABOR_REQUIREMENT"
  | "LABOR_COST"
  | "RESERVATION_SUMMARY"
  | "WAITLIST_STATUS"
  | "CANCELLATION_EXPOSURE"
  | "RECOVERY_OPPORTUNITY"
  | "SERVICE_PRESSURE"
  | "REVENUE_ANALYSIS"
  | "MARGIN_ANALYSIS"
  | "SUPPLIER_VARIANCE"
  | "INVOICE_ANALYSIS"
  | "FORECAST"
  | "WEATHER_CONTEXT"
  | "GUEST_VALUE"
  | "HOSPITALITY_SAFETY"
  | "LOCATION_COMPARISON"
  | "VERIFIED_VALUE"
  | "CHANNEL_ECONOMICS"
  | "ACTIVE_REVENUE"
  | "DATA_PROVENANCE"
  | "DATA_HEALTH"
  | "NAVIGATION"
  | "METRIC_EXPLANATION"
  | "FOLLOW_UP"
  | "CLARIFY"
  | "TERM";

export const ASK_INTENT_CLASSES: AskIntentClass[] = [
  "CONTROL_CENTER_SUMMARY",
  "LABOR_REQUIREMENT",
  "LABOR_COST",
  "RESERVATION_SUMMARY",
  "WAITLIST_STATUS",
  "CANCELLATION_EXPOSURE",
  "RECOVERY_OPPORTUNITY",
  "SERVICE_PRESSURE",
  "REVENUE_ANALYSIS",
  "MARGIN_ANALYSIS",
  "SUPPLIER_VARIANCE",
  "INVOICE_ANALYSIS",
  "FORECAST",
  "WEATHER_CONTEXT",
  "GUEST_VALUE",
  "HOSPITALITY_SAFETY",
  "LOCATION_COMPARISON",
  "VERIFIED_VALUE",
  "CHANNEL_ECONOMICS",
  "ACTIVE_REVENUE",
  "DATA_PROVENANCE",
  "DATA_HEALTH",
  "NAVIGATION",
  "METRIC_EXPLANATION",
  "FOLLOW_UP",
  "CLARIFY",
  "TERM",
];

export type ClassifiedIntent = {
  intent: AskIntentClass;
  confidence: number;
  clarification?: string;
  /** Why this class won - for server logs only */
  reason: string;
};

type Signal = { intent: AskIntentClass; weight: number; reason: string };

function score(signals: Signal[]): { intent: AskIntentClass; score: number; reasons: string[] } | null {
  const totals = new Map<AskIntentClass, { score: number; reasons: string[] }>();
  for (const s of signals) {
    const cur = totals.get(s.intent) ?? { score: 0, reasons: [] };
    cur.score += s.weight;
    cur.reasons.push(s.reason);
    totals.set(s.intent, cur);
  }
  let best: AskIntentClass | null = null;
  let bestScore = 0;
  let reasons: string[] = [];
  for (const [intent, row] of totals) {
    if (row.score > bestScore) {
      best = intent;
      bestScore = row.score;
      reasons = row.reasons;
    }
  }
  if (!best) return null;
  return { intent: best, score: bestScore, reasons };
}

/**
 * When regex signals are weak, still answer from RADR data using
 * time language + UI period - never dump Control Center unless asked.
 */
function groundedDefault(
  q: string,
  uiPeriod?: string,
): ClassifiedIntent {
  const period = (uiPeriod ?? "").toLowerCase();

  if (/\btonight\b|\bdinner\b|\bpeak service\b/i.test(q) || period === "tonight") {
    return {
      intent: "RESERVATION_SUMMARY",
      confidence: 0.62,
      reason: "default_tonight_outlook",
    };
  }
  if (/\btomorrow\b/i.test(q) || period === "tomorrow") {
    return {
      intent: "FORECAST",
      confidence: 0.58,
      reason: "default_tomorrow",
    };
  }
  if (
    /\byesterday\b|\blast (night|tue|tuesday|trading day)\b/i.test(q) ||
    period === "yesterday"
  ) {
    if (/margin|profit|cost/i.test(q)) {
      return {
        intent: "MARGIN_ANALYSIS",
        confidence: 0.65,
        reason: "default_yesterday_margin",
      };
    }
    return {
      intent: "REVENUE_ANALYSIS",
      confidence: 0.6,
      reason: "default_yesterday_trading",
    };
  }
  if (/\btoday\b|\blunch\b/i.test(q) || period === "today") {
    return {
      intent: "REVENUE_ANALYSIS",
      confidence: 0.55,
      reason: "default_today_trading",
    };
  }
  if (/staff|people|foh|labor|cover|shift/i.test(q)) {
    return {
      intent: "LABOR_REQUIREMENT",
      confidence: 0.55,
      reason: "default_laborish",
    };
  }
  if (/book|guest|cover|seat|busy|service|occup/i.test(q)) {
    return {
      intent: "RESERVATION_SUMMARY",
      confidence: 0.55,
      reason: "default_serviceish",
    };
  }
  if (/money|euro|€|revenue|sales|margin|trading|perform/i.test(q)) {
    return {
      intent: "REVENUE_ANALYSIS",
      confidence: 0.55,
      reason: "default_financialish",
    };
  }

  // Multi-word operational question with no clear domain → trading snapshot, not clarify fluff
  const words = q.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return {
      intent: "REVENUE_ANALYSIS",
      confidence: 0.48,
      reason: "default_trading_snapshot",
    };
  }

  return {
    intent: "CLARIFY",
    confidence: 0.3,
    clarification:
      "Ask about tonight's service, staffing, margin, revenue, waitlist, or what needs attention.",
    reason: "empty_signal",
  };
}

/** Classify a user question into an Ask intent class. */
export function classifyAskIntent(
  question: string,
  opts?: {
    followUp?: boolean;
    priorIntent?: AskIntentClass | string;
    priorTopic?: string;
    priorQuery?: string;
    /** UI / resolved period - used for grounded defaults */
    period?: string;
  },
): ClassifiedIntent {
  const q = question.trim().toLowerCase();
  const signals: Signal[] = [];

  // Follow-ups inherit subject
  if (opts?.followUp) {
    const prior = String(opts.priorIntent ?? opts.priorTopic ?? "");
    if (/^(why|what caused|what drove)\b|^why\??$/i.test(q)) {
      if (
        /labor|staff|requirement/i.test(prior) ||
        /staff|people|foh|labor|understaff/i.test(opts.priorQuery ?? "")
      ) {
        return {
          intent: "LABOR_REQUIREMENT",
          confidence: 0.9,
          reason: "followup_why_staffing",
        };
      }
      if (/margin/i.test(prior) || /margin/i.test(opts.priorQuery ?? "")) {
        return {
          intent: "MARGIN_ANALYSIS",
          confidence: 0.9,
          reason: "followup_why_margin",
        };
      }
      if (/attention|control|finding|location_risk|reserv/i.test(prior)) {
        return {
          intent: "LABOR_REQUIREMENT",
          confidence: 0.85,
          reason: "followup_why_attention_labor",
        };
      }
      return {
        intent: "REVENUE_ANALYSIS",
        confidence: 0.7,
        reason: "followup_why_trading",
      };
    }
    if (/how much|cost|€|euro/i.test(q) && /labor|staff/i.test(prior)) {
      return {
        intent: "LABOR_REQUIREMENT",
        confidence: 0.9,
        reason: "followup_cost_staffing",
      };
    }
    if (
      /what if|do nothing|don'?t|happens if/i.test(q) &&
      /labor|staff/i.test(prior)
    ) {
      return {
        intent: "LABOR_REQUIREMENT",
        confidence: 0.9,
        reason: "followup_consequence_staffing",
      };
    }
    if (
      /what (would|should) (you|we) do|recommend/i.test(q) &&
      /labor|staff|attention/i.test(prior)
    ) {
      return {
        intent: "LABOR_REQUIREMENT",
        confidence: 0.88,
        reason: "followup_recommend_staffing",
      };
    }
    if (/\b(and|what about|how about)\b/i.test(q)) {
      if (
        /margin|perform/i.test(opts.priorQuery ?? "") ||
        /margin/i.test(prior)
      ) {
        return {
          intent: "MARGIN_ANALYSIS",
          confidence: 0.88,
          reason: "followup_location_margin",
        };
      }
      if (
        /staff|labor|people|tonight/i.test(opts.priorQuery ?? "") ||
        /labor|reserv/i.test(prior)
      ) {
        return {
          intent: "LABOR_REQUIREMENT",
          confidence: 0.88,
          reason: "followup_location_staffing",
        };
      }
      return {
        intent: "REVENUE_ANALYSIS",
        confidence: 0.75,
        reason: "followup_location_trading",
      };
    }
  }

  // Terminology
  if (/what (are|is) covers\b|define covers|covers\?/i.test(q)) {
    return { intent: "TERM", confidence: 0.99, reason: "covers_term" };
  }

  // Navigation
  if (
    q.startsWith("/") ||
    /^(take me to|open |go to |show (me )?(the )?(control center|service map|labor|buy))/i.test(
      q,
    )
  ) {
    return { intent: "NAVIGATION", confidence: 0.9, reason: "nav" };
  }

  // LABOR REQUIREMENT
  if (
    /call (more )?people|call (someone|staff)|more (people|staff|hands)|need (more )?staff|need .+ (in|tonight)|understaff|short[- ]?staff|are we short|who'?s getting slammed|getting slammed|where (are we|we are) (short|understaff)|staffing (gap|need|requirement)|extra (foh|boh|server)|\+1 foh|bring (someone|people) in/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "LABOR_REQUIREMENT",
      weight: 8,
      reason: "staffing_need",
    });
  }
  if (/\b(foh|boh)\b/.test(q) && /tonight|peak|service|need|call|short/i.test(q)) {
    signals.push({ intent: "LABOR_REQUIREMENT", weight: 5, reason: "role_tonight" });
  }
  if (
    /do we need .+ tonight|need .+ tonight/i.test(q) &&
    /people|staff|cover|hand/i.test(q)
  ) {
    signals.push({
      intent: "LABOR_REQUIREMENT",
      weight: 9,
      reason: "need_tonight_people",
    });
  }

  // LABOR COST
  if (
    /labor (cost|looks|high|%|percent)|why is labor|labor variance|wage|payroll/i.test(
      q,
    )
  ) {
    signals.push({ intent: "LABOR_COST", weight: 7, reason: "labor_cost" });
  }

  // WEATHER AS OPERATING CONTEXT
  /** Weather, terrace, outdoor - not substrings like “training”. */
  if (
    /\bweather\b|\bterrace\b|\brain\b|\bsunny\b|\bwarm\b|dry (lunch|weather)|\boutdoor\b|open the terrace/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "WEATHER_CONTEXT",
      weight: 8,
      reason: "weather_ops",
    });
  }
  if (/why is tomorrow|tomorrow.?s forecast higher|forecast higher/i.test(q)) {
    signals.push({ intent: "WEATHER_CONTEXT", weight: 7, reason: "tomorrow_forecast" });
    signals.push({ intent: "FORECAST", weight: 5, reason: "forecast" });
  }
  if (
    /service pressure|slammed|peak (service|pressure)|floor (pressure|load)/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "SERVICE_PRESSURE",
      weight: 6,
      reason: "service_pressure",
    });
  }

  // WAITLIST
  if (
    /waitlist|waiting (list|tonight)|people (are )?waiting|on the wait/i.test(q)
  ) {
    signals.push({ intent: "WAITLIST_STATUS", weight: 8, reason: "waitlist" });
  }

  // RECOVERY / CANCELLATIONS
  if (/recover|fill that cancel|still recover|rebook/i.test(q)) {
    signals.push({
      intent: "RECOVERY_OPPORTUNITY",
      weight: 7,
      reason: "recovery",
    });
  }
  if (/cancel|cancellation|no[- ]?show/i.test(q)) {
    signals.push({
      intent: "CANCELLATION_EXPOSURE",
      weight: 6,
      reason: "cancel",
    });
  }

  // GUEST VALUE / RETURNING REVENUE / HOSPITALITY
  if (
    /who(?:'s| is) coming|returning (guest|revenue)|guest (brief|value|tonight)|high[- ]?value (guest|return)|service notes? tonight|lapsed (guest|high)|which guests|guest spend|repeat (visit|revenue|guest)|who hasn'?t returned|bluefin.*(guest|order)|guests? (usually|historically) order/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "GUEST_VALUE",
      weight: 9,
      reason: "guest_value",
    });
  }
  if (
    /important (service )?notes?|preferences tonight|who is returning|most valuable (returning )?guest/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "GUEST_VALUE",
      weight: 8,
      reason: "guest_service",
    });
  }
  if (
    /\ballerg|\bdietary\b|hospitality (tonight|brief)|birthday|anniversary|engagement|kitchen (need|know|safety)|what should (the )?kitchen|which tables? have (allergy|dietary)|table \d+.*(allerg|diet)|safe(ly)? order|peanut|shellfish|confirm(ation)?.*(allerg|kitchen)/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "HOSPITALITY_SAFETY",
      weight: 10,
      reason: "hospitality_safety",
    });
  }

  // RESERVATIONS / TONIGHT OUTLOOK
  if (
    /how many (reservations|covers|booked|guests)|how busy|tonight looking|what.?s tonight|how(?:'s| is| we) tonight|reservations tonight|booked (tonight|guests)|any big groups|group booking|large (party|parties|group)/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "RESERVATION_SUMMARY",
      weight: 7,
      reason: "reservations",
    });
  }
  if (
    /\btonight\b/.test(q) &&
    /how (will|are|do|did|is|'s)\b|how we (do|doing)|will we (do|perform)|do (good|well)|looking|outlook|expect|going|perform|busy|covers|bookings?|service/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "RESERVATION_SUMMARY",
      weight: 9,
      reason: "tonight_outlook",
    });
  }
  if (
    /how (will|are|do) we (do|doing|perform)|how we (do|doing)|will we do (good|well)|how(?:'s| is) (service|tonight) looking/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "RESERVATION_SUMMARY",
      weight: 8,
      reason: "performance_outlook",
    });
  }
  if (/table|available between|floor plan|19:00|21:00/i.test(q) && !/invoice/i.test(q)) {
    signals.push({ intent: "RESERVATION_SUMMARY", weight: 5, reason: "tables" });
  }

  // MARGIN
  if (/margin/i.test(q)) {
    signals.push({ intent: "MARGIN_ANALYSIS", weight: 8, reason: "margin" });
  }

  // CHANNEL ECONOMICS / DELIVERY
  if (
    /delivery|uber eats|deliveroo|wolt|takeaway|dine-?in|channel mix|channel economics|pause delivery|commission|aggregator/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "CHANNEL_ECONOMICS",
      weight: 9,
      reason: "channel_delivery",
    });
  }

  // ACTIVE REVENUE - recover + guest opportunity (specific; don't steal cancel exposure)
  if (
    /cancelled tables tonight|any cancellations|any no-?shows|refill table|post this opening|who should we offer this table|guest opportunit|what should table \d+|tonight'?s best guest|service recommendations? perform|active revenue|leaving money on the table|champagne pairing|hold for walk-?ins|revenue opportunit|how much revenue did we recover|recovered this month|should we post|which channel is best|draft (the )?instagram|last-?table template|recovery template|social recovery|tables? (are )?still exposed|can we refill/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "ACTIVE_REVENUE",
      weight: 10,
      reason: "active_revenue",
    });
  }

  // REVENUE - historical / non-tonight
  if (
    /revenue|sales|how (are|did) we (do|doing|did)|how did we do/i.test(q) &&
    !/\btonight\b/.test(q)
  ) {
    signals.push({ intent: "REVENUE_ANALYSIS", weight: 6, reason: "revenue" });
  }

  // SUPPLIER / INVOICE
  if (
    /supplier|invoice|contract price|food cost|produce|purchasing|paying too much|mismatch/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "SUPPLIER_VARIANCE",
      weight: 7,
      reason: "supplier",
    });
  }
  if (/invoice/i.test(q)) {
    signals.push({ intent: "INVOICE_ANALYSIS", weight: 5, reason: "invoice" });
  }

  // VERIFIED VALUE + LEARN
  if (/table 14|actually spend/i.test(q)) {
    signals.push({ intent: "VERIFIED_VALUE", weight: 10, reason: "table14" });
  }
  if (
    /verified|recovered this month|how much money has radr|radr save|did we verify/i.test(
      q,
    )
  ) {
    signals.push({ intent: "VERIFIED_VALUE", weight: 8, reason: "verified" });
  }
  if (/what did (you|radr) learn|expected vs|outcome retained|variance/i.test(q)) {
    signals.push({ intent: "VERIFIED_VALUE", weight: 9, reason: "learn_stage" });
  }
  if (/what have you prepared|what('s| is) prepared|ready for approval/i.test(q)) {
    signals.push({
      intent: "CONTROL_CENTER_SUMMARY",
      weight: 8,
      reason: "prepare_stage",
    });
  }
  if (/what are you observing|what did you detect/i.test(q)) {
    signals.push({
      intent: "CONTROL_CENTER_SUMMARY",
      weight: 8,
      reason: "observe_detect_stage",
    });
  }

  // FORECAST
  if (/\bforecast\b/i.test(q)) {
    signals.push({ intent: "FORECAST", weight: 6, reason: "forecast" });
  }

  // COMPARE
  if (
    /\bcompare\b|\bvs\.?\b|\bversus\b|\boutperform|new york locations|amsterdam locations|why is (zuid|west village)/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "LOCATION_COMPARISON",
      weight: 8,
      reason: "compare",
    });
  }

  // DATA
  if (
    /where does|come from|€\s*408|408|exposure breakdown|provenance|sources/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "DATA_PROVENANCE",
      weight: 8,
      reason: "provenance",
    });
  }
  if (/fresh|sync|data health|stale/i.test(q)) {
    signals.push({ intent: "DATA_HEALTH", weight: 7, reason: "health" });
  }

  // CONTROL CENTER - only explicit overview / attention language
  if (
    /what needs? (my )?attention|how are we doing\??$|give me (the )?overview|what'?s happening (today|tonight)\??$|which (restaurant|location) needs? (my )?attention|which location worries|worst (location|performing)|what should i worry|what.?s changed|changed since|worry about tonight|what should i fix first|fix first|currently exposed|how much (is |are )?(currently )?expos|unresolved exposure/i.test(
      q,
    )
  ) {
    signals.push({
      intent: "CONTROL_CENTER_SUMMARY",
      weight: 8,
      reason: "overview",
    });
  }

  if (/what (would|should) (you|we) do|\brecommend\b/i.test(q)) {
    signals.push({
      intent: "LABOR_REQUIREMENT",
      weight: 4,
      reason: "recommend",
    });
  }
  if (/do nothing|happens if i do nothing|what if we don/i.test(q)) {
    signals.push({
      intent: "LABOR_REQUIREMENT",
      weight: 4,
      reason: "consequence",
    });
  }

  if (/^(berlin|amsterdam|paris|london|zuid|mitte)\??$/i.test(q.trim())) {
    signals.push({
      intent: "CONTROL_CENTER_SUMMARY",
      weight: 4,
      reason: "location_pin",
    });
  }

  // Ambiguous single-token labor
  if (/^labor\??$|^staff(ing)?\??$/i.test(q.trim())) {
    return {
      intent: "CLARIFY",
      confidence: 0.4,
      clarification:
        "Staffing for tonight, or labor cost vs plan?",
      reason: "ambiguous_labor",
    };
  }

  const ranked = score(signals);
  if (ranked && ranked.score >= 2) {
    if (
      ranked.intent === "LABOR_COST" &&
      /call|more people|short|understaff|slammed|need.*staff/i.test(q)
    ) {
      return {
        intent: "LABOR_REQUIREMENT",
        confidence: 0.92,
        reason: "staffing_overrides_cost",
      };
    }
    return {
      intent: ranked.intent,
      confidence: Math.min(0.98, 0.45 + ranked.score / 12),
      reason: ranked.reasons.join("|"),
    };
  }

  // Weak signals → still answer from data using time / UI period
  return groundedDefault(q, opts?.period);
}
