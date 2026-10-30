"use client";

import { SETTINGS_NAV, type SettingsSectionId } from "@/lib/radr/product/settingsProofEngine";
import Link from "next/link";

type Props = {
  section: SettingsSectionId;
};

export function SettingsSectionStub({ section }: Props) {
  const meta = SETTINGS_NAV.find((n) => n.id === section);

  if (section === "integrations") {
    return (
      <section className="se-stub" data-settings-section={section}>
        <h2>Integrations</h2>
        <p>
          Connection governance and write permissions live with the Systems
          layer. Manage live connectors in Connections; Data Health remains the
          trust surface.
        </p>
        <p style={{ marginTop: 14 }}>
          <Link href="/app/connections" className="se-docs">
            Manage Connections →
          </Link>{" "}
          <Link href="/app/data-health" className="se-docs">
            View Data Health →
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="se-stub" data-settings-section={section}>
      <h2>{meta?.name ?? section}</h2>
      <p>
        {meta?.detail}. This governance section ships in a later pass — navigation
        and deep links are live so you can route here now.
      </p>
    </section>
  );
}
