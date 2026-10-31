"use client";

import { Heading, TextLink } from "../../reference/ReferenceUI";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import type { CatalogEntry } from "@/components/product/connections/VendorLogo";
import {
  buildConnectionsOverview,
  getConnectionDetail,
  parseConnectionSystemId,
  parseConnectionsCategory,
  parseConnectionsStatus,
  type ConnectionsCategoryFilter,
  type ConnectionsStatusFilter,
  type SetupKind,
} from "@/lib/radr/product/connectionsProofEngine";
import { ConnectionsOverview } from "./ConnectionsOverview";
import { ConnectionsDrawer } from "./ConnectionsDrawer";
import { ConnectionsSetupModal } from "./ConnectionsSetupModal";
import "./connections-engine.css";

function setupKindFor(entry: CatalogEntry): SetupKind {
  if (entry.status === "AVAILABLE") return "setup";
  if (entry.status === "REQUEST_ACCESS") return "request";
  return "notify";
}

export function ConnectionsShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/connections";
  const search = useSearchParams();
  const { roleView } = useProduct();
  const { session, isHotel } = useDemoOrg();

  const vertical = isHotel ? "hotel" : session.vertical;
  const model = useMemo(
    () => buildConnectionsOverview(roleView, vertical),
    [roleView, vertical],
  );

  const category = parseConnectionsCategory(search.get("category"));
  const status = parseConnectionsStatus(search.get("status"));
  const selectedId = parseConnectionSystemId(search.get("system"), model.rows);
  const selectedDetail = selectedId
    ? getConnectionDetail(selectedId, model.rows)
    : null;

  const [query, setQuery] = useState(search.get("search") ?? "");
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [setupEntry, setSetupEntry] = useState<CatalogEntry | null>(null);

  const pushState = useCallback(
    (patch: {
      category?: ConnectionsCategoryFilter;
      status?: ConnectionsStatusFilter;
      system?: string | null;
      search?: string;
    }) => {
      const sp = new URLSearchParams(search.toString());
      if (patch.category !== undefined) {
        if (patch.category === "All") sp.delete("category");
        else sp.set("category", patch.category.toLowerCase());
      }
      if (patch.status !== undefined) {
        if (patch.status === "all") sp.delete("status");
        else sp.set("status", patch.status);
      }
      if (patch.system !== undefined) {
        if (!patch.system) sp.delete("system");
        else sp.set("system", patch.system);
      }
      if (patch.search !== undefined) {
        if (!patch.search.trim()) sp.delete("search");
        else sp.set("search", patch.search.trim());
      }
      const qs = sp.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search],
  );

  return (
    <div
      className="ce-root"
      data-connections-engine="true"
      data-drawer={selectedDetail ? "true" : undefined}
    >
      <Heading eyebrow="Connections" title="Your systems. One connected picture." description="Evidence coverage, source quality and connection setup in one place." aside={<TextLink href="/app/data-health">Review evidence health</TextLink>} />

      <ConnectionsOverview
        model={model}
        category={category}
        onCategory={(c) => pushState({ category: c })}
        status={status}
        onStatus={(s) => pushState({ status: s })}
        query={query}
        onQuery={(q) => {
          setQuery(q);
          pushState({ search: q });
        }}
        selectedId={selectedId}
        onSelect={(id) => pushState({ system: id })}
        showAllCatalog={showAllCatalog}
        onShowAllCatalog={setShowAllCatalog}
        onCatalogAction={(entry) => setSetupEntry(entry)}
        requestedIds={requestedIds}
      />

      {selectedDetail ? (
        <ConnectionsDrawer
          detail={selectedDetail}
          onClose={() => pushState({ system: null })}
        />
      ) : null}

      {setupEntry ? (
        <ConnectionsSetupModal
          entry={setupEntry}
          kind={setupKindFor(setupEntry)}
          onClose={() => setSetupEntry(null)}
          onConfirm={() => {
            setRequestedIds((cur) => new Set(cur).add(setupEntry.id));
            setSetupEntry(null);
          }}
        />
      ) : null}
    </div>
  );
}
