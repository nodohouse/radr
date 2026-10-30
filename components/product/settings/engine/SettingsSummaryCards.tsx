"use client";

import {
  type SettingsSectionId,
} from "@/lib/radr/product/settingsProofEngine";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";
import {
  IconAccess,
  IconLocations,
  IconOrg,
  IconPolicies,
} from "./SettingsIcons";

type Props = {
  orgName: string;
  demo: DemoSettingsState;
  industryLabel: string;
  onSelect: (id: SettingsSectionId) => void;
};

export function SettingsSummaryCards({
  orgName,
  demo,
  industryLabel,
  onSelect,
}: Props) {
  const { org, isHotel } = useDemoOrg();
  const policies = demo.policies.filter(p => isHotel || !["housekeeping_reassign", "hotel_channel_hold"].includes(p.id));
  const categories = new Set(policies.map(p => p.category)).size;
  const cards: {
    id: SettingsSectionId;
    label: string;
    value: string;
    detail: string;
    icon: typeof IconOrg;
  }[] = [
    {
      id: "organization",
      label: "Organization",
      value: orgName,
      detail: `${industryLabel} · Current demo organization`,
      icon: IconOrg,
    },
    {
      id: "locations",
      label: "Locations",
      value: String(org.locations.length),
      detail: `${org.locations.length} ${industryLabel.toLowerCase()}`,
      icon: IconLocations,
    },
    {
      id: "access",
      label: "Access roles",
      value: String(demo.users.length),
      detail: "Active personas",
      icon: IconAccess,
    },
    {
      id: "policies",
      label: "Policies active",
      value: String(policies.filter(p => p.status === "active").length),
      detail: `Across ${categories} categories`,
      icon: IconPolicies,
    },
  ];

  return (
    <div className="se-summary" data-settings-summary="true">
      {cards.map((c) => {
        const Ico = c.icon;
        return (
          <button
            key={c.id}
            type="button"
            className="se-sum-card"
            data-summary-card={c.id}
            onClick={() => onSelect(c.id)}
          >
            <span className="se-ico se-sum-ico" aria-hidden>
              <Ico />
            </span>
            <span className="se-sum-copy">
              <em>{c.label}</em>
              <strong>{c.value}</strong>
              <span>{c.detail}</span>
            </span>
            <i aria-hidden>›</i>
          </button>
        );
      })}
    </div>
  );
}
