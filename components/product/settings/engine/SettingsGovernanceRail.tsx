"use client";

import {
  GOVERNANCE_SUMMARY,
  currencyLabel,
  operatingModelLabel,
} from "@/lib/radr/product/settingsProofEngine";
import type { DemoSettingsState } from "@/lib/radr/product/demoSettings";
import {
  IconAccess,
  IconClock,
  IconCurrency,
  IconLocations,
  IconOrg,
  IconPolicies,
} from "./SettingsIcons";

type Props = {
  demo: DemoSettingsState;
  industryLabel: string;
};

export function SettingsGovernanceRail({ demo, industryLabel }: Props) {
  const rows = [
    {
      icon: IconClock,
      label: "Default timezone",
      value: demo.timezone,
      detail: null as string | null,
    },
    {
      icon: IconCurrency,
      label: "Primary currency",
      value: currencyLabel(demo.currency),
      detail: null,
    },
    {
      icon: IconOrg,
      label: "Operating model",
      value: industryLabel,
      detail: operatingModelLabel(demo.operatingModel),
    },
    {
      icon: IconLocations,
      label: "Locations",
      value: `${GOVERNANCE_SUMMARY.locationsTotal} total`,
      detail: `${GOVERNANCE_SUMMARY.restaurants} restaurants · ${GOVERNANCE_SUMMARY.hotels} hotels`,
    },
    {
      icon: IconAccess,
      label: "Active personas",
      value: `${GOVERNANCE_SUMMARY.personas} roles`,
      detail: "Group · Venue · Functional",
    },
    {
      icon: IconPolicies,
      label: "Policy coverage",
      value: `${GOVERNANCE_SUMMARY.policiesActive} policies`,
      detail: `Across ${GOVERNANCE_SUMMARY.policyCategories} categories`,
    },
  ];

  return (
    <aside className="se-rail" data-settings-rail="true" aria-label="Governance at a glance">
      <h3>Governance at a glance</h3>
      <p>Key settings and coverage for your organization.</p>
      <ul className="se-rail-list">
        {rows.map((r) => {
          const Ico = r.icon;
          return (
            <li key={r.label}>
              <span className="se-ico se-rail-ico" aria-hidden>
                <Ico />
              </span>
              <div>
                <strong>{r.label}</strong>
                <em>{r.value}</em>
                {r.detail ? <span className="se-rail-meta">{r.detail}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
