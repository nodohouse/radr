/**
 * Profile-driven nav labels — Rooms / Units / Service from terminology.
 */

import type { HospitalityOperatingProfile } from "@/lib/radr/domain/hospitalityOperatingProfile";
import { terminologyForProfile } from "@/lib/radr/operating/terminology";

export type NavItemLike = {
  href: string;
  label: string;
  exact?: boolean;
};

export type NavSectionLike = {
  label: string;
  items: NavItemLike[];
};

/**
 * Adapt role-plan sections to venue-native labels.
 * Restaurant keeps Operation / Service; hotel → Property / Rooms; residences → Portfolio / Units.
 */
export function adaptNavForProfile(
  sections: NavSectionLike[],
  profile: HospitalityOperatingProfile,
): NavSectionLike[] {
  const terms = terminologyForProfile(profile);
  const serviceLabel = terms.inventoryUnitPlural;
  const id = profile.id;

  const isHotel =
    id === "boutique_hotel" || id === "hotel" || id === "resort_mixed";
  const isResidences =
    id === "serviced_apartments" || id === "vacation_rental";

  if (!isHotel && !isResidences) {
    return sections.map((sec) => ({
      ...sec,
      items: sec.items.map((item) =>
        item.href === "/app/service"
          ? { ...item, label: "Service" }
          : item,
      ),
    }));
  }

  const sectionLabel = isResidences ? "Portfolio" : "Property";

  return sections.map((sec) => {
    const remapSection =
      sec.label === "Operation" ||
      sec.label === "Kitchen" ||
      sec.label === "Floor" ||
      sec.label === "Property" ||
      sec.label === "Portfolio";

    const items = sec.items.map((item) =>
      item.href === "/app/service"
        ? { ...item, label: serviceLabel }
        : item,
    );

    if (remapSection) {
      return { label: sectionLabel, items };
    }
    return { ...sec, items };
  });
}
