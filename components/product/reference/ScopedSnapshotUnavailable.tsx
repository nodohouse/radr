"use client";

import { useProduct } from "@/lib/product/store";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { Heading, Panel, TextLink } from "./ReferenceUI";

export function ScopedSnapshotUnavailable({ locationId }: { locationId: string }) {
  const { setLocationScope } = useProduct();
  const venue = locationDisplayName(locationId);
  return <div className="rs-page" data-testid="scoped-snapshot-empty">
    <Heading eyebrow="Location evidence" title="The right evidence for this location."
      description="Every operating snapshot belongs to its own venue." />
    <Panel title="No detailed snapshot in this selection">
      <p className="rs-empty">This demo contains detailed operating evidence for {venue}. Your current selection has no matching snapshot. Its decision records remain available.</p>
      <div className="rs-snapshot-actions">
        <button type="button" className="rs-section-action" onClick={() => setLocationScope(locationId as LocationScope)}>View {venue} →</button>
        <TextLink href="/app/decisions">Explore selected decisions</TextLink>
      </div>
    </Panel>
  </div>;
}
