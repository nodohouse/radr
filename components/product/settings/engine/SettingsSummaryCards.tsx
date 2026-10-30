"use client";

import {
  GOVERNANCE_SUMMARY,
  type SettingsSectionId,
} from "@/lib/radr/product/settingsProofEngine";
import {
  IconAccess,
  IconLocations,
  IconOrg,
  IconPolicies,
} from "./SettingsIcons";

type Props = {
  orgName: string;
  industryLabel: string;
  onSelect: (id: SettingsSectionId) => void;
};

export function SettingsSummaryCards({
  orgName,
  industryLabel,
  onSelect,
}: Props) {
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
      detail: `${industryLabel} · 2 demo modes`,
      icon: IconOrg,
    },
    {
      id: "locations",
      label: "Locations",
      value: String(GOVERNANCE_SUMMARY.locationsTotal),
      detail: `${GOVERNANCE_SUMMARY.restaurants} restaurants · ${GOVERNANCE_SUMMARY.hotels} hotels`,
      icon: IconLocations,
    },
    {
      id: "access",
      label: "Access roles",
      value: String(GOVERNANCE_SUMMARY.personas),
      detail: "Active personas",
      icon: IconAccess,
    },
    {
      id: "policies",
      label: "Policies active",
      value: String(GOVERNANCE_SUMMARY.policiesActive),
      detail: `Across ${GOVERNANCE_SUMMARY.policyCategories} categories`,
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
