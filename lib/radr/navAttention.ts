import type { RoleView } from "@/lib/product/types";
import { selectNeedsJudgmentCount } from "@/lib/radr/product/selectNeedsJudgment";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { houseNeedsYouCount } from "@/lib/radr/product/houseAttention";

export type NavBadgeTone = "attention" | "watch" | "live";

export type NavBadge = {
  count: number;
  tone: NavBadgeTone;
  label: string;
  radar?: boolean;
};

export function navBadgesForScope(
  scope: string,
  role: RoleView = "gm",
  vertical: DemoVerticalFamily = "restaurant",
): Record<string, NavBadge> {
  const locationId =
    !scope || scope === "all" || scope.startsWith("region_")
      ? undefined
      : scope === "loc_ber"
        ? "loc_berlin_mitte"
        : scope;
  const needs = selectNeedsJudgmentCount({ role, vertical, locationId });
  const handling = scopedDecisionsForDemo(
    listDecisionRecords(),
    role,
    vertical,
  ).filter((r) => {
    if (recordAttention(r) !== "handling") return false;
    if (!locationId) return true;
    return r.locationId === locationId || r.locationId === "loc_ber";
  }).length;
  const houseNeeds = houseNeedsYouCount(vertical);

  const badges: Record<string, NavBadge> = {};

  if (needs > 0) {
    badges["/app"] = {
      count: needs,
      tone: "attention",
      label:
        needs === 1
          ? "1 signal needs your judgment"
          : `${needs} signals need your judgment`,
    };
    badges["/app/decisions"] = {
      count: needs,
      tone: "attention",
      label:
        needs === 1 ? "1 needs judgment" : `${needs} need judgment`,
    };
  }

  if (houseNeeds > 0) {
    badges["/app/house"] = {
      count: houseNeeds,
      tone: "attention",
      label:
        houseNeeds === 1
          ? "1 house gap needs you"
          : `${houseNeeds} house gaps need you`,
    };
  }

  if (handling > 0) {
    badges["/app/controls"] = {
      count: handling,
      tone: "watch",
      label:
        handling === 1
          ? "1 RADR is handling"
          : `${handling} RADR is handling`,
    };
  }

  return badges;
}

export function badgeForPath(
  badges: Record<string, NavBadge>,
  href: string,
): NavBadge | null {
  return badges[href] ?? null;
}
