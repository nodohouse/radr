/**
 * Resolve conversational location + time context for Ask RADR.
 * Follow-ups inherit session location/period unless the question overrides.
 */

import { getLocation } from "@/lib/radr/operatingHero";
import { locationLabel } from "@/lib/product/demo/dashboard";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { DEMO_CLOCK } from "@/lib/radr/operatingPulse";
import type { ButlerSession } from "@/lib/radr/butler/types";
import type { AskRequest } from "./answerSchema";

export type ResolvedPeriod =
  | "today"
  | "tonight"
  | "yesterday"
  | "tomorrow"
  | "wtd"
  | "mtd"
  | "ytd"
  | "last_week"
  | "last_30d";

export type ResolvedContext = {
  locationId: string;
  locationIds: string[];
  locationName: string;
  period: ResolvedPeriod;
  periodLabel: string;
  isGroup: boolean;
  timezone: string;
  compareWith?: string;
  followUp: boolean;
};

const PERIOD_LABEL: Record<ResolvedPeriod, string> = {
  today: "Today",
  tonight: "Tonight",
  yesterday: DEMO_CLOCK.yesterdayLabel,
  tomorrow: "Tomorrow",
  wtd: "This week",
  mtd: "This month",
  ytd: "Year to date",
  last_week: "Last week",
  last_30d: "Last 30 days",
};

const LOCATION_ALIASES: { match: RegExp; id: string }[] = [
  { match: /\b(berlin mitte|berlin|mitte)\b/i, id: "loc_ber" },
  { match: /\bkreuzberg\b/i, id: "loc_ber_kreuz" },
  { match: /\b(new york flatiron|flatiron|nyc flatiron)\b/i, id: "loc_nyc" },
  { match: /\b(west village|nyc west village|new york west village)\b/i, id: "loc_nyc_wvill" },
  { match: /\b(new york|nyc|manhattan)\b/i, id: "loc_nyc" },
  { match: /\b(san francisco|hayes|sf)\b/i, id: "loc_sf" },
  { match: /\b(tokyo|shibuya)\b/i, id: "loc_tyo" },
  { match: /\b(singapore|marina bay)\b/i, id: "loc_sin" },
  { match: /\b(dubai|dubai marina)\b/i, id: "loc_dxb" },
  { match: /\b(sydney|surry hills)\b/i, id: "loc_syd" },
  { match: /\b(amsterdam central|ams central|amsterdam centrum|amsterdam)\b/i, id: "loc_ams" },
  { match: /\b(paris marais|paris|marais)\b/i, id: "loc_par" },
  { match: /\b(london soho|london|soho)\b/i, id: "loc_lon" },
];

function locationName(id: string): string {
  if (id === "all") return "All locations";
  try {
    return getLocation(id)?.venueName ?? locationLabel(id as LocationScope);
  } catch {
    return locationLabel(id as LocationScope);
  }
}

function resolvePeriod(q: string, fallback: string): ResolvedPeriod {
  if (/\btonight\b|\bdinner service\b|\bpeak service\b/i.test(q)) return "tonight";
  if (/\btomorrow\b/i.test(q)) return "tomorrow";
  if (/\byesterday\b|\blast (tue|tuesday|night|trading day)\b/i.test(q)) {
    return "yesterday";
  }
  if (/\btoday\b|\blunch\b/i.test(q)) return "today";
  if (/\blast week\b/i.test(q)) return "last_week";
  if (/\bthis week\b|\bwtd\b/i.test(q)) return "wtd";
  if (/\bthis month\b|\bmtd\b/i.test(q)) return "mtd";
  if (/\blast month\b|\bytd\b|\byear to date\b/i.test(q)) return "ytd";
  if (/\blast 30\b|\b30 days\b/i.test(q)) return "last_30d";
  if (/\bfriday\b/i.test(q)) return "yesterday";
  const p = fallback.toLowerCase();
  if (
    p === "today" ||
    p === "tonight" ||
    p === "yesterday" ||
    p === "wtd" ||
    p === "mtd" ||
    p === "ytd"
  ) {
    return p as ResolvedPeriod;
  }
  return "yesterday";
}

function extractLocationIds(q: string): string[] {
  const found: string[] = [];
  for (const row of LOCATION_ALIASES) {
    if (row.match.test(q) && !found.includes(row.id)) found.push(row.id);
  }
  if (/\ball (german|germany) (restaurants|locations|venues)\b/i.test(q)) {
    return ["loc_ber", "loc_ber_kreuz"];
  }
  if (/\ball (us|usa|american|united states) (restaurants|locations|venues)\b/i.test(q)) {
    return ["loc_nyc", "loc_nyc_wvill", "loc_sf"];
  }
  if (/\b(asia pacific|apac|all asia)\b/i.test(q)) {
    return ["loc_tyo", "loc_sin", "loc_syd"];
  }
  if (/\b(the )?netherlands\b|\ball amsterdam\b|\bamsterdam locations\b/i.test(q)) {
    return ["loc_ams"];
  }
  if (/\ball locations\b|\bwhole group\b/i.test(q)) {
    return ["all"];
  }
  return found;
}

function isFollowUp(q: string, session?: ButlerSession): boolean {
  if (!session?.history?.length) return false;
  if (/^(why|and|what about|how about|also|then|ok|yes|no)\b/i.test(q.trim())) {
    return true;
  }
  if (/^(what caused|what drove|and [a-z])/i.test(q.trim())) return true;
  if (/what (would|should) (you|we) do|recommend|do nothing|happens if|what if we don/i.test(q)) {
    return true;
  }
  if (/^how much\b|^cost\??$/i.test(q.trim())) return true;
  if (q.trim().split(/\s+/).length <= 4 && session.topic) return true;
  return false;
}

export function resolveAskContext(
  question: string,
  req: AskRequest,
  session?: ButlerSession,
): ResolvedContext {
  const q = question.trim();
  const followUp = isFollowUp(q, session);
  const mentioned = extractLocationIds(q);

  let locationId =
    mentioned[0] ??
    (followUp && session?.locationId ? session.locationId : undefined) ??
    (req.locationScope === "all" || req.locationScope.startsWith("region_")
      ? "loc_ber"
      : req.locationScope);

  if (/\b(what about|and|how about)\b/i.test(q) && mentioned[0]) {
    locationId = mentioned[0];
  }

  const compareMatch = q.match(
    /compare\s+(.+?)\s+(?:and|vs\.?|versus|with)\s+(.+?)(?:\?|$)/i,
  );
  let compareWith: string | undefined;
  let locationIds = mentioned.length ? mentioned : [locationId];

  if (compareMatch) {
    const a = extractLocationIds(compareMatch[1] ?? "");
    const b = extractLocationIds(compareMatch[2] ?? "");
    if (a[0] && b[0]) {
      locationId = a[0];
      compareWith = b[0];
      locationIds = [a[0], b[0]];
    }
  }

  if (!compareWith && mentioned.length >= 2) {
    locationId = mentioned[0]!;
    compareWith = mentioned[1];
    locationIds = mentioned.slice(0, 2);
  }

  const period = resolvePeriod(q, req.period);

  const venue = (() => {
    try {
      return getLocation(locationId);
    } catch {
      return null;
    }
  })();

  const treatAsGroup =
    (locationId === "all" ||
      ((req.locationScope === "all" || req.locationScope.startsWith("region_")) &&
        mentioned.length === 0 &&
        !followUp)) &&
    !compareWith;

  return {
    locationId: treatAsGroup ? "all" : locationId,
    locationIds,
    locationName: treatAsGroup ? "All locations" : locationName(locationId),
    period,
    periodLabel: PERIOD_LABEL[period],
    isGroup: treatAsGroup,
    timezone: venue?.timezone ?? "Europe/Berlin",
    compareWith,
    followUp,
  };
}

export function dashPeriodOf(
  period: ResolvedPeriod,
): "today" | "yesterday" | "wtd" | "mtd" | "ytd" {
  if (period === "tonight" || period === "today" || period === "tomorrow") return "today";
  if (period === "wtd" || period === "last_week") return "wtd";
  if (period === "mtd" || period === "last_30d") return "mtd";
  if (period === "ytd") return "ytd";
  return "yesterday";
}
