/**
 * Persona → default Live level + metric lens.
 */

import type { RoleView } from "@/lib/product/types";
import type { LiveLevel } from "@/lib/radr/spatial-live/types";

export type LiveLens = "financial" | "operations" | "service" | "rooms" | "pace";

export function liveDefaultForRole(
  role: RoleView,
  vertical: "restaurant" | "hotel",
): { level: LiveLevel; lens: LiveLens; homeEntityId?: string } {
  if (vertical === "hotel") {
    if (role === "cfo" || role === "finance" || role === "owner") {
      return { level: "estate", lens: "financial" };
    }
    if (role === "revenue_manager") {
      return { level: "estate", lens: "pace" };
    }
    if (role === "housekeeping_manager") {
      return {
        level: "floor",
        lens: "rooms",
        homeEntityId: "loc_canal_house__floor_7",
      };
    }
    if (role === "coo" || role === "regional") {
      return { level: "estate", lens: "operations" };
    }
    // hotel_gm, fb_operator, etc.
    return {
      level: "property",
      lens: "operations",
      homeEntityId: "loc_canal_house",
    };
  }

  // restaurant
  if (role === "cfo" || role === "finance" || role === "owner") {
    return { level: "estate", lens: "financial" };
  }
  if (role === "coo" || role === "regional") {
    return { level: "estate", lens: "operations" };
  }
  if (role === "fb_operator" || role === "host" || role === "server") {
    return {
      level: "venue",
      lens: "service",
      homeEntityId: "loc_berlin_mitte",
    };
  }
  if (role === "head_chef" || role === "kitchen") {
    return {
      level: "venue",
      lens: "operations",
      homeEntityId: "loc_berlin_mitte",
    };
  }
  // GM
  return {
    level: "venue",
    lens: "operations",
    homeEntityId: "loc_berlin_mitte",
  };
}
