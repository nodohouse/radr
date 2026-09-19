/**
 * Rail / tab attention cues - scarce actionable counts only.
 * Sourced exclusively from composeRoleAttention (single SoT).
 */

import type { RoleView } from "@/lib/product/types";
import { attentionForScope } from "@/lib/radr/roleAttention";

export type NavBadgeTone = "attention" | "watch" | "live";

export type NavBadge = {
  count: number;
  tone: NavBadgeTone;
  /** Short aria hint, e.g. "2 need you" */
  label: string;
  /** @deprecated Never use glowing radar - kept optional for type compat */
  radar?: boolean;
};

/**
 * Badges only when the current role truly has unresolved attention.
 * Zero ⇒ no badge (do not invent demo floors).
 */
export function navBadgesForScope(
  scope: string,
  role: RoleView = "gm",
): Record<string, NavBadge> {
  const attn = attentionForScope(scope, role);
  const badges: Record<string, NavBadge> = {};

  if (attn.needsYou > 0) {
    badges["/app"] = {
      count: attn.needsYou,
      tone: "attention",
      label:
        attn.needsYou === 1
          ? "1 thing needs you"
          : `${attn.needsYou} things need you`,
    };
    badges["/app/decisions"] = {
      count: attn.needsYou,
      tone: "attention",
      label:
        attn.needsYou === 1
          ? "1 needs attention"
          : `${attn.needsYou} need attention`,
    };
  }

  if (attn.readyForApproval > 0) {
    badges["/app/controls"] = {
      count: attn.readyForApproval,
      tone: "watch",
      label:
        attn.readyForApproval === 1
          ? "1 ready for approval"
          : `${attn.readyForApproval} ready for approval`,
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
